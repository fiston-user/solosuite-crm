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
})