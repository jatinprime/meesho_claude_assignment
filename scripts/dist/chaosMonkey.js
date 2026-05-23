"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const path = __importStar(require("path"));
const project = new ts_morph_1.Project();
const servicesDir = path.join(process.cwd(), '../services');
project.addSourceFilesAtPaths([
    `${servicesDir}/**/*.ts`,
    `!${servicesDir}/**/*.d.ts`,
    `!${servicesDir}/node_modules/**`
]);
const sourceFiles = project.getSourceFiles();
console.log(`[Chaos Monkey] Target directory: ${servicesDir}`);
console.log(`[Chaos Monkey] Found ${sourceFiles.length} source files.`);
// Bug 1: Syntax Errors
function injectSyntaxError(file) {
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
function injectTypeMismatch(file) {
    const typeReferences = file.getDescendantsOfKind(ts_morph_1.SyntaxKind.TypeReference);
    const keywordTypes = [
        ...file.getDescendantsOfKind(ts_morph_1.SyntaxKind.NumberKeyword),
        ...file.getDescendantsOfKind(ts_morph_1.SyntaxKind.StringKeyword),
        ...file.getDescendantsOfKind(ts_morph_1.SyntaxKind.BooleanKeyword)
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
function injectLogicError(file) {
    const binaryExpressions = file.getDescendantsOfKind(ts_morph_1.SyntaxKind.BinaryExpression);
    for (const expr of binaryExpressions) {
        const operator = expr.getOperatorToken();
        if (operator.getKind() === ts_morph_1.SyntaxKind.EqualsEqualsEqualsToken) {
            operator.replaceWithText('!==');
            return true;
        }
        else if (operator.getKind() === ts_morph_1.SyntaxKind.ExclamationEqualsEqualsToken) {
            operator.replaceWithText('===');
            return true;
        }
        else if (operator.getKind() === ts_morph_1.SyntaxKind.PlusToken) {
            operator.replaceWithText('-');
            return true;
        }
    }
    return false;
}
// Bug 4: Unhandled Promise Rejections
function injectUnhandledPromise(file) {
    const awaitExpressions = file.getDescendantsOfKind(ts_morph_1.SyntaxKind.AwaitExpression);
    if (awaitExpressions.length > 0) {
        const expr = awaitExpressions[Math.floor(Math.random() * awaitExpressions.length)];
        const expressionText = expr.getExpression().getText();
        expr.replaceWithText(expressionText); // Remove await
        return true;
    }
    return false;
}
// Bug 5: Infinite Loops / Resource Exhaustion
function injectInfiniteLoop(file) {
    const forStatements = file.getDescendantsOfKind(ts_morph_1.SyntaxKind.ForStatement);
    for (const stmt of forStatements) {
        const condition = stmt.getCondition();
        if (condition) {
            condition.replaceWithText('true');
            return true;
        }
    }
    const whileStatements = file.getDescendantsOfKind(ts_morph_1.SyntaxKind.WhileStatement);
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
