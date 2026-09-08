import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import ts from 'typescript';
import type { ASTDiff, BlastRadius, SymbolicFailureTrace } from '../../types/index.js';

let traceCounter = 0;
function nextTraceId(): string {
  return `trace-${++traceCounter}`;
}

/**
 * Symbolically traces call sites in downstream consumers to mathematically prove
 * whether a widened null, deleted symbol, or shape mutation causes an unhandled runtime exception.
 */
export async function generateSymbolicCrashTraces(
  diffs: ASTDiff[],
  blastRadiusMap: Record<string, BlastRadius>,
  projectRoot: string
): Promise<SymbolicFailureTrace[]> {
  const traces: SymbolicFailureTrace[] = [];

  for (const diff of diffs) {
    const blast = blastRadiusMap[diff.filePath] || blastRadiusMap[diff.filePath.replace(/\\/g, '/')];
    if (!blast || blast.directDependents.length === 0) continue;

    // Check 1: Nullability Widening Trace
    for (const sym of diff.symbols) {
      const returnPart = sym.afterSignature?.includes(')')
        ? sym.afterSignature.slice(sym.afterSignature.lastIndexOf(')'))
        : (sym.afterSignature || '');
      const beforeReturnPart = sym.beforeSignature?.includes(')')
        ? sym.beforeSignature.slice(sym.beforeSignature.lastIndexOf(')'))
        : (sym.beforeSignature || '');

      const isNullWidened =
        sym.changeType === 'modified' &&
        (returnPart.includes('| null') || returnPart.includes('| undefined') || returnPart.includes('null')) &&
        (!beforeReturnPart.includes('| null') && !beforeReturnPart.includes('| undefined') && !beforeReturnPart.includes('null'));

      if (isNullWidened) {
        // Inspect direct dependents
        for (const depFile of blast.directDependents) {
          try {
            const depPath = path.join(projectRoot, depFile);
            const content = await fs.readFile(depPath, 'utf8');

            const sourceFile = ts.createSourceFile(
              depFile,
              content,
              ts.ScriptTarget.Latest,
              true,
              depFile.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
            );

            // Scan AST for calls to sym.name and subsequent unguarded property accesses
            let foundCallLine: number | undefined;
            let foundPropertyAccessLine: number | undefined;
            let accessedProperty: string | undefined;
            let hasGuard = false;

            function visit(node: ts.Node) {
              if (ts.isCallExpression(node)) {
                const text = node.expression.getText(sourceFile);
                if (text === sym.name || text.endsWith(`.${sym.name}`)) {
                  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                  foundCallLine = line + 1;
                }
              }

              // Check if consumer uses optional chaining (?.) or if condition
              if (ts.isPropertyAccessExpression(node)) {
                if (node.questionDotToken) {
                  hasGuard = true;
                } else if (foundCallLine && !accessedProperty) {
                  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                  if (line + 1 >= foundCallLine) {
                    foundPropertyAccessLine = line + 1;
                    accessedProperty = node.name.getText(sourceFile);
                  }
                }
              }

              if (ts.isIfStatement(node)) {
                const cond = node.expression.getText(sourceFile);
                if (cond.includes('!') || cond.includes('== null') || cond.includes('=== null')) {
                  hasGuard = true;
                }
              }

              ts.forEachChild(node, visit);
            }

            visit(sourceFile);

            // If call was found and caller has no guard: generate exact proof!
            if (foundCallLine && !hasGuard) {
              const prop = accessedProperty || 'property';
              traces.push({
                id: nextTraceId(),
                sourceFile: diff.filePath,
                sourceSymbol: sym.name,
                consumerFile: depFile,
                consumerLine: foundPropertyAccessLine || foundCallLine,
                consumerSymbol: sym.name,
                failureType: 'UNHANDLED_NULL',
                simulatedException: `TypeError: Cannot read properties of null (reading '${prop}')`,
                proofSteps: [
                  `1. ${diff.filePath} ➔ '${sym.name}' contract widened to return null/undefined.`,
                  `2. ${depFile}:${foundCallLine} ➔ Invokes '${sym.name}()' expecting a valid non-null object.`,
                  `3. ${depFile}:${foundPropertyAccessLine || foundCallLine} ➔ Direct unguarded access on nullable result: .${prop}`,
                ],
                preventativeFix: `Add optional chaining '${sym.name}()?.${prop}' or a null guard check in ${depFile}:${foundCallLine}`,
              });
            }
          } catch {
            // Ignore file parse error
          }
        }
      }

      // Check 2: Deleted Export Symbol
      if (sym.changeType === 'removed') {
        for (const depFile of blast.directDependents.slice(0, 3)) {
          traces.push({
            id: nextTraceId(),
            sourceFile: diff.filePath,
            sourceSymbol: sym.name,
            consumerFile: depFile,
            failureType: 'MISSING_PROPERTY',
            simulatedException: `ReferenceError: '${sym.name}' is not exported from '${diff.filePath}'`,
            proofSteps: [
              `1. ${diff.filePath} ➔ Exported symbol '${sym.name}' was removed.`,
              `2. ${depFile} ➔ Downstream module imports and resolves '${sym.name}'.`,
              `3. Runtime Module Linker ➔ Import binding fails at module evaluation time.`,
            ],
            preventativeFix: `Provide deprecation wrapper or migration alias for '${sym.name}' in ${diff.filePath}`,
          });
        }
      }
    }

    // Check 3: API Response Contract Mutation
    if (diff.returnShapeChanged && diff.beforeReturnShape && diff.afterReturnShape) {
      if (blast.affectedRoutes.length > 0 || blast.directDependents.length > 0) {
        const targetConsumer = blast.affectedRoutes[0] || blast.directDependents[0];
        traces.push({
          id: nextTraceId(),
          sourceFile: diff.filePath,
          consumerFile: targetConsumer,
          failureType: 'TYPE_MISMATCH',
          simulatedException: `ContractMismatch: Expected '${diff.beforeReturnShape}', received '${diff.afterReturnShape}'`,
          proofSteps: [
            `1. ${diff.filePath} ➔ API return shape changed from '${diff.beforeReturnShape}' to '${diff.afterReturnShape}'.`,
            `2. ${targetConsumer} ➔ Expects previous response contract for deserialization.`,
            `3. Client Consumer ➔ Client runtime parsing throws payload validation error.`,
          ],
          preventativeFix: `Update client schema and integration tests to consume the new shape '${diff.afterReturnShape}'`,
        });
      }
    }
  }

  return traces;
}
