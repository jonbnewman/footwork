(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['lodash', 'knockout', 'postal', 'Apollo', 'reqwest'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('lodash'), require('knockout'), require('postal'), require('Apollo'), require('reqwest'));
  } else {
    root.ko = factory(_, ko, postal, Apollo, reqwest);
  }
}(this, function (_, ko, postal, Apollo, reqwest) {
  var windowObject = window;

  window.require = typeof require !== 'undefined' ? require : undefined;
  window.define = typeof define !== 'undefined' ? define : undefined;

  return (function() {
    //import("helpers/root-masks.js");
    _.extend(root, {
      _: _,
      ko: ko,
      postal: postal,
      Apollo: Apollo,
      reqwest: reqwest
    });

    /**
     * Riveter still embedded in 'bare' build as it is problematic when used as a module compared to the other dependencies. It depends on
     * underscore as opposed to lodash...meaning both lodash and underscore would be required if lodash was not substituted for underscore
     * in riveter.
     */
    (function() {
      //import("../../bower_components/riveter/lib/riveter.js");
    }).call(root);

    if(typeof root.postal.preserve === 'undefined') {
      (function() {
        //import("../../bower_components/postal.preserve/lib/postal.preserve.js");
      }).call(root);
    }

    // list of dependencies to export from the library as .embed properties
    var embeddedDependencies = [ 'riveter' ];

    return (function footwork(embedded, windowObject, _, ko, postal, Apollo, riveter, reqwest) {
      //import("../main.js");
      return ko;
    })( root._.pick(root, embeddedDependencies), windowObject, root._, root.ko, root.postal, root.Apollo, root.riveter, root.reqwest );
  })();
}));