# Change Firewall playground runtime

This service is the local development adapter for the interactive IDE. It creates a disposable copy of the checked-in playground fixture, exposes authenticated file/Git/process APIs, and streams real command output over WebSocket or SSE. Commands execute against the copied Git repository; output is never synthesized.

This adapter is **not hardened production isolation**. It starts visitor commands as host child processes. Bind it to loopback only. Public deployment requires the hardened sandbox adapter and isolation/security gates described in `docs/interactive-ide-implementation-plan.md`.

## Run locally

Build the root CLI first, then build and start the gateway:

```sh
npm run build
npm run build --prefix services/playground-gateway
PLAYGROUND_SEED_SCRIPT="$PWD/scripts/playground/seed.mjs" \
PLAYGROUND_CLI_ROOT="$PWD" \
PLAYGROUND_ALLOWED_ORIGIN="http://localhost:3000" \
npm start --prefix services/playground-gateway
```

Set `NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL=http://127.0.0.1:8787` for the website. The gateway defaults to `127.0.0.1:8787`. `PLAYGROUND_FIXTURE_ROOT` may replace the seed script for a simple prebuilt fixture copy. Other settings are `PLAYGROUND_RUNTIME_ROOT`, `PLAYGROUND_GATEWAY_TOKEN`, `PLAYGROUND_IDLE_TTL_MS`, and `PLAYGROUND_ABSOLUTE_TTL_MS`.

The browser receives an HttpOnly local session cookie. The exact configured origin is the only CORS origin. A gateway token, when configured, is required only to create sessions through `X-Playground-Gateway-Token`; a production application should issue sessions server-side rather than expose that token.

## API

- `POST /sessions`, `GET/DELETE /sessions/:id`, `POST /sessions/:id/reset`
- `GET /sessions/:id/files`, `GET/PUT /sessions/:id/file`, `POST /sessions/:id/files`
- `POST /sessions/:id/terminals`
- `POST /sessions/:id/commands`, `POST /sessions/:id/commands/:processId/input`, `DELETE /sessions/:id/commands/:processId`
- `GET /sessions/:id/events` as JSON polling or SSE with `Accept: text/event-stream`
- `WS /sessions/:id/stream` for typed events and terminal commands/input
- `GET /sessions/:id/git/status`
- `POST /sessions/:id/commands/:processId/preview`, `POST /sessions/:id/preview-ticket`, and the registered preview path
- `POST /sessions/:id/mcp-test` for a genuine short-lived MCP client/tool exchange

File revisions are SHA-256 strings. The website client must retain them as opaque strings. Inspector commands use the pinned `node-pty` adapter and support raw input and resize. Other commands use a pipe-backed process so the CLI can send dashboard readiness metadata on protected file descriptor 3. If the native module cannot load, capabilities truthfully report `pty: false` and inspector falls back to the CLI's non-TTY rendering.

Run `npm test --prefix services/playground-gateway` for the real fixture integration test.
