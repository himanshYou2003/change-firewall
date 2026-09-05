import ts from 'typescript';
import type { ASTDiff, ChangedSymbol } from '../../types/index.js';

interface ParsedFile {
  exports: Map<string, { kind: ChangedSymbol['kind']; signature: string; node: ts.Node }>;
  returnExpressions: string[];
  throwExpressions: string[];
  calls: Set<string>;
  authConditions: string[];
  hasZodValidation: boolean;
}

function getNodeSignature(node: ts.Node, sourceFile: ts.SourceFile): string {
  if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
    const name = node.name ? node.name.getText(sourceFile) : 'anonymous';
    const params = node.parameters.map((p) => p.getText(sourceFile)).join(', ');
    const returnType = node.type ? `: ${node.type.getText(sourceFile)}` : '';
    return `${name}(${params})${returnType}`;
  }
  if (ts.isClassDeclaration(node)) {
    const name = node.name ? node.name.getText(sourceFile) : 'anonymous';
    return `class ${name}`;
  }
  if (ts.isInterfaceDeclaration(node)) {
    return `interface ${node.name.getText(sourceFile)}`;
  }
  if (ts.isTypeAliasDeclaration(node)) {
    return `type ${node.name.getText(sourceFile)} = ${node.type.getText(sourceFile)}`;
  }
  if (ts.isVariableStatement(node)) {
    return node.declarationList.getText(sourceFile);
  }
  return node.getText(sourceFile).slice(0, 100);
}

function parseSourceFile(filePath: string, content: string): ParsedFile {
  const isTs = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
  const isJsx = filePath.endsWith('.jsx') || filePath.endsWith('.tsx');

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    isJsx ? ts.ScriptKind.TSX : isTs ? ts.ScriptKind.TS : ts.ScriptKind.JS
  );

  const exportsMap = new Map<string, { kind: ChangedSymbol['kind']; signature: string; node: ts.Node }>();
  const returnExpressions: string[] = [];
  const throwExpressions: string[] = [];
  const calls = new Set<string>();
  const authConditions: string[] = [];
  let hasZodValidation = false;

  function visit(node: ts.Node) {
    // Check for exports
    const hasExportModifier =
      ts.canHaveModifiers(node) &&
      ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

    if (hasExportModifier) {
      if (ts.isFunctionDeclaration(node) && node.name) {
        const name = node.name.getText(sourceFile);
        exportsMap.set(name, {
          kind: 'function',
          signature: getNodeSignature(node, sourceFile),
          node,
        });
      } else if (ts.isClassDeclaration(node) && node.name) {
        const name = node.name.getText(sourceFile);
        exportsMap.set(name, {
          kind: 'class',
          signature: getNodeSignature(node, sourceFile),
          node,
        });
      } else if (ts.isInterfaceDeclaration(node)) {
        const name = node.name.getText(sourceFile);
        exportsMap.set(name, {
          kind: 'interface',
          signature: getNodeSignature(node, sourceFile),
          node,
        });
      } else if (ts.isTypeAliasDeclaration(node)) {
        const name = node.name.getText(sourceFile);
        exportsMap.set(name, {
          kind: 'type',
          signature: getNodeSignature(node, sourceFile),
          node,
        });
      } else if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            const name = decl.name.getText(sourceFile);
            exportsMap.set(name, {
              kind: 'variable',
              signature: decl.getText(sourceFile),
              node: decl,
            });
          }
        }
      }
    } else if (ts.isExportAssignment(node)) {
      // export default ...
      exportsMap.set('default', {
        kind: 'export',
        signature: `export default ${node.expression.getText(sourceFile).slice(0, 80)}`,
        node,
      });
    }

    // Check return expressions
    if (ts.isReturnStatement(node) && node.expression) {
      returnExpressions.push(node.expression.getText(sourceFile).trim());
    }

    // Check throws
    if (ts.isThrowStatement(node)) {
      throwExpressions.push(node.expression.getText(sourceFile).trim());
    }

    // Check call expressions
    if (ts.isCallExpression(node)) {
      const callText = node.expression.getText(sourceFile);
      calls.add(callText);

      // Check validation
      if (callText.includes('parse') || callText.includes('validate') || callText.includes('safeParse')) {
        hasZodValidation = true;
      }
    }

    // Check auth-related condition branches
    if (ts.isIfStatement(node)) {
      const conditionText = node.expression.getText(sourceFile);
      const isAuthRelated =
        conditionText.includes('auth') ||
        conditionText.includes('user') ||
        conditionText.includes('role') ||
        conditionText.includes('permission') ||
        conditionText.includes('token') ||
        conditionText.includes('session');

      if (isAuthRelated) {
        authConditions.push(conditionText);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    exports: exportsMap,
    returnExpressions,
    throwExpressions,
    calls,
    authConditions,
    hasZodValidation,
  };
}

