"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bump = require("gulp-bump");
const gulp = require("gulp");
const gulpIf = require("gulp-if");
const gulpUtil = require("gulp-util");
const runSequence = require("run-sequence");
const yargs = require("yargs");
const log_1 = require("../consts/log");
var argv = yargs.argv;
exports.taskBump = gulp.task('bump', (cb) => {
    runSequence('bump-pkg-version', error => {
        if (error) {
            console.log(gulpUtil.colors.magenta.bold('[bump]'), gulpUtil.colors.red.bold(log_1.MESSAGE_BUMP_ERROR), error);
        }
        else {
            console.log(gulpUtil.colors.magenta.bold('\n[bump]'), gulpUtil.colors.green.bold(log_1.MESSAGE_BUMP_SUCCESS));
        }
        cb(error);
    });
});
exports.taskVersioning = gulp.task('bump-pkg-version', () => {
    return gulp.src(['./package.json'])
        .pipe(gulpIf((Object.keys(argv).length === 2), bump()))
        .pipe(gulpIf(argv.patch, bump()))
        .pipe(gulpIf(argv.minor, bump({ type: 'minor' })))
        .pipe(gulpIf(argv.major, bump({ type: 'major' })))
        .pipe(gulp.dest('./'));
});
exports.default = { taskBump: exports.taskBump, taskVersioning: exports.taskVersioning };
//# sourceMappingURL=bump.js.map