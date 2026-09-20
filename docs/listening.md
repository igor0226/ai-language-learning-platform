# Listening skill

## Product flow

1. Upload via Nest `POST /api/videos/upload` with source file and language settings → record created as `pending`.
2. Backend worker transcribes speech to text with word/segment timestamps.
3. AI analyzes the transcript and flags tricky phrases for language learners (`gpt-5.6-luna`).
4. AI generates brief explanations in the explanation language (included in phrase detection output for now).
5. Explanation text is converted to TTS audio and paired with simple text slides.
6. FFmpeg composes the enriched destination video: burned-in subtitles, phrase highlights, and explanation inserts (slide + TTS) spliced after target sentences.
7. Enriched video is packaged as DASH assets.
8. Status transitions: `pending → processing → ready|failed`.
9. Frontend polls Nest for list/status and plays ready videos from Nest DASH routes.

## Artifacts (S3/MinIO)

Target blob outputs (same key layout as the former repo-root `videos/` tree):

- `uploads/<videoId>/` — source upload
- `transcripts/<videoId>/transcript.json` — timed transcript (word/segment timestamps)
- `explanations/<videoId>/phrases.json` — detected tricky phrases (word indexes + explanations)
- `explanations/<videoId>/` — TTS audio clips, slide assets
- `enriched/<videoId>/` — composed destination video (pre-DASH)
- `dash/<videoId>/` — streamable DASH output (enriched video, not raw source)

Additional pipeline keys (see [`backend.md`](backend.md)):

- `audio/<videoId>/track.mp3` — extracted mono MP3 for transcription
- `explanations/<videoId>/clips.json` — manifest of rendered explanation clips
- `explanations/<videoId>/clips/<nnn>.speech.mp3|mp3|ass|mp4` — per-phrase TTS, combined audio, ASS subtitles, rendered clip
- `assets/listen-again/<language>.mp3` — cached per-language "Let's listen once again!" TTS
- `enriched/<videoId>/output.mp4` — composed destination video
- `enriched/<videoId>/playback-phrases.json` — playback phrase timings for the API

Video metadata lives in PostgreSQL. Legacy `videos/records/*.json` may still exist locally for one-time backfill only.

## Upload language fields

`POST /api/videos/upload` requires multipart fields:

- `sourceLanguage` — source language spoken in the video
- `explanationLanguage` — language for AI-generated explanations
- `languageLevel` — learner CEFR level (`A1`–`C2`, case-insensitive)

These are stored on the video record (Postgres) and passed into the phrase-detection prompt.

## Processing pipeline

Worker order for each pending video: **audio extract → Whisper transcribe → phrase detection → explanation clips → compose video → DASH transcode → ready**.

- `FfmpegAudioService` — extracts mono 16 kHz MP3 (`audio/<videoId>/track.mp3`); fails if no audio track
- `WhisperTranscriptionService` — OpenAI `whisper-1` with `verbose_json` + word timestamps; writes `transcripts/<videoId>/transcript.json`
- `PhraseDetectionService` — OpenAI `gpt-5.6-luna` with structured JSON output; writes `explanations/<videoId>/phrases.json`
- `ExplanationTtsService` — OpenAI `gpt-4o-mini-tts` for explanation narration audio; lazily caches per-language closing audio under `assets/listen-again/<language>.mp3`
- `ExplanationClipService` — FFmpeg slide clips with burned-in phrase title + explanation subtitles; concatenates cached localized "Let's listen once again!" audio (spoken + shown) after each clip's explanation (`explanations/<videoId>/clips/`)
- `FfmpegComposeService` — splices explanation clips after the sentence containing each phrase, fades source audio out over 700ms before each clip, then resumes playback from `sentenceStartSeconds` so the target sentence replays after the explanation; writes `enriched/<videoId>/output.mp4`
- `FfmpegDashService` — DASH packaging from the enriched video
- Files > 24 MB are split into ~10-minute chunks before transcription and merged with offset word timestamps
- `OPENAI_API_KEY` is required when the worker runs transcription, phrase detection, or explanation TTS
- Any step failure marks the video `failed` and records the failing step in history
- Completed steps are skipped on resume when their output files already exist
- Worker locking via `ProcessingLockService` (Postgres `processing_locks` table)

Processing steps tracked in history: `queued`, `audio_extract`, `transcribing`, `detecting_phrases`, `generating_clips`, `composing_video`, `dash_encoding`, `completed`, `failed`.

### Processing worker env

- `VIDEO_PROCESSING_CRON_ENABLED` — set to `false` to skip cron scheduling and the startup tick (used in tests and local API-only runs). Default: enabled (`true` in `.env.example`).
- `VIDEO_PROCESSOR_CRON` — cron expression for the worker loop (default every 15s).
- `CLIP_GENERATION_CONCURRENCY` — max number of explanation clips rendered in parallel per video (default `3`, minimum `1`).

### Guardrails

- Keep the worker idempotent and lock-safe (avoid duplicate processing).
- Return explicit failure reasons for processing errors.
- Do not break `VideoRecord` or entity schemas without TypeORM migrations.
- Never read or write pipeline blobs except through `BlobStorageService` (S3 keys). FFmpeg steps may use disposable local workspaces under `MEDIA_WORKSPACE_ROOT` via `MediaWorkspaceService`.

## Video API

All video and DASH HTTP routes require the session cookie (`llp.sid`). List, status, retry, playback-phrases, and DASH manifest/segment serving are scoped to the logged-in user's `userId` on the video record (`404` when missing or owned by another user). Upload stamps `userId` from the session.

- `GET /api/videos` — each item includes `processingStep`
- `GET /api/videos/:id/status` — adds `processingHistory` (full event log) plus `processingStep`
- `POST /api/videos/:id/retry` — retry a **failed** video; returns `409` for non-failed videos, `404` if missing

## Retry failed videos

`POST /api/videos/:id/retry`:

1. Validates `status === "failed"`
2. Reads the last failed resumable step from processing history in Postgres (`audio_extract`, `transcribing`, `detecting_phrases`, `generating_clips`, `composing_video`, or `dash_encoding`)
3. Clears object-storage artifacts for that step and any downstream steps (keeps upstream outputs so the worker skips completed work)
4. Appends a history event (`message: "retry requested"`) and sets `currentStep` to the resume step
5. Sets video record back to `pending` with `failureReason: null` — the cron worker picks it up on the next tick

## DASH (backend)

- Session-gated and owner-scoped like other video routes.
- Serve manifests at `/api/dash/<videoId>/manifest.mpd`.
- `DashService` rewrites served MPDs at read time to inject `<BaseURL>/api/dash/<videoId>/segment/</BaseURL>` before each `<SegmentTemplate>`; segment bytes are streamed from object storage through the backend.
- Preserve `manifest.mpd` route + `/segment/` asset path conventions.
- Automatic HTTP access logs skip DASH segment routes to avoid spam.

## Playback (frontend)

- Ready videos play from Nest `/api/dash/<videoId>/manifest.mpd` via `apiUrl(...)`.
- `PlayerPanel` loads dash.js with `import * as DASH from "dashjs"`, sets `provider.library = DASH`, and calls `setXHRWithCredentialsForType("default", true)` in `onProviderChange`.
- Use `key={videoId}` on `MediaPlayer` when switching task detail pages to avoid stale dash.js state.
- Do not reintroduce custom MSE/SourceBuffer playback; use Vidstack + dash.js.
