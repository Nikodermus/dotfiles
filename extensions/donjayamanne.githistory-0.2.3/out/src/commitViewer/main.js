"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const commitProvider_1 = require("./commitProvider");
const gitHistory = require("../helpers/gitHistory");
const historyUtil = require("../helpers/historyUtils");
const fileHistory_1 = require("../commands/fileHistory");
const path = require("path");
let provider;
let getGitRepoPath;
function activate(context, gitPath) {
    getGitRepoPath = gitPath;
    vscode.commands.registerCommand('git.viewTreeView', (branch, sha) => showCommitInTreeView(branch, sha));
    getGitRepoPath = getGitRepoPath;
    vscode.commands.registerCommand('git.commit.LogEntry.ViewChangeLog', (node) => __awaiter(this, void 0, void 0, function* () {
        const gitRepoPath = yield getGitRepoPath();
        const data = yield historyUtil.getFileHistoryBefore(gitRepoPath, node.logEntry.fileStats[0].path, node.logEntry.committer.date.toISOString());
        const historyItem = data.find(data => data.sha1 === node.logEntry.sha1.full);
        if (historyItem) {
            fileHistory_1.viewLog(historyItem);
        }
    }));
    vscode.commands.registerCommand('git.commit.FileEntry.ViewFileContents', (node) => __awaiter(this, void 0, void 0, function* () {
        const gitRepoPath = yield getGitRepoPath();
        const filePath = yield fileHistory_1.getFile(node.logEntry.sha1.full, gitRepoPath, node.fileStat.path);
        yield fileHistory_1.viewFile(filePath);
    }));
    vscode.commands.registerCommand('git.commit.FileEntry.CompareAgainstWorkspace', (node) => __awaiter(this, void 0, void 0, function* () {
        const gitRepoPath = yield getGitRepoPath();
        const workspaceFile = path.join(gitRepoPath, node.fileStat.path);
        const filePath = yield fileHistory_1.getFile(node.logEntry.sha1.full, gitRepoPath, node.fileStat.path);
        yield fileHistory_1.diffFiles(workspaceFile, filePath, node.logEntry.sha1.full, workspaceFile, '');
    }));
    vscode.commands.registerCommand('git.commit.FileEntry.CompareAgainstPrevious', (node) => __awaiter(this, void 0, void 0, function* () {
        const gitRepoPath = yield getGitRepoPath();
        const workspaceFile = path.join(gitRepoPath, node.fileStat.path);
        const data = yield historyUtil.getFileHistoryBefore(gitRepoPath, node.fileStat.path, node.logEntry.committer.date.toISOString());
        const filePath = yield fileHistory_1.getFile(node.logEntry.sha1.full, gitRepoPath, node.fileStat.path);
        const previousItems = data.filter(data => data.sha1 !== node.logEntry.sha1.full);
        if (previousItems.length > 0) {
            const previousFile = yield fileHistory_1.getFile(previousItems[0].sha1, gitRepoPath, node.fileStat.path);
            yield fileHistory_1.diffFiles(workspaceFile, previousFile, previousItems[0].sha1, filePath, node.logEntry.sha1.full);
        }
    }));
}
exports.activate = activate;
function showLogEntries(entries) {
    const provider = createCommitProvider();
    provider.clear();
    entries.forEach(entry => provider.addLogEntry(entry));
    provider.refresh();
}
exports.showLogEntries = showLogEntries;
function createCommitProvider() {
    if (provider) {
        return provider;
    }
    provider = new commitProvider_1.CommitProvider();
    vscode.window.registerTreeDataProvider('commitViewProvider', provider);
    return provider;
}
function showCommitInTreeView(branch, sha) {
    const provider = createCommitProvider();
    return getCommitDetails(provider, branch, sha);
}
function getCommitDetails(provider, branch, sha) {
    const gitRepoPath = getGitRepoPath();
    return gitHistory.getLogEntries(gitRepoPath, branch, 0, 1, sha)
        .then(entries => {
        entries.forEach(entry => provider.addLogEntry(entry));
        provider.refresh();
    })
        .catch(ex => {
        console.error(ex);
        return;
    });
}
//# sourceMappingURL=main.js.map