FROM node:24-bookworm-slim

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /repo

COPY package.json package-lock.json ./
COPY packages/contracts packages/contracts
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci -w backend --include-workspace-root

COPY backend backend

WORKDIR /repo/backend

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
