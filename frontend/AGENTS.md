# Frontend Agent Notes

Next.js frontend for the **Language Learning Platform**. Read parent [`AGENTS.md`](../AGENTS.md) first. Detailed docs: [`docs/README.md`](../docs/README.md).

Run with Docker Compose from repo root; see [`docs/local-dev.md`](../docs/local-dev.md).

## Hard rules (always)

- Import shared types, enums, and Zod schemas from `@llp/contracts` — do not redeclare or re-export in frontend modules.
- App-wide client UI state uses Zustand stores in the owning feature `model/` (e.g. vocabulary drawer open/close). Do not add React context for that.
- Do not call `useQuery`, `useMutation`, or `useInfiniteQuery` in pages or widgets; use dedicated hooks under entity/feature `api/`. Do not copy server lists into Zustand or context — share endpoints via the same TanStack Query hook and query key.
- Do not add client-side vocabulary writes on the live call until the teacher agent exposes a vocabulary tool.
- Prioritize Tailwind theme tokens over hardcoded hex/rgb for colors and spacing.
- Before commit: `npm run lint:fix`
- Before commit: `npm run typecheck && npm run lint && npm run test`

## Read next

See in the parent [`AGENTS.md`](../AGENTS.md).

## Doc maintenance

See in the parent [`AGENTS.md`](../AGENTS.md).
