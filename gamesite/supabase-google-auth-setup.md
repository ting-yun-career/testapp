# Task: Set Up Google OAuth Login with Supabase in Next.js (App Router)

## Context
- Framework: Next.js with App Router (NOT pages router)
- Package manager: pnpm
- Language: TypeScript
- Auth provider: Supabase (already configured with Google OAuth)
- Styling: Tailwind CSS

## Environment Variables
These already exist in `.env.local`. Do NOT change them:
```
NEXT_PUBLIC_SUPABASE_URL=https://hibsdprlvxwhxkkarmcd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxx
```

## Step 1: Install packages
Run this command in the terminal:
```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

---

## Step 2: Create file `lib/supabase/client.ts`
This is the browser-side Supabase client. Used in Client Components.

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## Step 3: Create file `lib/supabase/server.ts`
This is the server-side Supabase client. Used in Server Components and API routes.

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies can't be set, safe to ignore
          }
        },
      },
    }
  )
}
```

---

## Step 4: Create file `middleware.ts` in the ROOT of the project (same level as `app/`)
This file runs on every request. It refreshes the user session and redirects unauthenticated users to `/login`.

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Allow unauthenticated access to /login and /auth routes
  const isPublicRoute =
    pathname.startsWith('/login') || pathname.startsWith('/auth')

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Step 5: Create file `app/login/page.tsx`
This is the login page. It has a single "Continue with Google" button.

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-6 rounded-xl border bg-white p-10 shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
        <p className="text-sm text-gray-500 text-center">
          Sign in to your account to continue
        </p>
        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={20}
            height={20}
          />
          Continue with Google
        </button>
      </div>
    </div>
  )
}
```

---

## Step 6: Create file `app/auth/callback/route.ts`
This is the callback URL that Google redirects to after login. It exchanges the OAuth code for a Supabase session, then sends the user to `/dashboard`.

```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
```

---

## Step 7: Create file `app/dashboard/page.tsx`
This is a simple protected page. It reads the logged-in user from Supabase and displays their email.

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Logged in as: {user.email}</p>
      <SignOutButton />
    </div>
  )
}
```

---

## Step 8: Create file `components/SignOutButton.tsx`
This is a reusable sign out button. It calls Supabase sign out and redirects to `/login`.

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
    >
      Sign out
    </button>
  )
}
```

---

## Summary of files to create

| File path | Purpose |
|---|---|
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client |
| `middleware.ts` | Session refresh + route protection |
| `app/login/page.tsx` | Login page with Google button |
| `app/auth/callback/route.ts` | OAuth callback handler |
| `app/dashboard/page.tsx` | Protected dashboard page |
| `components/SignOutButton.tsx` | Sign out button component |

## Expected user flow
1. User visits any route (e.g. `/dashboard`)
2. Middleware detects no session → redirects to `/login`
3. User clicks "Continue with Google"
4. Google OAuth screen appears
5. User approves → redirected to `/auth/callback`
6. Callback exchanges code for session → redirects to `/dashboard`
7. Dashboard shows user email and sign out button
