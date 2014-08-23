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
  routes = ( _.isArray(routes) ? routes : [routes] );
  return _.where(routes, { nav: true });
}

function hasNavItems(routes) {
  return extractNavItems( routes ).length > 0;
}

function isRouter(thing) {
  return _.isObject(thing) === true && thing.__isRouter === true;
}

// Recursive function which will locate the nearest $router from a given ko $context
// (travels up through $parentContext chain to find the router if not found on the
// immediate $context). Returns null if none is found.
function nearestParentRouter($context, level) {
  level = _.isUndefined(level) === true ? -1 : level;
  var $parentRouter = $nullRouter;
  if( _.isObject($context) === true ) {
    if( _.isObject($context.$data) === true && isRouter($context.$data.$router) === true ) {
      // found router in this context
      $parentRouter = $context.$data.$router;
    } else if( _.isObject($context.$parentContext) === true ) {
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

  if( _.isUndefined(componentToDisplay) === false ) {
    currentOutletDef.name = componentToDisplay;
    valueMutated = true;
  }
  if( _.isUndefined(viewModelParameters) === false ) {
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
      if( _.isObject($context) === true ) {
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
  return ( _.isUndefined(this.config) === false ? _.result(this.config.unknownRoute) : undefined);
};

Router.prototype.setRoutes = function(route) {
  this.config.routes = [];
  this.addRoutes(route);
  return this;
};

Router.prototype.addRoutes = function(route) {
  route = _.isArray(route) ? route : [route];
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
  } else if( _.isObject($context) === true ) {
    this.$parentRouter = $parentRouter = nearestParentRouter($context);
  }
  this.parentRoutePath = $parentRouter.getRoutePath();

  if(this.historyIsEnabled() !== true) {
    if( historyReady() === true ) {
      var $router = this;
      History.Adapter.bind( windowObject, 'statechange', this.stateChange = function(url) {
        var url = $router.normalizeURL.call($router, ( _.isString(url) === true ? url : History.getState().url ), $router.parentRoutePath);
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
if( _.isString(windowObject.location.origin) === false ) {
  windowObject.location.origin = windowObject.location.protocol + "//" + windowObject.location.hostname + (windowObject.location.port ? ':' + windowObject.location.port: '');
}

Router.prototype.normalizeURL = function(url, cancelInitialPath) {
  var isRelative = (this.config.relativeToParent === false || this.$parentRouter !== $nullRouter);

  if( isRelative === true && url.indexOf(windowObject.location.origin) === 0 ) {
    url = url.substr(windowObject.location.origin.length);
  }

  if( isRelative === true && _.isNull(this.config.baseRoute) === false && url.indexOf(this.config.baseRoute) === 0 ) {
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

  if( _.isNull(route) === false ) {
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
  if( _.isUndefined(this.navigationModel) === true ) {
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

      if( _.isNull($nearestParentRouter) === false && $myRouter.config.relativeToParent === true ) {
        destinationURL = $nearestParentRouter.getRoutePath() + destinationURL;
      }

      History.pushState( null, title || defaultTitle(), destinationURL );
      event.stopPropagation();
      event.preventDefault();
    });
  }
};