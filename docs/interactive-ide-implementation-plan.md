# Change Firewall Interactive IDE — Implementation Plan

Status: implementation specification; application has not been built by this task.
Research date: 2026-10-03. Repository package version inspected: 0.3.1.

## 1. Outcome and non-negotiable requirements

Build a working, VS Code-inspired playground in the first homepage section. A visitor sees a small TypeScript project, edits real files, types Change Firewall commands, reads actual process output, and opens the actual dashboard in an embedded browser panel. Contextual tips explain the current state without forcing a linear tour.

The predefined project makes the experience understandable and repeatable. The execution, Git state, file changes, memory files, exit codes, and dashboard must be real in live mode. Do not build another `switch(command) => hardcodedOutput` terminal.

Acceptance requirements:

1. The playground appears in the existing hero, before the remaining marketing sections.
2. Explorer, code tabs, editor, Git change indicators, integrated terminal, browser tab, and status bar work together.
3. All commands exposed by the pinned CLI, their help, documented aliases, options, and meaningful combinations execute. The actual CLI decides syntax errors and precedence.
4. `npx change-firewall --open` starts its real HTTP dashboard and opens it inside the IDE. A separate-tab button is also available.
5. Visitors can create and inspect `.firewall/memory/invariants.json` through real memory commands.
6. Users can edit, save, stage, commit, compare against earlier commits, and reset the sample repository.
7. Tips anchor beside the relevant control or state, disappear when users interact, and appear again only for a new relevant condition.
8. Teach: “Default analysis compares your current files with HEAD. Try it before committing. To inspect committed changes, choose an earlier base.” Never teach “committed code cannot be analyzed.”
9. Mobile, keyboard, reduced-motion, slow-start, failed-session, and expired-session behavior are explicit.
10. Real execution is a release requirement. A clearly labeled recorded preview may help during startup/outages, but is not completion of this specification.

Scope interpretation: “any command” means the complete Change Firewall CLI and sample-repository operations, not unrestricted access to the visitor's computer or arbitrary package installation. No browser extension, local installation, account, GitHub connection, or AI API is required to try the demo.

## 2. Verified repository context

| Existing source | Finding | Implementation consequence |
| --- | --- | --- |
| `website/src/app/page.tsx` | HeroTrailer → GeniusPillars → CliExperience → SuperpowerGrid → McpShowcase → EmailWaitlist | Preserve page structure; integrate the IDE into HeroTrailer. |
| `website/src/components/HeroTrailer.tsx` | Contains `#simulator` and renders BlastVisualizer below headline/CTAs | Replace that hero visualization slot with the playground; compact vertical spacing. Preserve anchor. |
| `website/src/components/CliExperience.tsx` | Existing simulated command experience | Replace duplicated simulator behavior with a command cookbook linking to the live playground. Do not treat its strings as CLI truth. |
| `website/package.json` | Next 14, React 18, Tailwind, Lucide, GSAP; separate package from CLI | Retain stack. Add editor/terminal dependencies only in website package. |
| `src/cli/index.ts` | Commander command definitions and argument normalization | Source of truth for command coverage, precedence, and exit behavior. |
| `bin/change-firewall.js`, `tsup.config.ts` | Wrapper imports built `dist/cli.js` | Build the exact checkout, package it, and install that artifact in the runtime. |
| `src/core/git/collector.ts` | Uses native `git` via child_process plus filesystem reads | A browser editor cannot execute the current package by itself. |
| `src/dashboard/server.ts` | Binds 127.0.0.1; default port 4783; report API and SSE | Preview forwarding must reach loopback inside the same sandbox and preserve HTTP streaming. |
| `src/core/watcher/watch-engine.ts` | Recursive fs.watch; 350 ms debounce; ignores .git/.firewall/node_modules/dist | Real watch requires a compatible Node/Linux runtime and real saved writes. Git-only changes need special attention. |
| `src/core/interactive/terminal-inspector.ts` | Raw TTY input and alternate screen; non-TTY becomes static output | Use a real PTY for interactive mode. |
| `src/core/memory/memory-engine.ts`, `src/index.ts` | Memory is derived from analyzed diffs; recording requires HEAD | Do not promise a whole-project baseline on a clean checkout. |
| `src/core/demo/demo-runner.ts` | Existing demo intentionally builds synthetic reports | Run it honestly as the CLI's built-in simulation, not analysis of editor files. |
| `test/real-git-e2e.test.ts` | Existing Git fixture with auth/API mutations | Reuse concepts and real assertions, not invented risk scores. |
| `website/vercel.json` | Website deployment is currently Vercel | Keep website hosting; add separately hosted persistent runtime infrastructure. |

There are both `README.md` and `Readme.md`; avoid incidental renames or unsynchronized duplicate documentation. Do not access or copy `website/.env.local`. `action.yml` is unrelated to implementing this website section.

### Existing behavior requiring explicit treatment

- Default collection includes tracked staged and unstaged changes against HEAD plus untracked files. A clean committed tree yields no new default diff; `--base HEAD~1` can recover a committed comparison.
- Current `--staged` selects staged paths but reads working-tree after-content and non-cached line statistics. Fix and regression-test this before teaching index-only semantics. Also cover added, deleted, renamed, partially staged, and initial-commit cases.
- `memory record` / `--record-memory` collect contracts from the current analysis, not all unchanged project files. A clean tree can record zero new contracts. Recording means saving observed contracts; it is not an independent safety approval.
- The argv normalizer rewrites `--inspect`, `--graph`, `--impact`, and preflight/gate aliases globally. Test actual behavior; avoid implementing a second parser with idealized behavior.
- `analyze --json --open` takes the JSON return path before opening a dashboard. Interactive output takes precedence over opening too. Do not open a browser merely because a typed string contains `--open`.
- Plain `open` is a snapshot server; `watch` performs updates. Explain this distinction.
- `AnalysisReport.baseCommit` currently reports HEAD even when `--base` selects another comparison. Derive the selected-base label from executed arguments plus resolved Git refs; do not use that field as proof of the selected base.
- `demo --no-open` prints its synthetic report and exits without starting a server; this differs from `watch --no-open`.
- Inspector `a` displays a remediation suggestion/test stub, not an applied edit. Current Escape is ignored despite one screen suggesting it exits; use q/Q/Ctrl+C, and either fix Escape with a regression test or correct the text.
- Existing dashboard port collision behavior tries subsequent ports, up to ten retries. Route the actual bound port, not always 4783.
- A missing file can yield a notice and zero-connection graph rather than an error. Preserve real results.

## 3. Architecture decision

### Chosen: lightweight custom IDE + isolated Linux runtime per visitor

Use the current website as the presentation layer. A separate session gateway provisions one disposable Linux sandbox per active visitor, containing Node, Git, the pinned CLI, and the sample repo. A small supervisor inside each sandbox handles PTYs, file synchronization, and loopback dashboard forwarding. Use hardened isolation such as gVisor or a microVM; ordinary shared-host processes are not the production boundary.

```text
Existing Next.js website / hero playground
  ├─ Monaco desktop editor; mobile textarea fallback
  ├─ xterm.js terminal → authenticated WSS gateway → sandbox PTY
  ├─ Explorer/save API → authenticated gateway → sandbox supervisor
  ├─ Browser panel → isolated preview origin → same sandbox's loopback server
  └─ Coachmark engine ← structured session/Git/file/process events

Gateway/control plane (no user code execution)
  ├─ Session ownership, capacity, expiry, quotas, event ordering
  ├─ Runtime adapter → one hardened sandbox per session
  └─ Preview authorization and streaming proxy

Disposable sandbox
  ├─ /opt/change-firewall: immutable built CLI and dependencies
  ├─ /workspace/demo: real writable Git repository
  ├─ Node + Git + shell + PTY supervisor
  └─ Real Change Firewall dashboard on 127.0.0.1:<actual-port>
```

