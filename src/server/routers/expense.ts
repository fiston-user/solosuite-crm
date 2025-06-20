import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const expenseCreateSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  date: z.date().default(() => new Date()),
  receipt: z.string().optional(),
  isReimbursable: z.boolean().default(false),
  isBillable: z.boolean().default(false),
  projectId: z.string().optional(),
})

const expenseUpdateSchema = expenseCreateSchema.partial().extend({
  id: z.string(),
})

export const expenseRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.expense.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })
  }),

  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.expense.findMany({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      })
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.expense.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
      })
    }),

  create: protectedProcedure
    .input(expenseCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.expense.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
      })
    }),

  update: protectedProcedure
    .input(expenseUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.expense.update({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.expense.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })
    }),

  getExpenseSummary: protectedProcedure.query(async ({ ctx }) => {
    const expenses = await ctx.db.expense.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    })

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const reimbursable = expenses
      .filter(expense => expense.isReimbursable)
      .reduce((sum, expense) => sum + expense.amount, 0)
    const billable = expenses
      .filter(expense => expense.isBillable)
      .reduce((sum, expense) => sum + expense.amount, 0)
    const businessExpenses = expenses
      .filter(expense => !expense.isReimbursable)
      .reduce((sum, expense) => sum + expense.amount, 0)

    const byCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      reimbursable,
      billable,
      businessExpenses,
      count: expenses.length,
      byCategory,
    }
  }),

  getExpensesByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const expenses = await ctx.db.expense.findMany({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
        orderBy: {
          date: 'desc',
        },
      })

      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
      const billable = expenses
        .filter(expense => expense.isBillable)
        .reduce((sum, expense) => sum + expense.amount, 0)

      return {
        expenses,
        total,
        billable,
      }
    }),

  getBillableExpensesByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const expenses = await ctx.db.expense.findMany({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
          isBillable: true,
        },
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      })

      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

      return {
        expenses,
        total,
        project: expenses[0]?.project,
      }
    }),
})