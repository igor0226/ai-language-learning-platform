# Product

Build a language learning platform that helps self-directed learners acquire fluency across four core skills:

- **Listening** *(implemented)* — comprehension from real-world video with automated transcription, phrase detection, and AI-generated explanation inserts
- **Speaking** *(planned)* — live 1-on-1 conversational sessions with an AI language teacher (real-time captions, feedback, vocabulary tracking)
- **Writing** *(planned)* — guided essay and short-form composition with AI feedback
- **Reading** *(planned)* — leveled reading practice with comprehension support

Only **Listening** is built today. The other three skills are on the roadmap.

## Language inputs (Listening uploads)

Selected per upload:

- **Video language** — the source language spoken in the upload (`sourceLanguage` on upload).
- **Explanation language** — the language for AI-generated explanations and TTS narration (`explanationLanguage` on upload).
- **Language level** — the learner's CEFR level (`A1`–`C2`, `languageLevel` on upload); drives phrase-detection difficulty filtering.

## Target scenario

A learner uses the platform to practice all four skills. Today, only the Listening skill is available:

**Listening (implemented):** A user uploads a video and selects the video language and explanation language. The pipeline transcribes the speech, identifies learner-relevant phrases, and uses AI to write short explanations in the explanation language. Each explanation is turned into TTS audio and paired with a simple text slide. FFmpeg composes the **destination video**: original footage with burned-in subtitles and phrase highlights, plus explanation inserts (text slide + TTS) appended after each target sentence ends. The enriched video is longer than the original. The user watches it in the app via DASH playback.

**Speaking (planned):** Live 1-on-1 simulated conversational sessions with an AI language teacher featuring real-time captioning, conversational feedback, and interactive vocabulary tracking.

**Writing (planned):** Guided essay and short-form composition feedback.

**Reading (planned):** Leveled reading practice with comprehension support.

## Architecture

- `frontend/` — Next.js UI (workspace package)
- `backend/` — Nest.js API + processing worker (workspace package)
- `packages/contracts` — shared Zod schemas/types (`@llp/contracts`)
- `videos/` — legacy on-disk data (optional one-time migration source into MinIO)
- `compose.yaml` — Docker Compose dev stack (frontend + backend, hot reload)
- Root `package.json` — npm workspaces, husky/commitlint, and `npm run dev` (`docker compose up`)

## Skills

| Skill | Status | Target routes | Current modules |
|---|---|---|---|
| **Listening** | Implemented | `/listening`, `/listening/upload`, `/listening/:videoId` | `videos/`, `processing/`, `dash/`, `storage/` |
| **Speaking** | Implemented (server) | `/speaking`, `/speaking/call/:callId` | `speaking/` (Nest) + LiveKit agent worker |
| **Writing** | Planned | `/writing` | — (composition feedback TBD) |
| **Reading** | Planned | `/reading` | — (reading practice TBD) |
| **Dashboard** | Planned | `/dashboard` | — (cross-skill analytics TBD) |

Today's frontend routes (`/`, `/tasks/new`, `/tasks/[id]`) implement the Listening skill and will migrate to `/listening/*`.

## Tech stack

- npm workspaces (`frontend/`, `backend/`, `packages/contracts`); install from the repo root (`npm install` / `npm ci`)
- Frontend: Next.js under `frontend/`
- Backend: Nest.js under `backend/`
- Local dev: Docker Compose (`compose.yaml`)

The browser calls Nest directly (no Next.js API proxy).
