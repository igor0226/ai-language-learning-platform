# Frontend

Next.js frontend for the **Language Learning Platform**. Today's routes implement the **Listening** skill (task list, upload form, DASH playback). The target information architecture adds Dashboard, Speaking, Writing, and Reading surfaces.

Run the app with Docker Compose from the repo root (`docker compose up --build`); see [`local-dev.md`](local-dev.md). Host installs are `npm install` from the repo root (npm workspaces).

**Hard rule:** Import shared types, enums, and Zod schemas from `@llp/contracts`. Do not redeclare or re-export them in frontend modules.

## Routes

**Target platform routes** (planned IA):

- `/dashboard` — progress overview, activity heatmap, recent activity
- `/listening` — video library with filters and search
- `/listening/upload` — standalone full-page upload form
- `/listening/:videoId` — video detail + DASH player
- `/speaking` — AI teacher session launcher and call history
- `/speaking/call/:callId` — live speaking call with captions and vocabulary sheet
- `/writing` — writing workspace (coming soon)
- `/reading` — reading practice (planned)

**Current routes** (implemented today):

- `/login` — Google sign-in (middleware gates other UI routes)
- `/` — redirect to `/dashboard`
- `/dashboard` — progress overview
- `/listening` — video library
- `/listening/upload` — upload form
- `/listening/[id]` — task detail + player
- `/speaking` — call launcher + history
- `/speaking/call/[callId]` — live AI teacher call (LiveKit)
- `/writing` — coming soon

## Feature-Sliced Design

The UI is organized under `src/`:

- `src/app` — Next.js App Router (thin `page.tsx` re-exports) plus providers, layout, global styles
- `src/pages` — page compositions (not the Next Pages Router)
- `src/widgets` — composite UI blocks
- `src/features` — user interactions
- `src/entities` — business models and entity UI
- `src/shared` — UI kit, lib, API helpers, config

Import only downward (pages → widgets → features → entities → shared). Each slice exposes a public `index.ts` with named exports (no `export *`). Import shadcn primitives as `@/shared/ui/button`. Prefer `@/` over `../../` and deeper when importing across slices; keep `./` and one-level `../` within the same slice.

Substantial type declarations live in a slice `type/` directory (e.g. `entities/video/type/`). Do not mix large type blocks into `utils/` or `model/`. Tiny local types such as component props may stay colocated.

A root `pages/README.md` exists so Next.js does not treat `src/pages` as the Pages Router.

## Data fetching

Client data fetching uses TanStack Query (poll list/status). Nest API base URL comes from `src/shared/api` (`apiUrl()`). Auth session uses `authFetch()` with `credentials: "include"`. Next middleware checks `GET /api/auth/me` via `AUTH_API_URL` (Compose: `http://backend:3001`).

**Hard rule:** do not call `useQuery` or `useInfiniteQuery` in pages or widgets. Each query lives in a dedicated hook under the owning entity or feature (`api/` or `model/`). Pages and widgets only consume those hooks. `usePlaybackPhrases`, `useVideos`, `useVideoStatus`, and `useSpeakingCalls` are the current examples. The same applies to mutations (`useRetryVideo`).

## Tech stack

- Next.js 14 App Router, React 18, TypeScript
- TanStack Query
- Vidstack (`@vidstack/react`) + dash.js for DASH playback
- shadcn-style UI primitives (manually wired)
- Tailwind CSS + Biome (lint/format)
- Vitest + React Testing Library (unit/component tests)

## UI / styling

- Prefer ready-made `src/shared/ui/*` before building custom controls.
- **Hard rule:** prioritize Tailwind theme tokens over hardcoded hex/rgb for colors and spacing.
- Theme tokens are defined in `:root` and mapped in `tailwind.config.js` (e.g. `background`, `foreground`, `card`, `border`, `muted-foreground`, `destructive`, `ring`).
- In TSX, use utilities (`bg-card`, `text-muted-foreground`, `gap-2`, `p-4`).
- Colocate CSS with components; do not dump styles into a single global file.
- In component CSS, use `@apply` with Tailwind utilities, or `hsl(var(--token))` when `@apply` is impractical.
- Use Tailwind spacing/radius scales instead of raw pixel values.
- Page-level theme overrides may redefine CSS variables; children should still use tokens.
- Tab icons are `public/icon-light.svg` and `public/icon-dark.svg` (same mark as `public/favicon.ico`), declared in root `metadata.icons` with `prefers-color-scheme` media queries.

## Testing

Stack: Vitest + React Testing Library + jsdom.

Run from `frontend/`:

- `npm run test` — single CI-style run
- `npm run test:watch` — watch mode during development

Conventions:

- Colocate tests as `*.test.ts` or `*.test.tsx` beside the source file.
- Utility tests: call pure functions directly; cover edge cases and invalid input.
- Component tests: use `render` from `@testing-library/react`, prefer role/text queries, and use `@testing-library/user-event` for clicks/typing.
- Assert behavior and accessibility, not implementation details (avoid testing internal state).
- Stub environment variables with `vi.stubEnv` and call `vi.unstubAllEnvs()` in `afterEach`.
- Mock Next.js modules (e.g. `next/link`) at the top of component test files when needed.

Example utility test: `src/shared/lib/format.test.ts`.
Example component test: `src/shared/ui/button.test.tsx`.

## Validation

From `frontend/`:

- **Hard rule:** before commit, `npm run lint:fix`
- **Hard rule:** `npm run typecheck && npm run lint && npm run test`

## Related docs

- Listening playback: [`listening.md`](listening.md)
- Speaking / LiveKit UI: [`speaking.md`](speaking.md)
- Auth / login: [`auth.md`](auth.md)
