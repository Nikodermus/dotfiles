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
// import { getGitRepositoryPath } from '../helpers/gitPaths';
const vscode = require("vscode");
// import { CommitProvider } from './commitProvider';
const gitHistory_1 = require("../helpers/gitHistory");
const gitDiff_1 = require("../helpers/gitDiff");
const commitCompareProvider_1 = require("./commitCompareProvider");
const fileHistory_1 = require("../commands/fileHistory");
const path = require("path");
let provider;
let getGitRepoPath;
function activate(context, gitPath) {
    vscode.commands.executeCommand('setContext', 'git.commit.compare.selectedSha', false);
    getGitRepoPath = gitPath;
    let leftSelectedNode;
    vscode.commands.registerCommand('git.commit.compare', (branch, sha) => __awaiter(this, void 0, void 0, function* () {
        const gitRepoPath = yield getGitRepoPath();
        const entries = yield gitHistory_1.getLogEntries(gitRepoPath, branch, undefined, undefined, sha);
        if (!entries || entries.length === 0) {
            return;
        }
        const logEntry = entries[0];
        const items = [
            {
                label: 'Select for compare',
                description: `${logEntry.author.email} on ${logEntry.author.localisedDate}`,
                detail: logEntry.subject
            }
        ];
        if (leftSelectedNode) {
            items.push({
                label: 'Compare with selected commit',
                description: `${logEntry.author.email} on ${logEntry.author.localisedDate}`,
                detail: logEntry.subject
            });
        }
        vscode.window.showQuickPick(items).then(selection => {
            if (!selection) {
                return;
            }
            if (selection.label === 'Select for compare') {
                leftSelectedNode = logEntry;
            }
            if (selection.label === 'Compare with selected commit') {
                return showComparisonInformation(leftSelectedNode, logEntry);
            }
            return;
        });
    }));
    vscode.commands.registerCommand('git.commit.compare.selectLeftCommit', (node) => __awaiter(this, void 0, void 0, function* () {
        leftSelectedNode = node.logEntry;
        yield vscode.commands.executeCommand('setContext', 'git.commit.compare.selectedSha', true);
    }));
    vscode.commands.registerCommand('git.commit.compare.compareAgainstSelectedCommit', (node) => __awaiter(this, void 0, void 0, function* () {
        yield showComparisonInformation(leftSelectedNode, node.logEntry);
    }));
    vscode.commands.registerCommand('git.commit.FileEntry.CompareAgainstCommit', (node) => __awaiter(this, void 0, void 0, function* () {
        const gitRepoPath = yield getGitRepoPath();
        const workspaceFile = path.join(gitRepoPath, node.fileStat.path);
        const leftFilePath = yield fileHistory_1.getFile(node.logEntry.sha1.full, gitRepoPath, node.fileStat.path);
        const rightFilePath = yield fileHistory_1.getFile(node.rightLogEntry.sha1.full, gitRepoPath, node.fileStat.path);
        yield fileHistory_1.diffFiles(workspaceFile, rightFilePath, node.rightLogEntry.sha1.full, leftFilePath, node.logEntry.sha1.full);
    }));
}
exports.activate = activate;
function createCommitCompareProvider() {
    if (provider) {
        return provider;
    }
    provider = new commitCompareProvider_1.CommitCompareProvider();
    vscode.window.registerTreeDataProvider('compareViewProvider', provider);
    return provider;
}
function showComparisonInformation(leftNode, rightNode) {
    return __awaiter(this, void 0, void 0, function* () {
        const gitRepoPath = yield getGitRepoPath();
        const diff = yield gitDiff_1.getDiff(gitRepoPath, leftNode.sha1.full, rightNode.sha1.full);
        if (diff.length === 0) {
            return;
        }
        // Dirty hack
        const clonedLeftNode = JSON.parse(JSON.stringify(leftNode));
        clonedLeftNode.fileStats = diff[0].fileStats;
        console.log(diff);
        const provider = createCommitCompareProvider();
        provider.setComparisonEntries(clonedLeftNode, rightNode);
        provider.refresh();
    });
}
//# sourceMappingURL=main.js.map