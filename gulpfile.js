const gulp = require("gulp");
const ts = require("gulp-typescript");
const jade = require("gulp-jade");
const less = require("gulp-less");

const tsProject = ts.createProject("tsconfig.json");

function compileScripts() {
    var tsResult = tsProject.src() // instead of gulp.src(...)
        .pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest("."));
}

function compileJade() {
    return gulp.src("./views/*.jade")
        .pipe(jade())
        .pipe(gulp.dest("./views"));
}

function compileLess() {
    return gulp.src("./stylesheets/*.less")
        .pipe(less())
        .pipe(gulp.dest("./stylesheets"));
}

gulp.task("scripts", compileScripts);

gulp.task("jade", compileJade);

gulp.task("buildAll", () => {
    compileJade();
    compileScripts();
    compileLess();
});