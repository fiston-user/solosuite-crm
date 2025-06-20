'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc'
import { ExpenseForm } from './expense-form'
import { InvoiceFromExpenses } from './invoice-from-expenses'
import { formatDistance } from 'date-fns'
import { DollarSign, Edit, Plus, Trash2, Receipt, TrendingUp, TrendingDown, FileText } from 'lucide-react'

export function ExpenseList() {
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<string | undefined>()
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)

  const { data: expenses, refetch } = trpc.expense.getAll.useQuery()
  const { data: expenseSummary } = trpc.expense.getExpenseSummary.useQuery()
  const deleteExpense = trpc.expense.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense.mutate({ id })
    }
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingExpense(undefined)
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Travel': 'bg-blue-100 text-blue-800',
      'Software': 'bg-purple-100 text-purple-800',
      'Hardware': 'bg-gray-100 text-gray-800',
      'Materials': 'bg-green-100 text-green-800',
      'Meals': 'bg-orange-100 text-orange-800',
      'Office Supplies': 'bg-yellow-100 text-yellow-800',
      'Professional Services': 'bg-indigo-100 text-indigo-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Training': 'bg-cyan-100 text-cyan-800',
      'Other': 'bg-slate-100 text-slate-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (showForm || editingExpense) {
    return (
      <ExpenseForm
        expenseId={editingExpense}
        onSuccess={handleSuccess}
        onCancel={() => {
          setShowForm(false)
          setEditingExpense(undefined)
        }}
      />
    )
  }

  if (showInvoiceForm) {
    return (
      <InvoiceFromExpenses
        onSuccess={handleSuccess}
        onCancel={() => setShowInvoiceForm(false)}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Expense Tracking</h2>
          <p className="text-muted-foreground">Track and manage your business expenses</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          <Button variant="outline" onClick={() => setShowInvoiceForm(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Invoice Expenses
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {expenseSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                <div>
                  <p className="text-2xl font-bold">${expenseSummary.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Total Expenses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">${expenseSummary.reimbursable.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Reimbursable</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Receipt className="h-4 w-4 text-blue-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">${expenseSummary.billable.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Billable</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">${expenseSummary.businessExpenses.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Business Expenses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            {expenses?.length || 0} expenses logged
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!expenses?.length ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No expenses recorded yet</p>
              <Button onClick={() => setShowForm(true)}>
                Record Your First Expense
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatDate(expense.date)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistance(new Date(expense.date), new Date(), { addSuffix: true })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{expense.description}</div>
                        {expense.receipt && (
                          <a 
                            href={expense.receipt} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center mt-1"
                          >
                            <Receipt className="h-3 w-3 mr-1" />
                            Receipt
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {expense.project ? (
                        <div>
                          <div className="font-medium">{expense.project.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {expense.project.client.name}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">No project</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${expense.amount.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {expense.isReimbursable && (
                          <Badge variant="outline" className="text-xs">
                            Reimbursable
                          </Badge>
                        )}
                        {expense.isBillable && (
                          <Badge variant="outline" className="text-xs">
                            Billable
                          </Badge>
                        )}
                        {!expense.isReimbursable && !expense.isBillable && (
                          <Badge variant="secondary" className="text-xs">
                            Business
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingExpense(expense.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        disabled={deleteExpense.isPending}
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