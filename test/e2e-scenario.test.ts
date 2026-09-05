import { describe, it, expect } from 'vitest';
import { analyzeASTDiff } from '../src/core/parser/ast-parser.js';
import { detectBehavioralChanges } from '../src/core/analyzer/behavior-analyzer.js';
import { calculateRiskScore } from '../src/core/risk/risk-engine.js';
import type { BlastRadius } from '../src/types/index.js';

describe('Real AI-Generated Change Scenario (Section 7 Golden Test)', () => {
  it('correctly catches API contract break + auth mutation with high blast radius and high risk', () => {
    // Scenario 1: AI changed API response structure
    const apiBefore = `
      export async function getUser(req, res) {
        const user = await db.users.findById(req.params.id);
        return user;
      }
    `;
    const apiAfter = `
      export async function getUser(req, res) {
        const user = await db.users.findById(req.params.id);
        return { user };
      }
    `;

    const apiAstDiff = analyzeASTDiff('src/routes/user.ts', apiBefore, apiAfter);
    const apiBlast: BlastRadius = {
      filePath: 'src/routes/user.ts',
      directDependents: ['src/client/userClient.ts', 'src/views/profile.ts', 'src/services/billing.ts'],
      indirectDependents: ['src/app.ts'],
      affectedRoutes: ['src/routes/user.ts'],
      affectedServices: ['src/services/billing.ts'],
      affectedTests: [],
      totalConsumers: 4,
      level: 'MEDIUM',
    };

    const apiFindings = detectBehavioralChanges(
      apiAstDiff,
      apiBlast,
      true, // isRoute
      false, // isMiddleware
      false // isTestChanged
    );

    expect(apiFindings.length).toBe(1);
    expect(apiFindings[0].category).toBe('API_CONTRACT');
    expect(apiFindings[0].severity).toBe('HIGH');
    expect(apiFindings[0].evidence.some((e) => e.includes('{ user }'))).toBe(true);

    // Scenario 2: AI modified authentication condition
    const authBefore = `
      export function requireAuth(req, res, next) {
        if (!req.user) {
          return res.status(401).send("Unauthorized");
        }
        next();
      }
    `;
    const authAfter = `
      export function requireAuth(req, res, next) {
        if (!req.user || req.user.role !== 'admin') {
          return res.status(403).send("Forbidden: Admins only");
        }
        next();
      }
    `;

    const authAstDiff = analyzeASTDiff('src/middleware/auth.ts', authBefore, authAfter);
    const authBlast: BlastRadius = {
      filePath: 'src/middleware/auth.ts',
      directDependents: [
        'src/routes/dashboard.ts',
        'src/routes/settings.ts',
        'src/routes/reports.ts',
        'src/routes/billing.ts',
        'src/routes/team.ts',
      ],
      indirectDependents: ['src/app.ts'],
      affectedRoutes: [
        'src/routes/dashboard.ts',
        'src/routes/settings.ts',
        'src/routes/reports.ts',
        'src/routes/billing.ts',
        'src/routes/team.ts',
      ],
      affectedServices: [],
      affectedTests: [],
      totalConsumers: 6,
      level: 'HIGH',
    };

    const authFindings = detectBehavioralChanges(
      authAstDiff,
      authBlast,
      false, // isRoute
      true, // isMiddleware
      false // isTestChanged
    );

    expect(authFindings.length).toBe(1);
    expect(authFindings[0].category).toBe('AUTH');
    expect(authFindings[0].severity).toBe('HIGH');
    expect(authFindings[0].evidence.some((e) => e.includes('protected routes'))).toBe(true);

    // Combine findings and calculate total project risk
    const allFindings = [...apiFindings, ...authFindings];
    const blastMap = {
      'src/routes/user.ts': apiBlast,
      'src/middleware/auth.ts': authBlast,
    };

    const projectRisk = calculateRiskScore(allFindings, blastMap, false);

    // Expected Golden Moment: Risk > 70 (HIGH/CRITICAL), backed by clear factors
    expect(projectRisk.score).toBeGreaterThanOrEqual(70);
    expect(['HIGH', 'CRITICAL']).toContain(projectRisk.level);
    expect(projectRisk.factors.length).toBeGreaterThanOrEqual(3);
  });
});
