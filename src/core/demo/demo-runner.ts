import pc from 'picocolors';
import type { AnalysisReport, BehavioralFinding, BlastRadius, SuspiciousChange, GitTimelineItem } from '../../types/index.js';
import { renderTerminalReport } from '../reporter/terminal-reporter.js';
import { startDashboardServer } from '../../dashboard/server.js';

export interface DemoOptions {
  port?: number;
  open?: boolean;
}

export function generateDemoReport(): AnalysisReport {
  const findings: BehavioralFinding[] = [
    {
      id: 'demo-1',
      category: 'AUTH',
      title: 'Authentication & Authorization Behavior Mutated',
      description: 'Previously authenticated users could access /dashboard. Now, only users satisfying the new role condition can access /dashboard.',
      severity: 'HIGH',
      confidence: 94,
      filePath: 'src/middleware/auth.ts',
      beforeSnippet: 'if (!req.user) throw new UnauthorizedError();',
      afterSnippet: 'if (!req.user || req.user.role !== "admin") throw new ForbiddenError();',
      evidence: [
        'Middleware condition changed from basic user check to strict role check.',
        'Affects 5 protected routes: /api/dashboard, /api/settings, /api/reports, /api/billing, /api/team.',
        '7 downstream consumers detected.',
        'No corresponding authorization regression tests modified in this commit.',
      ],
      affectedFiles: [
        'src/routes/dashboard.ts',
        'src/routes/settings.ts',
        'src/routes/reports.ts',
        'src/routes/billing.ts',
        'src/routes/team.ts',
      ],
      recommendation: 'Review authentication behavior and execute end-to-end access control tests before merging.',
    },
    {
      id: 'demo-2',
      category: 'API_CONTRACT',
      title: 'API Response Contract Changed (Object Wrapper)',
      description: 'GET /api/user return shape modified from User to { user: User }. 7 downstream consumers detected.',
      severity: 'MEDIUM',
      confidence: 91,
      filePath: 'src/routes/user.ts',
      beforeSnippet: 'return user;',
      afterSnippet: 'return { user };',
      evidence: [
        'Return statement modified from direct User object to wrapped { user } object.',
        '4 direct client consumers detected: userClient.ts, profile.tsx, navigation.tsx, billingService.ts.',
        'Existing API client tests expect previous root-level property structure.',
      ],
      affectedFiles: [
        'src/client/userClient.ts',
        'src/views/profile.tsx',
        'src/components/navigation.tsx',
        'src/services/billingService.ts',
      ],
      recommendation: 'Audit API client bindings and ensure client response deserializers are updated.',
    },
    {
      id: 'demo-3',
      category: 'FUNCTION_CONTRACT',
      title: 'Function Contract Widened: findUser(id)',
      description: 'findUser(id) return type widened from User to User | null.',
      severity: 'LOW',
      confidence: 89,
      filePath: 'src/services/userService.ts',
      beforeSnippet: 'findUser(id: string): User',
      afterSnippet: 'findUser(id: string): User | null',
      evidence: [
        'Nullable union added to return type annotation.',
        'Callers must verify null-guards.',
      ],
      affectedFiles: ['src/services/userService.ts'],
      recommendation: 'Ensure calling methods guard against potential null return values.',
    },
    {
      id: 'demo-4',
      category: 'VALIDATION',
      title: 'Payload Validation Logic Introduced',
      description: 'Added strict schema validation for user profile update requests.',
      severity: 'LOW',
      confidence: 96,
      filePath: 'src/routes/user.ts',
      evidence: [
        'Added userUpdateSchema.parse(req.body) before database mutation.',
        'Invalid payloads now trigger 400 Bad Request.',
      ],
      affectedFiles: ['src/routes/user.ts'],
      recommendation: 'Verify that valid existing client payloads are not rejected by the stricter schema.',
    },
  ];

  const blastRadiusMap: Record<string, BlastRadius> = {
    'src/middleware/auth.ts': {
      filePath: 'src/middleware/auth.ts',
      directDependents: ['src/routes/dashboard.ts', 'src/routes/settings.ts', 'src/routes/reports.ts'],
      indirectDependents: ['src/app.ts', 'src/server.ts'],
      affectedRoutes: ['src/routes/dashboard.ts', 'src/routes/settings.ts', 'src/routes/reports.ts'],
      affectedServices: [],
      affectedTests: [],
      totalConsumers: 7,
      level: 'HIGH',
    },
    'src/routes/user.ts': {
      filePath: 'src/routes/user.ts',
      directDependents: ['src/client/userClient.ts', 'src/views/profile.tsx', 'src/services/billingService.ts'],
      indirectDependents: ['src/app.ts'],
      affectedRoutes: ['src/routes/user.ts'],
      affectedServices: ['src/services/billingService.ts'],
      affectedTests: [],
      totalConsumers: 4,
      level: 'MEDIUM',
    },
    'src/services/userService.ts': {
      filePath: 'src/services/userService.ts',
      directDependents: ['src/routes/user.ts'],
      indirectDependents: [],
      affectedRoutes: [],
      affectedServices: [],
      affectedTests: [],
      totalConsumers: 1,
      level: 'LOW',
    },
  };

  const suspiciousChanges: SuspiciousChange[] = [
    {
      id: 'suspicious-1',
      title: 'API endpoint response modified without regression test updates',
      severity: 'HIGH',
      reason: 'The return structure of GET /api/user was modified, but zero corresponding tests were updated in this diff.',
      evidence: [
        'Endpoint: src/routes/user.ts',
        'Return statement changed: return user -> return { user }',
        '4 client consumers depend on this endpoint structure',
      ],
      filePath: 'src/routes/user.ts',
    },
    {
      id: 'suspicious-2',
      title: 'Authentication guard condition modified in sensitive path',
      severity: 'HIGH',
      reason: 'Permission logic altered to restrict dashboard access to admin role.',
      evidence: [
        'Modified auth check: req.user -> req.user.role === "admin"',
        'Affects 5 protected routes downstream',
      ],
      filePath: 'src/middleware/auth.ts',
    },
  ];

  const timeline: GitTimelineItem[] = [
    {
      hash: 'a1b2c3d',
      author: 'AI Agent (Cursor)',
      date: '2026-09-05',
      message: 'feat: add role authorization and wrap user response payload',
    },
    {
      hash: 'f9e8d7c',
      author: 'AI Agent (Claude Code)',
      date: '2026-09-04',
      message: 'refactor: extract user validation schemas',
    },
    {
      hash: 'b4a5c6d',
      author: 'Lead Developer',
      date: '2026-09-02',
      message: 'feat: initial auth middleware & profile endpoints',
    },
  ];

  return {
    timestamp: new Date().toISOString(),
    projectPath: process.cwd(),
    branch: 'feat/ai-auth-refactor',
    baseCommit: 'b4a5c6d',
    totalFilesChanged: 19,
    linesAdded: 142,
    linesDeleted: 89,
    behavioralChangesCount: 4,
    risk: {
      score: 74,
      level: 'HIGH',
      factors: [
        {
          factor: 'Authentication / Authorization Shift',
          scoreContribution: 35,
          reason: 'Security, session, or role evaluation logic was altered.',
        },
        {
          factor: 'API Contract Mutated',
          scoreContribution: 25,
          reason: 'Endpoint return payload shape modified.',
        },
        {
          factor: 'Extensive Blast Radius',
          scoreContribution: 20,
          reason: '7 downstream consumers depend on modified modules.',
        },
        {
          factor: 'Missing Test Updates',
          scoreContribution: 15,
          reason: 'Behavioral logic changed without corresponding unit/regression test updates.',
        },
      ],
    },
    findings,
    suspiciousChanges,
    timeline,
    blastRadiusMap,
    changedFiles: [
      { path: 'src/middleware/auth.ts', changeType: 'modified', linesAdded: 14, linesDeleted: 8 },
      { path: 'src/routes/user.ts', changeType: 'modified', linesAdded: 22, linesDeleted: 15 },
      { path: 'src/services/userService.ts', changeType: 'modified', linesAdded: 9, linesDeleted: 4 },
      { path: 'src/client/userClient.ts', changeType: 'modified', linesAdded: 12, linesDeleted: 10 },
      { path: 'src/views/profile.tsx', changeType: 'modified', linesAdded: 18, linesDeleted: 11 },
    ],
    recommendations: [
      'Review authentication behavior and execute end-to-end access control tests before merging.',
      'Audit API client bindings and ensure client response deserializers are updated.',
      'Ensure calling methods guard against potential null return values.',
    ],
  };
}

export async function runDemoSimulation(options: DemoOptions = {}): Promise<void> {
  const port = options.port || 4783;
  const autoOpen = options.open !== false;

  console.log(pc.cyan('\n════════════════════════════════════════════════════════════════'));
  console.log(pc.bold(pc.yellow('  CHANGE FIREWALL SIMULATION')) + pc.dim(' • Golden Moment Demo'));
  console.log(pc.cyan('════════════════════════════════════════════════════════════════'));
  console.log(pc.dim('Simulating real AI-generated change: Auth condition + API response wrapping...\n'));

  const demoReport = generateDemoReport();

  if (autoOpen) {
    const server = await startDashboardServer(demoReport, port, true);
    renderTerminalReport(demoReport, server.url);
    console.log(pc.cyan(`\nDemo Dashboard active at ${server.url}. Inspect the interactive SVG graph & tabs!\n`));
    console.log(pc.dim('Press Ctrl+C to exit demo.\n'));
    await new Promise(() => {});
  } else {
    renderTerminalReport(demoReport);
  }
}
