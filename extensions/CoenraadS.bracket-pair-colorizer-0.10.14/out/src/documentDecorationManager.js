"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const documentDecoration_1 = require("./documentDecoration");
const settings_1 = require("./settings");
class DocumentDecorationManager {
    constructor() {
        this.showError = true;
        this.documents = new Map();
    }
    reset() {
        this.documents.forEach((document, key) => {
            document.dispose();
        });
        this.documents.clear();
        this.updateAllDocuments();
    }
    updateDocument(document) {
        const documentDecoration = this.getDocumentDecorations(document);
        if (documentDecoration) {
            documentDecoration.triggerUpdateDecorations();
        }
    }
    onDidChangeTextDocument(document, contentChanges) {
        const documentDecoration = this.getDocumentDecorations(document);
        if (documentDecoration) {
            documentDecoration.onDidChangeTextDocument(contentChanges);
        }
    }
    onDidChangeSelection(event) {
        const documentDecoration = this.getDocumentDecorations(event.textEditor.document);
        if (documentDecoration) {
            documentDecoration.updateScopeDecorations(event);
        }
    }
    onDidCloseTextDocument(closedDocument) {
        const uri = closedDocument.uri.toString();
        const document = this.documents.get(uri);
        if (document !== undefined) {
            document.dispose();
            this.documents.delete(closedDocument.uri.toString());
        }
    }
    updateAllDocuments() {
        vscode_1.window.visibleTextEditors.forEach((editor) => {
            this.updateDocument(editor.document);
        });
    }
    getDocumentDecorations(document) {
        if (!this.isValidDocument(document)) {
            return;
        }
        const uri = document.uri.toString();
        let documentDecorations = this.documents.get(uri);
        if (documentDecorations === undefined) {
            try {
                const settings = new settings_1.default({ languageID: document.languageId, documentUri: document.uri });
                documentDecorations = new documentDecoration_1.default(document, settings);
                this.documents.set(uri, documentDecorations);
            }
            catch (error) {
                if (error instanceof Error) {
                    if (this.showError) {
                        vscode_1.window.showErrorMessage("BracketPair Settings: " + error.message);
                        // Don't spam errors
                        this.showError = false;
                        setTimeout(() => {
                            this.showError = true;
                        }, 3000);
                    }
                }
                return;
            }
        }
        return documentDecorations;
    }
    isValidDocument(document) {
        if (document === undefined || document.lineCount === 0) {
            console.warn("Invalid document");
            return false;
        }
        return document.uri.scheme === "file" || document.uri.scheme === "untitled";
    }
}
exports.default = DocumentDecorationManager;
//# sourceMappingURL=documentDecorationManager.js.map