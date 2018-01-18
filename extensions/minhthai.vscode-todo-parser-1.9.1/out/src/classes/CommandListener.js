"use strict";
var vscode_1 = require('vscode');
var CommandType_1 = require('../types/CommandType');
var all_1 = require('../const/all');
var CommandListener = (function () {
    function CommandListener() {
    }
    CommandListener.listen = function (context, callback) {
        /**
         * Command received from button clicks
         */
        var parseAllFilesCommand = vscode_1.commands.registerCommand(all_1.PARSE_ALL_FILES_COMMAND, function () {
            callback(new CommandType_1.ParseAllFilesCommand());
        });
        var parseCurrentFileCommand = vscode_1.commands.registerCommand(all_1.PARSE_CURRENT_FILE_COMMAND, function () {
            callback(new CommandType_1.ParseCurrentFileCommand());
            callback(new CommandType_1.UpdateStatusBarCommand());
        });
        var cancelParseAllFilesCommand = vscode_1.commands.registerCommand(all_1.CANCEL_PARSE_ALL_FILES_COMMAND, function () {
            callback(new CommandType_1.CancelCommand());
        });
        /**
         * Command received from events
         */
        // window.onDidChangeTextEditorSelection(() => {
        //   callback(new UpdateStatusBarCommand());
        // }, this, context.subscriptions);
        vscode_1.window.onDidChangeActiveTextEditor(function () {
            callback(new CommandType_1.UpdateStatusBarCommand());
        }, this, context.subscriptions);
        vscode_1.workspace.onDidChangeConfiguration(function () {
            callback(new CommandType_1.ReloadUserSettingsCommand());
        }, this, context.subscriptions);
        // Add to list of disposed items when deactivated
        context.subscriptions.push(parseAllFilesCommand);
        context.subscriptions.push(parseCurrentFileCommand);
        // Parse the current file once at the beginning
        callback(new CommandType_1.UpdateStatusBarCommand());
    };
    return CommandListener;
}());
exports.CommandListener = CommandListener;
//# sourceMappingURL=CommandListener.js.map