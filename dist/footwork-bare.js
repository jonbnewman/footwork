/**
 * footwork.js - A solid footing for knockout applications.
 * Author: Jonathan Newman (http://staticty.pe)
 * Version: v0.2.0-bare
 * Url: http://footworkjs.com
 * License(s): MIT
 */

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
    // define our own root object to supply to the modules as an attachment point
var root = {};
  
// supply our root for modules that directly check for the window object
var window = root;

// hide requirejs from the modules (AMD environment)
var define = undefined;

// hide node.js or browserified from the modules (CommonJS environment)
var module = undefined,
    exports = undefined,
    global = undefined;
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
      /**
 * riveter - Mix-in, inheritance and constructor extend behavior for your JavaScript enjoyment.
 * © 2012 - Copyright appendTo, LLC 
 * Author(s): Jim Cowart, Nicholas Cloud, Doug Neiner
 * Version: v0.1.2
 * Url: https://github.com/a2labs/riveter
 * License(s): MIT, GPL
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        // Node, or CommonJS-Like environments
        module.exports = factory(require("lodash"));
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["lodash"], function (_) {
            return factory(_, root);
        });
    } else {
        // Browser globals
        root.riveter = factory(root._, root);
    }
}(this, function (_, global, undefined) {
    var slice = Array.prototype.slice;
    var riveter = function () {
        var args = slice.call(arguments, 0);
        while (args.length) {
            riveter.rivet(args.shift());
        }
    };
    riveter.rivet = function (fn) {
        if (!fn.hasOwnProperty("extend")) {
            fn.extend = function (props, ctorProps) {
                return riveter.extend(fn, props, ctorProps);
            };
        }
        if (!fn.hasOwnProperty("compose")) {
            fn.compose = function () {
                return riveter.compose.apply(this, [fn].concat(slice.call(arguments, 0)));
            };
        }
        if (!fn.hasOwnProperty("inherits")) {
            fn.inherits = function (parent, ctorProps) {
                riveter.inherits(fn, parent, ctorProps);
            };
        }
        if (!fn.hasOwnProperty("mixin")) {
            fn.mixin = function () {
                riveter.mixin.apply(this, ([fn].concat(slice.call(arguments, 0))));
            };
        }
    };
    riveter.inherits = function (child, parent, ctorProps) {
        var childProto;
        var TmpCtor = function () {};
        var Child = function () {
            parent.apply(this, arguments);
        };
        if (typeof child === "object") {
            if (child.hasOwnProperty("constructor")) {
                Child = child.constructor;
            }
            childProto = child;
        } else {
            Child = child;
            childProto = child.prototype;
        }
        riveter.rivet(Child);
        _.defaults(Child, parent, ctorProps);
        TmpCtor.prototype = parent.prototype;
        Child.prototype = new TmpCtor();
        _.extend(Child.prototype, childProto, {
            constructor: Child
        });
        Child.__super = parent;
        // Next line is all about Backbone compatibility
        Child.__super__ = parent.prototype;
        return Child;
    };
    riveter.extend = function (ctor, props, ctorProps) {
        return riveter.inherits(props, ctor, ctorProps);
    };
    riveter.compose = function () {
        var args = slice.call(arguments, 0);
        var ctor = args.shift();
        riveter.rivet(ctor);
        var mixin = _.reduce(args, function (memo, val) {
            if (val.hasOwnProperty("_preInit")) {
                memo.preInit.push(val._preInit);
            }
            if (val.hasOwnProperty("_postInit")) {
                memo.postInit.push(val._postInit);
            }
            val = val.mixin || val;
            memo.items.push(val);
            return memo;
        }, {
            items: [],
            preInit: [],
            postInit: []
        });
        var res = ctor.extend({
            constructor: function ( /* options */ ) {
                var args = slice.call(arguments, 0);
                _.each(mixin.preInit, function (initializer) {
                    initializer.apply(this, args);
                }, this);
                ctor.prototype.constructor.apply(this, args);
                _.each(mixin.postInit, function (initializer) {
                    initializer.apply(this, args);
                }, this);
            }
        });
        riveter.rivet(res);
        _.defaults(res.prototype, _.extend.apply(null, [{}].concat(mixin.items)));
        return res;
    };
    riveter.mixin = function () {
        var args = slice.call(arguments, 0);
        var ctor = args.shift();
        riveter.rivet(ctor);
        _.defaults(ctor.prototype, _.extend.apply(null, [{}].concat(args)));
    };
    return riveter;
}));
    }).call(root);

    if(typeof root.postal.preserve === 'undefined') {
      (function() {
        /**
 * postal.preserve - Add-on for postal.js that provides message durability features.
 * Author: Jim Cowart (http://freshbrewedcode.com/jimcowart)
 * Version: v0.1.0
 * Url: http://github.com/postaljs/postal.preserve
 * License(s): MIT
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        // Node, or CommonJS-Like environments
        module.exports = function (postal) {
            factory(require("lodash"), require("conduitjs"), postal, this);
        };
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["lodash", "conduitjs", "postal"], function (_, Conduit, postal) {
            return factory(_, Conduit, postal, root);
        });
    } else {
        // Browser globals
        root.postal = factory(root._, root.Conduit, root.postal, root);
    }
}(this, function (_, Conduit, postal, global, undefined) {
    var plugin = postal.preserve = {
        store: {},
        expiring: []
    };
    var system = postal.channel(postal.configuration.SYSTEM_CHANNEL);
    var dtSort = function (a, b) {
        return b.expires - a.expires;
    };
    var tap = postal.addWireTap(function (d, e) {
        var channel = e.channel;
        var topic = e.topic;
        if (e.headers && e.headers.preserve) {
            plugin.store[channel] = plugin.store[channel] || {};
            plugin.store[channel][topic] = plugin.store[channel][topic] || [];
            plugin.store[channel][topic].push(e);
            // a bit harder to read, but trying to make
            // traversing expired messages faster than
            // iterating the store object's multiple arrays
            if (e.headers.expires) {
                plugin.expiring.push({
                    expires: e.headers.expires,
                    purge: function () {
                        plugin.store[channel][topic] = _.without(plugin.store[channel][topic], e);
                        plugin.expiring = _.without(plugin.expiring, this);
                    }
                });
                plugin.expiring.sort(dtSort);
            }
        }
    });
    function purgeExpired() {
        var dt = new Date();
        var expired = _.filter(plugin.expiring, function (x) {
            return x.expires < dt;
        });
        while (expired.length) {
            expired.pop().purge();
        }
    }
    if (!postal.subscribe.after) {
        var orig = postal.subscribe;
        postal.subscribe = new Conduit.Sync({
            context: postal,
            target: orig
        });
    }
    postal.SubscriptionDefinition.prototype.enlistPreserved = function () {
        var channel = this.channel;
        var binding = this.topic;
        var self = this;
        purgeExpired(true);
        if (plugin.store[channel]) {
            _.each(plugin.store[channel], function (msgs, topic) {
                if (postal.configuration.resolver.compare(binding, topic)) {
                    _.each(msgs, function (env) {
                        self.callback.call(
                        self.context || (self.callback.context && self.callback.context()) || this, env.data, env);
                    });
                }
            });
        }
    };
    return postal;
}));
      }).call(root);
    }

    // list of dependencies to export from the library as .embed properties
    var embeddedDependencies = [ 'riveter' ];

    return (function footwork(embedded, windowObject, _, ko, postal, Apollo, riveter, reqwest) {
      // main.js
// -----------

// Record the footwork version as of this build.
ko._footworkVersion = '0.2.0';

// Expose any embedded dependencies
ko.embed = embedded;

// misc utility functions
var noop = function() { };

var isObservable = ko.isObservable;

var isPath = function(pathOrLocation) {
  return pathOrLocation.match(/\/$/i) !== null;
};

var isFunction = _.isFunction;
var isObject = _.isObject;
var isString = _.isString;
var isBoolean = _.isBoolean;
var isNumber = _.isNumber;
var isUndefined = _.isUndefined;
var isArray = _.isArray;
var isNull = _.isNull;

// Initialize the debugLevel observable, this controls
// what level of debug statements are logged to the console
// 0 === off
// 1 === errors / problems only
// 2 === notices (very noisy)
ko.debugLevel = ko.observable(1);

// Preserve the original applyBindings method for later use
var originalApplyBindings = ko.applyBindings;

// Override the original applyBindings method to provide and enable 'viewModel' life-cycle hooks/events.
var doNotSetContextOnRouter = false;
var setContextOnRouter = true;
var applyBindings = ko.applyBindings = function(viewModel, element, shouldSetContext) {
  originalApplyBindings(viewModel, element);
  shouldSetContext = isUndefined(shouldSetContext) === true ? setContextOnRouter : shouldSetContext;

  if( isViewModel(viewModel) === true ) {
    var $configParams = viewModel.__getConfigParams();
    
    if( isFunction($configParams.afterBinding) === true ) {
      $configParams.afterBinding.call(viewModel, element);
    }

    if( shouldSetContext === setContextOnRouter && isRouter( viewModel.$router ) === true ) {
      viewModel.$router.context( ko.contextFor(element) );
    }
    
    if( isUndefined(element) === false ) {
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        viewModel.__shutdown();
      });
    }
  }
};

// This stores the mixins which are automatically added to each viewModel
var viewModelMixins = [];

// namespace.js
// ------------------

// This counter is used when model options { autoIncrement: true } and more than one model
// having the same namespace is instantiated. This is used in the event you do not want
// multiple copies of the same model to share the same namespace (if they do share a
// namespace, they receive all of the same events/messages/commands/etc).
var namespaceNameCounter = {};

// Prepare an empty namespace stack.
// This is where footwork registers its current working namespace name. Each new namespace is
// 'unshifted' and 'shifted' as they are entered and exited, keeping the most current at
// index 0.
var namespaceStack = [];

// Returns a normalized namespace name based off of 'name'. It will register the name counter
// if not present and increment it if it is, then return the name (with the counter appended
// if autoIncrement === true and the counter is > 0).
function indexedNamespaceName(name, autoIncrement) {
  if(namespaceNameCounter[name] === undefined) {
    namespaceNameCounter[name] = 0;
  } else {
    namespaceNameCounter[name]++;
  }
  return name + (autoIncrement === true ? namespaceNameCounter[name] : '');
}

function createEnvelope(topic, data, expires) {
  var envelope = {
    topic: topic,
    data: data
  };

  if( isUndefined(expires) === false ) {
    envelope.headers = {
      preserve: true
    };
    if(expires instanceof Date) {
      envelope.expires = expires
    }
  }
  
  return envelope;
}

// Method used to trigger an event on a namespace
function triggerEventOnNamespace(eventKey, params, expires) {
  this.publish( createEnvelope('event.' + eventKey, params, expires) );
  return this;
}

// Method used to register an event handler on a namespace
function registerNamespaceEventHandler(eventKey, callback, context) {
  if( isUndefined(context) === false ) {
    callback = _.bind(callback, context);
  }

  var handlerSubscription = this.subscribe('event.' + eventKey, callback).enlistPreserved();
  this.commandHandlers.push(handlerSubscription);

  return handlerSubscription;
}

// Method used to unregister an event handler on a namespace
function unregisterNamespaceHandler(handlerSubscription) {
  handlerSubscription.unsubscribe();
  return this;
}

// Method used to send a command to a namespace
function sendCommandToNamespace(commandKey, params, expires) {
  this.publish( createEnvelope('command.' + commandKey, params, expires) );
  return this;
}

// Method used to register a command handler on a namespace
function registerNamespaceCommandHandler(requestKey, callback, context) {
  if( isUndefined(context) === false ) {
    callback = _.bind(callback, context);
  }

  var handlerSubscription = this.subscribe('command.' + requestKey, callback).enlistPreserved();
  this.commandHandlers.push(handlerSubscription);

  return handlerSubscription;
}

// Method used to issue a request for data from a namespace, returning the response (or undefined if no response)
// This method will return an array of responses if more than one is received.
function requestResponseFromNamespace(requestKey, params) {
  var response = undefined;
  var responseSubscription;

  responseSubscription = this.subscribe('request.' + requestKey + '.response', function(reqResponse) {
    if( isUndefined(response) === true ) {
      response = reqResponse;
    } else {
      if( isArray(response) === true ) {
        response.push(reqResponse);
      } else {
        response = [ response, reqResponse ];
      }
    }
  });

  this.publish( createEnvelope('request.' + requestKey, response) );
  responseSubscription.unsubscribe();

  return response;
}

// Method used to register a request handler on a namespace.
// Requests sent using the specified requestKey will be called and passed in any params specified, the return value is passed back to the issuer
function registerNamespaceRequestHandler(requestKey, callback, context) {
  if( isUndefined(context) === false ) {
    callback = _.bind(callback, context);
  }

  var requestHandler = _.bind(function(params) {
    var callbackResponse = callback(params);
    this.publish( createEnvelope('request.' + requestKey + '.response', callbackResponse) );
  }, this);

  var handlerSubscription = this.subscribe('request.' + requestKey, requestHandler);
  this.requestHandlers.push(handlerSubscription);

  return handlerSubscription;
}

// This effectively shuts down all requests, commands, and events by unsubscribing all handlers on a discreet namespace object
function disconnectNamespaceHandlers() {
  _.invoke(this.requestHandlers, 'unsubscribe');
  _.invoke(this.commandHandlers, 'unsubscribe');
  _.invoke(this.eventHandlers, 'unsubscribe');
  return this;
}

function onNamespaceTemplateBind(callback, context) {
  if( isUndefined(context) === false ) {
    callback = _.bind(callback, context);
  }
  var handlerSubscription = this.subscribe('__elementIsBound', callback);
  this.bindingHandlers.push(handlerSubscription);

  return handlerSubscription;
}

function getNamespaceName() {
  return this.channel;
}

// Creates and returns a new namespace instance
var makeNamespace = ko.namespace = function(namespaceName, $parentNamespace) {
  if( isUndefined($parentNamespace) === false ) {
    if( isString($parentNamespace) === true ) {
      namespaceName = $parentNamespace + '.' + namespaceName;
    } else if( isUndefined($parentNamespace.channel) === false ) {
      namespaceName = $parentNamespace.channel + '.' + namespaceName;
    }
  }
  var namespace = postal.channel(namespaceName);

  namespace.shutdown = _.bind( disconnectNamespaceHandlers, namespace );

  namespace.commandHandlers = [];
  namespace.command = _.bind( sendCommandToNamespace, namespace );
  namespace.command.handler = _.bind( registerNamespaceCommandHandler, namespace );
  namespace.command.handler.unregister = _.bind( unregisterNamespaceHandler, namespace );

  namespace.requestHandlers = [];
  namespace.request = _.bind( requestResponseFromNamespace, namespace );
  namespace.request.handler = _.bind( registerNamespaceRequestHandler, namespace );
  namespace.request.handler.unregister = _.bind( unregisterNamespaceHandler, namespace );

  namespace.eventHandlers = [];
  namespace.event = namespace.triggerEvent = _.bind( triggerEventOnNamespace, namespace );
  namespace.event.handler = _.bind( registerNamespaceEventHandler, namespace );
  namespace.event.handler.unregister = _.bind( unregisterNamespaceHandler, namespace );

  namespace.bindingHandlers = [];
  namespace.afterBinding = _.bind( onNamespaceTemplateBind, namespace );
  namespace.afterBinding.unregister = _.bind( unregisterNamespaceHandler, namespace );

  namespace.getName = _.bind( getNamespaceName, namespace );
  namespace.enter = function() {
    return enterNamespace( this );
  };
  namespace.exit = function() {
    if( currentNamespaceName() === this.getName() ) {
      return exitNamespace();
    } else if( ko.debugLevel() >= 2 ) {
      throw 'Attempted to exit namespace [' + this.getName() + '] when currently in namespace [' + currentNamespaceName() +  ']';
    }
  };

  return namespace;
};

// Duck type check for a namespace object
var isNamespace = ko.isNamespace = function(thing) {
  return isUndefined(thing) === false && isFunction(thing.subscribe) && isFunction(thing.publish) && isString(thing.channel) === true;
};

// Return the current namespace name.
var currentNamespaceName = ko.currentNamespaceName = function() {
  return namespaceStack[0];
};

// Return the current namespace channel.
var currentNamespace = ko.currentNamespace = function() {
  return makeNamespace( currentNamespaceName() );
};

// enterNamespaceName() adds a namespaceName onto the namespace stack at the current index, 
// 'entering' into that namespace (it is now the currentNamespace).
// The namespace object returned from this method also has a pointer to its parent
var enterNamespaceName = ko.enterNamespaceName = function(namespaceName) {
  var $parentNamespace = currentNamespace();
  namespaceStack.unshift( namespaceName );
  return makeNamespace( currentNamespaceName() );
};

// enterNamespace() uses a current namespace definition as the one to enter into.
var enterNamespace = ko.enterNamespace = function(namespace) {
  namespaceStack.unshift( namespace.getName() );
  return namespace;
};

// Called at the after a model constructor function is run. exitNamespace()
// will shift the current namespace off of the stack, 'exiting' to the
// next namespace in the stack
var exitNamespace = ko.exitNamespace = function() {
  namespaceStack.shift();
  return currentNamespace();
};

// mixin provided to viewModels which enables namespace capabilities including pub/sub, cqrs, etc
viewModelMixins.push({
  _preInit: function( options ) {
    var $configParams = this.__getConfigParams();
    this.$namespace = enterNamespaceName( indexedNamespaceName($configParams.componentNamespace || $configParams.namespace || $configParams.name || _.uniqueId('namespace'), $configParams.autoIncrement) );
    this.$globalNamespace = makeNamespace();
  },
  mixin: {
    getNamespaceName: function() {
      return this.$namespace.getName();
    }
  },
  _postInit: function( options ) {
    viewModels[ this.getNamespaceName() ] = this;
    exitNamespace();
  }
});
// broadcast-receive.js
// ----------------

//     this.myValue = ko.observable().receiveFrom('NamespaceName' / Namespace, 'varName');
ko.subscribable.fn.receiveFrom = function(namespace, variable) {
  var target = this;
  var observable = this;

  if( isNamespace(namespace) === false ) {
    if( isString(namespace) === true ) {
      namespace = makeNamespace( namespace );
    } else {
      throw 'Invalid namespace [' + typeof namespace + ']';
    }
  }

  observable = ko.computed({
    read: target,
    write: function( value ) {
      namespace.publish( 'change.' + variable, value );
    }
  });

  observable.refresh = function() {
    namespace.publish( 'refresh.' + variable );
    return this;
  };
  namespace.subscribe( variable, function( newValue ) {
    target( newValue );
  });

  observable.__isReceived = true;
  return observable.refresh();
};

//     this.myValue = ko.observable().broadcastAs('NameOfVar');
//     this.myValue = ko.observable().broadcastAs('NameOfVar', isWritable);
//     this.myValue = ko.observable().broadcastAs({ name: 'NameOfVar', writable: true });
//     this.myValue = ko.observable().broadcastAs({ name: 'NameOfVar', namespace: Namespace });
//     this.myValue = ko.observable().broadcastAs({ name: 'NameOfVar', namespace: 'NamespaceName' });
ko.subscribable.fn.broadcastAs = function(varName, option) {
  var observable = this;
  var namespace;

  if( isObject(varName) === true ) {
    option = varName;
  } else {
    if( isBoolean(option) === true ) {
      option = {
        name: varName,
        writable: option
      };
    } else if( isObject(option) === true ) {
      option = _.extend({
        name: varName
      }, option);
    } else {
      option = {
        name: varName
      };
    }
  }

  namespace = option.namespace || currentNamespace();
  if( isString(namespace) === true ) {
    namespace = makeNamespace(channel);
  }

  if( option.writable ) {
    namespace.subscribe( 'change.' + option.name, function( newValue ) {
      observable( newValue );
    });
  }

  observable.broadcast = function() {
    namespace.publish( option.name, observable() );
    return this;
  };
  namespace.subscribe( 'refresh.' + option.name, function() {
    namespace.publish( option.name, observable() );
  });
  observable.subscribe(function( newValue ) {
    namespace.publish( option.name, newValue );
  });

  observable.__isBroadcast = true;
  return observable.broadcast();
};
// router.js
// ------------------

/**
 * Example route:
 * {
 *   route: 'test/route(/:optional)',
 *   title: function() {
 *     return ko.request('nameSpace', 'broadcast:someVariable');
 *   },
 *   nav: true
 * }
 */

var routerDefaultConfig = {
  namespace: '$router',
  baseRoute: null,
  unknownRoute: null,
  activate: true,
  routes: []
};

// Regular expressions used to parse a uri
var optionalParam = /\((.*?)\)/g;
var namedParam = /(\(\?)?:\w+/g;
var splatParam = /\*\w*/g;
var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
var hashMatch = /(^\/#)/;
var routesAreCaseSensitive = false;

// Convert a route string to a regular expression which is then used to match a uri against it and determine whether that uri matches the described route as well as parse and retrieve its tokens
function routeStringToRegExp(routeString) {
  routeString = routeString.replace(escapeRegExp, "\\$&")
    .replace(optionalParam, "(?:$1)?")
    .replace(namedParam, function(match, optional) {
      return optional ? match : "([^\/]+)";
    })
    .replace(splatParam, "(.*?)");

  return new RegExp('^' + routeString + '$', routesAreCaseSensitive ? undefined : 'i');
}

function historyReady() {
  return _.has(History, 'Adapter');
}

function extractNavItems(routes) {
  routes = ( isArray(routes) ? routes : [routes] );
  return _.where(routes, { nav: true });
}

function hasNavItems(routes) {
  return extractNavItems( routes ).length > 0;
}

function isRouter(thing) {
  return isObject(thing) === true && thing.__isRouter === true;
}

// Recursive function which will locate the nearest $router from a given ko $context
// (travels up through $parentContext chain to find the router if not found on the
// immediate $context). Returns null if none is found.
function nearestParentRouter($context, level) {
  level = isUndefined(level) === true ? -1 : level;
  var $parentRouter = $nullRouter;
  if( isObject($context) === true ) {
    if( isObject($context.$data) === true && isRouter($context.$data.$router) === true ) {
      // found router in this context
      $parentRouter = $context.$data.$router;
    } else if( isObject($context.$parentContext) === true ) {
      // search through next parent up the chain
      $parentRouter = nearestParentRouter( $context.$parentContext );
    }
  }
  return $parentRouter;
}

var $routerOutlet = function(outletName, componentToDisplay, viewModelParameters ) {
  var outlets = this.outlets;

  outletName = ko.unwrap( outletName );

  if( isObservable(outlets[outletName]) === false ) {
    outlets[outletName] = ko.observable({
      name: 'empty',
      params: {}
    });
  }

  var currentOutletDef = outlets[outletName]();
  var valueMutated = false;

  if( isUndefined(componentToDisplay) === false ) {
    currentOutletDef.name = componentToDisplay;
    valueMutated = true;
  }
  if( isUndefined(viewModelParameters) === false ) {
    currentOutletDef.params = viewModelParameters;
    valueMutated = true;
  }
  if( valueMutated === true ) {
    outlets[outletName].valueHasMutated();
  }

  return outlets[outletName];
};

var $nullRouter = { getRoutePath: function() { return ''; } };
var Router = ko.router = function( routerConfig, $viewModel, $context ) {
  this.__isRouter = true;
  this.$viewModel = $viewModel;
  this.$parentRouter = $nullRouter;
  this.parentRoutePath = '';
  this.context = ko.observable();

  this.config = routerConfig = _.extend({}, routerDefaultConfig, routerConfig);
  var configBaseRoute = _.result(routerConfig, 'baseRoute');
  this.config.baseRoute = Router.baseRoute() + (configBaseRoute || '');

  this.$namespace = makeNamespace( routerConfig.namespace );
  this.$namespace.enter();

  this.historyIsEnabled = ko.observable(false).broadcastAs('historyIsEnabled');
  this.currentState = ko.observable('').broadcastAs('currentState');
  this.navModelUpdate = ko.observable();
  this.outlets = {};
  this.$outlet = _.bind( $routerOutlet, this );

  this.setRoutes( routerConfig.routes );

  if( routerConfig.activate === true ) {
    this.context.subscribe(function( $context ) {
      if( isObject($context) === true ) {
        this.activate( $context );
      }
    }, this);
  }
  this.context( $viewModel.$context || $context );

  this.$namespace.exit();
};
Router.baseRoute = ko.observable();
Router.baseRoute.subscribe(function(newBaseRoute) {
  if( windowObject.location.toString().indexOf(newBaseRoute) !== 0 ) {
    throw 'baseRoute [' + newBaseRoute + '] not found in URL.';
  }
});

Router.prototype.unknownRoute = function() {
  return ( isUndefined(this.config) === false ? _.result(this.config.unknownRoute) : undefined);
};

Router.prototype.setRoutes = function(route) {
  this.config.routes = [];
  this.addRoutes(route);
  return this;
};

Router.prototype.addRoutes = function(route) {
  route = isArray(route) ? route : [route];
  this.config.routes = this.config.routes.concat(route);

  if( hasNavItems(route) && isObservable(this.navigationModel) ) {
    this.navModelUpdate.notifySubscribers();
  }

  return this;
};

Router.prototype.activate = function($context, $parentRouter) {
  return this
    .setup( $context, $parentRouter )
    .stateChange();
};

Router.prototype.getRoutePath = function() {
  var routePath = this.parentRoutePath || '';

  return routePath + this.currentState();
};

Router.prototype.stateChange = noop;
Router.prototype.setup = function( $context, $parentRouter ) {
  $parentRouter = $parentRouter || $nullRouter;
  if( $parentRouter !== $nullRouter ) {
    this.$parentRouter = $parentRouter;
  } else if( isObject($context) === true ) {
    this.$parentRouter = $parentRouter = nearestParentRouter($context);
  }
  this.parentRoutePath = $parentRouter.getRoutePath();

  if(this.historyIsEnabled() !== true) {
    if( historyReady() === true ) {
      var $router = this;
      History.Adapter.bind( windowObject, 'statechange', this.stateChange = function(url) {
        var url = $router.normalizeURL.call($router, ( isString(url) === true ? url : History.getState().url ), $router.parentRoutePath);
        $router.currentState( url );

        // get and run the action for the specified route
        var Action = $router.getActionForURL(url);
        Action( $router.$viewModel, $router.$outlet );
        $router.currentRoute = Action.route;
        return $router;
      });
      this.historyIsEnabled(true);
    } else {
      this.historyIsEnabled(false);
    }
  }

  return this;
};

Router.prototype.shutdown = function() {
  delete this.stateChange;
};

// polyfill for missing window.location.origin
if( isString(windowObject.location.origin) === false ) {
  windowObject.location.origin = windowObject.location.protocol + "//" + windowObject.location.hostname + (windowObject.location.port ? ':' + windowObject.location.port: '');
}

Router.prototype.normalizeURL = function(url, cancelInitialPath) {
  var isRelative = (this.config.relativeToParent === false || this.$parentRouter !== $nullRouter);

  if( isRelative === true && url.indexOf(windowObject.location.origin) === 0 ) {
    url = url.substr(windowObject.location.origin.length);
  }

  if( isRelative === true && isNull(this.config.baseRoute) === false && url.indexOf(this.config.baseRoute) === 0 ) {
    url = url.substr(this.config.baseRoute.length);
    if(url.length > 1) {
      url = url.replace(hashMatch, '/');
    }
  }
  return url;
};

Router.prototype.getRouteFor = function(url) {
  var route = null;
  _.each(this.getRoutes(), function(routeDesc) {
    var routeString = routeDesc.route;
    var routeRegex = routeStringToRegExp(routeString);
    var routeParamValues = url.match(routeRegex);

    if(routeParamValues !== null) {
      var routeParams = _.map(routeString.match(namedParam), function(param) {
        return param.replace(':', '');
      });

      route = {
        controller: routeDesc.controller,
        title: routeDesc.title,
        url: routeParamValues[0],
        params: _.reduce(routeParams, function(parameters, parameterName, index) {
            parameters[parameterName] = routeParamValues[index + 1];
            return parameters;
          }, {})
      };
    }
  });
  return route;
};

Router.prototype.getActionForURL = function(url) {
  var Action = noop;
  var originalURL = url;
  var route = this.getRouteFor(url);
  var $router = this;

  if( isNull(route) === false ) {
    Action = function($viewModel, $outlet, params) {
      route.controller.call( $viewModel, $outlet, _.extend(route.params, params), route );
    };
    Action.route = route;
  }

  if(ko.debugLevel() >= 2 && Action === noop) {
    throw 'Could not locate associated action for ' + originalURL;
  }

  return Action;
};

Router.prototype.getRoutes = function() {
  return this.config.routes;
};

Router.prototype.enableSplatForCurrentRoute = function() {
  console.log(this.currentRoute);
};

Router.prototype.navigationModel = function(predicate) {
  if( isUndefined(this.navigationModel) === true ) {
    this.navigationModel = ko.computed(function() {
      this.navModelUpdate(); // dummy reference used to trigger updates
      return _.filter(
        extractNavItems(routes),
        (predicate || function() { return true; })
      );
    }, { navModelUpdate: this.navModelUpdate }).broadcastAs({ name: 'navigationModel', namespace: this.$namespace });
  }

  return this.navigationModel;
};

var defaultTitle = ko.observable('[No Title]');
ko.bindingHandlers.$route = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    ko.utils.registerEventHandler(element, 'click', function( event ) {
      var $myRouter = nearestParentRouter(bindingContext);
      var $nearestParentRouter = nearestParentRouter(bindingContext.$parentContext);
      var destinationURL = element.getAttribute('href');
      var title = element.getAttribute('data-title');

      if( isNull($nearestParentRouter) === false && $myRouter.config.relativeToParent === true ) {
        destinationURL = $nearestParentRouter.getRoutePath() + destinationURL;
      }

      History.pushState( null, title || defaultTitle(), destinationURL );
      event.stopPropagation();
      event.preventDefault();
    });
  }
};
// viewModel.js
// ------------------

// Duck type function for determining whether or not something is a footwork viewModel constructor function
function isViewModelCtor(thing) {
  return isFunction(thing) === true && thing.__isViewModelCtor === true;
}

// Duck type function for determining whether or not something is a footwork viewModel
function isViewModel(thing) {
  return isObject(thing) === true && thing.__isViewModel === true;
}

// Initialize the viewModels registry
var viewModels = {};

// Returns the number of created viewModels for each defined namespace
var viewModelCount = ko.viewModelCount = function() {
  var counts = _.reduce(namespaceNameCounter, function(viewModelCounts, viewModelCount, viewModelName) {
    viewModelCounts[viewModelName] = viewModelCount + 1;
    return viewModelCounts;
  }, {});
  counts.__total = _.reduce(_.values(counts), function(summation, num) {
    return summation + num;
  }, 0);
  return counts;
};

// Returns a reference to the specified viewModels.
// If no name is supplied, a reference to an array containing all model references is returned.
var getViewModels = ko.getViewModels = function(namespaceName) {
  if( isUndefined(namespaceName) === true ) {
    return viewModels;
  }
  return viewModels[namespaceName];
};

// Tell all viewModels to request the values which it listens for
var refreshModels = ko.refreshViewModels = function() {
  _.invoke(getViewModels(), 'refreshReceived');
};

var defaultViewModelConfigParams = {
  namespace: undefined,
  name: undefined,
  componentNamespace: undefined,
  autoIncrement: false,
  mixins: undefined,
  params: undefined,
  initialize: noop,
  afterInit: noop,
  afterBinding: noop,
  afterDispose: noop
};
var makeViewModel = ko.viewModel = function(configParams) {
  var ctor;
  var afterInit;

  configParams = configParams || {};
  if( isUndefined(configParams) === false ) {
    ctor = configParams.viewModel || configParams.initialize || noop;
    afterInit = configParams.afterInit || noop;
  }
  afterInit = { _postInit: afterInit };
  configParams = _.extend({}, defaultViewModelConfigParams, configParams);

  var originalAfterBinding = configParams.afterBinding;
  configParams.afterBinding = function() {
    originalAfterBinding.apply(this, arguments);
    configParams.afterBinding.wasCalled = true;
  };
  configParams.afterBinding.wasCalled = false;

  var initViewModelMixin = {
    _preInit: function( initParams ) {
      this.$params = configParams.params;
      if( isObject(configParams.router) === true ) {
        this.$router = new Router( configParams.router, this );
      }
      this.__isViewModel = true;
      this.__getConfigParams = function() {
        return configParams;
      };
      this.__getInitParams = function() {
        return initParams;
      };
      this.__shutdown = function() {
        if( isFunction(configParams.afterDispose) === true ) {
          configParams.afterDispose.call(this);
        }

        _.each(this, function( property ) {
          if( isNamespace(property) === true || isRouter(property) === true ) {
            property.shutdown();
          }
        });

        if( isFunction(configParams.afterBinding) === true ) {
          configParams.afterBinding.wasCalled = false;
        }
      };
    },
    _postInit: function() {
      this.$namespace.request.handler('__footwork_model_reference', function() {
        return this;
      });
    }
  };

  var composure = [ ctor, initViewModelMixin ].concat( viewModelMixins, afterInit );
  if( isUndefined(configParams.mixins) === false ) {
    composure = composure.concat(configParams.mixins);
  }

  var model = riveter.compose.apply( undefined, composure );
  model.__isViewModelCtor = true;
  model.__configParams = configParams;

  return model;
};

// Monkey patch enables the viewModel 'component' to initialize a model and bind to the html as intended
// TODO: Do this differently once this is resolved: https://github.com/knockout/knockout/issues/1463
var originalComponentInit = ko.bindingHandlers.component.init;
ko.bindingHandlers.component.init = function(element, valueAccessor, allBindings, viewModel, bindingContext) {
  if( isString(element.tagName) === true && element.tagName.toLowerCase() === 'viewmodel' ) {
    var values = valueAccessor();
    var name = element.getAttribute('name') || element.getAttribute('data-name');

    if( isUndefined(name) === false ) {
      var viewModelName = ko.unwrap(values.params.name);
      var resourceLocation = getResourceLocation( viewModelName ).viewModels;

      if( isFunction(require) === true && isFunction(require.defined) === true && require.defined(viewModelName) === true ) {
        // we have found a matching resource that is already cached by require, lets use it
        resourceLocation = viewModelName;
      }

      var bindViewModel = function(ViewModel) {
        var viewModelObj = ViewModel;
        if( isFunction(ViewModel) === true ) {
          viewModelObj = new ViewModel(values.params);
        } else {
          viewModelObj = ViewModel;
        }

        // binding the viewModelObj onto each child element is not ideal, need to do this differently
        // cannot get component.preprocess() method to work/be called for some reason
        _.each(element.children, function(child) {
          applyBindings(viewModelObj, child, doNotSetContextOnRouter);
        });

        // we told applyBindings not to specify a context on the viewModel.$router after binding because we are binding to each
        // sub-element and must specify the context as being the container element only once
        if( isRouter( viewModelObj.$router ) === true ) {
          viewModelObj.$router.context( ko.contextFor(element) );
        }
      };

      if( isString(resourceLocation) === true ) {
        if( isFunction(require) === true ) {
          if( isPath(resourceLocation) === true ) {
            resourceLocation = resourceLocation + name;
          }
          if( resourceLocation !== viewModelName && resourceLocation.match(/\.js$/) === null ) {
            resourceLocation = resourceLocation + resourceFileExtensions.viewModel;
          }

          require([ resourceLocation ], bindViewModel);
        } else {
          throw 'Uses require, but no AMD loader is present';
        }
      } else if( isFunction(resourceLocation) === true ) {
        bindViewModel( resourceLocation );
      } else if( isObject(resourceLocation) === true ) {
        if( isObject(resourceLocation.instance) === true ) {
          bindViewModel( resourceLocation.instance );
        } else if( isFunction(resourceLocation.createViewModel) === true ) {
          bindViewModel( resourceLocation.createViewModel( values.params, { element: element } ) );
        }
      }
    }

    return { 'controlsDescendantBindings': true };
  }

  return originalComponentInit(element, valueAccessor, allBindings, viewModel, bindingContext);
};
// resource.js
// ------------------

var resourceFileExtensions = {
  combined: '.js',
  viewModel: '.js',
  template: '.html'
};

ko.components.setFileExtensions = function(fileType, extension) {
  if( isObject(fileType) === true ) {
    _.extend(resourceFileExtensions, fileType);
  } else if( isUndefined(resourceFileExtensions[fileType]) === false ) {
    resourceFileExtensions[fileType] = extension;
  }
};

ko.components.getFileExtensions = function() {
  return _.clone(resourceFileExtensions);
};

ko.components.getNormalTagList = function() {
  return normalTags.splice(0);
};

ko.components.getComponentNameForNode = function(node) {
  var tagName = node.tagName && node.tagName.toLowerCase();

  if( ko.components.isRegistered(tagName) || _.indexOf(normalTags, tagName) === -1 ) {
    return tagName;
  }
  return null;
};

var defaultResourceLocation = {
  combined: null,
  viewModels: '/viewModel/',
  templates: '/component/'
};
var resourceRelativeLocation = function(rootURL, returnTheValue) {
  var componentLocation = defaultResourceLocation;
  if(returnTheValue === true) {
    componentLocation = _.extend({}, defaultResourceLocation);
  }

  if( isObject(rootURL) === true ) {
    // assume some combination of defaultResourceLocation and normalize the parameters
    _.extend(componentLocation, _.reduce(rootURL, function(options, paramValue, paramName) {
      if(paramName === 'viewModel') {
        options.viewModels = paramValue;
        delete options.viewModel;
      } else if(paramName === 'template') {
        options.templates = paramValue;
        delete options.template;
      } else {
        options[paramName] = paramValue;
      }
      return options;
    }, {}));
  } else if( isString(rootURL) === true ) {
    componentLocation = {
      combined: rootURL,
      viewModels: null,
      templates: null
    };
  }

  if(returnTheValue === true) {
    return componentLocation;
  } else {
    defaultResourceLocation = componentLocation;
  }
};

var componentRelativeLocation = ko.components.loadRelativeTo = function(locations, returnTheValue) {
  var returnValue = resourceRelativeLocation(locations, returnTheValue);
  if(returnTheValue === true) {
    return returnValue;
  }
};

var resourceLocations = ko.resourceLocations = {};
var registerLocationOfComponent = ko.components.registerLocationOf = function(componentName, componentLocation) {
  if( isArray(componentName) === true ) {
    _.each(componentName, function(name) {
      registerLocationOfComponent(name, componentLocation);
    });
  }
  resourceLocations[ componentName ] = componentRelativeLocation(componentLocation, true);
};

var viewModelRelativeLocation = ko.viewModel.loadRelativeTo = function(rootURL, returnTheValue) {
  var returnValue = resourceRelativeLocation({ viewModel: rootURL }, returnTheValue);
  if(returnTheValue === true) {
    return returnValue;
  }
};

var registerLocationOfViewModel = ko.viewModel.registerLocationOf = function(viewModelName, viewModelLocation) {
  if( isArray(viewModelName) === true ) {
    _.each(viewModelName, function(name) {
      registerLocationOfViewModel(name, viewModelLocation);
    });
  }
  resourceLocations[ viewModelName ] = viewModelRelativeLocation(viewModelLocation, true);
};

// Return the resource definition for the supplied resourceName
var getResourceLocation = ko.getResourceLocation = function(resourceName) {
  return resourceLocations[resourceName] || defaultResourceLocation;
};
// component.js
// ------------------

var originalComponentRegisterFunc = ko.components.register;
var registerComponent = ko.components.register = function(componentName, options) {
  var viewModel = options.initialize || options.viewModel;
  
  if( isString(componentName) === false ) {
    throw 'Components must be provided a componentName.';
  }

  //TODO: determine how mixins from the (optionally) supplied footwork viewModel mix in with the mixins supplied directly in the component options
  //      as well as others like params, afterBinding. Currently we will just use the viewModel's mixins/etc, only the namespace is overridden
  //      from the component definition/configuration.
  if( isViewModelCtor(viewModel) ) {
    viewModel.__configParams['componentNamespace'] = componentName;
  } else if( isFunction(viewModel) === true ) {
    options.namespace = componentName;
    viewModel = makeViewModel(options);
  }

  originalComponentRegisterFunc(componentName, {
    viewModel: viewModel,
    template: options.template
  });
};

var makeComponent = ko.component = function(componentDefinition) {
  var viewModel = componentDefinition.viewModel;

  if( isFunction(viewModel) === true && isViewModelCtor(viewModel) === false ) {
    componentDefinition.viewModel = makeViewModel( _.omit(componentDefinition, 'template') );
  }

  return componentDefinition;
};

// These are tags which are ignored by the custom component loader
// Sourced from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element
var normalTags = [
  'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b', 'base', 'basefont', 'bdi', 'bgsound',
  'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup',
  'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element',
  'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frameset', 'g', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'isindex', 'kbd', 'keygen', 'label',
  'legend', 'li', 'link', 'listing', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'nobr',
  'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'polygon', 'path', 'pre',
  'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'shadow', 'small', 'source', 'spacer',
  'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'svg', 'table', 'tbody', 'td', 'template', 'textarea',
  'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr', 'xmp'
];
var tagIsComponent = ko.components.tagIsComponent = function(tagName, isComponent) {
  isComponent = ( isUndefined(isComponent) === true ? true : isComponent );

  if( isArray(tagName) === true ) {
    _.each(tagName, function(tag) {
      tagIsComponent(tag, isComponent);
    });
  }

  if(isComponent !== true) {
    if( _.contains(normalTags, tagName) === false ) {
      normalTags.push(tagName);
    }
  } else {
    normalTags = _.filter(normalTags, function(normalTagName) {
      return normalTagName !== tagName;
    });
  }
};

function componentTriggerAfterBinding(element, viewModel) {
  if( isViewModel(viewModel) === true ) {
    var configParams = viewModel.__getConfigParams();
    if( isFunction(configParams.afterBinding) === true && configParams.afterBinding.wasCalled === false ) {
      configParams.afterBinding.call(viewModel, element);
    }
  }
}

// Use the $compLifeCycle wrapper binding to provide lifecycle events for components
ko.virtualElements.allowedBindings.$compLifeCycle = true;
ko.bindingHandlers.$compLifeCycle = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
      if( isViewModel(viewModel) === true ) {
        viewModel.__shutdown();
      }
    });
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    if( isViewModel(viewModel) === true ) {
      componentTriggerAfterBinding(element, viewModel);
    }

    var child = ko.virtualElements.firstChild(element);
    if( isUndefined(child) === false ) {
      viewModel = ko.dataFor( child );
      componentTriggerAfterBinding(element, viewModel);
    }
  }
};

