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
const child_process_1 = require("child_process");
const gitPaths_1 = require("./gitPaths");
const logger = require("../logger");
function getDiff(rootDir, leftSha, rightSha) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = ['diff', '--numstat', '--summary', leftSha, rightSha];
        const gitPath = yield gitPaths_1.getGitPath();
        return new Promise((resolve, reject) => {
            const options = { cwd: rootDir };
            logger.logInfo('git ' + args.join(' '));
            let ls = child_process_1.spawn(gitPath, args, options);
            let error = '';
            let outputLines = [''];
            const entries = [];
            ls.stdout.setEncoding('utf8');
            ls.stdout.on('data', (data) => {
                data.split(/\r?\n/g).forEach((line, index, lines) => {
                    outputLines[outputLines.length - 1] += line;
                    outputLines.push('');
                });
            });
            ls.stdout.on('end', () => {
                // Process last entry as no trailing seperator
                if (outputLines.length !== 0) {
                    let entry = parser.parseLogEntry(outputLines, true);
                    if (entry !== null) {
                        entries.push(entry);
                    }
                }
            });
            ls.stderr.setEncoding('utf8');
            ls.stderr.on('data', function (data) {
                error += data;
            });
            ls.on('error', function (error) {
                logger.logError(error);
                reject(error);
                return;
            });
            ls.on('close', () => {
                if (error.length > 0) {
                    logger.logError(error);
                    reject(error);
                    return;
                }
                resolve(entries);
            });
        });
    });
}
exports.getDiff = getDiff;
//# sourceMappingURL=gitDiff.js.map