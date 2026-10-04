FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json tsconfig.json tsup.config.ts ./
COPY bin ./bin
COPY src ./src
COPY fixtures/playground ./fixtures/playground
COPY scripts/playground ./scripts/playground
COPY packages/playground-protocol ./packages/playground-protocol
COPY services/playground-supervisor ./services/playground-supervisor
COPY services/playground-gateway ./services/playground-gateway
RUN npm ci && npm run build && npm run build --prefix services/playground-gateway

ENV NODE_ENV=production
EXPOSE 8787
CMD ["node", "services/playground-gateway/dist/main.js"]
