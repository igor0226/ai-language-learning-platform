# Local development

## Docker Compose

```bash
cp backend/.env.example backend/.env   # then set OPENAI_API_KEY, Google OAuth, SESSION_SECRET
npm run dev:https-setup                # one-time mkcert + /etc/hosts
docker compose up --build              # https://app.llp-test.com (UI + /api), wss://media.llp-test.com
```

Compose starts **postgres**, **minio**, **backend**, **frontend**, **livekit**, and **teacher-agent**. FFmpeg is in the backend image when using Compose. The backend runs migrations on boot (`npm run migration:run`) before `start:dev`.

Compose builds from the repo root so `@llp/contracts` resolves inside the images. After contract or lockfile changes, rebuild (`docker compose up --build`).

## Host Node (lint / test / hooks)

Always run `nvm use` before host Node commands (lint, test, commit hooks), then `npm install` at the repo root.

Package validation steps:

- Frontend: see [`frontend/AGENTS.md`](../frontend/AGENTS.md)
- Backend: see [`backend/AGENTS.md`](../backend/AGENTS.md)

## Local HTTPS (Compose + Caddy)

- App: `https://app.llp-test.com` serves Next.js and proxies `/api/*` to Nest on the same origin (session cookies + SSR auth checks).
- Media signaling: `wss://media.llp-test.com`
- One-time setup: `npm run dev:https-setup` then add `/etc/hosts` entries.
- Direct ports `localhost:3000` / `:3001` remain for debugging.

Defaults with Caddy:

- App: `https://app.llp-test.com`
- API: `https://app.llp-test.com/api`
- `NEXT_PUBLIC_API_URL` (frontend → Nest; same origin in Compose)
- `CORS_ORIGIN` (Nest → Next origin; same as app URL in Compose)

## FFmpeg

Provided by the backend Docker image when using Compose. On the host (without Docker), FFmpeg must be on system `PATH` for DASH packaging and video compositing (burn-in subtitles, phrase highlights, splice explanation clips at sentence boundaries derived from transcript timestamps).

## Volumes

**Hard rule:** never run `docker compose down -v`. That flag deletes every Compose volume, including `postgres_data` and `minio_data` (video metadata and Listening blobs). Stop the stack with `docker compose down` only.

If container `node_modules` or the Next cache go stale, reset those volumes only (never `postgres_data` / `minio_data`), then rebuild:

```bash
npm run dev:reset-packages
docker compose up --build
```

See [`scripts/reset-compose-package-volumes.sh`](../scripts/reset-compose-package-volumes.sh).
