# Conventions

## Shared contracts

**Hard rule:** Shared wire types, enums, and Zod schemas live only in [`packages/contracts`](../packages/contracts). Frontend and backend import them from `@llp/contracts`. Do not redeclare or re-export those contracts in app modules. If a new consumer needs the same values, extend that package.

## Code organization

- Keep files under 300 lines. If not possible, ask.
- Keep functions under 50 lines. If not possible, ask.
- Store module-bound utility functions under a `utils/` directory; do not blend them with business logic files.

Backend: each Nest module has its own `utils/` (e.g. `storage/utils/`, `videos/utils/`, `processing/utils/`).

## Communication

**Hard rule:** Ask questions if something from the user's instruction seems not clear enough.

## AI services (Listening)

- **Transcription:** Whisper (or equivalent) for speech-to-text with timed word/segment output.
- **Phrase analysis + explanations:** LLM (e.g. OpenAI) to flag idioms, collocations, and grammatically tricky phrases and generate learner explanations in the explanation language.
- **TTS:** explanation text is spoken via TTS (provider TBD); locale follows the explanation language.
- **Language params** travel with the upload record and drive prompt and TTS locale selection.
