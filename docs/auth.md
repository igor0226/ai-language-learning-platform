# Auth

Google OAuth via Nest with Postgres-backed session cookie `llp.sid`. Next.js middleware gates UI routes; videos, DASH, and speaking APIs stay unauthenticated until a later slice.

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

- `/login` — Google sign-in (middleware gates other UI routes)
- Auth session uses `authFetch()` with `credentials: "include"`
- Next middleware checks `GET /api/auth/me` via `AUTH_API_URL` (Compose: `http://backend:3001`)

## CORS and cookies

With Caddy, app and API share origin (`https://app.llp-test.com` / `https://app.llp-test.com/api`), so session cookies work without cross-origin issues. See [`local-dev.md`](local-dev.md) for HTTPS setup.
