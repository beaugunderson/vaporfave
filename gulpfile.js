/*eslint-env node*/

'use strict';

var gulp = require('gulp');
var rimraf = require('rimraf');

var plugins = require('gulp-load-plugins')();

var paths = {
  js: '**/*.js'
};

// Clean up files
gulp.task('clean', function (cb) {
  rimraf('./output.png', cb);
});

// Lint JavaScript code
gulp.task('lint-js', function () {
  return gulp.src(paths.js)
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

gulp.task('lint', ['lint-js']);

gulp.task('watch', function () {
  var watcher = gulp.watch(paths.js, ['output']);

  watcher.on('change', function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running...');
  });
});

gulp.task('output', function () {
  var filename = './output/' + Date.now() + '.png';

  console.log('Writing', filename);

  return gulp.src('')
    .pipe(plugins.shell([
      'node vaporfave.js ' + filename,
      'open -a Xee -g ' + filename
    ]));
});

// Build and watch
gulp.task('default', ['output', 'watch']);
