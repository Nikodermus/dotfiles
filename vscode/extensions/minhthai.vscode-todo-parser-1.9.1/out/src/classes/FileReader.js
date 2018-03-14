"use strict";
var vscode_1 = require('vscode');
var all_1 = require('../types/all');
var UserSettings_1 = require('./UserSettings');
var all_2 = require('../const/all');
var all_3 = require('../utils/all');
var fs = require('fs');
var path = require('path');
var FileReader = (function () {
    function FileReader() {
    }
    /**
     * The turn the file opened by the current text editor (or tab)
     */
    FileReader.readCurrentFile = function () {
        return new Promise(function (resolve, reject) {
            if (!vscode_1.window.activeTextEditor) {
                //reject("Failed to get active editor");
                return;
            }
            var doc = vscode_1.window.activeTextEditor.document;
            if (doc)
                resolve([new all_1.FileType(doc)]);
            else
                reject("Cannot get current document");
        });
    };
    /**
     * Return a list of files found in the root folder (project folder).
     * @param callback  A callback that receives a list of recent read files.
     * @param token     Token telling the method to stop.
     */
    FileReader.readProjectFiles = function (callback, finish, token) {
        var roots = UserSettings_1.UserSettings.getInstance().getExecutablePaths();
        if (!roots)
            roots = [vscode_1.workspace.rootPath];
        if (!roots) {
            callback([], 0, "Cannot get root folder.");
            finish();
            return;
        }
        var fileNames = [];
        for (var _i = 0, roots_1 = roots; _i < roots_1.length; _i++) {
            var r = roots_1[_i];
            fileNames = fileNames.concat(FileReader.findFilesInPath(r));
        }
        var slices = all_3.sliceArray(fileNames, all_2.READ_FILE_CHUNK_SIZE);
        FileReader.readFileLoop(slices, 0, callback, finish, token);
    };
    FileReader.readProjectFilesInDir = function (root, callback, finish, token) {
        if (!root) {
            callback([], 0, "Cannot get root folder.");
            finish();
            return;
        }
        var fileNames = FileReader.findFilesInPath(root);
        var slices = all_3.sliceArray(fileNames, all_2.READ_FILE_CHUNK_SIZE);
        FileReader.readFileLoop(slices, 0, callback, finish, token);
    };
    /**
     * Continuously reads files into TextDocument objects.
     * @param slices    Array of document name arrays.
     * @param index     Current index of @slices.
     * @param callback  A callback that receives a list of recent read files.
     * @param token     Token telling the method to stop.
     */
    FileReader.readFileLoop = function (slices, index, callback, finish, token) {
        if (index >= slices.length || (token && token.isCancellationRequested)) {
            finish();
            return;
        }
        var fileNames = slices[index];
        var progress = (index / slices.length * 100) | 0;
        FileReader.readFileFromNames(fileNames).then(function (files) {
            callback(files, progress);
            FileReader.readFileLoop(slices, index + 1, callback, finish, token);
        }, function (reason) {
            callback([], progress, reason);
            FileReader.readFileLoop(slices, index + 1, callback, finish, token);
        });
    };
    /**
     * Return files found in a directory. Each item is a full path
     * of a file.
     * @param root  Find starting point.
     */
    FileReader.findFilesInPath = function (root) {
        if (!fs.existsSync(root) || (root != vscode_1.workspace.rootPath && !UserSettings_1.UserSettings.getInstance().isFolderEligible(all_3.getFolderName(root)))) {
            return [];
        }
        // TODO: Try using workspace.findFiles(...) instead of node fs methods
        var files = fs.readdirSync(root);
        var names = [];
        for (var i = 0; i < files.length; i++) {
            var filename = path.join(root, files[i]);
            var stat = fs.lstatSync(filename);
            if (stat.isDirectory()) {
                names = names.concat(FileReader.findFilesInPath(filename)); // go into sub-folder
            }
            else {
                var ext = all_3.getFileExtension(filename);
                // Check early to avoid triggering extension of excluded languages
                if (UserSettings_1.UserSettings.getInstance().isFileEligible(ext)) {
                    names.push(filename);
                }
            }
        }
        return names;
    };
    /**
     * Read files given full file paths. Returns a list of file read successfully.
     * @param uris_or_strings File paths as string or Uri array.
     */
    FileReader.readFileFromNames = function (uris_or_strings) {
        return new Promise(function (resolve, reject) {
            var docs = [];
            // Count of successfully opened files
            var openedCount = 0;
            // Count of files which failed to load
            var failedCount = 0;
            function totalCount() { return openedCount + failedCount; }
            for (var _i = 0, uris_or_strings_1 = uris_or_strings; _i < uris_or_strings_1.length; _i++) {
                var uri = uris_or_strings_1[_i];
                var docPrm = vscode_1.workspace.openTextDocument(uri);
                docPrm.then(function (doc) {
                    if (doc)
                        docs.push(new all_1.FileType(doc));
                    openedCount++;
                    // Detect and end the function early
                    if (totalCount() == uris_or_strings.length) {
                        resolve(docs);
                    }
                }, function (reason) {
                    // Keep going, try other files.
                    failedCount++;
                    // Detect and end the function early
                    if (failedCount == uris_or_strings.length) {
                        // All files failed to open, so we reject
                        reject("No file has been read successfully.");
                    }
                    else if (totalCount() == uris_or_strings.length) {
                        resolve(docs);
                    }
                });
            }
            if (uris_or_strings.length == 0)
                resolve(docs); // no URIs at all
        });
    };
    return FileReader;
}());
exports.FileReader = FileReader;
//# sourceMappingURL=FileReader.js.map