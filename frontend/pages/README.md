This empty `pages` directory exists so Next.js does not treat `src/pages` as the Pages Router.

Application routes live in `src/app`. Feature-Sliced Design page compositions live in `src/pages`.

Because this root `pages/` directory exists, Next.js expects auth middleware at the project root (`frontend/middleware.ts`), not in `src/`.
