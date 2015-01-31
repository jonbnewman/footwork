var gulp = require('gulp');
var header = require('gulp-header');
var footer = require('gulp-footer');
var fileImports = require('gulp-imports');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var bump = require('gulp-bump');
var size = require('gulp-size');
var replace = require('gulp-replace');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var docco = require('gulp-docco');
var merge = require('merge-stream');
var ignore = require('gulp-ignore');
var rimraf = require('gulp-rimraf');
var moment = require('moment');
var _ = require('lodash');
var runSequence = require('run-sequence');
var fs = require('fs');

var pkg = require('./package.json');
// var requireConfig = require('./docs/scripts/require-config.json');
var reporter = 'list';
var statement = 'A solid footing for web applications.';
var args   = require('yargs').argv;
// var annotatedPageMetaData = fs.readFileSync('docs/templates/annotated-metadata.html','utf8').replace('FOOTWORK_VERSION', pkg.version, 'g');

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * Author: <%= pkg.author %>',
  ' * Version: v<%= pkg.version %>',
  ' * Url: <%= pkg.homepage %>',
  ' * License(s): <% pkg.licenses.forEach(function( license, idx ){ %><%= license.type %><% if(idx !== pkg.licenses.length-1) { %>, <% } %><% }); %>',
  ' */',
  '', ''
];

var rawBanner = [
  '// footwork.js',
  '// ----------------------------------',
  '// v<%= pkg.version %>',
  '//',
  '// Copyright (c)2014 <%= pkg.author %>.',
  '// Distributed under <% pkg.licenses.forEach(function( license, idx ){ %><%= license.type %><% if(idx !== pkg.licenses.length-1) { %>, <% } %><% }); %> license',
  '//',
  '// <%= pkg.homepage %>',
  '', ''
];

var build = function(buildProfile) {
  var headerBanner = banner.slice(0);
  if(buildProfile !== 'raw') {
    headerBanner[3] += '-' + buildProfile;
  }
  headerBanner = headerBanner.join('\n');

  if(buildProfile === 'raw') {
    headerBanner = rawBanner.join("\n") + headerBanner;
  }

  return gulp
    .src(['source/build-profile/' + buildProfile + '.js'])
    .pipe(header(headerBanner, { pkg: pkg }))
    .pipe(fileImports())
    .pipe(replace(/FOOTWORK_VERSION/g, pkg.version))
    .pipe(rename('footwork-' + buildProfile + '.js'))
    .pipe(size({ title: '[' + buildProfile + '] Unminified' }))
    .pipe(gulp.dest('dist/'))
    .pipe(uglify({
      compress: { negate_iife: false }
    }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename('footwork-' + buildProfile + '.min.js'))
    .pipe(size({ title: '[' + buildProfile + '] Minified' }))
    .pipe(size({ title: '[' + buildProfile + '] Minified', gzip: true }))
    .pipe(gulp.dest('dist/'));
};

gulp.task('default', ['build-and-test']);

gulp.task('bump', function () {
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump())
    .pipe(gulp.dest('./'));
});

// Testing tasks
gulp.task('ci', ['build-and-test']);

gulp.task('build-and-test', ['test_all', 'test_minimal', 'test_bare']);

gulp.task('test_all', ['build_all'], function() {
  return gulp
    .src('spec/runner_all.html')
    .pipe(mochaPhantomJS({ reporter: reporter }));
});

gulp.task('test_minimal', ['build_minimal'], function() {
  return gulp
    .src('spec/runner_minimal.html')
    .pipe(mochaPhantomJS({ reporter: reporter }));
});

gulp.task('test_bare', ['build_bare'], function() {
  return gulp
    .src('spec/runner_bare.html')
    .pipe(mochaPhantomJS({ reporter: reporter }));
});

// Building tasks
gulp.task('build-everything', ['build_all', 'build_minimal', 'build_bare', 'build_raw']);

gulp.task('build_prep', function() {
  // we have to force load of lodash instead of underscore
  return gulp
    .src('bower_components/riveter/lib/riveter.js')
    .pipe(replace(/underscore/g, 'lodash'))
    .pipe(gulp.dest('./bower_components/riveter/lib'));
});

gulp.task('build_all', ['build_prep'], function() {
  return build('all');
});

gulp.task('build_minimal', ['build_prep'], function() {
  return build('minimal');
});

