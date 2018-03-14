'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const compiler_1 = require("./compiler");
const contractsCollection_1 = require("./model/contractsCollection");
const projService = require("./projectService");
const util = require("./util");
let diagnosticCollection;
function initDiagnosticCollection(diagnostics) {
    diagnosticCollection = diagnostics;
}
exports.initDiagnosticCollection = initDiagnosticCollection;
function compileActiveContract() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return; // We need something open
    }
    if (path.extname(editor.document.fileName) !== '.sol') {
        vscode.window.showWarningMessage('This not a solidity file (*.sol)');
        return;
    }
    // Check if is folder, if not stop we need to output to a bin folder on rootPath
    if (vscode.workspace.rootPath === undefined) {
        vscode.window.showWarningMessage('Please open a folder in Visual Studio Code as a workspace');
        return;
    }
    let contractsCollection = new contractsCollection_1.ContractCollection();
    let contractCode = editor.document.getText();
    let contractPath = editor.document.fileName;
    let project = projService.initialiseProject(vscode.workspace.rootPath);
    let contract = contractsCollection.addContractAndResolveImports(contractPath, contractCode, project);
    let packagesPath = util.formatPath(project.packagesDir);
    compiler_1.compile(contractsCollection.getContractsForCompilation(), diagnosticCollection, project.projectPackage.build_dir, project.projectPackage.absoluletPath, null, packagesPath, contract.absolutePath);
}
exports.compileActiveContract = compileActiveContract;
//# sourceMappingURL=compileActive.js.map