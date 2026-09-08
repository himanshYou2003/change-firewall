import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import ts from 'typescript';
import type {
  BehaviorGraph,
  BehaviorNode,
  BehaviorEdge,
  BehaviorRole,
  CriticalPath,
  SeverityLevel,
} from '../../types/index.js';
import type { ProjectDependencyGraph } from './dependency-graph.js';

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/');
}

/**
 * Classifies the semantic architectural role of a file and its symbols.
 */
export function classifyRole(filePath: string, fileContent?: string): BehaviorRole {
  const normPath = normalizePath(filePath);
  const lowerPath = normPath.toLowerCase();

  // Test suite
  if (
    lowerPath.includes('.test.') ||
    lowerPath.includes('.spec.') ||
    lowerPath.includes('/__tests__/') ||
    lowerPath.includes('/tests/')
  ) {
    return 'TEST_SUITE';
  }

  // API Route / Endpoint
  if (
    lowerPath.includes('/routes/') ||
    lowerPath.includes('/api/') ||
    lowerPath.endsWith('route.ts') ||
    lowerPath.endsWith('route.js') ||
    lowerPath.includes('controller') ||
    lowerPath.includes('/endpoints/')
  ) {
    return 'API_ROUTE';
  }

  // Auth boundary
  if (
    lowerPath.includes('middleware') ||
    lowerPath.includes('auth') ||
    lowerPath.includes('guard') ||
    lowerPath.includes('permission') ||
    lowerPath.includes('session')
  ) {
    return 'AUTH_BOUNDARY';
  }

  // Database Model / Query
  if (
    lowerPath.includes('/model') ||
    lowerPath.includes('/models/') ||
    lowerPath.includes('/schema') ||
    lowerPath.includes('/schemas/') ||
    lowerPath.includes('/prisma/') ||
    lowerPath.includes('/entities/') ||
    lowerPath.includes('/migrations/')
  ) {
    return 'DATABASE_MODEL';
  }

  // If content is provided, inspect code semantics
  if (fileContent) {
    const lowerContent = fileContent.toLowerCase();

    // Event consumer (listeners, workers)
    if (
      lowerPath.includes('worker') ||
      lowerPath.includes('consumer') ||
      lowerPath.includes('subscriber') ||
      lowerContent.includes('.on(') ||
      lowerContent.includes('.addlistener(') ||
      lowerContent.includes('.subscribe(')
    ) {
      return 'EVENT_CONSUMER';
    }

    // Event producer (publishers, emitters)
    if (
      lowerContent.includes('.emit(') ||
      lowerContent.includes('.publish(') ||
      lowerContent.includes('.dispatch(') ||
      lowerContent.includes('.broadcast(')
    ) {
      return 'EVENT_PRODUCER';
    }

    // Client consumer (client components, api callers)
    if (
      lowerContent.includes('"use client"') ||
      lowerContent.includes('axios.') ||
      lowerContent.includes('usequery(') ||
      lowerContent.includes('usemutation(')
    ) {
      return 'API_CONSUMER';
    }

    // Prisma / ORM in content
    if (
      lowerContent.includes('prisma.') ||
      lowerContent.includes('typeorm') ||
      lowerContent.includes('drizzle') ||
      lowerContent.includes('mongoose.model')
    ) {
      return 'DATABASE_MODEL';
    }
  }

  return 'INTERNAL_LOGIC';
}

/**
 * Builds the holistic Behavior Graph mapping symbols and files to architectural roles.
 */
