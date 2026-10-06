export interface PlaygroundCommand {
  id: string;
  family: string;
  command: string;
  title: string;
  description: string;
  note?: string;
}

export const PLAYGROUND_COMMANDS: PlaygroundCommand[] = [
  { id: 'analyze', family: 'Analyze', command: 'change-firewall', title: 'Analyze working changes', description: 'Compare saved working files with HEAD.' },
  { id: 'analyze-help', family: 'Analyze', command: 'change-firewall analyze --help', title: 'Analyze help', description: 'Ask the installed CLI for its current flags.' },
  { id: 'json', family: 'Analyze', command: 'change-firewall analyze --json', title: 'Machine-readable report', description: 'Print the real JSON result.' },
  { id: 'staged', family: 'Analyze', command: 'change-firewall analyze --staged', title: 'Analyze staged changes', description: 'Limit collection to the Git index.' },
  { id: 'base', family: 'Analyze', command: 'change-firewall analyze --base playground-baseline', title: 'Compare an earlier base', description: 'Useful after the current edits are committed.' },
  { id: 'inspect', family: 'Inspector', command: 'change-firewall inspect', title: 'Interactive inspector', description: 'Use j/k, Tab, g, p, f, a and q. The suggestion view does not apply edits.' },
  { id: 'preflight', family: 'Gate', command: 'change-firewall preflight --staged', title: 'Preflight staged work', description: 'A blocked gate exits 1; that is a result, not a runtime crash.' },
  { id: 'gate', family: 'Gate', command: 'change-firewall gate --base playground-baseline', title: 'Run merge gate', description: 'Evaluate the actual fixture against a known base.' },
  { id: 'open', family: 'Dashboard', command: 'change-firewall --open', title: 'Open snapshot dashboard', description: 'Starts the real report server and opens it in the Browser pane.' },
  { id: 'watch', family: 'Dashboard', command: 'change-firewall watch', title: 'Watch saved edits', description: 'Keeps running and updates the real dashboard until stopped.' },
  { id: 'watch-no-open', family: 'Dashboard', command: 'change-firewall watch --no-open', title: 'Watch without switching tabs', description: 'Registers a dashboard but keeps the current pane selected.' },
  { id: 'impact', family: 'Explore', command: 'change-firewall impact src/services/userService.ts', title: 'Inspect file impact', description: 'Show actual direct and indirect dependents.' },
  { id: 'why', family: 'Explore', command: 'change-firewall why src/routes/user.ts', title: 'Explain a file', description: 'Show its role, history, and graph.' },
  { id: 'graph', family: 'Explore', command: 'change-firewall graph src/services/userService.ts', title: 'Behavior graph', description: 'Render the real terminal graph.' },
  { id: 'memory-status', family: 'Memory', command: 'change-firewall memory status', title: 'Memory status', description: 'Inspect stored contracts.' },
  { id: 'memory-record', family: 'Memory', command: 'change-firewall memory record', title: 'Record contracts from this diff', description: 'Creates .firewall/memory/invariants.json from observed changed contracts.' },
  { id: 'memory-reset', family: 'Memory', command: 'change-firewall memory reset', title: 'Reset memory', description: 'Deletes recorded memory in this disposable sample.' },
  { id: 'audit', family: 'Intent', command: 'change-firewall audit-agent -i "Restrict dashboard access to admins"', title: 'Audit claimed intent', description: 'Compare the quoted claim with real semantic changes.' },
  { id: 'demo', family: 'Other', command: 'change-firewall demo --no-open', title: 'Built-in synthetic demo', description: 'Runs the CLIâ€™s own synthetic demonstration.', note: 'This does not analyze editor files.' },
  { id: 'mcp', family: 'Other', command: 'change-firewall mcp', title: 'MCP stdio server', description: 'Waits for an AI client. Stop it with Ctrl+C or use the MCP test pane.' },
  { id: 'root-help', family: 'Help', command: 'change-firewall --help', title: 'Complete root help', description: 'The installed artifact is the source of truth.' },
  { id: 'version', family: 'Help', command: 'change-firewall --version', title: 'CLI version', description: 'Print the pinned runtime version.' },
  { id: 'git-status', family: 'Git', command: 'git status --short', title: 'Real Git status', description: 'See staged, unstaged, and untracked files.' },
  { id: 'git-diff', family: 'Git', command: 'git diff', title: 'Working-tree diff', description: 'Review saved changes.' },
  { id: 'git-log', family: 'Git', command: 'git log --oneline --decorate -5', title: 'Git history', description: 'Find an earlier comparison base.' },
  { id: 'memory-file', family: 'Shell', command: 'cat .firewall/memory/invariants.json', title: 'Read generated memory', description: 'Shows the actual JSON after memory record.' },
];

export const commandGroups = PLAYGROUND_COMMANDS.reduce<Record<string, PlaygroundCommand[]>>((groups, command) => {
  (groups[command.family] ||= []).push(command);
  return groups;
}, {});

export const GENERATED_COMMAND_MANIFEST = commandManifest;

export const MANIFEST_HELP_ITEMS = [
  { name: 'root', help: commandManifest.rootHelp, command: `${commandManifest.executable} --help` },
  ...commandManifest.commands.map(item => ({ ...item, command: `${commandManifest.executable} ${item.name} --help` })),
];
import commandManifest from '../../../public/playground/command-manifest.json';

