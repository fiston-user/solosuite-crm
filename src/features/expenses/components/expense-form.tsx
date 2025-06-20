'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { trpc } from '@/lib/trpc'
import { format } from 'date-fns'

interface ExpenseFormProps {
  expenseId?: string
  onSuccess: () => void
  onCancel: () => void
}

const expenseCategories = [
  'Travel',
  'Software',
  'Hardware',
  'Materials',
  'Meals',
  'Office Supplies',
  'Professional Services',
  'Marketing',
  'Training',
  'Other',
]

export function ExpenseForm({ expenseId, onSuccess, onCancel }: ExpenseFormProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [projectId, setProjectId] = useState('')
  const [isReimbursable, setIsReimbursable] = useState(false)
  const [isBillable, setIsBillable] = useState(false)
  const [receipt, setReceipt] = useState('')

  const { data: projects } = trpc.project.getAll.useQuery()
  const { data: existingExpenses } = trpc.expense.getAll.useQuery()
  
  const createExpense = trpc.expense.create.useMutation({
    onSuccess,
  })

  const updateExpense = trpc.expense.update.useMutation({
    onSuccess,
  })

  // Get the specific expense being edited
  const expenseToEdit = expenseId 
    ? existingExpenses?.find(expense => expense.id === expenseId)
    : null

  // Initialize form with existing data
  useEffect(() => {
    if (expenseToEdit) {
      setDescription(expenseToEdit.description)
      setAmount(expenseToEdit.amount.toString())
      setCategory(expenseToEdit.category)
      setDate(format(new Date(expenseToEdit.date), 'yyyy-MM-dd'))
      setProjectId(expenseToEdit.projectId || 'none')
      setIsReimbursable(expenseToEdit.isReimbursable)
      setIsBillable(expenseToEdit.isBillable)
      setReceipt(expenseToEdit.receipt || '')
    } else {
      // Set defaults for new expenses
      setDate(format(new Date(), 'yyyy-MM-dd'))
      setProjectId('none')
    }
  }, [expenseToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (!category) {
      alert('Please select a category')
      return
    }

    const data = {
      description: description.trim(),
      amount: amountNum,
      category,
      date: new Date(date),
      projectId: projectId && projectId !== 'none' ? projectId : undefined,
      isReimbursable,
      isBillable,
      receipt: receipt.trim() || undefined,
    }

    if (expenseId) {
      updateExpense.mutate({ id: expenseId, ...data })
    } else {
      createExpense.mutate(data)
    }
  }

  const selectedProject = projectId && projectId !== 'none' ? projects?.find(p => p.id === projectId) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {expenseId ? 'Edit Expense' : 'Add Expense'}
        </CardTitle>
        <CardDescription>
          {expenseId ? 'Update your expense details' : 'Record a new business expense'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What was this expense for?"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} - {project.client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt URL (Optional)</Label>
            <Input
              id="receipt"
              type="url"
              placeholder="https://example.com/receipt.pdf"
              value={receipt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceipt(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="reimbursable" 
                checked={isReimbursable}
                onCheckedChange={(checked: boolean) => setIsReimbursable(checked)}
              />
              <Label htmlFor="reimbursable" className="text-sm">
                This is a reimbursable expense
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="billable" 
                checked={isBillable}
                onCheckedChange={(checked: boolean) => setIsBillable(checked)}
              />
              <Label htmlFor="billable" className="text-sm">
                This expense can be billed to the client
              </Label>
            </div>
          </div>

          {selectedProject && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Project Details</h4>
              <div className="text-sm text-gray-600">
                <p><strong>Client:</strong> {selectedProject.client.name}</p>
                {selectedProject.client.company && (
                  <p><strong>Company:</strong> {selectedProject.client.company}</p>
                )}
                {selectedProject.rate && (
                  <p><strong>Rate:</strong> ${selectedProject.rate}/hr</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={createExpense.isPending || updateExpense.isPending}
              className="flex-1"
            >
              {expenseId ? 'Update Expense' : 'Save Expense'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}