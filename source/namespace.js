var postal = require('../bower_components/postal.js/lib/postal');
var _ = require('./lodash');

var nsProto = require('./namespace-proto');

// Prepare an empty namespace stack.
// This is where footwork registers its current working namespace name. Each new namespace is
// 'unshifted' and 'shifted' as they are entered and exited, keeping the most current at
// index 0.
var namespaceStack = [];

// This counter is used when model options { autoIncrement: true } and more than one model
// having the same namespace is instantiated. This is used in the event you do not want
// multiple copies of the same model to share the same namespace (if they do share a
// namespace, they receive all of the same events/messages/commands/etc).
var namespaceNameCounter = {};

// Returns a normalized namespace name based off of 'name'. It will register the name counter
// if not present and increment it if it is, then return the name (with the counter appended
// if autoIncrement === true and the counter is > 0).
function indexedNamespaceName(name, autoIncrement) {
  if (_.isUndefined(namespaceNameCounter[name])) {
    namespaceNameCounter[name] = 0;
  } else {
    namespaceNameCounter[name]++;
  }
  return name + (autoIncrement === true ? namespaceNameCounter[name] : '');
}

// Duck type check for a namespace object
function isNamespace(thing) {
  return _.isObject(thing) && !!thing.__isNamespace;
}

// enterNamespaceName() adds a namespaceName onto the namespace stack at the current index,
// 'entering' into that namespace (it is now the current namespace).
// The namespace object returned from this method also has a pointer to its parent
function enterNamespaceName(namespaceName) {
  namespaceStack.unshift(namespaceName);
  return Namespace(currentNamespaceName());
}

// enterNamespace() uses a current namespace definition as the one to enter into.
function enterNamespace(ns) {
  namespaceStack.unshift(ns.getName());
  return ns;
}

// Called at the after a model constructor function is run. exitNamespace()
// will shift the current namespace off of the stack, 'exiting' to the
// next namespace in the stack
function exitNamespace() {
  namespaceStack.shift();
  return currentNamespace();
}

// Return the current namespace channel name.
function currentNamespaceName() {
  return namespaceStack[0];
};

// Return instance of the current namespace channel.
function currentNamespace() {
  return Namespace(currentNamespaceName());
};

// Creates and returns a new namespace instance
function Namespace(namespaceName, $parentNamespace) {
  if (!_.isUndefined($parentNamespace)) {
    if (_.isString($parentNamespace)) {
      namespaceName = $parentNamespace + '.' + namespaceName;
    } else if (!_.isUndefined($parentNamespace.channel)) {
      namespaceName = $parentNamespace.channel + '.' + namespaceName;
    }
  }
  var ns = postal.channel(namespaceName);

  var subscriptions = ns.subscriptions = [];
  ns._subscribe = ns.subscribe;
  ns.subscribe = function(topic, callback, context) {
    if (arguments.length > 2) {
      callback = callback.bind(context);
    }
    var subscription = ns._subscribe.call(ns, topic, callback);
    subscriptions.push(subscription);
    return subscription;
  };
  ns.unsubscribe = nsProto.unregisterNamespaceHandler;

  ns._publish = ns.publish;
  ns.publish = function(envelope, callback, context) {
    if(arguments.length > 2) {
      callback = callback.bind(context);
    }
    ns._publish.call(ns, envelope, callback);
  };

  ns.__isNamespace = true;
  ns.dispose = nsProto.disconnectNamespaceHandlers.bind(ns);

  ns.commandHandlers = [];
  ns.command = nsProto.sendCommandToNamespace.bind(ns);
  ns.command.handler = nsProto.registerNamespaceCommandHandler.bind(ns);
  ns.command.unregister = nsProto.unregisterNamespaceHandler;

  ns.requestHandlers = [];
  ns.request = nsProto.requestResponseFromNamespace.bind(ns);
  ns.request.handler = nsProto.registerNamespaceRequestHandler.bind(ns);
  ns.request.unregister = nsProto.unregisterNamespaceHandler;

  ns.eventHandlers = [];
  ns.event = ns.trigger = nsProto.triggerEventOnNamespace.bind(ns);
  ns.event.handler = nsProto.registerNamespaceEventHandler.bind(ns);
  ns.event.unregister = nsProto.unregisterNamespaceHandler;

  ns.getName = nsProto.getNamespaceName.bind(ns);
  ns.enter = function() {
    return enterNamespace(this);
  };
  ns.exit = function() {
    if (currentNamespaceName() === this.getName()) {
      return exitNamespace();
    }
  };

  return ns;
};

// mixin provided to viewModels which enables namespace capabilities including pub/sub, cqrs, etc
require('./entity-mixins').push({
  runBeforeInit: true,
  _preInit: function(options) {
    var $configParams = this.__private('configParams');
    var namespaceName = $configParams.namespace || $configParams.name || uniqueId('namespace');
    this.$namespace = enterNamespaceName(indexedNamespaceName(namespaceName, $configParams.autoIncrement));
    this.$rootNamespace = Namespace(namespaceName);
    this.$globalNamespace = Namespace();
  },
  mixin: {
    getNamespaceName: function() {
      return this.$namespace.getName();
    }
  },
  _postInit: function(options) {
    exitNamespace();
  }
});

module.exports = Namespace;
