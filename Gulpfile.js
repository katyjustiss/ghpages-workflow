var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var deploy      = require('gulp-gh-pages');
var runSequence = require('run-sequence');
var $ = require('gulp-load-plugins')({
      pattern: ['gulp-*', 'copy', 'del', 'main-bower-files']
    });

///////////BABEL//////////////////
gulp.task('js:dev', function () {
  return gulp
    .src('src/js/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.concat('main.js'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('js:prod', function () {
  return gulp
    .src('src/**/*.js')
    .pipe($.babel())
    .pipe($.concat('main.js'))
    .pipe(gulp.dest('public/js'))
});

//////////////BOWER///////////////
gulp.task('bower', function() {
  gulp
    .src($.mainBowerFiles('**/*.js'))
    .pipe($.concat('build.js'))
    .pipe(gulp.dest('public/lib'));
  gulp
    .src($.mainBowerFiles('**/*.css'))
    .pipe($.concat('build.css'))
    .pipe(gulp.dest('public/lib'));
})

/////////////CLEAN//////////////////
gulp.task('clean', function () {
   $.del('public')
})

///////////////COPY////////////////// trying to copy CNAME
gulp.task('copy', function () {
  gulp.src(['src/CNAME'])
  .pipe(gulp.dest('public/'))
});

/////////////DEPLOY/////////////////
gulp.task('deploy', function () {
  return gulp.src("./public/**/*")
    .pipe(deploy())
});

///////////////JADE////////////////
gulp.task('jade:dev', function () {
  return gulp
    .src(['src/**/*.jade', '!src/**/_*.jade'])
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest('public'));
});

gulp.task('jade:prod', function () {
  return gulp
    .src(['src/**/*.jade', '!src/**/_*.jade'])
    .pipe($.jade())
    .pipe(gulp.dest('public'));
});

///////////////SASS///////////////////
gulp.task('sass:dev', function () {
  return gulp
    .src('src/_styles/main.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.sourcemaps.write())
    .pipe($.autoprefixer('last 2 version'))
    .pipe(gulp.dest('public/css'))
    .pipe(browserSync.stream())
});

gulp.task('sass:prod', function () {
  return gulp
    .src('src/_styles/main.scss')
    .pipe($.sass({
        outputStyle: 'compressed'
      })
      .on('error', $.sass.logError)
    )
    .pipe($.autoprefixer('last 2 version'))
    .pipe(gulp.dest('public/css'))
    .pipe(browserSync.stream())
});

///////////////UGLIFY OR COMPRESS////////////////
gulp.task('compress', function() { //not working.
  return gulp.src('public/lib/*.js')
    .pipe($.uglify())
    .pipe(gulp.dest('public/lib'));
});


//trying the runsequence for dev
gulp.task('build:dev', ['clean'], function(callback) {
  runSequence([
        'jade:dev',
        'sass:dev',
        'js:dev',
        'bower'
      ],
      [
        'serve'
      ],
        callback);
});

gulp.task('build', ['clean', 'jade:dev', 'sass:dev', 'js:dev', 'bower'])

gulp.task('build:prod', ['clean'], function(callback) {
  runSequence([
        'jade:prod',
        'sass:prod',
        'js:prod',
        'bower'
      ],
      [
        'compress'
      ],
      [
        'serve'
      ],
        callback);
});

//SERVER AND WATCH
gulp.task('serve', function () {
  browserSync.init({
      server: {
        baseDir: "public/"
      }
    });
  gulp.watch(['src/**/*.jade'], ['jade:dev'])
  gulp.watch(['src/**/*.scss'], ['sass:dev'])
  gulp.watch(['src/**/*.js'], ['js:dev'])
  gulp.watch(['public/*.html', 'public/*.css', 'public/js/*.js']).on('change', browserSync.reload);
});

gulp.task('default', function() {});
