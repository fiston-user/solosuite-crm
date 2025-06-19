import { initTRPC, TRPCError } from '@trpc/server'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth'
import { db } from '@/lib/db'
import superjson from 'superjson'
import { ZodError } from 'zod'
import type { Session } from 'next-auth'

interface CreateContextOptions {
  session: Session | null
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  }
}

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  try {
    const session = await getServerSession(authOptions)
    
    return createInnerTRPCContext({
      session,
    })
  } catch (error) {
    console.error('Error creating tRPC context:', error)
    return createInnerTRPCContext({
      session: null,
    })
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      session: ctx.session,
      db: ctx.db,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)