export function analyzeASTDiff(
  filePath: string,
  beforeContent?: string,
  afterContent?: string
): ASTDiff {
  const symbols: ChangedSymbol[] = [];
  const details: string[] = [];
  const callsAdded: string[] = [];
  const callsRemoved: string[] = [];

  // If file is deleted or added
  if (!beforeContent && afterContent) {
    const after = parseSourceFile(filePath, afterContent);
    for (const [name, exp] of after.exports) {
      symbols.push({
        name,
        kind: exp.kind,
        changeType: 'added',
        afterSignature: exp.signature,
      });
    }
    return {
      filePath,
      symbols,
      returnShapeChanged: false,
      authConditionChanged: after.authConditions.length > 0,
      authDetails: after.authConditions.length > 0 ? `Introduced auth check: ${after.authConditions.join('; ')}` : undefined,
      errorHandlingChanged: after.throwExpressions.length > 0,
      validationChanged: after.hasZodValidation,
      callsAdded: Array.from(after.calls),
      callsRemoved: [],
      details: [`New file created with ${after.exports.size} export(s)`],
    };
  }

  if (beforeContent && !afterContent) {
    const before = parseSourceFile(filePath, beforeContent);
    for (const [name, exp] of before.exports) {
      symbols.push({
        name,
        kind: exp.kind,
        changeType: 'removed',
        beforeSignature: exp.signature,
      });
    }
    return {
      filePath,
      symbols,
      returnShapeChanged: false,
      authConditionChanged: before.authConditions.length > 0,
      errorHandlingChanged: before.throwExpressions.length > 0,
      validationChanged: before.hasZodValidation,
      callsAdded: [],
      callsRemoved: Array.from(before.calls),
      details: [`File deleted removing ${before.exports.size} export(s)`],
    };
  }

  if (!beforeContent || !afterContent) {
    return {
      filePath,
      symbols: [],
      returnShapeChanged: false,
      authConditionChanged: false,
      errorHandlingChanged: false,
      validationChanged: false,
      callsAdded: [],
      callsRemoved: [],
      details: [],
    };
  }

  const before = parseSourceFile(filePath, beforeContent);
  const after = parseSourceFile(filePath, afterContent);

  // Compare exports
  for (const [name, afterExp] of after.exports) {
    const beforeExp = before.exports.get(name);
    if (!beforeExp) {
      symbols.push({
        name,
        kind: afterExp.kind,
        changeType: 'added',
        afterSignature: afterExp.signature,
      });
      details.push(`Added exported ${afterExp.kind}: ${name}`);
    } else if (beforeExp.signature !== afterExp.signature) {
      symbols.push({
        name,
        kind: afterExp.kind,
        changeType: 'modified',
        beforeSignature: beforeExp.signature,
        afterSignature: afterExp.signature,
      });
      details.push(`Modified signature of ${name}: '${beforeExp.signature}' -> '${afterExp.signature}'`);
    }
  }

  for (const [name, beforeExp] of before.exports) {
    if (!after.exports.has(name)) {
      symbols.push({
        name,
        kind: beforeExp.kind,
        changeType: 'removed',
        beforeSignature: beforeExp.signature,
      });
      details.push(`Removed exported ${beforeExp.kind}: ${name}`);
    }
  }

  // Compare Return Expressions (API Response & Function Contract Shifts)
  let returnShapeChanged = false;
  let beforeReturnShape: string | undefined;
  let afterReturnShape: string | undefined;

  const beforeReturnsStr = before.returnExpressions.join('; ');
  const afterReturnsStr = after.returnExpressions.join('; ');

  if (beforeReturnsStr !== afterReturnsStr && before.returnExpressions.length > 0 && after.returnExpressions.length > 0) {
    // Check for structural object wrapper change e.g. return user vs return { user }
    const beforePrimary = before.returnExpressions[before.returnExpressions.length - 1];
    const afterPrimary = after.returnExpressions[after.returnExpressions.length - 1];

    if (beforePrimary !== afterPrimary) {
      returnShapeChanged = true;
      beforeReturnShape = beforePrimary;
      afterReturnShape = afterPrimary;
      details.push(`Return statement changed from '${beforePrimary}' to '${afterPrimary}'`);
    }
  }

  // Compare Auth conditions
  let authConditionChanged = false;
  let authDetails: string | undefined;

  const beforeAuthStr = before.authConditions.join('; ');
  const afterAuthStr = after.authConditions.join('; ');

  if (beforeAuthStr !== afterAuthStr) {
    authConditionChanged = true;
    if (before.authConditions.length === 0 && after.authConditions.length > 0) {
      authDetails = `Added authentication guard condition: "${afterAuthStr}"`;
    } else if (before.authConditions.length > 0 && after.authConditions.length === 0) {
      authDetails = `Removed authentication guard condition: "${beforeAuthStr}"`;
    } else {
      authDetails = `Modified authentication logic from "${beforeAuthStr}" to "${afterAuthStr}"`;
    }
    details.push(authDetails);
  }

  // Compare Errors
  let errorHandlingChanged = false;
  let errorDetails: string | undefined;
  const beforeThrows = before.throwExpressions.length;
  const afterThrows = after.throwExpressions.length;

  if (beforeThrows !== afterThrows) {
    errorHandlingChanged = true;
    if (beforeThrows > afterThrows) {
      errorDetails = `Reduced throw expressions (${beforeThrows} -> ${afterThrows}); errors may now be caught or swallowed`;
    } else {
      errorDetails = `Added new throw expression(s): ${after.throwExpressions.slice(beforeThrows).join(', ')}`;
    }
    details.push(errorDetails);
  }

  // Compare Validation
  let validationChanged = false;
  let validationDetails: string | undefined;
  if (!before.hasZodValidation && after.hasZodValidation) {
    validationChanged = true;
    validationDetails = 'Added schema/request payload validation check';
    details.push(validationDetails);
  } else if (before.hasZodValidation && !after.hasZodValidation) {
    validationChanged = true;
    validationDetails = 'Removed schema/request payload validation check';
    details.push(validationDetails);
  }

  // Compare Function Calls
  for (const call of after.calls) {
    if (!before.calls.has(call)) {
      callsAdded.push(call);
    }
  }
  for (const call of before.calls) {
    if (!after.calls.has(call)) {
      callsRemoved.push(call);
    }
  }

  return {
    filePath,
    symbols,
    returnShapeChanged,
    beforeReturnShape,
    afterReturnShape,
    authConditionChanged,
    authDetails,
    errorHandlingChanged,
    errorDetails,
    validationChanged,
    validationDetails,
    callsAdded,
    callsRemoved,
    details,
  };
}
