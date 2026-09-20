# Auth

Google OAuth via Nest with Postgres-backed session cookie `llp.sid`. Next.js middleware gates UI routes. Nest `/api/videos/*`, `/api/speaking/calls*`, and `/api/dash/*` require the session cookie (`401` without it). DASH routes are also owner-scoped (`404` for another user's video). The LiveKit webhook stays public.

## Backend routes

- `GET /api/auth/google` — start OAuth flow
- `GET /api/auth/google/callback` — OAuth callback
- `GET /api/auth/me` — current session user
- `POST /api/auth/logout` — destroy session

## Backend env

See `backend/.env.example`:

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SESSION_SECRET`
- Optional: `AUTH_SUCCESS_REDIRECT`, `AUTH_FAILURE_REDIRECT`, `SESSION_MAX_AGE_MS`

## Frontend

- `/login` — Google sign-in (the only public UI route)
- Auth session uses `authFetch()` with `credentials: "include"`
- Next middleware checks `GET /api/auth/me` via `AUTH_API_URL` (Compose: `http://backend:3001`)

### Frontend route gate

Default-deny: all UI routes require a valid session except `/login`. Middleware forwards `llp.sid` to `GET /api/auth/me`; unauthenticated requests redirect to `/login` (with `?next=` when the original path was not `/`). A logged-in user visiting `/login` is redirected to `/dashboard`.

Middleware lives at [`frontend/middleware.ts`](../frontend/middleware.ts) (project root). The empty [`frontend/pages/`](../frontend/pages/) directory blocks `src/pages` from becoming the Pages Router; with that layout, Next.js does not pick up `src/middleware.ts`.

## CORS and cookies

With Caddy, app and API share origin (`https://app.llp-test.com` / `https://app.llp-test.com/api`), so session cookies work without cross-origin issues. See [`local-dev.md`](local-dev.md) for HTTPS setup.
