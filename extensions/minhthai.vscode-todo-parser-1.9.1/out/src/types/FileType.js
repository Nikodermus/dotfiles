"use strict";
var LanguageType_1 = require('./LanguageType');
var all_1 = require('../utils/all');
var FileType = (function () {
    function FileType(data) {
        this.data = data;
        this.name = data.fileName;
        this.ext = all_1.getFileExtension(this.name);
        this.language = LanguageType_1.LanguageType.fromId(data.languageId);
    }
    FileType.prototype.getFile = function () {
        return this.data;
    };
    FileType.prototype.getName = function () {
        return this.name;
    };
    /**
     * Get file extension
     */
    FileType.prototype.getExt = function () {
        return this.ext;
    };
    FileType.prototype.getLanguage = function () {
        return this.language;
    };
    return FileType;
}());
exports.FileType = FileType;
//# sourceMappingURL=FileType.js.map