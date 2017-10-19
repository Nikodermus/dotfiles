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
const child_process_1 = require("child_process");
const fs = require("fs");
const path = require("path");
const logger = require("../logger");
let gitPath;
function getGitPath() {
    return __awaiter(this, void 0, void 0, function* () {
        if (gitPath !== undefined) {
            return Promise.resolve(gitPath);
        }
        return new Promise((resolve, reject) => {
            const gitPathConfig = vscode.workspace.getConfiguration('git').get('path');
            if (typeof gitPathConfig === 'string' && gitPathConfig.length > 0) {
                if (fs.existsSync(gitPathConfig)) {
                    logger.logInfo(`git path: ${gitPathConfig} - from vscode settings`);
                    gitPath = gitPathConfig;
                    resolve(gitPathConfig);
                    return;
                }
                else {
                    logger.logError(`git path: ${gitPathConfig} - from vscode settings in invalid`);
                }
            }
            if (process.platform !== 'win32') {
                logger.logInfo(`git path: using PATH environment variable`);
                gitPath = 'git';
                resolve('git');
                return;
            }
            else {
                // in Git for Windows, the recommendation is not to put git into the PATH.
                // Instead, there is an entry in the Registry.
                let regQueryInstallPath = (location, view) => {
                    return new Promise((resolve, reject) => {
                        let callback = function (error, stdout, stderr) {
                            if (error && error.code !== 0) {
                                error.stdout = stdout.toString();
                                error.stderr = stderr.toString();
                                reject(error);
                                return;
                            }
                            let installPath = stdout.toString().match(/InstallPath\s+REG_SZ\s+([^\r\n]+)\s*\r?\n/i)[1];
                            if (installPath) {
                                resolve(installPath + '\\bin\\git');
                            }
                            else {
                                reject();
                            }
                        };
                        let viewArg = '';
                        switch (view) {
                            case '64':
                                viewArg = '/reg:64';
                                break;
                            case '32':
                                viewArg = '/reg:64';
                                break;
                            default: break;
                        }
                        child_process_1.exec('reg query ' + location + ' ' + viewArg, callback);
                    });
                };
                let queryChained = (locations) => {
                    return new Promise((resolve, reject) => {
                        if (locations.length === 0) {
                            reject('None of the known git Registry keys were found');
                            return;
                        }
                        let location = locations[0];
                        regQueryInstallPath(location.key, location.view).then((location) => resolve(location), (error) => queryChained(locations.slice(1)).then((location) => resolve(location), (error) => reject(error)));
                    });
                };
                queryChained([
                    { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': null },
                    { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': null },
                    { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': '64' },
                    { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': '64' },
                    { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': '32' },
                    { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': '32' }
                ]).
                    then((path) => {
                    logger.logInfo(`git path: ${path} - from registry`);
                    gitPath = path;
                    resolve(path);
                }, (error) => {
                    logger.logInfo(`git path: falling back to PATH environment variable`);
                    gitPath = 'git';
                    resolve('git');
                });
            }
        });
    });
}
exports.getGitPath = getGitPath;
function getGitRepositoryPath(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const gitPath = yield getGitPath();
        return new Promise((resolve, reject) => {
            const directory = fs.existsSync(fileName) && fs.statSync(fileName).isDirectory() ? fileName : path.dirname(fileName);
            const options = { cwd: directory };
            const args = ['rev-parse', '--show-toplevel'];
            logger.logInfo('git ' + args.join(' '));
            let ls = child_process_1.spawn(gitPath, args, options);
            let repoPath = '';
            let error = '';
            ls.stdout.on('data', function (data) {
                repoPath += data + '\n';
            });
            ls.stderr.on('data', function (data) {
                error += data;
            });
            ls.on('error', function (error) {
                logger.logError(error);
                reject(error);
                return;
            });
            ls.on('close', function () {
                if (error.length > 0) {
                    logger.logError(error);
                    reject(error);
                    return;
                }
                let repositoryPath = repoPath.trim();
                if (!path.isAbsolute(repositoryPath)) {
                    repositoryPath = path.join(path.dirname(fileName), repositoryPath);
                }
                logger.logInfo('git repo path: ' + repositoryPath);
                resolve(repositoryPath);
            });
        });
    });
}
exports.getGitRepositoryPath = getGitRepositoryPath;
function getGitBranch(repoPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const gitPath = yield getGitPath();
        return new Promise((resolve, reject) => {
            const options = { cwd: repoPath };
            const args = ['rev-parse', '--abbrev-ref', 'HEAD'];
            let branch = '';
            let error = '';
            let ls = child_process_1.spawn(gitPath, args, options);
            ls.stdout.on('data', function (data) {
                branch += data.slice(0, -1);
            });
            ls.stderr.on('data', function (data) {
                error += data;
            });
            ls.on('error', function (error) {
                logger.logError(error);
                reject(error);
                return;
            });
            ls.on('close', function () {
                resolve(branch);
            });
        });
    });
}
exports.getGitBranch = getGitBranch;
//# sourceMappingURL=gitPaths.js.map