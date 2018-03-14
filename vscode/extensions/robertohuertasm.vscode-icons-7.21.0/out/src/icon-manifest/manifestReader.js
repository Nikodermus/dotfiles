"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const models = require("../models");
const utils_1 = require("../utils");
const settings_1 = require("../settings");
class ManifestReader {
    static iconsDisabled(name, isFile = true) {
        const iconManifest = this.getIconManifest();
        const iconsJson = iconManifest && utils_1.parseJSON(iconManifest);
        const prefix = isFile ? settings_1.extensionSettings.manifestFilePrefix : settings_1.extensionSettings.manifestFolderPrefix;
        const suffix = Reflect.ownKeys(models.Projects).some(key => models.Projects[key] === name) ? '_' : '';
        const defNamePattern = `${prefix}${name}${suffix}`;
        return !iconsJson || !Reflect.ownKeys(iconsJson.iconDefinitions)
            .filter(key => key.toString().startsWith(defNamePattern)).length;
    }
    static folderIconsDisabled(func) {
        const iconManifest = this.getIconManifest();
        const iconsJson = iconManifest && utils_1.parseJSON(iconManifest);
        return !iconsJson || !func(iconsJson);
    }
    static getIconManifest() {
        const manifestFilePath = path.join(__dirname, '..', settings_1.extensionSettings.iconJsonFileName);
        try {
            return fs.readFileSync(manifestFilePath, 'utf8');
        }
        catch (err) {
            return null;
        }
    }
}
exports.ManifestReader = ManifestReader;
//# sourceMappingURL=manifestReader.js.map