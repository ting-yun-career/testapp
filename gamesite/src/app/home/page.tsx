import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to Our Platform</h1>
        <p className="mt-4 text-lg text-gray-600">Get started by signing in with your Google account</p>
      </div>
      
      <Link
        href="/login"
        className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition"
      >
        Get Started
      </Link>
    </div>
  )
}
