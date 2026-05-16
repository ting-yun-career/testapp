# Testapp Repo Summary

This repo contains two independent projects.

---

## myapp — Appointment Booking (Cloudflare)

### Current Code State

- `myapp/src/components/BookingCalendar.tsx` is frontend-only.
- The component uses hardcoded weekly availability and, on confirm, only logs the appointment payload to the console.
- `myapp/worker/index.ts` already runs on Cloudflare and handles `/api/*`, but it currently returns placeholder JSON instead of real booking logic.
- `myapp/wrangler.jsonc` is already configured for a Cloudflare Worker plus static asset deployment.

### Recommended Cloudflare Stack

Start with:

1. Cloudflare Workers for the API layer.
2. Cloudflare D1 for appointments, business hours, and blackout periods.
3. Cloudflare Turnstile to protect the booking form from spam.

Optional later additions:

1. Cloudflare Queues for async work such as confirmation emails, reminder jobs, webhook retries, or calendar sync.
2. Cron Triggers for scheduled reminders or maintenance tasks.
3. Durable Objects if strict slot locking is needed to prevent double-booking under concurrent traffic.

### Recommended API Endpoints

Add these routes to the Worker:

- `GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD&tz=America/Vancouver`
- `POST /api/appointments`
- `GET /api/appointments/:id`

### Recommended Booking Payload

The client should stop relying on UI-only fields like `dayIndex` as the durable booking contract.

Use fields like:

- `startAt`
- `endAt`
- `timezone`
- `name`
- `email`
- `meetingLinkOrPhone`
- `additionalInfo`
- `turnstileToken`

Store times in UTC and keep the original user timezone separately.

### Suggested D1 Tables

Minimum schema:

- `appointments`
- `availability_rules`
- `blackout_ranges`

Suggested fields:

- `appointments(id, status, start_at_utc, end_at_utc, timezone, name, email, meeting_contact, notes, created_at)`
- `availability_rules(id, weekday, start_minute, end_minute, timezone)`
- `blackout_ranges(id, start_at_utc, end_at_utc, reason)`

Possible later addition:

- `appointment_holds(id, start_at_utc, end_at_utc, expires_at)`

### Repo Changes Needed

Replace:

- the static default `availabilities` in `myapp/src/components/BookingCalendar.tsx`
- the `console.info(...)` submit stub in `myapp/src/components/BookingCalendar.tsx`

Expand:

- `myapp/worker/index.ts` so `/api/*` implements real route handlers

### Wrangler Configuration Needed

Add a D1 binding and relevant vars/secrets in `myapp/wrangler.jsonc`.

Typical additions:

- `d1_databases` binding for `DB`
- `APP_TIMEZONE`
- `TURNSTILE_SECRET`
- calendar or email provider secrets if external integrations are added

Example shape:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "appointments",
      "database_id": "..."
    }
  ],
  "vars": {
    "APP_TIMEZONE": "America/Vancouver"
  }
}
```

### Practical Rollout Order

1. Create and bind the D1 database.
2. Implement `/api/availability` and `/api/appointments` in the Worker.
3. Update the frontend to fetch availability from the Worker.
4. Update the confirm action to post bookings to the Worker.
5. Add Turnstile before exposing the form publicly.
6. Add email or calendar sync after persistence works.
7. Add Durable Objects only if stricter concurrency control is actually needed.

### Official References

- Workers config: <https://developers.cloudflare.com/workers/wrangler/configuration/>
- D1: <https://developers.cloudflare.com/d1/get-started/>
- Turnstile validation: <https://developers.cloudflare.com/turnstile/get-started/server-side-validation/>
- Queues: <https://developers.cloudflare.com/queues/get-started/>
- Cron Triggers: <https://developers.cloudflare.com/workers/configuration/cron-triggers/>

---

## silver4 — Salon Static Site (Vite)

A static marketing site for Silver4 Salon (hair salon in Vancouver).

### Stack

- Plain HTML + SCSS + jQuery
- Unite Gallery (jQuery plugin, vendored at `silver4/vendor/unitegallery/`)
- Featherlight (CDN) for policy modals
- Vite 8 for dev server and production builds
- Package manager: Yarn 1

### Project Structure

```
silver4/
  index.html              # Single-page site entry
  js/main.js              # JS entry — imports SCSS, initializes galleries and modals
  scss/
    index.scss            # Main stylesheet (SCSS)
    _mixin.scss           # Responsive breakpoints and shared mixins
    normalize.css         # CSS reset (imported via JS entry)
  asset/                  # Photos, icons, logos, patterns
  vendor/unitegallery/    # Vendored gallery library (dist/ used at runtime)
  vite.config.js          # Vite config with static copy plugin for asset/ and vendor/
  package.json
  yarn.lock
```

### Dev Commands

```bash
yarn dev      # Vite dev server on localhost:3000 with HMR
yarn build    # Production build to dist/
yarn preview  # Preview the production build
```

### Build Notes

- jQuery and Featherlight are loaded via `<script>` CDN tags in `index.html` so they are available as globals (`$`, `$.featherlight`) before the module script runs.
- Unite Gallery scripts are also `<script>` tags pointing to `vendor/unitegallery/dist/`.
- `vite-plugin-static-copy` copies `asset/` and `vendor/` into `dist/` during `vite build`.
- SCSS (including normalize.css) is imported from `js/main.js` and compiled by Vite using the `sass` package.

### Security

All npm audit vulnerabilities resolved as of 2026-05-16:

- Upgraded `sass`, `reload`, `prettier` to latest versions.
- `reload` subsequently removed entirely in the Vite migration.
- Added `resolutions: { picomatch: "^4.0.4" }` to force patched picomatch across transitive deps.
- `vite-silver4/` sub-directory (separate Vite scaffold, unused) fixed via `npm audit fix`.
