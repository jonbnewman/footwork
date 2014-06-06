(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'knockout'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('underscore'), require('knockout'));
  } else {
    root.ko = factory(_, ko);
  }
}(this, function (_, ko) {
  var modules = (function getModules() {
    var module = undefined;
    var exports = undefined;
    var define = undefined;
    var modules = {
      _: _,
      ko: ko
    };

    (function() {
      //import("../../bower_components/apollo/dist/apollo.js");
    }).call(modules);

    (function() {
      //import("../../bower_components/riveter/lib/riveter.js");
    }).call(modules);

    (function() {
      //import("../../bower_components/conduitjs/lib/conduit.js");
    }).call(modules);

    (function() {
      //import("../../bower_components/postal.js/lib/postal.js");
    }).call(modules);

    return modules;
  }());

  return (function (_, ko, riveter, postal, Apollo) {
    //import("../footwork.js");
  })(modules._, modules.ko, modules.riveter, modules.postal, modules.Apollo);
}));