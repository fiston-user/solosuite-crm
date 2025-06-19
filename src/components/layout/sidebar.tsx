'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Clients', href: '/dashboard/clients', icon: '👥' },
  { name: 'Projects', href: '/dashboard/projects', icon: '📁' },
  { name: 'Invoices', href: '/dashboard/invoices', icon: '📄' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      <div className="flex items-center h-16 px-6 border-b">
        <h1 className="text-xl font-bold">SoloSuite</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              pathname === item.href
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}