// Components which footwork will not wrap in the $compLifeCycle custom binding used for lifecycle events
// Used to keep the wrapper off of internal/natively handled and defined components such as 'outlet'
var nativeComponents = [
  'outlet'
];

// Custom loader used to wrap components with the $compLifeCycle custom binding
var componentWrapperTemplate = '<!-- ko $compLifeCycle -->COMPONENT_MARKUP<!-- /ko -->';
ko.components.loaders.unshift( ko.components.componentWrapper = {
  loadTemplate: function(componentName, config, callback) {
    if( nativeComponents.indexOf(componentName) === -1 ) {
      // TODO: Handle different types of configs
      if( isString(config) === true ) {
        config = componentWrapperTemplate.replace(/COMPONENT_MARKUP/, config);
      } else {
        throw 'Unhandled config type ' + typeof config + '.';
      }
    }
    ko.components.defaultLoader.loadTemplate(componentName, config, callback);
  },
  loadViewModel: function(componentName, config, callback) {
    var ViewModel = config.viewModel || config;
    if( nativeComponents.indexOf(componentName) === -1 ) {
      callback(function(params, componentInfo) {
        var element = componentInfo.element;
        var $context = ko.contextFor(element);

        if( isViewModelCtor(ViewModel) === true ) {
          // inject the context into the ViewModel contructor
          ViewModel = ViewModel.compose({
            _preInit: function() {
              this.$context = $context;
            }
          });
        }
        return new ViewModel(params);
      });
    } else {
      ko.components.defaultLoader.loadViewModel(componentName, config, callback);
    }
  }
});

