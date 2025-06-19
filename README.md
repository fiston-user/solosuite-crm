# SoloSuite CRM 

A complete freelancer CRM and invoicing SaaS built with Next.js 15, tRPC, Prisma, and NextAuth.js.

## 🌟 Features

- **Client Management**: Complete CRUD operations for client data
- **Project Management**: Track projects with client assignment and status
- **Invoice Management**: Create, send, and track invoice payments
- **Dashboard Analytics**: Real-time metrics and reporting
- **Authentication**: Secure login with email/password and Google OAuth
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Backend**: tRPC with TanStack Query for type-safe APIs
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe integration (ready)
- **Deployment**: Vercel

## 🚀 Deployment Workflow

### Branch Structure
- **`main`**: Production branch → Auto-deploys to production
- **`development`**: Development branch → Auto-deploys to preview

### Environment Setup

#### Production Environment
- **URL**: https://solosuite-gluiu813b-mylesuxs-projects.vercel.app
- **Branch**: `main`
- **Database**: Production PostgreSQL (Neon)

#### Development Environment  
- **URL**: Auto-generated preview URL
- **Branch**: `development`
- **Database**: Same as production (or separate dev DB)

## 🔧 Development Workflow

### 1. Local Development
```bash
# Work on development branch
git checkout development

# Make your changes
# ... code changes ...

# Test locally
npm run dev

# Build test
npm run build
```

### 2. Deploy to Development
```bash
# Push to development branch
git add .
git commit -m "Your changes"
git push origin development

# This will auto-deploy to a preview URL
```

### 3. Deploy to Production
```bash
# Create pull request from development → main
# Review changes
# Merge to main

# Or directly:
git checkout main
git merge development
git push origin main

# This will auto-deploy to production
```

## 🌐 Vercel Configuration

### Automatic Deployments
- **Production**: `main` branch → Production URL
- **Preview**: Any other branch → Preview URL

### Environment Variables (Set in Vercel Dashboard)

#### Production Environment
```bash
DATABASE_URL=your-production-database-url
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-super-secure-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

#### Preview Environment (Optional)
```bash
DATABASE_URL=your-dev-database-url
NEXTAUTH_URL=https://your-preview-domain.vercel.app
NEXTAUTH_SECRET=your-dev-secret
# ... other variables
```

## 📁 Project Structure

```
src/
├── app/                     # Next.js 13+ app router
├── components/ui/           # shadcn/ui components
├── features/
│   ├── auth/               # Authentication module
│   ├── clients/            # Client management
│   ├── projects/           # Project management  
│   ├── invoices/           # Invoice system
│   ├── dashboard/          # Dashboard overview
│   └── settings/           # User settings
├── server/                 # tRPC server setup
├── lib/                    # Utilities, database, config
└── types/                  # TypeScript definitions
```

## 🛠️ Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio
```

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret for NextAuth.js
- `NEXTAUTH_URL`: Your app URL
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials

## 📝 Contributing

1. Create feature branch from `development`
2. Make changes and test locally
3. Push to your feature branch for preview deployment
4. Create PR to `development` branch
5. After review, merge to `development`
6. When ready for production, merge `development` → `main`

## 🚀 Next Features to Implement

- [ ] PDF invoice generation
- [ ] Email invoice sending
- [ ] Time tracking
- [ ] Recurring invoices
- [ ] Client portal
- [ ] Multi-currency support
- [ ] Advanced reporting
- [ ] Team collaboration

## 📞 Support

For issues and feature requests, please use the GitHub Issues tab.