import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const clientCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const clientUpdateSchema = clientCreateSchema.partial().extend({
  id: z.string(),
})

export const clientRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.client.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.client.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          projects: true,
          invoices: true,
        },
      })
    }),

  create: protectedProcedure
    .input(clientCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.client.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      })
    }),

  update: protectedProcedure
    .input(clientUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.client.update({
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
      return ctx.db.client.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })
    }),
})