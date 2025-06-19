'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { trpc } from '@/lib/trpc'
import { StatsCard } from './stats-card'

export function DashboardOverview() {
  const { data: invoiceStats, isLoading: statsLoading, error: statsError } = trpc.invoice.getStats.useQuery()
  const { data: clients, isLoading: clientsLoading, error: clientsError } = trpc.client.getAll.useQuery()
  const { data: projects, isLoading: projectsLoading, error: projectsError } = trpc.project.getAll.useQuery()
  const { data: recentInvoices, isLoading: invoicesLoading, error: invoicesError } = trpc.invoice.getAll.useQuery()

  // Debug logging
  console.log('Dashboard data:', { projects, clients, invoiceStats, recentInvoices })
  console.log('Loading states:', { statsLoading, clientsLoading, projectsLoading, invoicesLoading })
  console.log('Errors:', { statsError, clientsError, projectsError, invoicesError })

  // Safe calculations with proper type checking
  let activeProjects = 0
  let totalClients = 0
  let recentInvoicesList: any[] = []

  try {
    activeProjects = Array.isArray(projects) ? projects.filter(p => p.status === 'active').length : 0
    totalClients = Array.isArray(clients) ? clients.length : 0
    recentInvoicesList = Array.isArray(recentInvoices) ? recentInvoices.slice(0, 5) : []
  } catch (error) {
    console.error('Error processing dashboard data:', error)
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

  // Show error state
  if (statsError || clientsError || projectsError || invoicesError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-red-600">Error loading dashboard data. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

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
          value={`$${(invoiceStats?.paidAmount || 0).toFixed(2)}`}
          description="From paid invoices"
        />
        <StatsCard
          title="Active Projects"
          value={activeProjects}
          description={`${projects?.length || 0} total projects`}
        />
        <StatsCard
          title="Total Clients"
          value={totalClients}
          description="Active client relationships"
        />
        <StatsCard
          title="Pending Amount"
          value={`$${((invoiceStats?.totalAmount || 0) - (invoiceStats?.paidAmount || 0)).toFixed(2)}`}
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
                <span className="font-medium">{invoiceStats?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Draft:</span>
                <span className="font-medium">{invoiceStats?.draft || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Sent:</span>
                <span className="font-medium">{invoiceStats?.sent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Paid:</span>
                <span className="font-medium text-green-600">{invoiceStats?.paid || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Overdue:</span>
                <span className="font-medium text-red-600">{invoiceStats?.overdue || 0}</span>
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
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
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
                          {invoice.status}
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