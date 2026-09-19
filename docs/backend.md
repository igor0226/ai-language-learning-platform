# Backend

Nest.js backend for the **Language Learning Platform**. Today's modules implement the **Listening** skill (video upload, transcription, phrase detection, explanation clips, video composition, DASH playback). Planned modules will add Speaking (WebRTC signaling and session persistence), Writing (composition feedback), and Reading (comprehension practice).

Run the app with Docker Compose from the repo root (`docker compose up --build`); see [`local-dev.md`](local-dev.md). Compose starts **postgres**, **minio**, **backend**, and **frontend**. FFmpeg is in the backend image when using Compose. The backend runs migrations on boot (`npm run migration:run`) before `start:dev`. Never run `docker compose down -v` (it wipes `postgres_data` and `minio_data`).

## Modules

Nest.js app under `src/` with feature modules:

- `auth/` — Google OAuth + Postgres session cookie (`llp.sid`); `/api/auth/*` routes
- `videos/` — list/upload/status HTTP API
- `speaking/` — AI teacher call HTTP API (create/end/status) + LiveKit token/room/dispatch + agent worker (`src/speaking/agent/`)
- `processing/` — cron worker, jobs, FFmpeg DASH generation, audio extraction, Whisper transcription, phrase detection, explanation clip generation, video composition
- `dash/` — manifest rewrite + segment serving
- `storage/` — `BlobStorageService` (S3/MinIO object keys) + Postgres-backed repositories/services
- `models/` — TypeORM entity declarations (`Video`, `ProcessingHistory`, `ProcessingLock`, `TeacherCall`, `User`)
- `database/` — TypeORM wiring, migrations, backfill script

`main.ts` sets Pino app logger, session middleware, Passport, CORS, global `api` prefix, port `3001`. Worker starts on boot via `ProcessingWorkerService` (`OnModuleInit`) and polls about every 15s.

Store module-bound utility functions under each module's `utils/` directory (e.g. `storage/utils/`, `videos/utils/`, `processing/utils/`). Do not blend helpers into service files. Store substantial type declarations under `type/` (e.g. `storage/type/`, `speaking/type/`). Do not keep type-only files in `utils/`.

`@/` maps to `src/` (see [`tsconfig.json`](../backend/tsconfig.json) `paths`). Prefer `@/` over `../../` and deeper when importing from another module under `src/`; keep `./` and one-level `../` within the same module.

Speaking JSON/query fields are validated with Zod (`ZodValidationPipe` + schemas in `speaking/utils/http-schemas.ts`). Shared enums and schemas come from `@llp/contracts` — do not redeclare or re-export them here. Video upload stays on manual plain-text 400s.

## Tech stack

- Nest.js + TypeScript
- SWC for Nest emit (`nest build` / `nest start`); `tsc --noEmit` for type checking (`npm run typecheck`, and forked in parallel on `start:dev`)
- Pino via `nestjs-pino` (pretty in non-production)
- PostgreSQL + TypeORM (`@nestjs/typeorm`, `typeorm`, `pg`)
- S3-compatible object storage via AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/lib-storage`); MinIO locally, AWS S3 in production
- FFmpeg for DASH generation and pipeline compositing (uses local temp workspaces under `MEDIA_WORKSPACE_ROOT`)
- `cron` for the background processing loop
- Biome (lint/format)

## PostgreSQL

Credentials come from env (see `backend/.env.example`):

- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

In Docker Compose, backend uses `POSTGRES_HOST=postgres`. Host dev defaults to `localhost`.

**Tables** (see `src/models/`):

- `videos` — video metadata (`VideoRecord` fields)
- `processing_history` — per-video step history (`currentStep`, `events` jsonb)
- `processing_locks` — worker concurrency guard (row insert = acquire, PK = one lock per video)
- `teacher_calls` — speaking-skill AI teacher call records (`TeacherCallRecord` fields)

Domain types live in [`src/storage/type/`](../backend/src/storage/type). Entities mirror those types; ISO date/bigint transformers are in `src/models/utils/`.

**Migrations** (TypeORM CLI via `src/database/data-source.ts`):

```bash
npm run migration:run      # apply pending migrations
npm run migration:revert   # revert last migration
npm run migration:generate # generate from entity diff (rename output file)
npm run migration:create   # empty migration scaffold
```

**Legacy backfill** — one-time import of old JSON metadata into Postgres:

```bash
npm run db:backfill
```

Reads legacy `videos/records/*.json` and `videos/history/*.json` from the repo-root `videos/` directory (or `STORAGE_ROOT` if set), applies legacy defaults for missing language fields, and inserts into Postgres. Safe to re-run only if tables are empty/truncated.

**Tests** — unit/e2e suites that boot `AppModule` use `@testcontainers/postgresql` and a MinIO testcontainer (see `test/postgres-test-setup.ts`, `test/minio-test-setup.ts`). E2e global setup runs migrations before the suite.

## Object storage (MinIO / S3)

Blob artifacts are stored in an S3-compatible bucket using the same object keys as the old on-disk layout. Configure via `backend/.env.example`:

- `S3_ENDPOINT` — MinIO URL locally (`http://localhost:9000` on host, `http://minio:9000` in Compose); omit for AWS S3
- `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `S3_FORCE_PATH_STYLE` — `true` for MinIO (default when `S3_ENDPOINT` is set)
- `MEDIA_WORKSPACE_ROOT` — local scratch dir for FFmpeg steps (download inputs → process → upload outputs)

Object keys (unchanged from the former filesystem layout):

- `uploads/<videoId>/<source-file>`
- `dash/<videoId>/manifest.mpd` + segments
- `audio/<videoId>/track.mp3` — extracted mono MP3 for transcription
- `transcripts/<videoId>/transcript.json` — Whisper verbose JSON (word timestamps)
- `explanations/<videoId>/phrases.json` — detected tricky phrases with word indexes and explanations
- `explanations/<videoId>/clips.json` — manifest of rendered explanation clips
- `explanations/<videoId>/clips/<nnn>.speech.mp3|mp3|ass|mp4` — per-phrase TTS, combined audio, ASS subtitles, rendered clip
- `assets/listen-again/<language>.mp3` — cached per-language "Let's listen once again!" TTS
- `enriched/<videoId>/output.mp4` — composed destination video
- `enriched/<videoId>/playback-phrases.json` — playback phrase timings for the API

Metadata (`VideoRecord`, processing history, worker locks) is in **PostgreSQL**.

## Logging

- Override level with `LOG_LEVEL` (default `debug` non-prod, `info` prod).
- Automatic HTTP access logs skip DASH segment routes to avoid spam.

## Validation

From `backend/`:

- **Hard rule:** Never read or write pipeline blobs except through `BlobStorageService`. FFmpeg steps use `MediaWorkspaceService` temp dirs. Tests may seed objects via `BlobStorageService`.
- **Hard rule:** if you see that the changes suggested by the user may require changing the frontend files as well, never change them without asking for the user's permission.
- **Hard rule:** functions should not receive more than 2 parameters. If the function's logic requires so, pass the paramaters grouped in an object.
- **Hard rule:** before commit, `npm run lint:fix`
- **Hard rule:** `npm run typecheck && npm run lint && npm run test && npm run test:e2e`

## Related docs

- Listening pipeline, video API, retry, DASH: [`listening.md`](listening.md)
- Speaking / LiveKit / agent: [`speaking.md`](speaking.md)
- Auth / OAuth: [`auth.md`](auth.md)
