'use client';

import { ChevronDown, ChevronUp, Command, CornerDownLeft, Eraser, Square, TerminalSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { anchorProps, COACHMARK_ANCHORS } from '@/lib/playground/anchors';
import type { TerminalLine, TerminalSession } from '@/lib/playground/types';

interface Props {
  connected: boolean; pty: boolean; terminals: TerminalSession[]; activeTerminalId: string;
  suggestedCommand?: string; theme?: 'light' | 'dark'; opacity?: number; onSuggestionConsumed: () => void; onRun: (command: string) => Promise<void>;
  onStop: () => void; onInput: (data: string) => void; onResize: (terminalId: string, cols: number, rows: number) => void;
  onSelectTerminal: (terminalId: string) => void; onClear: () => void; onStart: () => void;
  onOpenCommands?: () => void;
}

function blendHex(c1: string, c2: string, ratio: number): string {
  const p1 = parseInt(c1.slice(1), 16);
  const p2 = parseInt(c2.slice(1), 16);
  const r1 = (p1 >> 16) & 255, g1 = (p1 >> 8) & 255, b1 = p1 & 255;
  const r2 = (p2 >> 16) & 255, g2 = (p2 >> 8) & 255, b2 = p2 & 255;
  const r = Math.round(r1 * ratio + r2 * (1 - ratio));
  const g = Math.round(g1 * ratio + g2 * (1 - ratio));
  const b = Math.round(b1 * ratio + b2 * (1 - ratio));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function getXtermTheme(theme: 'light' | 'dark' = 'dark', opacity = 100) {
  const ratio = Math.max(0.5, Math.min(1, opacity / 100));
  if (theme === 'light') {
    return {
      background: blendHex('#ffffff', '#f6f2e8', ratio),
      foreground: '#0f172a',
      cursor: '#0284c7',
      selectionBackground: '#cbd5e1',
      black: '#0f172a',
      red: '#dc2626',
      green: '#16a34a',
      yellow: '#ca8a04',
      blue: '#2563eb',
      magenta: '#db2777',
      cyan: '#0284c7',
      white: '#ffffff',
    };
  }
  return {
    background: blendHex('#080b12', '#10213d', ratio),
    foreground: '#d8dee9',
    cursor: '#67e8f9',
    selectionBackground: '#334155',
    black: '#080b12',
    red: '#f87171',
    green: '#34d399',
    yellow: '#fbbf24',
    blue: '#60a5fa',
    magenta: '#f472b6',
    cyan: '#67e8f9',
    white: '#d8dee9',
  };
}

function writeLine(terminal: XTerm, item: TerminalLine) {
  terminal.write(item.kind === 'output' ? item.text : item.kind === 'input' ? `\r\n\x1b[36m$ ${item.text}\x1b[0m\r\n` : `${item.text.replace(/\n/g, '\r\n')}\r\n`);
}

export default function TerminalPane({ connected, pty, terminals, activeTerminalId, suggestedCommand, theme, opacity = 100, onSuggestionConsumed, onRun, onStop, onInput, onResize, onSelectTerminal, onClear, onStart, onOpenCommands }: Props) {
  const [command, setCommand] = useState('change-firewall');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [submitting, setSubmitting] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const xtermRef = useRef<XTerm | undefined>(undefined);
  const renderedLinesRef = useRef(0);
  const renderedTerminalRef = useRef('');
  const pinnedRef = useRef(true);
  const activeTerminalRef = useRef(activeTerminalId);
  const runningRef = useRef(false);
  const sendInputRef = useRef(onInput);
  const resizeRef = useRef(onResize);
  const terminalList = terminals || [];
  const activeTerminal = terminalList.find(item => item.terminalId === activeTerminalId) || terminalList[0];
  activeTerminalRef.current = activeTerminal?.terminalId || activeTerminalId;
  runningRef.current = activeTerminal?.running === true;
  sendInputRef.current = onInput;
  resizeRef.current = onResize;

  useEffect(() => {
    if (!suggestedCommand) return;
    setCommand(suggestedCommand);
    onSuggestionConsumed();
    commandInputRef.current?.focus();
  }, [suggestedCommand, onSuggestionConsumed]);

  useEffect(() => {
    const terminal = xtermRef.current;
    if (!terminal || !activeTerminal) return;
    try {
      if (renderedTerminalRef.current !== activeTerminal.terminalId || renderedLinesRef.current > activeTerminal.lines.length) {
        terminal.reset(); renderedTerminalRef.current = activeTerminal.terminalId; renderedLinesRef.current = 0;
      }
      for (const item of activeTerminal.lines.slice(renderedLinesRef.current)) writeLine(terminal, item);
      renderedLinesRef.current = activeTerminal.lines.length;
      if (pinnedRef.current) {
        requestAnimationFrame(() => {
          terminal.scrollToBottom();
        });
      }
    } catch {}
  }, [activeTerminal]);

  useEffect(() => {
    let isDisposed = false;
    const container = outputRef.current;
    if (!container) return;
    const terminal = new XTerm({ allowTransparency: true, convertEol: true, cursorBlink: true, cursorStyle: 'bar', disableStdin: false, fontFamily: 'var(--font-jetbrains)', fontSize: 12, lineHeight: 1.35, scrollback: 5000, theme: getXtermTheme(theme, opacity) });

    const core = (terminal as any)._core;
    const patchRenderService = (service: any) => {
      if (!service) return;
      const proto = Object.getPrototypeOf(service);
      if (proto && !(proto as any)._guarded) {
        (proto as any)._guarded = true;
        const desc = Object.getOwnPropertyDescriptor(proto, 'dimensions');
        if (desc?.get) {
          const origGet = desc.get;
          Object.defineProperty(proto, 'dimensions', {
            get() {
              if (!this._renderer?.value) {
                return {
                  css: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 } },
                  device: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 }, char: { width: 0, height: 0, left: 0, top: 0 } },
                };
              }
              try {
                return origGet.call(this);
              } catch {
                return {
                  css: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 } },
                  device: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 }, char: { width: 0, height: 0, left: 0, top: 0 } },
                };
              }
            },
            configurable: true,
          });
        }
      }
    };

    if (core?._onWillOpen?.event) {
      core._onWillOpen.event(() => {
        patchRenderService(core._renderService);
      });
    }

    const fit = new FitAddon();
    terminal.loadAddon(fit);
    terminal.open(container);

    patchRenderService(core?._renderService);

    if (core?.viewport) {
      const viewportProto = Object.getPrototypeOf(core.viewport);
      if (viewportProto?.syncScrollArea && !(viewportProto.syncScrollArea as any)._safe) {
        const origSync = viewportProto.syncScrollArea;
        viewportProto.syncScrollArea = function (immediate?: boolean) {
          if (isDisposed || !this._renderService?._renderer?.value) return;
          try {
            return origSync.call(this, immediate);
          } catch {
            return;
          }
        };
        (viewportProto.syncScrollArea as any)._safe = true;
      }
      const instanceSync = core.viewport.syncScrollArea;
      core.viewport.syncScrollArea = function (immediate?: boolean) {
        if (isDisposed || !core._renderService?._renderer?.value) return;
        try {
          return instanceSync.call(this, immediate);
        } catch {
          return;
        }
      };
    }

    const safeFit = () => {
      if (isDisposed || !container || container.clientWidth <= 0 || container.clientHeight <= 0) return;
      if (!core?._renderService?._renderer?.value) {
        requestAnimationFrame(safeFit);
        return;
      }
      try { fit.fit(); } catch {}
    };

    requestAnimationFrame(safeFit);
    xtermRef.current = terminal;

    const selected = terminalList.find(item => item.terminalId === activeTerminalId) || terminalList[0];
    if (selected) {
      renderedTerminalRef.current = selected.terminalId;
      for (const item of selected.lines) writeLine(terminal, item);
      renderedLinesRef.current = selected.lines.length;
    }

    terminal.attachCustomKeyEventHandler(event => {
      if (event.type === 'keydown') {
        if (event.ctrlKey && event.shiftKey && event.key === 'F6') {
          commandInputRef.current?.focus();
          return false;
        }
        if (event.key === 'PageUp') {
          terminal.scrollPages(-1);
          return false;
        }
        if (event.key === 'PageDown') {
          terminal.scrollPages(1);
          return false;
        }
        if (event.shiftKey && event.key === 'ArrowUp') {
          terminal.scrollLines(-1);
          return false;
        }
        if (event.shiftKey && event.key === 'ArrowDown') {
          terminal.scrollLines(1);
          return false;
        }
      }
      return true;
    });

    const data = terminal.onData(value => { if (runningRef.current) sendInputRef.current(value); });
    const scroll = terminal.onScroll(() => {
      if (isDisposed) return;
      try {
        const bottom = terminal.buffer.active.viewportY >= terminal.buffer.active.baseY;
        pinnedRef.current = bottom;
        setAtBottom(bottom);
      } catch {}
    });
    const resized = terminal.onResize(({ cols, rows }) => {
      if (isDisposed) return;
      if (activeTerminalRef.current) resizeRef.current(activeTerminalRef.current, cols, rows);
    });

    // Touch and wheel event handlers to guarantee smooth scrolling in small terminal panes
    const handleWheel = (e: WheelEvent) => {
      if (isDisposed) return;
      const lines = Math.sign(e.deltaY) * Math.max(1, Math.round(Math.abs(e.deltaY) / 25));
      terminal.scrollLines(lines);
      if (e.cancelable) e.preventDefault();
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const diff = touchStartY - currentY;
        const rowHeight = 16;
        if (Math.abs(diff) >= rowHeight) {
          const lines = Math.trunc(diff / rowHeight);
          terminal.scrollLines(lines);
          touchStartY = currentY;
          if (e.cancelable) e.preventDefault();
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    const observer = new ResizeObserver(() => {
      if (isDisposed) return;
      requestAnimationFrame(safeFit);
    });
    observer.observe(container);

    return () => {
      isDisposed = true;
      observer.disconnect();
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      data.dispose();
      scroll.dispose();
      resized.dispose();
      try { terminal.dispose(); } catch {}
      xtermRef.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = getXtermTheme(theme, opacity);
    }
  }, [theme, opacity]);

  const submit = async () => {
    const value = command.trim(); if (!value || submitting) return;
    if (!connected) { onStart(); return; }
    setSubmitting(true); setHistory(current => [...current, value]); setHistoryIndex(-1);
    try { await onRun(value); setCommand(''); } finally { setSubmitting(false); }
  };
  const sendKey = (data: string) => { if (activeTerminal?.running) { onInput(data); xtermRef.current?.focus(); } };

  return <section className="playground-terminal" aria-label="Live terminal">
    <div className="playground-terminal-toolbar">
      <div className="playground-terminal-tabs" role="tablist" aria-label="Terminal sessions">
        {terminalList.map((terminal, index) => <button type="button" role="tab" aria-selected={terminal.terminalId === activeTerminal?.terminalId} className={terminal.terminalId === activeTerminal?.terminalId ? 'is-active' : ''} key={terminal.terminalId} onClick={() => onSelectTerminal(terminal.terminalId)}><TerminalSquare /> Terminal {index + 1}{terminal.running ? <i aria-label="running" /> : ''}</button>)}
        <span>{pty ? 'PTY' : 'STREAM'}</span>
      </div>
      <div className="playground-terminal-actions">
        {onOpenCommands && (
          <button
            type="button"
            className="playground-terminal-cmd-btn"
            title="Browse all CLI commands & guide"
            aria-label="Command Guide"
            onClick={onOpenCommands}
          >
            <Command />
            <span>Commands</span>
          </button>
        )}
        <button type="button" title="Scroll Up" aria-label="Scroll Up" onClick={() => { pinnedRef.current = false; xtermRef.current?.scrollLines(-4); }}><ChevronUp /> Up</button>
        <button type="button" title="Scroll Down" aria-label="Scroll Down" onClick={() => xtermRef.current?.scrollLines(4)}><ChevronDown /> Down</button>
        <button type="button" {...anchorProps(COACHMARK_ANCHORS.processStop)} disabled={!activeTerminal?.running} onClick={onStop}><Square /> Stop</button>
        <button type="button" onClick={onClear}><Eraser /> Clear</button>
      </div>
    </div>
    <div className="playground-terminal-input" {...anchorProps(COACHMARK_ANCHORS.terminalInput)}>
      <span aria-hidden="true" className="playground-terminal-prompt">
        <span className="playground-terminal-prompt-full">/workspace/demo $</span>
        <span className="playground-terminal-prompt-short">$</span>
      </span>
      <input ref={commandInputRef} value={command} disabled={submitting} onChange={event => setCommand(event.target.value)} onKeyDown={event => {
        if (event.key === 'Enter') { event.preventDefault(); void submit(); }
        if (event.key === 'ArrowUp' && history.length) { event.preventDefault(); const next = Math.min(historyIndex + 1, history.length - 1); setHistoryIndex(next); setCommand(history[history.length - 1 - next]); }
        if (event.key === 'ArrowDown') { event.preventDefault(); const next = historyIndex - 1; setHistoryIndex(next); setCommand(next < 0 ? '' : history[history.length - 1 - next]); }
        if (event.ctrlKey && event.key.toLowerCase() === 'c') { event.preventDefault(); activeTerminal?.running ? sendKey('\x03') : onStop(); }
      }} aria-label="Terminal command" placeholder={connected ? 'Type command (e.g. change-firewall)' : 'Start live runtime to run commands'} />
      <button type="button" onClick={() => void submit()} disabled={submitting || !command.trim()}>{connected ? <><CornerDownLeft /> Run</> : 'Start'}</button>
    </div>
    <div className="playground-terminal-quick-bar" aria-label="Quick commands">
      <span className="playground-quick-tag"><Command /> Quick:</span>
      <div className="playground-quick-scroll">
        {[
          { label: 'cf run', cmd: 'change-firewall' },
          { label: 'cf --open', cmd: 'change-firewall --open' },
          { label: 'cf watch', cmd: 'change-firewall watch' },
          { label: 'cf check', cmd: 'change-firewall check' },
          { label: 'git status', cmd: 'git status' },
          { label: 'git diff', cmd: 'git diff' },
        ].map(item => (
          <button
            key={item.cmd}
            type="button"
            className="playground-quick-pill"
            onClick={() => {
              setCommand(item.cmd);
              commandInputRef.current?.focus();
            }}
            title={`Fill: ${item.cmd}`}
          >
            {item.label}
          </button>
        ))}
        {onOpenCommands && (
          <button
            type="button"
            className="playground-quick-pill playground-quick-pill-all"
            onClick={onOpenCommands}
            title="Browse all commands"
          >
            All commands â†’
          </button>
        )}
      </div>
    </div>
    <div className="playground-terminal-output" ref={outputRef} {...anchorProps(COACHMARK_ANCHORS.terminalResult)} aria-label="Interactive terminal output. Press Control Shift F6 to move focus to the command field." />
    {!atBottom && <button className="playground-jump-latest" type="button" onClick={() => { pinnedRef.current = true; setAtBottom(true); xtermRef.current?.scrollToBottom(); }}>Jump to latest</button>}
    <div className="playground-terminal-mobile-controls" aria-label="Terminal control keys">
      <button type="button" disabled={!activeTerminal?.running} onClick={() => sendKey('\x03')}>Ctrl+C</button><button type="button" disabled={!activeTerminal?.running} onClick={() => sendKey('\t')}>Tab</button>
      <button type="button" disabled={!activeTerminal?.running} onClick={() => sendKey('\x1b[D')} aria-label="Left arrow">â†</button><button type="button" disabled={!activeTerminal?.running} onClick={() => sendKey('\x1b[A')} aria-label="Up arrow">â†‘</button><button type="button" disabled={!activeTerminal?.running} onClick={() => sendKey('\x1b[B')} aria-label="Down arrow">â†“</button><button type="button" disabled={!activeTerminal?.running} onClick={() => sendKey('\x1b[C')} aria-label="Right arrow">â†’</button><button type="button" disabled={!activeTerminal?.running} onClick={() => sendKey('\x1b')}>Esc</button>
    </div>
    <p className="playground-terminal-a11y">Terminal output is not announced for every chunk. Focus the terminal canvas for interactive input; press Control Shift F6 to return to the command field. {pty ? 'PTY control keys are available below the output on small screens.' : 'This runtime reports streamed output without PTY support.'}</p>
  </section>;
}
