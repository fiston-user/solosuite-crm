export interface Client {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  address?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'on-hold'
  rate?: number
  client: Client
}

export interface Invoice {
  id: string
  number: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: string
  client: Client
  project?: Project
}