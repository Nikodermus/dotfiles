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
const vscode_1 = require("vscode");
const child_process_1 = require("child_process");
const gitPaths_1 = require("./gitPaths");
const logger = require("../logger");
function CherryPick(rootDir, branch, sha) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['cherry-pick', sha];
        // This is how you can view the log across all branches
        const gitPath = yield gitPaths_1.getGitPath();
        let newBranch = yield gitPaths_1.getGitBranch(rootDir);
        const yesNo = yield vscode_1.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Cherry pick ' + sha.substr(0, 7) + ' into ' + newBranch + '?' });
        return new Promise((resolve, reject) => {
            const options = { cwd: rootDir };
            if (yesNo === undefined || yesNo === 'No') {
                return;
            }
            if (newBranch === branch) {
                reject('Cannot cherry-pick into same branch (' + newBranch + '). Please checkout a different branch first');
                return;
            }
            let error = '';
            let entry = {};
            logger.logInfo('git ' + args.join(' '));
            let ls = child_process_1.spawn(gitPath, args, options);
            ls.stdout.setEncoding('utf8');
            ls.stdout.on('data', (data) => {
                let m = data.match(/\[(\w+) ([0-9a-z]{7})\]/);
                if (m) {
                    entry.branch = m[1];
                    entry.sha = m[2];
                }
            });
            ls.stderr.setEncoding('utf8');
            ls.stderr.on('data', (data) => {
                error = data;
            });
            ls.on('error', function (error) {
                logger.logError(error);
                reject(error);
                return;
            });
            ls.on('close', () => {
                if (error.length > 0 || entry.branch.length <= 0) {
                    CherryPickAbort(rootDir);
                    reject(error);
                    return;
                }
                resolve(entry);
            });
        });
    });
}
exports.CherryPick = CherryPick;
function CherryPickAbort(rootDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['cherry-pick', '--abort'];
        // This is how you can view the log across all branches
        const gitPath = yield gitPaths_1.getGitPath();
        return new Promise((resolve, reject) => {
            const options = { cwd: rootDir };
            logger.logInfo('git ' + args.join(' '));
            let ls = child_process_1.spawn(gitPath, args, options);
            ls.on('error', function (error) {
                logger.logError(error);
                reject(error);
                return;
            });
            ls.on('close', () => {
                resolve();
            });
        });
    });
}
exports.CherryPickAbort = CherryPickAbort;
//# sourceMappingURL=gitCherryPick.js.map