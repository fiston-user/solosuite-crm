import Link from 'next/link'
import { SignInForm } from '@/features/auth/components/signin-form'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            SoloSuite
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <SignInForm />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}