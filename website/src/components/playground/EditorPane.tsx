'use client';

import { AlertTriangle, Check, Loader2, Save } from 'lucide-react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useCallback } from 'react';
import { anchorProps, COACHMARK_ANCHORS } from '@/lib/playground/anchors';
import type { PlaygroundState } from '@/lib/playground/types';
import MobileCodeEditor from './MobileCodeEditor';

interface Props {
  path: string;
  content: string;
  saveState: PlaygroundState['saveState'];
  saveError?: string;
  disabled: boolean;
  theme?: 'light' | 'dark';
  onChange: (content: string) => void;
  onSave: () => void;
  onReload: () => void;
}

export default function EditorPane({ path, content, saveState, saveError, disabled, theme, onChange, onSave, onReload }: Props) {
  const mountEditor = useCallback<OnMount>((editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => onSave());
  }, [onSave]);
  return (
    <section className="playground-editor" aria-label={`Editing ${path}`}>
      <div className="playground-editor-tabs">
        <span className="is-active"><span className="playground-ts-icon">TS</span>{path.split('/').pop()}{saveState === 'dirty' ? ' ●' : ''}</span>
        <div className={`playground-save-state is-${saveState}`} {...anchorProps(COACHMARK_ANCHORS.editorSave)} aria-live="polite">
          {saveState === 'saving' && <Loader2 className="animate-spin" />}
          {saveState === 'saved' && <Check />}
          {(saveState === 'error' || saveState === 'conflict') && <AlertTriangle />}
          <span>{saveState === 'dirty' ? 'Unsaved' : saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : saveState === 'conflict' ? 'Save conflict' : saveState === 'error' ? 'Save failed' : 'Saved'}</span>
          <button type="button" disabled={saveState === 'saving'} onClick={onSave} title="Save file"><Save /> Save</button>
        </div>
      </div>
      {(saveState === 'error' || saveState === 'conflict') && (
        <div className="playground-editor-error" role="alert">
          <span>{saveError || 'The file could not be saved. Your local text is preserved.'}</span>
          {saveState === 'conflict' && <button type="button" onClick={onReload}>Load server version</button>}
        </div>
      )}
      <div className="playground-code-wrap">
        <Editor
          path={`file:///workspace/demo/${path}`}
          language={path.endsWith('.json') ? 'json' : path.endsWith('.md') ? 'markdown' : 'typescript'}
          value={content}
          onChange={value => onChange(value ?? '')}
          onMount={mountEditor}
          theme={theme === 'light' ? 'vs' : 'vs-dark'}
          loading={<div className="playground-loading"><span />Loading Monaco editor…</div>}
          options={{ readOnly: false, minimap: { enabled: false }, fontFamily: 'var(--font-jetbrains)', fontSize: 13, lineHeight: 21, padding: { top: 12 }, scrollBeyondLastLine: false, automaticLayout: true, wordWrap: 'on', tabSize: 2, accessibilitySupport: 'auto', ariaLabel: `Code editor for ${path}` }}
        />
      </div>
      <MobileCodeEditor value={content} path={path} disabled={false} onChange={onChange} onSave={onSave} />
    </section>
  );
}
