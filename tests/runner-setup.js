/**
 * Helper which makes a new DOM node that we can use to put our test fixture into. Once created it is inserted into the DOM and returned.
 * @param  {mixed} theFixture The fixture
 * @return {DOMNode}          The generated DOM node container
 */
function makeTestContainer(theFixture, containerDOM) {
  var $container = $(containerDOM || '<div/>');

  $container.append(theFixture);
  $(document.body).append($container);

  return $container.get(0);
}

var currentCallbackOrderIndex = 0;
var noop = function() {};
function ensureCallOrder(orderValue, callback) {
  callback = callback || noop;
  return function() {
    if(Object.prototype.toString.call(orderValue) === '[object Array]') {
      expect(orderValue.shift()).toBe(currentCallbackOrderIndex, 'order of callbacks in array is incorrect');
    } else {
      expect(orderValue).toBe(currentCallbackOrderIndex, 'order of callbacks is incorrect');
    }
    currentCallbackOrderIndex++;
    return callback.apply(this, arguments);
  };
}
function resetCallbackOrder() {
  currentCallbackOrderIndex = 0;
}

var fw;
var $;
var _;
var containers = [];

var _fixtureCleanup = fixture.cleanup;
fixture.cleanup = function(container) {
  if(!fw) {
    containers.push(container);
  } else {
    typeof container === 'object' && fw.removeNode(container);
  }
  _fixtureCleanup.call(fixture);
};

require(['footwork', 'lodash', 'jquery', 'jquery-mockjax'], function(footwork, lodash, jQuery) {
  fw = footwork;
  $ = jQuery;
  _ = lodash;

  _.extend($.mockjaxSettings, {
    logging: false,
    responseTime: 5
  });

  if(containers.length) {
    var container;
    while(containers.length) {
      fixture.cleanup(containers.pop());
    }
  }
});
