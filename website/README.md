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

The included gateway is a local development adapter. Its capability badge says
“Local development runtime.” It is not the hardened isolation boundary required
for a public deployment. Configure the website to use the separately deployed
hardened gateway in production.
