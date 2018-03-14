"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("../../extensions/helpers/fs");
const gulp = require("gulp");
const path = require("path");
const fs = require("fs");
const files_1 = require("../../extensions/consts/files");
const paths_1 = require("../../extensions/consts/paths");
const fs_2 = require("../../extensions/helpers/fs");
const PACKAGE_JSON = require(path.join(process.cwd(), './package.json'));
let variants = fs_2.getDefaultValues().themeVariantsColours;
function writeIconVariant(filepath, destpath, colour) {
    let regexp = new RegExp('(#4a616c)', 'i');
    filepath = path.join(process.cwd(), paths_1.default.ICONS, filepath);
    destpath = path.join(process.cwd(), paths_1.default.ICONS, destpath);
    fs.writeFileSync(destpath, fs.readFileSync(filepath, files_1.CHARSET).replace(regexp, ($0, $1) => $0.replace($1, colour)), { encoding: files_1.CHARSET });
}
exports.default = gulp.task('build:icons.variants', callback => {
    try {
        Object.keys(variants).forEach(variantName => {
            PACKAGE_JSON.contributes.iconThemes.forEach(contribute => {
                let regexpCheck = new RegExp(Object.keys(variants).join('|'), 'i');
                if (regexpCheck.test(contribute.path) || regexpCheck.test(contribute.id))
                    return;
                let basepath = path.join(process.cwd(), contribute.path);
                let basetheme = require(basepath);
                let theme = JSON.parse(JSON.stringify(basetheme));
                let variant = variants[variantName];
                fs_1.getVariantIcons().forEach(_iconName => {
                    let basethemeIcon = basetheme.iconDefinitions[_iconName];
                    let themeIcon = theme.iconDefinitions[_iconName];
                    if (themeIcon !== undefined) {
                        themeIcon.iconPath = themeIcon.iconPath.replace('.svg', `${variantName}.svg`);
                    }
                    if (basethemeIcon !== undefined && themeIcon !== undefined) {
                        writeIconVariant(basethemeIcon.iconPath, themeIcon.iconPath, variant);
                    }
                });
            });
        });
    }
    catch (error) {
        callback(error);
        return;
    }
    callback();
});
//# sourceMappingURL=icons-variants.js.map