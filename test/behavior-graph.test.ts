import { describe, it, expect } from 'vitest';
import {
  classifyRole,
  buildBehaviorGraph,
  findCriticalPathsTouchingFile,
  formatBehaviorGraphAscii,
} from '../src/core/graph/behavior-graph.js';
import type { ProjectDependencyGraph } from '../src/core/graph/dependency-graph.js';

describe('Semantic Behavior Graph Engine', () => {
  it('correctly classifies architectural roles by file path and syntax', () => {
    expect(classifyRole('src/routes/user.route.ts')).toBe('API_ROUTE');
    expect(classifyRole('src/api/auth.ts')).toBe('API_ROUTE');
    expect(classifyRole('src/middlewares/auth.guard.ts')).toBe('AUTH_BOUNDARY');
    expect(classifyRole('src/models/user.model.ts')).toBe('DATABASE_MODEL');
    expect(classifyRole('prisma/schema.prisma')).toBe('DATABASE_MODEL');
    expect(classifyRole('test/auth.test.ts')).toBe('TEST_SUITE');
    expect(classifyRole('src/utils/math.ts')).toBe('INTERNAL_LOGIC');

    // Content-based classification
    expect(classifyRole('src/services/publisher.ts', 'eventEmitter.emit("order.created")')).toBe(
      'EVENT_PRODUCER'
    );
    expect(classifyRole('src/services/worker.ts', 'queue.on("job", handleJob)')).toBe(
      'EVENT_CONSUMER'
    );
    expect(classifyRole('src/services/db.ts', 'const users = await prisma.user.findMany()')).toBe(
      'DATABASE_MODEL'
    );
  });

  it('builds a behavior graph with semantic relationships and discovers critical paths', async () => {
    const mockDepGraph: ProjectDependencyGraph = {
      allFiles: [
        'src/routes/checkout.ts',
        'src/middleware/auth.ts',
        'src/models/order.ts',
        'test/checkout.test.ts',
      ],
      forwardGraph: new Map([
        ['src/routes/checkout.ts', new Set(['src/middleware/auth.ts', 'src/models/order.ts'])],
        ['src/middleware/auth.ts', new Set()],
        ['src/models/order.ts', new Set()],
        ['test/checkout.test.ts', new Set(['src/routes/checkout.ts'])],
      ]),
      reverseGraph: new Map([
        ['src/middleware/auth.ts', new Set(['src/routes/checkout.ts'])],
        ['src/models/order.ts', new Set(['src/routes/checkout.ts'])],
        ['src/routes/checkout.ts', new Set(['test/checkout.test.ts'])],
        ['test/checkout.test.ts', new Set()],
      ]),
      routeFiles: new Set(['src/routes/checkout.ts']),
      serviceFiles: new Set(),
      modelFiles: new Set(['src/models/order.ts']),
      middlewareFiles: new Set(['src/middleware/auth.ts']),
      testFiles: new Set(['test/checkout.test.ts']),
    };

    const graph = await buildBehaviorGraph(process.cwd(), mockDepGraph);

    expect(graph.nodes['src/routes/checkout.ts'].role).toBe('API_ROUTE');
    expect(graph.nodes['src/middleware/auth.ts'].role).toBe('AUTH_BOUNDARY');
    expect(graph.nodes['src/models/order.ts'].role).toBe('DATABASE_MODEL');
    expect(graph.nodes['test/checkout.test.ts'].role).toBe('TEST_SUITE');

    // Should detect the Protected Data Access critical path: Route -> Auth -> Model
    expect(graph.criticalPaths.length).toBeGreaterThan(0);
    const cp = graph.criticalPaths[0];
    expect(cp.riskLevel).toBe('CRITICAL');
    expect(cp.steps).toEqual([
      'src/routes/checkout.ts',
      'src/middleware/auth.ts',
      'src/models/order.ts',
    ]);

    // Finding critical paths touching file
    const touching = findCriticalPathsTouchingFile('src/routes/checkout.ts', graph);
    expect(touching.length).toBe(1);

    // ASCII Tree rendering
    const ascii = formatBehaviorGraphAscii('src/routes/checkout.ts', graph);
    expect(ascii).toContain('TARGET: src/routes/checkout.ts');
    expect(ascii).toContain('API ROUTE');
    expect(ascii).toContain('CRITICAL EXECUTION PATHS');
  });
});