The browser cannot silently launch a native browser application on the visitor's machine. `localhost` inside a remote sandbox is also not the visitor's localhost. Therefore the default `--open` result is the actual sandbox dashboard forwarded into an in-app browser; a user gesture opens the HTTPS preview in a separate browser tab. Keep the terminal's original localhost text and add a separate “Open dashboard” link mapped to the preview.

### Alternatives considered

| Option | Decision and reason |
| --- | --- |
| Monaco + hardcoded terminal | Insufficient: cannot truthfully support edits, flags, Git, watch, or memory. Optional labeled recorded preview only. |
| WebContainers | Promising follow-up, but not selected for initial parity: this CLI invokes native Git; native-addon and browser isolation constraints require proof or adapters. Do not assume a Git executable exists or isomorphic-git automatically replaces child_process. |
| Port analyzer to a browser worker | Useful future zero-server option, but requires Git/FS/watch/HTTP/process adapters and substantial parity work. Not the quickest faithful implementation. |
| Full code-server/Theia | More platform, extension, and maintenance surface than this focused educational section needs. |
| Localhost bridge | Requires installation and local-trust UX. Optional future “use my own repo,” not anonymous onboarding. |
| Dedicated sandbox runtime | Selected: directly supports Git, Node, PTY, files, ports, and CLI fidelity. Has hosting/abuse-control cost. |

Do not put sandbox execution in a Next route handler or assume function-local disk is durable. Vercel currently documents WebSocket support with duration limits and non-sticky future connections; that does not provide this product's durable PTY/process/filesystem lifecycle. The separate-runtime decision is about lifecycle and isolation, not an outdated blanket claim that Vercel cannot use WebSockets.

### Dependency choices

Resolve compatible stable versions at implementation time; pin them in lockfiles and record licenses. Do not upgrade the entire website stack as part of the playground.

| Purpose | Choice | Rule |
| --- | --- | --- |
| Desktop editor/diff | `monaco-editor`, optionally `@monaco-editor/react` | Lazy-load client-side; bundle workers locally; no runtime CDN dependency. |
| Terminal | `@xterm/xterm`, `@xterm/addon-fit` | Actual PTY bytes, ANSI and alternate screen; bounded scrollback. |
| Tooltips | `@floating-ui/react` | Anchors, collision handling, auto-update on scroll/resize. |
| Resizing | `react-resizable-panels` | Use the pinned version's API; keyboard-operable separators. |
| State | React reducer + context | Explicit events; keep terminal byte streams outside React render state. |
| Gateway | Node TypeScript + `ws` + schema validation | Minimal HTTP router is sufficient; no database required for first single-node deployment. |
| Runtime TTY | `node-pty` inside sandbox | Build native module for chosen Linux image; never run visitor processes on gateway host. |
| Tests | Existing Vitest; Playwright + axe integration for UI | Add separate website/runtime test scripts; validate real sessions. |

Monaco does not officially support mobile browsers. Use a labeled multiline plain-text editor on small/touch layouts in v1, preserving save and real terminal execution. Syntax highlighting on mobile is optional, not a claim of Monaco support.

## 4. Visual and interaction specification

### Placement and visual character

Keep the current headline and useful CTAs. Replace HeroTrailer's BlastVisualizer area with `PlaygroundSection`. Move the old blast illustration below the playground only if it explains something unique; otherwise remove its homepage use. Keep `#simulator` functional and point “Try commands” to the playground. Use at least 68 px scroll margin to clear the existing 52 px sticky navbar.

At 1440×900: compact hero copy, IDE roughly 620–720 px tall, explorer/editor/terminal visible without excessive introductory scrolling. Use existing warm page theme around a dark IDE; offer a readable light IDE theme if website theme demands it. Use Change Firewall branding, familiar VS Code proportions, monospace code, subtle borders, restrained cyan/orange emphasis. Do not duplicate Microsoft's logo or imply affiliation.

```text
┌ Change Firewall Playground      Sample: Contract drift   Reset  Expand ┐
│ Activity │ EXPLORER        │ auth.ts ×  userService.ts  [Browser]       │
│          │ src/           ├───────────────────────────────────────────┤
│ Files    │  middleware/   │ real editor, line numbers, modified marks  │
│ Changes  │  routes/       │ [optional before/after diff tab]           │
│ Commands │  services/     ├───────────────────────────────────────────┤
│          │ .firewall/     │ TERMINAL 1   +   Stop    Clear             │
│          │ README.md      │ /workspace/demo $ npx change-firewall      │
│          │                │ actual streamed output                     │
├ main • 3 changed  Saved       Live sandbox · CLI <version> · Connected ┤
└ Suggested: Analyze   Open dashboard   Help   Memory                    ┘
```

All visible controls must work; omit decorative menus that do nothing. Command suggestions insert editable text and require Enter/Run. Label any one-click executing button explicitly “Run …”. A command palette searches the CLI manifest and can fill file/intent arguments.

### Layout and keyboard behavior

- Desktop ≥1100 px: explorer 200–240 px, editor/main area, terminal lower pane ≥200 px; browser opens as a main-area tab, with optional split view.
- Tablet 768–1099 px: collapsible explorer; editor/browser tabs above terminal.
- Mobile <768 px: Files / Code / Terminal / Browser tabs; focused pane has useful height; input remains reachable above software keyboard; provide Ctrl+C, Tab, arrow, and Escape controls for terminal interaction.
- Expand opens an accessible overlay or full-page playground layout using the same live session; collapsing restores focus and layout.
- Save uses Ctrl/Cmd+S scoped to focused editor. Run uses Enter in terminal; history uses arrows. Ctrl+C interrupts the foreground process and preserves session.
- Provide an explicit focus escape shortcut and instructions when terminal/inspector captures Tab. Screen-reader access must not depend on interpreting ANSI art.
- Preserve manual terminal scroll position while output streams; provide “Jump to latest.” Do not announce every output chunk to screen readers.
- Ensure React Strict Mode mounts cannot create duplicate sessions; use idempotent startup and dispose models/listeners/observers on teardown.
- Display “Saving…”, “Saved”, or “Save failed” separately from Git M/A/D status. Save is not commit.
- Explorer supports selecting, creating, renaming, and deleting sample text files with clear recovery/reset. Show .firewall; hide .git/node_modules internals from editor, but preserve real Git state.
- A dirty editor closed without save offers Save / Discard / Cancel. Failed saves retain local content.
- Reset sample is explicit and confirms loss if the visitor has edits; kills processes, closes previews, and seeds a new generation.

## 5. Sample repository and reproducible scenarios

Store fixture sources outside the repository's own `.firewall` and generate actual Git repositories inside disposable sandboxes. Never seed by copying the developer checkout or secrets.

Suggested seed tree:

```text
README.md                        # short tasks and real commands
.gitignore                       # node_modules, .firewall, logs
package.json                     # local pinned CLI dependency
src/types.ts                     # User / request / response types
src/middleware/auth.ts            # basic user guard
src/services/userService.ts       # exported findUser, non-null initial contract
src/routes/user.ts                # imports guard/service, returns User
src/routes/dashboard.ts           # protected consumer
src/client/api.ts                 # consumes user.name
src/views/profile.ts              # indirect consumer
src/tests/auth.test.ts            # illustrative tests, clearly labeled if not runnable
```

