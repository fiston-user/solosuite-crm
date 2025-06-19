import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { db } from '@/lib/db'

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name } = await req.json()

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { name },
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}