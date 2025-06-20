import { createTRPCRouter } from '../trpc'
import { clientRouter } from './client'
import { projectRouter } from './project'
import { invoiceRouter } from './invoice'
import { timeEntryRouter } from './timeEntry'
import { expenseRouter } from './expense'

export const appRouter = createTRPCRouter({
  client: clientRouter,
  project: projectRouter,
  invoice: invoiceRouter,
  timeEntry: timeEntryRouter,
  expense: expenseRouter,
})

export type AppRouter = typeof appRouter