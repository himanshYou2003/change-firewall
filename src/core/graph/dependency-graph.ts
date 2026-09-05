import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import ts from 'typescript';
import type { BlastRadius, SeverityLevel } from '../../types/index.js';

export interface ProjectDependencyGraph {
  allFiles: string[];
  forwardGraph: Map<string, Set<string>>; // file -> dependencies
  reverseGraph: Map<string, Set<string>>; // file -> dependents
  routeFiles: Set<string>;
  serviceFiles: Set<string>;
  modelFiles: Set<string>;
  middlewareFiles: Set<string>;
  testFiles: Set<string>;
}

const SUPPORTED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git', '.firewall', 'coverage', 'build', '.next']);

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/');
}

function isSupportedFile(file: string): boolean {
  return SUPPORTED_EXTENSIONS.some((ext) => file.endsWith(ext)) && !file.endsWith('.d.ts');
}

async function scanDirectory(dir: string, baseDir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await scanDirectory(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile() && isSupportedFile(entry.name)) {
        const relPath = normalizePath(path.relative(baseDir, fullPath));
        files.push(relPath);
      }
    }
  } catch {
    // Directory might not exist or be inaccessible
  }
  return files;
}

function extractImports(sourceText: string, filePath: string): string[] {
  const isTs = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
  const isJsx = filePath.endsWith('.jsx') || filePath.endsWith('.tsx');

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    isJsx ? ts.ScriptKind.TSX : isTs ? ts.ScriptKind.TS : ts.ScriptKind.JS
  );

  const importedPaths: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      importedPaths.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.getText(sourceFile) === 'require' &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      importedPaths.push(node.arguments[0].text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      importedPaths.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return importedPaths;
}

function resolveImportPath(importSpecifier: string, fromFile: string, allFilesSet: Set<string>): string | null {
  // Only resolve relative project imports (starting with ./ or ../)
  if (!importSpecifier.startsWith('.')) {
    return null;
  }

  const fromDir = path.dirname(fromFile);
  const rawTarget = normalizePath(path.join(fromDir, importSpecifier));

  // 1. Direct exact match
  if (allFilesSet.has(rawTarget)) {
    return rawTarget;
  }

  // 2. TypeScript NodeNext ESM mapping: import foo from './foo.js' where on disk it is 'foo.ts'
  const strippedTarget = rawTarget.replace(/\.(js|jsx|mjs|cjs|ts|tsx)$/, '');
  for (const ext of SUPPORTED_EXTENSIONS) {
    const withExt = strippedTarget + ext;
    if (allFilesSet.has(withExt)) {
      return withExt;
    }
  }

  // 3. Try appending extension to rawTarget
  for (const ext of SUPPORTED_EXTENSIONS) {
    const withExt = rawTarget + ext;
    if (allFilesSet.has(withExt)) {
      return withExt;
    }
    // Also check index files e.g. ./routes -> ./routes/index.ts
    const indexWithExt = normalizePath(path.join(rawTarget, 'index' + ext));
    if (allFilesSet.has(indexWithExt)) {
      return indexWithExt;
    }
  }

  // 4. Also check index inside stripped target
  for (const ext of SUPPORTED_EXTENSIONS) {
    const indexWithExt = normalizePath(path.join(strippedTarget, 'index' + ext));
    if (allFilesSet.has(indexWithExt)) {
      return indexWithExt;
    }
  }

  return null;
}

export async function buildDependencyGraph(projectRoot: string): Promise<ProjectDependencyGraph> {
  const allFiles = await scanDirectory(projectRoot, projectRoot);
  const allFilesSet = new Set(allFiles);

  const forwardGraph = new Map<string, Set<string>>();
  const reverseGraph = new Map<string, Set<string>>();

  const routeFiles = new Set<string>();
  const serviceFiles = new Set<string>();
  const modelFiles = new Set<string>();
  const middlewareFiles = new Set<string>();
  const testFiles = new Set<string>();

  for (const file of allFiles) {
    forwardGraph.set(file, new Set());
    if (!reverseGraph.has(file)) {
      reverseGraph.set(file, new Set());
    }

    const lower = file.toLowerCase();
    if (
      lower.includes('/routes/') ||
      lower.includes('/api/') ||
      lower.endsWith('route.ts') ||
      lower.endsWith('route.js') ||
      lower.includes('controller')
    ) {
      routeFiles.add(file);
    }
    if (lower.includes('/service') || lower.endsWith('service.ts') || lower.endsWith('service.js')) {
      serviceFiles.add(file);
    }
    if (lower.includes('/model') || lower.includes('/schema') || lower.includes('/prisma/')) {
      modelFiles.add(file);
    }
    if (lower.includes('middleware') || lower.includes('auth') || lower.includes('guard')) {
      middlewareFiles.add(file);
    }
    if (lower.includes('.test.') || lower.includes('.spec.') || lower.includes('/tests/') || lower.includes('/__tests__/')) {
      testFiles.add(file);
    }
  }

  // Read files and extract imports
  for (const file of allFiles) {
    try {
      const fullPath = path.join(projectRoot, file);
      const content = await fs.readFile(fullPath, 'utf8');
      const importSpecifiers = extractImports(content, file);

      for (const specifier of importSpecifiers) {
        const resolved = resolveImportPath(specifier, file, allFilesSet);
        if (resolved) {
          forwardGraph.get(file)?.add(resolved);
          if (!reverseGraph.has(resolved)) {
            reverseGraph.set(resolved, new Set());
          }
          reverseGraph.get(resolved)?.add(file);
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  return {
    allFiles,
    forwardGraph,
    reverseGraph,
    routeFiles,
    serviceFiles,
    modelFiles,
    middlewareFiles,
    testFiles,
  };
}

export function computeBlastRadius(
  filePath: string,
  graph: ProjectDependencyGraph
): BlastRadius {
  const directDependents = Array.from(graph.reverseGraph.get(filePath) || []);
  const visited = new Set<string>();
  const queue = [...directDependents];

  for (const dep of directDependents) {
    visited.add(dep);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const nextDeps = graph.reverseGraph.get(current);
    if (nextDeps) {
      for (const next of nextDeps) {
        if (!visited.has(next) && next !== filePath) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
  }

  const allDownstream = Array.from(visited);
  const indirectDependents = allDownstream.filter((dep) => !directDependents.includes(dep));

  const affectedRoutes = allDownstream.filter((f) => graph.routeFiles.has(f));
  const affectedServices = allDownstream.filter((f) => graph.serviceFiles.has(f));
  const affectedTests = allDownstream.filter((f) => graph.testFiles.has(f));

  const totalConsumers = allDownstream.length;

  let level: SeverityLevel = 'LOW';
  if (totalConsumers > 6 || affectedRoutes.length > 2 || graph.middlewareFiles.has(filePath)) {
    level = 'HIGH';
  } else if (totalConsumers > 1 || affectedRoutes.length > 0) {
    level = 'MEDIUM';
  }

  return {
    filePath,
    directDependents,
    indirectDependents,
    affectedRoutes,
    affectedServices,
    affectedTests,
    totalConsumers,
    level,
  };
}
