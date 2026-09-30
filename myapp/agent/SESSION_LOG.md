# Handoff Log

Session progress notes for `myapp/`, most recent first. Read this before starting work; add an entry before ending a session with uncommitted or in-progress work.

## 2026-09-29

Building a public chatbot assistant for the booking flow (uncommitted, not yet merged).

- `worker/chat.ts` (new): Claude-powered chat handler using `@anthropic-ai/sdk`, model `claude-sonnet-5`. Has a tool-use loop (max 4 iterations) for the assistant to check availability/business hours. Timezone handling mirrors `getAvailabilityTzShiftHours` in `src/components/web/BookingCalendar/utils.ts`, generalized for arbitrary zone pairs (worker has no local TZ).
- `worker/index.ts`: wired up `GET/POST /api/public/chat`; POST 500s with "Chat is not configured." if `ANTHROPIC_API_KEY` is unset.
- `wrangler.jsonc`: added `ANTHROPIC_API_KEY` env var slot, `MAX_DAILY_CHAT_MESSAGES` (500), `BUSINESS_TIMEZONE` (America/Vancouver), and a `CHAT_RATE_LIMITER` simple rate limit (5 req / 60s).
- `schema/chat.sql` (new): D1 schema for chat history, backing `handleGetChatHistory`.
- `src/components/web/Chatbot/` (new), `src/hooks/usePublicChatApi.ts` (new): frontend widget + hook, not yet reviewed here.
- Also touched: `App.tsx`, `BookingCalendar.tsx`, `PublicBookingCalendar.tsx`, `icons.tsx`, `BookingPage.tsx` — likely wiring the chatbot into the booking UI, not yet inspected in detail.

**Not yet done / open questions:**
- `ANTHROPIC_API_KEY` needs to be set via `wrangler secret put` for prod; unclear if `.dev.vars` has it locally.
- Rate limiter binding (`CHAT_RATE_LIMITER`, `namespace_id: "1"`) — verify this is provisioned, not a placeholder.
- None of this is committed yet — decide on commit granularity (schema/worker/frontend as one PR vs. split).
- Per `AGENTS.md` rollout order, Turnstile bot protection for the public booking form is still not implemented — the new public `/api/public/chat` endpoint has the same exposure.

**Next:** review the untracked frontend files (`Chatbot/`, `usePublicChatApi.ts`) and the booking-page wiring diffs, then decide what to commit.
