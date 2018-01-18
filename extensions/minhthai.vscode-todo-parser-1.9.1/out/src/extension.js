"use strict";
var main_1 = require('./main');
var main;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    main = new main_1.Main(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    if (main)
        main.deactivate();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map