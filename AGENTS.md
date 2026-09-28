# Language Learning Platform — Agent Notes

Shared monorepo index. Package-specific indexes: [`frontend/AGENTS.md`](frontend/AGENTS.md), [`backend/AGENTS.md`](backend/AGENTS.md). Detailed docs: [`docs/README.md`](docs/README.md).

## Hard rules (always)

- Ask questions if something from the user's instruction seems not clear enough.
- Always run `nvm use` before host Node commands (lint, test, commit hooks).
- In the Cursor agent **Shell**, run backend `npm run test` / `npm run test:e2e` with **`required_permissions: ["all"]`** (Vitest loads `backend/.env`; the default sandbox returns `EPERM`). See [`docs/local-dev.md`](docs/local-dev.md#cursor-agent-shell).
- Never run `docker compose down -v` (wipes `postgres_data` and `minio_data`).
- Shared wire types, enums, and Zod schemas live only in [`packages/contracts`](packages/contracts) — import from `@llp/contracts`; do not redeclare in app modules.
- After any edit under `packages/contracts`, run `npm run build -w @llp/contracts` from the repo root **before** backend or frontend `typecheck` (workspaces consume `dist/`, not `src/`).
- When verifying a package after adding or changing files, run that package’s `lint:fix` **before** `lint` in the same session (Biome check-only fails on unformatted new files).
- When you change product behavior, update the matching canonical doc in the same change — see [`docs/README.md`](docs/README.md) (ownership table + checklist). Do not copy rules or procedures across layers; link instead.
- After large doc changes or before refactors, run the **audit-agent-instructions** skill (see [`docs/README.md`](docs/README.md#periodic-quality-review)) to review duplication and drift.

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

Local dev: [`docs/local-dev.md`](docs/local-dev.md). Doc authoring and maintenance: [`docs/README.md`](docs/README.md).
