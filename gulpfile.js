/*eslint-env node */

const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const browserSync = require('browser-sync').create()
const eslint = require('gulp-eslint')
const jasmine = require('gulp-jasmine-phantom')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const requirejsOptimize = require('gulp-requirejs-optimize')
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

gulp.task('default', ['copy-html', 'copy-images', 'styles', 'lint', 'scripts'], function() {
  gulp.watch('sass/**/*.scss', ['styles'])
  gulp.watch('app/**/*.js', ['lint'])
  gulp.watch('app/main/index.html', ['copy-html'])
  gulp.watch('./dist/main/index.html').on('change', browserSync.reload)
  browserSync.init({
    server: './dist/main'
  })
})

gulp.task('dist', [
  'copy-html',
  'copy-images',
  'styles',
  'lint',
  'scripts-dist'
])

gulp.task('requireqsoptimize', function () {
  return gulp.src('app/main/**/*.js')
    .pipe(requirejsOptimize({
      mainConfigFile: 'app/main/config.js'
    }))
    .pipe(gulp.dest('dist/main/js'))
})

gulp.task('scripts', function() {
  gulp.src('app/main/**/*.js')
    .pipe(requirejsOptimize({
      mainConfigFile: 'app/main/config.js'
    }))
    .pipe(babel())
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/main/js'))
})

gulp.task('scripts-dist', function() {
  gulp.src('app/main/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/main/js'))
})

gulp.task('copy-html', function() {
  gulp.src('app/index.html')
    .pipe(gulp.dest('./dist/main'))
})

gulp.task('copy-images', function() {
  gulp.src('app/img/*')
    .pipe(imagemin({
      progressive: true,
      use: [pngquant()]
    }))
    .pipe(gulp.dest('dist/main/img'))
})

gulp.task('styles', function() {
  gulp.src('sass/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('dist/main/css'))
    .pipe(browserSync.stream())
})

gulp.task('lint', function () {
  return gulp.src(['app/main/**/*.js'])
  // eslint() attaches the lint output to the eslint property
  // of the file object so it can be used by other modules.
    .pipe(eslint())
  // eslint.format() outputs the lint results to the console.
  // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
  // To have the process exit with an error code (1) on
  // lint error, return the stream and pipe to failOnError last.
    .pipe(eslint.failOnError())
})

gulp.task('tests', function () {
  gulp.src('tests/spec/extraSpec.js')
    .pipe(jasmine({
      integration: true,
      vendor: 'app/main/**/*.js'
    }))
})
