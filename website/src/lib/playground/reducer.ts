import { EMPTY_GIT, PlaygroundFile, PlaygroundSession, PlaygroundState, PreviewState, TerminalLine, TerminalSession } from './types';

export type PlaygroundAction =
  | { type: 'SESSION'; session: PlaygroundSession }
  | { type: 'SESSION_STATE'; state: PlaygroundSession['state']; reason?: string }
  | { type: 'FILES'; files: PlaygroundFile[] }
  | { type: 'OPEN_FILE'; path: string; content: string; revision: string }
  | { type: 'EDIT'; content: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_OK'; revision: string }
  | { type: 'SAVE_ERROR'; message: string; conflict?: boolean }
  | { type: 'VIEW'; view: PlaygroundState['mainView'] }
  | { type: 'MOBILE_VIEW'; view: PlaygroundState['mobileView'] }
  | { type: 'TERMINAL_SELECT'; terminalId: string }
  | { type: 'TERMINAL_LINES'; terminalId: string; lines: TerminalLine[] }
  | { type: 'TERMINAL_CLEAR'; terminalId: string; line: TerminalLine }
  | { type: 'COMMAND'; command: string }
  | { type: 'PROCESS_STARTED'; terminalId: string; processId: string; command: string }
  | { type: 'PROCESS_EXIT'; processId: string; exitCode?: number | null }
  | { type: 'GIT'; git: PlaygroundState['git'] }
  | { type: 'PREVIEW'; preview?: PreviewState }
  | { type: 'MEMORY'; exists: boolean }
  | { type: 'RESET' };

export const previewFiles: PlaygroundFile[] = [
  { path: 'README.md', revision: '', status: null },
  { path: 'src/types.ts', revision: '', status: null },
  { path: 'src/middleware/auth.ts', revision: '', status: 'M' },
  { path: 'src/routes/user.ts', revision: '', status: 'M' },
  { path: 'src/services/userService.ts', revision: '', status: 'M' },
  { path: 'src/client/api.ts', revision: '', status: null },
];

export const previewContents: Record<string, string> = {
  'README.md': `# Change Firewall sample project\n\nThis small TypeScript project is intentionally designed to demonstrate contract\ndrift, dependency impact, Git comparisons, persistent memory, and preflight\ngates without requiring a database or external service.\n`,
  'src/types.ts': `export interface User {\n  id: string;\n  name: string;\n  role: 'member' | 'admin';\n}\n\nexport interface RequestContext {\n  user?: User;\n  params: Record<string, string>;\n}\n`,
  'src/middleware/auth.ts': `import type { User } from '../types';\n\nexport function canAccessDashboard(user: User): boolean {\n  return user.role === 'admin';\n}\n`,
  'src/routes/user.ts': `import { requireAuth } from '../middleware/auth.js';\nimport { findUser } from '../services/userService.js';\nimport type { RequestContext, User } from '../types.js';\n\nexport async function getUser(context: RequestContext): Promise<{ user: User | null }> {\n  requireAuth(context);\n  const user = findUser(context.params.id);\n  return { user };\n}\n`,
  'src/services/userService.ts': `import type { User } from '../types.js';\n\nconst users: User[] = [\n  { id: 'user-1', name: 'Ada', role: 'member' },\n  { id: 'admin-1', name: 'Grace', role: 'admin' },\n];\n\nexport function findUser(id: string, fallback?: User): User | null {\n  return users.find((user) => user.id === id) ?? fallback ?? null;\n}\n`,
  'src/client/api.ts': `import { getUser } from '../routes/user.js';\nimport type { RequestContext } from '../types.js';\n\nexport async function fetchProfile(context: RequestContext): Promise<string> {\n  const user = await getUser(context);\n  return user.name;\n}\n`,
};

export const initialState: PlaygroundState = {
  session: { sessionId: '', generation: 0, state: 'idle' },
  files: previewFiles,
  activePath: 'src/middleware/auth.ts',
  content: previewContents['src/middleware/auth.ts'],
  serverContent: previewContents['src/middleware/auth.ts'],
  fileRevision: '',
  saveState: 'idle',
  mainView: 'code',
  mobileView: 'code',
  activeTerminalId: 'terminal-welcome',
  terminals: [{ terminalId: 'terminal-welcome', running: false, lines: [
    { id: 1, kind: 'system', text: 'Live runtime is not connected. Start the playground to run real commands.' },
  ] }],
  commandCount: 0,
  processRunning: false,
  git: { ...EMPTY_GIT, head: 'playground-baseline', unstaged: ['src/middleware/auth.ts', 'src/routes/user.ts', 'src/services/userService.ts'], hasPreviousCommit: true },
  memoryExists: false,
  resetCount: 0,
};

export function playgroundReducer(state: PlaygroundState, action: PlaygroundAction): PlaygroundState {
  switch (action.type) {
    case 'SESSION': return { ...state, session: action.session };
    case 'SESSION_STATE': return { ...state, session: { ...state.session, state: action.state }, saveError: action.reason };
    case 'FILES': return { ...state, files: action.files };
    case 'OPEN_FILE': return { ...state, activePath: action.path, content: action.content, serverContent: action.content, fileRevision: action.revision, saveState: 'idle', mainView: 'code', mobileView: 'code' };
    case 'EDIT': return { ...state, content: action.content, saveState: action.content === state.serverContent ? 'idle' : 'dirty' };
    case 'SAVE_START': return { ...state, saveState: 'saving', saveError: undefined };
    case 'SAVE_OK': return { ...state, fileRevision: action.revision, serverContent: state.content, saveState: 'saved', saveError: undefined };
    case 'SAVE_ERROR': return { ...state, saveState: action.conflict ? 'conflict' : 'error', saveError: action.message };
    case 'VIEW': return { ...state, mainView: action.view };
    case 'MOBILE_VIEW': return { ...state, mobileView: action.view };
    case 'TERMINAL_SELECT': return state.terminals.some(item => item.terminalId === action.terminalId) ? { ...state, activeTerminalId: action.terminalId } : state;
    case 'TERMINAL_LINES': {
      const terminals = ensureTerminal(state.terminals, action.terminalId).map(item => item.terminalId === action.terminalId ? { ...item, lines: [...item.lines, ...action.lines].slice(-5000) } : item);
      return { ...state, terminals, activeTerminalId: state.terminals.some(item => item.terminalId === state.activeTerminalId) ? state.activeTerminalId : action.terminalId };
    }
    case 'TERMINAL_CLEAR': return { ...state, terminals: state.terminals.map(item => item.terminalId === action.terminalId ? { ...item, lines: [action.line] } : item) };
    case 'COMMAND': return { ...state, lastCommand: action.command, commandCount: state.commandCount + 1 };
    case 'PROCESS_STARTED': {
      const terminals = ensureTerminal(state.terminals, action.terminalId).map(item => item.terminalId === action.terminalId ? { ...item, processId: action.processId, command: action.command, running: true, exitCode: undefined } : item);
      return { ...state, terminals, activeTerminalId: action.terminalId, processRunning: true };
    }
    case 'PROCESS_EXIT': {
      const terminals = state.terminals.map(item => item.processId === action.processId ? { ...item, running: false, exitCode: action.exitCode } : item);
      return { ...state, terminals, processRunning: terminals.some(item => item.running), lastExitCode: action.exitCode ?? state.lastExitCode };
    }
    case 'GIT': return { ...state, git: action.git };
    case 'PREVIEW': return { ...state, preview: action.preview, mainView: action.preview ? 'browser' : state.mainView };
    case 'MEMORY': return { ...state, memoryExists: action.exists };
    case 'RESET': return { ...initialState, resetCount: state.resetCount + 1, session: { sessionId: '', generation: state.session.generation + 1, state: 'idle' } };
    default: return state;
  }
}

function ensureTerminal(terminals: TerminalSession[], terminalId: string): TerminalSession[] {
  if (terminals.some(item => item.terminalId === terminalId)) return terminals;
  const next = terminals.length < 2 ? [...terminals] : terminals.filter(item => item.running || item.terminalId !== terminals.find(candidate => !candidate.running)?.terminalId);
  if (next.length >= 2) return next;
  return [...next, { terminalId, running: false, lines: [] }];
}
