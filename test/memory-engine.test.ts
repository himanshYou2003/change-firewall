import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  loadFirewallMemory,
  recordMemorySnapshot,
  evaluateBrokenInvariants,
  resetMemory,
} from '../src/core/memory/memory-engine.js';
import type { ASTDiff } from '../src/types/index.js';

describe('Persistent Firewall Memory Engine', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'firewall-mem-test-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup
    }
  });

  it('records snapshots and loads invariants from memory', async () => {
    const diffs: ASTDiff[] = [
      {
        filePath: 'src/services/user.ts',
        symbols: [
          {
            name: 'getUser',
            kind: 'function',
            changeType: 'added',
            afterSignature: 'getUser(id: string): User',
          },
        ],
        returnShapeChanged: false,
        authConditionChanged: false,
        errorHandlingChanged: false,
        validationChanged: false,
        callsAdded: [],
        callsRemoved: [],
        details: [],
      },
    ];

    await recordMemorySnapshot(tempDir, 'commit-abc123', diffs);
    const mem = await loadFirewallMemory(tempDir);

    expect(mem.invariantsCount).toBe(1);
    expect(mem.baselineCommit).toBe('commit-abc123');

    // Resetting memory
    await resetMemory(tempDir);
    const cleanMem = await loadFirewallMemory(tempDir);
    expect(cleanMem.invariantsCount).toBe(0);
  });

  it('evaluates broken invariants when established contract is widened or deleted', () => {
    const diffs: ASTDiff[] = [
      {
        filePath: 'src/services/user.ts',
        symbols: [
          {
            name: 'getUser',
            kind: 'function',
            changeType: 'modified',
            beforeSignature: 'getUser(id: string): User',
            afterSignature: 'getUser(id: string): User | null',
          },
        ],
        returnShapeChanged: false,
        authConditionChanged: false,
        errorHandlingChanged: false,
        validationChanged: false,
        callsAdded: [],
        callsRemoved: [],
        details: [],
      },
    ];

    const broken = evaluateBrokenInvariants(diffs, tempDir);
    expect(broken.length).toBe(1);
    expect(broken[0].symbolOrFile).toBe('getUser');
    expect(broken[0].rule).toContain('non-nullable');
  });
});