Prefer small runnable pure-TypeScript fixtures with no external service. Do not introduce Express, databases, or network access solely to illustrate an import graph. If included test files are runnable, preinstall their test runner; otherwise don't offer “Run tests” as a working button.

### Seed procedure

1. Start from immutable fixture sources, fixed Git author, and reproducible commit timestamps.
2. Create minimal valid initial repo; commit `seed foundation` (commit A).
3. Add the safe example modules with exported contracts as a working diff. This seeds symbol contracts. To demonstrate stored route return-shape contracts as well, include a safe route in A and make a safe route change before recording, since the current writer requires a before-return shape. Validate that intended route entries actually exist.
4. Run the real `change-firewall memory record` against that diff and verify nonzero stored contracts.
5. Commit the safe modules as `safe application baseline` (commit B); tag `playground-baseline`. Memory stays ignored and retains its actual recorded baseline metadata. Do not pretend it was recorded at B if it refers to A.
6. Apply the initial mutation patch without committing: role restriction, API wrapping, and/or nullable return. Choose exact mutations after checking the real analyzer against the fixture.
7. Run real analysis in fixture validation; assert meaningful categories/paths and compute actual risk. Never set expected score to an attractive invented number.
8. Store a fixture manifest: fixture version, CLI build hash, base tags, file hashes, expected semantic assertions, default file, and scenario patches.
9. Initial user-facing copy: “These edits are saved but not committed. Run Change Firewall to inspect them.”

### Scenario presets

| Scenario | State/setup | Learning objective |
| --- | --- | --- |
| Contract drift (default) | B + dirty auth/API/nullability patch, recorded memory | Analysis, blast radius, audit, preflight, dashboard. |
| Clean baseline | B, no dirty code, baseline memory | No changes is a valid result, not a failure. |
| Staged vs unstaged | Stage one patch, apply a different unstaged patch | Index vs working tree; blocked until collector correction passes. |
| Just committed | Commit mutation as C | Default clean; `--base playground-baseline` or `--base HEAD~1` reveals committed change. |
| Memory lesson | A plus safe contract diff; no memory file | Run record → inspect real generated JSON → commit safe code → mutate → analyze → reset memory. |
| Fresh repository | No HEAD; small untracked sample | Initial-commit behavior and memory precondition. Advanced preset. |

Switching presets replaces the disposable sample only after resolving unsaved edits. Preserve terminal transcript until reset is confirmed. Custom edits produce actual analysis, including syntax errors or no findings. Do not silently reapply a preset after the visitor edits it.

## 6. Complete CLI coverage contract

All commands below are relative to `/workspace/demo`. Prefix command examples with `npx change-firewall` unless otherwise shown. `change-firewall` direct invocation should also work. Preinstall the package locally so normal `npx change-firewall` resolves without downloading anything. Disable package-registry egress in sessions; unknown/version-changing package requests fail honestly.

| Command family | Required syntax/options | Expected real behavior / lesson |
| --- | --- | --- |
| Root | no args; `-h`, `--help`; `-V`, `--version`; `help [command]` | Default analysis; actual generated help/version. |
| Analyze | `analyze`; `--json`; `--interactive`; `--inspect`; `--open`; `-p/--port <number>`; `-b/--base <ref>`; `-s/--staged`; `-i/--intent <text>`; `--record-memory` | Analysis, actual option precedence, memory side effects and long-lived dashboard. |
| Inspector | `interactive`, `inspect`; `-b/--base`; `-s/--staged` | Real PTY; navigation/panels/quit; no fabricated fixes. |
| Merge gate | `preflight`, `gate`; `-m/--max-risk <number>`; `-t/--threshold <number>`; `--no-fail-on-high`; `--json`; `-b/--base`; `-s/--staged` | Exit 0 if accepted, 1 if blocked/error. Nonzero result is not a crashed playground. |
| Dashboard | `open`; `-p/--port <number>` | Actual server, actual resolved port, explicit Stop. |
| Impact | `impact <file>` | Real direct/indirect dependents; missing-file behavior preserved. |
| Watch | `watch`; `-p/--port <number>`; `--no-open` | Real file events and SSE; remains running until stopped. No-open does not auto-select Browser. |
| Explain | `why <file>` | Real role, graph, and seeded Git history. |
| Demo | `demo`; `-p/--port <number>`; `--no-open` | Built-in synthetic demo, explicitly distinguished from editor-project analysis. With `--no-open`, prints report and exits without a server. |
| MCP | `mcp` | Real stdio protocol server; appears waiting until a client connects. |
| Behavior graph | `graph <file>` | Real terminal graph from current files. |
| Memory | `memory`, `memory status`, `memory record`, `memory reset` | Real JSON file, actual status, deletion on reset; unknown actions currently fall through to status. |
| Intent audit | `audit-agent`; `-i/--intent <text>`; `--json` | Actual audit; STEALTH_MUTATION/HIGH_DRIFT may return exit 1. |
| Normalized spellings | `-inspect`, `--inspect`, `-graph`, `--graph`, `-impact`, `--impact`, `-preflight`, `--preflight`, `-gate`, `--gate` | Test current normalizer and distinguish valid root spellings from conflicts in explicit subcommands. |
| Help per family | `<command> --help` and applicable aliases | CLI help, not frontend-authored replacement output. |

Also support genuine shell commands in the isolated sample, including `pwd`, `ls -a`, `cat`, `clear`, `mkdir`, `git status`, `git diff`, `git add`, `git restore`, `git commit -m`, and `git log`. Keep the shell/process boundary entirely inside the sandbox; a UI command allowlist is not the security boundary. Resource/network policy can limit commands; show those restrictions separately from CLI output.

Do not create an imaginary `.firewall` command. `.firewall` is a directory. The guided command is `npx change-firewall memory record`, then `cat .firewall/memory/invariants.json`. If a visitor types `.firewall`, preserve the shell error and show a short tip with the correct command.

Build `command-manifest.json` from CLI metadata/help captures tied to the installed artifact. Autocomplete and tutorials consume it. CI fails if a new command is missing coverage. Extract Commander creation into a side-effect-free factory if needed, preserving argv normalization and executable behavior; do not import a module that immediately calls `program.parse()` into the browser.

### Inspector and MCP specifics

- Run interactive inspector with PTY stdin/stdout. Current keys: ↑/k and ↓/j navigate; Tab toggles call stacks; g graph; p proof; f fingerprint; a suggestions; 1/o overview; q/Q/Ctrl+C quit. Escape currently does not quit. Verify bindings against the pinned source and fix misleading Escape text or behavior before release. Explain remediation as a generated prompt/proposal when no code is written.
- Running `mcp` in a terminal is allowed and normally waits. Tip: “This is a protocol server for an AI client. Use the MCP test panel to send a request.” Ctrl+C exits normally.
- Add an MCP test panel backed by a separate piped process using the existing MCP SDK. Perform initialize → initialized notification → tools/list → a read-only analysis tool call using the fixture. Show genuine request/response and tool result. Do not inject protocol traffic into a PTY process or claim a Claude/Cursor connection exists.
- Current tools are `analyze_changes`, `evaluate_preflight`, `compute_blast_radius`, `explain_file_impact`, `get_behavior_graph`, and `audit_agent_intent`; prompt is `change_firewall_audit`. Read actual schemas from `src/mcp/index.ts` and validate manifest drift; do not invent tool names. Constrain supplied cwd/file arguments to the sample workspace. Keep mutations deliberate and scoped to the sandbox.

## 7. Session, process, and file contracts

### Runtime lifecycle

