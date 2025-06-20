import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const projectCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'on-hold']).default('active'),
  rate: z.number().optional(),
  clientId: z.string(),
})

const projectUpdateSchema = projectCreateSchema.partial().extend({
  id: z.string(),
})

export const projectRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.project.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          client: true,
          invoices: true,
        },
      })
    }),

  create: protectedProcedure
    .input(projectCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      })
    }),

  update: protectedProcedure
    .input(projectUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.project.update({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })
    }),

  getProfitability: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get project details
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          client: true,
        },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      // Get time entries for revenue calculation
      const timeEntries = await ctx.db.timeEntry.findMany({
        where: {
          projectId: input.id,
          userId: ctx.session.user.id,
        },
      })

      // Get expenses
      const expenses = await ctx.db.expense.findMany({
        where: {
          projectId: input.id,
          userId: ctx.session.user.id,
        },
      })

      // Calculate metrics
      const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0)
      const timeRevenue = project.rate ? totalHours * project.rate : 0
      
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
      const businessExpenses = expenses
        .filter(expense => !expense.isReimbursable)
        .reduce((sum, expense) => sum + expense.amount, 0)
      const reimbursableExpenses = expenses
        .filter(expense => expense.isReimbursable)
        .reduce((sum, expense) => sum + expense.amount, 0)
      const billableExpenses = expenses
        .filter(expense => expense.isBillable)
        .reduce((sum, expense) => sum + expense.amount, 0)

      // Calculate profit
      const totalRevenue = timeRevenue + billableExpenses
      const totalCosts = businessExpenses
      const profit = totalRevenue - totalCosts
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

      return {
        project,
        timeMetrics: {
          totalHours,
          timeRevenue,
          hourlyRate: project.rate || 0,
        },
        expenseMetrics: {
          totalExpenses,
          businessExpenses,
          reimbursableExpenses,
          billableExpenses,
        },
        profitability: {
          totalRevenue,
          totalCosts,
          profit,
          profitMargin,
        },
      }
    }),
})