export async function buildBehaviorGraph(
  projectRoot: string,
  depGraph: ProjectDependencyGraph
): Promise<BehaviorGraph> {
  const nodes: Record<string, BehaviorNode> = {};
  const edges: BehaviorEdge[] = [];
  const roleCounts: Record<BehaviorRole, number> = {
    API_ROUTE: 0,
    API_CONSUMER: 0,
    DATABASE_MODEL: 0,
    TEST_SUITE: 0,
    EVENT_PRODUCER: 0,
    EVENT_CONSUMER: 0,
    AUTH_BOUNDARY: 0,
    INTERNAL_LOGIC: 0,
  };

  // 1. Create File-Level Nodes
  for (const file of depGraph.allFiles) {
    let content = '';
    try {
      content = await fs.readFile(path.join(projectRoot, file), 'utf8');
    } catch {
      // Content read failure fallback
    }

    const role = classifyRole(file, content);
    roleCounts[role]++;

    nodes[file] = {
      id: file,
      filePath: file,
      role,
      description: `File classified as ${role.replace(/_/g, ' ')}`,
      metadata: {
        totalLines: content ? content.split('\n').length : 0,
      },
    };
  }

  // 2. Build Structural & Semantic Edges
  for (const [sourceFile, deps] of depGraph.forwardGraph.entries()) {
    const sourceNode = nodes[sourceFile];

    for (const depFile of deps) {
      const targetNode = nodes[depFile];
      let relationship: BehaviorEdge['relationship'] = 'imports';
      let details: string | undefined;

      if (sourceNode && targetNode) {
        if (targetNode.role === 'DATABASE_MODEL') {
          relationship = 'queries';
          details = 'Accesses data entity / database model';
        } else if (targetNode.role === 'AUTH_BOUNDARY') {
          relationship = 'guards';
          details = 'Secured by authentication boundary';
        } else if (sourceNode.role === 'TEST_SUITE') {
          relationship = 'tests';
          details = 'Tests implementation';
        } else if (targetNode.role === 'EVENT_CONSUMER' || targetNode.role === 'EVENT_PRODUCER') {
          relationship = 'emits';
          details = 'Binds event emitter / consumer flow';
        }
      }

      edges.push({
        source: sourceFile,
        target: depFile,
        relationship,
        details,
      });
    }
  }

  // 3. Discover Critical Paths (Cross-Boundary Execution Flows)
  const criticalPaths: CriticalPath[] = [];
  let pathCounter = 0;

  // Search for: [API_ROUTE] -> guards:[AUTH_BOUNDARY] -> queries:[DATABASE_MODEL]
  for (const [routeFile, routeNode] of Object.entries(nodes)) {
    if (routeNode.role !== 'API_ROUTE') continue;

    const downstreamDeps = depGraph.forwardGraph.get(routeFile) || new Set<string>();

    const authNodes: string[] = [];
    const dbNodes: string[] = [];
    const eventNodes: string[] = [];

    for (const dep of downstreamDeps) {
      const depNode = nodes[dep];
      if (!depNode) continue;
      if (depNode.role === 'AUTH_BOUNDARY') authNodes.push(dep);
      if (depNode.role === 'DATABASE_MODEL') dbNodes.push(dep);
      if (depNode.role === 'EVENT_PRODUCER' || depNode.role === 'EVENT_CONSUMER') eventNodes.push(dep);

      // Check 2nd level downstream
      const secondaryDeps = depGraph.forwardGraph.get(dep) || new Set<string>();
      for (const sDep of secondaryDeps) {
        const sNode = nodes[sDep];
        if (!sNode) continue;
        if (sNode.role === 'AUTH_BOUNDARY' && !authNodes.includes(sDep)) authNodes.push(sDep);
        if (sNode.role === 'DATABASE_MODEL' && !dbNodes.includes(sDep)) dbNodes.push(sDep);
      }
    }

    if (authNodes.length > 0 && dbNodes.length > 0) {
      criticalPaths.push({
        id: `cp-${++pathCounter}`,
        name: `Protected Data Access: ${path.basename(routeFile)}`,
        description: `Route ${routeFile} enforces ${authNodes[0]} before mutating ${dbNodes[0]}`,
        steps: [routeFile, authNodes[0], dbNodes[0]],
        riskLevel: 'CRITICAL',
      });
    } else if (authNodes.length === 0 && dbNodes.length > 0) {
      criticalPaths.push({
        id: `cp-${++pathCounter}`,
        name: `Unprotected Data Query: ${path.basename(routeFile)}`,
        description: `Route ${routeFile} accesses database model ${dbNodes[0]} without dedicated auth boundary guard`,
        steps: [routeFile, dbNodes[0]],
        riskLevel: 'HIGH',
      });
    }

    if (eventNodes.length > 0) {
      criticalPaths.push({
        id: `cp-${++pathCounter}`,
        name: `Async Event Trigger: ${path.basename(routeFile)}`,
        description: `Route ${routeFile} triggers background event sequence in ${eventNodes[0]}`,
        steps: [routeFile, eventNodes[0]],
        riskLevel: 'MEDIUM',
      });
    }
  }

  return {
    nodes,
    edges,
    criticalPaths,
    roleCounts,
  };
}