States: `idle → provisioning → seeding → ready → reconnecting → ready`, with explicit `failed`, `expired`, and `destroying` states. Editor loading is independent of runtime readiness. Initially render lightweight fixture preview and “Start live playground”; interaction starts one session. Do not provision paid compute merely on page load.

Initial proposed limits, to tune after measurements: 1 vCPU, 512 MiB memory, 128 processes, 100 MiB writable storage, 2 terminal sessions, 10-minute idle TTL, 30-minute absolute TTL, 1 MiB per editable file, 200 visible files, 5,000 terminal scrollback lines. These are budget defaults, not measured capacity. Prove the analyzer can fit; increase resources if evidence requires it.

One session belongs to one anonymous signed browser identity. Store only the public session ID client-side; use secure HttpOnly credentials and short-lived scoped connection tickets. Avoid third-party-cookie-dependent embed auth. A same-origin website API can issue/proxy session credentials while gateway validates them. Never expose infrastructure keys to the browser or sandbox.

### Protected supervisor control channel

The production adapter must implement a private runtime exec-stream (or equivalent provider-protected host/guest channel), not a guest TCP endpoint exempted from egress policy. Gateway launches the supervisor through the trusted runtime API and retains its stdin/stdout control stream. No guest-visible management HTTP port is required. Visitor CLI advisory events use a separate local unprivileged channel and cannot issue supervisor commands.

Use separate controller and visitor UIDs. The supervisor identity owns its control descriptors and configuration; terminal processes run only as the visitor UID. A narrowly scoped runtime launch facility/helper may create PTYs and drop UID/GID and supplementary groups before starting a visitor shell; it must accept only the fixed visitor identity and workspace, close all management descriptors, sanitize the environment, and discard capabilities. Do not grant the visitor access to that facility or give the general supervisor unrestricted host/root execution. Implement and audit the identity transition explicitly; do not assume node-pty alone drops privileges from an unprivileged controller.

Visitor processes must be unable to ptrace/read controller proc/environment, open protected control channels, inherit control descriptors, or read gateway/provider credentials. File workers execute under visitor privileges. Use ownership/mount/proc restrictions and runtime confinement; executable proof is a P2 gate. Network policy blocks guest internet while the platform control stream remains outside guest internet routing. If the chosen provider cannot meet this contract, replace the adapter; do not weaken the boundary to unblock the demo.

Only gateway-owned session lifecycle and runtime process records authorize preview/process resources. All guest-originated payloads, even supervisor responses, undergo schema, size, identity, and generation validation. Coachmark content/actions remain frontend-defined; guest events cannot supply HTML, execute actions, or attest that a command is safe.

### Minimum gateway API

| Route/event | Contract |
| --- | --- |
| `POST /sessions` | `{fixtureId, fixtureVersion}` → `{sessionId, generation, state, expiresAt, cliVersion}`; idempotency key prevents duplicate allocation. |
| `GET /sessions/:id` | Authorized status/capabilities/version; no infrastructure credentials. |
| `DELETE /sessions/:id` | Idempotent revoke, stop PTYs, close previews, destroy storage. |
| `POST /sessions/:id/reset` | Expected generation + preset; old events rejected; new generation after reseed. |
| `GET /sessions/:id/files` | Bounded text-file tree with revisions and Git status; never host paths. |
| `GET /sessions/:id/file?path=...` | `{content, revision}`; reject unsafe paths. |
| `PUT /sessions/:id/file` | `{path, content, expectedRevision}` → new revision, or 409 conflict; atomic write. |
| `POST /sessions/:id/files` | Explicit create/rename/delete operation with expected revisions. |
| `POST /sessions/:id/terminals` | New PTY ID, cwd, dimensions; bounded count. |
| `WSS /sessions/:id/stream` | Authenticated typed events, terminal bytes, resize/input, sequencing and reconnect. |
| `POST /sessions/:id/preview-ticket` | Short-lived one-time credential for a registered dashboard, not arbitrary URL. |
| `POST /sessions/:id/mcp-test` | Structured SDK request to a separate piped MCP process; schema validated. |

Define shared TypeScript schemas first:

```ts
type SessionState = 'idle' | 'provisioning' | 'seeding' | 'ready'
  | 'reconnecting' | 'failed' | 'expired' | 'destroying';

type Envelope<T> = {
  protocolVersion: 1;
  sessionId: string;
  generation: number;
  sequence: number;
  event: T;
};

type ServerEvent =
  | { type: 'terminal.output'; terminalId: string; data: string }
  | { type: 'process.exit'; processId: string; code: number | null; signal?: string }
  | { type: 'command.started'; runId: string; terminalId: string; family: string; workspaceRevision: number }
  | { type: 'analysis.completed'; runId: string; scope: 'working-tree' | 'staged'; requestedBase: string; resolvedBase: string | null; workspaceRevision: number; filesChanged: number; findings: number; gate?: 'allowed' | 'blocked' }
  | { type: 'command.failed'; runId: string; category: 'syntax' | 'analysis' | 'runtime'; message: string }
  | { type: 'workspace.changed'; revision: number; paths: string[] }
  | { type: 'git.status'; revision: number; head: string | null; staged: string[]; unstaged: string[]; untracked: string[] }
  | { type: 'dashboard.ready'; dashboardId: string; port: number; autoOpen: boolean; mode: 'snapshot' | 'watch' | 'demo' }
  | { type: 'memory.changed'; exists: boolean; contracts: number | null }
  | { type: 'session.state'; state: SessionState; reason?: string };
```

Add validated client messages for terminal input/resize, acknowledgments, and cancellation. Bound message sizes and rates. Use incremental UTF-8 decoding so split multibyte characters do not corrupt output. PTYs merge stdout/stderr; do not falsely label their bytes as separate streams. Piped MCP/JSON tasks can retain separate streams.

Gateway lifecycle events are trusted control metadata. CLI-internal events from editable/running sandbox code are advisory, never authorization. Verify ownership/ports separately. Do not parse terminal text or OSC title strings as privileged dashboard commands.

### Editor synchronization and analysis consistency

1. Monaco model URI is stable per session/generation/path. Keep one model per open file and dispose on session destruction.
2. Auto-save after 400 ms of inactivity; explicit Save flushes immediately. Before executing a command from a UI control, await pending saves and their acknowledgments.
3. Terminal remains a genuine shell: while editing and executing manually, show unsaved/saving state and flush promptly; never promise shell input is transactionally synchronized with editor saves. A save barrier on structured Run actions provides deterministic tutorial steps.
4. Files changed by terminal commands must update explorer/editor through the supervisor watcher. If the editor also has unsaved changes, show a conflict comparison; do not silently overwrite either version.
5. File revision and Git status snapshots come from the sandbox, not guessed from text diffs in React.
6. Reject stale-generation events after reset. Reconnect resumes a bounded byte buffer by sequence; if unavailable, mark a transcript gap rather than replaying a command.
7. Never auto-repeat a commit, reset, memory record, or any command after a network interruption.
8. Long-running watch/open/inspector/MCP occupy their terminal. Offer Stop or a second terminal; do not append a fake ready prompt.
9. Add a mandatory opt-in semantic event adapter in the playground CLI artifact: command start, analysis completion with requested/resolved comparison base and staged scope, gate outcome, error category, and exit. Include runId, terminal/process ID, and sampled workspace revision; mark results stale if writes occur during analysis. Do not write these events to normal stdout/JSON/MCP channels. A local IPC channel provides advisory teaching metadata, not credentials or authority. Shell integration covers general shell commands; if metadata is missing, suppress result-specific tips and report unknown state. Actual raw CLI output remains unchanged.

## 8. Real dashboard opening and live preview

