# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Technology Stack

**Frontend**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
**Backend**: tRPC 11 + NextAuth.js 4 + Prisma 6 + PostgreSQL  
**Additional**: Stripe integration, Turbopack for dev builds

## Development Commands

```bash
# Primary development
npm run dev          # Start development server with Turbopack
npm run build        # Production build (includes Prisma generate)
npm run lint         # Run ESLint

# Database operations
npx prisma generate  # Generate Prisma client after schema changes
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open database GUI
```

## Architecture Overview

**Feature-based organization** with clear separation:
- `/src/features/` - Business logic modules (auth, clients, invoices, projects, settings)
- `/src/components/ui/` - shadcn/ui components with Radix primitives
- `/src/server/` - tRPC routers and server-side logic
- `/src/app/` - Next.js App Router pages and API routes

**Key patterns:**
- tRPC for type-safe client-server communication
- NextAuth.js with database sessions for authentication
- Prisma ORM with PostgreSQL for data persistence
- Server components with selective client-side interactivity

## Database Schema

Core entities: `User` → `Client` → `Project` → `Invoice`
- Users authenticate via email/password or Google OAuth
- Clients belong to users and contain contact/company info
- Projects belong to clients with hourly rates and status tracking
- Invoices link to projects/clients with Stripe payment integration

## Deployment Context

**Branches:**
- `main` - Production deployments (auto-deploy)
- `development` - Preview deployments (auto-deploy)

**Platform**: Vercel with PostgreSQL database

## Path Aliases

TypeScript paths configured for clean imports:
- `@/` maps to `src/`
- `@/components` for UI components
- `@/lib` for utilities and configurations
- `@/server` for tRPC server code

## Key Configuration Notes

- ESLint disabled during builds (`next.config.ts`)
- Superjson for tRPC data serialization
- Tailwind CSS 4 with custom design system variables
- Strict TypeScript configuration with path mapping