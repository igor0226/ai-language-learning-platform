# Agent documentation catalog

Detailed agent guidance lives here. Each [`AGENTS.md`](../AGENTS.md) file is a short index — read it first, then open only the topic files that match your task.

## Catalog

| File | When to read |
|---|---|
| [`product.md`](product.md) | Product goal, skills roadmap, CEFR/language inputs, monorepo layout |
| [`local-dev.md`](local-dev.md) | Docker Compose, HTTPS/Caddy, `nvm`, volumes, env bootstrap |
| [`conventions.md`](conventions.md) | `@llp/contracts`, file/function limits, utils/, ask when unclear |
| [`auth.md`](auth.md) | Google OAuth, session cookie, Next middleware, CORS |
| [`listening.md`](listening.md) | Listening pipeline, artifacts, video API, retry, DASH, player |
| [`speaking.md`](speaking.md) | Speaking API, LiveKit, agent worker, frontend call UI |
| [`frontend.md`](frontend.md) | Next.js FSD, routes, Query hooks, UI tokens, tests, validation |
| [`backend.md`](backend.md) | Nest modules, Postgres, S3 keys, logging, validation |

Package indexes: [`AGENTS.md`](../AGENTS.md) (root), [`frontend/AGENTS.md`](../frontend/AGENTS.md), [`backend/AGENTS.md`](../backend/AGENTS.md).

## Keeping docs current

Agents **must** maintain this directory when implementing features:

1. After implementing a feature, update the matching `docs/*.md` if architecture, APIs, env vars, routes, storage keys, or conventions changed.
2. If no existing file matches, create `docs/<kebab-topic>.md` with a one-line purpose at the top, then add a row to **the root** `AGENTS.md` index and to this catalog table.
3. Do not grow `AGENTS.md` with how-tos; keep each index under 80 lines.
4. Prefer one topic file over duplicating the same facts in `frontend.md` and `backend.md`; those two files hold package conventions only.
