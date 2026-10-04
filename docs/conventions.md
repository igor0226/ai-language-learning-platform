# Conventions

## Shared contracts

Shared wire types, enums, and Zod schemas: root [`AGENTS.md`](../AGENTS.md) hard rules and [`packages/contracts`](../packages/contracts). If a new consumer needs the same values, extend that package.

**Build before downstream typecheck:** `@llp/contracts` publishes `main` / `types` from `dist/`. Its own `npm run typecheck` and `npm run test` use `src/` and can pass while backend or frontend still fail with missing exports. After changing contracts, run from the repo root:

```bash
npm run build -w @llp/contracts
```

Then run `typecheck` in `backend/` or `frontend/`. Docker Compose images pick up contract changes on rebuild; see [`local-dev.md`](local-dev.md).

## Code organization

- Keep files under 300 lines. If not possible, ask.
- Keep functions under 50 lines. If not possible, ask.
- Store module-bound utility functions under a `utils/` directory; do not blend them with business logic files.
- Store substantial type declarations under a `type/` directory next to the owning module or slice. Do not put type-only files or large type blocks in `utils/`. Tiny local types (component props, a one-function input) may stay colocated.

Backend: each Nest module has its own `utils/` and, when types take space, `type/` (e.g. `storage/type/`, `speaking/type/`, `videos/type/`).

Frontend: entity/slice types that occupy space live in `type/` (e.g. `entities/video/type/`), not in `utils/` or mixed into `model/` type dumps.

## Constants

Module-level immutable values (strings, numbers, arrays, objects, class-name tokens) use `UPPER_SNAKE_CASE`. Functions, hooks, React components/contexts, Next.js `metadata` / `viewport`, and mutable module state keep their usual names.

## Control flow in UI code

- Do not nest ternary operators (`a ? b : c ? d : e`). Use `if`/`else`, early returns, or a small helper instead.
- A single ternary for a simple binary choice is fine (e.g. `checked ? "yes" : "no"`).

## AI services (Listening)

- **Transcription:** Whisper (or equivalent) for speech-to-text with timed word/segment output.
- **Phrase analysis + explanations:** LLM (e.g. OpenAI) to flag idioms, collocations, and grammatically tricky phrases and generate learner explanations in the explanation language.
- **TTS:** explanation text is spoken via TTS (provider TBD); locale follows the explanation language.
- **Language params** travel with the upload record and drive prompt and TTS locale selection.
