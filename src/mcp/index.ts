import path from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { z } from 'zod';
import {
  analyzeChanges,
  buildDependencyGraph,
  computeBlastRadius,
  evaluatePreflight,
  getFileHistory,
} from '../index.js';

export interface McpServerOptions {
  name?: string;
  version?: string;
}

/**
 * Creates and registers tools and prompts on an McpServer instance.
 */
export function createMcpServer(options: McpServerOptions = {}): McpServer {
  const server = new McpServer({
    name: options.name || 'change-firewall',
    version: options.version || '0.1.6',
  });

  // Tool 1: analyze_changes
  server.tool(
    'analyze_changes',
    'Analyze the Git repository working tree or staged diffs for behavioral breaking changes, AST mutations, downstream blast radius, and deterministic risk score (0-100).',
    {
      cwd: z
        .string()
        .optional()
        .describe('Directory path of the git repository (default: current working directory)'),
      base: z
        .string()
        .optional()
        .describe('Base git ref or commit to compare against (default: HEAD)'),
      staged: z
        .boolean()
        .optional()
        .describe('Only analyze staged git changes (default: false)'),
    },
    async ({ cwd, base, staged }) => {
      try {
        const repoPath = cwd ? path.resolve(cwd) : process.cwd();
        const report = await analyzeChanges({
          cwd: repoPath,
          base,
          staged,
        });

        const payload = {
          timestamp: report.timestamp,
          projectPath: report.projectPath,
          branch: report.branch,
          baseCommit: report.baseCommit,
          summary: {
            totalFilesChanged: report.totalFilesChanged,
            linesAdded: report.linesAdded,
            linesDeleted: report.linesDeleted,
            behavioralChangesCount: report.behavioralChangesCount,
          },
          risk: report.risk,
          findings: report.findings,
          blastRadiusMap: report.blastRadiusMap,
          recommendations: report.recommendations,
          suspiciousChanges: report.suspiciousChanges,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payload, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error analyzing changes: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool 2: evaluate_preflight
  server.tool(
    'evaluate_preflight',
    'Determine whether the current code modifications are safe to merge or commit, checking against risk score thresholds and blocking on high-severity behavioral mutations.',
    {
      cwd: z
        .string()
        .optional()
        .describe('Directory path of the git repository (default: current working directory)'),
      maxRisk: z
        .number()
        .optional()
        .describe('Maximum acceptable risk score before blocking merge (default: 60)'),
      failOnHigh: z
        .boolean()
        .optional()
        .describe('Whether to automatically fail/block on any high-severity behavioral findings (default: true)'),
      base: z
        .string()
        .optional()
        .describe('Base git commit or branch to compare against (default: HEAD)'),
      staged: z
        .boolean()
        .optional()
        .describe('Only evaluate staged git changes (default: false)'),
    },
    async ({ cwd, maxRisk = 60, failOnHigh = true, base, staged }) => {
      try {
        const repoPath = cwd ? path.resolve(cwd) : process.cwd();
        const report = await analyzeChanges({
          cwd: repoPath,
          base,
          staged,
        });

        const result = evaluatePreflight(report, {
          maxRisk,
          failOnHigh,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Preflight evaluation failed: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool 3: compute_blast_radius
  server.tool(
    'compute_blast_radius',
    'Inspect the downstream impact, total dependent files, direct consumers, indirect consumers, and affected API routes for a specific file.',
    {
      file: z
        .string()
        .describe('File path (relative or absolute) to compute downstream blast radius for'),
      cwd: z
        .string()
        .optional()
        .describe('Directory path of the git repository (default: current working directory)'),
    },
    async ({ file, cwd }) => {
      try {
        const repoPath = cwd ? path.resolve(cwd) : process.cwd();
        const graph = await buildDependencyGraph(repoPath);
        const normalized = path.relative(repoPath, path.resolve(repoPath, file)).replace(/\\/g, '/');
        const blast = computeBlastRadius(normalized, graph);

        const payload = {
          file: normalized,
          severity: blast.level,
          totalConsumers: blast.totalConsumers,
          directDependents: blast.directDependents,
          indirectDependents: blast.indirectDependents,
          affectedRoutes: blast.affectedRoutes,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payload, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error calculating blast radius for ${file}: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool 4: explain_file_impact
  server.tool(
    'explain_file_impact',
    'Explain why a specific file matters to the system architecture, its architectural role (route, middleware, model, service), historical git churn, unique authors, and callers.',
    {
      file: z
        .string()
        .describe('File path (relative or absolute) to explain'),
      cwd: z
        .string()
        .optional()
        .describe('Directory path of the git repository (default: current working directory)'),
    },
    async ({ file, cwd }) => {
      try {
        const repoPath = cwd ? path.resolve(cwd) : process.cwd();
        const graph = await buildDependencyGraph(repoPath);
        const normalized = path.relative(repoPath, path.resolve(repoPath, file)).replace(/\\/g, '/');
        const blast = computeBlastRadius(normalized, graph);
        const history = await getFileHistory(normalized, repoPath);

        let role = 'General Utility / Component';
        if (graph.middlewareFiles.has(normalized)) role = 'Authentication / Security Middleware';
        else if (graph.routeFiles.has(normalized)) role = 'Public / Protected API Route';
        else if (graph.serviceFiles.has(normalized)) role = 'Business Logic Service Layer';
        else if (graph.modelFiles.has(normalized)) role = 'Database Model / Data Layer';
        else if (graph.testFiles.has(normalized)) role = 'Automated Test Suite';

        const payload = {
          file: normalized,
          architecturalRole: role,
          blastSeverity: blast.level,
          totalConsumers: blast.totalConsumers,
          directDependents: blast.directDependents,
          affectedRoutes: blast.affectedRoutes,
          gitHistory: {
            totalCommits: history.totalCommits,
            uniqueAuthors: history.uniqueAuthors,
            isHighChurn: history.isHighChurn,
            recentCommits: history.recentCommits,
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payload, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error explaining file impact for ${file}: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Prompt: change_firewall_audit
  server.prompt(
    'change_firewall_audit',
    'Prompt template instructing the AI model to perform a Change Firewall safety audit on current changes before committing or completing the task.',
    {
      focus: z
        .string()
        .optional()
        .describe('Optional area of emphasis (e.g. security, api-contracts, database, routes)'),
    },
    ({ focus }) => {
      const focusText = focus ? ` with special focus on ${focus}` : '';
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please run a Change Firewall audit on the current changes using the \`analyze_changes\` and \`evaluate_preflight\` tools${focusText}. Inspect any behavioral mutations, assess downstream impact, and report whether the diff is safe to commit. If there are high-risk findings, propose self-corrections.`,
            },
          },
        ],
      };
    }
  );

  return server;
}

/**
 * Starts the Change Firewall MCP server over the specified transport (defaults to StdioServerTransport).
 * Notice: All informational logs are sent strictly to stderr to keep stdout clean for JSON-RPC framing.
 */
export async function startMcpServer(transport?: Transport): Promise<McpServer> {
  const server = createMcpServer();
  const activeTransport = transport || new StdioServerTransport();

  console.error('[change-firewall] Starting Model Context Protocol (MCP) server over stdio...');
  await server.connect(activeTransport);
  console.error('[change-firewall] MCP server connected and ready for requests.');

  return server;
}
