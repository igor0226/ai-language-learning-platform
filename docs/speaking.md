# Speaking skill

Live 1-on-1 AI teacher calls via self-hosted LiveKit (`livekit` in Compose) plus a Node agent worker (`teacher-agent` in Compose, `npm run start:agent:dev`).

## Backend API

- `POST /api/speaking/calls` — session auth; creates a `teacher_calls` row for the logged-in user, LiveKit room, agent dispatch, and participant token. Optional `topic` string is forwarded only in agent dispatch metadata (not stored). Returns `{ callId, roomName, token, livekitUrl }`.
- `GET /api/speaking/calls` — owner-scoped history for the session user (`id`, status, languages, timestamps, `durationSeconds`). Omits topic, fluency, and LiveKit internals.
- `GET /api/speaking/calls/:id` — owner-scoped call status.
- `POST /api/speaking/calls/:id/end` — owner-scoped end; deletes the LiveKit room and marks the call `ended`.
- `POST /api/speaking/livekit/webhook` — LiveKit `room_finished` / `participant_left` reconciliation.
- Stale-call cron (`StaleCallWorkerService`) marks leftover `active` calls as `failed` (`endedReason: stale_room_missing`) when they are older than the grace period and the LiveKit room is gone.
- Agent publishes teacher audio into the room and emotion JSON on data topic `teacher-emotion` (`source: "reply" | "reaction"`).

Speaking JSON/query fields are validated with Zod (`ZodValidationPipe` + schemas in `speaking/utils/http-schemas.ts`). Shared enums and schemas come from `@llp/contracts`.

## Backend env

- `LIVEKIT_URL` (browser-facing)
- `LIVEKIT_API_URL` (Nest Room/Dispatch API, defaults to `http` form of `LIVEKIT_URL`)
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- `SPEAKING_AGENT_NAME`, `SPEAKING_TEACHER_MODEL`, `SPEAKING_TEACHER_VOICE`
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
- Transcript still uses fixtures. Saved vocabulary is stored in the browser (`language_studio_vocabulary_v1`) via the global **Vocabulary Notebook** sheet (header button on non-call routes). The in-call saved-phrases panel reads and writes the same list.
- Discussion topics on `/speaking` can be created, edited, and deleted (custom topics only for delete). The full topic list is persisted locally (`language_studio_custom_topics_v1`). The live call page resolves `?topic=` against that list so edited or custom scenarios reach the agent prompt.

Media signaling uses `wss://media.llp-test.com` in Compose. See [`local-dev.md`](local-dev.md).
