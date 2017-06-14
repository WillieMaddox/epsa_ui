/*eslint-env node */

const autoprefixer = require('gulp-autoprefixer')
const browserSync = require('browser-sync').create()
const cleanDest = require('gulp-clean-dest')
const concat = require('gulp-concat')
// const debug = require('gulp-debug')
const debugStreams = require('gulp-debug-streams')
const eslint = require('gulp-eslint')
const gulp = require('gulp')
// const gutil = require('gulp-util')
const jasmine = require('gulp-jasmine-phantom')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const sass = require('gulp-sass')
// const bowerFiles = require('gulp-main-bower-files')
const sourcemaps = require('gulp-sourcemaps')
// const requireDir = require('require-dir')
const requirejsOptimize = require('gulp-requirejs-optimize')
const imagemin = require('gulp-imagemin')
// const ginject = require('gulp-inject')
const pngquant = require('imagemin-pngquant')

// let env = gutil.env.env || 'development'
// let tasks = requireDir('tasks/');
// const paths = {
//   test: {},
//   src: {
//     js: 'app.js',
//     constants: 'constants.js',
//     html: 'index.html',
//     css: 'style.css'
//   },
//   stage: {},
//   dest: {
//     js: 'dist/',
//     constants: 'dist/',
//     html: 'dist/',
//     css: 'dist/'
//   }
// }
// const constants = {
//   default: {
//     apiHost: ''
//   },
//   development: {
//     apiHost: 'http://localhost:9050'
//   },
//   staging: {
//     apiHost: 'http://staging.example.com/api/'
//   },
//   production: {
//     apiHost: 'http://example.com/api/'
//   }
// }
// const run = {
//   default: {
//     js: {
//       uglify: false
//     },
//     css: {
//       cssnano: false
//     }
//   },
//   development: {
//     js: {
//       uglify: false
//     },
//     css: {
//       cssnano: false
//     }
//   },
//   staging: {
//     js: {
//       uglify: true
//     },
//     css: {
//       cssnano: true
//     }
//   },
//   production: {
//     js: {
//       uglify: true
//     },
//     css: {
//       cssnano: true
//     }
//   }
// }
// const plugin = {
//   default: {
//     js: {
//       uglify: {
//         mangle: true
//       }
//     }
//   },
//   development: {
//     js: {
//       uglify: {
//         mangle: false
//       }
//     }
//   },
//   staging: {
//     js: {
//       uglify: {
//         mangle: true
//       }
//     }
//   },
//   production: {
//     js: {
//       uglify: {
//         mangle: true
//       }
//     }
//   }
// }
// const runOpts = _.merge( {}, run.default, run[ env ] )
// const pluginOpts = _.merge( {}, plugin.default, plugin[ env ] )
// const constantsOpts = _.merge( {}, constants.default, constants[ env ] )
// module.exports.paths = paths
// module.exports.constants = constantsOpts
// module.exports.run = runOpts
// module.exports.plugin = pluginOpts

const requirejsConfig = {
  mainConfigFile: 'app/main/main.js',
  normalizeDirDefines: 'all',
  optimize: 'none',
  paths: {
    requireLib: '../bower_components/requirejs/require'
  },
  name: 'requireLib',
  include: ['main']
}

gulp.task('default', ['copy-html', 'copy-images', 'styles', 'lint', 'scripts'], function() {
  gulp.watch('sass/**/*.scss', ['styles'])
  gulp.watch('app/**/*.js', ['lint'])
  gulp.watch('app/index.html', ['copy-html'])
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

gulp.task('requirejsoptimize', function () {
  return gulp.src('app/main/**/*.js')
    .pipe(debugStreams.verbose('debug-1'))
    .pipe(cleanDest('dist/main/js'))
    .pipe(requirejsOptimize(requirejsConfig))
    .pipe(gulp.dest('dist/main/js'))
})

gulp.task('scripts', function() {
  return gulp.src('app/main/**/*.js')
    .pipe(requirejsOptimize(requirejsConfig))
    .pipe(babel())
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/main/js'))
})

gulp.task('scripts-dist', function() {
  return gulp.src('app/main/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(requirejsOptimize(requirejsConfig))
    .pipe(babel())
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/main/js'))
})

// function browserSyncInit(baseDir, files) {
//   browserSync.instance = browserSync.init(files, {
//     startPath: '/', server: { baseDir: baseDir }
//   })
// }
//
// // starts a development server
// // runs preprocessor tasks before,
// // and serves the src and .tmp folders
// gulp.task('serve',
//   ['typescript', 'jade', 'sass', 'inject' ],
//   function () {
//     browserSyncInit([
//       'stage',
//       'app/main'
//     ], [
//       'stage/**/*.css',
//       'stage/**/*.js',
//       'stage/**/*.html'
//     ])
//   }
// )
//
// // starts a production server
// // runs the build task before,
// // and serves the dist folder
// gulp.task('serve:dist', ['build'], function () {
//   browserSyncInit('dist/main')
// })

// gulp.task('inject', function () {
//
//   const injectStyles = gulp.src([
//     // selects all css files from the .tmp dir
//     'stage/**/*.css'
//   ], { read: false })
//
//   const injectScripts = gulp.src([
//     // selects all js files from stage dir
//     'stage/**/*.js',
//     // but ignores test files
//     '!app/main/**/*.test.js'
//     // then uses the gulp-angular-filesort plugin
//     // to order the file injection
//   ]).pipe($.angularFilesort()
//     .on('error', $.util.log))
//
//   // tell wiredep where your bower_components are
//   const wiredepOptions = {
//     directory: 'bower_components'
//   }
//
//   return gulp.src('app/main/*.html')
//     .pipe($.inject(injectStyles, injectOptions))
//     .pipe($.inject(injectScripts, injectOptions))
//     .pipe(wiredep(wiredepOptions))
//     // write the injections to the .tmp/index.html file
//     .pipe(gulp.dest('stage'))
//   // so that src/index.html file isn't modified
//   // with every commit by automatic injects
//
// })


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
