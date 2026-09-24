# Conventions

## Shared contracts

**Hard rule:** Shared wire types, enums, and Zod schemas live only in [`packages/contracts`](../packages/contracts). Frontend and backend import them from `@llp/contracts`. Do not redeclare or re-export those contracts in app modules. If a new consumer needs the same values, extend that package.

## Code organization

- Keep files under 300 lines. If not possible, ask.
- Keep functions under 50 lines. If not possible, ask.
- Store module-bound utility functions under a `utils/` directory; do not blend them with business logic files.
- Store substantial type declarations under a `type/` directory next to the owning module or slice. Do not put type-only files or large type blocks in `utils/`. Tiny local types (component props, a one-function input) may stay colocated.

Backend: each Nest module has its own `utils/` and, when types take space, `type/` (e.g. `storage/type/`, `speaking/type/`, `videos/type/`).

Frontend: entity/slice types that occupy space live in `type/` (e.g. `entities/video/type/`), not in `utils/` or mixed into `model/` type dumps.

## Control flow in UI code

- Do not nest ternary operators (`a ? b : c ? d : e`). Use `if`/`else`, early returns, or a small helper instead.
- A single ternary for a simple binary choice is fine (e.g. `checked ? "yes" : "no"`).

## Communication

**Hard rule:** Ask questions if something from the user's instruction seems not clear enough.

## AI services (Listening)

- **Transcription:** Whisper (or equivalent) for speech-to-text with timed word/segment output.
- **Phrase analysis + explanations:** LLM (e.g. OpenAI) to flag idioms, collocations, and grammatically tricky phrases and generate learner explanations in the explanation language.
- **TTS:** explanation text is spoken via TTS (provider TBD); locale follows the explanation language.
- **Language params** travel with the upload record and drive prompt and TTS locale selection.
