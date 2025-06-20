'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trpc } from '@/lib/trpc'
import { Play, Square, Clock } from 'lucide-react'

export function Timer() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [elapsedTime, setElapsedTime] = useState(0)

  const { data: projects } = trpc.project.getAll.useQuery()
  const { data: runningTimer, refetch: refetchRunningTimer } = trpc.timeEntry.getRunningTimer.useQuery()
  
  const startTimer = trpc.timeEntry.startTimer.useMutation({
    onSuccess: () => {
      refetchRunningTimer()
      setDescription('')
    },
  })

  const stopTimer = trpc.timeEntry.stopTimer.useMutation({
    onSuccess: () => {
      refetchRunningTimer()
      setElapsedTime(0)
    },
  })

  // Update elapsed time every second when there's a running timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (runningTimer?.startTime) {
      interval = setInterval(() => {
        const now = new Date()
        const start = new Date(runningTimer.startTime!)
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    } else {
      setElapsedTime(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [runningTimer])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if (!selectedProjectId) return

    startTimer.mutate({
      projectId: selectedProjectId,
      description: description.trim() || undefined,
    })
  }

  const handleStop = () => {
    if (!runningTimer) return

    stopTimer.mutate({ id: runningTimer.id })
  }

  const currentProject = runningTimer ? 
    projects?.find(p => p.id === runningTimer.projectId) : 
    projects?.find(p => p.id === selectedProjectId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracker
        </CardTitle>
        <CardDescription>
          {runningTimer ? 'Timer is running' : 'Start tracking time on a project'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        {runningTimer && (
          <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="text-4xl font-mono font-bold text-green-700 mb-2">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-green-600">
              {runningTimer.project.name} • {runningTimer.project.client.name}
            </div>
            {runningTimer.description && (
              <div className="text-sm text-gray-600 mt-1">
                {runningTimer.description}
              </div>
            )}
          </div>
        )}

        {/* Project Selection */}
        {!runningTimer && (
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
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
        )}

        {/* Description Input */}
        {!runningTimer && (
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {runningTimer ? (
            <Button
              onClick={handleStop}
              disabled={stopTimer.isPending}
              className="flex-1"
              variant="destructive"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Timer
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={!selectedProjectId || startTimer.isPending}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
          )}
        </div>

        {/* Current Project Info */}
        {currentProject && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <strong>Client:</strong> {currentProject.client.name}
            {currentProject.rate && (
              <>
                <br />
                <strong>Rate:</strong> ${currentProject.rate}/hr
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}