'use strict';

var sandbox = document.getElementById('sandbox');

describe('router', function () {
  it('has the ability to create a router', function() {
    var routerInitialized = false;

    expect(fw.router).to.be.a('function');

    var routerConstructor = fw.router({
      initialize: function() {
        routerInitialized = true;
      }
    });

    expect(routerConstructor).to.be.a('function');
    expect(new routerConstructor()).to.be.an('object');
  });

  it('has the ability to create a router with a correctly defined namespace whos name we can retrieve', function() {
    var Router = fw.router({
      namespace: 'RouterNamespaceCheck'
    });
    var router = new Router();

    expect(router.$router.$namespace).to.be.an('object');
    expect(router.$router.$namespace.getName()).to.be('RouterNamespaceCheck');
  });

  it('can register a router', function() {
    expect( fw.routers.isRegistered('registeredRouterCheck') ).to.be(false);

    fw.routers.register('registeredRouterCheck', function() {});

    expect( fw.routers.isRegistered('registeredRouterCheck') ).to.be(true);
  });

  it('can get a registered router', function() {
    expect( fw.routers.isRegistered('registeredRouterRetrieval') ).to.be(false);

    var RegisteredRouterRetrieval = function() {};

    fw.routers.register('registeredRouterRetrieval', RegisteredRouterRetrieval);

    expect( fw.routers.isRegistered('registeredRouterRetrieval') ).to.be(true);
    expect( fw.routers.getRegistered('registeredRouterRetrieval') ).to.be(RegisteredRouterRetrieval);
  });

  it('can autoRegister a router', function() {
    expect( fw.routers.isRegistered('autoRegisteredRouter') ).to.be(false);

    var autoRegisteredRouter = fw.router({
      namespace: 'autoRegisteredRouter',
      autoRegister: true
    });

    expect( fw.routers.isRegistered('autoRegisteredRouter') ).to.be(true);
    expect( fw.routers.getRegistered('autoRegisteredRouter') ).to.be(autoRegisteredRouter);
  });

  it('can get all instantiated routers', function() {
    var RouterA = fw.router({ namespace: 'RouterA' });
    var RouterB = fw.router({ namespace: 'RouterB' });

    var routers = [ new RouterA(), new RouterB() ];
    var routerList = _.keys( fw.routers.getAll() );

    expect( routerList ).to.contain('RouterA');
    expect( routerList ).to.contain('RouterB');
  });

  it('can get all instantiated routers of a specific namespace', function() {
    var routers = [];
    var Router = fw.router({ namespace: 'getAllSpecificRouter' });
    var numToMake = _.random(1,15);

    for(var x = numToMake; x; x--) {
      routers.push( new Router() );
    }

    expect( fw.routers.getAll('getAllSpecificRouter').filter(function(instance) {
      return instance.$namespace.getName() === 'getAllSpecificRouter';
    }).length ).to.be(numToMake);
  });

  it('can be instantiated with a list of routes', function() {
    var routesList = [ '/', '/route1', '/route2' ];

    var Router = fw.router({
      namespace: 'instantiatedListOfRoutes',
      routes: _.map(routesList, function(routePath) {
        return { route: routePath };
      })
    });

    var router = new Router();

    expect( _.reduce(router.$router.getRouteDescriptions(), function(routeDescriptions, routeDesc) {
      if( routesList.indexOf(routeDesc.route) !== -1 ) {
        routeDescriptions.push(routeDesc);
      }
      return routeDescriptions;
    }, []).length ).to.be( routesList.length );
  });

  it('can be instantiated declaratively from an autoRegistered router', function(done) {
    var container = document.getElementById('declarativeRouterInstantiation');
    var wasInitialized = false;

    fw.router({
      namespace: 'declarativeRouterInstantiation',
      autoRegister: true,
      initialize: function() {
        wasInitialized = true;
      }
    });

    expect(wasInitialized).to.be(false);

    fw.start(container);

    setTimeout(function() {
      expect(wasInitialized).to.be(true);
      done();
    }, 40);
  });

  it('can be nested and initialized declaratively', function(done) {
    var container = document.getElementById('declarativeNestedRouterInstantiation');
    var outerWasInitialized = false;
    var innerWasInitialized = false;

    fw.router({
      namespace: 'declarativeNestedRouterInstantiationOuter',
      autoRegister: true,
      initialize: function() {
        outerWasInitialized = true;
      }
    });

    fw.router({
      namespace: 'declarativeNestedRouterInstantiationInner',
      autoRegister: true,
      initialize: function() {
        innerWasInitialized = true;
      }
    });

    expect(outerWasInitialized).to.be(false);
    expect(innerWasInitialized).to.be(false);

    fw.start(container);

    setTimeout(function() {
      expect(outerWasInitialized).to.be(true);
      expect(innerWasInitialized).to.be(true);
      done();
    }, 40);
  });

  it('can trigger the default route', function(done) {
    var container = document.getElementById('defaultRouteCheck');
    var defaultRouteRan = false;

    fw.router({
      namespace: 'defaultRouteCheck',
      autoRegister: true,
      routes: [
        {
          route: '/',
          controller: function() {
            defaultRouteRan = true;
          }
        }
      ]
    });

    expect(defaultRouteRan).to.be(false);

    fw.start(container);

    setTimeout(function() {
      expect(defaultRouteRan).to.be(true);
      done();
    }, 40);
  });

  it('can trigger the unknownRoute', function(done) {
    var container = document.getElementById('unknownRouteCheck');
    var unknownRan = false;
    var router;

    fw.router({
      namespace: 'unknownRouteCheck',
      autoRegister: true,
      initialize: function() {
        router = this;
      },
      unknownRoute: {
        controller: function() {
          unknownRan = true;
        }
      }
    });

    expect(unknownRan).to.be(false);

    fw.start(container);

    setTimeout(function() {
      router.setState('/unknownRouteCheck');
      expect(unknownRan).to.be(true);
      done();
    }, 40);
  });

  it('can trigger a specified route', function(done) {
    var container = document.getElementById('specifiedRouteCheck');
    var specifiedRouteRan = false;
    var router;

    fw.router({
      namespace: 'specifiedRouteCheck',
      autoRegister: true,
      initialize: function() {
        router = this;
      },
      routes: [
        {
          route: '/specifiedRoute',
          controller: function() {
            specifiedRouteRan = true;
          }
        }
      ]
    });

    expect(specifiedRouteRan).to.be(false);

    fw.start(container);

    setTimeout(function() {
      router.setState('/specifiedRoute');
      expect(specifiedRouteRan).to.be(true);
      done();
    }, 40);
  });

  it('can trigger a specified route with a required parameter', function(done) {
    var container = document.getElementById('specifiedRouteWithReqParamCheck');
    var specifiedRouteRan = false;
    var testParam = 'luggageCode12345';
    var router;

    fw.router({
      namespace: 'specifiedRouteWithReqParamCheck',
      autoRegister: true,
      initialize: function() {
        router = this;
      },
      routes: [
        {
          route: '/specifiedRoute/:testParam',
          controller: function(params) {
            expect(params.testParam).to.be(testParam);
            specifiedRouteRan = true;
          }
        }
      ]
    });

    expect(specifiedRouteRan).to.be(false);

    fw.start(container);

    setTimeout(function() {
      router.setState('/specifiedRoute/' + testParam);
      expect(specifiedRouteRan).to.be(true);
      done();
    }, 40);
  });

  it('can trigger a specified route with an optional parameter with and without the parameter', function(done) {
    var container = document.getElementById('specifiedRouteWithOptParamCheck');
    var optParamNotSupplied = false;
    var optParamSupplied = false;
    var testParam = 'luggageCode12345';
    var router;

    fw.router({
      namespace: 'specifiedRouteWithOptParamCheck',
      autoRegister: true,
      initialize: function() {
        router = this;
      },
      routes: [
        {
          route: '/specifiedRoute/optParamNotSupplied(/:testParam)',
          controller: function(params) {
            expect(params.testParam).to.be(undefined);
            optParamNotSupplied = true;
          }
        }, {
          route: '/specifiedRoute/optParamSupplied(/:testParam)',
          controller: function(params) {
            expect(params.testParam).to.be(testParam);
            optParamSupplied = true;
          }
        }
      ]
    });

    expect(optParamNotSupplied).to.be(false);
    expect(optParamSupplied).to.be(false);

    fw.start(container);

    setTimeout(function() {
      router.setState('/specifiedRoute/optParamNotSupplied');
      router.setState('/specifiedRoute/optParamSupplied/' + testParam);
      expect(optParamNotSupplied).to.be(true);
      expect(optParamSupplied).to.be(true);
      done();
    }, 40);
  });

  it('can manipulate an outlet', function(done) {
    var container = document.getElementById('manipulateOutlet');
    var controllerRan = false;
    var componentInstantiated = false;
    var router;

    fw.components.register('manipulateOutletComponent', {
      viewModel: function() {
        componentInstantiated = true;
      },
      template: '<div></div>'
    });

    fw.router({
      namespace: 'manipulateOutlet',
      autoRegister: true,
      initialize: function() {
        router = this;
      },
      routes: [
        {
          route: '/manipulateOutlet',
          controller: function() {
            controllerRan = true;
            this.$outlet('output', 'manipulateOutletComponent');
          }
        }
      ]
    });

    expect(controllerRan).to.be(false);
    expect(componentInstantiated).to.be(false);

    fw.start(container);

    setTimeout(function() {
      router.setState('/manipulateOutlet');
      expect(controllerRan).to.be(true);

      setTimeout(function() {
        expect(componentInstantiated).to.be(true);
        done();
      }, 40);
    }, 40);
  });
});
