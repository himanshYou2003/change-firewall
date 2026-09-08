import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import { generateSymbolicCrashTraces } from '../src/core/symbolic/trace-engine.js';
import type { ASTDiff, BlastRadius } from '../src/types/index.js';

describe('Symbolic Failure Trace Engine', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'firewall-trace-test-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Cleanup
    }
  });

  it('symbolically proves unhandled null runtime crash when consumer lacks guards', async () => {
    // Setup consumer file that calls getUser() and accesses .tier without null check
    const consumerPath = path.join(tempDir, 'src/routes/profile.ts');
    await fs.mkdir(path.dirname(consumerPath), { recursive: true });
    await fs.writeFile(
      consumerPath,
      `import { getUser } from '../services/user.js';
export function handleProfile(id: string) {
  const user = getUser(id);
  return { tier: user.tier };
}`,
      'utf8'
    );

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

    const blastMap: Record<string, BlastRadius> = {
      'src/services/user.ts': {
        filePath: 'src/services/user.ts',
        directDependents: ['src/routes/profile.ts'],
        indirectDependents: [],
        affectedRoutes: ['src/routes/profile.ts'],
        affectedServices: [],
        affectedTests: [],
        totalConsumers: 1,
        level: 'HIGH',
      },
    };

    const traces = await generateSymbolicCrashTraces(diffs, blastMap, tempDir);

    expect(traces.length).toBe(1);
    const trace = traces[0];
    expect(trace.failureType).toBe('UNHANDLED_NULL');
    expect(trace.simulatedException).toContain('TypeError: Cannot read properties of null');
    expect(trace.proofSteps.length).toBe(3);
    expect(trace.preventativeFix).toContain('optional chaining');
  });

  it('does not generate crash trace if consumer uses optional chaining guard', async () => {
    const consumerPath = path.join(tempDir, 'src/routes/guarded.ts');
    await fs.mkdir(path.dirname(consumerPath), { recursive: true });
    await fs.writeFile(
      consumerPath,
      `import { getUser } from '../services/user.js';
export function handleProfile(id: string) {
  const user = getUser(id);
  return { tier: user?.tier };
}`,
      'utf8'
    );

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

    const blastMap: Record<string, BlastRadius> = {
      'src/services/user.ts': {
        filePath: 'src/services/user.ts',
        directDependents: ['src/routes/guarded.ts'],
        indirectDependents: [],
        affectedRoutes: [],
        affectedServices: [],
        affectedTests: [],
        totalConsumers: 1,
        level: 'LOW',
      },
    };

    const traces = await generateSymbolicCrashTraces(diffs, blastMap, tempDir);
    expect(traces.length).toBe(0);
  });
});