gulp.task('build_bare', ['build_prep'], function() {
  return build('bare');
});

gulp.task('build_raw', ['build_prep'], function() {
  return build('raw');
});

// Documentation / release oriented tasks
gulp.task('readyRelease', function(callback) {
  runSequence('set_version', 'build-everything', 'docs', callback);
});

gulp.task('docs', function(callback) {
  runSequence('docs_clean', 'doc_source_annotation', 'build_info', 'build_config', callback);
});

gulp.task('docs_clean', function() {
  return merge(
    gulp.src('./docs/pages/annotated-page.html', { read: false }).pipe(rimraf())
  );
});

gulp.task('doc_source_annotation', function() {
  return gulp.src('dist/footwork-raw.js')
    .pipe(docco({
      // layout: 'parallel'
      template: 'docs/templates/docco.jst'
    }))
    .pipe(footer(annotatedPageMetaData))
    .pipe(rename('annotated-page.html'))
    .pipe(gulp.dest('docs/pages'));
});

var generatedBuildInfoMessage = [
  '/**',
  ' * NOTE: This file is generated, do not edit it directly.',
  ' *       See: docs/templates/build-info.js',
  ' */'
];
gulp.task('build_info', function() {
  return gulp.src('docs/templates/build-info.js')
    .pipe( header(generatedBuildInfoMessage.join('\n') + '\n') )
    .pipe( replace('FOOTWORK_VERSION', pkg.version, 'g') )
    .pipe( replace('FOOTWORK_STATEMENT', statement, 'g') )
    .pipe( replace('FOOTWORK_BUILD_TIMESTAMP', moment().format(), 'g') )
    .pipe( replace('FOOTWORK_CONTRIBUTORS', JSON.stringify(pkg.contributors), 'g') )
    .pipe(gulp.dest('./docs'));
});

var generatedBuildConfigMessage = [
  '/**',
  ' * NOTE: This file is generated, do not edit it directly.',
  ' *       See: docs/scripts/require-config.json',
  ' */'
];
gulp.task('build_config', function(callback) {
  var requireConfigJS = _.extend([], generatedBuildConfigMessage).concat('var requireConfig = ' + JSON.stringify(requireConfig, null, '\t'));
  var buildJS = _.extend([], generatedBuildConfigMessage).concat('(' + JSON.stringify(requireConfig, null, '\t') + ')');
  fs.writeFile('docs/scripts/require-config.js', requireConfigJS.join('\n'));
  fs.writeFile('docs/build.js', buildJS.join('\n'));
  callback();
});

gulp.task('set_version', function() {
  var version = pkg.version;
  if(typeof args.ver !== 'undefined') {
    version = args.ver;
    pkg.version = version;
  }

  return merge(
    gulp.src(['docs/package.json', 'docs/bower.json'])
      .pipe(bump({ version: version }))
      .pipe(gulp.dest('./docs')),
    gulp.src(['./package.json', './bower.json'])
      .pipe(bump({ version: version }))
      .pipe(gulp.dest('./'))
  );
});

var dynamicAppScriptBlock = [
  '<?php if( gethostname() !== DEV_HOSTNAME ): ?>',
  '<script src="scripts/build/main.js"></script>',
  '<?php else: ?>',
  '<script src="scripts/require-config.js"></script>',
  '<script src="bower_components/requirejs/require.js" data-main="scripts/app/main"></script>',
  '<?php endif; ?>',
];

// Used to setup documentation on remote server after a release
gulp.task('readyDocServ', function(callback) {
  return gulp.src('docs/index.html')
    .pipe( replace('layout narrow', '<?=\'layout \'.(isset($isMobile) ? \'mobile\' : \'\')?>') )
    .pipe( replace('<script src="scripts/build/main.js"></script>', dynamicAppScriptBlock.join('\n')) )
    .pipe( replace('<!--FOOTWORK_CONTENT-->', '<?php App::loadView( isset( $bodyView ) ? $bodyView : DEFAULT_BODY_VIEW ); ?>') )
    .pipe( replace('<base href="">', '<base href="/">') )
    .pipe( replace('<!-- current build info -->', '<?php if(isset($isMobile) && $isMobile === true) { ?><script>window.isMobile = true;</script><?php } ?>') )
    .pipe(gulp.dest('docs'));
});
