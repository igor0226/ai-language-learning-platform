# Backend Agent Notes

Nest.js backend for the **Language Learning Platform**. Read parent [`AGENTS.md`](../AGENTS.md) first. Topic docs and authoring rules: [`docs/README.md`](../docs/README.md).

## Hard rules (always)

- Never read or write pipeline blobs except through `BlobStorageService`. FFmpeg steps use `MediaWorkspaceService` temp dirs.
- Do not change frontend files without asking the user first.
- Functions must not receive more than 2 parameters; group extras in an object.
- If this task touched `packages/contracts`, from repo root first: `npm run build -w @llp/contracts`.
- Before commit (in `backend/`): `npm run lint:fix && npm run typecheck && npm run lint && npm run test && npm run test:e2e` — do not run `typecheck` on backend until contracts are rebuilt when exports changed.
- Agent Shell: backend Vitest/e2e need full permissions — see [`docs/local-dev.md`](../docs/local-dev.md#cursor-agent-shell).
