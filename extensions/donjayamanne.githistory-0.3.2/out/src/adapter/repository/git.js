"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const path = require("path");
const tmp = require("tmp");
const vscode_1 = require("vscode");
const cache_1 = require("../../common/cache");
const types_1 = require("../../ioc/types");
const exec_1 = require("../exec");
const types_2 = require("../parsers/types");
const constants_1 = require("./constants");
const types_3 = require("./types");
let Git = class Git {
    constructor(serviceContainer, workspaceRoot, gitCmdExecutor, logParser, gitArgsService) {
        this.serviceContainer = serviceContainer;
        this.workspaceRoot = workspaceRoot;
        this.gitCmdExecutor = gitCmdExecutor;
        this.logParser = logParser;
        this.gitArgsService = gitArgsService;
    }
    getGitRoot() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gitRootPath) {
                return this.gitRootPath;
            }
            const gitRootPath = yield this.gitCmdExecutor.exec(this.workspaceRoot, ...this.gitArgsService.getGitRootArgs());
            return this.gitRootPath = gitRootPath.split(/\r?\n/g)[0].trim();
        });
    }
    getGitRelativePath(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!path.isAbsolute(file.fsPath)) {
                return file.fsPath;
            }
            const gitRoot = yield this.getGitRoot();
            return path.relative(gitRoot, file.fsPath).replace(/\\/g, '/');
        });
    }
    // @cache('IGitService')
    getHeadHashes() {
        return __awaiter(this, void 0, void 0, function* () {
            const fullHashArgs = ['show-ref'];
            const fullHashRefsOutput = yield this.exec(...fullHashArgs);
            return fullHashRefsOutput.split(/\r?\n/g)
                .filter(line => line.length > 0)
                .filter(line => line.indexOf('refs/heads/') > 0 || line.indexOf('refs/remotes/') > 0)
                .map(line => line.trim().split(' '))
                .filter(lineParts => lineParts.length > 1)
                .map(hashAndRef => { return { ref: hashAndRef[1], hash: hashAndRef[0] }; });
        });
    }
    // tslint:disable-next-line:no-suspicious-comment
    // TODO: We need a way of clearing this cache, if a new branch is created.
    getBranches() {
        return __awaiter(this, void 0, void 0, function* () {
            const output = yield this.exec('branch');
            return output.split(/\r?\n/g)
                .filter(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => {
                const isCurrent = line.startsWith('*');
                const name = isCurrent ? line.substring(1).trim() : line;
                return {
                    name,
                    current: isCurrent
                };
            });
        });
    }
    // tslint:disable-next-line:no-suspicious-comment
    // TODO: We need a way of clearing this cache, if a new branch is created.
    getCurrentBranch() {
        return __awaiter(this, void 0, void 0, function* () {
            const args = this.gitArgsService.getCurrentBranchArgs();
            const branch = yield this.exec(...args);
            return branch.split(/\r?\n/g)[0].trim();
        });
    }
    getObjectHash(object) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the hash of the given ref
            // E.g. git show --format=%H --shortstat remotes/origin/tyriar/xterm-v3
            const args = this.gitArgsService.getObjectHashArgs(object);
            const output = yield this.exec(...args);
            return output.split(/\r?\n/g)[0].trim();
        });
    }
    getRefsContainingCommit(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = this.gitArgsService.getRefsContainingCommitArgs(hash);
            const entries = yield this.exec(...args);
            return entries.split(/\r?\n/g)
                .map(line => line.trim())
                .map(line => line.startsWith('*') ? line.substring(1) : line)
                .map(ref => ref.indexOf(' ') ? ref.split(' ')[0].trim() : ref);
        });
    }
    getLogEntries(pageIndex = 0, pageSize = 0, branch = '', searchText = '', file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (pageSize <= 0) {
                pageSize = vscode_1.workspace.getConfiguration('gitHistory').get('pageSize', 100);
            }
            const relativePath = file ? yield this.getGitRelativePath(file) : undefined;
            const args = yield this.gitArgsService.getLogArgs(pageIndex, pageSize, branch, searchText, relativePath);
            const gitRootPathPromise = this.getGitRoot();
            const outputPromise = this.exec(...args.logArgs);
            // Since we're using find and wc (shell commands, we need to execute the command in a shell)
            const countOutputPromise = this.execInShell(...args.counterArgs);
            const values = yield Promise.all([gitRootPathPromise, outputPromise, countOutputPromise]);
            const gitRepoPath = values[0];
            const output = values[1];
            const countOutput = values[2];
            const count = parseInt(countOutput.trim(), 10);
            // Run another git history, but get file stats instead of the changes
            // const outputWithFileModeChanges = await this.exec(args.fileStatArgs);
            // const entriesWithFileModeChanges = outputWithFileModeChanges.split(LOG_ENTRY_SEPARATOR);
            const items = output
                .split(constants_1.LOG_ENTRY_SEPARATOR)
                .map(entry => {
                if (entry.length === 0) {
                    return;
                }
                return this.logParser.parse(gitRepoPath, entry, constants_1.ITEM_ENTRY_SEPARATOR, constants_1.LOG_FORMAT_ARGS);
            })
                .filter(logEntry => logEntry !== undefined)
                .map(logEntry => logEntry);
            const headHashes = yield this.getHeadHashes();
            const headHashesOnly = headHashes.map(item => item.hash);
            // tslint:disable-next-line:prefer-type-cast
            const headHashMap = new Map(headHashes.map(item => [item.ref, item.hash]));
            items.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                // Check if this the very last commit of a branch
                // Just check if this is a head commit (if shows up in 'git show-ref')
                item.isLastCommit = headHashesOnly.indexOf(item.hash.full) >= 0;
                // Check if this commit has been merged into another branch
                // Do this only if this is a head commit (we don't care otherwise, only the graph needs it)
                if (!item.isLastCommit) {
                    return;
                }
                const refsContainingThisCommit = yield this.getRefsContainingCommit(item.hash.full);
                const hashesOfRefs = refsContainingThisCommit
                    .filter(ref => headHashMap.has(ref))
                    .map(ref => headHashMap.get(ref))
                    .filter(hash => hash !== item.hash.full);
                // If we have hashes other than current, then yes it has been merged
                item.isThisLastCommitMerged = hashesOfRefs.length > 0;
            }));
            return {
                items,
                count,
                branch,
                file,
                pageIndex,
                pageSize,
                searchText
            };
        });
    }
    getHash(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashes = yield this.exec('show', '--format=%H-%h', '--no-patch', hash);
            const parts = hashes.split(/\r?\n/g).filter(item => item.length > 0)[0].split('-');
            return {
                full: parts[0],
                short: parts[1]
            };
        });
    }
    getCommitDate(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = this.gitArgsService.getCommitDateArgs(hash);
            const output = yield this.exec(...args);
            const lines = output.split(/\r?\n/g).map(line => line.trim()).filter(line => line.length > 0);
            if (lines.length === 0) {
                return;
            }
            const unixTime = parseInt(lines[0], 10);
            if (isNaN(unixTime) || unixTime <= 0) {
                return;
            }
            return new Date(unixTime * 1000);
        });
    }
    getCommit(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const parentHashesArgs = this.gitArgsService.getCommitParentHashesArgs(hash);
            const parentHashes = yield this.exec(...parentHashesArgs);
            const singleParent = parentHashes.trim().split(' ').filter(item => item.trim().length > 0).length === 1;
            const commitArgs = this.gitArgsService.getCommitArgs(hash);
            const numStartArgs = singleParent ? this.gitArgsService.getCommitWithNumStatArgs(hash) : this.gitArgsService.getCommitWithNumStatArgsForMerge(hash);
            const nameStatusArgs = singleParent ? this.gitArgsService.getCommitNameStatusArgs(hash) : this.gitArgsService.getCommitNameStatusArgsForMerge(hash);
            const gitRootPathPromise = yield this.getGitRoot();
            const commitOutputPromise = yield this.exec(...commitArgs);
            const filesWithNumStatPromise = yield this.execInShell(...numStartArgs);
            const filesWithNameStatusPromise = yield this.execInShell(...nameStatusArgs);
            const values = yield Promise.all([gitRootPathPromise, commitOutputPromise, filesWithNumStatPromise, filesWithNameStatusPromise]);
            const gitRootPath = values[0];
            const commitOutput = values[1];
            const filesWithNumStat = values[2];
            const filesWithNameStatus = values[3];
            const entries = commitOutput
                .split(constants_1.LOG_ENTRY_SEPARATOR)
                .map(entry => {
                if (entry.trim().length === 0) {
                    return undefined;
                }
                return this.logParser.parse(gitRootPath, entry, constants_1.ITEM_ENTRY_SEPARATOR, constants_1.LOG_FORMAT_ARGS, filesWithNumStat, filesWithNameStatus);
            })
                .filter(entry => entry !== undefined)
                .map(entry => entry);
            return entries.length > 0 ? entries[0] : undefined;
        });
    }
    getCommitFile(hash, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const gitRootPath = yield this.getGitRoot();
            const filePath = typeof file === 'string' ? file : file.fsPath.toString();
            const relativeFilePath = path.relative(gitRootPath, filePath);
            return new Promise((resolve, reject) => {
                tmp.file({ postfix: path.extname(filePath) }, (err, tmpPath) => {
                    if (err) {
                        return reject(err);
                    }
                    this.execInShell('show', `${hash}:${relativeFilePath}`, '>', tmpPath)
                        .then(() => resolve(vscode_1.Uri.file(tmpPath)))
                        .catch(reject);
                });
            });
        });
    }
    getCommitFileContent(hash, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const gitRootPath = yield this.getGitRoot();
            const filePath = typeof file === 'string' ? file : file.fsPath.toString();
            const relativeFilePath = path.relative(gitRootPath, filePath);
            return yield this.execInShell('show', `${hash}:${relativeFilePath}`);
        });
    }
    getDifferences(hash1, hash2) {
        return __awaiter(this, void 0, void 0, function* () {
            const numStartArgs = this.gitArgsService.getDiffCommitWithNumStatArgs(hash1, hash2);
            const nameStatusArgs = this.gitArgsService.getDiffCommitNameStatusArgs(hash1, hash2);
            const gitRootPathPromise = this.getGitRoot();
            const filesWithNumStatPromise = this.execInShell(...numStartArgs);
            const filesWithNameStatusPromise = this.execInShell(...nameStatusArgs);
            const values = yield Promise.all([gitRootPathPromise, filesWithNumStatPromise, filesWithNameStatusPromise]);
            const gitRootPath = values[0];
            const filesWithNumStat = values[1];
            const filesWithNameStatus = values[2];
            const fileStatParser = this.serviceContainer.get(types_2.IFileStatParser);
            return fileStatParser.parse(gitRootPath, filesWithNumStat.split(/\r?\n/g), filesWithNameStatus.split(/\r?\n/g));
        });
    }
    getPreviousCommitHashForFile(hash, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const gitRootPath = yield this.getGitRoot();
            const relativeFilePath = path.relative(gitRootPath, file.fsPath);
            const args = this.gitArgsService.getPreviousCommitHashForFileArgs(hash, relativeFilePath);
            const output = yield this.exec(...args);
            const hashes = output.split(/\r?\n/g).filter(item => item.length > 0)[0].split('-');
            return {
                short: hashes[1],
                full: hashes[0]
            };
        });
    }
    cherryPick(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.exec('cherry-pick', hash);
        });
    }
    createBranch(branchName, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.exec('checkout', '-b', branchName, hash);
        });
    }
    exec(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const gitRootPath = yield this.getGitRoot();
            return yield this.gitCmdExecutor.exec(gitRootPath, ...args);
        });
    }
    execInShell(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const gitRootPath = yield this.getGitRoot();
            return yield this.gitCmdExecutor.exec({ cwd: gitRootPath, shell: true }, ...args);
        });
    }
};
__decorate([
    cache_1.cache('IGitService'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Git.prototype, "getGitRoot", null);
__decorate([
    cache_1.cache('IGitService'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Git.prototype, "getBranches", null);
__decorate([
    cache_1.cache('IGitService'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Git.prototype, "getCurrentBranch", null);
__decorate([
    cache_1.cache('IGitService'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], Git.prototype, "getObjectHash", null);
__decorate([
    cache_1.cache('IGitService'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], Git.prototype, "getHash", null);
__decorate([
    cache_1.cache('IGitService'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], Git.prototype, "getCommitDate", null);
__decorate([
    cache_1.cache('IGitService'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], Git.prototype, "getCommit", null);
__decorate([
    cache_1.cache('IGitService'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], Git.prototype, "getCommitFile", null);
__decorate([
    cache_1.cache('IGitService'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], Git.prototype, "getDifferences", null);
__decorate([
    cache_1.cache('IGitService'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vscode_1.Uri]),
    __metadata("design:returntype", Promise)
], Git.prototype, "getPreviousCommitHashForFile", null);
Git = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.IServiceContainer)),
    __param(2, inversify_1.inject(exec_1.IGitCommandExecutor)),
    __param(3, inversify_1.inject(types_2.ILogParser)),
    __param(4, inversify_1.inject(types_3.IGitArgsService)),
    __metadata("design:paramtypes", [Object, String, Object, Object, Object])
], Git);
exports.Git = Git;
//# sourceMappingURL=git.js.map