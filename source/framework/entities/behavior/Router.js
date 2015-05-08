// framework/entities/behavior/Router.js
// ------------------

function DefaultAction() {
  delete this.__currentRouteDescription;
  this.$outlet.reset();
}

function RoutedAction(routeDescription) {
  if( !isUndefined(routeDescription.title) ) {
    document.title = isFunction(routeDescription.title) ? routeDescription.title.call(this, routeDescription.namedParams, this.urlParts()) : routeDescription.title;
  }

  if( isUndefined(this.__currentRouteDescription) || !sameRouteDescription(this.__currentRouteDescription, routeDescription) ) {
    (routeDescription.controller || noop).apply( this, values(routeDescription.namedParams) );
    this.__currentRouteDescription = routeDescription;
  }
}

var routeEntityDesc;
runPostInit.push(function() {
  routeEntityDesc = entityDescriptors.getDescriptor('router');
});

var Router = function(descriptor, configParams) {
  return {
    _preInit: function( params ) {
      var subscriptions = this.__subscriptions = fw.observableArray();

      this.$id = fw.utils.guid();
      this.$namespace.command.handler('setState', this.setState, this);
      this.$namespace.request.handler('currentRoute', function() { return this.currentRoute(); }, this);
      this.$namespace.request.handler('urlParts', function() { return this.urlParts(); }, this);

      this.urlParts = fw.observable();
      this.childRouters = fw.observableArray();
      this.parentRouter = fw.observable($nullRouter);
      this.context = fw.observable();
      this.historyIsEnabled = fw.observable(false);
      this.disableHistory = fw.observable().receiveFrom(this.$globalNamespace, 'disableHistory');
      this.currentState = fw.observable('').broadcastAs('currentState');
      configParams.baseRoute = fw.routers.baseRoute() + (result(configParams, 'baseRoute') || '');

      this.isRelative = fw.computed(function() {
        return configParams.isRelative && !isNullRouter( this.parentRouter() );
      }, this);

      this.currentRoute = fw.computed(function() {
        return this.getRouteForURL( this.normalizeURL(this.currentState()) );
      }, this);

      this.path = fw.computed(function() {
        var currentRoute = this.currentRoute();
        var routeSegment = '/';

        if( isRoute(currentRoute) ) {
          routeSegment = (currentRoute.segment === '' ? '/' : currentRoute.segment);
        }

        return (this.isRelative() ? this.parentRouter().path() : '') + routeSegment;
      }, this);

      var parentPathSubscription;
      var $router = this;
      var $previousParent = $nullRouter;
      subscriptions.push(this.parentRouter.subscribe(function( $parentRouter ) {
        if( !isNullRouter($previousParent) && $previousParent !== $parentRouter ) {
          $previousParent.childRouters.remove(this);

          if(parentPathSubscription) {
            subscriptions.remove(parentPathSubscription);
            parentPathSubscription.dispose();
          }
          subscriptions.push(parentPathSubscription = $parentRouter.path.subscribe(function triggerRouteRecompute() {
            $router.currentState.notifySubscribers();
          }));
        }
        $parentRouter.childRouters.push(this);
        $previousParent = $parentRouter;
      }, this));

      // Automatically trigger the new Action() whenever the currentRoute() updates
      subscriptions.push( this.currentRoute.subscribe(function getActionForRouteAndTrigger( newRoute ) {
        if(this.currentState().length) {
          this.getActionForRoute( newRoute )( /* get and call the action for the newRoute */ );
        }
      }, this) );

      this.outlets = {};
      this.$outlet = $routerOutlet.bind(this);
      this.$outlet.reset = function() {
        each( this.outlets, function(outlet) {
          outlet({ name: noComponentSelected, params: {} });
        });
      }.bind(this);

      if( !isUndefined(configParams.unknownRoute) ) {
        if( isFunction(configParams.unknownRoute) ) {
          configParams.unknownRoute = { controller: configParams.unknownRoute };
        }
        configParams.routes.push( extend( configParams.unknownRoute, { unknown: true } ) );
      }
      this.setRoutes( configParams.routes );

      if( configParams.activate === true ) {
        subscriptions.push(this.context.subscribe(function activateRouterAfterNewContext( $context ) {
          if( isObject($context) ) {
            this.activate($context);
          }
        }, this));
      }

      this.$namespace.exit();
    },
    mixin: {
      setRoutes: function(routeDesc) {
        this.routeDescriptions = [];
        this.addRoutes(routeDesc);
        return this;
      },
      addRoutes: function(routeConfig) {
        this.routeDescriptions = this.routeDescriptions.concat( map(isArray(routeConfig) ? routeConfig : [routeConfig], transformRouteConfigToDesc) );
        return this;
      },
      activate: function($context, $parentRouter) {
        $context = $context || this.context();
        this.startup( $context, $parentRouter || nearestParentRouter($context) );
        if( this.currentState() === '' ) {
          this.setState();
        }
        return this;
      },
      setState: function(url) {
        if( this.historyIsEnabled() && !this.disableHistory() ) {
          if(isString(url)) {
            var historyAPIWorked = true;
            try {
              historyAPIWorked = History.pushState(null, '', this.__getConfigParams().baseRoute + this.parentRouter().path() + url.replace(startingHashRegex, '/'));
            } catch(historyException) {
              console.error(historyException);
              historyAPIWorked = false;
            } finally {
              if(historyAPIWorked) {
                return;
              }
            }
          } else if(isFunction(History.getState)) {
            this.currentState( this.normalizeURL( History.getState().url ) );
          }
        } else if(isString(url)) {
          this.currentState( this.normalizeURL( url ) );
        } else {
          this.currentState('/');
        }

        if(!historyIsReady()) {
          var routePath = this.path();
          each(this.childRouters(), function(childRouter) {
            childRouter.currentState(routePath);
          });
        }

        return this;
      },
      startup: function( $context, $parentRouter ) {
        $parentRouter = $parentRouter || $nullRouter;

        if( !isNullRouter($parentRouter) ) {
          this.parentRouter( $parentRouter );
        } else if( isObject($context) ) {
          $parentRouter = nearestParentRouter($context);
          if( $parentRouter.$id !== this.$id ) {
            this.parentRouter( $parentRouter );
          }
        }

        if( !this.historyIsEnabled() ) {
          if( historyIsReady() && !this.disableHistory() ) {
            History.Adapter.bind( windowObject, 'popstate', this.stateChangeHandler = function(event) {
              var url = '';
              if(!fw.routers.html5History() && windowObject.location.hash.length > 1) {
                url = windowObject.location.hash;
              } else {
                url = windowObject.location.pathname + windowObject.location.hash;
              }

              this.currentState( this.normalizeURL(url) );
            }.bind(this));
            this.historyIsEnabled(true);
          } else {
            this.historyIsEnabled(false);
          }
        }

        return this;
      },
      dispose: function() {
        var $parentRouter = this.parentRouter();
        if( !isNullRouter($parentRouter) ) {
          $parentRouter.childRouters.remove(this);
        }

        if( this.historyIsEnabled() && historyIsReady() ) {
          History.Adapter.unbind( this.stateChangeHandler );
        }

        this.$namespace.dispose();
        this.$globalNamespace.dispose();

        invoke(this.__subscriptions(), 'dispose');
        each(omit(this, function(property) {
          return isEntity(property);
        }), propertyDisposal);
      },
      normalizeURL: function(url) {
        var urlParts = parseUri(url);
        this.urlParts(urlParts);

        if(!fw.routers.html5History()) {
          if(url.indexOf('#') !== -1) {
            url = '/' + urlParts.anchor.replace(startingSlashRegex, '');
          } else if(this.currentState() !== url) {
            url = '/';
          }
        } else {
          url = urlParts.path;
        }

        return trimBaseRoute(this, url);
      },
      getUnknownRoute: function() {
        var unknownRoute = findWhere((this.getRouteDescriptions() || []).reverse(), { unknown: true }) || null;

        if( !isNull(unknownRoute) ) {
          unknownRoute = extend({}, baseRoute, {
            id: unknownRoute.id,
            controller: unknownRoute.controller,
            title: unknownRoute.title,
            segment: ''
          });
        }

        return unknownRoute;
      },
      getRouteForURL: function(url) {
        var route = null;
        var parentRoutePath = this.parentRouter().path() || '';
        var unknownRoute = this.getUnknownRoute();
        var $myRouter = this;

        // If this is a relative router we need to remove the leading parentRoutePath section of the URL
        if(this.isRelative() && parentRoutePath.length > 0 && (routeIndex = url.indexOf(parentRoutePath + '/')) === 0) {
          url = url.substr( parentRoutePath.length );
        }

        // find all routes with a matching routeString
        var matchedRoutes = reduce(this.getRouteDescriptions(), function(matches, routeDescription) {
          var routeString = routeDescription.route;
          var routeParams = [];

          if( isString(routeString) ) {
            routeParams = url.match(routeStringToRegExp(routeString));
            if( !isNull(routeParams) && routeDescription.filter.call($myRouter, routeParams, $myRouter.urlParts.peek()) ) {
              matches.push({
                routeString: routeString,
                specificity: routeString.replace(namedParamRegex, "*").length,
                routeDescription: routeDescription,
                routeParams: routeParams
              });
            }
          }
          return matches;
        }, []);

        // If there are matchedRoutes, find the one with the highest 'specificity' (longest normalized matching routeString)
        // and convert it into the actual route
        if(matchedRoutes.length) {
          var matchedRoute = reduce(matchedRoutes, function(matchedRoute, foundRoute) {
            if( isNull(matchedRoute) || foundRoute.specificity > matchedRoute.specificity ) {
              matchedRoute = foundRoute;
            }
            return matchedRoute;
          }, null);
          var routeDescription = matchedRoute.routeDescription;
          var routeString = matchedRoute.routeString;
          var routeParams = clone(matchedRoute.routeParams);
          var splatSegment = routeParams.pop() || '';
          var routeParamNames = map(routeString.match(namedParamRegex), function(param) {
            return param.replace(':', '');
          });
          var namedParams = reduce(routeParamNames, function(parameterNames, parameterName, index) {
            parameterNames[parameterName] = routeParams[index + 1];
            return parameterNames;
          }, {});

          route = extend({}, baseRoute, {
            id: routeDescription.id,
            controller: routeDescription.controller,
            title: routeDescription.title,
            url: url,
            segment: url.substr(0, url.length - splatSegment.length),
            indexedParams: routeParams,
            namedParams: namedParams
          });
        }

        return route || unknownRoute;
      },
      getActionForRoute: function(routeDescription) {
        var Action;

        if( isRoute(routeDescription) ) {
          Action = RoutedAction.bind(this, routeDescription);
        }

        return Action || DefaultAction.bind(this);
      },
      getRouteDescriptions: function() {
        return this.routeDescriptions;
      }
    },
    _postInit: function() {}
  };
};