// The footwork getConfig loader is a catch-all in the instance a registered component cannot be found.
// The loader will attempt to use requirejs via knockouts integrated support if it is available.
ko.components.loaders.push( ko.components.requireLoader = {
  getConfig: function(componentName, callback) {
    var combinedFile = componentName + resourceFileExtensions.combined;
    var viewModelFile = componentName + resourceFileExtensions.viewModel;
    var templateFile = componentName + resourceFileExtensions.template;
    var componentLocation = getResourceLocation(componentName);
    var configOptions = null;
    var viewModelPath;
    var templatePath;
    var combinedPath;

    if( isFunction(require) === true ) {
      // load component using knockouts native support for requirejs
      if( require.defined(componentName) === true ) {
        // component already cached, lets use it
        configOptions = {
          require: componentName
        };
      } else if( isString(componentLocation.combined) === true ) {
        combinedPath = componentLocation.combined;

        if( isPath(combinedPath) === true ) {
          combinedPath = combinedPath + combinedFile;
        }

        configOptions = {
          require: combinedPath
        };
      } else {
        viewModelPath = componentLocation.viewModels;
        templatePath = 'text!' + componentLocation.templates;

        if( isPath(viewModelPath) === true ) {
          viewModelPath = viewModelPath + viewModelFile;
        }
        if( isPath(templatePath) === true ) {
          templatePath = templatePath + templateFile;
        }
        
        configOptions = {
          viewModel: { require: viewModelPath },
          template: { require: templatePath }
        };
      }
    }

    callback(configOptions);
  }
});

