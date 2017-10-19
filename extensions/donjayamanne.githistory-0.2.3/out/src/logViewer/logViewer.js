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
const htmlGenerator = require("./htmlGenerator");
const gitHistory = require("../helpers/gitHistory");
const gitCherryPick = require("../helpers/gitCherryPick");
const path = require("path");
const gitPaths = require("../helpers/gitPaths");
const he_1 = require("he");
const historyUtil = require("../helpers/historyUtils");
const logger = require("../logger");
const fileHistory = require("../commands/fileHistory");
const gitHistorySchema = 'git-history-viewer';
const PAGE_SIZE = 50;
let previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history');
let pageIndex = 0;
let pageSize = PAGE_SIZE;
let canGoPrevious = false;
let canGoNext = true;
let gitRepoPath = vscode.workspace.rootPath;
class TextDocumentContentProvider {
    constructor(showLogEntries) {
        this.showLogEntries = showLogEntries;
        this._onDidChange = new vscode.EventEmitter();
        this.html = {};
    }
    provideTextDocumentContent(uri, token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let branchName = this.getBranchFromURI(uri);
                if (this.html.hasOwnProperty(branchName)) {
                    return this.html[branchName];
                }
                const entries = yield gitHistory.getLogEntries(gitRepoPath, branchName, pageIndex, pageSize);
                canGoPrevious = pageIndex > 0;
                canGoNext = entries.length === pageSize;
                this.entries = entries;
                this.html[branchName] = this.generateHistoryView();
                // Display ui first
                setTimeout(() => this.showLogEntries(entries), 100);
                return this.html[branchName];
            }
            catch (error) {
                return this.generateErrorView(error);
            }
        });
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        let branchName = this.getBranchFromURI(uri);
        this.clearCache(branchName);
        this._onDidChange.fire(uri);
    }
    clearCache(name) {
        if (this.html.hasOwnProperty(name)) {
            delete this.html[name];
        }
    }
    getBranchFromURI(uri) {
        if (uri.query.length > 0) {
            let re = uri.query.match(/branch=([a-z0-9_\-.]+)/i);
            return (re) ? re[1] : 'master';
        }
        else {
            return '';
        }
    }
    getStyleSheetPath(resourceName) {
        return vscode.Uri.file(path.join(__dirname, '..', '..', '..', 'resources', resourceName)).toString();
    }
    getScriptFilePath(resourceName) {
        return vscode.Uri.file(path.join(__dirname, '..', '..', 'src', 'browser', resourceName)).toString();
    }
    getNodeModulesPath(resourceName) {
        return vscode.Uri.file(path.join(__dirname, '..', '..', '..', 'node_modules', resourceName)).toString();
    }
    generateErrorView(error) {
        return `
            <head>
                <link rel="stylesheet" href="${this.getNodeModulesPath(path.join('normalize.css', 'normalize.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('octicons', 'font', 'octicons.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('animate.min.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
            </head>
            <body>
                ${htmlGenerator.generateErrorView(error)}
            </body>
        `;
    }
    generateHistoryView() {
        const innerHtml = htmlGenerator.generateHistoryHtmlView(this.entries, canGoPrevious, canGoNext);
        return `
            <head>
                <link rel="stylesheet" href="${this.getNodeModulesPath(path.join('normalize.css', 'normalize.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('octicons', 'font', 'octicons.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('animate.min.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('hint.min.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
                <script src="${this.getNodeModulesPath(path.join('jquery', 'dist', 'jquery.min.js'))}"></script>
                <script src="${this.getNodeModulesPath(path.join('clipboard', 'dist', 'clipboard.min.js'))}"></script>
                <script src="${this.getScriptFilePath('proxy.js')}"></script>
                <script src="${this.getScriptFilePath('svgGenerator.js')}"></script>
                <script src="${this.getScriptFilePath('detailsView.js')}"></script>
            </head>

            <body>
                ${innerHtml}
            </body>
        `;
    }
}
function activate(context, showLogEntries) {
    let provider = new TextDocumentContentProvider(showLogEntries);
    let registration = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, provider);
    let disposable = vscode.commands.registerCommand('git.viewHistory', (fileUri) => __awaiter(this, void 0, void 0, function* () {
        const itemPickList = [];
        itemPickList.push({ label: 'Current branch', description: '' });
        itemPickList.push({ label: 'All branches', description: '' });
        let modeChoice = yield vscode.window.showQuickPick(itemPickList, { placeHolder: 'Show history for...', matchOnDescription: true });
        let title;
        if (modeChoice === undefined) {
            return;
        }
        let fileName = '';
        let branchName = 'master';
        if (fileUri && fileUri.fsPath) {
            fileName = fileUri.fsPath;
        }
        else {
            if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
                fileName = vscode.window.activeTextEditor.document.fileName;
            }
        }
        if (fileName !== '') {
            gitRepoPath = yield gitPaths.getGitRepositoryPath(fileName);
        }
        else {
            gitRepoPath = vscode.workspace.rootPath;
        }
        branchName = yield gitPaths.getGitBranch(gitRepoPath);
        pageIndex = 0;
        canGoPrevious = false;
        canGoNext = true;
        if (modeChoice.label === 'All branches') {
            previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history');
            title = 'Git History (all branches)';
        }
        else {
            previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history?branch=' + encodeURI(branchName));
            title = 'Git History (' + branchName + ')';
        }
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.One, title).then((success) => {
            provider.update(previewUri);
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    }));
    context.subscriptions.push(disposable, registration);
    disposable = vscode.commands.registerCommand('git.cherry-pick-into', (branch, sha) => {
        gitCherryPick.CherryPick(vscode.workspace.rootPath, branch, sha).then((value) => {
            vscode.window.showInformationMessage('Cherry picked into ' + value.branch + ' (' + value.sha + ')');
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('git.logNavigate', (direction) => {
        pageIndex = pageIndex + (direction === 'next' ? 1 : -1);
        provider.update(previewUri);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('git.viewFileCommitDetails', (sha1, relativeFilePath, isoStrictDateTime) => __awaiter(this, void 0, void 0, function* () {
        try {
            relativeFilePath = he_1.decode(relativeFilePath);
            const fileName = path.join(gitRepoPath, relativeFilePath);
            const data = yield historyUtil.getFileHistoryBefore(gitRepoPath, relativeFilePath, isoStrictDateTime);
            const historyItem = data.find(data => data.sha1 === sha1);
            const previousItems = data.filter(data => data.sha1 !== sha1);
            historyItem.previousSha1 = previousItems.length === 0 ? '' : previousItems[0].sha1;
            const item = {
                label: '',
                description: '',
                data: historyItem,
                isLast: historyItem.previousSha1.length === 0
            };
            fileHistory.onItemSelected(item, fileName, relativeFilePath);
        }
        catch (error) {
            logger.logError(error);
        }
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function getGitRepoPath() {
    return gitRepoPath;
}
exports.getGitRepoPath = getGitRepoPath;
//# sourceMappingURL=logViewer.js.map