Preferred small core extension: add an optional dashboard-ready notification hook or environment-scoped IPC event from `startDashboardServer` after successful bind. In the playground image, a sandbox-only bridge suppresses the OS opener and forwards `{port, autoOpen, mode}` through a private local channel. Normal installed CLI behavior outside that environment stays unchanged. The transport address/credentials must not be configurable by arbitrary browser request fields.

Detailed flow:

1. Visitor types `npx change-firewall --open` and presses Enter.
2. The installed package analyzes the real sample; normal report bytes stream to xterm.
3. The actual HTTP server binds to loopback; bridge emits readiness after bind, not before.
4. Supervisor verifies the listener belongs to the registered visitor child process, identified by process ID plus start identity, in the current session/generation. Exclude every controller/management endpoint. Gateway records that process/port binding and registers an opaque dashboard ID; a sandbox-wide port check is insufficient. Revoke on process exit/reset; a replacement listener needs new registration.
5. Browser receives dashboard-ready metadata and loads a signed HTTPS preview URL in its Browser tab. It is the real `getDashboardHtml` UI and `/api/report` output.
6. Proxy destination is fixed loopback plus the registered port, never a client-supplied host. Do not follow upstream redirects; validate HTTP framing and strip browser credentials and hop-by-hop headers before forwarding (set safe forwarding headers deliberately). Treat imitation guest dashboards as untrusted content. Gateway forwards traffic through the sandbox-local supervisor; it cannot reach a sandbox loopback address from the host without that transport. Never expose a arbitrary host/port proxy endpoint.
7. Give each preview a dedicated isolated origin/root route so dashboard requests to `/api/report` and `/api/events` resolve correctly. Preserve SSE without buffering and with appropriate connection timeouts. Audit any absolute URLs/download paths in dashboard HTML.
8. For `watch --no-open`, register the server but do not switch tabs; show an optional link. For `demo --no-open`, no server is created, so register no preview. JSON-precedence commands do not emit readiness and do not open a tab.
9. Separate-tab link opens only on user click with noopener/noreferrer. Do not depend on delayed `window.open()` bypassing popup blockers.
10. Ctrl+C or Stop ends the process and its dashboard; iframe becomes an explicit “Dashboard stopped” state. Expiry/revocation invalidates all preview access.

Preview authentication decision: production uses a dedicated custom domain with same-site, separate origins: `app.<owned-domain>` for the existing Vercel-hosted website, `api.<owned-domain>` for gateway, and `<opaque-id>.preview.<owned-domain>` for each preview. These are schematic names, not owned/provisioned domains. This custom-domain setup is a production prerequisite; do not claim the default vercel.app hostname plus an unrelated preview domain avoids third-party-cookie restrictions.

- Keep app credentials host-only (`__Host-` prefix, Secure, HttpOnly, Path=/, no Domain); never send them to preview hosts. Preview serves only dashboard HTML, not arbitrary uploaded HTML. Treat dashboard-generated content as untrusted nevertheless.
- Authenticated app obtains a one-use ticket scoped to session, generation, and dashboard. Iframe navigates to its preview origin `/bootstrap?ticket=...`; proxy redeems ticket, sets a host-only Secure HttpOnly SameSite=Strict preview cookie, then redirects to `/`. Exclude bootstrap queries from logs and use Referrer-Policy: no-referrer. Never include session-provider secrets.
- Subsequent `/`, `/api/report`, and native EventSource `/api/events` requests carry that preview-origin cookie because top-level app and preview are same-site. Proxy validates it against live session ownership/generation on every request and terminates SSE on revocation. The upstream dashboard needs no custom auth headers.
- The separate-tab action obtains a fresh one-use bootstrap ticket for the same preview; clicking opens its URL with noopener/noreferrer. Test browser privacy modes and streaming; if auth fails, display a truthful retry/error, never a public unauthenticated preview.
- Same-site does not mean same-origin. App mutation APIs still enforce exact Origin/CSRF protection because a compromised sibling origin can initiate same-site requests. Allow iframe scripts and its own origin only as needed for dashboard fetch/SSE; deny top navigation, popups, and unrelated permissions. Set exact frame-ancestors and no broad CORS.
- Development uses distinct configured local hostnames and HTTPS to exercise cookie/origin rules; a simplified HTTP localhost mode must be labeled development-only.
- Do not forward the CLI's wildcard CORS header blindly. Public proxy auth, not upstream CORS, is the boundary.

Watch acceptance: start watch → edit auth.ts → saved file revision acknowledged → report event arrives over the proxied SSE stream → displayed dashboard changes from real report. Snapshot acceptance: edit after `open` → show “Snapshot; rerun or use watch” rather than pretend it auto-updates. Git-only changes may not trigger current watcher; surface this limitation or fix with explicit regression coverage.

## 9. Dynamic contextual tips

Use a rule engine driven by actual session/file/Git/process state. Do not use a timer-driven carousel or keyword-only command matching. Tips guide; they never block arbitrary valid commands.

```ts
type CoachmarkRule = {
  id: string;
  priority: number;
  anchor: 'terminal-input' | 'git-status' | 'editor-save' | 'browser-tab'
    | 'memory-file' | 'process-stop' | 'command-list' | 'source-control-tab'
    | 'explorer-root' | 'terminal-result' | 'connection-badge';
  eligible: (state: PlaygroundState) => boolean;
  message: string;
  action?: { label: string; command?: string };
  rearmKey: (state: PlaygroundState) => string;
};
```

Rules:

| Trigger | Anchor | Suggested message | Resolution / rearm |
| --- | --- | --- | --- |
| Ready, seeded dirty files, no executed command | Terminal input | “These edits are saved, but not committed. Run `npx change-firewall` to inspect them.” | Dismiss on interaction; do not repeat in same generation. |
| First meaningful result | Git status | “Default analysis compares current files with HEAD. Committing changes that comparison.” | Dismiss on next action; lesson remains in Help. |
| Dirty editor / pending save before guided Run | Save indicator | “Save your edits so the command can read them.” | Clears on acknowledged save; errors have higher priority. |
| Empty result and clean current tree | Git status | “No changes against HEAD. Edit a file, or try `--base HEAD~1` for the previous commit.” | Only suggest HEAD~1 when it exists; rearm after state changes. |
| Staged-only result with unstaged edits | Source Control tab | “This command inspects staged changes. Stage this file to include it.” | Clears after staging or different scope. Requires collector fix. |
| Dashboard ready, autoOpen true | Browser tab | “This is your running dashboard. `watch` updates it when saved files change.” | Clears on tab interaction. |
| Long-running process | Stop control | “This command is still running. Use Ctrl+C, Stop, or another terminal.” | Clears on exit; do not repeat for every output chunk. |
| Memory missing / status empty | Command list or Explorer | “Use `memory record` to save contracts from the current diff.” | Rearm after reset; do not imply whole-project capture. |
| Memory file created | Real .firewall file node | “Your contracts are stored here. Open the generated JSON.” | Clears on open; wait for node to exist before anchoring. |
| Commit causes default diff to disappear | Git status | “The edits are committed now. Compare against `playground-baseline` to inspect them.” | Clears on changed base or new edits. |
| MCP process awaiting input | Terminal input | “MCP waits for an AI client. Try the MCP test panel.” | Clears on panel open or process exit. |
| Preflight exits 1 with structured gate result | Result/terminal heading | “The gate blocked these changes. Read the findings before merging.” | Differentiate expected blocked result from runtime failure. |
| CLI syntax error / .firewall typed as command | Command list | “Use `--help` for syntax. `.firewall` is a folder; `memory record` creates its data.” | Only matching error context; no invented successful output. |
| Session disconnected or expired | Connection badge | “Connection lost. Your command may still be running.” / “Session expired. Start a fresh sample.” | Reconnect/renew resolves; no automatic command replay. |