var noParentViewModelError = { getNamespaceName: function() { return 'NO-VIEWMODEL-IN-CONTEXT'; } };
ko.virtualElements.allowedBindings.$outletBind = true;
ko.bindingHandlers.$outletBind = {
  init: function(element, valueAccessor, allBindings, outletViewModel, bindingContext) {
    var $parentViewModel = ( isObject(bindingContext) === true ? (bindingContext.$parent || noParentViewModelError) : noParentViewModelError);
    var $parentRouter = nearestParentRouter(bindingContext);
    var outletName = outletViewModel.outletName;

    if( isRouter($parentRouter) ) {
      // register this outlet with the router so that updates will propagate correctly
      // take the observable returned and define it on the outletViewModel so that outlet route changes are reflected in the view
      outletViewModel.$outletRoute = $parentRouter.$outlet( outletName );
    } else {
      throw 'Outlet [' + outletName + '] defined inside of viewModel [' + $parentViewModel.getNamespaceName() + '] but no router was defined.';
    }
  }
};

ko.components.register('outlet', {
  autoIncrement: true,
  viewModel: function(params) {
    this.outletName = ko.unwrap(params.name);
  },
  template: '<!-- ko $outletBind, component: $outletRoute --><!-- /ko -->'
});

ko.components.register('empty', {
  viewModel: function(params) {},
  template: '<div class="empty component"></div>'
});

