"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
let outInfoChannel;
let outLogChannel;
const logLevel = vscode.workspace.getConfiguration('gitHistory').get('logLevel');
function getInfoChannel() {
    if (outInfoChannel === undefined) {
        outInfoChannel = vscode.window.createOutputChannel('Git History Info');
    }
    return outInfoChannel;
}
function getLogChannel() {
    if (outLogChannel === undefined) {
        outLogChannel = vscode.window.createOutputChannel('Git History Log');
    }
    return outLogChannel;
}
function logError(error) {
    getLogChannel().appendLine(`[Error-${getTimeAndms()}] ${error.toString()}`.replace(/(\r\n|\n|\r)/gm, ''));
    getLogChannel().show();
    vscode.window.showErrorMessage('There was an error, please view details in the \'Git History Log\' output window');
}
exports.logError = logError;
function logInfo(message) {
    if (logLevel === 'Info' || logLevel === 'Debug') {
        getLogChannel().appendLine(`[Info -${getTimeAndms()}] ${message}`);
    }
}
exports.logInfo = logInfo;
function logDebug(message) {
    if (logLevel === 'Debug') {
        getLogChannel().appendLine(`[Debug-${getTimeAndms()}] ${message}`);
    }
}
exports.logDebug = logDebug;
function getTimeAndms() {
    const time = new Date();
    return ('0' + time.getHours()).slice(-2) + ':' +
        ('0' + time.getMinutes()).slice(-2) + ':' +
        ('0' + time.getSeconds()).slice(-2) + '.' +
        ('00' + time.getMilliseconds()).slice(-3);
}
function showInfo(message) {
    getInfoChannel().clear();
    getInfoChannel().appendLine(message);
    getInfoChannel().show();
}
exports.showInfo = showInfo;
//# sourceMappingURL=logger.js.map