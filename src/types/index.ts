export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FindingCategory =
  | 'AUTH'
  | 'API_CONTRACT'
  | 'FUNCTION_CONTRACT'
  | 'ERROR_HANDLING'
  | 'VALIDATION'
  | 'DEPENDENCY'
  | 'ROUTE'
  | 'DATABASE'
  | 'EVENT_FLOW'
  | 'NULLABILITY'
  | 'PERFORMANCE';

export type FileChangeType = 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked';

export interface FileDiff {
  path: string;
  changeType: FileChangeType;
  oldPath?: string;
  beforeContent?: string;
  afterContent?: string;
  linesAdded: number;
  linesDeleted: number;
}

export interface ChangedSymbol {
  name: string;
  kind: 'function' | 'class' | 'interface' | 'type' | 'variable' | 'export';
  changeType: 'added' | 'removed' | 'modified';
  beforeSignature?: string;
  afterSignature?: string;
  details?: string;
}

export interface ASTDiff {
  filePath: string;
  symbols: ChangedSymbol[];
  returnShapeChanged: boolean;
  beforeReturnShape?: string;
  afterReturnShape?: string;
  authConditionChanged: boolean;
  authDetails?: string;
  errorHandlingChanged: boolean;
  errorDetails?: string;
  validationChanged: boolean;
  validationDetails?: string;
  databaseChanged?: boolean;
  databaseDetails?: string;
  eventFlowChanged?: boolean;
  eventDetails?: string;
  callsAdded: string[];
  callsRemoved: string[];
  details: string[];
}

export interface BlastRadius {
  filePath: string;
  directDependents: string[];
  indirectDependents: string[];
  affectedRoutes: string[];
  affectedServices: string[];
  affectedTests: string[];
  totalConsumers: number;
  level: SeverityLevel;
}

export interface BehavioralFinding {
  id: string;
  category: FindingCategory;
  title: string;
  description: string;
  severity: SeverityLevel;
  confidence: number; // 0 - 100
  filePath: string;
  line?: number;
  beforeSnippet?: string;
  afterSnippet?: string;
  evidence: string[];
  affectedFiles: string[];
  recommendation: string;
}

export interface RiskFactor {
  factor: string;
  scoreContribution: number;
  reason: string;
}

export interface RiskScore {
  score: number; // 0 - 100
  level: SeverityLevel;
  factors: RiskFactor[];
}

export interface SuspiciousChange {
  id: string;
  title: string;
  severity: SeverityLevel;
  reason: string;
  evidence: string[];
  filePath: string;
}

export interface GitTimelineItem {
  hash: string;
  author: string;
  date: string;
  message: string;
}

// ==========================================
// 1. BEHAVIOR GRAPH ARCHITECTURE
// ==========================================
export type BehaviorRole =
  | 'API_ROUTE'
  | 'API_CONSUMER'
  | 'DATABASE_MODEL'
  | 'TEST_SUITE'
  | 'EVENT_PRODUCER'
  | 'EVENT_CONSUMER'
  | 'AUTH_BOUNDARY'
  | 'INTERNAL_LOGIC';

export interface BehaviorNode {
  id: string;
  filePath: string;
  symbolName?: string;
  role: BehaviorRole;
  description: string;
  metadata?: Record<string, any>;
}

export interface BehaviorEdge {
  source: string;
  target: string;
  relationship: 'calls' | 'imports' | 'emits' | 'handles' | 'queries' | 'guards' | 'tests';
  details?: string;
}

export interface CriticalPath {
  id: string;
  name: string;
  description: string;
  steps: string[];
  riskLevel: SeverityLevel;
}

export interface BehaviorGraph {
  nodes: Record<string, BehaviorNode>;
  edges: BehaviorEdge[];
  criticalPaths: CriticalPath[];
  roleCounts: Record<BehaviorRole, number>;
}