ko.components.register('error', {
  viewModel: function(params) {
    this.message = ko.observable(params.message);
    this.errors = params.errors;
  },
  template: '\
    <div class="component error" data-bind="foreach: errors">\
      <div class="error">\
        <span class="number" data-bind="text: $index() + 1"></span>\
        <span class="message" data-bind="text: $data"></span>\
      </div>\
    </div>'
});
// bindingHandlers.js
// ------------------

ko.bindingHandlers.registerElement = {
  preprocess: function (value, name, addBindingCallback) {
    return '\'' + value + '\'';
  },
  init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    var elOption = ko.unwrap(valueAccessor()),
      refresh,
      defaultOptions = {
        name: element.getAttribute('id') || element.getAttribute('name'),
        context: 'relative'
      };

    if ( isString(elOption) === true ) {
      elOption = _.extend(defaultOptions, { name: elOption });
    } else if ( isObject(elOption) === true ) {
      elOption = _.extend(defaultOptions, elOption);
    }

    if ( isObject(viewModel.el) === false ) {
      viewModel.el = {};
    }

    viewModel.el[ elOption.name ] = element;
  }
};

/**
 * Source: https://github.com/SteveSanderson/knockout/wiki/Bindings---class
 */
ko.bindingHandlers['class'] = {
  'update': function( element, valueAccessor ) {
    if( element['__ko__previousClassValue__'] ) {
      Apollo.removeClass(element, element['__ko__previousClassValue__']);
    }
    var value = ko.utils.unwrapObservable(valueAccessor());
    value !== undefined && Apollo.addClass(element, value);
    element['__ko__previousClassValue__'] = value;
  }
};

