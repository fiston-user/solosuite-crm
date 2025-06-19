import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import type { InvoiceWithStatus } from '@/types/database'

const invoiceCreateSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.date(),
  description: z.string().optional(),
  clientId: z.string(),
  projectId: z.string().optional(),
})

const invoiceUpdateSchema = invoiceCreateSchema.partial().extend({
  id: z.string(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']).optional(),
})

export const invoiceRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.invoice.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        client: true,
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.invoice.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          client: true,
          project: true,
        },
      })
    }),

  create: protectedProcedure
    .input(invoiceCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const invoiceCount = await ctx.db.invoice.count({
        where: { userId: ctx.session.user.id },
      })
      
      const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`

      return ctx.db.invoice.create({
        data: {
          ...input,
          number: invoiceNumber,
          userId: ctx.session.user.id,
        },
        include: {
          client: true,
          project: true,
        },
      })
    }),

  update: protectedProcedure
    .input(invoiceUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.invoice.update({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
        include: {
          client: true,
          project: true,
        },
      })
    }),

  updateStatus: protectedProcedure
    .input(z.object({ 
      id: z.string(), 
      status: z.enum(['draft', 'sent', 'paid', 'overdue']) 
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.invoice.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          status: input.status,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.invoice.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const invoices = await ctx.db.invoice.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    }) as InvoiceWithStatus[]

    const stats = {
      total: invoices.length,
      draft: invoices.filter((inv) => inv.status === 'draft').length,
      sent: invoices.filter((inv) => inv.status === 'sent').length,
      paid: invoices.filter((inv) => inv.status === 'paid').length,
      overdue: invoices.filter((inv) => inv.status === 'overdue').length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
      paidAmount: invoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0),
    }

    return stats
  }),
})