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
const md5 = require("md5");
const osLocale = require("os-locale");
const path = require("path");
const vscode_1 = require("vscode");
const types_1 = require("../adapter/parsers/types");
const types_2 = require("../application/types");
const disposableRegistry_1 = require("../application/types/disposableRegistry");
const types_3 = require("../common/types");
const constants_1 = require("../constants");
const types_4 = require("../ioc/types");
const types_5 = require("../nodes/types");
const types_6 = require("../server/types");
const types_7 = require("../types");
const registration_1 = require("./registration");
const types_8 = require("./types");
let GitHistoryCommandHandler = class GitHistoryCommandHandler {
    constructor(serviceContainer, disposableRegistry, commandManager) {
        this.serviceContainer = serviceContainer;
        this.disposableRegistry = disposableRegistry;
        this.commandManager = commandManager;
    }
    get server() {
        if (!this._server) {
            this._server = this.serviceContainer.get(types_6.IServerHost);
            this.disposableRegistry.register(this._server);
        }
        return this._server;
    }
    viewFileHistory(info) {
        return __awaiter(this, void 0, void 0, function* () {
            let fileUri;
            if (info) {
                if (info instanceof types_3.FileCommitDetails) {
                    const committedFile = info.committedFile;
                    fileUri = committedFile.uri ? vscode_1.Uri.file(committedFile.uri.fsPath) : vscode_1.Uri.file(committedFile.oldUri.fsPath);
                }
                else if (info instanceof types_5.FileNode) {
                    const committedFile = info.data.committedFile;
                    fileUri = committedFile.uri ? vscode_1.Uri.file(committedFile.uri.fsPath) : vscode_1.Uri.file(committedFile.oldUri.fsPath);
                }
                else if (info instanceof vscode_1.Uri) {
                    fileUri = info;
                    // tslint:disable-next-line:no-any
                }
                else if (info.resourceUri) {
                    // tslint:disable-next-line:no-any
                    fileUri = info.resourceUri;
                }
            }
            else {
                const activeTextEditor = vscode_1.window.activeTextEditor;
                if (!activeTextEditor || activeTextEditor.document.isUntitled) {
                    return;
                }
                fileUri = activeTextEditor.document.uri;
            }
            return this.viewHistory(fileUri);
        });
    }
    viewBranchHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.viewHistory();
        });
    }
    viewHistory(fileUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileStatParserFactory = this.serviceContainer.get(types_1.IFileStatParser);
            // tslint:disable-next-line:no-console
            console.log(fileStatParserFactory);
            const uiService = this.serviceContainer.get(types_3.IUiService);
            const workspaceFolder = yield uiService.getWorkspaceFolder();
            if (!workspaceFolder) {
                return undefined;
            }
            const branchSelection = yield uiService.getBranchSelection();
            if (branchSelection === undefined) {
                return;
            }
            const gitService = yield this.serviceContainer.get(types_7.IGitServiceFactory).createGitService(workspaceFolder);
            const branchNamePromise = yield gitService.getCurrentBranch();
            const startupInfoPromise = yield this.server.start(workspaceFolder);
            const localePromise = yield osLocale();
            const [branchName, startupInfo, locale] = yield Promise.all([branchNamePromise, startupInfoPromise, localePromise]);
            // Do not include the search string into this
            const fullId = `${startupInfo.port}:${branchSelection}:${fileUri ? fileUri.fsPath : ''}`;
            const id = md5(fullId); //Date.now().toString();
            yield this.serviceContainer.get(types_6.IWorkspaceQueryStateStore).initialize(id, workspaceFolder, branchName, branchSelection, '', fileUri);
            const queryArgs = [
                `id=${id}`, `port=${startupInfo.port}`,
                `file=${fileUri ? encodeURIComponent(fileUri.fsPath) : ''}`,
                `branchSelection=${branchSelection}`, `locale=${encodeURIComponent(locale)}`
            ];
            if (branchSelection === types_7.BranchSelection.Current) {
                queryArgs.push(`branchName=${encodeURIComponent(branchName)}`);
            }
            // const uri = `${previewUri}?_=${new Date().getTime()}&${queryArgs.join('&')}`;
            const uri = `${constants_1.previewUri}?${queryArgs.join('&')}`;
            let title = branchSelection === types_7.BranchSelection.All ? 'Git History' : `Git History (${branchName})`;
            if (fileUri) {
                title = `File History (${path.basename(fileUri.fsPath)})`;
            }
            this.commandManager.executeCommand('vscode.previewHtml', uri, vscode_1.ViewColumn.One, title);
        });
    }
};
__decorate([
    registration_1.command('git.viewFileHistory', types_8.IGitHistoryCommandHandler),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GitHistoryCommandHandler.prototype, "viewFileHistory", null);
__decorate([
    registration_1.command('git.viewHistory', types_8.IGitHistoryCommandHandler),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GitHistoryCommandHandler.prototype, "viewBranchHistory", null);
GitHistoryCommandHandler = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_4.IServiceContainer)),
    __param(1, inversify_1.inject(disposableRegistry_1.IDisposableRegistry)),
    __param(2, inversify_1.inject(types_2.ICommandManager)),
    __metadata("design:paramtypes", [Object, Object, Object])
], GitHistoryCommandHandler);
exports.GitHistoryCommandHandler = GitHistoryCommandHandler;
//# sourceMappingURL=gitHistory.js.map