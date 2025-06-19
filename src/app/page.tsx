import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SoloSuite
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The complete freelancer CRM and invoicing solution. Manage clients, 
            track projects, and get paid faster with our all-in-one platform.
          </p>
          <p className="text-sm text-blue-600 mb-4">
            🚧 Development Version - Testing new features
          </p>
          
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Client Management</h3>
              <p className="text-gray-600">
                Keep track of all your clients with detailed contact information 
                and project history.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-xl font-semibold mb-2">Project Tracking</h3>
              <p className="text-gray-600">
                Organize your work with project management tools and 
                time tracking capabilities.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold mb-2">Professional Invoicing</h3>
              <p className="text-gray-600">
                Create and send professional invoices with integrated 
                payment processing via Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
