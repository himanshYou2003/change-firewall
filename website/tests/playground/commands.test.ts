import { describe, expect, it } from 'vitest';
import { GENERATED_COMMAND_MANIFEST, MANIFEST_HELP_ITEMS, PLAYGROUND_COMMANDS } from '@/lib/playground/commands';

describe('playground command coverage', () => {
  it('exposes generated help for every pinned CLI command family', () => {
    const helpNames = new Set(MANIFEST_HELP_ITEMS.map(item => item.name));
    expect(helpNames.has('root')).toBe(true);
    for (const command of GENERATED_COMMAND_MANIFEST.commands) expect(helpNames.has(command.name)).toBe(true);
  });

  it('keeps suggestions as editable commands rather than canned output', () => {
    expect(PLAYGROUND_COMMANDS.length).toBeGreaterThan(15);
    expect(PLAYGROUND_COMMANDS.every(item => item.command.length > 0 && !item.command.includes('\n'))).toBe(true);
  });

  it('retains critical real workflows', () => {
    const commands = PLAYGROUND_COMMANDS.map(item => item.command);
    expect(commands).toContain('npx change-firewall --open');
    expect(commands).toContain('npx change-firewall memory record');
    expect(commands).toContain('git status --short');
  });
});
