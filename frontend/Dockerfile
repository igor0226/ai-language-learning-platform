FROM node:24-bookworm-slim

WORKDIR /repo

COPY package.json package-lock.json ./
COPY packages/contracts packages/contracts
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci -w frontend --include-workspace-root

COPY frontend frontend

WORKDIR /repo/frontend

EXPOSE 3000

CMD ["npm", "run", "dev"]
