'use client';

import { useEffect, useRef } from 'react';

export type DirtyDecision = 'save' | 'discard' | 'cancel';

export default function UnsavedChangesDialog({ path, onDecision }: { path: string; onDecision: (decision: DirtyDecision) => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    saveRef.current?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onDecision('cancel'); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled)'));
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [onDecision]);
  return <div className="playground-dialog-backdrop">
    <div ref={dialogRef} className="playground-dialog" role="alertdialog" aria-modal="true" aria-labelledby="playground-dirty-title" aria-describedby="playground-dirty-description">
      <h3 id="playground-dirty-title">Save changes?</h3>
      <p id="playground-dirty-description"><strong>{path}</strong> has editor changes. Choose what to do before leaving this file.</p>
      <div><button ref={saveRef} type="button" className="is-primary" onClick={() => onDecision('save')}>Save</button><button type="button" onClick={() => onDecision('discard')}>Discard</button><button type="button" onClick={() => onDecision('cancel')}>Cancel</button></div>
    </div>
  </div>;
}