Behavior mechanics:

- At most one tip visible. Priority: recovery/error > state explanation > optional discovery.
- Outside-tip user interaction (`pointerdown`, meaningful `keydown`, input, command start, tab/file selection) dismisses the current tip immediately. Exempt the tip's own action/dismiss controls from this global handler: run their click/Enter/Space action first, then dismiss, so removal cannot swallow activation. Ignore programmatic focus, animation, and output-only events.
- After interaction stops, recompute eligibility from latest state; a different useful tip can appear after ~700 ms. Do not redisplay the same dismissed tip until its rearm key changes. There is no requirement to show a new tip after every keystroke.
- Keep dismissed IDs + rearm keys per session in sessionStorage; support “Hide tips” and “Show tips.” Reset onboarding only on explicit reset/restart tour.
- Floating UI uses offset/flip/shift/autoUpdate and ResizeObserver. Anchor to stable `data-coachmark-anchor` attributes or a Monaco decoration's live coordinates, never fixed page x/y.
- If anchor is hidden/offscreen/unmounted, suppress the tip; do not auto-scroll or open panels unexpectedly. On mobile use a compact inline hint in the active pane.
- Tip width about 240–300 px; short title + at most two concise lines + optional action/dismiss. Subtle highlight, no page-wide modal mask.
- Tip actions insert commands or reveal panels. They never secretly commit, reset, or run memory operations.
- Tips do not take keyboard focus or obscure terminal cursor/editor selection. Provide an accessible static “What is happening?” summary, `aria-describedby` where appropriate, and polite announcements only for meaningful transitions.
- With reduced motion, use immediate appearance or brief opacity only. Pause any auto-dismiss timer while hovered/focused; preferably retain until interaction/dismissal.

## 10. Isolation and abuse controls

This section is implementation-critical because public users execute processes. It is not a warning dialog for visitors.

- Run every visitor's processes in their own hardened sandbox as a non-root user. No host filesystem mounts, host PID namespace, Docker socket, cloud credentials, or developer checkout.
- Default-deny outbound network, especially cloud metadata, private networks, and registries. Package/artifacts are preinstalled. Use resource limits, TTLs, per-identity/IP creation limits, maximum fleet capacity, and a budget kill switch.
- Gateway never interpolates commands into a host shell. User terminal bytes travel to an already-authorized sandbox PTY. Gateway control actions use structured validated parameters.
- Validate ownership on every file operation, PTY frame, preview request, reconnect, and deletion; session IDs alone are not authorization. Explicitly verify WebSocket Origin and credentials.
- Perform file operations under visitor privileges, using descriptor-relative traversal beneath an opened workspace root. Reject NUL/absolute/traversal paths and reject symlinks in editor-managed paths for v1. Use race-resistant no-follow/beneath operations in a small audited helper where Node APIs are insufficient; a prior realpath check alone is not race-safe. Require regular files, bound sizes/time/read duration, and reject FIFOs, sockets, devices, and other special files. Apply these rules to reads/writes/create/rename/delete and memory scans. Ownership/mount boundaries prevent hard links to controller artifacts. Never copy host-sensitive data into the sandbox.
- Public preview must not turn arbitrary terminal-emitted URLs into SSRF. Only registered sandbox services are reachable; URL schemes are validated. Terminal links never execute javascript/data URLs or shell commands.
- Treat filenames, output, findings, memory JSON, and HTML content as untrusted. Render strings as text; inspect dashboard HTML interpolation before embedding editable content. Sandbox preview origins/capabilities must remain separate from app credentials.
- Limit terminal buffers/message sizes/file sizes and throttle fast producers with backpressure. Clean up the entire process group, watchers, ports, and volumes on Stop/reset/expiry.
- Do not log raw user code, terminal input, intent strings, or preview tickets in analytics. Operational logs use session IDs, durations, counts, and error categories.
- Production release requires independent security review and cross-session penetration tests. A conventional Docker-only development setup must not be advertised as hardened public deployment.

## 11. Files and ownership for implementation

These are proposed new paths; inspect current tree again before creating them. Existing files listed here are the only planned integration edits unless evidence requires another change.

```text
docs/interactive-ide-implementation-plan.md       # this plan
packages/playground-protocol/
  package.json, tsconfig.json
  src/index.ts                                   # schemas, shared events/API types
fixtures/playground/
  README.md
  sources/                                       # safe small project, no live .git
  patches/                                       # deterministic scenario mutations
  manifest.json
scripts/playground/
  build-artifact.mjs                             # build/pack pinned CLI
  seed.mjs                                       # actual Git + memory sequence
  capture-command-manifest.mjs
  validate-fixture.mjs
services/playground-gateway/
  package.json, package-lock.json, tsconfig.json
  src/server.ts, sessions.ts, auth.ts, quotas.ts
  src/runtime/runtime-adapter.ts
  src/runtime/local-development-adapter.ts
  src/runtime/hardened-runtime-adapter.ts
  src/preview-proxy.ts, websocket.ts
  test/
services/playground-supervisor/
  package.json, package-lock.json, tsconfig.json
  src/server.ts, pty.ts, files.ts, git-status.ts
  src/dashboard-bridge.ts, mcp-client.ts
  test/
infra/playground/
  Dockerfile.runtime, compose.dev.yml
  README.md                                     # provisioning, TLS, isolation, TTLs, budgets
website/src/components/playground/
  PlaygroundSection.tsx, PlaygroundLoader.tsx
  IdeShell.tsx, FileExplorer.tsx, EditorPane.tsx
  TerminalPane.tsx, BrowserPane.tsx, SourceControlPane.tsx
  CommandPalette.tsx, Coachmark.tsx, SessionStatus.tsx
  McpTestPane.tsx, MobileCodeEditor.tsx
website/src/lib/playground/
  reducer.ts, session-client.ts, file-sync.ts
  commands.ts, coachmarks.ts, anchors.ts
website/src/styles/playground.css
website/public/playground/                       # generated nonsecret preview/manifest assets
website/tests/playground/                       # component + real-session browser tests
```

Keep root CLI packaging independent. New service packages can use local `file:` protocol dependencies with explicit build steps; do not introduce a monorepo tool solely for this feature. Do not use a bundler import that causes Node-only CLI code to enter website client chunks.

Expected edits:

- `website/src/components/HeroTrailer.tsx`: replace embedded visualizer with lazy playground, reduce excess spacing.
- `website/src/components/CliExperience.tsx`: turn into curated command reference routed to shared playground controller.
- `website/src/components/Navbar.tsx`: preserve simulator anchor, update label if needed.
- `website/src/app/globals.css`: minimal scoped imports/tokens, avoid global editor/terminal CSS regressions.
- `website/package.json` + lockfile: UI libraries/test scripts only.
- `website/README.md`: local website + runtime setup and limitations.
- `src/core/git/collector.ts`: narrowly scoped staged-index correction.
- `src/dashboard/server.ts` and callers if necessary: optional bridge notification/opener control without changing defaults.
- `src/cli/index.ts`: command metadata extraction or launcher events only if required and regression-tested.
- Relevant `test/` files: staged correctness and dashboard/CLI compatibility.
- `.gitignore`: ignore generated runtime artifacts, transcripts, local volumes, and test reports; do not ignore source fixtures.
- `.github/workflows/`: add fixture/protocol/browser checks while preserving package release workflow.

## 12. Ordered implementation tasks with stop conditions

