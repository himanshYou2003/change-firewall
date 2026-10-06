import { COACHMARK_ANCHORS, CoachmarkAnchor } from './anchors';
import { PlaygroundState } from './types';

export interface CoachmarkRule {
  id: string;
  priority: number;
  anchor: CoachmarkAnchor;
  title: string;
  message: string;
  action?: { label: string; command?: string; view?: PlaygroundState['mainView'] };
  eligible: (state: PlaygroundState) => boolean;
  rearmKey: (state: PlaygroundState) => string;
}

export const COACHMARK_RULES: CoachmarkRule[] = [
  { id: 'connection-error', priority: 100, anchor: COACHMARK_ANCHORS.connectionBadge, title: 'Live runtime unavailable', message: 'Check the gateway connection, then retry. No command was simulated.', eligible: s => s.session.state === 'failed' || s.session.state === 'expired', rearmKey: s => `${s.session.generation}:${s.session.state}` },
  { id: 'save-first', priority: 90, anchor: COACHMARK_ANCHORS.editorSave, title: 'Save before guided runs', message: 'The runtime reads saved files. Ctrl/Cmd+S flushes this edit.', eligible: s => s.saveState === 'dirty' || s.saveState === 'error' || s.saveState === 'conflict', rearmKey: s => `${s.activePath}:${s.fileRevision}:${s.saveState}` },
  { id: 'process-running', priority: 80, anchor: COACHMARK_ANCHORS.processStop, title: 'Command is still running', message: 'Use Ctrl+C, Stop, or another terminal for watch, open, inspector, and MCP.', eligible: s => s.processRunning, rearmKey: s => `${s.session.generation}:${s.commandCount}:${s.processRunning}` },
  { id: 'start', priority: 70, anchor: COACHMARK_ANCHORS.connectionBadge, title: 'Start the real sandbox', message: 'Commands run only after a live session connects.', eligible: s => s.session.state === 'idle', rearmKey: s => `${s.resetCount}:idle` },
  { id: 'first-analysis', priority: 60, anchor: COACHMARK_ANCHORS.terminalInput, title: 'Inspect the saved edits', message: 'These sample edits are saved but not committed. Run Change Firewall to compare them with HEAD.', action: { label: 'Fill command', command: 'change-firewall' }, eligible: s => s.session.state === 'ready' && s.commandCount === 0, rearmKey: s => `${s.session.generation}:first` },
  { id: 'commit-lesson', priority: 50, anchor: COACHMARK_ANCHORS.gitStatus, title: 'HEAD is the default base', message: 'After committing, use --base playground-baseline or HEAD~1 to inspect that committed change.', action: { label: 'Fill earlier-base command', command: 'change-firewall --base playground-baseline' }, eligible: s => s.session.state === 'ready' && s.commandCount > 0 && !s.processRunning, rearmKey: s => `${s.session.generation}:${s.git.head}:${s.git.unstaged.length}:${s.git.staged.length}` },
  { id: 'memory-created', priority: 55, anchor: COACHMARK_ANCHORS.memoryFile, title: 'Generated contracts', message: 'Open the real JSON generated from contracts observed in the analyzed diff.', eligible: s => s.memoryExists && s.files.some(file => file.path === '.firewall/memory/invariants.json'), rearmKey: s => `${s.session.generation}:${s.memoryExists}` },
  { id: 'dashboard', priority: 55, anchor: COACHMARK_ANCHORS.browserTab, title: 'Real dashboard ready', message: 'Snapshot stays fixed. Watch mode updates after saved file changes.', eligible: s => s.preview?.status === 'ready', rearmKey: s => `${s.session.generation}:${s.preview?.dashboardId}` },
];

export function eligibleCoachmark(state: PlaygroundState, dismissed: Record<string, string>) {
  return COACHMARK_RULES
    .filter(rule => rule.eligible(state) && dismissed[rule.id] !== rule.rearmKey(state))
    .sort((a, b) => b.priority - a.priority)[0];
}

