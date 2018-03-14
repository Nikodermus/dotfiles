"use strict";
var vscode_1 = require('vscode');
var FileUri = (function () {
    function FileUri(data) {
        if (typeof data === 'string') {
            this.uri = this.uriFromString(data);
        }
        else {
            this.uri = data;
        }
    }
    FileUri.fromString = function (path) {
        return new FileUri(path);
    };
    FileUri.fromUri = function (uri) {
        return new FileUri(uri);
    };
    FileUri.prototype.getUri = function () {
        return this.uri;
    };
    FileUri.prototype.getPath = function () {
        return this.uri.fsPath;
    };
    FileUri.prototype.uriFromString = function (str) {
        return vscode_1.Uri.parse("file:" + str);
    };
    return FileUri;
}());
exports.FileUri = FileUri;
//# sourceMappingURL=FileUri.js.map