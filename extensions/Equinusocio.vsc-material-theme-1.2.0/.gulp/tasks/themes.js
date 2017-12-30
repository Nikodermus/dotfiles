"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const gulp = require("gulp");
const gulpUtil = require("gulp-util");
const mustache = require("mustache");
const path = require("path");
const log_1 = require("./../consts/log");
const files_1 = require("../../extensions/consts/files");
const paths_1 = require("../../extensions/consts/paths");
const fs_1 = require("../../extensions/helpers/fs");
let commons = require('../../extensions/defaults.json');
let themeTemplateFileContent = fs.readFileSync(path.join(paths_1.default.SRC, `/themes/theme-template-color-theme.json`), files_1.CHARSET);
let themeVariants = [];
let fileNames = fs.readdirSync(path.join(paths_1.default.SRC, `./themes/settings/specific`));
// build theme variants for later use in templating
fileNames.forEach(fileName => {
    let filePath = path.join(paths_1.default.SRC, `./themes/settings/specific`, `./${fileName}`);
    let contents = fs.readFileSync(filePath, files_1.CHARSET);
    try {
        themeVariants.push(JSON.parse(contents));
    }
    catch (error) {
        gulpUtil.log(log_1.MESSAGE_THEME_VARIANT_PARSE_ERROR, error);
    }
});
/**
 * Themes task
 * Builds Themes
 */
exports.default = gulp.task('build:themes', cb => {
    gulpUtil.log(gulpUtil.colors.gray(log_1.HR));
    fs_1.ensureDir(path.join(paths_1.default.THEMES));
    try {
        themeVariants.forEach(variant => {
            let filePath = path.join(paths_1.default.THEMES, `./${variant.name}.json`);
            let templateData = { commons, variant };
            let templateJSON = JSON.parse(mustache.render(themeTemplateFileContent, templateData));
            let templateJSONStringified = JSON.stringify(templateJSON, null, 2);
            fs.writeFileSync(filePath, templateJSONStringified, { encoding: files_1.CHARSET });
            gulpUtil.log(log_1.MESSAGE_GENERATED, gulpUtil.colors.green(filePath));
        });
    }
    catch (exception) {
        gulpUtil.log(exception);
        cb(exception);
    }
    gulpUtil.log(gulpUtil.colors.gray(log_1.HR));
});
//# sourceMappingURL=themes.js.map