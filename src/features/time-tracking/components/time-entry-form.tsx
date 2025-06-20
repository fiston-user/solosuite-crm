'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/lib/trpc'
import { format } from 'date-fns'

interface TimeEntryFormProps {
  entryId?: string
  onSuccess: () => void
  onCancel: () => void
}

export function TimeEntryForm({ entryId, onSuccess, onCancel }: TimeEntryFormProps) {
  const [projectId, setProjectId] = useState('')
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState('')
  const [date, setDate] = useState('')

  const { data: projects } = trpc.project.getAll.useQuery()
  const { data: existingEntry } = trpc.timeEntry.getAll.useQuery()
  
  const createEntry = trpc.timeEntry.create.useMutation({
    onSuccess,
  })

  const updateEntry = trpc.timeEntry.update.useMutation({
    onSuccess,
  })

  // Get the specific entry being edited
  const entryToEdit = entryId 
    ? existingEntry?.find(entry => entry.id === entryId)
    : null

  // Initialize form with existing data
  useEffect(() => {
    if (entryToEdit) {
      setProjectId(entryToEdit.projectId)
      setDescription(entryToEdit.description || '')
      setHours(entryToEdit.hours.toString())
      setDate(format(new Date(entryToEdit.date), 'yyyy-MM-dd'))
    } else {
      // Set today's date as default for new entries
      setDate(format(new Date(), 'yyyy-MM-dd'))
    }
  }, [entryToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const hoursNum = parseFloat(hours)
    if (isNaN(hoursNum) || hoursNum <= 0) {
      alert('Please enter valid hours')
      return
    }

    if (!projectId) {
      alert('Please select a project')
      return
    }

    const data = {
      projectId,
      description: description.trim() || undefined,
      hours: hoursNum,
      date: new Date(date),
    }

    if (entryId) {
      updateEntry.mutate({ id: entryId, ...data })
    } else {
      createEntry.mutate(data)
    }
  }

  const selectedProject = projects?.find(p => p.id === projectId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {entryId ? 'Edit Time Entry' : 'Add Time Entry'}
        </CardTitle>
        <CardDescription>
          {entryId ? 'Update your time entry details' : 'Log time spent on a project'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
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
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Hours</Label>
            <Input
              id="hours"
              type="number"
              step="0.25"
              min="0.01"
              placeholder="2.5"
              value={hours}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHours(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter hours in decimal format (e.g., 2.5 for 2 hours 30 minutes)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What did you work on?"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              rows={3}
            />
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
                {selectedProject.rate && hours && (
                  <p><strong>Value:</strong> ${(selectedProject.rate * parseFloat(hours || '0')).toFixed(2)}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={createEntry.isPending || updateEntry.isPending}
              className="flex-1"
            >
              {entryId ? 'Update Entry' : 'Save Entry'}
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