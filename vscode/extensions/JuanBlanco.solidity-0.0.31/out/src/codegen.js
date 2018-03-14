'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const abicodegen = require("abi-code-gen");
function codeGenerate(args, diagnostics) {
    try {
        let editor = vscode.window.activeTextEditor;
        abicodegen.generateCode(editor.document.fileName, 'cs-service');
    }
    catch (e) {
        let outputChannel = vscode.window.createOutputChannel('solidity code generation');
        outputChannel.clear();
        outputChannel.appendLine('Error generating code:');
        outputChannel.appendLine(e.message);
        outputChannel.show();
    }
}
exports.codeGenerate = codeGenerate;
//# sourceMappingURL=codegen.js.map