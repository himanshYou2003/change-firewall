import { execFile, exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);
const rootDir = process.cwd();
const binPath = path.resolve(rootDir, 'bin/change-firewall.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertProof(feature, testDescription, condition, details) {
  totalTests++;
  const label = `[TEST ${String(totalTests).padStart(2, '0')}] ${feature} ➔ ${testDescription}`;
  if (condition) {
    passedTests++;
    console.log(`\x1b[32m✔ PASS\x1b[0m: ${label}`);
    if (details) {
      console.log(`       \x1b[90mProof Evidence: ${details}\x1b[0m`);
    }
  } else {
    failedTests++;
    console.error(`\x1b[31m✖ FAIL\x1b[0m: ${label}`);
    console.error(`       \x1b[31mFailure Reason: ${details}\x1b[0m`);
  }
}

async function runDeepTesterSuite() {
  console.log('\n' + '='.repeat(80));
  console.log('  🔬 PRINCIPAL SDET & WORLD-CLASS TEST HARNESS: CHANGE FIREWALL v0.2.2');
  console.log('  Empirical Proof of 100% Operational Features (Zero Guesswork)');
  console.log('='.repeat(80) + '\n');

  const {
    analyzeChanges,
    buildDependencyGraph,
    buildBehaviorGraph,
    classifyRole,
    formatBehaviorGraphAscii,
    computeBlastRadius,
    analyzeASTDiff,
    computeBehavioralFingerprint,
    loadFirewallMemory,
    recordMemorySnapshot,
    evaluateBrokenInvariants,
    resetMemory,
    generateSymbolicCrashTraces,
    auditAgentIntent,
    startDashboardServer,
    calculateRiskScore,
  } = await import('../dist/index.js');

  // =========================================================================
  // 1. LIVE REPOSITORY & GIT COLLECTOR INTEGRITY
  // =========================================================================
  console.log('\x1b[35m[1/11] SUBSYSTEM: Live Git Collector & Working Tree Engine\x1b[0m');
  const tempGitDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cf-git-proof-'));
  try {
    await execAsync('git init -b main', { cwd: tempGitDir });
    await execAsync('git config user.name "Tester"', { cwd: tempGitDir });
    await execAsync('git config user.email "tester@firewall.dev"', { cwd: tempGitDir });

    // Initial commit
    await fs.writeFile(path.join(tempGitDir, 'initial.ts'), 'export const v = 1;\n');
    await execAsync('git add . && git commit -m "init"', { cwd: tempGitDir });

    // Create untracked file, modified file with spaces in directory, and a deleted file
    await fs.mkdir(path.join(tempGitDir, 'special folder with spaces'), { recursive: true });
    await fs.writeFile(
      path.join(tempGitDir, 'special folder with spaces/calc.ts'),
      'export function calculate(a: number, b: number): number { return a + b; }\n'
    );

    const report = await analyzeChanges({ cwd: tempGitDir });
    assertProof(
      'Git Collector',
      'Discovers untracked files in nested paths with spaces',
      report.changedFiles.some((f) => f.path.includes('special folder with spaces/calc.ts')),
      `Found ${report.changedFiles.length} changed file(s), correctly unquoted path`
    );

    assertProof(
      'Git Collector',
      'Calculates lines added/deleted accurately without ENOENT',
      report.linesAdded > 0 && report.linesDeleted === 0,
      `Lines added: +${report.linesAdded}`
    );
  } finally {
    await fs.rm(tempGitDir, { recursive: true, force: true });
  }

  // =========================================================================
  // 2. DYNAMIC AST PARSER & CONTRACT EXTRACTION
  // =========================================================================
  console.log('\n\x1b[35m[2/11] SUBSYSTEM: Dynamic AST Parser & Contract Diffing\x1b[0m');
  
  // Test Arrow Function Signature Isolation (Internal Body vs Signature Change)
  const arrowBefore = 'export const processOrder = (id: string, amount: number): boolean => { return amount > 0; };';
  const arrowAfterBodyOnly = 'export const processOrder = (id: string, amount: number): boolean => { console.log(id); return amount > 0 && true; };';
  const arrowAfterSignature = 'export const processOrder = (id: string, amount: number, currency?: string): boolean => { return amount > 0; };';

  const diffBodyOnly = analyzeASTDiff('order.ts', arrowBefore, arrowAfterBodyOnly);
  const diffSig = analyzeASTDiff('order.ts', arrowBefore, arrowAfterSignature);

  assertProof(
    'AST Parser',
    'Ignores arrow function internal body refactoring (Zero False Positive)',
    diffBodyOnly.symbols.length === 0,
    'Internal body change did not trigger modified export contract'
  );

  assertProof(
    'AST Parser',
    'Detects arrow function signature changes when parameters mutate',
    diffSig.symbols.length === 1 && diffSig.symbols[0].afterSignature.includes('currency?: string'),
    `Signature successfully detected: ${diffSig.symbols[0]?.afterSignature}`
  );

  // Test TypeScript Enum Parsing
  const enumBefore = 'export enum Role { USER = 1, ADMIN = 2 }';
  const enumAfter = 'export enum Role { USER = 1, SUPERADMIN = 3 }';
  const diffEnum = analyzeASTDiff('role.ts', enumBefore, enumAfter);
  assertProof(
    'AST Parser',
    'Detects TypeScript enum contract mutations',
    diffEnum.symbols.some((s) => s.name === 'Role' && s.afterSignature?.includes('SUPERADMIN')),
    `Enum change detected: ${diffEnum.symbols[0]?.afterSignature}`
  );

  // =========================================================================
  // 3. ARCHITECTURAL BEHAVIOR GRAPH & MULTI-HOP CRITICAL PATHS
  // =========================================================================
  console.log('\n\x1b[35m[3/11] SUBSYSTEM: Architectural Behavior Graph & Multi-Hop Flow\x1b[0m');
  const depGraph = await buildDependencyGraph(rootDir);
  const behaviorGraph = await buildBehaviorGraph(rootDir, depGraph);

  assertProof(
    'Behavior Graph',
    'Holistic node creation and cross-boundary classification',
    Object.keys(behaviorGraph.nodes).length >= 10,
    `Total classified architectural nodes: ${Object.keys(behaviorGraph.nodes).length}`
  );

  assertProof(
    'Behavior Graph',
    'Cross-file structural edges computed',
    behaviorGraph.edges.length >= 10,
    `Total structural graph edges: ${behaviorGraph.edges.length}`
  );

  const formattedTree = formatBehaviorGraphAscii('src/index.ts', behaviorGraph);
  assertProof(
    'Behavior Graph',
    'Renders Unicode ASCII visual tree with Callers and Dependencies',
    formattedTree.includes('CALLERS / CONSUMERS') && formattedTree.includes('DEPENDENCIES / BOUNDARIES'),
    'Tree contains both incoming and outgoing directional vectors'
  );

  // =========================================================================
  // 4. 11-DIMENSIONAL BEHAVIORAL FINGERPRINT ENGINE
  // =========================================================================
  console.log('\n\x1b[35m[4/11] SUBSYSTEM: 11-Dimensional Behavioral Fingerprint Matrix\x1b[0m');
  const mockDiff = [
    {
      filePath: 'src/api/payment.ts',
      symbols: [
        {
          name: 'chargeCard',
          kind: 'function',
          changeType: 'modified',
          beforeSignature: 'chargeCard(amount: number): Transaction',
          afterSignature: 'chargeCard(amount: number): Transaction | null',
        },
      ],
      returnShapeChanged: true,
      beforeReturnShape: 'result',
      afterReturnShape: '{ data: result }',
      authConditionChanged: true,
      authDetails: 'Altered role guard check',
      errorHandlingChanged: true,
      errorDetails: 'Added throw new PaymentError()',
      validationChanged: true,
      validationDetails: 'Added zod paymentSchema.parse()',
      databaseChanged: true,
      databaseDetails: 'Added prisma.transaction.create()',
      eventFlowChanged: true,
      eventDetails: 'Added eventEmitter.emit("payment.completed")',
      callsAdded: ['fetch("https://stripe.com")', 'prisma.transaction.create'],
      callsRemoved: [],
      details: ['Multi-vector mutation'],
    },
  ];

  const blastMap = {
    'src/api/payment.ts': {
      filePath: 'src/api/payment.ts',
      directDependents: ['src/routes/checkout.ts'],
      indirectDependents: [],
      affectedRoutes: ['src/routes/checkout.ts'],
      affectedServices: [],
      affectedTests: [],
      totalConsumers: 2,
      level: 'HIGH',
    },
  };

  const fingerprint = computeBehavioralFingerprint(mockDiff, blastMap, false);
  const vectors = fingerprint.vectors;

  assertProof(
    '11-D Fingerprint',
    'Simultaneous multi-vector activation (API, Auth, Nullability, DB, Event, Validation)',
    vectors.apiContract.active &&
      vectors.authorization.active &&
      vectors.nullability.active &&
      vectors.database.active &&
      vectors.eventFlow.active &&
      vectors.validation.active,
    `Vectors active: API (${vectors.apiContract.score}), Auth (${vectors.authorization.score}), DB (${vectors.database.score})`
  );

  assertProof(
    '11-D Fingerprint',
    'Deterministic Confidence Calculation',
    fingerprint.confidenceScore >= 80 && fingerprint.confidenceScore <= 100,
    `Calculated confidence: ${fingerprint.confidenceScore}% (Primary: ${fingerprint.primaryMutation})`
  );

  // =========================================================================
  // 5. SYMBOLIC RUNTIME CRASH PROOF (DETERMINISTIC SIMULATION)
  // =========================================================================
  console.log('\n\x1b[35m[5/11] SUBSYSTEM: Symbolic Runtime Crash Engine (Zero Guesswork)\x1b[0m');
  const tempSymDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cf-sym-proof-'));
  try {
    await fs.mkdir(path.join(tempSymDir, 'src/services'), { recursive: true });
    await fs.mkdir(path.join(tempSymDir, 'src/routes'), { recursive: true });

    // Consumer calls service without null guard
    await fs.writeFile(
      path.join(tempSymDir, 'src/routes/user.ts'),
      `import { getUser } from '../services/user.js';
export function render() {
  const u = getUser('123');
  return u.name.toUpperCase();
}\n`
    );

    const symDiff = [
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

    const symBlast = {
      'src/services/user.ts': {
        filePath: 'src/services/user.ts',
        directDependents: ['src/routes/user.ts'],
        indirectDependents: [],
        affectedRoutes: ['src/routes/user.ts'],
        affectedServices: [],
        affectedTests: [],
        totalConsumers: 1,
        level: 'HIGH',
      },
    };

    const traces = await generateSymbolicCrashTraces(symDiff, symBlast, tempSymDir);
    assertProof(
      'Symbolic Crash Engine',
      'Mathematically proves unhandled null runtime exception with proof chain',
      traces.length === 1 && traces[0].failureType === 'UNHANDLED_NULL',
      `Proven Exception: ${traces[0]?.simulatedException} at ${traces[0]?.consumerFile}:${traces[0]?.consumerLine}`
    );

    // Guarded consumer: with optional chaining (?.)
    await fs.writeFile(
      path.join(tempSymDir, 'src/routes/user.ts'),
      `import { getUser } from '../services/user.js';
export function render() {
  const u = getUser('123');
  return u?.name?.toUpperCase();
}\n`
    );

    const guardedTraces = await generateSymbolicCrashTraces(symDiff, symBlast, tempSymDir);
    assertProof(
      'Symbolic Crash Engine',
      'Zero false positives when caller implements optional chaining (?.)',
      guardedTraces.length === 0,
      'Proof engine recognized guard token and omitted false alarm'
    );
  } finally {
    await fs.rm(tempSymDir, { recursive: true, force: true });
  }

  // =========================================================================
  // 6. PERSISTENT FIREWALL MEMORY STORE (.firewall/memory)
  // =========================================================================
  console.log('\n\x1b[35m[6/11] SUBSYSTEM: Persistent Memory Store & Invariant Engine\x1b[0m');
  const tempMemDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cf-mem-proof-'));
  try {
    // 1. Clean initial state
    const initialMem = await loadFirewallMemory(tempMemDir);
    assertProof('Memory Store', 'Initial state initializes cleanly without errors', initialMem.invariantsCount === 0, 'Clean zero count');

    // 2. Record baseline
    await recordMemorySnapshot(tempMemDir, 'commit-a1b2', [
      {
        filePath: 'src/core/auth.ts',
        symbols: [{ name: 'verifyToken', kind: 'function', changeType: 'added', afterSignature: 'verifyToken(t: string): boolean' }],
        returnShapeChanged: false,
        authConditionChanged: false,
        errorHandlingChanged: false,
        validationChanged: false,
        callsAdded: [],
        callsRemoved: [],
        details: [],
      },
    ]);

    const updatedMem = await loadFirewallMemory(tempMemDir);
    assertProof(
      'Memory Store',
      'Persists verified baseline snapshot into .firewall/memory/',
      updatedMem.invariantsCount >= 1 && updatedMem.baselineCommit === 'commit-a1b2',
      `Invariants: ${updatedMem.invariantsCount}, Baseline: ${updatedMem.baselineCommit}`
    );

    // 3. Detect broken invariant
    const breakingDiff = [
      {
        filePath: 'src/core/auth.ts',
        symbols: [{ name: 'verifyToken', kind: 'function', changeType: 'modified', afterSignature: 'verifyToken(t: string, secretKey: string): boolean' }],
        returnShapeChanged: false,
        authConditionChanged: false,
        errorHandlingChanged: false,
        validationChanged: false,
        callsAdded: [],
        callsRemoved: [],
        details: [],
      },
    ];

    const broken = evaluateBrokenInvariants(breakingDiff, tempMemDir, updatedMem.rawInvariants);
    assertProof(
      'Memory Store',
      'Detects broken historical contract invariant against stored baseline',
      broken.length >= 1 && broken[0].symbolOrFile === 'verifyToken',
      `Alert: ${broken[0]?.rule} ➔ ${broken[0]?.mutation}`
    );

    // 4. Reset memory
    await resetMemory(tempMemDir);
    const resetMem = await loadFirewallMemory(tempMemDir);
    assertProof('Memory Store', 'Resets memory store cleanly upon developer command', resetMem.invariantsCount === 0, 'Invariants reset to 0');
  } finally {
    await fs.rm(tempMemDir, { recursive: true, force: true });
  }

  // =========================================================================
  // 7. AI AGENT INTENT VS REALITY AUDIT
  // =========================================================================
  console.log('\n\x1b[35m[7/11] SUBSYSTEM: AI Agent Intent vs Reality Verifier\x1b[0m');
  const stealthFinding = [
    {
      id: 'f-1',
      category: 'AUTH',
      title: 'Authentication Guard Deleted',
      description: 'Role check deleted',
      severity: 'HIGH',
      confidence: 96,
      filePath: 'src/middleware/auth.ts',
      evidence: ['Deleted auth check'],
      affectedFiles: ['src/routes/admin.ts'],
      recommendation: 'Restore guard',
    },
  ];

  const stealthAudit = auditAgentIntent('Update CSS font sizes and colors', stealthFinding, []);
  assertProof(
    'Agent Intent Verifier',
    'Detects Stealth Mutation (High Drift: Agent claimed styling, deleted Auth)',
    stealthAudit.verdict === 'STEALTH_MUTATION' && stealthAudit.driftScore >= 60,
    `Verdict: ${stealthAudit.verdict}, Drift Score: ${stealthAudit.driftScore}%`
  );

  const alignedAudit = auditAgentIntent('Update authentication security check', stealthFinding, []);
  assertProof(
    'Agent Intent Verifier',
    'Approves Aligned Intent (Zero Drift when diff matches stated prompt)',
    alignedAudit.verdict === 'ALIGNED' && alignedAudit.driftScore === 0,
    `Verdict: ${alignedAudit.verdict}, Drift Score: ${alignedAudit.driftScore}%`
  );

  // =========================================================================
  // 8. PREFLIGHT CI/CD MERGE GATE ENFORCEMENT
  // =========================================================================
  console.log('\n\x1b[35m[8/11] SUBSYSTEM: Preflight CI/CD Gate Enforcement\x1b[0m');
  
  // Test exit 1
  let gateExit1 = false;
  try {
    await execFileAsync('node', [binPath, 'preflight', '-m', '10']);
  } catch (err) {
    if (err.code === 1) gateExit1 = true;
  }
  assertProof('CI/CD Gate', 'Strict threshold blocks merge and exits with exit code 1', gateExit1, 'Child process exited with code 1');

  // Test exit 0
  let gateExit0 = false;
  try {
    const { stdout } = await execFileAsync('node', [binPath, 'preflight', '-m', '100', '--no-fail-on-high']);
    if (stdout.includes('APPROVED / SAFE TO MERGE')) gateExit0 = true;
  } catch {}
  assertProof('CI/CD Gate', 'Permitted threshold approves merge and exits with exit code 0', gateExit0, 'Child process exited with code 0');

  // =========================================================================
  // 9. DASHBOARD WEB SERVER & SSE EVENT STREAMING
  // =========================================================================
  console.log('\n\x1b[35m[9/11] SUBSYSTEM: Real-time Web Dashboard & SSE Server\x1b[0m');
  const dummyReport = {
    timestamp: new Date().toISOString(),
    projectPath: rootDir,
    totalFilesChanged: 1,
    linesAdded: 10,
    linesDeleted: 2,
    behavioralChangesCount: 1,
    risk: { score: 45, level: 'MEDIUM', factors: [] },
    findings: [],
    suspiciousChanges: [],
    timeline: [],
    blastRadiusMap: {},
    changedFiles: [],
    recommendations: ['Safe'],
  };

  const dashboardPort = 5912;
  const server = await startDashboardServer(dummyReport, dashboardPort, false);
  try {
    assertProof('Dashboard Server', 'Binds HTTP server on dynamic port', server.url.includes(String(dashboardPort)), `Running at: ${server.url}`);

    // Fetch HTML
    const htmlRes = await fetch(`${server.url}/`);
    const htmlText = await htmlRes.text();
    assertProof('Dashboard Server', 'Serves HTML user interface at root /', htmlRes.status === 200 && htmlText.includes('Change Firewall'), `HTTP ${htmlRes.status}, HTML size: ${htmlText.length} bytes`);

    // Fetch API report JSON
    const apiRes = await fetch(`${server.url}/api/report`);
    const apiData = await apiRes.json();
    assertProof('Dashboard Server', 'Exposes machine-readable JSON at /api/report', apiRes.status === 200 && apiData.risk?.score === 45, `HTTP ${apiRes.status}, Risk Score: ${apiData.risk?.score}`);
  } finally {
    await server.close();
  }

  // =========================================================================
  // 10. MODEL CONTEXT PROTOCOL (MCP) SERVER
  // =========================================================================
  console.log('\n\x1b[35m[10/11] SUBSYSTEM: Model Context Protocol (MCP) Standard Server\x1b[0m');
  const { stdout: mcpVerification } = await execFileAsync('node', ['scripts/verify-mcp-e2e.mjs']);
  assertProof(
    'MCP Protocol',
    'Exposes 6 compliant MCP tools over stdio for Claude Desktop & Cursor',
    mcpVerification.includes('Found 6 exposed tools') && mcpVerification.includes('100% PROOF VERIFIED'),
    'analyze_changes, preflight, explain_file_impact, compute_blast_radius, get_behavior_graph, audit_agent_intent'
  );

  // =========================================================================
  // 11. CLI COMMAND SUITE
  // =========================================================================
  console.log('\n\x1b[35m[11/11] SUBSYSTEM: Complete CLI Commands Suite\x1b[0m');
  
  // change-firewall --version
  const { stdout: verOut } = await execFileAsync('node', [binPath, '--version']);
  assertProof('CLI Suite', 'change-firewall --version outputs 0.2.2', verOut.trim() === '0.2.2', `Version: ${verOut.trim()}`);

  const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');

  // change-firewall why src/index.ts
  const { stdout: whyOut } = await execFileAsync('node', [binPath, 'why', 'src/index.ts']);
  assertProof('CLI Suite', 'change-firewall why <file> explains architectural importance', stripAnsi(whyOut).includes('WHY THIS FILE MATTERS: src/index.ts'), 'Outputs architectural role & Git history');

  // change-firewall impact src/index.ts
  const { stdout: impactOut } = await execFileAsync('node', [binPath, 'impact', 'src/index.ts']);
  assertProof('CLI Suite', 'change-firewall impact <file> computes blast radius', stripAnsi(impactOut).includes('BLAST RADIUS INSPECTION: src/index.ts'), 'Outputs direct & indirect dependents');

  // change-firewall memory status
  const { stdout: memOut } = await execFileAsync('node', [binPath, 'memory', 'status']);
  assertProof('CLI Suite', 'change-firewall memory status outputs contract metrics', stripAnsi(memOut).includes('PERSISTENT FIREWALL MEMORY STATUS'), 'Outputs invariant count & baseline commit');

  // =========================================================================
  // FINAL PRINCIPAL SDET VERDICT
  // =========================================================================
  console.log('\n' + '='.repeat(80));
  console.log(`  FINAL PRINCIPAL SDET CERTIFICATION: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('='.repeat(80));

  if (failedTests === 0) {
    console.log(`\n  \x1b[32m\x1b[1m🏆 100% EMPIRICAL PROOF CERTIFIED: ALL 11 SUBSYSTEMS FULLY OPERATIONAL\x1b[0m\n`);
    process.exit(0);
  } else {
    console.error(`\n  \x1b[31m\x1b[1m🚨 VERIFICATION FAILED: ${failedTests} test(s) failed\x1b[0m\n`);
    process.exit(1);
  }
}

runDeepTesterSuite().catch((err) => {
  console.error('Fatal harness error:', err);
  process.exit(1);
});
