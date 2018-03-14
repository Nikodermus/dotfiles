"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs_1 = require("./fs");
/**
 * Gets saved accent
 * @export
 * @returns {(string | null)}
 */
function getAccent() {
    return getCustomSettings().accent;
}
exports.getAccent = getAccent;
/**
 * Gets custom settings
 * @export
 * @returns {*}
 */
function getCustomSettings() {
    return vscode.workspace.getConfiguration().get('materialTheme.cache.workbench.settings', {});
}
exports.getCustomSettings = getCustomSettings;
/**
 * Checks if a given string could be an accent
 *
 * @export
 * @param {string} accentName
 * @returns {boolean}
 */
function isAccent(accentName, defaults) {
    return Object.keys(defaults.accents).filter(name => name === accentName).length > 0;
}
exports.isAccent = isAccent;
/**
 * Determines if the passing theme label is a material theme
 * @export
 * @param {string} themeName
 * @returns {boolean}
 */
function isMaterialTheme(themeName) {
    let packageJSON = fs_1.getPackageJSON();
    return packageJSON.contributes.themes.filter(contrib => contrib.label === themeName).length > 0;
}
exports.isMaterialTheme = isMaterialTheme;
/**
 * Determines if the passing icons theme is a material theme
 * @export
 * @param {string} themeIconsName
 * @returns {boolean}
 */
function isMaterialThemeIcons(themeIconsName) {
    let packageJSON = fs_1.getPackageJSON();
    return packageJSON.contributes.iconThemes.filter(contribute => contribute.id === themeIconsName).length > 0;
}
exports.isMaterialThemeIcons = isMaterialThemeIcons;
/**
 * Sets a custom property in custom settings
 * @export
 * @param {string} settingname
 * @param {*} value
 */
function setCustomSetting(settingname, value) {
    let settings = getCustomSettings();
    settings[settingname] = value;
    return vscode.workspace.getConfiguration().update('materialTheme.cache.workbench.settings', settings, true);
}
exports.setCustomSetting = setCustomSetting;
/**
 * Sets custom properties in custom settings
 * @export
 * @param {*} settingsObject
 * @returns {Thenable<void>}
 */
function setCustomSettings(settingsObject) {
    let settings = getCustomSettings();
    Object.keys(settingsObject).forEach(key => settings[key] = settingsObject[key]);
    return vscode.workspace.getConfiguration().update('materialTheme.cache.workbench.settings', settings, true);
}
exports.setCustomSettings = setCustomSettings;
/**
 * Determines if the window should reload
 * @export
 * @param {string} themeColour
 * @param {string} themeIcons
 * @returns {boolean}
 */
function shouldReloadWindow(themeColour, themeIcons) {
    let isTheme = isMaterialTheme(themeColour);
    let isThemeIcons = isMaterialThemeIcons(themeIcons);
    if (!isTheme && !isThemeIcons)
        return false;
    let customSettings = getCustomSettings();
    return customSettings.accent !== customSettings.accentPrevious;
}
exports.shouldReloadWindow = shouldReloadWindow;
/**
 * Updates accent name
 * @export
 * @param {string} accentName
 */
function updateAccent(accentName) {
    let config = getCustomSettings();
    let prevaccent = getAccent();
    if (prevaccent !== undefined && prevaccent !== accentName) {
        config.accentPrevious = prevaccent;
    }
    else if (accentName === undefined) {
        config.accentPrevious = undefined;
    }
    config.accent = accentName;
    return setCustomSettings(config);
}
exports.updateAccent = updateAccent;
//# sourceMappingURL=settings.js.map