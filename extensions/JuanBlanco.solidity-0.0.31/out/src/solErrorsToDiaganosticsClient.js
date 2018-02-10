"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const solErrorToDiagnostics = require("./solErrorsToDiagnostics");
const vscode_languageserver_1 = require("vscode-languageserver");
function errorsToDiagnostics(diagnosticCollection, errors) {
    let errorWarningCounts = { errors: 0, warnings: 0 };
    let diagnosticMap = new Map();
    errors.forEach(error => {
        let { diagnostic, fileName } = solErrorToDiagnostics.errorToDiagnostic(error);
        let targetUri = vscode.Uri.file(fileName);
        let diagnostics = diagnosticMap.get(targetUri);
        if (!diagnostics) {
            diagnostics = [];
        }
        diagnostics.push(diagnostic);
        diagnosticMap.set(targetUri, diagnostics);
    });
    let entries = [];
    diagnosticMap.forEach((diags, uri) => {
        errorWarningCounts.errors += diags.filter((diagnostic) => diagnostic.severity === vscode_languageserver_1.DiagnosticSeverity.Error).length;
        errorWarningCounts.warnings += diags.filter((diagnostic) => diagnostic.severity === vscode_languageserver_1.DiagnosticSeverity.Warning).length;
        entries.push([uri, diags]);
    });
    diagnosticCollection.set(entries);
    return errorWarningCounts;
}
exports.errorsToDiagnostics = errorsToDiagnostics;
//# sourceMappingURL=solErrorsToDiaganosticsClient.js.map