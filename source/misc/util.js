var _ = require('./lodash');

function alwaysPassPredicate() {
  return true;
}

/**
 * Return the 'result' of a property on an object, either via calling it (using the supplied context and params) or the raw value if it is a non-function value.
 * Note: This is similar to underscore/lodash result() but allows you to provide the context and parameters to potential callbacks
 *
 * @param  {object} object  Object to read property from
 * @param  {string} path    Property name
 * @param  {mixed}  context Context to call the (if existant) function with
 * @param  {array}  params  Parameters to call the callback (object properties) with
 * @return {mixed}          The result of the property on the object
 */
function resultBound(object, path, context, params) {
  params = params || [];
  context = context || object;

  if(_.isFunction(object[path])) {
    return object[path].apply(context, params);
  }
  return object[path];
}

function isPromise(thing) {
  return _.isObject(thing) && _.isFunction(thing.then);
}

function promiseIsResolvedOrRejected(promise) {
  return !isPromise(promise) || _.includes(['resolved', 'rejected'], promise.state());
}

function hasClassName(element) {
  return _.isObject(element) && _.isString(element.className);
}

function hasClass(element, className) {
  return element.className.match( new RegExp('(\\s|^)' + className + '(\\s|$)') );
}

function addClass(element, className) {
  if(hasClassName(element) && !hasClass(element, className)) {
    element.className += (element.className.length && _.isNull(element.className.match(/ $/)) ? ' ' : '') + className;
  }
}

function removeClass(element, className) {
  if(hasClassName(element) && hasClass(element, className)) {
    var classNameRegex = new RegExp('(\\s|^)' + className + '(\\s|$)', 'g');
    element.className = element.className.replace(classNameRegex, ' ');
  }
}

function nextFrame(callback) {
  setTimeout(callback, 1000 / 30);
};

var trailingSlashRegex = /\/$/;
function isPath(pathOrFile) {
  return _.isString(pathOrFile) && trailingSlashRegex.test(pathOrFile);
}

var startingSlashRegex = /^\//;
function hasPathStart(path) {
  return _.isString(path) && startingSlashRegex.test(path);
}

var startingHashRegex = /^#/;
function hasHashStart(string) {
  return _.isString(string) && startingHashRegex.test(string);
}

/**
 * Creates or returns a promise based on the request specified in requestInfo.
 * This function also manages a requestRunning observable on the entity which indicates when the request finishes.
 * Note that there is an optional requestLull which will make the requestRunning observable stay 'true' for
 * atleast the specified duration. If multiple requests are in progress, then it will wait for all to finish.
 *
 * @param  {string} operationType The type of operation being made, used as key to cache running requests
 * @param  {object} requestInfo   Description of the request to make including a createRequest callback to make a new request
 * @return {Promise}              Ajax Promise
 */
function makeOrGetRequest(operationType, requestInfo) {
  var requestRunning = requestInfo.requestRunning;
  var requestLull = requestInfo.requestLull;
  var entity = requestInfo.entity;
  var createRequest = requestInfo.createRequest;
  var promiseName = operationType + 'Promise';
  var allowConcurrent = requestInfo.allowConcurrent;
  var requests = entity.__private(promiseName) || [];
  var theRequest = _.last(requests);

  if((allowConcurrent || !fw.isObservable(requestRunning) || !requestRunning()) || !requests.length) {
    theRequest = createRequest();

    if(!isPromise(theRequest) && _.isFunction(Deferred)) {
      // returned value from createRequest() is a value not a promise, lets return the value in a promise
      theRequest = Deferred().resolve(theRequest);

      // extract the promise from the generic (jQuery or D.js) deferred
      theRequest = _.isFunction(theRequest.promise) ? theRequest.promise() : theRequest.promise;
    }

    requests = requests || [];
    requests.push(theRequest);
    entity.__private(promiseName, requests);

    requestRunning(true);

    var lullFinished = fw.observable(false);
    var requestFinished = fw.observable(false);
    var requestWatcher = fw.computed(function() {
      if(lullFinished() && requestFinished()) {
        requestRunning(false);
        requestWatcher.dispose();
      }
    });

    requestLull = (_.isFunction(requestLull) ? requestLull(operationType) : requestLull);
    if(requestLull) {
      setTimeout(function() {
        lullFinished(true);
      }, requestLull);
    } else {
      lullFinished(true);
    }

    if(isPromise(theRequest)) {
      (theRequest.always || theRequest.ensure).call(theRequest, function() {
        if(_.every(requests, promiseIsResolvedOrRejected)) {
          requestFinished(true);
          entity.__private(promiseName, []);
        }
      });
    }
  }

  return theRequest;
}

/**
 * Return the trailing file extension from a given string.
 *
 * @param {string} fileName
 * @returns {string} The extension at the end of the file (ie: txt)
 */
function getFilenameExtension(fileName) {
  var extension = '';
  if(fileName.indexOf('.') !== -1) {
    extension = last(fileName.split('.'));
  }
  return extension;
}

module.exports = {
  alwaysPassPredicate: alwaysPassPredicate,
  resultBound: resultBound,
  isPromise: isPromise,
  promiseIsResolvedOrRejected: promiseIsResolvedOrRejected,
  addClass: addClass,
  removeClass: removeClass,
  nextFrame: nextFrame,
  isPath: isPath,
  hasPathStart: hasPathStart,
  hasHashStart: hasHashStart,
  makeOrGetRequest: makeOrGetRequest,
  getFilenameExtension: getFilenameExtension
};
