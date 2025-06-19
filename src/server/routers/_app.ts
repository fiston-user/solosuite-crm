import { createTRPCRouter } from '../trpc'
import { clientRouter } from './client'
import { projectRouter } from './project'
import { invoiceRouter } from './invoice'

export const appRouter = createTRPCRouter({
  client: clientRouter,
  project: projectRouter,
  invoice: invoiceRouter,
})

export type AppRouter = typeof appRouter