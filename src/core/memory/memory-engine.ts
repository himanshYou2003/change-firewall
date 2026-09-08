import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as path from 'node:path';
import type { ASTDiff, BrokenInvariant, FirewallMemory } from '../../types/index.js';

const MEMORY_DIR = '.firewall/memory';
const INVARIANTS_FILE = 'invariants.json';

interface StoredInvariant {
  symbolOrFile: string;
  signature: string;
  returnShape?: string;
  isNullable: boolean;
  firstObservedCommit?: string;
  observedCommitsCount: number;
  lastVerifiedAt: string;
}

interface StoredMemoryData {
  version: string;
  baselineCommit?: string;
  lastApprovalDate?: string;
  invariants: Record<string, StoredInvariant>;
}

export async function loadFirewallMemory(projectRoot: string): Promise<FirewallMemory> {
  const memoryPath = path.join(projectRoot, MEMORY_DIR, INVARIANTS_FILE);

  let data: StoredMemoryData = {
    version: '1.0.0',
    invariants: {},
  };

  try {
    const raw = await fs.readFile(memoryPath, 'utf8');
    data = JSON.parse(raw);
  } catch {
    // Memory doesn't exist yet, clean state
  }

  const invariantsCount = Object.keys(data.invariants).length;

  return {
    invariantsCount,
    baselineCommit: data.baselineCommit,
    historicalStability: invariantsCount > 10 ? 'HIGH' : 'MEDIUM',
    brokenInvariants: [],
    lastApprovalDate: data.lastApprovalDate,
    rawInvariants: data.invariants,
  };
}

export function evaluateBrokenInvariants(
  diffs: ASTDiff[],
  projectRoot: string,
  storedInvariants?: Record<string, StoredInvariant>
): BrokenInvariant[] {
  const broken: BrokenInvariant[] = [];
  let invariants: Record<string, StoredInvariant> = storedInvariants || {};

  if (!storedInvariants) {
    try {
      const memoryPath = path.join(projectRoot, MEMORY_DIR, INVARIANTS_FILE);
      const raw = fsSync.readFileSync(memoryPath, 'utf8');
      const data = JSON.parse(raw);
      invariants = data.invariants || {};
    } catch {
      invariants = {};
    }
  }

  for (const diff of diffs) {
    // 1. Check Return Shape Invariants
    const fileInvariant = invariants[diff.filePath];
    if (fileInvariant && diff.returnShapeChanged) {
      broken.push({
        symbolOrFile: diff.filePath,
        rule: `Payload shape must match baseline '${fileInvariant.returnShape || 'original'}'`,
        historicalDuration: `${fileInvariant.observedCommitsCount || 10}+ commits verified`,
        mutation: `Return shape mutated from '${diff.beforeReturnShape}' to '${diff.afterReturnShape}'`,
      });
    }

    // 2. Check Symbol Nullability Invariants
    for (const sym of diff.symbols) {
      const key = `${diff.filePath}#${sym.name}`;
      const invariant = invariants[key];

      const returnPart = sym.afterSignature?.includes(')')
        ? sym.afterSignature.slice(sym.afterSignature.lastIndexOf(')'))
        : (sym.afterSignature || '');
      const beforeReturnPart = sym.beforeSignature?.includes(')')
        ? sym.beforeSignature.slice(sym.beforeSignature.lastIndexOf(')'))
        : (sym.beforeSignature || '');

      const isNullWidened =
        (returnPart.includes('| null') || returnPart.includes('| undefined') || returnPart.includes('null')) &&
        (!beforeReturnPart.includes('| null') && !beforeReturnPart.includes('| undefined') && !beforeReturnPart.includes('null'));

      if (isNullWidened) {
        broken.push({
          symbolOrFile: sym.name,
          rule: 'Contract guaranteed non-nullable return value',
          historicalDuration: invariant ? `${invariant.observedCommitsCount} commits` : 'Pre-existing invariant',
          mutation: `Type widened to include null/undefined: '${sym.afterSignature}'`,
        });
      } else if (sym.changeType === 'removed') {
        broken.push({
          symbolOrFile: sym.name,
          rule: 'Public symbol must remain exported for downstream consumers',
          historicalDuration: invariant ? `${invariant.observedCommitsCount} commits` : 'Established API export',
          mutation: `Exported symbol '${sym.name}' was deleted`,
        });
      } else if (invariant && invariant.signature && sym.afterSignature && invariant.signature !== sym.afterSignature) {
        broken.push({
          symbolOrFile: sym.name,
          rule: `Export signature must adhere to established contract '${invariant.signature}'`,
          historicalDuration: `${invariant.observedCommitsCount || 1} commit(s) verified`,
          mutation: `Signature changed from '${invariant.signature}' to '${sym.afterSignature}'`,
        });
      }
    }
  }

  return broken;
}

export async function recordMemorySnapshot(
  projectRoot: string,
  headCommit: string,
  diffs: ASTDiff[]
): Promise<void> {
  const memoryDir = path.join(projectRoot, MEMORY_DIR);
  const memoryPath = path.join(memoryDir, INVARIANTS_FILE);

  try {
    await fs.mkdir(memoryDir, { recursive: true });
  } catch {
    // Already exists
  }

  let data: StoredMemoryData = {
    version: '1.0.0',
    baselineCommit: headCommit,
    invariants: {},
  };

  try {
    const raw = await fs.readFile(memoryPath, 'utf8');
    data = JSON.parse(raw);
  } catch {
    // Initialize
  }

  data.baselineCommit = headCommit;
  data.lastApprovalDate = new Date().toISOString();

  for (const diff of diffs) {
    if (diff.beforeReturnShape) {
      data.invariants[diff.filePath] = {
        symbolOrFile: diff.filePath,
        signature: 'endpoint',
        returnShape: diff.afterReturnShape || diff.beforeReturnShape,
        isNullable: false,
        firstObservedCommit: headCommit,
        observedCommitsCount: (data.invariants[diff.filePath]?.observedCommitsCount || 0) + 1,
        lastVerifiedAt: new Date().toISOString(),
      };
    }

    for (const sym of diff.symbols) {
      const key = `${diff.filePath}#${sym.name}`;
      const existing = data.invariants[key];
      const isNullable = Boolean(
        sym.afterSignature?.includes('| null') || sym.afterSignature?.includes('| undefined')
      );

      data.invariants[key] = {
        symbolOrFile: sym.name,
        signature: sym.afterSignature || sym.beforeSignature || '',
        isNullable,
        firstObservedCommit: existing?.firstObservedCommit || headCommit,
        observedCommitsCount: (existing?.observedCommitsCount || 0) + 1,
        lastVerifiedAt: new Date().toISOString(),
      };
    }
  }

  await fs.writeFile(memoryPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function resetMemory(projectRoot: string): Promise<void> {
  const memoryPath = path.join(projectRoot, MEMORY_DIR, INVARIANTS_FILE);
  try {
    await fs.unlink(memoryPath);
  } catch {
    // Ignore if not present
  }
}
