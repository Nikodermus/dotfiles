"use strict";
/*
 * > Changelog
 */
Object.defineProperty(exports, "__esModule", { value: true });
const gulp = require("gulp");
const gulpConventionalChangelog = require("gulp-conventional-changelog");
exports.task = gulp.task('changelog', () => {
    return gulp.src('CHANGELOG.md')
        .pipe(gulpConventionalChangelog({
        preset: 'angular',
        releaseCount: 0
    }))
        .pipe(gulp.dest('./'));
});
//# sourceMappingURL=changelog.js.map