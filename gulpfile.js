const gulp = require("gulp");
const ts = require("gulp-typescript");
const jade = require("gulp-jade");

const tsProject = ts.createProject("tsconfig.json");

function compileScripts() {
    var tsResult = tsProject.src() // instead of gulp.src(...)
        .pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest("."));
}

function compileJade() {
    gulp.src("./views/*.jade")
        .pipe(jade())
        .pipe(gulp.dest("./views"));
}

gulp.task("scripts", compileScripts);

gulp.task("jade", compileJade);

gulp.task("buildAll", () => {
    compileJade();
    compileScripts();
});