"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const logEntryNode_1 = require("./logEntryNode");
// import * as path from 'path';
class CommitProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._logEntries = [];
    }
    addLogEntry(logEntry) {
        this._logEntries.push(logEntry);
    }
    clear() {
        this._logEntries = [];
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (this._logEntries.length === 0) {
            return Promise.resolve([]);
        }
        if (!element) {
            return Promise.all(this._logEntries.map(this.buildNodeForLogEntry));
        }
        if (element && element instanceof logEntryNode_1.LogEntryNode) {
            return Promise.all(this.buildChildNodesForLogEntry(element.logEntry));
        }
        // if (element && element instanceof DirectoryNode) {
        //     return Promise.all(this.buildSubDirectories(element));
        // }
        return Promise.resolve([]);
    }
    buildNodeForLogEntry(logEntry) {
        return new logEntryNode_1.LogEntryNode(logEntry);
    }
    buildChildNodesForLogEntry(logEntry) {
        return [
            new logEntryNode_1.TextNode(`${logEntry.sha1.short} - ${logEntry.subject}`),
            ...this.buildChildDirectoriesForLogEntry(logEntry)
        ];
    }
    buildChildDirectoriesForLogEntry(logEntry) {
        return logEntry.fileStats
            .map(fileStat => new logEntryNode_1.FileStatNode(fileStat, logEntry))
            .sort((a, b) => a.fileStat.path < b.fileStat.path ? -1 : 1);
    }
}
exports.CommitProvider = CommitProvider;
//# sourceMappingURL=commitProvider.js.map