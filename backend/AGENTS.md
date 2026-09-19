# Backend Agent Notes

Nest.js backend for the **Language Learning Platform**. Read parent [`AGENTS.md`](../AGENTS.md) first. Detailed docs: [`docs/README.md`](../docs/README.md).

Run with Docker Compose from repo root; see [`docs/local-dev.md`](../docs/local-dev.md). Never run `docker compose down -v`.

## Hard rules (always)

- Never read or write pipeline blobs except through `BlobStorageService`. FFmpeg steps use `MediaWorkspaceService` temp dirs.
- Do not change frontend files without asking the user first.
- Functions must not receive more than 2 parameters; group extras in an object.
- Before commit: `npm run lint:fix`
- Before commit: `npm run typecheck && npm run lint && npm run test && npm run test:e2e`

## Read next

See in the parent [`AGENTS.md`](../AGENTS.md).

## Doc maintenance

See in the parent [`AGENTS.md`](../AGENTS.md).
