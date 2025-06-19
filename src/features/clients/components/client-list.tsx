'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { trpc } from '@/lib/trpc'
import { ClientForm } from './client-form'

export function ClientList() {
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<string | undefined>()

  const { data: clients, refetch } = trpc.client.getAll.useQuery()
  const deleteClient = trpc.client.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClient.mutate({ id })
    }
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingClient(undefined)
    refetch()
  }

  if (showForm || editingClient) {
    return (
      <ClientForm
        clientId={editingClient}
        onSuccess={handleSuccess}
        onCancel={() => {
          setShowForm(false)
          setEditingClient(undefined)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Clients</h2>
          <p className="text-muted-foreground">Manage your client relationships</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Clients</CardTitle>
          <CardDescription>
            {clients?.length || 0} client(s) total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!clients?.length ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No clients yet</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Add Your First Client
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.company || '-'}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingClient(client.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(client.id)}
                        disabled={deleteClient.isPending}
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