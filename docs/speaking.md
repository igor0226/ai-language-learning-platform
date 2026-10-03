# Speaking skill

Live 1-on-1 AI teacher calls via self-hosted LiveKit (`livekit` in Compose) plus a Node agent worker (`teacher-agent` in Compose, `npm run start:agent:dev`).

## Backend API

- `POST /api/speaking/calls` — session auth; creates a `teacher_calls` row for the logged-in user, LiveKit room, agent dispatch, and participant token. Optional `topic` string is forwarded only in agent dispatch metadata (not stored). Returns `{ callId, roomName, token, livekitUrl }`.
- `GET /api/speaking/calls` — owner-scoped history for the session user (`id`, status, languages, timestamps, `durationSeconds`). Omits topic, fluency, and LiveKit internals.
- `GET /api/speaking/calls/:id` — owner-scoped call status.
- `POST /api/speaking/calls/:id/end` — owner-scoped end; deletes the LiveKit room and marks the call `ended`.
- `POST /api/speaking/livekit/webhook` — LiveKit `room_finished` / `participant_left` reconciliation.
- Stale-call cron (`StaleCallWorkerService`) marks leftover `active` calls as `failed` (`endedReason: stale_room_missing`) when they are older than the grace period and the LiveKit room is gone.
- Agent publishes teacher audio into the room, emotion JSON on data topic `teacher-emotion` (`source: "reply" | "reaction"`), and new vocabulary on `teacher-vocabulary` after a successful deck add. `set_emotion` returns `{ ok: true }` immediately and publishes that emotion in the background. A failed publish is logged and does not change the spoken reply.
- Spoken turns, including the greeting, are at most 1–2 short sentences (maximum 20–25 spoken words). The teacher does not give grammar lectures or long explanations.
- Each turn asks at most one question. The teacher does not combine questions with "and", "also", or "or", and waits after asking.
- When the learner makes a mistake, that turn is only a one-sentence correction plus an immediate repeat prompt. The next conversational question waits until the following turn, after a brief praise once the learner repeats the correction.
- The teacher says "I'm adding it to your deck now." only after `add_vocabulary` returns `{ status: "adding" }`. It does not say that line for any other status, and a turn that only calls `set_emotion` does not save a phrase. The tool returns immediately and the worker saves in the background, leaves the session instructions unchanged, updates the in-memory deck, and publishes `teacher-vocabulary` after a successful save.

### Agent API (teacher worker)

Bearer-only routes under `/api/agent/*` for the LiveKit teacher worker (not the browser session). Auth: [`auth.md`](auth.md). Caddy returns `404` for `/api/agent/*` on the public app origin; the worker calls Nest on the Compose network (`SPEAKING_API_URL`).

- `GET /api/agent/speaking/calls/:callId/vocabulary` — `{ phrases: VocabularyPhrase[] }` for the call owner
- `POST /api/agent/speaking/calls/:callId/vocabulary` — body `{ term, cefr, definition, exampleSentence? }`; returns `{ status: "added", phrase }` or `{ status: "already_in_deck", term }` (duplicate check is case-insensitive on `term`). `cefr` is the item’s own level (A1–C2), not the session level.

Speaking JSON/query fields are validated with Zod (`ZodValidationPipe` + schemas in `speaking/utils/http-schemas.ts`). Shared enums and schemas come from `@llp/contracts`.

### Call topics API

Owner-scoped discussion scenarios for the speaking launcher. Presets live once in code (`call-topics/default-call-topics.ts`); per-user rows in `user_call_topics` are sparse overlays only (`custom`, `override`, `hidden`) so untouched defaults are not copied per user. Request/response shapes and Zod schemas: `@llp/contracts` (`callTopicSchema`, `createCallTopicBodySchema`, `updateCallTopicBodySchema`).

- `GET /api/speaking/topics` — `{ topics: CallTopic[] }`; new users see three catalog presets with zero DB rows (custom topics first, then catalog order)
- `POST /api/speaking/topics` — create custom topic; body `{ title, level, description, suggestedDurationMins? }` (duration defaults to 15); returns `CallTopic` (`201`)
- `PATCH /api/speaking/topics/:id` — partial update; at least one field required; catalog edits store an `override` snapshot; reverting to catalog text removes the override row; `404` if not in the user's library
- `DELETE /api/speaking/topics/:id` — `204`; deletes custom rows or tombstones a catalog preset for that user only; `404` if missing or already hidden

### Vocabulary notebook API

Owner-scoped phrases for the logged-in user (`user_vocabulary_phrases`). Request/response shapes and Zod schemas: `@llp/contracts` (`vocabularyPhraseSchema`, `createVocabularyPhraseBodySchema`, `updateVocabularyPhraseBodySchema`).

