export type SessionState =
  | 'idle'
  | 'provisioning'
  | 'seeding'
  | 'ready'
  | 'reconnecting'
  | 'failed'
  | 'expired'
  | 'destroying';

export type MainView = 'code' | 'browser' | 'source-control' | 'commands' | 'mcp';
export type MobileView = 'files' | 'code' | 'commands' | 'terminal' | 'browser';

export type FileStatus = 'M' | 'A' | 'D' | 'R' | 'U' | null;

export interface PlaygroundFile {
  path: string;
  revision: string;
  status: FileStatus;
  staged?: boolean;
}

export interface RuntimeCapabilities {
  pty: boolean;
  interactiveInput: boolean;
  terminalResize: boolean;
  previewProxy: boolean;
  isolation: 'local-development' | 'hardened';
}

export interface GitStatus {
  head: string | null;
  staged: string[];
  unstaged: string[];
  untracked: string[];
  hasPreviousCommit?: boolean;
}

export interface PlaygroundSession {
  sessionId: string;
  generation: number;
  state: SessionState;
  expiresAt?: string;
  cliVersion?: string;
  capabilities?: RuntimeCapabilities;
  sessionToken?: string;
}

export interface PreviewState {
  dashboardId: string;
  url?: string;
  mode: 'snapshot' | 'watch' | 'demo';
  status: 'loading' | 'ready' | 'stopped' | 'error';
  message?: string;
}

export interface TerminalLine {
  id: number;
  text: string;
  kind: 'system' | 'input' | 'output' | 'error';
}

export interface TerminalSession {
  terminalId: string;
  processId?: string;
  command?: string;
  lines: TerminalLine[];
  running: boolean;
  exitCode?: number | null;
}

export interface PlaygroundState {
  session: PlaygroundSession;
  files: PlaygroundFile[];
  activePath: string;
  content: string;
  serverContent: string;
  fileRevision: string;
  saveState: 'idle' | 'dirty' | 'saving' | 'saved' | 'conflict' | 'error';
  saveError?: string;
  mainView: MainView;
  mobileView: MobileView;
  activeTerminalId: string;
  terminals: TerminalSession[];
  commandCount: number;
  lastCommand?: string;
  lastExitCode?: number | null;
  processRunning: boolean;
  git: GitStatus;
  preview?: PreviewState;
  memoryExists: boolean;
  resetCount: number;
}

export const EMPTY_GIT: GitStatus = {
  head: null,
  staged: [],
  unstaged: [],
  untracked: [],
};
