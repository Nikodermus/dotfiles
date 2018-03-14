"use strict";
var UserSettings_1 = require('./UserSettings');
var FileFilter = (function () {
    function FileFilter() {
    }
    FileFilter.filter = function (files) {
        var goodFiles = [];
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            if (this.check(file.getExt())) {
                goodFiles.push(file);
            }
        }
        return goodFiles;
    };
    /**
     * Returns true if this file can be used.
     */
    FileFilter.check = function (ext) {
        return UserSettings_1.UserSettings.getInstance().isFileEligible(ext);
    };
    return FileFilter;
}());
exports.FileFilter = FileFilter;
//# sourceMappingURL=FileFilter.js.map