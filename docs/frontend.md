# Frontend

Next.js frontend for the **Language Learning Platform**. Local dev: [`local-dev.md`](local-dev.md). Skill status and roadmap: [`product.md`](product.md). Package hard rules: [`frontend/AGENTS.md`](../frontend/AGENTS.md).

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

- `/login` — Google sign-in (only public UI route; see [`auth.md`](auth.md))
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

Import only downward (pages → widgets → features → entities → shared). Each slice exposes a public `index.ts` with named exports (no `export *`). Import shadcn primitives as `@/shared/ui/button`. Prefer `@/` over `../../` and deeper when importing across slices; keep `./` and one-level `../` within the same slice. File layout (`utils/`, `type/`): [`conventions.md`](conventions.md).

A root `pages/README.md` exists so Next.js does not treat `src/pages` as the Pages Router.

## Data fetching

Client data fetching uses TanStack Query (poll list/status). Nest API base URL comes from `src/shared/api` (`apiUrl()`). Session-gated API calls use `authFetch()` with `credentials: "include"` (see [`auth.md`](auth.md)). Video upload uses `XMLHttpRequest` with `withCredentials: true`. DASH playback uses `apiUrl()` for the manifest `src` and dash.js `setXHRWithCredentialsForType("default", true)` in `onProviderChange` so manifest and segment requests include the session cookie. UI route gate and middleware: [`auth.md`](auth.md).

TanStack Query hook placement and Zustand rules: [`frontend/AGENTS.md`](../frontend/AGENTS.md). Examples: `usePlaybackPhrases`, `useVideos`, `useVideoStatus`, `useSpeakingCalls`, `useVocabularyPhrases`, `useRetryVideo`.

**SSR list prefetch:** `/listening` and `/speaking` are async App Router pages that prefetch into a TanStack Query cache on the server (`HydrationBoundary`), then hydrate the existing client hooks. Listening prefetches `GET /api/videos`; speaking prefetches topics and call history (session-scoped keys, same pattern as videos) so the first paint shows table rows instead of skeleton loaders.

**Client errors:** React Query and upload XHR failures surface as Sonner toasts via global `QueryCache` / `MutationCache` handlers in `src/app/providers.tsx` (`notifyClientError`). The login OAuth redirect error stays an in-page `Alert`. Videos and speaking-calls tables show skeleton loading rows and a simple “Couldn’t load data.” placeholder when the first fetch fails; cached rows stay visible if a later poll fails.

## Tech stack

- Next.js 14 App Router, React 18, TypeScript
- TanStack Query
- Zustand (global client UI state only; not server/cache data)
- Vidstack (`@vidstack/react`) + dash.js for DASH playback
- shadcn-style UI primitives (manually wired)
- Tailwind CSS + Biome (lint/format)
- Vitest + React Testing Library (unit/component tests)

## UI / styling

- Do not nest ternary operators in JSX or render helpers; use early returns or a small helper function (see [`conventions.md`](conventions.md)).
- Prefer ready-made `src/shared/ui/*` before building custom controls.
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

## Related docs

- Listening playback: [`listening.md`](listening.md)
- Speaking / LiveKit UI: [`speaking.md`](speaking.md)
- Auth / login: [`auth.md`](auth.md)
