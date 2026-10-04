'use client';

import { Save } from 'lucide-react';

export default function MobileCodeEditor({ value, path, disabled, onChange, onSave }: { value: string; path: string; disabled?: boolean; onChange: (value: string) => void; onSave: () => void }) {
  return (
    <div className="playground-mobile-editor">
      <div className="playground-mobile-editor-bar">
        <label htmlFor="playground-mobile-code" className="playground-mobile-editor-path">
          <span className="playground-ts-icon">TS</span>
          {path.split('/').pop()}
        </label>
        <button type="button" onClick={onSave} disabled={disabled} className="playground-mobile-save-btn">
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>
      <textarea
        id="playground-mobile-code"
        value={value}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        onChange={event => onChange(event.target.value)}
        onKeyDown={event => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
            event.preventDefault();
            onSave();
          }
        }}
      />
    </div>
  );
}

