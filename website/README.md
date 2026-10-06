<div align="center">
  <img src="./assets/icon.png" alt="Change Firewall Logo" width="100" height="100" />
  <h2>Change Firewall Web Showcase & Documentation</h2>
  <p>Deterministic AST behavioral diffing, caller blast radius mapping, and Model Context Protocol (MCP) server for modern AI engineering.</p>
</div>

## Features
- **Interactive Change Firewall IDE**: Edit a seeded Git project, stream the real CLI through xterm, inspect source-control state, and open a forwarded dashboard.
- **IDE Documentation Navigator**: Tree hierarchy with collapsible folders and full-screen reading mode.
- **Universal Model Context Protocol (MCP) Hub**: Native configurations for Claude Desktop, Google Antigravity, Cursor Composer, Windsurf, and Copilot.
- **Dark & Light Mode**: Seamless theme toggle with persistent state.
- **MongoDB Atlas Waitlist**: Direct subscriber collection with automated indexing.

## Development

The marketing site can run without a playground gateway. In that mode the IDE
shows the sample files but labels the runtime unavailable and never fabricates
terminal output.

```bash
npm run build
npm run build --prefix packages/playground-protocol
npm run build --prefix services/playground-supervisor
npm run build --prefix services/playground-gateway

PLAYGROUND_SEED_SCRIPT="$PWD/scripts/playground/seed.mjs" \
PLAYGROUND_CLI_ROOT="$PWD" \
PLAYGROUND_ALLOWED_ORIGIN="http://localhost:3000" \
npm run start --prefix services/playground-gateway
```

In another terminal:

```bash
cd website
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000`. The default example connects the browser to
`http://127.0.0.1:8787` through `NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL`.

## Production playground

The Next.js deployment and the stateful playground gateway are separate services.
Deploy the gateway container behind HTTPS with WebSocket and SSE proxying enabled,
then configure both sides:

```text
# Website build environment
NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL=https://playground.example.com

# Hardened gateway deployment (not the repository's local-process adapter)
PLAYGROUND_ALLOWED_ORIGIN=https://www.example.com
PLAYGROUND_MAX_SESSIONS=<capacity-approved-by-operator>
```

Vercel production builds now fail when the public gateway URL is missing, uses
plain HTTP, or points to localhost. This prevents a deployment that looks live
but can never connect from a visitor's browser.

The included gateway reports `local-development` isolation, executes commands
inside its host/container, and refuses to start with `NODE_ENV=production`.
Before opening live execution to untrusted public users, replace the local
supervisor with a per-session sandbox or microVM boundary as described in
`infra/playground/README.md`. A Vercel function cannot replace this stateful,
streaming process service.
