var fw = require('knockout/build/output/knockout-latest');
var _ = require('lodash');

var config = require('../misc/config');
var entityAnimateClass = config.entityAnimateClass;
var privateDataSymbol = config.privateDataSymbol;

var util = require('../misc/util');
var resultBound = util.resultBound;
var addClass = util.addClass;

var sequenceQueue = {};

/**
 * Clear (run all of) the animation sequence queues immediately.
 */
function clearSequenceQueue () {
  _.each(sequenceQueue, function (sequence, queueNamespace) {
    _.each(sequence, function (sequenceIteration) {
      sequenceIteration.addAnimationClass();
    });
    delete sequenceQueue[queueNamespace];
  });
}

/**
 * Run the specified queue if it is not already running.
 * This method takes a list of callbacks and runs each in sequence using the stored nextIteration as the next offset.
 *
 * @param {any} queue The queue to run
 * @param {any} runNextStepNow (used for recursion) this flag tells the method to run the next step in the queue
 */
function runAnimationSequenceQueue (queue, runNextStepNow) {
  if (_.isUndefined(queue.running) || queue.running === false || runNextStepNow) {
    var sequenceIteration = queue.shift();

    if (sequenceIteration) {
      sequenceIteration.addAnimationClass();

      if (sequenceIteration.nextIteration || queue.length) {
        queue.running = setTimeout(function () {
          runAnimationSequenceQueue(queue, true);
        }, sequenceIteration.nextIteration);
      } else {
        queue.running = false;
      }
    } else {
      queue.running = false;
    }
  }
}

/**
 * Add an element to be displayed into a queue. Either add to an existing one or insert into and return a new queue.
 * New queues are created based on the namespace of the viewModel and whether or not the viewModel is configured for/with a sequenceAnimations property
 *
 * @param {any} element The element that needs the animation class added
 * @param {any} viewModel The viewModel that contains a sequenceAnimations configuration option
 * @returns {object} queue The animation sequence queue
 */
function addToAndFetchQueue (element, viewModel) {
  var configParams = (viewModel[privateDataSymbol] || {}).configParams || {};
  var sequenceTimeout = resultBound(configParams, 'sequenceAnimations', viewModel) || 0;
  var namespaceName = configParams.namespace;
  var animationSequenceQueue = sequenceQueue[namespaceName] = (sequenceQueue[namespaceName] || []);
  var newSequenceIteration = {
    addAnimationClass: function addBindingFromQueue () {
      addClass(element, entityAnimateClass);
    },
    nextIteration: sequenceTimeout
  };

  fw.utils.domNodeDisposal.addDisposeCallback(element, function () {
    clearTimeout(newSequenceIteration.running);
    _.remove(animationSequenceQueue, newSequenceIteration);
  });

  animationSequenceQueue.push(newSequenceIteration);

  return animationSequenceQueue;
}

module.exports = {
  clearSequenceQueue: clearSequenceQueue,
  runAnimationSequenceQueue: runAnimationSequenceQueue,
  addToAndFetchQueue: addToAndFetchQueue
};
