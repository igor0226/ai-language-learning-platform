# Frontend Agent Notes

Next.js frontend for the **Language Learning Platform**. Read parent [`AGENTS.md`](../AGENTS.md) first. Detailed docs: [`docs/README.md`](../docs/README.md).

Run with Docker Compose from repo root; see [`docs/local-dev.md`](../docs/local-dev.md).

## Hard rules (always)

- Import shared types, enums, and Zod schemas from `@llp/contracts` — do not redeclare or re-export in frontend modules.
- Do not call `useQuery` or `useInfiniteQuery` in pages or widgets; use dedicated hooks under entity/feature `api/` or `model/`.
- Prioritize Tailwind theme tokens over hardcoded hex/rgb for colors and spacing.
- Before commit: `npm run lint:fix`
- Before commit: `npm run typecheck && npm run lint && npm run test`

## Read next

See in the parent [`AGENTS.md`](../AGENTS.md).

## Doc maintenance

See in the parent [`AGENTS.md`](../AGENTS.md).
