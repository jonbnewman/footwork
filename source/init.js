var fw = require('../bower_components/knockoutjs/dist/knockout.js');

// Polyfill ES6 promises for IE9
require('es6-promise').polyfill();

// Record the footwork version as of this build.
fw.footworkVersion = 'FOOTWORK_VERSION';
