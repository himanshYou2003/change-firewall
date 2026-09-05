export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FindingCategory =
  | 'AUTH'
  | 'API_CONTRACT'
  | 'FUNCTION_CONTRACT'
  | 'ERROR_HANDLING'
  | 'VALIDATION'
  | 'DEPENDENCY'
  | 'ROUTE';

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
}

export interface AnalyzeOptions {
  cwd?: string;
  base?: string;
  staged?: boolean;
  json?: boolean;
  open?: boolean;
  port?: number;
}
