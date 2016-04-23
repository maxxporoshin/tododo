var gulp = require('gulp');
var ts = require('gulp-typescript');
//var sass = require('gulp-sass');
//var pug = require('gulp-pug');
var bower = require('gulp-bower');

gulp.task('ts', function() {
    return gulp.src('src/**/*.ts')
            .pipe(ts({
                noImplicitAny: true,
                out: 'app.js'
            }))
            .pipe(gulp.dest('public'));
});

// gulp.task('sass', function() {
//     return gulp.src('src/scss/**/*.scss')
//             .pipe(sass({
//                 style: 'compressed',
//                 loadPath: ['public/components/bootstrap-sass/assets/stylesheets']
//             }))
//             .pipe(gulp.dest('public'));
// });
//
// gulp.task('pug', function() {
//     return gulp.src('src/pug/**/*.pug')
//             .pipe(pug())
//             .pipe(gulp.dest('public'));
// });

gulp.task('bower', function() {
    return bower();
});

gulp.task('server', function() {
    return gulp.src('server/**/*.ts')
            .pipe(ts({
                noImplicitAny: true,
                module: 'commonjs'
            }))
            .pipe(gulp.dest('server'));
});

gulp.task('app', ['ts', 'bower']);

gulp.task('watch', function() {
    gulp.watch('src/**/*', ['ts']);
    gulp.watch('server/**/*.ts', ['server']);
});
