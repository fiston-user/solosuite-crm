'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/lib/trpc'

interface ProjectFormProps {
  projectId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProjectForm({ projectId, onSuccess, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'completed' | 'on-hold',
    rate: '',
    clientId: '',
  })

  const { data: project } = trpc.project.getById.useQuery(
    { id: projectId! },
    { enabled: !!projectId }
  )

  const { data: clients } = trpc.client.getAll.useQuery()

  const createProject = trpc.project.create.useMutation({
    onSuccess: () => {
      onSuccess?.()
      setFormData({ name: '', description: '', status: 'active', rate: '', clientId: '' })
    },
  })

  const updateProject = trpc.project.update.useMutation({
    onSuccess: () => {
      onSuccess?.()
    },
  })

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status as 'active' | 'completed' | 'on-hold',
        rate: project.rate?.toString() || '',
        clientId: project.clientId,
      })
    }
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      rate: formData.rate ? parseFloat(formData.rate) : undefined,
    }
    
    if (projectId) {
      updateProject.mutate({ id: projectId, ...submitData })
    } else {
      createProject.mutate(submitData)
    }
  }

  const isLoading = createProject.isPending || updateProject.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>{projectId ? 'Edit Project' : 'Add New Project'}</CardTitle>
        <CardDescription>
          {projectId ? 'Update project information' : 'Create a new project'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client: any) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.company || client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'completed' | 'on-hold') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Hourly Rate ($)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : projectId ? 'Update Project' : 'Create Project'}
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