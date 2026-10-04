export const COACHMARK_ANCHORS = {
  terminalInput: 'terminal-input',
  terminalResult: 'terminal-result',
  gitStatus: 'git-status',
  editorSave: 'editor-save',
  browserTab: 'browser-tab',
  memoryFile: 'memory-file',
  processStop: 'process-stop',
  commandList: 'command-list',
  sourceControlTab: 'source-control-tab',
  explorerRoot: 'explorer-root',
  connectionBadge: 'connection-badge',
} as const;

export type CoachmarkAnchor = typeof COACHMARK_ANCHORS[keyof typeof COACHMARK_ANCHORS];

export const anchorProps = (anchor: CoachmarkAnchor) => ({ 'data-coachmark-anchor': anchor });

