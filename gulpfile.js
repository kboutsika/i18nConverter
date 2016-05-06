// including plugins
var gulp = require('gulp');
var minifyCss = require("gulp-minify-css");
var uglify = require("gulp-uglify");
var gutil = require('gulp-util');
 
// task
gulp.task('minify-css', function () {
    gulp.src('./css/css.css') // path to your file
    .pipe(minifyCss())
    .pipe(gulp.dest('dist'));
});

// task
gulp.task('minify-js', function () {
    gulp.src('./js/js.js') // path to your files
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('dist'));
});
