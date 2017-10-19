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
const os = require("os");
const gitPaths_1 = require("./gitPaths");
const logger = require("../logger");
const LOG_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA5';
const STATS_SEPARATOR = parser.STATS_SEPARATOR;
const LOG_FORMAT = `--format="%n${LOG_ENTRY_SEPARATOR}%nrefs=%d%ncommit=%H%ncommitAbbrev=%h%ntree=%T%ntreeAbbrev=%t%nparents=%P%nparentsAbbrev=%p%nauthor=%an <%ae> %at%ncommitter=%cn <%ce> %ct%nsubject=%s%nbody=%b%n%nnotes=%N%n${STATS_SEPARATOR}%n"`;
function getLogEntries(rootDir, branchName, pageIndex = 0, pageSize = 100, commitHash) {
    return __awaiter(this, void 0, void 0, function* () {
        // Time to clean up this mess
        let args;
        if (commitHash && commitHash.length > 0) {
            args = ['show', LOG_FORMAT, '--decorate=full', '--numstat', '--summary', commitHash];
        }
        else {
            if (branchName && branchName.length > 0) {
                args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--numstat', '--summary', '--'];
            }
            else {
                args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--all', '--numstat', '--summary', '--'];
            }
        }
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
                    if (line === LOG_ENTRY_SEPARATOR) {
                        let entry = parser.parseLogEntry(outputLines);
                        if (entry !== null) {
                            entries.push(entry);
                        }
                        outputLines = [''];
                    }
                    if (index === 0) {
                        if (data.startsWith(os.EOL)) {
                            outputLines.push(line);
                            return;
                        }
                        outputLines[outputLines.length - 1] += line;
                        if (lines.length > 1) {
                            outputLines.push('');
                        }
                        return;
                    }
                    if (index === lines.length - 1) {
                        outputLines[outputLines.length - 1] += line;
                        return;
                    }
                    outputLines[outputLines.length - 1] += line;
                    outputLines.push('');
                });
            });
            ls.stdout.on('end', () => {
                // Process last entry as no trailing seperator
                if (outputLines.length !== 0) {
                    let entry = parser.parseLogEntry(outputLines);
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
exports.getLogEntries = getLogEntries;
//# sourceMappingURL=gitHistory.js.map