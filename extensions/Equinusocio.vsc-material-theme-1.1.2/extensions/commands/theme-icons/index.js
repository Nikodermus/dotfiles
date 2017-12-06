"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("../../helpers/fs");
const fs = require("fs");
const fs_2 = require("../../helpers/fs");
const vscode_1 = require("../../helpers/vscode");
const settings_1 = require("../../helpers/settings");
const files_1 = require("../../consts/files");
function getIconDefinition(definitions, iconname) {
    return definitions[iconname];
}
/**
 * Replaces icon path with the accented one.
 * @param {string} iconPath
 * @param {string} accentName
 * @returns {string}
 */
function replaceIconPathWithAccent(iconPath, accentName) {
    return iconPath.replace('.svg', `.accent.${accentName}.svg`);
}
exports.THEME_ICONS = () => {
    let deferred = {};
    let promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    let themeIconsID = vscode_1.getCurrentThemeIconsID();
    if (settings_1.isMaterialThemeIcons(themeIconsID)) {
        let customSettings = settings_1.getCustomSettings();
        let defaults = fs_2.getDefaultValues();
        let accentName = customSettings.accent;
        let variantName = customSettings.themeColours === undefined ? '' : customSettings.themeColours;
        let themeContribute = fs_2.getThemeIconsContribute(themeIconsID);
        let theme = fs_2.getThemeIconsByContributeID(themeIconsID);
        let themepath = fs_2.getAbsolutePath(themeContribute.path);
        if (settings_1.isAccent(accentName, defaults)) {
            let _accentName = accentName.replace(/\s+/, '-');
            fs_1.getAccentableIcons().forEach(iconname => {
                let distIcon = getIconDefinition(theme.iconDefinitions, iconname);
                let outIcon = getIconDefinition(defaults.icons.theme.iconDefinitions, iconname);
                if (typeof distIcon === 'object' && typeof outIcon === 'object') {
                    distIcon.iconPath = replaceIconPathWithAccent(outIcon.iconPath, _accentName);
                }
            });
            // theme.iconDefinitions._folder_open.iconPath = defaults.icons.theme.iconDefinitions._folder_open.iconPath.replace('.svg', `.accent.${ _accentName }.svg`);
            // theme.iconDefinitions._folder_open_build.iconPath = defaults.icons.theme.iconDefinitions._folder_open_build.iconPath.replace('.svg', `.accent.${ _accentName }.svg`);
        }
        else {
            fs_1.getAccentableIcons().forEach(iconname => {
                let distIcon = getIconDefinition(theme.iconDefinitions, iconname);
                let outIcon = getIconDefinition(defaults.icons.theme.iconDefinitions, iconname);
                distIcon.iconPath = outIcon.iconPath;
            });
            // theme.iconDefinitions._folder_open.iconPath = defaults.icons.theme.iconDefinitions._folder_open.iconPath;
            // theme.iconDefinitions._folder_open_build.iconPath = defaults.icons.theme.iconDefinitions._folder_open_build.iconPath;
        }
        fs_2.getVariantIcons().forEach(iconname => {
            let distIcon = getIconDefinition(theme.iconDefinitions, iconname);
            let outIcon = getIconDefinition(defaults.icons.theme.iconDefinitions, iconname);
            if (!!distIcon && !!outIcon) {
                distIcon.iconPath = outIcon.iconPath.replace('.svg', `${variantName}.svg`);
            }
        });
        // theme.iconDefinitions._folder_dark.iconPath = defaults.icons.theme.iconDefinitions._folder_dark.iconPath.replace('.svg', `${ variantName }.svg`);
        // theme.iconDefinitions._folder_dark_build.iconPath = defaults.icons.theme.iconDefinitions._folder_dark_build.iconPath.replace('.svg', `${ variantName }.svg`);
        // theme.iconDefinitions._folder_light.iconPath = defaults.icons.theme.iconDefinitions._folder_light.iconPath.replace('.svg', `${ variantName }.svg`);
        // theme.iconDefinitions["_folder_light_build"].iconPath = defaults.icons.theme.iconDefinitions["_folder_light_build"].iconPath.replace('.svg', `${ variantName }.svg`);
        fs.writeFile(themepath, JSON.stringify(theme), { encoding: files_1.CHARSET }, (error) => {
            if (error) {
                deferred.reject(error);
                return;
            }
            deferred.resolve();
        });
    }
    else {
        deferred.resolve();
    }
    return promise;
};
//# sourceMappingURL=index.js.map