# Backend

Nest.js backend for the **Language Learning Platform**. Local dev: [`local-dev.md`](local-dev.md). Skill status: [`product.md`](product.md). Package hard rules: [`backend/AGENTS.md`](../backend/AGENTS.md).

## Modules

Nest.js app under `src/` with feature modules:

- `auth/` — Google OAuth + Postgres session cookie (`llp.sid`); `/api/auth/*` routes
- `videos/` — session-gated list/upload/status HTTP API (`videos.userId` owner scope)
- `speaking/` — AI teacher call HTTP API (create/end/status) + LiveKit token/room/dispatch + agent worker (`src/speaking/agent/`)
- `call-topics/` — session-gated CRUD for speaking discussion topics (shared catalog + sparse `user_call_topics` overlays)
- `vocabulary/` — session-gated CRUD for user vocabulary phrases (`user_vocabulary_phrases`)
- `processing/` — cron worker, jobs, FFmpeg DASH generation, audio extraction, Whisper transcription, phrase detection, explanation clip generation, video composition
- `dash/` — manifest rewrite + segment serving
- `storage/` — `BlobStorageService` (S3/MinIO object keys) + Postgres-backed repositories/services
- `models/` — TypeORM entity declarations (`Video`, `ProcessingHistory`, `ProcessingLock`, `TeacherCall`, `User`, `UserCallTopic`, `UserVocabularyPhrase`)
- `database/` — TypeORM wiring and migrations

