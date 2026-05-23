import { Project, SyntaxKind } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';

const project = new Project();
let servicesDir = path.join(process.cwd(), 'services');
if (!fs.existsSync(servicesDir)) {
  servicesDir = path.join(process.cwd(), '../services');
}
project.addSourceFilesAtPaths([
  `${servicesDir}/**/*.ts`,
  `!${servicesDir}/**/*.d.ts`,
  `!${servicesDir}/node_modules/**`
]);

const sourceFiles = project.getSourceFiles();

console.log(`[Chaos Monkey] Target directory: ${servicesDir}`);
console.log(`[Chaos Monkey] Found ${sourceFiles.length} source files.`);

// Bug 1: Syntax Errors
function injectSyntaxError(file: any): boolean {
  const text = file.getFullText();
  // Find a random closing brace and remove it
  const braceIndex = text.lastIndexOf('}');
  if (braceIndex !== -1) {
    const newText = text.slice(0, braceIndex) + text.slice(braceIndex + 1);
    file.replaceWithText(newText);
    return true;
  }
  return false;
}

// Bug 2: Type Mismatches
function injectTypeMismatch(file: any): boolean {
  const typeReferences = file.getDescendantsOfKind(SyntaxKind.TypeReference);
  const keywordTypes = [
    ...file.getDescendantsOfKind(SyntaxKind.NumberKeyword),
    ...file.getDescendantsOfKind(SyntaxKind.StringKeyword),
    ...file.getDescendantsOfKind(SyntaxKind.BooleanKeyword)
  ];

  const targets = [...typeReferences, ...keywordTypes];
  if (targets.length > 0) {
    const target = targets[Math.floor(Math.random() * targets.length)];
    target.replaceWithText('any');
    return true;
  }
  return false;
}

// Bug 3: Logic Errors
function injectLogicError(file: any): boolean {
  const binaryExpressions = file.getDescendantsOfKind(SyntaxKind.BinaryExpression);
  for (const expr of binaryExpressions) {
    const operator = expr.getOperatorToken();
    if (operator.getKind() === SyntaxKind.EqualsEqualsEqualsToken) {
      operator.replaceWithText('!==');
      return true;
    } else if (operator.getKind() === SyntaxKind.ExclamationEqualsEqualsToken) {
      operator.replaceWithText('===');
      return true;
    } else if (operator.getKind() === SyntaxKind.PlusToken) {
      operator.replaceWithText('-');
      return true;
    }
  }
  return false;
}

// Bug 4: Unhandled Promise Rejections
function injectUnhandledPromise(file: any): boolean {
  const awaitExpressions = file.getDescendantsOfKind(SyntaxKind.AwaitExpression);
  if (awaitExpressions.length > 0) {
    const expr = awaitExpressions[Math.floor(Math.random() * awaitExpressions.length)];
    const expressionText = expr.getExpression().getText();
    expr.replaceWithText(expressionText); // Remove await
    return true;
  }
  return false;
}

// Bug 5: Infinite Loops / Resource Exhaustion
function injectInfiniteLoop(file: any): boolean {
  const forStatements = file.getDescendantsOfKind(SyntaxKind.ForStatement);
  for (const stmt of forStatements) {
    const condition = stmt.getCondition();
    if (condition) {
      condition.replaceWithText('true');
      return true;
    }
  }
  const whileStatements = file.getDescendantsOfKind(SyntaxKind.WhileStatement);
  for (const stmt of whileStatements) {
    const condition = stmt.getExpression();
    condition.replaceWithText('true');
    return true;
  }
  return false;
}

const bugStrategies = [
  { name: 'Syntax Error', fn: injectSyntaxError },
  { name: 'Type Mismatch', fn: injectTypeMismatch },
  { name: 'Logic Error', fn: injectLogicError },
  { name: 'Unhandled Promise', fn: injectUnhandledPromise },
  { name: 'Infinite Loop', fn: injectInfiniteLoop }
];

let bugsInjected = 0;

for (const file of sourceFiles) {
  // Shuffle strategies to apply a random bug
  const shuffledStrategies = [...bugStrategies].sort(() => Math.random() - 0.5);
  
  for (const strategy of shuffledStrategies) {
    if (strategy.fn(file)) {
      console.log(`[Chaos Monkey] Injected ${strategy.name} into ${file.getBaseName()}`);
      bugsInjected++;
      break; // Only inject one bug per file to avoid overly mangling a single file
    }
  }
}

project.saveSync();
console.log(`[Chaos Monkey] Execution completed. Total bugs injected: ${bugsInjected}`);
