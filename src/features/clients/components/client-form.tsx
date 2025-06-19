'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/lib/trpc'

interface ClientFormProps {
  clientId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ClientForm({ clientId, onSuccess, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
  })

  const { data: client } = trpc.client.getById.useQuery(
    { id: clientId! },
    { enabled: !!clientId }
  )

  const createClient = trpc.client.create.useMutation({
    onSuccess: () => {
      onSuccess?.()
      setFormData({ name: '', email: '', company: '', phone: '', address: '' })
    },
  })

  const updateClient = trpc.client.update.useMutation({
    onSuccess: () => {
      onSuccess?.()
    },
  })

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        company: client.company || '',
        phone: client.phone || '',
        address: client.address || '',
      })
    }
  }, [client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (clientId) {
      updateClient.mutate({ id: clientId, ...formData })
    } else {
      createClient.mutate(formData)
    }
  }

  const isLoading = createClient.isPending || updateClient.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>{clientId ? 'Edit Client' : 'Add New Client'}</CardTitle>
        <CardDescription>
          {clientId ? 'Update client information' : 'Create a new client'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : clientId ? 'Update Client' : 'Create Client'}
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