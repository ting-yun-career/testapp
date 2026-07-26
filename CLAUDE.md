# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The active project lives in `myapp/`. The `silver4/` directory is a separate static landing page and is not related to `myapp/`.

All commands below should be run from inside `myapp/`.

## Commands

```bash
# Install dependencies
pnpm install

# Start local dev server (Vite + Cloudflare Worker via @cloudflare/vite-plugin)
pnpm dev

# Type-check and build for production
pnpm build

# Lint
pnpm lint

# Run all tests
pnpm test

# Run a single test file
pnpm test worker/appointment.test.ts

# Generate Cloudflare Worker types from wrangler.jsonc
pnpm cf-typegen

# Deploy to Cloudflare Workers
pnpm deploy
```

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
| `/book` | `BookingPage` + `PublicBookingCalendar` | Public |
| `/checkout` | `CheckoutPage` | Public |
| `/payment/success` | `PaymentSuccessPage` | Public |

### Testing

Tests use Vitest in Node environment. Worker functions are unit-tested by mocking the D1 `prepare/bind/run` chain and `fetch` (for JWKS). No integration tests against a live D1 or Stripe.
