'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GENERATED_COMMAND_MANIFEST, MANIFEST_HELP_ITEMS, PLAYGROUND_COMMANDS } from '@/lib/playground/commands';
import { anchorProps, COACHMARK_ANCHORS } from '@/lib/playground/anchors';

export default function CommandPalette({ onFill }: { onFill: (command: string) => void }) {
  const [query, setQuery] = useState('');
  const commands = useMemo(() => PLAYGROUND_COMMANDS.filter(item => `${item.family} ${item.title} ${item.command} ${item.description}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const manifestItems = useMemo(() => MANIFEST_HELP_ITEMS.filter(item => `${item.name} ${item.help}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <section className="playground-command-palette" {...anchorProps(COACHMARK_ANCHORS.commandList)}>
      <div className="playground-command-search"><Search /><input aria-label="Search commands" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search every CLI family and sample Git command" /></div>
      <p>Suggestions fill editable terminal text. They never run without Enter or the Run button. CLI {GENERATED_COMMAND_MANIFEST.version} help was generated from the pinned executable.</p>
      <div className="playground-command-results">
        {commands.map(item => (
          <button type="button" key={item.id} onClick={() => onFill(item.command)} title={`Fill "${item.command}" into terminal`}>
            <div className="playground-command-item-header">
              <span>{item.family}</span>
              <span className="playground-command-run-badge">Tap to fill ↵</span>
            </div>
            <strong>{item.title}</strong>
            <code>{item.command}</code>
            <small>{item.description} {item.note}</small>
          </button>
        ))}
        {manifestItems.map(item => (
          <button type="button" key={`manifest-${item.name}`} onClick={() => onFill(item.command)} title={`Fill "${item.command}" into terminal`}>
            <div className="playground-command-item-header">
              <span>Generated help</span>
              <span className="playground-command-run-badge">Tap to fill ↵</span>
            </div>
            <strong>{item.name === 'root' ? 'Root command and options' : `${item.name} options`}</strong>
            <code>{item.command}</code>
            <small className="playground-manifest-help">{item.help}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
