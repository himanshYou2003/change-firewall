import test from 'node:test';
import assert from 'node:assert/strict';
import { ProtocolError, validateClientMessage, validateRelativePath } from '../index.js';

test('relative paths reject traversal and protected trees', () => {
  for (const value of ['../secret', '/etc/passwd', '.git/config', 'a//b', 'C:/secret']) {
    assert.throws(() => validateRelativePath(value), ProtocolError);
  }
  assert.equal(validateRelativePath('.firewall/memory/invariants.json'), '.firewall/memory/invariants.json');
});

test('client messages are bounded and typed', () => {
  assert.deepEqual(validateClientMessage({ type: 'terminal.resize', terminalId: 't1', cols: 80, rows: 24 }), {
    type: 'terminal.resize', terminalId: 't1', cols: 80, rows: 24,
  });
  assert.throws(() => validateClientMessage({ type: 'terminal.resize', terminalId: 't1', cols: 0, rows: 24 }), ProtocolError);
});
