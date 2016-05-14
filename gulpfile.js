const gulp = require("gulp");
const ts = require("gulp-typescript");
const jade = require("gulp-jade");

const tsProject = ts.createProject("tsconfig.json");

gulp.task("scripts", () => {
    var tsResult = tsProject.src() // instead of gulp.src(...)
        .pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest("."));
});

gulp.task("jade", () => {
    gulp.src("./views/*.jade")
        .pipe(jade())
        .pipe(gulp.dest("./views"));
});