ko.bindingHandlers['stopBinding'] = {
  init: function() {
    return { controlsDescendantBindings: true };
  }
};
// extenders.js
// ----------------

// custom throttle() based on ko v3.0.0 throttle(), allows value to be force()'d to a value at any time
ko.extenders.throttle = function(target, opt) {
  if( isNumber(opt) === true ) {
    opt = {
      timeout: opt,
      when: function() { return true; } // default always throttle
    };
  }

  target.throttleEvaluation = opt.timeout;

  var writeTimeoutInstance = null,
      throttledTarget = ko.dependentObservable({
          'read': target,
          'write': function(value) {
            if( opt.when(value) ) {
              clearTimeout(writeTimeoutInstance);
              writeTimeoutInstance = setTimeout(function() {
                target(value);
              }, opt.timeout);
            } else {
              clearTimeout(writeTimeoutInstance);
              target(value);
            }
          }
      });

  throttledTarget.force = function( value ) {
    clearTimeout(writeTimeoutInstance);
    target(value);
  };

  return throttledTarget;
};

ko.extenders.autoDisable = function( target, delay ) {
  return target.extend({
    delayTrigger: {
      delay: delay || 0,
      trigger: function( target ) { target( false ); }
    }
  });
};

ko.extenders.autoEnable = function( target, delay ) {
  return target.extend({
    delayTrigger: {
      delay: delay || 0,
      trigger: function( target ) { target( true ); }
    }
  });
};

