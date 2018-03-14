"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const projectService = require("./projectService");
const solidityErrorsConvertor = require("./solErrorsToDiagnostics");
const solc = require("solc");
const fs = require("fs");
const path = require("path");
const contractsCollection_1 = require("./model/contractsCollection");
var compilerType;
(function (compilerType) {
    compilerType[compilerType["localNode"] = 0] = "localNode";
    compilerType[compilerType["Remote"] = 1] = "Remote";
    compilerType[compilerType["localFile"] = 2] = "localFile";
    compilerType[compilerType["default"] = 3] = "default";
})(compilerType = exports.compilerType || (exports.compilerType = {}));
class SolcCompiler {
    getVersion() {
        return this.localSolc.version();
    }
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.localSolc = null;
        this.currentCompilerType = compilerType.default;
    }
    isRootPathSet() {
        return typeof this.rootPath !== 'undefined' && this.rootPath !== null;
    }
    // simple validation to match our settings with the ones passed
    initialisedAlready(localInstallationPath, remoteInstallationVersion) {
        // tslint:disable-next-line:curly
        if (this.localSolc === null)
            return false;
        let installedNodeLocally = false;
        if (this.isRootPathSet()) {
            installedNodeLocally = this.isInstalledSolcUsingNode(this.rootPath);
            if (this.currentCompilerType === compilerType.localNode && installedNodeLocally) {
                return true;
            }
        }
        if (this.currentCompilerType === compilerType.localFile && localInstallationPath === this.currentCompilerSetting) {
            return true;
        }
        if (this.currentCompilerType === compilerType.Remote && localInstallationPath === this.currentCompilerSetting) {
            return true;
        }
        if (this.currentCompilerType === compilerType.default && !installedNodeLocally &&
            (typeof localInstallationPath === 'undefined' || localInstallationPath === null) &&
            (typeof remoteInstallationVersion === 'undefined' || remoteInstallationVersion === null)) {
            return true;
        }
        return false;
    }
    intialiseCompiler(localInstallationPath, remoteInstallationVersion) {
        return new Promise((resolve, reject) => {
            try {
                if (this.initialisedAlready(localInstallationPath, remoteInstallationVersion)) {
                    resolve();
                }
                let solidityfile = '';
                if (this.isInstalledSolcUsingNode(this.rootPath)) {
                    solidityfile = require(this.getLocalSolcNodeInstallation());
                    this.localSolc = solc.setupMethods(solidityfile);
                    this.currentCompilerType = compilerType.localNode;
                    this.currentCompilerSetting = null;
                    resolve();
                }
                else {
                    // local file
                    if (typeof localInstallationPath !== 'undefined' && localInstallationPath !== null) {
                        solidityfile = require(localInstallationPath);
                        this.localSolc = solc.setupMethods(solidityfile);
                        this.currentCompilerType = compilerType.localFile;
                        this.currentCompilerSetting = localInstallationPath;
                        resolve();
                    }
                    else {
                        // remote
                        if (typeof remoteInstallationVersion !== 'undefined' && remoteInstallationVersion !== null) {
                            let solcService = this;
                            solc.loadRemoteVersion(remoteInstallationVersion, function (err, solcSnapshot) {
                                if (err) {
                                    reject('There was an error loading the remote version: ' + remoteInstallationVersion);
                                }
                                else {
                                    solcService.currentCompilerType = compilerType.Remote;
                                    solcService.currentCompilerSetting = remoteInstallationVersion;
                                    solcService.localSolc = solcSnapshot;
                                    resolve();
                                }
                            });
                            // default
                        }
                        else {
                            this.localSolc = require('solc');
                            this.currentCompilerType = compilerType.default;
                            this.currentCompilerSetting = null;
                            resolve();
                        }
                    }
                }
            }
            catch (error) {
                reject(error);
            }
        });
    }
    getLocalSolcNodeInstallation() {
        return path.join(this.rootPath, 'node_modules', 'solc', 'soljson.js');
    }
    isInstalledSolcUsingNode(rootPath) {
        return fs.existsSync(this.getLocalSolcNodeInstallation());
    }
    compile(contracts) {
        return this.localSolc.compile(contracts, 1);
    }
    loadRemoteVersion(remoteCompiler, cb) {
        solc.loadRemoteVersion(remoteCompiler, cb);
    }
    compileSolidityDocumentAndGetDiagnosticErrors(filePath, documentText) {
        if (this.isRootPathSet()) {
            const contracts = new contractsCollection_1.ContractCollection();
            contracts.addContractAndResolveImports(filePath, documentText, projectService.initialiseProject(this.rootPath));
            const output = this.compile({ sources: contracts.getContractsForCompilation() });
            if (output.errors) {
                return output
                    .errors
                    .map(error => solidityErrorsConvertor.errorToDiagnostic(error).diagnostic);
            }
        }
        else {
            let contract = {};
            contract[filePath] = documentText;
            const output = this.compile({ sources: contract });
            if (output.errors) {
                return output.errors.map((error) => solidityErrorsConvertor.errorToDiagnostic(error).diagnostic);
            }
        }
        return [];
    }
}
exports.SolcCompiler = SolcCompiler;
//# sourceMappingURL=solcCompiler.js.map