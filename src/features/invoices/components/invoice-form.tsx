'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/lib/trpc'

interface InvoiceFormProps {
  invoiceId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function InvoiceForm({ invoiceId, onSuccess, onCancel }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    description: '',
    clientId: '',
    projectId: '',
  })

  const { data: invoice } = trpc.invoice.getById.useQuery(
    { id: invoiceId! },
    { enabled: !!invoiceId }
  )

  const { data: clients } = trpc.client.getAll.useQuery()
  const { data: projects } = trpc.project.getAll.useQuery()

  const createInvoice = trpc.invoice.create.useMutation({
    onSuccess: () => {
      onSuccess?.()
      setFormData({ amount: '', dueDate: '', description: '', clientId: '', projectId: '' })
    },
  })

  const updateInvoice = trpc.invoice.update.useMutation({
    onSuccess: () => {
      onSuccess?.()
    },
  })

  useEffect(() => {
    if (invoice) {
      setFormData({
        amount: invoice.amount.toString(),
        dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
        description: invoice.description || '',
        clientId: invoice.clientId,
        projectId: invoice.projectId || '',
      })
    }
  }, [invoice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      dueDate: new Date(formData.dueDate),
      projectId: formData.projectId || undefined,
    }
    
    if (invoiceId) {
      updateInvoice.mutate({ id: invoiceId, ...submitData })
    } else {
      createInvoice.mutate(submitData)
    }
  }

  const filteredProjects = projects?.filter(project => project.clientId === formData.clientId)

  const isLoading = createInvoice.isPending || updateInvoice.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>{invoiceId ? 'Edit Invoice' : 'Create New Invoice'}</CardTitle>
        <CardDescription>
          {invoiceId ? 'Update invoice information' : 'Create a new invoice'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value, projectId: '' })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.company || client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                disabled={!formData.clientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProjects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of work or services"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : invoiceId ? 'Update Invoice' : 'Create Invoice'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}