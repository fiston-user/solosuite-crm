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

interface InvoiceFromExpensesProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function InvoiceFromExpenses({ onSuccess, onCancel }: InvoiceFromExpensesProps) {
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [dueDate, setDueDate] = useState(
    format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') // 30 days from now
  )

  const { data: projects } = trpc.project.getAll.useQuery()
  const { data: billableExpenses } = trpc.expense.getBillableExpensesByProject.useQuery(
    { projectId: selectedProjectId },
    { enabled: !!selectedProjectId }
  )

  const createInvoice = trpc.invoice.create.useMutation({
    onSuccess: () => {
      onSuccess?.()
    },
  })

  const handleCreateInvoice = () => {
    if (!billableExpenses?.project || !billableExpenses.total) {
      alert('No billable expenses found for this project')
      return
    }

    const description = `Expense reimbursement for ${billableExpenses.project.name}\n` +
      `Billable Expenses: ${billableExpenses.expenses.length} items\n` +
      `${billableExpenses.expenses.map(exp => `- ${exp.description}: $${exp.amount.toFixed(2)}`).join('\n')}`

    createInvoice.mutate({
      clientId: billableExpenses.project.clientId,
      projectId: billableExpenses.project.id,
      amount: billableExpenses.total,
      dueDate: new Date(dueDate),
      description,
    })
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Create Invoice from Expenses
        </CardTitle>
        <CardDescription>
          Generate an invoice for billable expenses on a project
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

        {billableExpenses && selectedProjectId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Invoice Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Client:</span>
                <span className="font-medium">{billableExpenses.project?.client.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Project:</span>
                <span className="font-medium">{billableExpenses.project?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Billable Expenses:</span>
                <span className="font-medium">{billableExpenses.expenses.length} items</span>
              </div>
              
              {billableExpenses.expenses.length > 0 && (
                <div className="mt-3">
                  <p className="text-blue-700 font-medium mb-2">Expense Details:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto bg-white rounded p-2">
                    {billableExpenses.expenses.slice(0, 5).map((expense) => (
                      <div key={expense.id} className="flex justify-between text-xs">
                        <span className="truncate mr-2">{expense.description}</span>
                        <span className="font-medium">${expense.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    {billableExpenses.expenses.length > 5 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        ... and {billableExpenses.expenses.length - 5} more items
                      </div>
                    )}
                  </div>
                </div>
              )}

              <hr className="border-blue-200" />
              <div className="flex justify-between text-lg font-bold text-blue-900">
                <span>Total Amount:</span>
                <span>${billableExpenses.total.toFixed(2)}</span>
              </div>
            </div>

            {billableExpenses.expenses.length === 0 && (
              <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                No billable expenses found for this project.
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleCreateInvoice}
            disabled={
              !selectedProjectId || 
              !billableExpenses?.total ||
              billableExpenses?.expenses.length === 0 ||
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