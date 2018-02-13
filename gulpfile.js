const gulp    = require('gulp');
const babel = require('gulp-babel');
const exec = require('child_process').exec;

gulp.task('rollup', function (cb) {
    exec('%CD%/node_modules/.bin/rollup -c', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('babel', () =>
    gulp.src('./public/bundle.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('./public'))
);

gulp.task('default',['rollup','babel']);