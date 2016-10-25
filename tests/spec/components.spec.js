define(['footwork', 'lodash', 'jquery', 'tools', 'fetch-mock'],
  function(fw, _, $, tools, fetchMock) {
    describe('components', function() {
      beforeEach(tools.prepareTestEnv);
      afterEach(tools.cleanTestEnv);

      it('can register a component', function() {
        var namespaceName = tools.generateNamespaceName();
        var invalidNamespaceName = tools.generateNamespaceName();
        var viewModelSpy = jasmine.createSpy('viewModelSpy');

        fw.components.register(namespaceName, {
          template: '<div>a template</div>',
          viewModel: viewModelSpy
        });

        expect(fw.components.isRegistered(namespaceName)).toBe(true);
        expect(fw.components.isRegistered(invalidNamespaceName)).not.toBe(true);
        expect(viewModelSpy).not.toHaveBeenCalled();

        expect(fw.components.getFileName(namespaceName)).toBe(null);
      });

      it('can instantiate a registered component via a <declarative> statement', function(done) {
        var namespaceName = tools.generateNamespaceName();
        var initializeSpy;

        fw.components.register(namespaceName, {
          template: '<div>a template</div>',
          viewModel: tools.expectCallOrder(0, initializeSpy = jasmine.createSpy('initializeSpy', function() {
            fw.viewModel.boot(this);
          }).and.callThrough())
        });

        expect(initializeSpy).not.toHaveBeenCalled();

        fw.start(testContainer = tools.getFixtureContainer('<' + namespaceName + '></' + namespaceName + '>'));

        setTimeout(function() {
          expect(initializeSpy).toHaveBeenCalled();
          done();
        }, ajaxWait);
      });

      it('can instantiate a registered component via a <declarative> statement with a dataModel', function(done) {
        var namespaceName = tools.generateNamespaceName();
        var initializeSpy;

        fw.components.register(namespaceName, {
          template: '<div>a template</div>',
          viewModel: tools.expectCallOrder(0, initializeSpy = jasmine.createSpy('initializeSpy', function() {
            fw.viewModel.boot(this);
          }).and.callThrough())
        });

        expect(initializeSpy).not.toHaveBeenCalled();

        fw.start(testContainer = tools.getFixtureContainer('<' + namespaceName + '></' + namespaceName + '>'));

        setTimeout(function() {
          expect(initializeSpy).toHaveBeenCalled();
          done();
        }, ajaxWait);
      });

      it('can instantiate a registered component via a <declarative> statement with a router', function(done) {
        var namespaceName = tools.generateNamespaceName();
        var initializeSpy;

        fw.components.register(namespaceName, {
          template: '<div>a template</div>',
          viewModel: tools.expectCallOrder(0, initializeSpy = jasmine.createSpy('initializeSpy', function() {
            fw.viewModel.boot(this);
          }).and.callThrough())
        });

        expect(initializeSpy).not.toHaveBeenCalled();

        fw.start(testContainer = tools.getFixtureContainer('<' + namespaceName + '></' + namespaceName + '>'));

        setTimeout(function() {
          expect(initializeSpy).toHaveBeenCalled();
          done();
        }, ajaxWait);
      });

      it('calls the dispose() callback of a viewModel when the parent component is removed from the DOM', function(done) {
        var componentNamespaceName = tools.generateNamespaceName();
        var viewModelNamespaceName = tools.generateNamespaceName();
        var viewModelInitializeSpy;
        var componentInitializeSpy;
        var componentOnDisposeSpy;
        var containerViewModel;
        var valueToCheckFor = tools.randomString();

        fw.viewModel.register(viewModelNamespaceName, tools.expectCallOrder(0, viewModelInitializeSpy = jasmine.createSpy('viewModelInitializeSpy', function() {
          fw.viewModel.boot(this, {
            namespace: viewModelNamespaceName
          });
          this.show = fw.observable(true);
          containerViewModel = this;
        }).and.callThrough()));

        fw.components.register(componentNamespaceName, {
          template: '<span data-bind="text: someProperty"></span>',
          viewModel: tools.expectCallOrder(1, componentInitializeSpy = jasmine.createSpy('componentInitializeSpy', function() {
            fw.viewModel.boot(this, {
              namespace: componentNamespaceName,
              onDispose: tools.expectCallOrder(2, componentOnDisposeSpy = jasmine.createSpy('componentOnDisposeSpy', function(containingElement) {
                expect(containingElement.tagName).toBe(componentNamespaceName.toUpperCase());
              }).and.callThrough())
            });
            this.someProperty = valueToCheckFor;
          }).and.callThrough())
        });

        expect(viewModelInitializeSpy).not.toHaveBeenCalled();
        expect(componentInitializeSpy).not.toHaveBeenCalled();
        expect(componentOnDisposeSpy).toBe(undefined);

        fw.start(testContainer = tools.getFixtureContainer(
          '<viewModel module="' + viewModelNamespaceName + '">\
            <div class="content" data-bind="if: show">\
              <' + componentNamespaceName + '></' + componentNamespaceName + '>\
            </div>\
          </viewModel>'
        ));

        setTimeout(function() {
          expect(viewModelInitializeSpy).toHaveBeenCalled();
          expect(componentInitializeSpy).toHaveBeenCalled();
          expect($(testContainer).find('.content').text().indexOf(valueToCheckFor)).not.toBe(-1);

          containerViewModel.show(false);

          expect(componentOnDisposeSpy).toHaveBeenCalled();
          expect($(testContainer).find('.content').text().indexOf(valueToCheckFor)).toBe(-1);
          done();
        }, ajaxWait);
      });

      // it('has the animation classes applied properly', function(done) {
      //   var componentNamespaceName = tools.generateNamespaceName();
      //   var viewModelNamespaceName = tools.generateNamespaceName();
      //   var initializeSpy = jasmine.createSpy('initializeSpy');
      //   var afterRenderSpy;
      //   var theElement;

      //   fw.components.register(componentNamespaceName, {
      //     template: '<div>a template</div>',
      //     viewModel: fw.viewModel.create({
      //       initialize: tools.expectCallOrder(0, initializeSpy),
      //       afterRender: tools.expectCallOrder(1, afterRenderSpy = jasmine.createSpy('afterRenderSpy', function(element) {
      //         expect(theElement).not.toHaveClass(footworkAnimationClass);
      //         theElement = element;
      //       }).and.callThrough())
      //     })
      //   });

      //   expect(initializeSpy).not.toHaveBeenCalled();

      //   fw.start(testContainer = tools.getFixtureContainer('<' + componentNamespaceName + '></' + componentNamespaceName + '>'));

      //   expect(afterRenderSpy).not.toHaveBeenCalled();

      //   setTimeout(function() {
      //     expect(initializeSpy).toHaveBeenCalled();
      //     expect(theElement).not.toHaveClass(footworkAnimationClass);
      //     expect(afterRenderSpy).toHaveBeenCalled();

      //     setTimeout(function() {
      //       expect(theElement).toHaveClass(footworkAnimationClass);
      //       done();
      //     }, ajaxWait);
      //   }, 0);
      // });

      // it('can sequence animations', function(done) {
      //   var componentNamespaceName = tools.generateNamespaceName();
      //   var footworkAnimatedElements = '.' + footworkAnimationClass;

      //   fw.components.register(componentNamespaceName, {
      //     template: '<div class="fade-in-from-bottom">a template</div>',
      //     viewModel: fw.viewModel.create({
      //       namespace: componentNamespaceName,
      //       sequenceAnimations: 30
      //     })
      //   });

      //   testContainer = tools.getFixtureContainer('<div data-bind="foreach: things">\
      //     <' + componentNamespaceName + '></' + componentNamespaceName + '>\
      //   </div>');

      //   expect(testContainer).not.toContainElement(footworkAnimatedElements);

      //   fw.applyBindings({
      //     things: [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {} ]
      //   }, testContainer);

      //   setTimeout(function() {
      //     var $testContainer = $(testContainer);
      //     var currentThingLength = $testContainer.find(footworkAnimatedElements).length;

      //     expect(currentThingLength).toBeGreaterThan(0);

      //     setTimeout(function() {
      //       expect($testContainer.find(footworkAnimatedElements)).lengthToBeGreaterThan(currentThingLength);
      //       done();
      //     }, 120);
      //   }, 100);
      // });

      // it('can instantiate nested <components>', function(done) {
      //   var outerInitializeSpy = jasmine.createSpy('outerInitializeSpy');
      //   var innerInitializeSpy = jasmine.createSpy('innerInitializeSpy');
      //   var outerComponentNamespaceName = tools.generateNamespaceName();
      //   var innerComponentNamespaceName = tools.generateNamespaceName();

      //   fw.components.register(outerComponentNamespaceName, {
      //     template: '<' + innerComponentNamespaceName + '></' + innerComponentNamespaceName + '>',
      //     viewModel: fw.viewModel.create({
      //       initialize: tools.expectCallOrder(0, outerInitializeSpy)
      //     })
      //   });

      //   fw.components.register(innerComponentNamespaceName, {
      //     template: '<div class="' + innerComponentNamespaceName + '"></div>',
      //     viewModel: fw.viewModel.create({
      //       initialize: tools.expectCallOrder(1, innerInitializeSpy)
      //     })
      //   });

      //   expect(outerInitializeSpy).not.toHaveBeenCalled();
      //   expect(innerInitializeSpy).not.toHaveBeenCalled();

      //   fw.start(testContainer = tools.getFixtureContainer('<' + outerComponentNamespaceName + '></' + outerComponentNamespaceName + '>'));

      //   setTimeout(function() {
      //     expect(outerInitializeSpy).toHaveBeenCalled();
      //     expect(innerInitializeSpy).toHaveBeenCalled();

      //     done();
      //   }, ajaxWait);
      // });

      // it('can pass params to a component viewModel', function(done) {
      //   var componentNamespaceName = tools.generateNamespaceName();
      //   var initializeSpy;

      //   fw.components.register(componentNamespaceName, {
      //     template: '<div></div>',
      //     viewModel: fw.viewModel.create({
      //       initialize: tools.expectCallOrder(0, initializeSpy = jasmine.createSpy('initializeSpy', function(params) {
      //         expect(params).toEqual({ testValueOne: 1, testValueTwo: [1,2,3] });
      //       }))
      //     })
      //   });

      //   expect(initializeSpy).not.toHaveBeenCalled();

      //   fw.start(testContainer = tools.getFixtureContainer('<' + componentNamespaceName + ' params="testValueOne: 1, testValueTwo: [1,2,3]"></' + componentNamespaceName + '>'));

      //   setTimeout(function() {
      //     expect(initializeSpy).toHaveBeenCalled();
      //     done();
      //   }, ajaxWait);
      // });

      // it('can pass params to a \'default\' component viewModel', function(done) {
      //   var viewModelNamespaceName = tools.generateNamespaceName();
      //   var componentNamespaceName = tools.generateNamespaceName();
      //   var initializeSpy;
      //   var valueToFind = tools.randomString();

      //   fw.components.register(componentNamespaceName, {
      //     template: '<div class="passed-value" data-bind="text: someVariable"></div>'
      //   });

      //   fw.viewModel.register(viewModelNamespaceName, fw.viewModel.create({
      //     initialize: tools.expectCallOrder(0, initializeSpy = jasmine.createSpy('initializeSpy', function() {
      //       this.boundViewModel = {
      //         someVariable: valueToFind
      //       };
      //     }).and.callThrough())
      //   }));

      //   expect(initializeSpy).not.toHaveBeenCalled();

      //   fw.start(testContainer = tools.getFixtureContainer('<viewModel module="' + viewModelNamespaceName + '">\
      //     <div data-bind="with: boundViewModel">\
      //       <' + componentNamespaceName + ' params="$viewModel: $data"></' + componentNamespaceName + '>\
      //     </div>\
      //   </viewModel>'));

      //   setTimeout(function() {
      //     expect(initializeSpy).toHaveBeenCalled();
      //     expect(testContainer).toContainText(valueToFind);

      //     done();
      //   }, ajaxWait);
      // });

      // it('can set and return fileExtensions correctly', function() {
      //   var originalExtensions = fw.components.fileExtensions();
      //   var fileName = tools.randomString();
      //   var extensions = {
      //     combined: '.combinedTest',
      //     viewModel: '.viewModelTest',
      //     template: function() {
      //       return '.templateTest';
      //     }
      //   };

      //   expect(fw.components.fileExtensions()).not.toEqual(extensions);
      //   fw.components.fileExtensions(extensions);
      //   expect(fw.components.fileExtensions()).toEqual(extensions);
      //   expect(fw.components.getFileName(fileName, 'template')).toEqual(fileName + extensions.template());

      //   // reset extensions back to normal
      //   fw.components.fileExtensions(originalExtensions);
      //   expect(fw.components.fileExtensions()).not.toEqual(extensions);
      // });

      // it('can set fileExtensions via a callback', function() {
      //   var originalExtensions = fw.components.fileExtensions();

      //   function prependName(name, withName) {
      //     return _.reduce({
      //       combined: '.' + name + 'combinedTest',
      //       viewModel: '.' + name + 'viewModelTest',
      //       template: function() {
      //         return (withName ? name : '') + '.' + 'templateTest';
      //       }
      //     }, function(ext, extension, property) {
      //       ext[property] = _.isFunction(extension) ? extension() : (withName ? name : '');
      //       return ext;
      //     }, {});
      //   }

      //   var getFileExtensionsSpy = jasmine.createSpy('getFileExtensionsSpy', function getFileExtensions(componentName) {
      //     return prependName(componentName);
      //   }).and.callThrough();

      //   fw.components.fileExtensions(tools.expectCallOrder([0, 1, 2], getFileExtensionsSpy));

      //   var comp1Check = prependName('comp1', true);
      //   var comp2Check = prependName('comp2', true);

      //   expect(fw.components.getFileName('comp1', 'viewModel')).toEqual(comp1Check.viewModel);
      //   expect(fw.components.getFileName('comp2', 'viewModel')).toEqual(comp2Check.viewModel);
      //   expect(fw.components.getFileName('comp2', 'template')).toEqual(comp2Check.template);

      //   // reset extensions back to normal
      //   fw.components.fileExtensions(originalExtensions);
      //   expect(fw.components.fileExtensions()).toEqual(originalExtensions);
      // });

      // it('can specify a location and verify it', function() {
      //   var namespaceName = tools.generateNamespaceName();
      //   var location = {
      //     viewModel: 'tests/assets/fixtures/registeredComponentLocation/',
      //     template: 'tests/assets/fixtures/registeredComponentLocation/'
      //   };

      //   fw.components.registerLocation(namespaceName, location);
      //   fw.components.registerLocation(/^regexp-test.*$/, location);

      //   expect(fw.components.getLocation(namespaceName)).toEqual(location);
      //   expect(fw.components.getLocation('regexp-test-regexp')).toEqual(location);
      // });

      // it('can register an array of components to a location and retrieve them proplerly', function() {
      //   var location = {
      //     viewModel: 'tests/assets/fixtures/registeredComponentLocation/',
      //     template: 'tests/assets/fixtures/registeredComponentLocation/'
      //   };

      //   var namespaceNames = [tools.generateNamespaceName(), tools.generateNamespaceName(), tools.generateNamespaceName()];
      //   fw.components.registerLocation(namespaceNames, location);

      //   _.each(namespaceNames, function(namespaceName) {
      //     expect(fw.components.getLocation(namespaceName)).toEqual(location);
      //   });
      // });

      // it('can specify and load via a registered location', function(done) {
      //   var namespaceName = 'registered-component-location';

      //   fw.components.registerLocation('registered-component-location', {
      //     viewModel: 'tests/assets/fixtures/registeredComponentLocation/',
      //     template: 'tests/assets/fixtures/registeredComponentLocation/'
      //   });

      //   expect(namespaceName).not.toBeLoaded();

      //   fw.start(testContainer = tools.getFixtureContainer('<' + namespaceName + '></' + namespaceName + '>'));

      //   setTimeout(function() {
      //     expect(namespaceName).toBeLoaded();
      //     done();
      //   }, ajaxWait);
      // });

      // it('can specify and load via a registered location with a prefixed folder', function(done) {
      //   var namespaceName = 'registered-component-location-prefixed';

      //   fw.components.registerLocation(namespaceName, {
      //     viewModel: 'tests/assets/fixtures/',
      //     template: 'tests/assets/fixtures/'
      //   }, true);

      //   expect(namespaceName).not.toBeLoaded();

      //   fw.start(testContainer = tools.getFixtureContainer('<' + namespaceName + '></' + namespaceName + '>'));

      //   setTimeout(function() {
      //     expect(namespaceName).toBeLoaded();
      //     done();
      //   }, ajaxWait);
      // });

      // it('can specify and load via a registered RegExp-based location', function(done) {
      //   var namespaceName = 'registered-regexp-component-location';

      //   fw.components.registerLocation(/registered-regexp-comp.*/, {
      //     viewModel: 'tests/assets/fixtures/registeredRegExpComponentLocation/',
      //     template: 'tests/assets/fixtures/registeredRegExpComponentLocation/'
      //   });

      //   expect(namespaceName).not.toBeLoaded();

      //   fw.start(testContainer = tools.getFixtureContainer('<' + namespaceName + '></' + namespaceName + '>'));

      //   setTimeout(function() {
      //     expect(namespaceName).toBeLoaded();
      //     done();
      //   }, ajaxWait);
      // });

      // it('can specify and load via a registered location with full file name', function(done) {
      //   var namespaceName = 'registered-component-location-fullname';

      //   fw.components.registerLocation(namespaceName, {
      //     viewModel: 'tests/assets/fixtures/registeredComponentLocation/registeredComponentLocationFullname.js',
      //     template: 'tests/assets/fixtures/registeredComponentLocation/registeredComponentLocationFullname.html'
      //   });

      //   expect(namespaceName).not.toBeLoaded();

      //   fw.start(testContainer = tools.getFixtureContainer('<' + namespaceName + '></' + namespaceName + '>'));

      //   setTimeout(function() {
      //     expect(namespaceName).toBeLoaded();
      //     done();
      //   }, ajaxWait);
      // });

      // it('can specify and load via a registered location for a dataModel enabled component', function(done) {
      //   var namespaceName = 'registered-datamodel-component-location';

      //   fw.components.registerLocation(namespaceName, {
      //     dataModel: 'tests/assets/fixtures/registeredComponentLocation/',
      //     template: 'tests/assets/fixtures/registeredComponentLocation/'
      //   });

      //   expect(namespaceName).not.toBeLoaded();

      //   fw.start(testContainer = tools.getFixtureContainer('<' + namespaceName + '></' + namespaceName + '>'));

      //   setTimeout(function() {
      //     expect(namespaceName).toBeLoaded();
      //     done();
      //   }, ajaxWait);
      // });

      // it('can specify and load via a registered location for a router enabled component', function(done) {
      //   var namespaceName = 'registered-router-component-location';

      //   fw.components.registerLocation(namespaceName, {
      //     router: 'tests/assets/fixtures/registeredComponentLocation/',
      //     template: 'tests/assets/fixtures/registeredComponentLocation/'
      //   });

      //   expect(namespaceName).not.toBeLoaded();

      //   fw.start(testContainer = tools.getFixtureContainer('<' + namespaceName + '></' + namespaceName + '>'));

      //   setTimeout(function() {
      //     expect(namespaceName).toBeLoaded();
      //     done();
      //   }, ajaxWait);
      // });
    });
  }
);
