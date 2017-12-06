"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const index_1 = require("./commands/accents-setter/index");
const index_2 = require("./commands/theme-variant/index");
const changelog_1 = require("./helpers/changelog");
var Commands;
(function (Commands) {
    Commands[Commands["ACCENTS"] = 0] = "ACCENTS";
    Commands[Commands["CHANGELOG"] = 1] = "CHANGELOG";
    Commands[Commands["COLOUR_VARIANT"] = 2] = "COLOUR_VARIANT";
})(Commands || (Commands = {}));
const OPTIONS = {
    'Change accent color': Commands.ACCENTS,
    'Change color variant': Commands.COLOUR_VARIANT,
    'Show changelog': Commands.CHANGELOG
};
function activate(context) {
    if (vscode.workspace.getConfiguration().has('materialTheme.cache.workbench.accent')) {
        vscode.workspace.getConfiguration().update('materialTheme.cache.workbench.accent', undefined, true);
    }
    if (changelog_1.shouldShowChangelog()) {
        changelog_1.showChangelog();
    }
    // registering the command
    let command = vscode.commands.registerCommand('material.theme.config', () => {
        // the user is going to choose what aspect of theme to config
        vscode.window.showQuickPick(Object.keys(OPTIONS)).then(response => {
            // switching selected option
            switch (OPTIONS[response]) {
                case Commands.ACCENTS:
                    index_1.THEME_ACCENTS_SETTER();
                    break;
                case Commands.CHANGELOG:
                    changelog_1.showChangelog();
                    break;
                case Commands.COLOUR_VARIANT:
                    index_2.THEME_VARIANT();
                    break;
            }
        });
    });
    context.subscriptions.push(command);
}
exports.activate = activate;
//# sourceMappingURL=material.theme.config.js.map