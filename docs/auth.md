# Auth

Google OAuth via Nest with Postgres-backed session cookie `llp.sid`. Next.js middleware gates UI routes.

**Nest session gate (`AuthenticatedGuard`):** `/api/videos/*`, `/api/speaking/calls*`, `/api/speaking/topics*`, `/api/vocabulary/*`, and `/api/dash/*` require the session cookie (`401` without it). List, status, retry, playback-phrases, DASH manifest/segments, speaking calls, topics, and vocabulary routes are **owner-scoped** to the logged-in user's `userId` where applicable (`404` when missing or owned by another user). Upload and create endpoints stamp `userId` from the session.

**Public Nest routes:** `POST /api/speaking/livekit/webhook` (LiveKit reconciliation); auth OAuth/callback/me/logout as listed below.

**Agent bearer gate (`/api/agent/*`):** routes for the LiveKit teacher worker only. Require `Authorization: Bearer <SPEAKING_INTERNAL_API_SECRET>` (timing-safe compare). Missing, wrong, or empty configured secret → `401`. The call owner is resolved from `teacher_calls` by `callId`; the worker never sends a session cookie. Browser traffic to `/api/agent/*` is blocked at Caddy on the public app origin — see [`local-dev.md`](local-dev.md).

## Backend routes

- `GET /api/auth/google` — start OAuth flow
- `GET /api/auth/google/callback` — OAuth callback
- `GET /api/auth/me` — current session user
- `POST /api/auth/logout` — destroy session

## Backend env

See `backend/.env.example`:

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SESSION_SECRET`
- Optional: `AUTH_SUCCESS_REDIRECT`, `AUTH_FAILURE_REDIRECT`, `SESSION_MAX_AGE_MS`
- `SPEAKING_INTERNAL_API_SECRET` — bearer secret for `/api/agent/*` (teacher worker); see [`speaking.md`](speaking.md)

## Frontend

- `/login` — Google sign-in (the only public UI route)
- Auth session uses `authFetch()` with `credentials: "include"`
- Next middleware checks `GET /api/auth/me` via `AUTH_API_URL` (Compose: `http://backend:3001`)
- Server Components that prefetch authenticated data (e.g. `/listening`, `/speaking`) forward `llp.sid` to the same `AUTH_API_URL` host via `serverAuthFetch` in `frontend/src/shared/api/server-auth-fetch.ts`

### Frontend route gate

Default-deny: all UI routes require a valid session except `/login`. Middleware forwards `llp.sid` to `GET /api/auth/me`; unauthenticated requests redirect to `/login` (with `?next=` when the original path was not `/`). A logged-in user visiting `/login` is redirected to `/dashboard`.

Middleware lives at [`frontend/middleware.ts`](../frontend/middleware.ts) (project root). The empty [`frontend/pages/`](../frontend/pages/) directory blocks `src/pages` from becoming the Pages Router; with that layout, Next.js does not pick up `src/middleware.ts`.

## CORS and cookies

With Caddy, app and API share origin (`https://app.llp-test.com` / `https://app.llp-test.com/api`), so session cookies work without cross-origin issues. See [`local-dev.md`](local-dev.md) for HTTPS setup.