Implement each task as a reviewable change. Do not mark the experience complete at the UI/mockup milestone.

### P0 — Establish executable truth and contracts

Owner: primary architect + CLI explorer. Dependencies: none.

1. Read applicable instructions, git status, source CLI, existing tests, and website structure; preserve unrelated edits.
2. Build CLI from source before contract captures; distinguish checkout artifact from npm latest.
3. Capture root/per-command help, aliases, error cases, option precedence, and package version into generated artifacts.
4. Define protocol schemas, session states, workspace path rules, initial resource budgets, and command manifest schema.
5. Write an architecture record for dedicated runtime + preview authentication + isolation boundary.
6. Reproduce staged-index and normalizer issues with temporary real Git fixtures; write focused failing tests before any correction.

Done when: every command maps to a real test case and runtime requirement; protocol types compile; existing behavior gaps are documented with evidence. No hidden assumptions about browser-only execution remain.

### P1 — CLI correctness and pinned fixture

Owner: CLI implementer. Files: collector/dashboard/core tests as separately agreed; fixture owner handles fixture files. Dependency: P0.

1. Fix staged after-content to read index blobs, with staged numstats and correct base handling; test empty HEAD cases, rename/delete/add, and partial staging.
2. Resolve inspect-normalization behavior deliberately: preserve root compatibility, avoid rewriting option values, and make help agree with supported syntax. If retained as known behavior, command lessons must reflect it; do not silently claim support that fails.
3. Add optional dashboard readiness/opener bridge and the opt-in CLI semantic event adapter with strict disabled-by-default behavior; preserve ordinary stdout/JSON/MCP byte contracts.
4. Build/pack immutable package; install into runtime image and seed repo without network at session time.
5. Implement seed procedure/scenario patches and validate actual reports, Git history, memory JSON, and contract counts.

Done when: `npx change-firewall` resolves the pinned local package; default fixture has meaningful real findings; staged tests pass; normal install still opens a normal local browser as before; fixture reset reproduces identical semantic results.

### P2 — Runtime vertical slice, before polished UI

Owner: runtime implementer. Files: services/infra. Dependency: P0 schemas + P1 package/fixture.

1. Build local development image with compatible maintained Node, Git, node-pty, supervisor, and package artifact.
2. Implement authenticated session create/destroy, real PTY, file reads/writes, revision checks, and expiry.
3. Start real dashboard and forward loopback HTTP/SSE through supervisor.
4. Implement gateway control plane and isolated preview credentials.
5. Demonstrate one browser terminal running help, analysis, open, memory record, watch, and inspector against real files.
6. Prove visitor code cannot access controller descriptors/credentials/proc state, invoke management operations, register controller ports, or reach another session. Verify process-group cleanup after Ctrl+C/reset/network disconnect/expiry; reconnect never re-executes commands.
7. Add production hardened adapter; keep it off until isolation checks pass.

Done when: real CLI + PTY + real dashboard + real edited file + watch update work end-to-end in a simple harness. If this fails, do not hide the failure with simulated output or spend effort polishing a nonfunctional shell.

### P3 — IDE interface and homepage integration

Owner: frontend implementer. Files: website playground components/styles/integration. Dependencies: P0; integrate live after P2.

1. Build shell with typed mock transport only for component development, clearly labeled in dev.
2. Add lazy Monaco and local workers; wire file models, save acknowledgments/conflicts, diff viewer, explorer, tabs.
3. Add xterm, resize observer, real PTY I/O, input controls, history, terminal tabs, Stop, and clear-screen behavior.
4. Add authenticated Browser pane, loading/stopped/error states, separate-tab action.
5. Add Source Control view with real statuses and explicit Git actions; display command/output for actions, don't invent status.
6. Support mobile textarea/pane navigation, keyboard escape paths, theme, reduced motion, and screen-reader status.
7. Integrate hero placement and command cookbook without duplicated simulators.

Done when: visitors can freely edit and execute, see actual state, open dashboard, and reset without reloading the entire site. First screen stays useful before heavy libraries load.

### P4 — Contextual teaching and command completeness

Owner: UX/frontend implementer; CLI reviewer verifies lessons. Dependencies: P2/P3 stable event contracts.

1. Implement rule engine, stable anchors, dismissal/rearm, priority, and tip preferences.
2. Add accurate uncommitted/committed/staged/memory/watch lessons from this specification.
3. Connect command palette to generated manifest, with quoted intent/path inputs and editable suggestions.
4. Add scenario selector and generated .firewall-file highlighting.
5. Add MCP test panel using genuine SDK requests/responses; label built-in demo simulation correctly.
6. Validate tips for arbitrary command order, repeat commands, editor changes, errors, and failed/expired sessions.

Done when: every CLI family is reachable and honest, and tips react to state instead of a fixed tutorial script.

### P5 — Independent tests, review, and security

Owners: separate tester, reviewer, and security agents; none is the relevant implementer. Dependencies: stable completed components. Run sequentially where concurrency limits require it.

1. Tester executes §13, records exact commands/browser/runtime versions and failures.
2. Reviewer inspects actual diff against all requirements, flags BLOCKER/HIGH/MEDIUM/LOW/NIT with evidence.
3. Security agent attempts cross-session access, malicious paths/symlinks, preview SSRF/XSS, socket misuse, quota exhaustion, and process escape boundaries.
4. Implementers correct BLOCKER/HIGH findings; tester reruns only affected checks and required integration gates.
5. Primary examines evidence, checks integration, updates docs, and records remaining limitations.

Done when: checks have actually run, critical findings are resolved, and live-mode requirement is met. Agent approval alone is not proof.

### P6 — Deployment and rollout

Owner: primary/infrastructure. Dependencies: P5.

1. Provision hardened runtime host/provider, custom same-site app/API/preview domain topology and TLS certificates, capacity and TTL settings. No provider/account purchase is authorized by this planning document.
2. Keep website deployment on its existing host; configure server-only gateway credentials and public endpoint metadata separately.
3. Deploy version-matched protocol, package, fixture, gateway, and website artifacts.
4. Enable through a feature flag for internal sessions; exercise real production help/open/watch/memory/reset.
5. Canary rollout; monitor start failures, session latency, memory, analysis duration, stream disconnects, orphan sessions, and cost.
6. Publish only after runtime budget and security configuration are explicit. Rollback flag restores previous hero and disables new sessions; allow short graceful expiry or terminate active sessions if security requires it.

Done when: a fresh anonymous visitor can complete the intended flow in production, and rollback/cleanup have been exercised.

## 13. Verification matrix

### CLI and fixture tests

- Real default analysis finds dirty fixture changes; clean state has no default file diff.
- Stage A, change same file to B without staging: `--staged` analyzes A and default analyzes B; include rename/add/delete and unborn HEAD.
- Commit mutations: default diff becomes clean; earlier-base analysis still detects them.
- Valid/invalid bases, missing files, spaces/Unicode in paths and quoted intent strings preserve actual CLI behavior.
- Capture every help/alias; JSON output parses; incompatible options obey actual CLI precedence.
- Memory starts empty, real recording creates file/nonzero fixture contracts, edits surface relevant invariants, reset removes file; recording without HEAD does not falsely claim success in tutorial copy.
- Unknown memory actions and inspect normalization have documented tested behavior.
- Preflight and audit exit codes match real results; rendering a report is not equivalent to passing a gate.
- Demo remains labeled synthetic; MCP initializes and answers actual SDK calls.
- PTY inspector enters alternate screen, responds to supported keys, exits and restores cursor/input mode; non-TTY fallback also remains valid.

### Browser end-to-end tests against a real runtime

