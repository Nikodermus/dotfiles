import * as ts from 'typescript';
import { Diagnostic } from 'vscode-languageserver';
/**
 * Converts a TypeScript Diagnostic to an LSP Diagnostic
 */
export declare function convertTsDiagnostic(diagnostic: ts.Diagnostic): Diagnostic;
