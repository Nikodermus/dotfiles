"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const vscode = require("vscode");
const fs_1 = require("../../helpers/fs");
const settings_1 = require("../../helpers/settings");
const files_1 = require("../../consts/files");
const index_1 = require("../theme-icons/index");
const vscode_1 = require("../../helpers/vscode");
exports.THEME_VARIANT = () => {
    let defaults = fs_1.getDefaultValues();
    let options = Object.keys(defaults.themeVariants);
    let packageJSON = fs_1.getPackageJSON();
    options = options.filter(i => i !== packageJSON.contributes.themes[0].path);
    vscode.window.showQuickPick(options).then((response) => {
        if (!response)
            return;
        let customSettings = settings_1.getCustomSettings();
        let themepath = defaults.themeVariants[response];
        let themeUITheme = defaults.themeVariantsUITheme[response];
        customSettings.themeColours = response;
        packageJSON.contributes.themes[0].path = themepath;
        packageJSON.contributes.themes[0].uiTheme = themeUITheme;
        fs.writeFile(fs_1.getAbsolutePath('./package.json'), JSON.stringify(packageJSON, null, 2), { encoding: files_1.CHARSET }, (error) => {
            if (error) {
                console.trace(error);
                return;
            }
            settings_1.setCustomSettings(customSettings).then(() => {
                index_1.THEME_ICONS().then(() => vscode_1.reloadWindow()).catch(error => console.trace(error));
            });
        });
    });
};
//# sourceMappingURL=index.js.map