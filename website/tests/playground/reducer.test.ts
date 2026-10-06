import { describe, expect, it } from 'vitest';
import { initialState, playgroundReducer } from '../../src/lib/playground/reducer';

describe('playground terminal lifecycle', () => {
  it('does not preload a false disconnected message', () => {
    expect(initialState.terminals[0]?.lines).toEqual([]);
  });

  it('does not restore a false disconnected message after reset', () => {
    const connected = playgroundReducer(initialState, {
      type: 'TERMINAL_LINES',
      terminalId: 'terminal-welcome',
      lines: [{ id: 10, kind: 'system', text: 'Connected to isolated sample.' }],
    });
    const reset = playgroundReducer(connected, { type: 'RESET' });
    expect(reset.terminals[0]?.lines).toEqual([]);
  });
});