// ==========================================
// 2. 11-DIMENSIONAL BEHAVIORAL FINGERPRINT
// ==========================================
export interface FingerprintVector {
  score: number; // 0 - 100
  active: boolean;
  description: string;
  evidence: string[];
}

export interface BehavioralFingerprint {
  vectors: {
    apiContract: FingerprintVector;
    authorization: FingerprintVector;
    dataShape: FingerprintVector;
    nullability: FingerprintVector;
    validation: FingerprintVector;
    dependency: FingerprintVector;
    database: FingerprintVector;
    eventFlow: FingerprintVector;
    errorSemantics: FingerprintVector;
    performance: FingerprintVector;
    testCoverage: FingerprintVector;
  };
  primaryMutation: string;
  confidenceScore: number;
}

// ==========================================
// 3. SYMBOLIC RUNTIME CRASH TRACE
// ==========================================
export type FailureTraceType =
  | 'UNHANDLED_NULL'
  | 'MISSING_PROPERTY'
  | 'TYPE_MISMATCH'
  | 'UNCAUGHT_EXCEPTION'
  | 'AUTH_BYPASS';

export interface SymbolicFailureTrace {
  id: string;
  sourceFile: string;
  sourceLine?: number;
  sourceSymbol?: string;
  consumerFile: string;
  consumerLine?: number;
  consumerSymbol?: string;
  failureType: FailureTraceType;
  simulatedException: string;
  proofSteps: string[];
  preventativeFix?: string;
}

// ==========================================
// 4. PERSISTENT FIREWALL MEMORY STORE
// ==========================================
export interface BrokenInvariant {
  symbolOrFile: string;
  rule: string;
  historicalDuration: string;
  mutation: string;
}

export interface FirewallMemory {
  invariantsCount: number;
  baselineCommit?: string;
  historicalStability: 'HIGH' | 'MEDIUM' | 'LOW';
  brokenInvariants: BrokenInvariant[];
  lastApprovalDate?: string;
  rawInvariants?: Record<string, any>;
}

// ==========================================
// 5. AI AGENT INTENT VS REALITY VERIFIER
// ==========================================
export type AgentVerdict = 'ALIGNED' | 'MINOR_DRIFT' | 'HIGH_DRIFT' | 'STEALTH_MUTATION';

export interface AgentIntentAudit {
  intentText: string;
  driftScore: number; // 0 - 100
  statedChanges: string[];
  unannouncedMutations: string[];
  verdict: AgentVerdict;
  summary: string;
}

// ==========================================
// 6. OPERATIONAL INTELLIGENCE DIAGNOSIS
// ==========================================
export interface BehavioralMutationReport {
  mutation: string;
  confidence: number;
  consumersAffected: number;
  criticalPathsCount: number;
  historicalStability: 'HIGH' | 'MEDIUM' | 'LOW';
  missingRegressionCoverage: number;
  recommendedAction: string;
}

// Master Analysis Report
export interface AnalysisReport {
  timestamp: string;
  projectPath: string;
  branch?: string;
  baseCommit?: string;
  totalFilesChanged: number;
  linesAdded: number;
  linesDeleted: number;
  behavioralChangesCount: number;
  risk: RiskScore;
  findings: BehavioralFinding[];
  suspiciousChanges: SuspiciousChange[];
  timeline: GitTimelineItem[];
  blastRadiusMap: Record<string, BlastRadius>;
  changedFiles: FileDiff[];
  recommendations: string[];
  // Genius Core Extensions
  behaviorGraph?: BehaviorGraph;
  fingerprint?: BehavioralFingerprint;
  symbolicTraces?: SymbolicFailureTrace[];
  memoryContext?: FirewallMemory;
  agentAudit?: AgentIntentAudit;
  mutationDiagnosis?: BehavioralMutationReport;
}

export type ChangeReport = AnalysisReport;

export interface AnalyzeOptions {
  cwd?: string;
  base?: string;
  staged?: boolean;
  json?: boolean;
  open?: boolean;
  port?: number;
  intent?: string;
  recordMemory?: boolean;
}
