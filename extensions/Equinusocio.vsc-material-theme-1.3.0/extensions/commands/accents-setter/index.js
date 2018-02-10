"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const settings_1 = require("../../helpers/settings");
const vscode_1 = require("../../helpers/vscode");
const index_1 = require("../theme-icons/index");
const REGEXP_HEX = /^#([0-9A-F]{6}|[0-9A-F]{8})$/i;
let themeConfigCommon = require('../../defaults.json');
let accentsProperties = {
    "activityBarBadge.background": {
        alpha: 100,
        value: undefined
    },
    "list.activeSelectionForeground": {
        alpha: 100,
        value: undefined
    },
    "list.inactiveSelectionForeground": {
        alpha: 100,
        value: undefined
    },
    "list.highlightForeground": {
        alpha: 100,
        value: undefined
    },
    "scrollbarSlider.activeBackground": {
        alpha: 50,
        value: undefined
    },
    "editorSuggestWidget.highlightForeground": {
        alpha: 100,
        value: undefined
    },
    "textLink.foreground": {
        alpha: 100,
        value: undefined
    },
    "progressBar.background": {
        alpha: 100,
        value: undefined
    },
    "pickerGroup.foreground": {
        alpha: 100,
        value: undefined
    },
    "tab.activeBorder": {
        alpha: 100,
        value: undefined
    }
};
/**
 * Assigns colours
 * @param {string} colour
 * @param {*} config
 */
function assignColorCustomizations(colour, config) {
    if (!isValidColour(colour)) {
        colour = undefined;
    }
    Object.keys(accentsProperties).forEach(propertyName => {
        let accent = accentsProperties[propertyName];
        let _colour = colour;
        if (colour && accent.alpha < 100) {
            _colour = `${colour}${accent.alpha > 10 ? accent.alpha : `0${accent.alpha}`}`;
        }
        if (accent) {
            config[propertyName] = _colour;
        }
    });
}
/**
 * Determines if a string is a valid colour
 * @param {(string | null | undefined)} colour
 * @returns {boolean}
 */
function isValidColour(colour) {
    if (typeof colour === 'string' && REGEXP_HEX.test(colour)) {
        return true;
    }
    return false;
}
/**
 * Sets workbench options
 * @param {string} accentSelected
 * @param {*} config
 */
function setWorkbenchOptions(accentSelected, config) {
    vscode.workspace.getConfiguration().update('workbench.colorCustomizations', config, true).then(() => {
        let themeID = vscode_1.getCurrentThemeID();
        let themeIconsID = vscode_1.getCurrentThemeIconsID();
        settings_1.updateAccent(accentSelected).then(() => {
            if (settings_1.isMaterialTheme(themeID) && settings_1.isMaterialThemeIcons(themeIconsID)) {
                index_1.THEME_ICONS().then(() => vscode_1.reloadWindow());
            }
        });
    }, reason => {
        vscode.window.showErrorMessage(reason);
    });
}
/**
 * VSCode command
 */
exports.THEME_ACCENTS_SETTER = () => {
    // shows the quick pick dropdown
    let options = Object.keys(themeConfigCommon.accents);
    let purgeColourKey = 'Remove accents';
    options.push(purgeColourKey);
    vscode.window.showQuickPick(options).then(accentSelected => {
        if (accentSelected === null || accentSelected === undefined)
            return;
        let config = vscode.workspace.getConfiguration().get('workbench.colorCustomizations');
        switch (accentSelected) {
            case purgeColourKey:
                assignColorCustomizations(undefined, config);
                setWorkbenchOptions(undefined, config);
                break;
            default:
                assignColorCustomizations(themeConfigCommon.accents[accentSelected], config);
                setWorkbenchOptions(accentSelected, config);
                break;
        }
    });
};
//# sourceMappingURL=index.js.map