# Language Learning Platform — Agent Notes

Shared monorepo index. Package-specific indexes: [`frontend/AGENTS.md`](frontend/AGENTS.md), [`backend/AGENTS.md`](backend/AGENTS.md). Detailed docs: [`docs/README.md`](docs/README.md).

## Hard rules (always)

- Ask questions if something from the user's instruction seems not clear enough.
- Always run `nvm use` before host Node commands (lint, test, commit hooks).
- Never run `docker compose down -v` (wipes `postgres_data` and `minio_data`).
- Shared wire types, enums, and Zod schemas live only in [`packages/contracts`](packages/contracts) — import from `@llp/contracts`; do not redeclare in app modules.

## Read next

| Task | Doc |
|---|---|
| Product / roadmap / CEFR fields | [`docs/product.md`](docs/product.md) |
| Compose, HTTPS, volumes, `nvm` | [`docs/local-dev.md`](docs/local-dev.md) |
| Style, contracts, `utils/` / `type/` | [`docs/conventions.md`](docs/conventions.md) |
| Login, sessions, cookies | [`docs/auth.md`](docs/auth.md) |
| Listening pipeline, DASH, player | [`docs/listening.md`](docs/listening.md) |
| Speaking / LiveKit | [`docs/speaking.md`](docs/speaking.md) |
| Next.js UI / FSD / tests | [`docs/frontend.md`](docs/frontend.md) |
| Nest modules / DB / storage | [`docs/backend.md`](docs/backend.md) |
| Maintain or add agent docs | [`docs/README.md`](docs/README.md) |

## Quick start

```bash
cp backend/.env.example backend/.env   # OPENAI_API_KEY, Google OAuth, SESSION_SECRET
npm run dev:https-setup                # one-time mkcert + /etc/hosts
docker compose up --build              # https://app.llp-test.com
```

Stale container `node_modules` or Next cache: `npm run dev:reset-packages` then rebuild. See [`docs/local-dev.md`](docs/local-dev.md).

## Doc maintenance

After implementing a feature, update the matching `docs/*.md`. If none fits, create `docs/<kebab-topic>.md` and add it to all three `AGENTS.md` indexes and [`docs/README.md`](docs/README.md). Keep `AGENTS.md` files as indexes under 80 lines — no how-tos here.
