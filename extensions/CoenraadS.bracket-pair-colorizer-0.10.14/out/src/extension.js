"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const documentDecorationManager_1 = require("./documentDecorationManager");
function activate(context) {
    const documentDecorationManager = new documentDecorationManager_1.default();
    context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration((event) => {
        documentDecorationManager.reset();
    }));
    context.subscriptions.push(vscode_1.window.onDidChangeVisibleTextEditors(() => {
        documentDecorationManager.updateAllDocuments();
    }));
    context.subscriptions.push(vscode_1.workspace.onDidChangeTextDocument((event) => {
        documentDecorationManager.onDidChangeTextDocument(event.document, event.contentChanges);
    }));
    // vscode.window.onDidChangeTextEditorSelection((event) => {
    //     documentDecorationManager.onDidChangeSelection(event);
    // }, null, context.subscriptions);
    context.subscriptions.push(vscode_1.workspace.onDidCloseTextDocument((event) => {
        documentDecorationManager.onDidCloseTextDocument(event);
    }));
    documentDecorationManager.reset();
}
exports.activate = activate;
// tslint:disable-next-line:no-empty
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map