/**
 * Finds all critical paths crossing through a given file.
 */
export function findCriticalPathsTouchingFile(filePath: string, graph: BehaviorGraph): CriticalPath[] {
  const normalized = normalizePath(filePath);
  return graph.criticalPaths.filter((cp) => cp.steps.some((step) => normalizePath(step) === normalized));
}

/**
 * Renders an ASCII/Unicode visual tree representing the behavior graph for a file/symbol.
 */
export function formatBehaviorGraphAscii(filePath: string, graph: BehaviorGraph): string {
  const normalized = normalizePath(filePath);
  const node = graph.nodes[normalized] || graph.nodes[filePath] || {
    id: filePath,
    filePath,
    role: 'INTERNAL_LOGIC',
    description: 'Target component',
  };

  const edgesFrom = graph.edges.filter((e) => normalizePath(e.source) === normalized);
  const edgesTo = graph.edges.filter((e) => normalizePath(e.target) === normalized);

  const lines: string[] = [];
  lines.push(`┌─────────────────────────────────────────────────────────────┐`);
  lines.push(`│ TARGET: ${filePath.padEnd(52)} │`);
  lines.push(`│ ROLE:   ${(node.role.replace(/_/g, ' ')).padEnd(52)} │`);
  lines.push(`└──────────────────────────────┬──────────────────────────────┘`);
  lines.push(`                               │`);

  if (edgesTo.length > 0) {
    lines.push(`  CALLERS / CONSUMERS (Incoming):`);
    for (const e of edgesTo.slice(0, 4)) {
      const callerRole = graph.nodes[e.source]?.role || 'INTERNAL_LOGIC';
      lines.push(`  ├── [${callerRole}] ──► ${e.source} (${e.relationship})`);
    }
    if (edgesTo.length > 4) {
      lines.push(`  ├── ... and ${edgesTo.length - 4} more consumers`);
    }
  }

  if (edgesFrom.length > 0) {
    lines.push(`  DEPENDENCIES / BOUNDARIES (Outgoing):`);
    for (let i = 0; i < Math.min(edgesFrom.length, 5); i++) {
      const e = edgesFrom[i];
      const depRole = graph.nodes[e.target]?.role || 'INTERNAL_LOGIC';
      const isLast = i === Math.min(edgesFrom.length, 5) - 1;
      const prefix = isLast ? '  └──' : '  ├──';
      lines.push(`${prefix}──► [${depRole}] ${e.target} (${e.relationship})`);
    }
  }

  const paths = findCriticalPathsTouchingFile(filePath, graph);
  if (paths.length > 0) {
    lines.push(`  CRITICAL EXECUTION PATHS:`);
    for (const cp of paths.slice(0, 2)) {
      lines.push(`  ⚡ ${cp.name} [${cp.riskLevel}]`);
      lines.push(`     Flow: ${cp.steps.join(' ➔ ')}`);
    }
  }

  return lines.join('\n');
}
