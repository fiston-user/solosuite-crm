import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const timeEntryCreateSchema = z.object({
  description: z.string().optional(),
  hours: z.number().min(0.01, 'Hours must be greater than 0'),
  date: z.date().default(() => new Date()),
  projectId: z.string(),
})

const timeEntryUpdateSchema = timeEntryCreateSchema.partial().extend({
  id: z.string(),
})

const timerStartSchema = z.object({
  projectId: z.string(),
  description: z.string().optional(),
})

const timerStopSchema = z.object({
  id: z.string(),
})

export const timeEntryRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.timeEntry.findMany({
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
      return ctx.db.timeEntry.findMany({
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

  getRunningTimer: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.timeEntry.findFirst({
      where: {
        userId: ctx.session.user.id,
        isRunning: true,
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
    .input(timeEntryCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.timeEntry.create({
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

  startTimer: protectedProcedure
    .input(timerStartSchema)
    .mutation(async ({ ctx, input }) => {
      // Stop any existing running timers
      await ctx.db.timeEntry.updateMany({
        where: {
          userId: ctx.session.user.id,
          isRunning: true,
        },
        data: {
          isRunning: false,
          endTime: new Date(),
          hours: 0, // We'll calculate this on stop
        },
      })

      // Start new timer
      return ctx.db.timeEntry.create({
        data: {
          description: input.description,
          projectId: input.projectId,
          userId: ctx.session.user.id,
          startTime: new Date(),
          isRunning: true,
          hours: 0,
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

  stopTimer: protectedProcedure
    .input(timerStopSchema)
    .mutation(async ({ ctx, input }) => {
      const timeEntry = await ctx.db.timeEntry.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
          isRunning: true,
        },
      })

      if (!timeEntry || !timeEntry.startTime) {
        throw new Error('No running timer found')
      }

      const endTime = new Date()
      const hours = (endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60 * 60)

      return ctx.db.timeEntry.update({
        where: {
          id: input.id,
        },
        data: {
          endTime,
          hours: Math.round(hours * 100) / 100, // Round to 2 decimal places
          isRunning: false,
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
    .input(timeEntryUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.timeEntry.update({
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
      return ctx.db.timeEntry.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })
    }),

  getTotalHoursByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.timeEntry.aggregate({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
        _sum: {
          hours: true,
        },
      })
      return result._sum.hours || 0
    }),

  getUnbilledTimeByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get time entries that haven't been invoiced yet
      // For now, we'll get all time entries for the project
      const timeEntries = await ctx.db.timeEntry.findMany({
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

      const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0)
      const project = timeEntries[0]?.project
      const totalAmount = project?.rate ? totalHours * project.rate : 0

      return {
        timeEntries,
        totalHours,
        totalAmount,
        project,
      }
    }),
})