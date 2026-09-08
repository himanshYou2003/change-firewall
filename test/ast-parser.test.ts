import { describe, it, expect } from 'vitest';
import { analyzeASTDiff } from '../src/core/parser/ast-parser.js';

describe('AST Parser & Semantic Diff', () => {
  it('detects API response wrap: return user -> return { user }', () => {
    const before = `
      export async function getUser(req, res) {
        const user = await db.find(req.params.id);
        return user;
      }
    `;

    const after = `
      export async function getUser(req, res) {
        const user = await db.find(req.params.id);
        return { user };
      }
    `;

    const diff = analyzeASTDiff('src/routes/user.ts', before, after);

    expect(diff.returnShapeChanged).toBe(true);
    expect(diff.beforeReturnShape).toBe('user');
    expect(diff.afterReturnShape).toBe('{ user }');
  });

  it('detects auth condition mutation: authenticated -> role condition', () => {
    const before = `
      export function requireAuth(req, res, next) {
        if (!req.user) {
          throw new Error("Unauthorized");
        }
        next();
      }
    `;

    const after = `
      export function requireAuth(req, res, next) {
        if (!req.user || req.user.role !== 'admin') {
          throw new Error("Forbidden");
        }
        next();
      }
    `;

    const diff = analyzeASTDiff('src/middleware/auth.ts', before, after);

    expect(diff.authConditionChanged).toBe(true);
    expect(diff.authDetails).toContain('admin');
  });

  it('detects function signature type changes (nullability widening)', () => {
    const before = `
      export function findUser(id: string): User {
        return db.get(id);
      }
    `;

    const after = `
      export function findUser(id: string): User | null {
        return db.get(id) || null;
      }
    `;

    const diff = analyzeASTDiff('src/services/userService.ts', before, after);

    const changedSym = diff.symbols.find((s) => s.name === 'findUser');
    expect(changedSym).toBeDefined();
    expect(changedSym?.changeType).toBe('modified');
    expect(changedSym?.afterSignature).toContain('User | null');
  });

  it('detects deleted exports', () => {
    const before = `
      export const OLD_API_VERSION = "v1";
      export function legacyHandler() {}
    `;

    const after = `
      export const OLD_API_VERSION = "v1";
    `;

    const diff = analyzeASTDiff('src/utils/legacy.ts', before, after);
    const removedSym = diff.symbols.find((s) => s.name === 'legacyHandler');
    expect(removedSym).toBeDefined();
    expect(removedSym?.changeType).toBe('removed');
  });

  it('detects enum contract mutations and additions', () => {
    const before = `
      export enum UserStatus {
        ACTIVE = 'active',
        INACTIVE = 'inactive'
      }
    `;
    const after = `
      export enum UserStatus {
        ACTIVE = 'active',
        SUSPENDED = 'suspended'
      }
    `;

    const diff = analyzeASTDiff('src/types/status.ts', before, after);
    const enumSym = diff.symbols.find((s) => s.name === 'UserStatus');
    expect(enumSym).toBeDefined();
    expect(enumSym?.changeType).toBe('modified');
    expect(enumSym?.afterSignature).toContain('SUSPENDED');
  });

  it('detects namespace export declarations (export * as foo)', () => {
    const before = `
      export * as helpers from './helpers.js';
    `;
    const after = `
      export * as utilities from './helpers.js';
    `;

    const diff = analyzeASTDiff('src/index.ts', before, after);
    const addedSym = diff.symbols.find((s) => s.name === 'utilities');
    const removedSym = diff.symbols.find((s) => s.name === 'helpers');
    expect(addedSym?.changeType).toBe('added');
    expect(removedSym?.changeType).toBe('removed');
  });

  it('isolates arrow function contract changes from internal body modifications', () => {
    // 1. Internal body change only -> signature remains identical
    const beforeCode = `
      export const calculateDiscount = (price: number, rate: number): number => {
        return price * rate;
      };
    `;
    const afterCodeSameContract = `
      export const calculateDiscount = (price: number, rate: number): number => {
        const roundedRate = Math.min(rate, 0.5);
        return price * roundedRate;
      };
    `;
    const diffSame = analyzeASTDiff('src/calc.ts', beforeCode, afterCodeSameContract);
    const symSame = diffSame.symbols.find((s) => s.name === 'calculateDiscount');
    // Contract signature was not modified
    expect(symSame).toBeUndefined();

    // 2. Parameter signature change -> contract detected as modified
    const afterCodeDiffContract = `
      export const calculateDiscount = (price: number, rate: number, couponCode?: string): number => {
        return price * rate;
      };
    `;
    const diffDiff = analyzeASTDiff('src/calc.ts', beforeCode, afterCodeDiffContract);
    const symDiff = diffDiff.symbols.find((s) => s.name === 'calculateDiscount');
    expect(symDiff).toBeDefined();
    expect(symDiff?.changeType).toBe('modified');
    expect(symDiff?.afterSignature).toContain('couponCode?: string');
  });
});
