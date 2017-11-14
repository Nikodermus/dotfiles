/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
"use strict";
var path = require('path');
var vscode_1 = require('vscode');
var vscode_languageclient_1 = require('vscode-languageclient');
function activate(context) {
    // We need to go one level up since an extension compile the js code into
    // the output folder.
    var serverModule = path.join(__dirname, '..', 'server', 'server.js');
    var debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
    var serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
    };
    var clientOptions = {
        documentSelector: ['javascript', 'javascriptreact'],
        synchronize: {
            configurationSection: 'jshint',
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/.jshint{rc,ignore}')
        }
    };
    var client = new vscode_languageclient_1.LanguageClient('JSHint Linter', serverOptions, clientOptions);
    context.subscriptions.push(new vscode_languageclient_1.SettingMonitor(client, 'jshint.enable').start());
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map