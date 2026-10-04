'use client';

import { useState, useRef, useEffect } from 'react';
import { FileCode2, FileJson2, FileText, FolderOpen, Plus, Pencil, Trash2, X } from 'lucide-react';
import { anchorProps, COACHMARK_ANCHORS } from '@/lib/playground/anchors';
import type { PlaygroundFile } from '@/lib/playground/types';

interface Props {
  files: PlaygroundFile[];
  activePath: string;
  disabled: boolean;
  onOpen: (path: string) => void;
  onCreate: (path: string) => void;
  onRename: (path: string, nextPath: string) => void;
  onDelete: (path: string) => void;
}

function FileIcon({ path }: { path: string }) {
  if (path.endsWith('.json')) return <FileJson2 aria-hidden="true" />;
  if (path.endsWith('.md')) return <FileText aria-hidden="true" />;
  return <FileCode2 aria-hidden="true" />;
}

export default function FileExplorer({ files, activePath, disabled, onOpen, onCreate, onRename, onDelete }: Props) {
  const [modal, setModal] = useState<{ type: 'create' } | { type: 'rename'; current: string } | { type: 'delete'; current: string } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modal?.type === 'create') {
      setInputValue('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (modal?.type === 'rename') {
      setInputValue(modal.current);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [modal]);

  const visibleFiles = files.filter(
    file => !file.path.startsWith('.firewall') && !file.path.startsWith('.playground')
  );

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal) return;
    if (modal.type === 'create') {
      const trimmed = inputValue.trim();
      if (trimmed) onCreate(trimmed);
    } else if (modal.type === 'rename') {
      const trimmed = inputValue.trim();
      if (trimmed && trimmed !== modal.current) onRename(modal.current, trimmed);
    } else if (modal.type === 'delete') {
      onDelete(modal.current);
    }
    setModal(null);
  };

  return (
    <>
      <aside className="playground-explorer" aria-label="Sample files" {...anchorProps(COACHMARK_ANCHORS.explorerRoot)}>
        <div className="playground-pane-title">
          <span>EXPLORER</span>
          <span className="playground-pane-actions">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setModal({ type: 'create' })}
              title="Create file"
              aria-label="Create file"
            >
              <Plus />
            </button>
            <button
              type="button"
              disabled={disabled || !activePath}
              onClick={() => setModal({ type: 'rename', current: activePath })}
              title="Rename selected file"
              aria-label="Rename selected file"
            >
              <Pencil />
            </button>
            <button
              type="button"
              disabled={disabled || !activePath}
              onClick={() => setModal({ type: 'delete', current: activePath })}
              title="Delete selected file"
              aria-label="Delete selected file"
            >
              <Trash2 />
            </button>
          </span>
        </div>
        <div className="playground-folder"><FolderOpen aria-hidden="true" /><span>demo</span></div>
        <div className="playground-file-list">
          {visibleFiles.length === 0 && <p className="playground-empty">No editable files returned.</p>}
          {visibleFiles.map(file => (
            <button
              type="button"
              key={file.path}
              className={file.path === activePath ? 'is-active' : ''}
              onClick={() => onOpen(file.path)}
              {...(file.path === '.firewall/memory/invariants.json' ? anchorProps(COACHMARK_ANCHORS.memoryFile) : {})}
            >
              <FileIcon path={file.path} />
              <span className="playground-file-path">{file.path}</span>
              {file.status && <span className={`playground-git-mark status-${file.status}`} aria-label={`${file.status} Git status`}>{file.status}</span>}
            </button>
          ))}
        </div>
      </aside>

      {modal && (
        <div className="playground-dialog-backdrop" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="playground-dialog" role="dialog" aria-modal="true" style={{ maxWidth: 380 }}>
            <button
              type="button"
              className="playground-dialog-close"
              onClick={() => setModal(null)}
              aria-label="Close dialog"
            >
              <X size={15} />
            </button>

            <h3 className="playground-reset-dialog-title" style={{ marginBottom: 8 }}>
              {modal.type === 'create' && 'New File'}
              {modal.type === 'rename' && 'Rename File'}
              {modal.type === 'delete' && 'Delete File'}
            </h3>

            {modal.type === 'delete' ? (
              <div>
                <p className="playground-reset-dialog-desc" style={{ marginBottom: 16 }}>
                  Are you sure you want to delete <strong>{modal.current}</strong>? You can restore it anytime with Reset.
                </p>
                <div className="playground-dialog-actions">
                  <button type="button" className="playground-dialog-btn-secondary" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button type="button" className="playground-dialog-btn-danger" onClick={handleModalSubmit}>
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit}>
                <p className="playground-reset-dialog-desc" style={{ marginBottom: 8 }}>
                  {modal.type === 'create'
                    ? 'Enter relative path inside sample workspace (e.g. src/utils.ts):'
                    : `Rename ${modal.current} to:`}
                </p>
                <input
                  ref={inputRef}
                  type="text"
                  className="playground-dialog-input"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={modal.type === 'create' ? 'src/example.ts' : modal.current}
                  required
                />
                <div className="playground-dialog-actions">
                  <button type="button" className="playground-dialog-btn-secondary" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="playground-btn playground-btn-primary">
                    {modal.type === 'create' ? 'Create' : 'Rename'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
