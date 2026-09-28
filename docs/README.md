# Agent documentation catalog

Detailed agent guidance lives here. Read the root [`AGENTS.md`](../AGENTS.md) **Read next** table first — that is the task index. Package indexes: [`frontend/AGENTS.md`](../frontend/AGENTS.md), [`backend/AGENTS.md`](../backend/AGENTS.md).

Topic files (same paths as in the root index):

- [`product.md`](product.md) — product goal, skills roadmap, CEFR/language inputs, monorepo layout
- [`local-dev.md`](local-dev.md) — Docker Compose, HTTPS/Caddy, `nvm`, volumes, env bootstrap
- [`conventions.md`](conventions.md) — `@llp/contracts` build detail, file/function limits, `utils/`, `type/`
- [`auth.md`](auth.md) — Google OAuth, session cookie, Next middleware, CORS
- [`listening.md`](listening.md) — Listening pipeline, artifacts, video API, retry, DASH, player
- [`speaking.md`](speaking.md) — Speaking API, LiveKit, agent worker, frontend call UI
- [`frontend.md`](frontend.md) — Next.js FSD, routes, Query hooks, UI tokens, tests
- [`backend.md`](backend.md) — Nest modules, Postgres, S3 keys, logging

## Layers (do not collapse)

| Layer | Files | Holds |
|---|---|---|
| Always-on index | Root [`AGENTS.md`](../AGENTS.md) | Monorepo hard rules + **Read next** task table only |
| Package index | [`frontend/AGENTS.md`](../frontend/AGENTS.md), [`backend/AGENTS.md`](../backend/AGENTS.md) | Package hard rules + before-commit commands |
| Topic doc | `docs/*.md` (this directory) | How-tos, architecture, env lists, API behavior |
| Human README | `README.md`, `frontend/README.md`, `backend/README.md` | Onboarding for people; not agent indexes |

Never copy a full rule or procedure from one layer into another. Use a markdown link to the canonical file.

## Canonical ownership (one home per fact)

If you add or change a fact, edit **only** the owning file below. Everywhere else: link.

| Fact | Canonical file |
|---|---|
| Ask when unclear; `nvm use`; never `docker compose down -v`; contracts import/build; global `lint:fix` before `lint`; backend Vitest Shell permissions | Root [`AGENTS.md`](../AGENTS.md) |
| Frontend before-commit chain; Query/Zustand/Tailwind/vocabulary UI rules | [`frontend/AGENTS.md`](../frontend/AGENTS.md) |
| Backend before-commit chain; blob storage; two-parameter functions; do not edit frontend without asking | [`backend/AGENTS.md`](../backend/AGENTS.md) |
| Compose services, HTTPS, volumes, host verification order, agent Shell `EPERM` | [`local-dev.md`](local-dev.md) |
| Doc catalog, authoring rules, maintenance checklist (this file) | [`docs/README.md`](README.md) |
| File/function limits; `utils/` / `type/`; nested ternaries; contracts `dist/` explanation | [`conventions.md`](conventions.md) |
| Session cookie, middleware, Nest `AuthenticatedGuard`, owner scope, public routes | [`auth.md`](auth.md) |
| S3 object keys, Postgres tables, Nest module map | [`backend.md`](backend.md) |
| Listening pipeline steps, video/retry/DASH API, player notes | [`listening.md`](listening.md) |
| Speaking/LiveKit API, call flow, speaking env | [`speaking.md`](speaking.md) |
| Next routes, FSD, data-fetching UX (Sonner, skeletons), UI tokens | [`frontend.md`](frontend.md) |
| Skill implementation status, roadmap, CEFR upload fields | [`product.md`](product.md) skills table + related sections |

Allowed in a non-owner file: one short sentence plus a link (e.g. “Session scope: [`auth.md`](auth.md).”). Context next to a route name in the same doc is fine; a second checklist is not.

## Authoring rules

1. **No `**Hard rule:**` in topic docs** — package and root indexes use `## Hard rules (always)` bullet lists only. Topic docs use normal prose or links to those indexes. Exception: volume safety in [`local-dev.md`](local-dev.md) (procedure + rationale lives there).
2. **No `## Validation` in `docs/frontend.md` or `docs/backend.md`** — commit commands live in package `AGENTS.md` only.
3. **No duplicate checklists** — do not paste `npm run lint:fix`, full Compose bootstrap, or S3 key lists outside their canonical file.
4. **No skill status outside `product.md`** — other docs link to the skills table; do not claim “only Listening is built” (or similar) elsewhere.
5. **Keep indexes thin** — each `AGENTS.md` stays under 80 lines; no how-to blocks or code blocks except where already required for contracts build in root (there should be none in indexes).
6. **New topic file template** — start with `# Title`, then one line: purpose + links to local dev / product / package `AGENTS.md` as relevant. Put feature detail in the body; do not restate index hard rules.

Cross-linking skill docs: route **tables** stay in [`frontend.md`](frontend.md); speaking **API and call flow** stay in [`speaking.md`](speaking.md). Do not merge those into one duplicate route list.

## Keeping docs current

Agents **must** maintain agent docs in the **same change** as the code when behavior, APIs, env vars, routes, storage keys, or conventions change.

### After implementing a feature

1. Update the **canonical** topic file(s) from the table above (not every file that mentions the area).
2. If skill status changed, update **only** the skills table in [`product.md`](product.md).
3. If a new always-on or package rule is required, add it to the correct `AGENTS.md` (not a topic doc).
4. Optionally invoke the **audit-agent-instructions** skill on the change for duplication/drift review.

### Adding a new topic file

1. Create `docs/<kebab-topic>.md` using the template in **Authoring rules**.
2. Add a row to the root [`AGENTS.md`](../AGENTS.md) **Read next** table.
3. Add a bullet to the topic list at the top of this file.

### Before finishing any edit under `docs/` or `AGENTS.md`

- [ ] Did I edit the canonical owner instead of copying text into a second file?
- [ ] Did I replace removed duplication with a link?
- [ ] If I added a new `docs/*.md`, is it in the root index and this catalog?

### Periodic quality review

Automated scripts cannot reliably enforce instruction quality. Use the project skill **audit-agent-instructions**:

| Tool | Location |
|---|---|
| **Source of truth** | [`.agents/skills/audit-agent-instructions/SKILL.md`](../.agents/skills/audit-agent-instructions/SKILL.md) |
| **Cursor** | [`.cursor/skills/audit-agent-instructions`](../.cursor/skills/audit-agent-instructions) → `.agents/skills/…` |
| **Claude Code** | [`.claude/skills/audit-agent-instructions`](../.claude/skills/audit-agent-instructions) → `.agents/skills/…` |

Project skills live under [`.agents/skills/`](../.agents/skills/). Cursor and Claude Code discover them via symlinks in `.cursor/skills/` and `.claude/skills/`.

In Cursor or Claude Code, ask to run or apply the **audit-agent-instructions** skill (or “audit agent instructions”). The skill reads this file’s ownership table and authoring rules, scans the doc set, and reports findings. Implement fixes only when you intend to act on the audit.

Edit only files under `.agents/skills/`; keep tool symlinks pointing at that tree.
