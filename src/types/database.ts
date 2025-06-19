import { Invoice } from '@prisma/client'

export type InvoiceWithStatus = Invoice & {
  status: 'draft' | 'sent' | 'paid' | 'overdue'
}