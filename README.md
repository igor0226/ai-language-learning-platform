# Language Learning Platform

A language learning platform covering four core skills: **Writing**, **Listening**, **Speaking**, and **Reading**. Only **Listening** is implemented today; the other three skills are on the roadmap.

A **Next.js** UI and **Nest.js** backend run locally. The Listening skill uploads real-world video and returns a **longer, learner-friendly output** with burned-in subtitles, highlighted tricky phrases (idioms, collocations, hard grammar), and **short explanation inserts** that play right after the sentence containing each phrase. Playback is DASH (Vidstack + dash.js) of the *enriched* video, not the raw upload.

![Main page screenshot](readme/main.png)
![Task list](readme/task-list.png)

## Purpose

Help self-directed language learners build fluency across all four skills:

- **Listening** *(implemented)* — comprehension from real-world video with automated transcription, phrase detection, and AI-generated explanation inserts
- **Speaking** *(planned)* — live 1-on-1 conversational sessions with an AI language teacher (real-time captions, feedback, vocabulary tracking)
- **Writing** *(planned)* — guided essay and short-form composition with AI feedback
- **Reading** *(planned)* — leveled reading practice with comprehension support

### Local HTTPS setup

1. Install [mkcert](https://github.com/FiloSottile/mkcert): `brew install mkcert nss && mkcert -install`
2. Run `npm run dev:https-setup` — writes trusted certs to `certs/` and prints `/etc/hosts` lines
3. Add the hosts entries (requires sudo), then `docker compose up --build`

Caddy terminates TLS and routes:

- `https://app.llp-test.com` → Next.js
- `https://app.llp-test.com/api/*` → Nest (same origin; session cookies can live on `app.llp-test.com` for SSR auth later)
- `https://media.llp-test.com` → media WebSocket (LiveKit; required because an HTTPS page cannot use `ws://localhost`)

## Editor setup (VS Code / Cursor)

Both packages use [Biome](https://biomejs.dev/) for linting and formatting. Committed editor config lives in:

- `backend/.vscode/` — backend workspace settings + extension recommendations
- `frontend/.vscode/` — frontend workspace settings + extension recommendations

Open either a single package folder (`backend/` or `frontend/`) or the workspace file:

```bash
cursor backend/
# or
cursor language-learning-platform.code-workspace
```

When prompted, install the recommended **Biome** extension (`biomejs.biome`). The repo config then enables:

- Biome as the default formatter
- format on save
- safe Biome fixes on save

Each package uses its own Biome config (`biome.json`). Run `npm install` at the repo root before opening a package in the editor (workspaces hoist binaries).

CLI equivalents:

```bash
cd backend && npm run lint      # lint only
cd backend && npm run lint:fix  # format + lint fixes

cd frontend && npm run lint
cd frontend && npm run lint:fix
```
