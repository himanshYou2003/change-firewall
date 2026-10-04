'use client';

import { BookOpen, Braces, Code2, Command, Expand, FileCode2, GitBranch, Globe2, HelpCircle, Laptop, Moon, PanelLeftClose, PanelLeftOpen, RotateCcw, Shrink, SlidersHorizontal, Sun, TerminalSquare } from 'lucide-react';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { eligibleCoachmark, type CoachmarkRule } from '@/lib/playground/coachmarks';
import { initialState, playgroundReducer, previewContents } from '@/lib/playground/reducer';
import { PlaygroundApiError, PlaygroundSessionClient, unwrapEvent } from '@/lib/playground/session-client';
import type { PlaygroundFile, TerminalLine } from '@/lib/playground/types';
import { anchorProps, COACHMARK_ANCHORS } from '@/lib/playground/anchors';
import BrowserPane from './BrowserPane';
import Coachmark from './Coachmark';
import CommandPalette from './CommandPalette';
import EditorPane from './EditorPane';
import FileExplorer from './FileExplorer';
import McpTestPane from './McpTestPane';
import SessionStatus from './SessionStatus';
import SourceControlPane from './SourceControlPane';
import TerminalPane from './TerminalPane';
import UnsavedChangesDialog, { type DirtyDecision } from './UnsavedChangesDialog';
import ResetConfirmationDialog from './ResetConfirmationDialog';
import { useTheme } from '../ThemeProvider';

let lineId = 10;
const line = (text: string, kind: TerminalLine['kind'] = 'system'): TerminalLine => ({ id: ++lineId, text, kind });
const textFromError = (error: unknown) => error instanceof Error ? error.message : 'Unexpected playground error';

