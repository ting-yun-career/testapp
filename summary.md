# Appointment Booking Cloudflare Setup Summary

## Current Code State

- `myapp/src/components/BookingCalendar.tsx` is frontend-only.
- The component uses hardcoded weekly availability and, on confirm, only logs the appointment payload to the console.
- `myapp/worker/index.ts` already runs on Cloudflare and handles `/api/*`, but it currently returns placeholder JSON instead of real booking logic.
- `myapp/wrangler.jsonc` is already configured for a Cloudflare Worker plus static asset deployment.

## Recommended Cloudflare Stack

Start with:

1. Cloudflare Workers for the API layer.
2. Cloudflare D1 for appointments, business hours, and blackout periods.
3. Cloudflare Turnstile to protect the booking form from spam.

Optional later additions:

1. Cloudflare Queues for async work such as confirmation emails, reminder jobs, webhook retries, or calendar sync.
2. Cron Triggers for scheduled reminders or maintenance tasks.
3. Durable Objects if strict slot locking is needed to prevent double-booking under concurrent traffic.

## Recommended API Endpoints

Add these routes to the Worker:

- `GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD&tz=America/Vancouver`
- `POST /api/appointments`
- `GET /api/appointments/:id`

## Recommended Booking Payload

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

## Suggested D1 Tables

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

## Repo Changes Needed

Replace:

- the static default `availabilities` in `myapp/src/components/BookingCalendar.tsx`
- the `console.info(...)` submit stub in `myapp/src/components/BookingCalendar.tsx`

Expand:

- `myapp/worker/index.ts` so `/api/*` implements real route handlers

## Wrangler Configuration Needed

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

## Practical Rollout Order

1. Create and bind the D1 database.
2. Implement `/api/availability` and `/api/appointments` in the Worker.
3. Update the frontend to fetch availability from the Worker.
4. Update the confirm action to post bookings to the Worker.
5. Add Turnstile before exposing the form publicly.
6. Add email or calendar sync after persistence works.
7. Add Durable Objects only if stricter concurrency control is actually needed.

## Official References

- Workers config: <https://developers.cloudflare.com/workers/wrangler/configuration/>
- D1: <https://developers.cloudflare.com/d1/get-started/>
- Turnstile validation: <https://developers.cloudflare.com/turnstile/get-started/server-side-validation/>
- Queues: <https://developers.cloudflare.com/queues/get-started/>
- Cron Triggers: <https://developers.cloudflare.com/workers/configuration/cron-triggers/>
