'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const contract_1 = require("./contract");
const util = require("../util");
class ContractCollection {
    constructor() {
        this.contracts = new Array();
    }
    findContract(contract, contractPath) {
        return contract.absolutePath === contractPath;
    }
    containsContract(contractPath) {
        return this.contracts.findIndex((contract) => { return contract.absolutePath === contractPath; }) > -1;
    }
    getContractsForCompilation() {
        let contractsForCompilation = {};
        this.contracts.forEach(contract => {
            contractsForCompilation[contract.absolutePath] = contract.code;
        });
        return contractsForCompilation;
    }
    addContractAndResolveImports(contractPath, code, project) {
        let contract = this.addContract(contractPath, code);
        if (contract !== null) {
            contract.resolveImports();
            contract.imports.forEach(foundImport => {
                if (fs.existsSync(foundImport)) {
                    if (!this.containsContract(foundImport)) {
                        let importContractCode = this.readContractCode(foundImport);
                        if (importContractCode != null) {
                            this.addContractAndResolveImports(foundImport, importContractCode, project);
                        }
                    }
                }
                else {
                    this.addContractAndResolveDependencyImport(foundImport, contract, project);
                }
            });
        }
        return contract;
    }
    addContract(contractPath, code) {
        if (!this.containsContract(contractPath)) {
            let contract = new contract_1.Contract(contractPath, code);
            this.contracts.push(contract);
            return contract;
        }
        return null;
    }
    formatPath(contractPath) {
        return util.formatPath(contractPath);
    }
    getAllImportFromPackages() {
        let importsFromPackages = new Array();
        this.contracts.forEach(contract => {
            let contractImports = contract.getAllImportFromPackages();
            contractImports.forEach(contractImport => {
                if (importsFromPackages.indexOf(contractImport) < 0) {
                    importsFromPackages.push(contractImport);
                }
            });
        });
        return importsFromPackages;
    }
    readContractCode(contractPath) {
        if (fs.existsSync(contractPath)) {
            return fs.readFileSync(contractPath, 'utf8');
        }
        return null;
    }
    addContractAndResolveDependencyImport(dependencyImport, contract, project) {
        let depPack = project.findPackage(dependencyImport);
        if (depPack !== undefined) {
            let depImportPath = this.formatPath(depPack.resolveImport(dependencyImport));
            if (!this.containsContract(depImportPath)) {
                let importContractCode = this.readContractCode(depImportPath);
                if (importContractCode != null) {
                    this.addContractAndResolveImports(depImportPath, importContractCode, project);
                    contract.replaceDependencyPath(dependencyImport, depImportPath);
                }
            }
            else {
                contract.replaceDependencyPath(dependencyImport, depImportPath);
            }
        }
    }
}
exports.ContractCollection = ContractCollection;
//# sourceMappingURL=contractsCollection.js.map