`main.ts` sets Pino app logger, session middleware, Passport, CORS, global `api` prefix, port `3001`, shutdown hooks, and development-only `forceCloseConnections` so Compose watch restarts can unbind the port. Production HTTP shutdown waits for responses before closing dependencies. `/api/health/ready` checks database access and returns unavailable while draining. Workers start on boot only when their enable flags are true; deployment separation: [`deploy.md`](deploy.md#api-and-teacher-agent).

Module layout (`utils/`, `type/`): [`conventions.md`](conventions.md).

`@/` maps to `src/` (see [`tsconfig.json`](../backend/tsconfig.json) `paths`). Prefer `@/` over `../../` and deeper when importing from another module under `src/`; keep `./` and one-level `../` within the same module.

Speaking JSON fields are validated with Zod (`ZodValidationPipe` + schemas in `speaking/utils/http-schemas.ts`). Shared enums and schemas come from `@llp/contracts` — do not redeclare or re-export them here. Video upload stays on manual plain-text 400s.

Session-gated routes and owner scope: [`auth.md`](auth.md).

## Tech stack

- Nest.js + TypeScript
- SWC for Nest emit (`nest build` / `nest start`); `tsc --noEmit` for type checking (`npm run typecheck`, and forked in parallel on `start:dev`). Watch uses `--no-shell` so Nest CLI can kill the Node process on reload (avoids `EADDRINUSE` on `:3001` in Docker).
- Pino via `nestjs-pino` (pretty in non-production)
- PostgreSQL + TypeORM (`@nestjs/typeorm`, `typeorm`, `pg`)
- S3-compatible object storage via AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/lib-storage`); MinIO locally, AWS S3 in production
- FFmpeg for DASH generation and pipeline compositing (uses local temp workspaces under `MEDIA_WORKSPACE_ROOT`)
- `cron` for the background processing loop
- Biome (lint/format)

## PostgreSQL

Credentials come from env (see `backend/.env.example`):

- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `POSTGRES_AUTH_MODE` — `password` (default for local development) or `iam`. IAM mode requires verified TLS and `AWS_REGION`; it provides an async password callback to TypeORM and the session pool, generating a fresh RDS token for each new connection. Password rotation does not affect runtime IAM connections. Each process limits its session pool to five connections, separately from the ten-connection TypeORM pool. The session pool is closed after HTTP draining.
- `DB_MASTER_SECRET_ARN`, `PROVISION_RDS_IAM_USER` — used only by the separate migration entrypoint (`dist/database/migrate.js`), not runtime API/worker authentication. AWS provisioning and migration ownership: [`deploy.md`](deploy.md#managed-data).

In Docker Compose, backend uses `POSTGRES_HOST=postgres`. Host dev defaults to `localhost`.

For RDS, set `POSTGRES_SSL=true` and `POSTGRES_SSL_CA_PATH` to a mounted AWS RDS CA bundle. Certificate verification stays enabled. These settings apply to TypeORM, migrations, and the session store. Local Compose leaves TLS disabled. AWS infrastructure and credential handling: [`deploy.md`](deploy.md#managed-data).

**Tables** (see `src/models/`):

- `videos` — video metadata (`VideoRecord` fields, required `userId` FK to `users`)
- `teacher_calls` — speaking-skill AI teacher call records (`userId` FK to `users`)
- `user_call_topics` — sparse per-user speaking topic overlays (`custom` / `override` / `hidden`; composite PK `userId` + `topicId`, cascade delete)
- `user_vocabulary_phrases` — per-user vocabulary notebook entries (`userId` FK to `users`, cascade delete)
- `processing_history` — per-video step history (`currentStep`, `events` jsonb)
- `processing_locks` — legacy lock table retained for schema compatibility; workers now use session-scoped advisory locks instead of persistent rows

Domain types live in [`src/storage/type/`](../backend/src/storage/type). Entities mirror those types; ISO date/bigint transformers are in `src/models/utils/`.

**Migrations** (TypeORM CLI via `src/database/data-source.ts`):

```bash
npm run migration:run      # apply pending migrations
npm run migration:revert   # revert last migration
npm run migration:generate # generate from entity diff (rename output file)
npm run migration:create   # empty migration scaffold
```

**Tests** — unit/e2e suites that boot `AppModule` use `@testcontainers/postgresql` and a MinIO testcontainer (see `test/postgres-test-setup.ts`, `test/minio-test-setup.ts`). E2e global setup runs migrations before the suite. The container image is `alpine/minio` because community `quay.io/minio/minio` no longer allows anonymous pulls, and AIStor refuses S3 calls without a license. Unit-test global setup starts that container before Vitest collects files, so a failed pull shows up as “No test files found” plus a Docker error.

## Object storage (MinIO / S3)

Blob artifacts are stored in an S3-compatible bucket using the same object keys as the old on-disk layout. Configure via `backend/.env.example`:

- `S3_ENDPOINT` — MinIO URL locally (`http://localhost:9000` on host, `http://minio:9000` in Compose); omit for AWS S3
- `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `S3_FORCE_PATH_STYLE` — `true` for MinIO (default when `S3_ENDPOINT` is set)
- `MEDIA_WORKSPACE_ROOT` — local scratch dir for FFmpeg steps (download inputs → process → upload outputs) and temporary HTTP upload files under `http-uploads/`. Pipeline and upload writes stream to S3/MinIO via `BlobStorageService` (no full-file buffering in Node).

When no custom S3 keys or endpoint are set, the AWS SDK uses its default credential chain (including the EC2 instance role). Explicit keys must be supplied as a pair; `S3_SESSION_TOKEN` optionally accompanies temporary credentials. Local endpoints keep MinIO's development defaults. AWS buckets must already exist; startup only checks access and never creates a bucket or conceals an access error as a bucket-creation attempt.

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

## Scheduled work and locks

`AdvisoryLockService` holds a PostgreSQL session lock on a dedicated connection for the full scheduled operation. Video processing and stale-call cleanup use distinct cluster-wide lock keys, in addition to local overlap guards. Workers stop scheduling on shutdown and await the active operation before database teardown. The video tick holds its lock from job selection through completion. PostgreSQL releases advisory locks when the owning session ends, so crashes do not leave permanent locks. Existing legacy rows no longer block work. A mixed rollout with old row-lock workers must not run those old workers concurrently with new advisory-lock workers.

Loss of an active scheduled-operation lock connection terminates the worker process before it can continue publishing results without the lock. PostgreSQL/transport detection is not instantaneous. These are cooperative locks, not an exactly-once queue: network partitions and external side effects still require idempotent pipeline behavior. Database failover releases session locks; interrupted processing is resumed from durable artifacts. Stale-call cleanup uses an atomic active-status condition so a concurrent terminal update is preserved.

## Logging

- Override level with `LOG_LEVEL` (default `debug` non-prod, `info` prod).
- Automatic HTTP access logs skip DASH segment routes to avoid spam.

## Related docs

- Listening pipeline, video API, retry, DASH: [`listening.md`](listening.md)
- Speaking / LiveKit / agent: [`speaking.md`](speaking.md)
- Auth / OAuth: [`auth.md`](auth.md)
