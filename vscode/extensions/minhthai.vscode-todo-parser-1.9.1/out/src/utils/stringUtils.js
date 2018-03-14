"use strict";
/**
 * Returns a 32-bit hash value hash function for
 * String. Inspired by Java source.
 */
function hashCode(str) {
    var hash = 0;
    if (str.length == 0)
        return hash;
    for (var i = 0; i < str.length; ++i) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // force convert to 32-bit int
    }
    return hash;
}
exports.hashCode = hashCode;
/**
 * Returns the file extension part or an empty string
 * if there is none.
 */
function getFileExtension(filename) {
    if (!filename)
        return;
    var ext = '', temp = '';
    for (var i = filename.length - 1; i >= 0; --i) {
        var char = filename[i];
        if (char === '.') {
            ext = temp; // avoid filename without extension
            break;
        }
        temp = char + temp;
    }
    return ext;
}
exports.getFileExtension = getFileExtension;
/**
 * Returns the folder name part of a file path.
 * @param path  The file path.
 */
function getFolderName(path) {
    if (!path)
        return;
    // Remove the last dash (/)
    if (path[path.length - 1] === '\\' || path[path.length - 1] === '/')
        path = path.substr(0, path.length - 1);
    var ext = '', temp = '';
    for (var i = path.length - 1; i >= 0; --i) {
        var char = path[i];
        if (char === '/' || char === '\\') {
            ext = temp;
            break;
        }
        temp = char + temp;
    }
    return ext;
}
exports.getFolderName = getFolderName;
/**
 * Returns true if the string starts with one of the
 * prefixes and false otherwise.
 * @param str       String to be checked.
 * @param prefixes  A list of prefixes.
 * @returns {[boolean, string]}  A tuple of whether a match is found (boolean) and the matched prefix.
 */
function startsWithOne(str, prefixes) {
    for (var _i = 0, prefixes_1 = prefixes; _i < prefixes_1.length; _i++) {
        var p = prefixes_1[_i];
        if (/\w/.test(p[0]))
            p = '\\b' + p;
        if (/\w/.test(p.slice(-1)))
            p = p + '\\b';
        if ((new RegExp('^' + p, 'i')).test(str))
            return [true, p.replace(/\\b/g, '')];
    }
    return [false, null];
}
exports.startsWithOne = startsWithOne;
//# sourceMappingURL=stringUtils.js.map