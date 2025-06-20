'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc'
import { TimeEntryForm } from './time-entry-form'
import { InvoiceFromTime } from './invoice-from-time'
import { formatDistance } from 'date-fns'
import { Clock, Edit, Plus, Trash2, Receipt } from 'lucide-react'

export function TimeEntriesList() {
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<string | undefined>()
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)

  const { data: timeEntries, refetch } = trpc.timeEntry.getAll.useQuery()
  const deleteEntry = trpc.timeEntry.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      deleteEntry.mutate({ id })
    }
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingEntry(undefined)
    setShowInvoiceForm(false)
    refetch()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const totalHours = timeEntries?.reduce((sum, entry) => sum + entry.hours, 0) || 0
  const totalValue = timeEntries?.reduce((sum, entry) => {
    const rate = entry.project.rate || 0
    return sum + (entry.hours * rate)
  }, 0) || 0

  if (showForm || editingEntry) {
    return (
      <TimeEntryForm
        entryId={editingEntry}
        onSuccess={handleSuccess}
        onCancel={() => {
          setShowForm(false)
          setEditingEntry(undefined)
        }}
      />
    )
  }

  if (showInvoiceForm) {
    return (
      <InvoiceFromTime
        onSuccess={handleSuccess}
        onCancel={() => setShowInvoiceForm(false)}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Time Entries</h2>
          <p className="text-muted-foreground">Track and manage your logged time</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
          <Button variant="outline" onClick={() => setShowInvoiceForm(true)}>
            <Receipt className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              <div>
                <p className="text-2xl font-bold">{formatHours(totalHours)}</p>
                <p className="text-xs text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-green-500 rounded mr-2" />
              <div>
                <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-blue-500 rounded mr-2" />
              <div>
                <p className="text-2xl font-bold">{timeEntries?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
          <CardDescription>
            {timeEntries?.length || 0} entries logged
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!timeEntries?.length ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No time entries yet</p>
              <Button onClick={() => setShowForm(true)}>
                Log Your First Entry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatDate(entry.date)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistance(new Date(entry.date), new Date(), { addSuffix: true })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{entry.project.name}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.project.client.name}</div>
                        {entry.project.client.company && (
                          <div className="text-sm text-muted-foreground">
                            {entry.project.client.company}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {entry.description || (
                          <span className="text-muted-foreground italic">No description</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatHours(entry.hours)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${((entry.project.rate || 0) * entry.hours).toFixed(2)}
                      </div>
                      {entry.project.rate && (
                        <div className="text-xs text-muted-foreground">
                          @ ${entry.project.rate}/hr
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingEntry(entry.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleteEntry.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
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