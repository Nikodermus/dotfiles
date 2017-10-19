"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const logEntryNode_1 = require("./logEntryNode");
// import * as path from 'path';
class CommitCompareProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    setComparisonEntries(leftEntry, rightEntry) {
        this._leftEntry = leftEntry;
        this._rightEntry = rightEntry;
    }
    clear() {
        this._leftEntry = undefined;
        this._rightEntry = undefined;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this._leftEntry) {
            return Promise.resolve([]);
        }
        const entries = this._leftEntry.fileStats.map(entry => {
            return new logEntryNode_1.CompareFileStatNode(entry, this._leftEntry, this._rightEntry);
        });
        return Promise.resolve(entries);
    }
}
exports.CommitCompareProvider = CommitCompareProvider;
//# sourceMappingURL=commitCompareProvider.js.map