1. Load homepage with JavaScript delayed: headline and start control remain useful, no hydration error/layout collapse.
2. Start live session, select/edit/save a file, run analysis, verify result reflects saved source.
3. Type `npx change-firewall --help` manually; compare real output to pinned help.
4. Type `npx change-firewall --open`; verify iframe actually fetches registered server report; use nondefault port and occupied-port fallback.
5. `--json --open` emits JSON and no dashboard; `watch --no-open` runs without automatic tab switch.
6. Watch + save updates dashboard via real SSE; snapshot open does not falsely update.
7. Memory command creates explorer node; file content equals sandbox JSON. Reset removes file without pretending directory must also disappear.
8. Stage/commit/base comparison teaches correct Git lesson; real statuses update after terminal-driven changes.
9. Interactive keys and Ctrl+C work; second terminal can run while first watches.
10. Tip action works via pointer, Enter, and Space before dismissal; outside interaction dismisses immediately; new relevant tip anchors correctly; no repeated nagging, hidden-anchor popup, focus theft, or stale tip after reset.
11. Disconnect/reconnect preserves process and marks output gaps correctly; expiry/reset rejects stale frames and stale file saves.
12. Browser popup blocked: embedded dashboard still works. Preview URLs are HTTPS and not visitor localhost.
13. Mobile virtual keyboard, terminal input, plain-text editor save, focus escape, and controls remain usable at 360/390 px; desktop 1440 and 1920 px.
14. Chrome, Firefox, Safari smoke flows; screen-reader/keyboard manual pass plus automated axe checks.
15. Refresh/restart recovery is honest about session persistence and expiry; no silent loss of unsaved editor content.

### Security and lifecycle checks

- Session A cannot read/write/attach/preview/delete session B using copied IDs or replayed tickets.
- Reject traversal, encoded traversal, absolute paths, NULs, symlink escapes and raced symlink changes; FIFOs/sockets/devices must not block reads or leak protected files through hard links.
- Attempt controller proc/environment/descriptor access from terminal code; verify private control transport works with guest egress denied and cannot be called by the visitor UID. Reject registration of controller ports and stale/reused process IDs.
- Reject unauthenticated/cross-origin WSS; bound frames and terminal output; disable dangerous link/clipboard hooks.
- Preview proxy rejects arbitrary internal/external destinations; tickets expire and cannot be reused.
- Malicious source strings/filenames/ANSI hyperlinks do not execute script in parent app.
- Resource flood reaches sandbox quota without affecting other sessions; TTL cleans descendants, watches, and volumes.
- No host mounts, metadata network, outbound registry download, inherited credentials, or raw content logs.
- Stop/reset cancels pending writes/analyses appropriately and releases old dashboard ports.

### Commands to run during implementation

Existing root gates: `npm run build`, `npm test`, `npm run verify:mcp` (run after source build). Existing website gate: `npm --prefix website run build`. Validate lint configuration before claiming `next lint` works unattended.

Add scripts with these exact intentions before relying on them: protocol typecheck; gateway/supervisor unit and integration tests; fixture validation; website component tests; Playwright real-runtime tests; production-image smoke; security isolation checks. These scripts do not yet exist. Do not present planned commands as passed checks.

Suggested performance targets to validate on documented hardware/network: no editor/terminal heavy bundle on initial marketing render; warm session ready ≤3 s p95, cold ≤10 s p95; small fixture analysis ≤2 s p95; saved edit → watch result ≤2 s p95; terminal typing visually responsive. Record actual measurements and revise targets explicitly, never invent results.

## 14. Delivery criteria and work sequencing

Minimum complete delivery includes the live IDE, every CLI family, real embedded dashboard, dynamic tips, real Git/memory state, accessibility/responsive behavior, isolated runtime, tests, and setup/deployment documentation. Do not cut inspector, MCP, watch, or memory and still call the full request complete.

Work that may be deferred without violating the core goal: VS Code extensions, arbitrary npm installs, GitHub import, real user repository mounting, collaboration, persistent accounts, AI chat, custom themes beyond readable light/dark, and a browser-only runtime rewrite.

Safe parallel ownership after shared contracts are agreed:

- CLI implementer: collector/CLI bridge and core regression tests.
- Runtime implementer: gateway/supervisor/infra, consuming agreed protocol.
- Frontend implementer: website components/state; no core edits.
- Primary: requirements, protocol/fixture coordination, integration, documentation.
- Tester/reviewer/security: independent checks, queued within actual agent concurrency limits.

Do not assign multiple agents the same writable files. Every assignment must state allowed files, prohibited edits, dependencies, acceptance criteria, checks, and expected report. Reports use RESULT, EVIDENCE, FILES CHANGED, CHECKS, RISKS, OPEN ISSUES.

No time estimate is asserted before P2 proves runtime compatibility. The main external decisions before public rollout are hosting budget, hardened isolation capability, and preview-domain provisioning. Local development can proceed with a clearly marked local-only adapter while those are arranged; public real execution cannot be faked to bypass them.

## 15. Research sources and evidence

Repository facts above come from the checked-in source paths, not marketing copy. This plan's investigation executed existing root and analyze `--help` without rebuilding; that confirms available dist behavior only. The CLI explorer also observed `analyze --inspect --json` exit 1 (too many arguments), root `--inspect --json` exit 1 (unknown --json), and `memory typo` exit 0 (status fallback). Implementation must rebuild and recapture to ensure source/artifact alignment.

External primary documentation, checked 2026-10-03:

- [Monaco Editor repository and FAQ](https://github.com/microsoft/monaco-editor): editor integration, workers, mobile-support limitation.
- [xterm.js security guide](https://xtermjs.org/docs/guides/security/): terminal output is untrusted; authenticate WebSockets and isolate privileges.
- [node-pty repository](https://github.com/microsoft/node-pty): actual pseudoterminal support needed for raw-input CLI behavior.
- [Floating UI React documentation](https://floating-ui.com/docs/react): anchored floating elements and positioning primitives.
- [React Resizable Panels](https://github.com/bvaughn/react-resizable-panels): reusable panel resizing rather than handwritten drag plumbing.
- [WebContainers troubleshooting](https://webcontainers.io/guides/troubleshooting): native-addon restrictions and runtime/browser constraints.
- [WebContainers browser support](https://webcontainers.io/guides/browser-support): cross-origin isolation and browser compatibility; page carries older update wording, so revalidate during any future browser-runtime spike.
- [Vercel WebSocket guidance](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections) and [function limits](https://vercel.com/docs/functions/limitations): connection lifetime and compute constraints; do not use old blanket WebSocket-support assumptions.
- [gVisor architecture overview](https://gvisor.dev/docs/): an isolation option for untrusted workloads; actual deployment must be validated, not inferred safe from a product name.
- [MDN Window.open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open): user-gesture/popup constraints informing embedded-first dashboard design.

The architecture, budgets, file map, UI copy, and task breakdown are design recommendations based on those constraints. Compatibility, performance, security, and hosting costs still require the implementation checks specified above.

## 16. Plan review record

Independent CLI and website explorers inspected source; a tester checked command/flag coverage, existing path references, and Markdown fences. Separate reviewer and security agents examined feasibility and trust boundaries. Their corrections are incorporated: same-site isolated preview authentication, structured analysis/gate events, actionable coachmark dismissal, demo no-open distinction, complete anchor identifiers, protected supervisor channel/identity, process-bound preview registration, and race-resistant regular-file access.

This is a reviewed plan, not a tested runtime. No application code was changed, and no product build, browser execution, deployment, or security penetration test was performed for this documentation task. P0–P6 define the evidence required when implementation begins.