export default function IdeShell() {
  const { theme: pageTheme } = useTheme();
  const [playgroundThemeOverride, setPlaygroundThemeOverride] = useState<'light' | 'dark' | 'auto'>(() => {
    try {
      const stored = localStorage.getItem('cf-playground-theme-mode');
      if (stored === 'light') return 'light';
      if (stored === 'dark') return 'dark';
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const activeIdeTheme: 'light' | 'dark' = playgroundThemeOverride === 'auto' ? pageTheme : playgroundThemeOverride;

  const handleSetPlaygroundTheme = useCallback((t: 'light' | 'dark' | 'auto') => {
    setPlaygroundThemeOverride(t);
    try { localStorage.setItem('cf-playground-theme-mode', t); } catch {}
  }, []);

  const toggleIdeTheme = useCallback(() => {
    const next = activeIdeTheme === 'dark' ? 'light' : 'dark';
    handleSetPlaygroundTheme(next);
  }, [activeIdeTheme, handleSetPlaygroundTheme]);

  const [state, dispatch] = useReducer(playgroundReducer, initialState);
  const [suggestedCommand, setSuggestedCommand] = useState<string>();
  const [expanded, setExpanded] = useState(false);
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [dismissed, setDismissed] = useState<Record<string, string>>({});
  const [tip, setTip] = useState<CoachmarkRule>();
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [dirtyRequest, setDirtyRequest] = useState<{ resolve: (decision: DirtyDecision) => void }>();
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [themeOpacity, setThemeOpacity] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('cf-playground-opacity');
      return stored ? Math.min(100, Math.max(50, Number(stored))) : 100;
    } catch {
      return 100;
    }
  });
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const handleOpacityChange = useCallback((value: number) => {
    const clamped = Math.min(100, Math.max(50, value));
    setThemeOpacity(clamped);
    try { localStorage.setItem('cf-playground-opacity', String(clamped)); } catch {}
  }, []);

  useEffect(() => {
    if (!themeMenuOpen) return;
    const closeOnOutside = (e: PointerEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [themeMenuOpen]);

  const client = useMemo(() => new PlaygroundSessionClient(), []);
  const rootRef = useRef<HTMLDivElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const startingRef = useRef(false);
  const saveActionRef = useRef<() => Promise<boolean>>();
  const startActionRef = useRef<() => Promise<void>>();
  const generationRef = useRef(0);
  const lastSequenceRef = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const addLines = useCallback((terminalId: string, ...lines: TerminalLine[]) => dispatch({ type: 'TERMINAL_LINES', terminalId, lines }), []);
  const addActiveLines = useCallback((...lines: TerminalLine[]) => addLines(stateRef.current.activeTerminalId, ...lines), [addLines]);

  const requestDirtyDecision = useCallback(() => new Promise<DirtyDecision>(resolve => setDirtyRequest({ resolve })), []);
  const resolveDirtyDecision = useCallback((decision: DirtyDecision) => { setDirtyRequest(current => { current?.resolve(decision); return undefined; }); }, []);

  const refreshWorkspace = useCallback(async (sessionId = stateRef.current.session.sessionId) => {
    if (!sessionId) return;
    try {
      const [filesRes, gitRes] = await Promise.allSettled([client.listFiles(sessionId), client.getGitStatus(sessionId)]);
      const files = filesRes.status === 'fulfilled' ? filesRes.value.files : [];
      const git = gitRes.status === 'fulfilled' ? gitRes.value : { head: null, staged: [], unstaged: [], untracked: [], revision: 0, hasPreviousCommit: false };
      const cleanFiles = files.filter(file => !file.path.startsWith('.playground') && !file.path.startsWith('.firewall'));
      const present = new Set(cleanFiles.map(file => file.path));
      const normalized = cleanFiles.map(file => ({ ...file, status: file.status || (git.untracked.includes(file.path) ? 'U' : git.unstaged.includes(file.path) ? 'M' : git.staged.includes(file.path) ? 'A' : null), staged: git.staged.includes(file.path) }));
      Array.from(new Set([...git.staged, ...git.unstaged])).forEach(path => {
        if (!present.has(path) && !path.startsWith('.playground') && !path.startsWith('.firewall')) normalized.push({ path, revision: '', status: 'D', staged: git.staged.includes(path) });
      });
      normalized.sort((a, b) => a.path.localeCompare(b.path));
      dispatch({ type: 'FILES', files: normalized });
      dispatch({ type: 'GIT', git: { ...git, hasPreviousCommit: Boolean(git.head) } });
      dispatch({ type: 'MEMORY', exists: files.some(file => file.path === '.firewall/memory/invariants.json' && file.status !== 'D') });
      return normalized;
    } catch (err) {
      console.warn('refreshWorkspace error:', err);
      return [];
    }
  }, [client]);

  const openFile = useCallback(async (path: string) => {
    if (path === stateRef.current.activePath) return;
    if (stateRef.current.saveState === 'dirty') {
      try {
        await saveActionRef.current?.();
      } catch {}
    }
    const sessionId = stateRef.current.session.sessionId;
    if (!sessionId) {
      const fallback = previewContents[path] ?? '';
      dispatch({ type: 'OPEN_FILE', path, content: fallback, revision: '' });
      dispatch({ type: 'MOBILE_VIEW', view: 'code' });
      if (client.configured && stateRef.current.session.state === 'idle') {
        void startActionRef.current?.();
      }
      return;
    }
    try {
      const file = await client.getFile(sessionId, path);
      dispatch({ type: 'OPEN_FILE', path, ...file });
      dispatch({ type: 'MOBILE_VIEW', view: 'code' });
    } catch (error) { addActiveLines(line(`File open failed: ${textFromError(error)}`, 'error')); }
  }, [addActiveLines, client]);

  const handleEvent = useCallback((raw: unknown) => {
    const envelope = raw as { generation?: number; sequence?: number } | null;
    if (typeof envelope?.generation === 'number' && generationRef.current && envelope.generation !== generationRef.current) return;
    if (typeof envelope?.sequence === 'number') {
      if (envelope.sequence <= lastSequenceRef.current) return;
      lastSequenceRef.current = envelope.sequence;
    }
    const event = unwrapEvent(raw);
    if (!event.type) return;
    if (event.type === 'terminal.output' && event.terminalId) addLines(String(event.terminalId), line(String(event.data ?? ''), 'output'));
    if (event.type === 'command.failed') addActiveLines(line(`${event.category || 'runtime'}: ${event.message}`, 'error'));
    if (event.type === 'process.exit') {
      const owner = stateRef.current.terminals.find(item => item.processId === event.processId);
      dispatch({ type: 'PROCESS_EXIT', processId: String(event.processId), exitCode: event.code });
      addLines(owner?.terminalId || stateRef.current.activeTerminalId, line(`Process exited with code ${event.code ?? 'signal'}.`, event.code === 0 ? 'system' : 'error'));
      void refreshWorkspace();
    }
    if (event.type === 'workspace.changed') void refreshWorkspace();
    if (event.type === 'git.status') dispatch({ type: 'GIT', git: { head: event.head ?? null, staged: event.staged || [], unstaged: event.unstaged || [], untracked: event.untracked || [], hasPreviousCommit: true } });
    if (event.type === 'memory.changed') dispatch({ type: 'MEMORY', exists: Boolean(event.exists) });
    if (event.type === 'session.state') dispatch({ type: 'SESSION_STATE', state: event.state, reason: event.reason });
    if (event.type === 'dashboard.ready') {
      const current = stateRef.current.session;
      const preview = { dashboardId: String(event.dashboardId), mode: event.mode, status: 'loading' as const };
      dispatch({ type: 'PREVIEW', preview });
      void client.previewTicket(current.sessionId, preview.dashboardId).then(url => {
        dispatch({ type: 'PREVIEW', preview: { ...preview, status: 'ready', url } });
        if (!event.autoOpen) dispatch({ type: 'VIEW', view: stateRef.current.mainView });
      }).catch(error => dispatch({ type: 'PREVIEW', preview: { ...preview, status: 'error', message: textFromError(error) } }));
    }
  }, [addActiveLines, addLines, client, refreshWorkspace]);

  const connect = useCallback(async (session: typeof state.session) => {
    generationRef.current = session.generation;
    client.setSession(session);
    client.connect(session, handleEvent, streamState => {
      if (streamState === 'reconnecting' && stateRef.current.session.state === 'ready') dispatch({ type: 'SESSION_STATE', state: 'reconnecting', reason: 'Event stream reconnecting…' });
      if (streamState === 'closed') dispatch({ type: 'SESSION_STATE', state: 'failed', reason: 'The event stream closed. Restart the playground to reconnect.' });
      if (streamState === 'open') dispatch({ type: 'SESSION_STATE', state: 'ready' });
    });
    const normalizedFiles = await refreshWorkspace(session.sessionId);
    const availableFiles = normalizedFiles && normalizedFiles.length > 0
      ? normalizedFiles
      : (await client.listFiles(session.sessionId)).files.filter(f => !f.path.startsWith('.firewall') && !f.path.startsWith('.playground'));
    const currentPath = stateRef.current.activePath;
    const targetPath = availableFiles.some(file => file.path === currentPath) ? currentPath : 'src/middleware/auth.ts';
    const targetFile = availableFiles.find(file => file.path === targetPath) || availableFiles[0];
    if (targetFile) {
      const file = await client.getFile(session.sessionId, targetFile.path);
      if (stateRef.current.saveState === 'dirty' && stateRef.current.activePath === targetFile.path) {
        dispatch({ type: 'SAVE_OK', revision: file.revision });
        setTimeout(() => void saveActionRef.current?.(), 100);
      } else {
        dispatch({ type: 'OPEN_FILE', path: targetFile.path, ...file });
      }
    }
    addActiveLines(line(`Connected to isolated sample · Change Firewall ${session.cliVersion || 'runtime build'}.`, 'system'));
  }, [addActiveLines, client, handleEvent, refreshWorkspace]);

  const start = useCallback(async () => {
    if (startingRef.current || stateRef.current.session.state === 'ready') return;
    startingRef.current = true;
    dispatch({ type: 'SESSION_STATE', state: 'provisioning' });
    try {
      if (!client.configured) throw new PlaygroundApiError('Live runtime unavailable: configure NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL and start the gateway.');
      let key = sessionStorage.getItem('change-firewall-playground-key');
      if (stateRef.current.session.state === 'expired' || (stateRef.current.session.state === 'failed' && stateRef.current.session.sessionId)) key = null;
      if (!key) { key = crypto.randomUUID(); sessionStorage.setItem('change-firewall-playground-key', key); }
      lastSequenceRef.current = 0;
      const session = await client.createSession(key);
      generationRef.current = session.generation;
      dispatch({ type: 'SESSION', session });
      await connect(session);
    } catch (error) {
      dispatch({ type: 'SESSION_STATE', state: 'failed', reason: textFromError(error) });
      addActiveLines(line(textFromError(error), 'error'), line('No command output has been fabricated. Start the local gateway or try again later.', 'system'));
    } finally { startingRef.current = false; }
  }, [addActiveLines, client, connect]);
  startActionRef.current = start;

  // Auto-connect to live runtime on mount when gateway is configured
  useEffect(() => {
    if (client.configured && stateRef.current.session.state === 'idle') {
      void start();
    }
  }, [client.configured, start]);

  const save = useCallback(async () => {
    const current = stateRef.current;
    if (current.saveState === 'saving' || current.saveState === 'idle' || current.saveState === 'saved') return true;
    if (current.session.state !== 'ready') {
      if (client.configured && (current.session.state === 'idle' || current.session.state === 'failed')) {
        await start();
      }
      if (stateRef.current.session.state !== 'ready') return false;
    }
    const live = stateRef.current;
    dispatch({ type: 'SAVE_START' });
    try {
      let revision = live.fileRevision;
      if (!revision) {
        try {
          const existing = await client.getFile(live.session.sessionId, live.activePath);
          revision = existing.revision;
        } catch {}
      }
      const result = await client.putFile(live.session.sessionId, live.activePath, live.content, revision || null);
      dispatch({ type: 'SAVE_OK', revision: result.revision });
      await refreshWorkspace();
      return true;
    } catch (error) {
      dispatch({ type: 'SAVE_ERROR', message: textFromError(error), conflict: error instanceof PlaygroundApiError && error.status === 409 });
      return false;
    }
  }, [client, refreshWorkspace, start]);
  saveActionRef.current = save;

  useEffect(() => {
    if (state.saveState !== 'dirty' || dirtyRequest) return;
    const timer = window.setTimeout(() => void save(), 400);
    return () => window.clearTimeout(timer);
  }, [dirtyRequest, save, state.content, state.saveState]);

  const run = useCallback(async (command: string) => {
    if ((stateRef.current.session.state as string) !== 'ready') {
      if (client.configured) {
        await start();
      }
      if ((stateRef.current.session.state as string) !== 'ready') {
        throw new Error('Playground runtime unavailable: start the playground session first.');
      }
    }
    const current = stateRef.current;
    if (current.terminals.filter(item => item.running).length >= 2) throw new Error('Two commands are already running. Stop one before starting another.');
    if (current.saveState === 'dirty' || current.saveState === 'error' || current.saveState === 'conflict') {
      const saved = await save();
      if (!saved) throw new Error('Save the editor change before running this guided command.');
    }
    dispatch({ type: 'COMMAND', command });
    try {
      const process = await client.startCommand(stateRef.current.session.sessionId, command);
      dispatch({ type: 'PROCESS_STARTED', terminalId: process.terminalId, processId: process.processId, command });
      addLines(process.terminalId, line(command, 'input'));
    } catch (error) {
      addActiveLines(line(textFromError(error), 'error'));
      throw error;
    }
  }, [addActiveLines, addLines, client, save, start]);

  const stop = useCallback(() => {
    const session = stateRef.current.session;
    const active = stateRef.current.terminals.find(item => item.terminalId === stateRef.current.activeTerminalId);
    if (session.sessionId && active?.processId && active.running) void client.stopCommand(session.sessionId, active.processId).catch(error => addActiveLines(line(textFromError(error), 'error')));
  }, [addActiveLines, client]);

  const mutateFile = useCallback(async (operation: Record<string, unknown>) => {
    let sessionId = stateRef.current.session.sessionId;
    if (!sessionId) {
      if (client.configured && stateRef.current.session.state === 'idle') {
        await start();
        sessionId = stateRef.current.session.sessionId;
      }
      if (!sessionId) return;
    }
    try { await client.fileOperation(sessionId, operation); await refreshWorkspace(); }
    catch (error) { addActiveLines(line(`File operation failed: ${textFromError(error)}`, 'error')); }
  }, [addActiveLines, client, refreshWorkspace, start]);

  const renameFile = useCallback(async (path: string, destination: string) => {
    const current = stateRef.current;
    if (path === current.activePath && current.saveState === 'dirty') {
      const decision = await requestDirtyDecision();
      if (decision === 'cancel' || (decision === 'save' && !(await saveActionRef.current?.()))) return;
    }
    try {
      await client.fileOperation(current.session.sessionId, { operation: 'rename', path, destination, expectedRevision: current.fileRevision });
      await refreshWorkspace();
      if (path === current.activePath) await openFile(destination);
    } catch (error) { addActiveLines(line(`Rename failed: ${textFromError(error)}`, 'error')); }
  }, [addActiveLines, client, openFile, refreshWorkspace, requestDirtyDecision]);

  const deleteFile = useCallback(async (path: string) => {
    const current = stateRef.current;
    if (path === current.activePath && current.saveState === 'dirty') {
      const decision = await requestDirtyDecision();
      if (decision === 'cancel' || (decision === 'save' && !(await saveActionRef.current?.()))) return;
    }
    try {
      await client.fileOperation(current.session.sessionId, { operation: 'delete', path, expectedRevision: current.fileRevision });
      const files = await refreshWorkspace();
      if (path === current.activePath) {
        const next = files?.find(file => file.status !== 'D');
        if (next) await openFile(next.path);
      }
    } catch (error) { addActiveLines(line(`Delete failed: ${textFromError(error)}`, 'error')); }
  }, [addActiveLines, client, openFile, refreshWorkspace, requestDirtyDecision]);

  const reset = useCallback(() => {
    setResetConfirmOpen(true);
  }, []);

  const handlePerformReset = useCallback(async () => {
    setResetting(true);
    const current = stateRef.current;
    try {
      if (current.session.sessionId) {
        try {
          const session = await client.resetSession(current.session.sessionId, current.session.generation, 'contract-drift');
          generationRef.current = session.generation;
          dispatch({ type: 'RESET' });
          dispatch({ type: 'SESSION', session: { ...session, sessionToken: current.session.sessionToken } });
          await connect({ ...session, sessionToken: current.session.sessionToken });
          setResetConfirmOpen(false);
          return;
        } catch (err) {
          console.warn('In-place reset failed, falling back to clean session', err);
        }
      }
      dispatch({ type: 'RESET' });
      sessionStorage.removeItem('change-firewall-playground-key');
      await start();
      setResetConfirmOpen(false);
    } catch (error) {
      addActiveLines(line(`Reset failed: ${textFromError(error)}`, 'error'));
    } finally {
      setResetting(false);
    }
  }, [addActiveLines, client, connect, start]);

  useEffect(() => () => client.close(), [client]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('has-playground-expanded');
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove('has-playground-expanded');
      window.removeEventListener('keydown', close);
    };
  }, [expanded]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('change-firewall-playground-tips');
      if (stored) setDismissed(JSON.parse(stored));
      if (sessionStorage.getItem('change-firewall-playground-tips-enabled') === 'false') setTipsEnabled(false);
    } catch { /* Storage may be disabled by browser privacy settings. */ }
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem('change-firewall-playground-tips', JSON.stringify(dismissed)); sessionStorage.setItem('change-firewall-playground-tips-enabled', String(tipsEnabled)); } catch {}
  }, [dismissed, tipsEnabled]);

  useEffect(() => {
    const receiveCommand = (event: Event) => {
      const command = (event as CustomEvent<{ command?: string }>).detail?.command;
      if (command) { setSuggestedCommand(command); dispatch({ type: 'MOBILE_VIEW', view: 'terminal' }); }
    };
    window.addEventListener('change-firewall:playground-command', receiveCommand);
    return () => window.removeEventListener('change-firewall:playground-command', receiveCommand);
  }, []);

  useEffect(() => {
    if (!tipsEnabled) { setTip(undefined); return; }
    const timer = window.setTimeout(() => setTip(eligibleCoachmark(state, dismissed)), 700);
    return () => window.clearTimeout(timer);
  }, [dismissed, state, tipsEnabled]);

  useEffect(() => {
    const dismissOnInteraction = (event: Event) => {
      if (!tip || (event.target as Element | null)?.closest?.('[data-coachmark-popover]')) return;
      if (event.type === 'keydown' && ['Shift', 'Control', 'Alt', 'Meta'].includes((event as KeyboardEvent).key)) return;
      setDismissed(value => ({ ...value, [tip.id]: tip.rearmKey(stateRef.current) })); setTip(undefined);
    };
    document.addEventListener('pointerdown', dismissOnInteraction, true); document.addEventListener('keydown', dismissOnInteraction, true);
    return () => { document.removeEventListener('pointerdown', dismissOnInteraction, true); document.removeEventListener('keydown', dismissOnInteraction, true); };
  }, [tip]);

  const dismissTip = (rule: CoachmarkRule) => { setDismissed(value => ({ ...value, [rule.id]: rule.rearmKey(stateRef.current) })); setTip(undefined); };
  const actOnTip = (rule: CoachmarkRule) => { if (rule.action?.command) { setSuggestedCommand(rule.action.command); dispatch({ type: 'MOBILE_VIEW', view: 'terminal' }); } if (rule.action?.view) dispatch({ type: 'VIEW', view: rule.action.view }); dismissTip(rule); };
  const fillCommand = (command: string) => { setSuggestedCommand(command); dispatch({ type: 'MOBILE_VIEW', view: 'terminal' }); rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  const changedCount = new Set([...state.git.staged, ...state.git.unstaged, ...state.git.untracked]).size;
  const connected = state.session.state === 'ready';

  const mainPane = state.mainView === 'code' ? <EditorPane path={state.activePath} content={state.content} saveState={state.saveState} saveError={state.saveError} disabled={!connected} theme={activeIdeTheme} onChange={content => dispatch({ type: 'EDIT', content })} onSave={() => void save()} onReload={() => void openFile(state.activePath)} />
    : state.mainView === 'browser' ? <BrowserPane preview={state.preview} onRefresh={() => { const frame = rootRef.current?.querySelector('iframe'); if (frame) frame.src = frame.src; }} onOpenExternal={() => { if (state.preview?.dashboardId) window.open(client.previewUrl(state.session.sessionId, state.preview.dashboardId), '_blank', 'noopener,noreferrer'); }} />
      : state.mainView === 'source-control' ? <SourceControlPane git={state.git} onFill={fillCommand} onOpenFile={path => { void openFile(path); dispatch({ type: 'VIEW', view: 'code' }); }} onRun={cmd => void run(cmd)} onRefresh={() => void refreshWorkspace()} />
        : state.mainView === 'commands' ? <CommandPalette onFill={fillCommand} />
          : <McpTestPane connected={connected} onTest={async (toolName, toolArgs) => {
              if (stateRef.current.session.state !== 'ready') {
                if (client.configured) {
                  await start();
                }
              }
              const sessionId = stateRef.current.session.sessionId;
              if (!sessionId) throw new Error('Live runtime unavailable: could not connect to playground sandbox.');
              return client.mcpTest(sessionId, toolName, toolArgs);
            }} />;

  return <div ref={rootRef} data-theme={activeIdeTheme} style={{ '--ide-opacity': themeOpacity / 100 } as React.CSSProperties} className={`playground-ide ${expanded ? 'is-expanded' : ''}`}>
    <div className="playground-titlebar">
      <div>
        <span className="playground-traffic">
          <i title={expanded ? 'Collapse (Esc)' : 'Close'} onClick={() => expanded && setExpanded(false)} style={expanded ? { cursor: 'pointer' } : undefined} />
          <i />
          <i title={expanded ? 'Collapse (Esc)' : 'Expand to Fullscreen'} onClick={() => setExpanded(v => !v)} style={{ cursor: 'pointer' }} />
        </span>
        <strong>Change Firewall Playground</strong>
        <small>Sample: Contract drift</small>
      </div>
      <div className="playground-titlebar-actions">
        <SessionStatus session={state.session} onStart={() => void start()} />
        <button
          type="button"
          className="playground-theme-mode-btn"
          onClick={() => {
            const nextTheme = activeIdeTheme === 'light' ? 'dark' : 'light';
            handleSetPlaygroundTheme(nextTheme);
          }}
          title={`Switch Playground to ${activeIdeTheme === 'light' ? 'Dark (Blue) mode' : 'Light mode'}`}
          aria-label="Toggle playground theme mode"
        >
          {activeIdeTheme === 'light' ? <Moon /> : <Sun />}
          <span>{activeIdeTheme === 'light' ? 'Dark (Blue)' : 'Light'}</span>
        </button>
        <div ref={themeMenuRef} className="playground-theme-control-wrap">
          <button
            type="button"
            className={`playground-theme-toggle-btn ${themeMenuOpen ? 'is-active' : ''}`}
            onClick={() => setThemeMenuOpen(v => !v)}
            title="Adjust playground theme softness & opacity"
            aria-expanded={themeMenuOpen}
          >
            <SlidersHorizontal />
            <span>{themeOpacity}%</span>
          </button>
          {themeMenuOpen && (
            <div className="playground-theme-popover" role="dialog" aria-label="Theme opacity and mode controls">
              <div className="playground-theme-popover-header">
                <strong>Theme & Mode</strong>
                <span>{themeOpacity}%</span>
              </div>
              <div className="playground-theme-mode-row">
                <span className="playground-theme-section-label">Playground Mode</span>
                <div className="playground-theme-selector">
                  <button
                    type="button"
                    className={playgroundThemeOverride === 'light' ? 'is-active' : ''}
                    onClick={() => handleSetPlaygroundTheme('light')}
                  >
                    <Sun /> Light
                  </button>
                  <button
                    type="button"
                    className={playgroundThemeOverride === 'dark' ? 'is-active' : ''}
                    onClick={() => handleSetPlaygroundTheme('dark')}
                  >
                    <Moon /> Dark (Blue)
                  </button>
                  <button
                    type="button"
                    className={playgroundThemeOverride === 'auto' ? 'is-active' : ''}
                    onClick={() => handleSetPlaygroundTheme('auto')}
                  >
                    <Laptop /> Auto
                  </button>
                </div>
              </div>
              <div className="playground-theme-divider" />
              <div className="playground-theme-popover-header" style={{ marginTop: 0 }}>
                <strong>Intensity / Softness</strong>
              </div>
              <p className="playground-theme-popover-desc">
                {activeIdeTheme === 'light'
                  ? 'Lower to soften bright whites into warm eye-care parchment.'
                  : 'Lower to soften deep pitch blacks into gentle light oceanic blue.'}
              </p>
              <div className="playground-theme-slider-row">
                <span className="playground-slider-label">50%</span>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={themeOpacity}
                  onChange={e => handleOpacityChange(Number(e.target.value))}
                  aria-label="Playground theme opacity slider"
                />
                <span className="playground-slider-label">100%</span>
              </div>
              <div className="playground-theme-presets">
                <button type="button" className={themeOpacity === 100 ? 'is-selected' : ''} onClick={() => handleOpacityChange(100)}>
                  Crisp 100%
                </button>
                <button type="button" className={themeOpacity === 85 ? 'is-selected' : ''} onClick={() => handleOpacityChange(85)}>
                  Balanced 85%
                </button>
                <button type="button" className={themeOpacity === 70 ? 'is-selected' : ''} onClick={() => handleOpacityChange(70)}>
                  Soft 70%
                </button>
              </div>
            </div>
          )}
        </div>
        <button type="button" onClick={() => void reset()}><RotateCcw /> Reset</button>
        <button
          type="button"
          className={expanded ? 'playground-collapse-btn' : ''}
          onClick={() => setExpanded(value => !value)}
          title={expanded ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen'}
        >
          {expanded ? <Shrink /> : <Expand />}
          <span>{expanded ? 'Collapse' : 'Expand'}</span>
          {expanded && <kbd className="playground-kbd-shortcut">Esc</kbd>}
        </button>
      </div>
    </div>
    <nav className="playground-mobile-tabs" aria-label="Playground panes">
      {([
        { id: 'files', label: 'Files', icon: FileCode2 },
        { id: 'code', label: 'Code', icon: Code2 },
        { id: 'commands', label: 'Commands', icon: Command },
        { id: 'terminal', label: 'Terminal', icon: TerminalSquare },
        { id: 'browser', label: 'Browser', icon: Globe2 },
      ] as const).map(({ id, label, icon: Icon }) => (
        <button
          type="button"
          key={id}
          className={state.mobileView === id ? 'is-active' : ''}
          onClick={() => {
            dispatch({ type: 'MOBILE_VIEW', view: id });
            if (id === 'browser') dispatch({ type: 'VIEW', view: 'browser' });
            if (id === 'code') dispatch({ type: 'VIEW', view: 'code' });
            if (id === 'commands') dispatch({ type: 'VIEW', view: 'commands' });
          }}
        >
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
          {id === 'browser' && state.preview?.status === 'ready' && <i className="playground-tab-indicator" />}
        </button>
      ))}
    </nav>
    <div className="playground-workbench">
      <nav className="playground-activity" aria-label="IDE views">
        <button type="button" className={state.mainView === 'code' ? 'is-active' : ''} onClick={() => dispatch({ type: 'VIEW', view: 'code' })} title="Files"><FileCode2 /></button>
        <button type="button" {...anchorProps(COACHMARK_ANCHORS.sourceControlTab)} className={state.mainView === 'source-control' ? 'is-active' : ''} onClick={() => dispatch({ type: 'VIEW', view: 'source-control' })} title="Source control"><GitBranch /><span>{changedCount}</span></button>
        <button type="button" className={state.mainView === 'commands' ? 'is-active' : ''} onClick={() => dispatch({ type: 'VIEW', view: 'commands' })} title="Commands"><Command /></button>
        <button type="button" className={state.mainView === 'mcp' ? 'is-active' : ''} onClick={() => dispatch({ type: 'VIEW', view: 'mcp' })} title="MCP test"><Braces /></button>
      </nav>
      <div className={`playground-mobile-pane pane-${state.mobileView}`}><FileExplorer files={state.files} activePath={state.activePath} disabled={state.session.state === 'provisioning'} onOpen={path => void openFile(path)} onCreate={path => void mutateFile({ operation: 'create', path, content: '' })} onRename={(path, destination) => void mutateFile({ operation: 'rename', path, destination, expectedRevision: state.fileRevision })} onDelete={path => void mutateFile({ operation: 'delete', path, expectedRevision: state.fileRevision })} /></div>
      <div className="playground-main">
        <nav className="playground-main-tabs"><button type="button" className={state.mainView === 'code' ? 'is-active' : ''} onClick={() => dispatch({ type: 'VIEW', view: 'code' })}><Code2 /> Code</button><button type="button" {...anchorProps(COACHMARK_ANCHORS.browserTab)} className={state.mainView === 'browser' ? 'is-active' : ''} onClick={() => dispatch({ type: 'VIEW', view: 'browser' })}><Globe2 /> Browser {state.preview?.status === 'ready' && <i />}</button><button type="button" onClick={() => dispatch({ type: 'VIEW', view: 'commands' })}><BookOpen /> Command guide</button></nav>
        <PanelGroup direction="vertical" className="playground-resizable-stack">
          <Panel defaultSize={58} minSize={24} className={`playground-main-pane ${state.mobileView === 'code' || state.mobileView === 'browser' || state.mobileView === 'commands' ? 'is-mobile-active' : ''}`}>{mainPane}</Panel>
          <PanelResizeHandle className="playground-resize-handle" aria-label="Resize editor and terminal"><span /></PanelResizeHandle>
          <Panel defaultSize={42} minSize={20} className={`playground-terminal-pane ${state.mobileView === 'terminal' ? 'is-mobile-active' : ''}`}>
            <TerminalPane
              connected={connected}
              pty={state.session.capabilities?.pty === true}
              terminals={state.terminals}
              activeTerminalId={state.activeTerminalId}
              suggestedCommand={suggestedCommand}
              theme={activeIdeTheme}
              opacity={themeOpacity}
              onSuggestionConsumed={() => setSuggestedCommand(undefined)}
              onRun={run}
              onStop={stop}
              onInput={data => {
                const active = stateRef.current.terminals.find(item => item.terminalId === stateRef.current.activeTerminalId);
                if (active?.processId && stateRef.current.session.sessionId) {
                  void client.commandInput(stateRef.current.session.sessionId, active.processId, data);
                }
              }}
              onResize={(terminalId, cols, rows) => {
                if (stateRef.current.session.sessionId) {
                  client.resizeTerminal(stateRef.current.session, terminalId, cols, rows);
                }
              }}
              onSelectTerminal={terminalId => dispatch({ type: 'TERMINAL_SELECT', terminalId })}
              onClear={() => dispatch({ type: 'TERMINAL_CLEAR', terminalId: stateRef.current.activeTerminalId, line: line('Terminal view cleared. Running processes were not stopped.', 'system') })}
              onStart={() => void start()}
              onOpenCommands={() => {
                dispatch({ type: 'MOBILE_VIEW', view: 'commands' });
                dispatch({ type: 'VIEW', view: 'commands' });
              }}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
    <div className="playground-statusbar"><span><GitBranch /> {state.git.head || 'no HEAD'} · <strong {...anchorProps(COACHMARK_ANCHORS.gitStatus)}>{changedCount} changed</strong></span><span>{state.saveState === 'dirty' ? 'Unsaved editor change' : state.saveState === 'saving' ? 'Saving…' : 'Saved'} · {state.session.capabilities?.isolation === 'hardened' ? 'Hardened runtime' : state.session.state === 'ready' ? 'Local development runtime' : 'Runtime disconnected'} · CLI {state.session.cliVersion || '—'}</span><button type="button" onClick={() => { setTipsEnabled(value => !value); setTip(undefined); }}><HelpCircle /> {tipsEnabled ? 'Hide tips' : 'Show tips'}</button></div>
    <Coachmark rule={tip} onAction={actOnTip} onDismiss={dismissTip} />
    {dirtyRequest && <UnsavedChangesDialog path={state.activePath} onDecision={resolveDirtyDecision} />}
    <ResetConfirmationDialog
      open={resetConfirmOpen}
      busy={resetting}
      changedCount={changedCount}
      onConfirm={() => void handlePerformReset()}
      onCancel={() => setResetConfirmOpen(false)}
    />
    {expanded && (
      <button
        type="button"
        className="playground-floating-collapse-btn"
        onClick={() => setExpanded(false)}
        title="Exit Fullscreen (Esc)"
        aria-label="Exit Fullscreen"
      >
        <Shrink /> Exit Fullscreen <kbd>Esc</kbd>
      </button>
    )}
  </div>;
}
