"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const files_1 = require("../consts/files");
const paths_1 = require("../consts/paths");
/**
 * @export
 * @param {string} dirname
 */
function ensureDir(dirname) {
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname);
    }
}
exports.ensureDir = ensureDir;
/**
 * Gets default value
 * @export
 * @returns {IDefaults}
 */
function getDefaultValues() {
    let defaults = require(path.join(paths_1.PATHS.VSIX_DIR, './extensions/defaults.json'));
    if (defaults === undefined || defaults === null) {
        throw new Error('Cannot find defaults params');
    }
    return defaults;
}
exports.getDefaultValues = getDefaultValues;
/**
 * Gets an absolute path
 *
 * @export
 * @param {string} input
 * @returns {string}
 */
function getAbsolutePath(input) {
    return path.join(paths_1.PATHS.VSIX_DIR, input);
}
exports.getAbsolutePath = getAbsolutePath;
/**
 * @export
 * @returns {string[]}
 */
function getAccentableIcons() {
    return getDefaultValues().accentableIcons;
}
exports.getAccentableIcons = getAccentableIcons;
/**
 * @export
 * @returns {string[]}
 */
function getVariantIcons() {
    return getDefaultValues().variantsIcons;
}
exports.getVariantIcons = getVariantIcons;
/**
 * Gets a theme content by a given contribute ID
 *
 * @export
 * @param {string} ID
 * @returns {IThemeIcons}
 */
function getThemeIconsByContributeID(ID) {
    let contribute = getThemeIconsContribute(ID);
    return contribute !== null ? require(path.join(paths_1.PATHS.VSIX_DIR, contribute.path)) : null;
}
exports.getThemeIconsByContributeID = getThemeIconsByContributeID;
/**
 * Gets a theme by name
 * @export
 * @param {string} name
 * @returns {IThemeIcons}
 */
function getThemeIconsContribute(ID) {
    let contributes = getPackageJSON().contributes.iconThemes.filter(contribute => contribute.id === ID);
    return contributes[0] !== undefined ? contributes[0] : null;
}
exports.getThemeIconsContribute = getThemeIconsContribute;
/**
 * Gets package JSON
 * @export
 * @returns {*}
 */
function getPackageJSON() {
    let packageJSON = require(path.join(paths_1.PATHS.VSIX_DIR, './package.json'));
    return packageJSON;
}
exports.getPackageJSON = getPackageJSON;
/**
 * Writes a file inside the vsix directory
 * @export
 * @param {string} filename
 * @param {string} filecontent
 */
function writeFile(filename, filecontent) {
    filename = path.join(paths_1.PATHS.VSIX_DIR, filename);
    console.log(arguments);
    fs.writeFileSync(filename, filecontent, { encoding: files_1.CHARSET });
}
exports.writeFile = writeFile;
//# sourceMappingURL=fs.js.map