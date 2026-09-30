# AGENTS.md

Guidance for AI coding agents working in `myapp/`. Repo-wide conventions are in the root `AGENTS.md`. Paths below are relative to `myapp/`.

## Session handoff

Read `agent/SESSION_LOG.md` at session start. Add a dated entry (most recent first) before ending a session with uncommitted/in-progress work.

See `agent/TODO.md` for planned/optional additions.

## Architecture

Full-stack appointment booking app: single Cloudflare Worker + static assets (SPA).

**Frontend** (`src/`): React 19, React Router v7, Tailwind CSS v4, Auth0 React SDK, Stripe React SDK.

**Backend** (`worker/`): Worker serves the API; `/api/*` handled before falling through to SPA assets.

**Database**: Cloudflare D1, binding `DB` (`wrangler.jsonc`). Local dev uses a local replica; prod uses remote.

### Request flow

1. Every request hits `worker/index.ts`.
2. `/api/public/*` — unauthenticated (booking, Stripe intent creation).
3. `/api/appointments` (GET/POST/DELETE) — require Auth0 JWT + scope (`get:appointment`/`post:appointment`/`delete:appointment`).
4. Everything else → `env.ASSETS.fetch(request)` (SPA).

### Auth

- **Frontend**: Auth0 (`@auth0/auth0-react`), configured via `VITE_AUTH0_*` in `.env`. `src/auth-config.ts`'s `hasAuth0Config` — false (vars absent) bypasses auth.
- **Worker**: `worker/auth.ts`'s `requireAuth0Jwt` verifies RS256 JWTs against Auth0's JWKS; scopes enforced per route.

### Payment flow

$1 CAD Stripe deposit required:

1. `POST /api/public/payments/create-deposit-intent` → `clientSecret`.
2. Stripe Elements payment on `/checkout`.
3. `POST /api/public/appointments` with `paymentIntentId` — worker verifies payment before persisting.

### Privacy

`worker/encryption.ts`'s `hashPrivateValue` (HMAC-SHA-256) hashes PII (name/email/meeting contact) before logging; raw values only in D1.

### Environment variables

- `.env` — frontend Vite vars (`VITE_*`), committed (non-secret public keys and Auth0 config).
- `.dev.vars` — worker secrets for local dev (`PRIVACY_SALT_PHRASE`, `STRIPE_SECRET_KEY`), not committed.
- `wrangler.jsonc` `vars` block — non-secret worker vars (`AUTH0_AUDIENCE`, `AUTH0_DOMAIN`, `CONTACT_EMAIL`).
- Prod secrets: `wrangler secret put`.

### Key frontend hooks

- `useCloudflareApi` — wraps `fetch` with Auth0 bearer tokens; silent/popup token acquisition.
- `useAppointmentApi` — authenticated CRUD for appointments (dashboard).
- `usePublicAppointmentApi` — unauthenticated appointment creation (public booking).
- `usePaymentApi` — creates Stripe deposit payment intents.

### Routes

| Path               | Component                                             | Auth           |
| ------------------ | ----------------------------------------------------- | -------------- |
| `/`                | `LandingPage`                                         | Public         |
| `/dashboard`       | `DashboardPage` + `AuthenticatedBookingCalendar`      | Requires Auth0 |
| `/appointments`    | `AppointmentsPage` — tabular list of all appointments | Requires Auth0 |
| `/book`            | `BookingPage` + `PublicBookingCalendar`               | Public         |
| `/checkout`        | `CheckoutPage`                                        | Public         |
| `/payment/success` | `PaymentSuccessPage`                                  | Public         |

### Navigation

Authenticated pages (`/dashboard`, `/appointments`) wrap in `AuthenticatedShell` (`App.tsx`) — renders `BottomNav` (`@repo/ui`), tracks active item via `location.pathname`, navigates via `useNavigate`. New authenticated page: wrap route in `<RequireAuth><AuthenticatedShell>`, add entry to `NAV_ITEMS`.

### Icon system

`src/components/web/Icon.tsx` — typed `<Icon type="..." size={n} />`, used app-wide. Extend for new nav entries.

### `@repo/ui` package

`packages/ui/src/` (repo root). Exports: `Button`, `TextControl`, `BottomNav` (+ `BottomNavItem`). `BottomNav` is router-agnostic — takes `items`, `activeId`, `onItemClick`; caller handles navigation.

### Testing

Vitest, Node environment. Worker tests mock D1's `prepare/bind/run` and `fetch` (JWKS). No integration tests against live D1/Stripe.

## Cloudflare setup notes

### Recommended stack

- Cloudflare Workers — API layer.
- Cloudflare D1 — appointments + chat history, bound as `DB`.

### API endpoints

- `GET /api/public/appointments` — public read
- `POST /api/public/appointments` — public booking (requires verified Stripe deposit)
- `POST /api/public/payments/create-deposit-intent` — creates $1 CAD Stripe PaymentIntent
- `GET /api/appointments` — authenticated read (scope: `get:appointment`)
- `POST /api/appointments` — authenticated create (scope: `post:appointment`)
- `DELETE /api/appointments/:id` — authenticated delete (scope: `delete:appointment`)

### Booking payload

Times stored in UTC; timezone stored separately.

Required: `startAt`, `endAt`, `timezone`, `name`, `email`, `meetingLinkOrPhone`. Optional: `additionalInfo`, `paymentIntentId` (required on public route).

### D1 schema

See `schema/db-schema-setup.sql` for table definitions — not duplicated here (would drift).
