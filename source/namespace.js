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

function triggerEventOnNamespace(eventKey, params) {
  this.publish('event.' + eventKey, params);
  return this;
}

function registerNamespaceEventHandler(eventKey, callback) {
  var handlerSubscription = this.subscribe('event.' + eventKey, callback);
  this.commandHandlers.push(handlerSubscription);

  return handlerSubscription;
}

function unregisterNamespaceEventHandler(handlerSubscription) {
  handlerSubscription.unsubscribe();
  return this;
}

function sendCommandToNamespace(commandKey, params) {
  this.publish('command.' + commandKey, params);
  return this;
}

function registerNamespaceCommandHandler(requestKey, callback) {
  var handlerSubscription = this.subscribe('command.' + requestKey, callback);
  this.commandHandlers.push(handlerSubscription);

  return handlerSubscription;
}

function unregisterNamespaceCommandHandler(handlerSubscription) {
  handlerSubscription.unsubscribe();
  return this;
}

function requestResponseFromNamespace(requestKey, params) {
  var response;
  var subscription;

  subscription = this.subscribe('request.' + requestKey + '.response', function(reqResponse) {
    response = reqResponse;
  });
  this.publish('request.' + requestKey, params);
  subscription.unsubscribe();

  return response;
}

function registerNamespaceRequestHandler(requestKey, callback) {
  var handler = function(params) {
    var callbackResponse = callback(params);
    this.publish('request.' + requestKey + '.response', callbackResponse);
  };

  var handlerSubscription = this.subscribe('request.' + requestKey, _.bind(handler, this));
  this.requestHandlers.push(handlerSubscription);

  return handlerSubscription;
}

function unregisterNamespaceRequestHandler(handlerSubscription) {
  handlerSubscription.unsubscribe();
  return this;
}

function disconnectNamespaceHandlers() {
  _.invoke(this.requestHandlers, 'unsubscribe');
  _.invoke(this.commandHandlers, 'unsubscribe');
  _.invoke(this.eventHandlers, 'unsubscribe');
  return this;
}

// Creates and returns a new namespace instance
ko.namespace = function(namespaceName) {
  var namespace = postal.channel(namespaceName);

  namespace.shutdown = _.bind( disconnectNamespaceHandlers, namespace );

  namespace.commandHandlers = [];
  namespace.command = _.bind( sendCommandToNamespace, namespace );
  namespace.command.handler = _.bind( registerNamespaceCommandHandler, namespace );
  namespace.command.handler.unregister = _.bind( unregisterNamespaceCommandHandler, namespace );

  namespace.requestHandlers = [];
  namespace.request = _.bind( requestResponseFromNamespace, namespace );
  namespace.request.handler = _.bind( registerNamespaceRequestHandler, namespace );
  namespace.request.handler.unregister = _.bind( unregisterNamespaceRequestHandler, namespace );

  namespace.eventHandlers = [];
  namespace.event = namespace.triggerEvent = _.bind( triggerEventOnNamespace, namespace );
  namespace.event.handler = _.bind( registerNamespaceEventHandler, namespace );
  namespace.event.handler.unregister = _.bind( unregisterNamespaceEventHandler, namespace );

  return namespace;
};

// Duck type check for a namespace object
ko.isNamespace = function(thing) {
  return _.isFunction(thing.subscribe) && _.isFunction(thing.publish) && typeof thing.channel === 'string';
};

// Return the current namespace name.
ko.currentNamespaceName = function() {
  return namespaceStack[0];
};

// Return the current namespace channel.
ko.currentNamespace = function() {
  return ko.namespace(ko.currentNamespaceName());
};

// enterNamespaceName() adds a namespaceName onto the namespace stack at the current index, 
// 'entering' into that namespace (it is now the currentNamespace)
ko.enterNamespaceName = function(namespaceName) {
  namespaceStack.unshift( namespaceName );
  return ko.currentNamespace();
};

// Called at the after a model constructor function is run. exitNamespace()
// will shift the current namespace off of the stack, 'exiting' to the
// next namespace in the stack
ko.exitNamespace = function() {
  namespaceStack.shift();
  return ko.currentNamespace();
};

// mixin provided to models which enables namespace capabilities including pub/sub, cqrs, etc
modelMixins.push({
  _preInit: function( options ) {
    this._model.globalNamespace = ko.namespace();
    this._model.namespaceName = indexedNamespaceName(this._model.modelOptions.componentNamespace || this._model.modelOptions.namespace || _.uniqueId('namespace'), this._model.modelOptions.autoIncrement);

    ko.enterNamespaceName( this._model.namespaceName );
    this.namespace = ko.currentNamespace();
  },
  mixin: {
    getNamespaceName: function() {
      return this.namespace.channel;
    },
    broadcastAll: function() {
      var model = this;
      _.each( this, function(property, propName) {
        if( _.isObject(property) && property.__isBroadcast === true ) {
          model.namespace.publish( propName, property() );
        }
      });
      return this;
    },
    refreshReceived: function() {
      _.each( this, function(property, propName) {
        if( _.isObject(property) && property.__isReceived === true ) {
          property.refresh();
        }
      });
      return this;
    },
    startup: function() {
      this.refreshReceived().broadcastAll();
      return this;
    }
  },
  _postInit: function( options ) {
    models[ this.getNamespaceName() ] = this;
    ko.exitNamespace();

    this.startup();
    _.isFunction(this._model.modelOptions.afterCreating) && this._model.modelOptions.afterCreating.call(this);
  }
});