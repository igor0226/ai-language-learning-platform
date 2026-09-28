# Frontend Agent Notes

Next.js frontend for the **Language Learning Platform**. Read parent [`AGENTS.md`](../AGENTS.md) first. Topic docs and authoring rules: [`docs/README.md`](../docs/README.md).

## Hard rules (always)

- Import shared types, enums, and Zod schemas from `@llp/contracts` — do not redeclare or re-export in frontend modules.
- App-wide client UI state uses Zustand stores in the owning feature `model/` (e.g. vocabulary drawer open/close). Do not add React context for that.
- Do not call `useQuery`, `useMutation`, or `useInfiniteQuery` in pages or widgets; use dedicated hooks under entity/feature `api/`. Do not copy server lists into Zustand or context — share endpoints via the same TanStack Query hook and query key.
- Do not add client-side vocabulary writes on the live call until the teacher agent exposes a vocabulary tool.
- Prioritize Tailwind theme tokens over hardcoded hex/rgb for colors and spacing.
- If this task touched `packages/contracts`, from repo root first: `npm run build -w @llp/contracts`.
- Before commit (in `frontend/`): `npm run lint:fix && npm run typecheck && npm run lint && npm run test` — do not run `typecheck` on frontend until contracts are rebuilt when exports changed.
