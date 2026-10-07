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
RUN npm ci \
  && node scripts/playground/build-artifact.mjs \
  && npm run build --prefix services/playground-gateway

ENV NODE_ENV=development \
    PLAYGROUND_HOST=0.0.0.0 \
    PLAYGROUND_PORT=8787 \
    PLAYGROUND_CLI_ROOT=/app \
    PLAYGROUND_SEED_SCRIPT=/app/scripts/playground/seed.mjs
EXPOSE 8787
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8787/readyz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "services/playground-gateway/dist/main.js"]
