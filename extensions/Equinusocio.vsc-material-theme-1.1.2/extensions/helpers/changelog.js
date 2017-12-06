"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const fs_1 = require("./fs");
const paths_1 = require("../consts/paths");
function previewFile() {
    let uri = vscode.Uri.file(path.join(paths_1.PATHS.VSIX_DIR, './CHANGELOG.md'));
    vscode.commands.executeCommand('markdown.showPreview', uri);
}
function splitVersion(input) {
    let [major, minor, patch] = input.split('.').map(i => parseInt(i));
    return { major, minor, patch };
}
function showChangelog() {
    let extname = 'Microsoft.vscode-markdown';
    let md = vscode.extensions.getExtension(extname);
    if (md === undefined) {
        console.warn(`Ext not found ${extname}`);
        return;
    }
    if (md.isActive) {
        previewFile();
    }
    else {
        md.activate().then(() => {
            previewFile();
        }, reason => {
            console.warn(reason);
        });
    }
}
exports.showChangelog = showChangelog;
function shouldShowChangelog() {
    let defaults = fs_1.getDefaultValues();
    let out;
    let packageJSON = fs_1.getPackageJSON();
    if (defaults.changelog == undefined || (defaults.changelog !== undefined && typeof defaults.changelog.lastversion !== 'string')) {
        defaults.changelog = {
            lastversion: packageJSON.version
        };
        out = true;
    }
    else {
        let versionCurrent = splitVersion(packageJSON.version);
        let versionOld = splitVersion(defaults.changelog.lastversion);
        out = versionCurrent.major > versionOld.major || versionCurrent.minor > versionOld.minor || versionCurrent.patch > versionOld.patch;
        defaults.changelog.lastversion = packageJSON.version;
    }
    fs_1.writeFile(path.join('./extensions/defaults.json'), JSON.stringify(defaults, null, 2));
    return out;
}
exports.shouldShowChangelog = shouldShowChangelog;
//# sourceMappingURL=changelog.js.map