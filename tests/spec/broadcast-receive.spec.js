define(['footwork', 'lodash', 'jquery', 'tools', 'jquery-mockjax'],
  function(fw, _, $, tools) {
    describe('broadcast-receive', function() {
      beforeEach(tools.prepareTestEnv);
      afterEach(tools.cleanTestEnv);

      it('has the ability to create model with a broadcastable', function() {
        var initializeSpy;

        var ModelA = fw.viewModel.create({
          initialize: tools.expectCallOrder(0, initializeSpy = jasmine.createSpy('initializeSpy', function() {
            this.broadcaster = fw.observable().broadcastAs('broadcaster');
          }).and.callThrough())
        });

        expect(initializeSpy).not.toHaveBeenCalled();
        var modelA = new ModelA();
        expect(initializeSpy).toHaveBeenCalled();

        expect(fw.isBroadcastable(modelA.broadcaster)).toBe(true);
      });

      it('has the ability to create model with a receivable', function() {
        var initializeSpy;

        var ModelA = fw.viewModel.create({
          initialize: tools.expectCallOrder(0, initializeSpy = jasmine.createSpy('initializeSpy', function() {
            this.receiver = fw.observable().receiveFrom('ModelA', 'broadcaster');
          }).and.callThrough())
        });

        expect(initializeSpy).not.toHaveBeenCalled();
        var modelA = new ModelA();
        expect(initializeSpy).toHaveBeenCalled();

        expect(fw.isReceivable(modelA.receiver)).toBe(true);
      });

      it('modelB receivable can receive data from the modelA broadcastable', function() {
        var modelAInitializeSpy;
        var modelBInitializeSpy;
        var modelANamespaceName = tools.generateNamespaceName();

        var ModelA = fw.viewModel.create({
          namespace: modelANamespaceName,
          initialize: tools.expectCallOrder(0, modelAInitializeSpy = jasmine.createSpy('modelAInitializeSpy', function() {
            this.broadcaster = fw.observable().broadcastAs('broadcaster');
          }).and.callThrough())
        });

        expect(modelAInitializeSpy).not.toHaveBeenCalled();
        var modelA = new ModelA();
        expect(modelAInitializeSpy).toHaveBeenCalled();

        var ModelB = fw.viewModel.create({
          initialize: tools.expectCallOrder(1, modelBInitializeSpy = jasmine.createSpy('modelBInitializeSpy', function() {
            this.receiver = fw.observable().receiveFrom(modelANamespaceName, 'broadcaster');
          }).and.callThrough())
        });

        expect(modelBInitializeSpy).not.toHaveBeenCalled();
        var modelB = new ModelB();
        expect(modelBInitializeSpy).toHaveBeenCalled();

        var testValue = tools.randomString();
        modelA.broadcaster(testValue);
        expect(modelB.receiver()).toBe(testValue);
      });

      it('can have receivable created with a passed in instantiated namespace', function() {
        var namespace = fw.namespace(tools.generateNamespaceName());

        var receivable = fw.observable(null).receiveFrom(namespace, 'broadcaster');
        expect(receivable()).toBe(null);

        var broadcastable = fw.observable(tools.randomString()).broadcastAs({ name: 'broadcaster', namespace: namespace });
        expect(receivable()).toBe(broadcastable());
      });

      it('can have standalone broadcastable created with alternative syntax', function() {
        var namespaceName = tools.generateNamespaceName();
        var receivable = fw.observable(null).receiveFrom(namespaceName, 'broadcaster');

        expect(receivable()).toBe(null);

        var broadcastable = fw.observable().broadcastAs({ name: 'broadcaster', namespace: namespaceName });
        expect(receivable()).toBe(broadcastable());

        var broadcastable = fw.observable().broadcastAs('broadcaster', namespaceName);
        expect(receivable()).toBe(broadcastable());
      });

      it('can have standalone broadcastable created with alternative syntax and a passed in instantiated namespace', function() {
        var namespaceName = tools.generateNamespaceName();
        var namespace = fw.namespace(namespaceName);
        var receivable = fw.observable(null).receiveFrom(namespaceName, 'broadcaster');

        expect(receivable()).toBe(null);

        var broadcastable = fw.observable(tools.randomString()).broadcastAs({ name: 'broadcaster', namespace: namespace });

        expect(receivable()).toBe(broadcastable());
      });

      it('modelB can write to a receivable and modelA sees the new data on a writable broadcastable', function() {
        var modelAInitializeSpy;
        var modelBInitializeSpy;
        var modelANamespaceName = tools.generateNamespaceName();

        var ModelA = fw.viewModel.create({
          namespace: modelANamespaceName,
          initialize: tools.expectCallOrder(0, modelAInitializeSpy = jasmine.createSpy('modelAInitializeSpy', function() {
            this.writableBroadcaster = fw.observable().broadcastAs('writableBroadcaster', true);
          }).and.callThrough())
        });

        expect(modelAInitializeSpy).not.toHaveBeenCalled();
        var modelA = new ModelA();
        expect(modelAInitializeSpy).toHaveBeenCalled();

        var ModelB = fw.viewModel.create({
          initialize: tools.expectCallOrder(1, modelBInitializeSpy = jasmine.createSpy('modelBInitializeSpy', function() {
            this.writableReceiver = fw.observable().receiveFrom(modelANamespaceName, 'writableBroadcaster', true);
          }).and.callThrough())
        });

        expect(modelBInitializeSpy).not.toHaveBeenCalled();
        var modelB = new ModelB();
        expect(modelBInitializeSpy).toHaveBeenCalled();

        var testValue = tools.randomString();
        modelB.writableReceiver(testValue);

        expect(modelA.writableBroadcaster()).toBe(testValue);
      });

      it('when modelB tries to write to receivable modelA does not see the data on a non-writable broadcastable and the receivable is not set to the new value', function() {
        var modelAInitializeSpy;
        var modelBInitializeSpy;
        var modelANamespaceName = tools.generateNamespaceName();

        var ModelA = fw.viewModel.create({
          namespace: modelANamespaceName,
          initialize: tools.expectCallOrder(0, modelAInitializeSpy = jasmine.createSpy('modelAInitializeSpy', function() {
            this.nonwritableBroadcaster = fw.observable().broadcastAs('nonwritableBroadcaster');
          }).and.callThrough())
        });

        expect(modelAInitializeSpy).not.toHaveBeenCalled();
        var modelA = new ModelA();
        expect(modelAInitializeSpy).toHaveBeenCalled();

        var ModelB = fw.viewModel.create({
          initialize: tools.expectCallOrder(1, modelBInitializeSpy = jasmine.createSpy('modelBInitializeSpy', function() {
            this.nonwritableReceiver = fw.observable().receiveFrom(modelANamespaceName, 'nonwritableBroadcaster', true);
          }).and.callThrough())
        });

        expect(modelBInitializeSpy).not.toHaveBeenCalled();
        var modelB = new ModelB();
        expect(modelBInitializeSpy).toHaveBeenCalled();

        var testValue = tools.randomString();
        modelB.nonwritableReceiver(testValue);
        expect(modelB.nonwritableReceiver()).not.toBe(testValue);
        expect(modelA.nonwritableBroadcaster()).not.toBe(testValue);
      });

      it('receivable with .when() specified writes when callback returns true', function() {
        var modelAInitializeSpy;
        var modelBInitializeSpy;
        var whenSpy;
        var modelANamespaceName = tools.generateNamespaceName();

        var ModelA = fw.viewModel.create({
          namespace: modelANamespaceName,
          initialize: tools.expectCallOrder(0, modelAInitializeSpy = jasmine.createSpy('modelAInitializeSpy', function() {
            this.broadcaster = fw.observable().broadcastAs('broadcasterToTestWhenCallback');
          }).and.callThrough())
        });

        expect(modelAInitializeSpy).not.toHaveBeenCalled();
        var modelA = new ModelA();
        expect(modelAInitializeSpy).toHaveBeenCalled();

        var ModelB = fw.viewModel.create({
          initialize: tools.expectCallOrder(1, modelBInitializeSpy = jasmine.createSpy('modelBInitializeSpy', function() {
            this.receiver = fw.observable().receiveFrom(modelANamespaceName, 'broadcasterToTestWhenCallback').when(tools.expectCallOrder(2, whenSpy = jasmine.createSpy('whenSpy', function() {
              return true;
            }).and.callThrough()));
          }).and.callThrough())
        });

        expect(modelBInitializeSpy).not.toHaveBeenCalled();
        var modelB = new ModelB();
        expect(whenSpy).not.toHaveBeenCalled();
        expect(modelBInitializeSpy).toHaveBeenCalled();

        var testValue = tools.randomString();
        modelA.broadcaster(testValue);
        expect(whenSpy).toHaveBeenCalled();
        expect(modelB.receiver()).toBe(testValue);
      });

      it('receivable with .when() specified does NOT write when callback returns false', function() {
        var modelAInitializeSpy;
        var modelBInitializeSpy;
        var whenSpy;
        var modelANamespaceName = tools.generateNamespaceName();
        var valuethatFailsWhenValidator = tools.randomString();

        var ModelA = fw.viewModel.create({
          namespace: modelANamespaceName,
          initialize: tools.expectCallOrder(0, modelAInitializeSpy = jasmine.createSpy('modelAInitializeSpy', function() {
            this.broadcaster = fw.observable().broadcastAs('broadcasterToTestWhenCallback');
          }).and.callThrough())
        });

        expect(modelAInitializeSpy).not.toHaveBeenCalled();
        var modelA = new ModelA();
        expect(modelAInitializeSpy).toHaveBeenCalled();

        var ModelB = fw.viewModel.create({
          initialize: tools.expectCallOrder(1, modelBInitializeSpy = jasmine.createSpy('modelBInitializeSpy', function() {
            this.receiver = fw.observable().receiveFrom(modelANamespaceName, 'broadcasterToTestWhenCallback').when(tools.expectCallOrder(2, whenSpy = jasmine.createSpy('whenSpy', function() {
              return false;
            }).and.callThrough()));
          }).and.callThrough())
        });

        expect(modelBInitializeSpy).not.toHaveBeenCalled();
        var modelB = new ModelB();
        expect(whenSpy).not.toHaveBeenCalled();
        expect(modelBInitializeSpy).toHaveBeenCalled();

        modelA.broadcaster(valuethatFailsWhenValidator);
        expect(whenSpy).toHaveBeenCalled();
        expect(modelB.receiver()).toBe(undefined);
      });

      it('receivable with .when() sees correct value passed to it in the callback', function() {
        var modelAInitializeSpy;
        var modelBInitializeSpy;
        var whenSpy;
        var modelANamespaceName = tools.generateNamespaceName();
        var writableTestValue = tools.randomString();
        var nonWrittenTestValue = tools.randomString();

        var ModelA = fw.viewModel.create({
          namespace: modelANamespaceName,
          initialize: tools.expectCallOrder(0, modelAInitializeSpy = jasmine.createSpy('modelAInitializeSpy', function() {
            this.broadcaster = fw.observable().broadcastAs('broadcasterToTestWhenCallback');
          }).and.callThrough())
        });

        expect(modelAInitializeSpy).not.toHaveBeenCalled();
        var modelA = new ModelA();
        expect(modelAInitializeSpy).toHaveBeenCalled();

        var ModelB = fw.viewModel.create({
          initialize: tools.expectCallOrder(1, modelBInitializeSpy = jasmine.createSpy('modelBInitializeSpy', function() {
            this.receiver = fw.observable().receiveFrom(modelANamespaceName, 'broadcasterToTestWhenCallback').when(tools.expectCallOrder([2, 3, 4], whenSpy = jasmine.createSpy('whenSpy', function(val) {
              return val === writableTestValue;
            }).and.callThrough()));
          }).and.callThrough())
        });

        expect(modelBInitializeSpy).not.toHaveBeenCalled();
        var modelB = new ModelB();
        expect(whenSpy).not.toHaveBeenCalled();
        expect(modelBInitializeSpy).toHaveBeenCalled();

        modelA.broadcaster(nonWrittenTestValue);
        expect(whenSpy).toHaveBeenCalledTimes(1);
        expect(modelB.receiver()).not.toBe(nonWrittenTestValue);

        modelA.broadcaster(writableTestValue);
        expect(whenSpy).toHaveBeenCalledTimes(2);
        expect(modelB.receiver()).toBe(writableTestValue);

        modelA.broadcaster(nonWrittenTestValue);
        expect(whenSpy).toHaveBeenCalledTimes(3);
        expect(modelB.receiver()).not.toBe(nonWrittenTestValue);
      });
    });
  }
);
