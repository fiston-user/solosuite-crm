'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { trpc } from '@/lib/trpc'
import { StatsCard } from './stats-card'
import { useEffect, useState } from 'react'

export function DashboardOverview() {
  const [mounted, setMounted] = useState(false)
  
  const { data: invoiceStats, isLoading: statsLoading } = trpc.invoice.getStats.useQuery(undefined, {
    enabled: mounted
  })
  const { data: clients, isLoading: clientsLoading } = trpc.client.getAll.useQuery(undefined, {
    enabled: mounted
  })
  const { data: projects, isLoading: projectsLoading } = trpc.project.getAll.useQuery(undefined, {
    enabled: mounted
  })
  const { data: recentInvoices, isLoading: invoicesLoading } = trpc.invoice.getAll.useQuery(undefined, {
    enabled: mounted
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading state
  if (statsLoading || clientsLoading || projectsLoading || invoicesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Safe calculations
  const safeProjects = projects || []
  const safeClients = clients || []
  const safeInvoices = recentInvoices || []
  const safeStats = invoiceStats || { total: 0, paid: 0, paidAmount: 0, totalAmount: 0, draft: 0, sent: 0, overdue: 0 }

  const activeProjects = safeProjects.filter((p) => p.status === 'active').length
  const totalClients = safeClients.length
  const recentInvoicesList = safeInvoices.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${(safeStats.paidAmount || 0).toFixed(2)}`}
          description="From paid invoices"
        />
        <StatsCard
          title="Active Projects"
          value={activeProjects}
          description={`${safeProjects.length} total projects`}
        />
        <StatsCard
          title="Total Clients"
          value={totalClients}
          description="Active client relationships"
        />
        <StatsCard
          title="Pending Amount"
          value={`$${((safeStats.totalAmount || 0) - (safeStats.paidAmount || 0)).toFixed(2)}`}
          description="Outstanding invoices"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
            <CardDescription>Overview of your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Invoices:</span>
                <span className="font-medium">{safeStats.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Draft:</span>
                <span className="font-medium">{safeStats.draft || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Sent:</span>
                <span className="font-medium">{safeStats.sent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Paid:</span>
                <span className="font-medium text-green-600">{safeStats.paid || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Overdue:</span>
                <span className="font-medium text-red-600">{safeStats.overdue || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Your latest invoice activity</CardDescription>
          </CardHeader>
          <CardContent>
            {!recentInvoicesList.length ? (
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoicesList.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>{invoice.client?.name || 'Unknown'}</TableCell>
                      <TableCell>${invoice.amount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : invoice.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status || 'draft'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}