'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Timer } from '@/features/time-tracking/components/timer'
import { TimeEntriesList } from '@/features/time-tracking/components/time-entries-list'

export default function TimeTrackingPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <p className="text-muted-foreground">
            Track time spent on projects and manage your time entries
          </p>
        </div>

        <Tabs defaultValue="timer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="entries">Time Entries</TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-6">
            <Timer />
          </TabsContent>

          <TabsContent value="entries" className="space-y-6">
            <TimeEntriesList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}