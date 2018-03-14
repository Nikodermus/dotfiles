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
const path = require("path");
const child_process_1 = require("child_process");
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const url = require("url");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let client;
        const serverOptions = () => __awaiter(this, void 0, void 0, function* () {
            const childProcess = child_process_1.spawn(process.execPath, [path.resolve(__dirname, '..', 'node_modules', 'javascript-typescript-langserver', 'lib', 'language-server-stdio.js')]);
            childProcess.stderr.on('data', (chunk) => {
                client.error(chunk + '');
            });
            return childProcess;
        });
        // Options to control the language client
        const clientOptions = {
            revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never,
            // Register the server for php documents
            documentSelector: ['typescript', 'javascript', 'typescriptreact', 'javascriptreact'],
            uriConverters: {
                // VS Code by default %-encodes even the colon after the drive letter
                // NodeJS handles it much better
                code2Protocol: uri => url.format(url.parse(uri.toString(true))),
                protocol2Code: str => vscode.Uri.parse(str)
            },
            synchronize: {}
        };
        // Create the language client and start the client.
        client = new vscode_languageclient_1.LanguageClient('TypeScript Language Server', serverOptions, clientOptions);
        const disposable = client.start();
        // Push the disposable to the context's subscriptions so that the
        // client can be deactivated on extension deactivation
        context.subscriptions.push(disposable);
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map