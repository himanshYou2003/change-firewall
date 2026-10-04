'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, Check, Loader2, RotateCcw, X } from 'lucide-react';

interface Props {
  open: boolean;
  busy?: boolean;
  changedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ResetConfirmationDialog({ open, busy, changedCount, onConfirm, onCancel }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmBtnRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="playground-dialog-backdrop" onClick={e => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div
        ref={dialogRef}
        className="playground-dialog playground-reset-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-desc"
      >
        <button
          type="button"
          className="playground-dialog-close"
          onClick={onCancel}
          disabled={busy}
          aria-label="Close dialog"
        >
          <X size={15} />
        </button>

        <div className="playground-reset-dialog-icon">
          <RotateCcw size={22} />
        </div>

        <h3 id="reset-dialog-title" className="playground-reset-dialog-title">
          Reset Playground Workspace?
        </h3>

        <p id="reset-dialog-desc" className="playground-reset-dialog-desc">
          This will restore the sample project to its original baseline state.
        </p>

        <div className="playground-reset-dialog-card">
          <div className="playground-reset-item">
            <span className="playground-reset-dot" />
            <span>Restores fixture files to fresh <strong>contract-drift</strong> sample</span>
          </div>
          {changedCount > 0 && (
            <div className="playground-reset-item is-warning">
              <AlertTriangle size={13} />
              <span>Discards <strong>{changedCount} uncommitted change{changedCount === 1 ? '' : 's'}</strong> in Git</span>
            </div>
          )}
          <div className="playground-reset-item">
            <span className="playground-reset-dot" />
            <span>Stops running commands and clears terminal history</span>
          </div>
          <div className="playground-reset-item">
            <span className="playground-reset-dot" />
            <span>Re-provisions memory contracts and restarts runtime session</span>
          </div>
        </div>

        <div className="playground-dialog-actions">
          <button
            type="button"
            className="playground-dialog-btn-secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className="playground-dialog-btn-danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 className="animate-spin" size={14} /> Resetting workspace…
              </>
            ) : (
              <>
                <RotateCcw size={14} /> Reset Workspace
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
