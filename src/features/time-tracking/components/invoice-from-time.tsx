'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc'
import { format } from 'date-fns'
import { Receipt, FileText } from 'lucide-react'

interface InvoiceFromTimeProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function InvoiceFromTime({ onSuccess, onCancel }: InvoiceFromTimeProps) {
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [dueDate, setDueDate] = useState(
    format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') // 30 days from now
  )

  const { data: projects } = trpc.project.getAll.useQuery()
  const { data: unbilledTime } = trpc.timeEntry.getUnbilledTimeByProject.useQuery(
    { projectId: selectedProjectId },
    { enabled: !!selectedProjectId }
  )

  const createInvoice = trpc.invoice.create.useMutation({
    onSuccess: () => {
      onSuccess?.()
    },
  })

  const handleCreateInvoice = () => {
    if (!unbilledTime?.project || !unbilledTime.totalAmount) {
      alert('No time entries or project rate found')
      return
    }

    const description = `Time tracking invoice for ${unbilledTime.project.name}\n` +
      `Total Hours: ${unbilledTime.totalHours.toFixed(2)}\n` +
      `Rate: $${unbilledTime.project.rate}/hr\n` +
      `Period: ${unbilledTime.timeEntries.length} time entries`

    createInvoice.mutate({
      clientId: unbilledTime.project.clientId,
      projectId: unbilledTime.project.id,
      amount: unbilledTime.totalAmount,
      dueDate: new Date(dueDate),
      description,
    })
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Create Invoice from Time Entries
        </CardTitle>
        <CardDescription>
          Generate an invoice based on logged time entries for a project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project">Select Project</Label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a project to invoice" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} - {project.client.name}
                  {project.rate && ` ($${project.rate}/hr)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
          />
        </div>

        {unbilledTime && selectedProjectId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Invoice Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Client:</span>
                <span className="font-medium">{unbilledTime.project?.client.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Project:</span>
                <span className="font-medium">{unbilledTime.project?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Total Hours:</span>
                <span className="font-medium">{formatHours(unbilledTime.totalHours)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Hourly Rate:</span>
                <span className="font-medium">${unbilledTime.project?.rate || 0}/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Time Entries:</span>
                <span className="font-medium">{unbilledTime.timeEntries.length} entries</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between text-lg font-bold text-blue-900">
                <span>Total Amount:</span>
                <span>${unbilledTime.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {!unbilledTime.project?.rate && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                ⚠️ This project doesn&apos;t have an hourly rate set. Please set a rate for the project first.
              </div>
            )}

            {unbilledTime.timeEntries.length === 0 && (
              <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                No time entries found for this project.
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleCreateInvoice}
            disabled={
              !selectedProjectId || 
              !unbilledTime?.totalAmount || 
              !unbilledTime?.project?.rate ||
              createInvoice.isPending
            }
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}