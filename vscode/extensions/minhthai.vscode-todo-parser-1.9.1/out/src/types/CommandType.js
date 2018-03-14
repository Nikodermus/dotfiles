"use strict";
var all_1 = require('../classes/all');
var vscode_1 = require('vscode');
var all_2 = require('../const/all');
var tokenSource = new vscode_1.CancellationTokenSource();
var ParseCurrentFileCommand = (function () {
    function ParseCurrentFileCommand() {
    }
    ParseCurrentFileCommand.prototype.execute = function () {
        return new Promise(function (resolve, reject) {
            var filePrm = all_1.FileReader.readCurrentFile();
            filePrm.then(function (files) {
                files = all_1.FileFilter.filter(files);
                var todos = all_1.Parser.parse(files);
                all_1.OutputWriter.begin();
                all_1.OutputWriter.writeTodo(todos);
                all_1.OutputWriter.finish(todos.length);
                resolve(todos.length);
            }, function (reason) {
                reject(reason);
            });
        });
    };
    return ParseCurrentFileCommand;
}());
exports.ParseCurrentFileCommand = ParseCurrentFileCommand;
var ParseAllFilesCommand = (function () {
    function ParseAllFilesCommand() {
    }
    ParseAllFilesCommand.prototype.execute = function () {
        return new Promise(function (resolve, reject) {
            all_1.OutputWriter.begin();
            var totalFiles = 0;
            var results = [], errors = [];
            all_1.FileReader.readProjectFiles(function (files, progress, error) {
                if (files.length > 0) {
                    files = all_1.FileFilter.filter(files);
                    var todos = all_1.Parser.parse(files);
                    results = results.concat(todos);
                    all_1.OutputWriter.writeTodo(todos);
                    all_1.StatusBarManager.getInstance().setWorking(all_2.WORKING_ICON + " " + progress + "%", "Click to cancel");
                    totalFiles += todos.length;
                }
                // We could have files available, but still have an error
                // because some of them failed to load.
                if (error) {
                    errors.push(error);
                }
            }, function () {
                all_1.OutputWriter.finish(totalFiles);
                all_1.StatusBarManager.getInstance().setDefault();
                if (all_1.UserSettings.getInstance().DevMode.getValue()) {
                    for (var _i = 0, errors_1 = errors; _i < errors_1.length; _i++) {
                        var err = errors_1[_i];
                        all_1.Logger.error(err);
                    }
                }
                resolve(totalFiles);
            }, tokenSource.token);
        });
    };
    return ParseAllFilesCommand;
}());
exports.ParseAllFilesCommand = ParseAllFilesCommand;
var ParseAllFilesInDirCommand = (function () {
    function ParseAllFilesInDirCommand() {
    }
    ParseAllFilesInDirCommand.prototype.execute = function (root) {
        return new Promise(function (resolve, reject) {
            all_1.OutputWriter.begin();
            var totalFiles = 0;
            var results = [], errors = [];
            all_1.FileReader.readProjectFilesInDir(root, function (files, progress, error) {
                if (!error) {
                    files = all_1.FileFilter.filter(files);
                    var todos = all_1.Parser.parse(files);
                    results = results.concat(todos);
                    all_1.OutputWriter.writeTodo(todos);
                    all_1.StatusBarManager.getInstance().setWorking(all_2.WORKING_ICON + " " + progress + "%", "Click to cancel");
                    totalFiles += todos.length;
                }
                else {
                    errors.push(error);
                }
            }, function () {
                all_1.OutputWriter.finish(totalFiles);
                all_1.StatusBarManager.getInstance().setDefault();
                if (all_1.UserSettings.getInstance().DevMode.getValue()) {
                    for (var _i = 0, errors_2 = errors; _i < errors_2.length; _i++) {
                        var err = errors_2[_i];
                        all_1.Logger.error(err);
                    }
                }
                resolve(totalFiles);
            }, tokenSource.token);
        });
    };
    return ParseAllFilesInDirCommand;
}());
exports.ParseAllFilesInDirCommand = ParseAllFilesInDirCommand;
var ReloadUserSettingsCommand = (function () {
    function ReloadUserSettingsCommand() {
    }
    ReloadUserSettingsCommand.prototype.execute = function () {
        return new Promise(function (resolve, reject) {
            all_1.UserSettings.getInstance().reload();
            resolve('User settings reload.');
        });
    };
    return ReloadUserSettingsCommand;
}());
exports.ReloadUserSettingsCommand = ReloadUserSettingsCommand;
var UpdateStatusBarCommand = (function () {
    function UpdateStatusBarCommand() {
    }
    UpdateStatusBarCommand.prototype.execute = function () {
        return new Promise(function (resolve, reject) {
            var filePrm = all_1.FileReader.readCurrentFile();
            filePrm.then(function (files) {
                files = all_1.FileFilter.filter(files);
                var todos = all_1.Parser.parse(files);
                var n = todos.length;
                all_1.StatusBarManager.getInstance().setDefault(all_2.CHECKLIST_ICON + " " + n, (n > 1) ? n + " TODOs" : n + " TODO");
                resolve(todos.length);
            }, function (reason) {
                reject(reason);
            });
        });
    };
    return UpdateStatusBarCommand;
}());
exports.UpdateStatusBarCommand = UpdateStatusBarCommand;
var CancelCommand = (function () {
    function CancelCommand() {
    }
    CancelCommand.prototype.execute = function () {
        return new Promise(function (resolve, reject) {
            tokenSource.cancel();
            resolve('Cancel triggered.');
        });
    };
    return CancelCommand;
}());
exports.CancelCommand = CancelCommand;
//# sourceMappingURL=CommandType.js.map