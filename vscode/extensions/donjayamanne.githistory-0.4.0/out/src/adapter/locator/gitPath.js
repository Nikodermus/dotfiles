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
const child_process_1 = require("child_process");
const fs = require("fs");
const inversify_1 = require("inversify");
const vscode = require("vscode");
const types_1 = require("../../common/types");
const types_2 = require("../../platform/types");
let GitExecutableLocator = class GitExecutableLocator {
    constructor(loggers, platformService) {
        this.loggers = loggers;
        this.platformService = platformService;
    }
    getGitPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof this.gitPath === 'string') {
                return this.gitPath;
            }
            // tslint:disable-next-line:no-backbone-get-set-outside-model
            this.gitPath = vscode.workspace.getConfiguration('git').get('path');
            if (typeof this.gitPath === 'string' && this.gitPath.length > 0) {
                if (fs.existsSync(this.gitPath)) {
                    this.loggers.forEach(logger => logger.trace(`git path: ${this.gitPath} - from vscode settings`));
                    return this.gitPath;
                }
                else {
                    this.loggers.forEach(logger => logger.error(`git path: ${this.gitPath} - from vscode settings in invalid`));
                }
            }
            if (!this.platformService.isWindows) {
                this.loggers.forEach(logger => logger.trace('git path: using PATH environment variable'));
                return this.gitPath = 'git';
            }
            this.gitPath = yield getGitPathOnWindows(this.loggers);
            this.loggers.forEach(logger => logger.log('git path identified as: ', this.gitPath));
            return this.gitPath;
        });
    }
};
GitExecutableLocator = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.multiInject(types_1.ILogService)),
    __param(1, inversify_1.inject(types_2.IPlatformService)),
    __metadata("design:paramtypes", [Array, Object])
], GitExecutableLocator);
exports.GitExecutableLocator = GitExecutableLocator;
function regQueryInstallPath(location, view) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            function callback(error, stdout, stderr) {
                if (error && error.code !== 0) {
                    error.stdout = stdout.toString();
                    error.stderr = stderr.toString();
                    reject(error);
                }
                else {
                    const match = stdout.toString().match(/InstallPath\s+REG_SZ\s+([^\r\n]+)\s*\r?\n/i);
                    if (match && match[1]) {
                        resolve(`${match[1]}\\bin\\git`);
                    }
                    else {
                        reject();
                    }
                }
            }
            let viewArg = '';
            switch (view) {
                case '64':
                    viewArg = '/reg:64';
                    break;
                case '32':
                    viewArg = '/reg:64';
                    break;
                default:
            }
            child_process_1.exec(`reg query ${location} ${viewArg}`, callback);
        });
    });
}
const GitLookupRegistryKeys = [
    { key: 'HKCU\\SOFTWARE\\GitForWindows', view: null },
    { key: 'HKLM\\SOFTWARE\\GitForWindows', view: null },
    { key: 'HKCU\\SOFTWARE\\GitForWindows', view: '64' },
    { key: 'HKLM\\SOFTWARE\\GitForWindows', view: '64' },
    { key: 'HKCU\\SOFTWARE\\GitForWindows', view: '32' },
    { key: 'HKLM\\SOFTWARE\\GitForWindows', view: '32' } // for a 32bit git installation on 64bit Windows
];
function queryChained(locations) {
    return __awaiter(this, void 0, void 0, function* () {
        if (locations.length === 0) {
            return Promise.reject('None of the known git Registry keys were found');
        }
        const location = locations[0];
        return regQueryInstallPath(location.key, location.view)
            .catch(() => __awaiter(this, void 0, void 0, function* () { return queryChained(locations.slice(1)); }));
    });
}
function getGitPathOnWindows(loggers) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // return 'git';
            const gitRegPath = yield queryChained(GitLookupRegistryKeys); // for a 32bit git installation on 64bit Windows
            loggers.forEach(logger => logger.trace(`git path: ${gitRegPath} - from registry`));
            return gitRegPath;
        }
        catch (ex) {
            loggers.forEach(logger => logger.trace('git path: falling back to PATH environment variable'));
            return 'git';
        }
    });
}
//# sourceMappingURL=gitPath.js.map