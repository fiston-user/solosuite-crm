'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { trpc } from '@/lib/trpc'
import { ProjectForm } from './project-form'

const statusColors = {
  active: 'bg-green-100 text-green-800',
  'on-hold': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
}

export function ProjectList() {
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<string | undefined>()

  const { data: projects, refetch } = trpc.project.getAll.useQuery()
  const deleteProject = trpc.project.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject.mutate({ id })
    }
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingProject(undefined)
    refetch()
  }

  if (showForm || editingProject) {
    return (
      <ProjectForm
        projectId={editingProject}
        onSuccess={handleSuccess}
        onCancel={() => {
          setShowForm(false)
          setEditingProject(undefined)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-muted-foreground">Manage your client projects</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          Add Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>
            {projects?.length || 0} project(s) total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!projects?.length ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No projects yet</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Create Your First Project
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-muted-foreground">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.client.company || project.client.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[project.status as keyof typeof statusColors]}`}>
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {project.rate ? `$${project.rate}/hr` : '-'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProject(project.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(project.id)}
                        disabled={deleteProject.isPending}
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