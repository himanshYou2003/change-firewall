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

  it('symbolically proves missing argument exception when function adds required parameter', async () => {
    const consumerPath = path.join(tempDir, 'src/pages/calculator.ts');
    await fs.mkdir(path.dirname(consumerPath), { recursive: true });
    await fs.writeFile(
      consumerPath,
      `import { getInsurers } from '../features/utils.js';
export function renderPage() {
  const list = getInsurers('channelA');
  return list;
}`,
      'utf8'
    );

    const diffs: ASTDiff[] = [
      {
        filePath: 'src/features/utils.ts',
        symbols: [
          {
            name: 'getInsurers',
            kind: 'function',
            changeType: 'modified',
            beforeSignature: 'getInsurers(channel: string)',
            afterSignature: 'getInsurers(channel: string, customInsurers: any)',
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
      'src/features/utils.ts': {
        filePath: 'src/features/utils.ts',
        directDependents: ['src/pages/calculator.ts'],
        indirectDependents: [],
        affectedRoutes: [],
        affectedServices: [],
        affectedTests: [],
        totalConsumers: 1,
        level: 'HIGH',
      },
    };

    const traces = await generateSymbolicCrashTraces(diffs, blastMap, tempDir);

    expect(traces.length).toBe(1);
    const trace = traces[0];
    expect(trace.failureType).toBe('UNCAUGHT_EXCEPTION');
    expect(trace.simulatedException).toContain("TypeError: Missing required argument 'customInsurers'");
    expect(trace.consumerFile).toBe('src/pages/calculator.ts');
    expect(trace.consumerLine).toBe(3);
    expect(trace.proofSteps.length).toBe(3);
    expect(trace.preventativeFix).toContain("customInsurers = null");
  });
});
