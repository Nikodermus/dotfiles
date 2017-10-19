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
const parser = require("./logParser");
const fs = require("fs");
const child_process_1 = require("child_process");
const gitPaths = require("./gitPaths");
const logger = require("../logger");
function getFileHistory(rootDir, relativeFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield getLog(rootDir, ['--no-abbrev-commit', '--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--parents', '--numstat', '--topo-order', '--raw', '--follow', '--', relativeFilePath]);
    });
}
exports.getFileHistory = getFileHistory;
function getFileHistoryBefore(rootDir, relativeFilePath, isoStrictDateTime) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield getLog(rootDir, ['--no-abbrev-commit', `--max-count=10`, '--decorate=full', '--date=default', '--pretty=fuller', '--all', '--parents', '--numstat', '--topo-order', '--raw', '--follow', `--before='${isoStrictDateTime}'`, '--', relativeFilePath]);
    });
}
exports.getFileHistoryBefore = getFileHistoryBefore;
function getLineHistory(rootDir, relativeFilePath, lineNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        let lineArgs = '-L' + lineNumber + ',' + lineNumber + ':' + relativeFilePath.replace(/\\/g, '/');
        return yield getLog(rootDir, [lineArgs, '--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--numstat', '--topo-order', '--raw']);
    });
}
exports.getLineHistory = getLineHistory;
function getLog(rootDir, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const gitPath = yield gitPaths.getGitPath();
        return new Promise((resolve, reject) => {
            let options = { cwd: rootDir };
            args.unshift('log');
            logger.logInfo('git ' + args.join(' '));
            let ls = child_process_1.spawn(gitPath, args, options);
            let log = '';
            let error = '';
            ls.stdout.on('data', function (data) {
                log += data + '\n';
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
                let parsedLog = parser.parseLogContents(log);
                resolve(parsedLog);
            });
        });
    });
}
function writeFile(rootDir, commitSha1, sourceFilePath, targetFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const gitPath = yield gitPaths.getGitPath();
        return new Promise((resolve, reject) => {
            const options = { cwd: rootDir };
            const objectId = `${commitSha1}:` + sourceFilePath.replace(/\\/g, '/');
            const args = ['show', objectId];
            logger.logInfo('git ' + args.join(' '));
            let ls = child_process_1.spawn(gitPath, args, options);
            let error = '';
            ls.stdout.on('data', function (data) {
                fs.appendFileSync(targetFile, data);
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
                    if (error.includes('does not exist')) {
                        resolve('fileUnavailable');
                        return;
                    }
                    else {
                        logger.logError(error);
                        reject(error);
                    }
                    return;
                }
                resolve(targetFile);
            });
        });
    });
}
exports.writeFile = writeFile;
//# sourceMappingURL=historyUtils.js.map