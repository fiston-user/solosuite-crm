'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/lib/trpc'
import { InvoiceForm } from './invoice-form'
import { format } from 'date-fns'

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
}

export function InvoiceList() {
  const [showForm, setShowForm] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<string | undefined>()

  const { data: invoices, refetch } = trpc.invoice.getAll.useQuery()
  const deleteInvoice = trpc.invoice.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const updateStatus = trpc.invoice.updateStatus.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice.mutate({ id })
    }
  }

  const handleStatusChange = (invoiceId: string, status: 'draft' | 'sent' | 'paid' | 'overdue') => {
    updateStatus.mutate({ id: invoiceId, status })
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingInvoice(undefined)
    refetch()
  }

  if (showForm || editingInvoice) {
    return (
      <InvoiceForm
        invoiceId={editingInvoice}
        onSuccess={handleSuccess}
        onCancel={() => {
          setShowForm(false)
          setEditingInvoice(undefined)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Invoices</h2>
          <p className="text-muted-foreground">Manage your invoices and payments</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          Create Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Invoices</CardTitle>
          <CardDescription>
            {invoices?.length || 0} invoice(s) total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!invoices?.length ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No invoices yet</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Create Your First Invoice
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.client.name}</div>
                        {invoice.project && (
                          <div className="text-sm text-muted-foreground">
                            {invoice.project.name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={invoice.status}
                        onValueChange={(value: 'draft' | 'sent' | 'paid' | 'overdue') =>
                          handleStatusChange(invoice.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[invoice.status as keyof typeof statusColors]}`}>
                              {invoice.status}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingInvoice(invoice.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
                        disabled={deleteInvoice.isPending}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}