'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const request = require("request");
class SolargraphDocumentProvider {
    constructor() {
        this._onDidChange = new vscode.EventEmitter();
        this.docs = {};
    }
    setServerUrl(url) {
        this.serverUrl = url;
    }
    updateAll() {
        Object.keys(this.docs).forEach((uriString) => {
            this.update(vscode.Uri.parse(uriString));
        });
    }
    remove(uri) {
        delete this.docs[uri.toString()];
    }
    provideTextDocumentContent(uri) {
        if (!this.docs[uri.toString()]) {
            this.update(uri);
        }
        return this.docs[uri.toString()] || 'Loading...';
    }
    update(uri) {
        var that = this;
        var converted = uri.toString(true).replace(/^solargraph:/, this.serverUrl) + "&workspace=" + encodeURI(vscode.workspace.rootPath);
        console.log('Loading: ' + converted);
        request.get({
            url: converted
        }, function (err, httpResponse, body) {
            that.docs[uri.toString()] = body;
            that._onDidChange.fire(uri);
        });
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
}
exports.default = SolargraphDocumentProvider;
//# sourceMappingURL=SolargraphDocumentProvider.js.map