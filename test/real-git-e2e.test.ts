import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

describe('Live Sandbox End-to-End Git Verification', () => {
  const sandboxDir = path.resolve(process.cwd(), 'test/sandbox-test-env');
  const binPath = path.resolve(process.cwd(), 'bin/change-firewall.js');

  beforeAll(async () => {
    // 1. Clean and create sandbox directory
    await fs.rm(sandboxDir, { recursive: true, force: true });
    await fs.mkdir(path.join(sandboxDir, 'src/routes'), { recursive: true });
    await fs.mkdir(path.join(sandboxDir, 'src/middleware'), { recursive: true });
    await fs.mkdir(path.join(sandboxDir, 'src/client'), { recursive: true });

    // 2. Initialize Git repo
    await execFileAsync('git', ['init'], { cwd: sandboxDir });
    await execFileAsync('git', ['config', 'user.name', 'Test Engineer'], { cwd: sandboxDir });
    await execFileAsync('git', ['config', 'user.email', 'test@firewall.dev'], { cwd: sandboxDir });

    // 3. Write initial files
    await fs.writeFile(
      path.join(sandboxDir, 'src/middleware/auth.ts'),
      `export function requireAuth(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).send("Unauthorized");
  }
  next();
}`
    );

    await fs.writeFile(
      path.join(sandboxDir, 'src/routes/user.ts'),
      `import { requireAuth } from '../middleware/auth.js';

export async function getUser(req: any, res: any) {
  const user = { id: req.params.id, name: 'Alice' };
  return user;
}`
    );

    await fs.writeFile(
      path.join(sandboxDir, 'src/client/api.ts'),
      `import { getUser } from '../routes/user.js';

export async function fetchProfile(id: string) {
  const user = await getUser({ params: { id } }, {});
  return user.name;
}`
    );

    // Initial git commit
    await execFileAsync('git', ['add', '.'], { cwd: sandboxDir });
    await execFileAsync('git', ['commit', '-m', 'Initial working application'], { cwd: sandboxDir });

    // 4. Simulate AI Modification (The Golden Moment)
    // AI modifies auth condition
    await fs.writeFile(
      path.join(sandboxDir, 'src/middleware/auth.ts'),
      `export function requireAuth(req: any, res: any, next: any) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Forbidden: Admin role required");
  }
  next();
}`
    );

    // AI wraps API response in object
    await fs.writeFile(
      path.join(sandboxDir, 'src/routes/user.ts'),
      `import { requireAuth } from '../middleware/auth.js';

export async function getUser(req: any, res: any) {
  const user = { id: req.params.id, name: 'Alice' };
  return { user };
}`
    );
  });

  afterAll(async () => {
    await fs.rm(sandboxDir, { recursive: true, force: true });
  });

  it('verifies CLI analyze command against real uncommitted git working tree', async () => {
    const { stdout } = await execFileAsync('node', [binPath, 'analyze'], { cwd: sandboxDir });
    
    expect(stdout).toContain('CHANGE FIREWALL');
    expect(stdout).toContain('BEHAVIORAL FINDINGS');
    expect(stdout).toContain('Authentication / Authorization Logic Changed');
    expect(stdout).toContain('API Response Contract Mutated');
    expect(stdout).toContain('src/middleware/auth.ts');
    expect(stdout).toContain('src/routes/user.ts');
  });

  it('verifies CLI analyze --json emits fully compliant machine-readable output', async () => {
    const { stdout } = await execFileAsync('node', [binPath, 'analyze', '--json'], { cwd: sandboxDir });
    
    const parsed = JSON.parse(stdout);
    expect(parsed.totalFilesChanged).toBe(2);
    expect(parsed.behavioralChangesCount).toBeGreaterThanOrEqual(2);
    expect(parsed.risk.score).toBeGreaterThanOrEqual(60);
    expect(parsed.risk.level).toMatch(/HIGH|CRITICAL/);

    const authFinding = parsed.findings.find((f: any) => f.category === 'AUTH');
    expect(authFinding).toBeDefined();
    expect(authFinding.severity).toBe('HIGH');

    const apiFinding = parsed.findings.find((f: any) => f.category === 'API_CONTRACT');
    expect(apiFinding).toBeDefined();
  });

  it('verifies CLI preflight command correctly exits with code 1 when merge is blocked', async () => {
    let failed = false;
    try {
      await execFileAsync('node', [binPath, 'preflight'], { cwd: sandboxDir });
    } catch (err: any) {
      failed = true;
      expect(err.code).toBe(1);
      expect(err.stdout).toContain('MERGE BLOCKED / REVIEW REQUIRED');
      expect(err.stdout).toContain('BLOCKING REASONS');
    }
    expect(failed).toBe(true);
  });

  it('verifies CLI preflight command correctly exits with code 0 when relaxed threshold is met', async () => {
    const { stdout } = await execFileAsync(
      'node',
      [binPath, 'preflight', '-m', '100', '--no-fail-on-high'],
      { cwd: sandboxDir }
    );
    expect(stdout).toContain('APPROVED / SAFE TO MERGE');
  });

  it('verifies CLI impact command correctly calculates real downstream consumers', async () => {
    const { stdout } = await execFileAsync(
      'node',
      [binPath, 'impact', 'src/middleware/auth.ts'],
      { cwd: sandboxDir }
    );
    expect(stdout).toContain('BLAST RADIUS INSPECTION');
    expect(stdout).toContain('src/routes/user.ts');
  });
});