- `GET /api/vocabulary/phrases` — `{ phrases: VocabularyPhrase[] }`, newest `savedAt` first
- `POST /api/vocabulary/phrases` — create; body `{ term, cefr, definition, exampleSentence?, savedAt? }`; returns `VocabularyPhrase`
- `PATCH /api/vocabulary/phrases/:id` — partial update; at least one field required; `404` if missing or not owned
- `DELETE /api/vocabulary/phrases/:id` — `204`; `404` if missing or not owned

## Backend env

- `LIVEKIT_URL` (browser-facing)
- `LIVEKIT_API_URL` (Nest Room/Dispatch API, defaults to `http` form of `LIVEKIT_URL`)
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- `SPEAKING_AGENT_NAME`, `SPEAKING_TEACHER_MODEL`, `SPEAKING_TEACHER_VOICE`
- `SPEAKING_API_URL` — Nest base URL for the teacher worker (Compose: `http://backend:3001`)
- `SPEAKING_INTERNAL_API_SECRET` — shared bearer secret for `/api/agent/*` (must match on backend and `teacher-agent`)
- `SPEAKING_CALL_TOKEN_TTL`, `SPEAKING_EMPTY_ROOM_TIMEOUT_SECONDS`, `SPEAKING_REACTION_DEBOUNCE_MS`
- `SPEAKING_STT_MODEL` — streaming STT for user transcripts and interruption word-count gating (default `gpt-4o-mini-transcribe`). Realtime model turn detection is disabled; client VAD drives turns instead.
- `SPEAKING_VAD_ACTIVATION_THRESHOLD` — Silero VAD activation threshold, 0–1 (default `0.65`; higher ignores quieter coughs).
- `SPEAKING_VAD_MIN_SPEECH_MS` — minimum sustained speech in ms before VAD reports user speech (default `400`).
- `SPEAKING_INTERRUPT_MIN_WORDS` — minimum transcribed user words before the teacher yields (default `3`).
- `SPEAKING_INTERRUPT_MIN_DURATION_MS` — minimum user speech duration in ms before mid-reply interruption (default `1500`).
- `SPEAKING_STALE_CALL_CRON_ENABLED` — set to `false` to skip stale-call cron and the startup tick (used in tests). Default: enabled (`true` in `.env.example`).
- `SPEAKING_STALE_CALL_CRON` — cron expression for the stale-call sweep (default every minute).
- `SPEAKING_STALE_CALL_GRACE_SECONDS` — ignore `active` calls younger than this (default `120`) so create/setup is not raced.

## Frontend (LiveKit)

Routes:

- `/speaking` — call launcher + history
- `/speaking/call/[callId]` — live AI teacher call (LiveKit)

Call flow:

- Start a call from `/speaking`; the call page `POST`s Nest `/api/speaking/calls` via `authFetch()` with `sourceLanguage`/`explanationLanguage` `"English"`, `languageLevel` parsed from the topic (first CEFR token), and a `topic` string (`title` + `description`) for the agent prompt only. `/speaking` loads history from `GET /api/speaking/calls` (session-scoped).
- The response `{ callId, token, livekitUrl }` is used with `livekit-client` `Room.connect`. The browser publishes the microphone and plays the agent's remote audio track.
- Compose LiveKit must be **v1.9.11+** (repo uses `livekit/livekit-server:v1.13.6`). `livekit-client` 2.17+ connects via `/rtc/v1`; older servers only expose `/rtc` and the browser shows `404 /rtc/v1/validate`.
- End call `POST`s `/api/speaking/calls/:id/end` then returns to `/speaking`.
- Teacher facial emotions arrive on the LiveKit data topic `teacher-emotion` (`{ emotion, intensity?, source }`). The live call applies them to `TeacherFace` as SVG root classes (`emotion-*`, `intensity-*`; intensity defaults to `1`). Speech visemes (`speech-quiet|normal|loud`) come from an `AnalyserNode` on the teacher's LiveKit `MediaStream` (RMS 0–100), not from the emotion payload. The launcher and connecting views keep `staticMotion`.
- Transcript still uses fixtures. The vocabulary notebook (app shell drawer) loads and mutates phrases via `/api/vocabulary/phrases` (session cookie). During a live call the teacher agent adds phrases via `/api/agent/speaking/calls/:callId/vocabulary`; the client shows a Sonner toast and refetches the notebook when it receives `teacher-vocabulary` on the LiveKit data channel. The live call side panel stays read-only (no manual POST from the call UI). Wire types and Zod schemas live in `@llp/contracts` (`VocabularyPhrase`, `TeacherVocabularyMessage`, agent add schemas).
- Discussion topics on `/speaking` load and mutate via `GET/POST/PATCH/DELETE /api/speaking/topics` (session cookie). Delete control in the UI is shown only for custom topics; the API also supports hiding catalog presets. The live call page resolves `?topic=` against the same fetched list so edited or custom scenarios reach the agent prompt.

Media signaling uses `wss://media.llp-test.com` in Compose. See [`local-dev.md`](local-dev.md).