ko.extenders.delayTrigger = function( target, options ) {
  var delay = 300,
      triggerFunc = noop,
      trigger;

  if( isObject(options) === true ) {
    delay = !isNaN( options.delay ) && parseInt( options.delay, 10 ) || delay;
    triggerFunc = options.trigger || triggerFunc;
  } else {
    delay = !isNaN( options ) && parseInt( options, 10 ) || delay;
  }

  var clearTrigger = function() {
    clearTimeout( trigger );
    trigger = undefined;
  };

  var delayedObservable = ko.computed({
    read: target,
    write: function( state ) {
      target( state );

      if( trigger !== undefined ) {
        clearTrigger();
      }

      trigger = setTimeout(function() {
        triggerFunc( target, options );
      }.bind(target), delayedObservable.triggerDelay);
    }
  });
  delayedObservable.clearTrigger = clearTrigger;
  delayedObservable.triggerDelay = delay;

  return delayedObservable;
};

ko.extenders.delayWrite = function( target, options ) {
  var filter, delay = 300;

  if( isObject(options) === true ) {
    delay = !isNaN( options.delay ) && parseInt( options.delay, 10 ) || delay;
    filter = options.filter || function() { return true; };
  } else {
    delay = !isNaN( options ) && parseInt( options, 10 ) || delay;
  }

  return ko.computed({
    read: target,
    write: function( writeValue ) {
      if( filter( writeValue ) ) {
        if(target._delayWriteTimer) {
          clearTimeout( this._delayWriteTimer );
        }
        target._delayWriteTimer = setTimeout(function() {
          target( writeValue );
        }, delay);
      } else {
        target( writeValue );
      }
    }
  });
};
      return ko;
    })( root._.pick(root, embeddedDependencies), windowObject, root._, root.ko, root.postal, root.Apollo, root.riveter, root.reqwest );
  })();
}));