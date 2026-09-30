# AGENTS.md

This file provides guidance to AI coding agents when working with code inside `myapp/`. Repo-wide conventions (git safety, monorepo layout, adding new projects) live in the root `AGENTS.md` and aren't repeated here; this file covers everything specific to this project. Paths below are relative to `myapp/`, not the repo root.

## Session handoff

Read `HANDOFF.md` (in this directory) at the start of a session to see what was in progress most recently on this project. Add a dated entry there (most recent on top) before ending a session that leaves uncommitted or partially-done work.

## Architecture

This is a full-stack appointment booking app deployed as a single Cloudflare Worker + static assets (SPA).

**Frontend** (`src/`): React 19, React Router v7, Tailwind CSS v4, Auth0 React SDK, Stripe React SDK.

**Backend** (`worker/`): A Cloudflare Worker that serves as the API. All `/api/*` routes are handled by the worker before falling through to the static SPA assets.

**Database**: Cloudflare D1 (`appointments` table). The D1 binding `DB` is configured in `wrangler.jsonc`. Local dev uses a local D1 replica; production uses the remote D1 database.

### Request flow

1. Every request hits `worker/index.ts`.
2. `/api/public/*` routes are unauthenticated (public booking and Stripe payment intent creation).
3. `/api/appointments` (GET/POST/DELETE) require an Auth0 JWT with specific scopes (`get:appointment`, `post:appointment`, `delete:appointment`).
4. All other paths are passed to `env.ASSETS.fetch(request)` to serve the SPA.

### Auth

- **Frontend auth**: Auth0 via `@auth0/auth0-react`. Configured via `VITE_AUTH0_*` env vars in `.env`. `src/auth-config.ts` exports `hasAuth0Config` — when false (env vars absent), auth is bypassed and the app runs unauthenticated (useful for local dev without Auth0 credentials).
- **Worker auth**: `worker/auth.ts` exports `requireAuth0Jwt`, which verifies RS256 JWTs against Auth0's JWKS endpoint. Scopes are enforced per route.

### Payment flow

Public booking requires a $1 CAD Stripe deposit:
1. Frontend calls `POST /api/public/payments/create-deposit-intent` to get a Stripe `clientSecret`.
2. User completes payment via Stripe Elements on the `/checkout` page.
3. Frontend calls `POST /api/public/appointments` with the `paymentIntentId` — the worker verifies the payment was completed before persisting the appointment.

### Privacy

`worker/encryption.ts` provides `hashPrivateValue` (HMAC-SHA-256). PII (name, email, meeting contact) is hashed before being written to logs; the raw values are only stored in D1.

### Environment variables

- `.env` — frontend Vite vars (`VITE_*`), committed (non-secret public keys and Auth0 config).
- `.dev.vars` — worker secrets for local dev (`PRIVACY_SALT_PHRASE`, `STRIPE_SECRET_KEY`), not committed.
- `wrangler.jsonc` `vars` block — non-secret worker vars deployed to Cloudflare (`AUTH0_AUDIENCE`, `AUTH0_DOMAIN`, `CONTACT_EMAIL`).
- Secrets in production are set via `wrangler secret put`.

### Key frontend hooks

- `useCloudflareApi` — wraps `fetch` with Auth0 bearer tokens; handles silent/popup token acquisition.
- `useAppointmentApi` — authenticated CRUD for appointments (dashboard use).
- `usePublicAppointmentApi` — unauthenticated appointment creation (public booking flow).
- `usePaymentApi` — creates Stripe deposit payment intents.

### Routes

| Path | Component | Auth |
|------|-----------|------|
| `/` | `LandingPage` | Public |
| `/dashboard` | `DashboardPage` + `AuthenticatedBookingCalendar` | Requires Auth0 |
| `/appointments` | `AppointmentsPage` — tabular list of all appointments | Requires Auth0 |
| `/book` | `BookingPage` + `PublicBookingCalendar` | Public |
| `/checkout` | `CheckoutPage` | Public |
| `/payment/success` | `PaymentSuccessPage` | Public |

### Navigation

Authenticated pages (`/dashboard`, `/appointments`) are wrapped in `AuthenticatedShell` (defined in `App.tsx`), which renders a fixed bottom navigation bar via `BottomNav` from `@repo/ui`. `AuthenticatedShell` is route-aware: it reads `location.pathname` to set the active nav item and uses `useNavigate` to switch between pages. Adding a new authenticated page only requires: registering a route wrapped in `<RequireAuth><AuthenticatedShell>`, and adding an entry to `NAV_ITEMS` in `App.tsx`.

### Icon system

`src/components/web/Icon.tsx` exports a typed `<Icon type="..." size={n} />` component used throughout the app (calendar, appointments, clock, chevrons, shop). Extend it when adding new nav entries.

### `@repo/ui` package

Shared UI components live in `packages/ui/src/` (repo root). Currently exports: `Button`, `TextControl`, `BottomNav` (+ `BottomNavItem` type). `BottomNav` is router-agnostic — it accepts `items: BottomNavItem[]`, `activeId: string`, and `onItemClick` callback; callers handle navigation.

### Testing

Tests use Vitest in Node environment. Worker functions are unit-tested by mocking the D1 `prepare/bind/run` chain and `fetch` (for JWKS). No integration tests against a live D1 or Stripe.

## Cloudflare setup notes

### Recommended stack

- Cloudflare Workers for the API layer (already in place).
- Cloudflare D1 for appointments, business hours, and blackout periods (already bound as `DB`).
- Cloudflare Turnstile to protect the public booking form from spam (not yet implemented).

Optional later additions: Cloudflare Queues (async email/reminders), Cron Triggers (scheduled reminders), Durable Objects (strict slot locking against double-booking).

### API endpoints

- `GET /api/public/appointments` — public read
- `POST /api/public/appointments` — public booking (requires verified Stripe deposit)
- `POST /api/public/payments/create-deposit-intent` — creates $1 CAD Stripe PaymentIntent
- `GET /api/appointments` — authenticated read (scope: `get:appointment`)
- `POST /api/appointments` — authenticated create (scope: `post:appointment`)
- `DELETE /api/appointments/:id` — authenticated delete (scope: `delete:appointment`)

### Booking payload

Times are stored in UTC; original user timezone is stored separately.

Required fields: `startAt`, `endAt`, `timezone`, `name`, `email`, `meetingLinkOrPhone`.
Optional: `additionalInfo`, `paymentIntentId` (required on the public route).

### D1 schema

```
appointments(id, status, start_at_utc, end_at_utc, timezone, name, email, meeting_contact, notes, created_at)
```

Business hours (Mon–Fri 9am–5pm) are intentionally hardcoded — in `worker/chat.ts`'s `getBusinessOpenWindowsInVisitorTime` and mirrored in the frontend booking calendar — not stored in D1. They're simple and static for the life of this app; don't propose an `availability_rules`/`blackout_ranges` table for this.
