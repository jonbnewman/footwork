module.exports = function(config) {
  // Browsers to run on Sauce Labs
  var customLaunchers = {
    // OSX

	  // OS10.Firefox
    "OSX_FireFox_Latest": {
      browserName: "firefox",
      platform: "OS X 10.11",
      version: 'latest'
    },
    "OSX_FireFox_Latest_1": {
      browserName: "firefox",
      platform: "OS X 10.11",
      version: 'latest-1'
    },

	  // OS10.chrome
    "OSX_Chrome_Latest": {
      browserName: "chrome-1",
      platform: "OS X 10.11",
      version: 'latest'
    },
    "OSX_Chrome_Latest_1": {
      browserName: "chrome",
      platform: "OS X 10.11",
      version: 'latest-2'
    },

    // Windows

    // Windows.Firefox
    "SL_Windows_FireFox_Latest": {
      browserName: "firefox",
      platform: "Windows 10",
      version: 'latest'
    },
    "SL_Windows_FireFox_Latest_1": {
      browserName: "firefox",
      platform: "Windows 10",
      version: 'latest-1'
    },
    "SL_Windows_FireFox_Latest_2": {
      browserName: "firefox",
      platform: "Windows 10",
      version: 'latest-2'
    },

    // Windows.Chrome
    "Windows_Chrome_Latest": {
      browserName: "chrome",
      platform: "Windows 10",
      version: '52'
    },
    "Windows_Chrome_Latest_1": {
      browserName: "chrome",
      platform: "Windows 10",
      version: '51'
    },
    "Windows_Chrome_Latest_2": {
      browserName: "chrome",
      platform: "Windows 10",
      version: '50'
    },

    // Windows.Edge
    "SL_Edge": {
      browserName: "MicrosoftEdge",
      version: "11",
      platform: "Windows 10"
    },

    // Windows.IE
    "SL_InternetExplorer_9": {
      browserName: "internet explorer",
      version: "9",
      platform: "Windows 7"
    },
    "SL_InternetExplorer_10": {
      browserName: "internet explorer",
      version: "10",
      platform: "Windows 8"
    },
    "SL_InternetExplorer_11": {
      browserName: "internet explorer",
      version: "11",
      platform: "Windows 8.1"
    },

    // Linux

    // Linux.Firefox
    "SL_Linux_Firefox": {
      browserName: "firefox",
      platform: "Linux",
      version: 'latest'
    },

    // Linux.Opera
    "SL_Opera_Linux": {
      browserName: "opera",
      platform: "Linux",
      version: 'latest'
    }
  };

  Object.keys(customLaunchers).forEach(function(launcherName) {
    customLaunchers[launcherName]['base'] = 'SauceLabs';
    customLaunchers[launcherName]['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
    customLaunchers[launcherName]['build'] = process.env.TRAVIS_JOB_NUMBER;
  });

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine-jquery', 'requirejs', 'fixture', 'jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'tests/main.js',
      {pattern: 'tests/runner-setup.js', nocache: true},
      {pattern: 'tests/assets/customMatchers.js', nocache: true},
      {pattern: 'tests/spec/**/*.js', included: false},
      {pattern: 'tests/assets/**/*.+(html|json|jsonp|js)', nocache: true, included: false},
      {pattern: 'bower_components/lodash/*.js', watched: false, included: false},
      {pattern: 'bower_components/requirejs-text/*.js', watched: false, included: false},
      {pattern: 'bower_components/knockoutjs/dist/*.js', watched: false, included: false},
      {pattern: 'bower_components/postal.js/lib/*.js', watched: false, included: false},
      {pattern: 'bower_components/jquery-mockjax/dist/*.js', watched: false, included: false},
      {pattern: 'bower_components/jquery/dist/*.js', watched: false, included: false},
      {pattern: 'bower_components/reqwest/reqwest.js', watched: false, included: false},
      {pattern: 'build/*.js', included: false}
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'build/footwork-ci.js': 'coverage',
      'tests/assets/**/*.html': ['html2js'],
      'tests/assets/**/*.json': ['json_fixtures']
    },

    // used by the fixture framework
    jsonFixturesPreprocessor: {
      variableName: '__json__'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage', 'saucelabs'],

    coverageReporter: {
      dir : 'build/coverage/',
      reporters: [
        { type: 'html', subdir: 'report-html' },
        { type: 'lcov', subdir: 'report-lcov' }
      ]
    },


    // web server port
    port: 9876,


    sauceLabs: {
      testName: 'Footwork Unit Tests',
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      startConnect: false,
      verbose: true,
      verboseDebugging: false,
    },
    captureTimeout: 240000,
    browserNoActivityTimeout: 600000,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_WARN,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: Object.keys(customLaunchers),


    customLaunchers: customLaunchers,


    plugins: [
      'karma-sauce-launcher',
      'karma-coverage',
      'karma-html2js-preprocessor',
      'karma-jasmine',
      'karma-json-fixtures-preprocessor',
      'karma-fixture',
      'karma-jasmine-jquery',
      'karma-requirejs',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-spec-reporter'
    ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
