# Google OAuth + Supabase + Next.js Setup Guide

## Prerequisites
- Next.js app with App Router and TypeScript
- pnpm installed
- Supabase account at supabase.com
- Google account for Google Cloud Console

---

## Part 1: Supabase Project Setup

1. Go to supabase.com → click **New Project**
2. Fill in project name, password, region → click **Create**
3. Wait for project to finish provisioning (~1 min)
4. Go to **Project Settings (gear icon) → API Keys**
5. Copy:
   - **Publishable key** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Secret key** → this is your `SUPABASE_SERVICE_ROLE_KEY`
6. Your project URL is `https://[your-project-id].supabase.co`

---

## Part 2: Google Cloud Console Setup

1. Go to console.cloud.google.com
2. Click the project dropdown at the top → **New Project** → give it a name → **Create**
3. Left menu → **APIs & Services → OAuth consent screen**
   - User type: **External** → click Create
   - Fill in **App name**, **User support email**, **Developer contact email**
   - Click **Save and Continue** through all steps (no need to add scopes)
4. Left menu → **APIs & Services → Credentials**
   - Click **+ Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Under **Authorized redirect URIs** → click **+ Add URI**
   - Enter exactly: `https://[your-project-id].supabase.co/auth/v1/callback`
   - Click **Create**
5. Copy the **Client ID** and **Client Secret** from the popup

---

## Part 3: Enable Google Provider in Supabase

1. Go to Supabase dashboard → **Authentication → Sign In / Providers**
2. Click **Google**
3. Toggle **Enable** to on
4. Paste in **Client ID** and **Client Secret** from Step 2
5. Copy the **Callback URL** shown on this page (verify it matches what you entered in Google Console)
6. Click **Save**

---

## Part 4: Configure Redirect URLs in Supabase

This is required or you will get a `validation_failed` error.

1. Go to Supabase dashboard → **Authentication → URL Configuration**
2. Under **Redirect URLs** → click **Add URL**
3. Add `http://localhost:3000/auth/callback` for local development
4. Add your production URL too when ready e.g. `https://yourdomain.com/auth/callback`
5. Click **Save**

---

## Part 5: Next.js App Setup

### Install packages
```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

### Add environment variables
Create `.env.local` in the root of your project:
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxx
```

### Create `lib/supabase/client.ts`
Browser-side client. Use this in Client Components (`'use client'`).
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Create `lib/supabase/server.ts`
Server-side client. Use this in Server Components and API routes.
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
            // Server Component — safe to ignore
          }
        },
      },
    }
  )
}
```

### Create `middleware.ts` in project root (same level as `app/`)
Protects all routes. Redirects unauthenticated users to `/login`.
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

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
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

### Create `app/login/page.tsx`
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

### Create `app/auth/callback/route.ts`
Handles the redirect from Google after login.
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

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
```

### Create `app/dashboard/page.tsx`
Protected page — only accessible when logged in.
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Logged in as: {user.email}</p>
      <SignOutButton />
    </div>
  )
}
```

### Create `components/SignOutButton.tsx`
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

## Part 6: Run and Test

```bash
pnpm dev
```

1. Visit `http://localhost:3000` → should redirect to `/login`
2. Click **Continue with Google**
3. Google OAuth screen appears → sign in
4. Redirected to `/dashboard` → shows your email

---

## Common Errors and Fixes

| Error | Cause | Fix |
|---|---|---|
| `validation_failed: Unsupported provider` | Google not enabled in Supabase OR redirect URL not whitelisted | Enable Google in Supabase Auth → Providers AND add `http://localhost:3000/auth/callback` to Supabase Auth → URL Configuration |
| `redirect_uri_mismatch` | Google Console redirect URI doesn't match Supabase callback URL | In Google Console → Credentials → your OAuth client, make sure `https://[project-id].supabase.co/auth/v1/callback` is listed exactly |
| Blank page after login | `/auth/callback` route missing or wrong path | Make sure `app/auth/callback/route.ts` exists |
| Keeps redirecting to `/login` | Middleware blocking session | Make sure `/auth` is in the public routes list in `middleware.ts` |
| Env vars not loading | Dev server not restarted after editing `.env.local` | Stop server and run `pnpm dev` again |

---

## When Deploying to Production

1. Add your production callback URL to Google Console → Authorized redirect URIs:
   ```
   https://yourdomain.com/auth/callback
   ```
2. Add your production callback URL to Supabase → Authentication → URL Configuration:
   ```
   https://yourdomain.com/auth/callback
   ```
3. Add env vars to Vercel dashboard → Project → Settings → Environment Variables
