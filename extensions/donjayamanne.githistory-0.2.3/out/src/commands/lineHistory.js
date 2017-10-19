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
const historyUtil = require("../helpers/historyUtils");
const gitPaths = require("../helpers/gitPaths");
const path = require("path");
const logger = require("../logger");
function activate(context) {
    let disposable = vscode.commands.registerTextEditorCommand('git.viewLineHistory', () => {
        run();
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document) {
                return;
            }
            if (!vscode.window.activeTextEditor.selection) {
                return;
            }
            const gitRepositoryPath = yield gitPaths.getGitRepositoryPath(vscode.window.activeTextEditor.document.fileName);
            const relativeFilePath = path.relative(gitRepositoryPath, vscode.window.activeTextEditor.document.fileName);
            const currentLineNumber = vscode.window.activeTextEditor.selection.start.line + 1;
            const log = yield historyUtil.getLineHistory(gitRepositoryPath, relativeFilePath, currentLineNumber);
            if (log.length === 0) {
                vscode.window.showInformationMessage('There are no history items for this item "`${relativeFilePath}`".');
                return;
            }
            let itemPickList = log.map(item => {
                let dateTime = new Date(Date.parse(item.author_date)).toLocaleString();
                let label = `${item.author_name} <${item.author_email}> on ${dateTime}`;
                let description = item.message;
                return { label: label, description: description, data: item };
            });
            vscode.window.showQuickPick(itemPickList, { placeHolder: 'Select an item to view the change log', matchOnDescription: true }).then(item => {
                if (!item) {
                    return;
                }
                onItemSelected(item);
            });
        }
        catch (error) {
            logger.logError(error);
        }
    });
}
exports.run = run;
function onItemSelected(item) {
    viewLog(item.data);
}
function viewLog(details) {
    let authorDate = new Date(Date.parse(details.author_date)).toLocaleString();
    let committerDate = new Date(Date.parse(details.commit_date)).toLocaleString();
    let log = `sha1 : ${details.sha1}\n` +
        `Author : ${details.author_name} <${details.author_email}>\n` +
        `Author Date : ${authorDate}\n` +
        `Committer Name : ${details.committer_name} <${details.committer_email}>\n` +
        `Commit Date : ${committerDate}\n` +
        `Message : ${details.message}`;
    logger.showInfo(log);
}
//# sourceMappingURL=lineHistory.js.map