var fw = require('knockout/build/output/knockout-latest');
var _ = require('lodash');

var entityDescriptors = require('../entity-descriptors');
var prepareDescriptor = require('../entity-tools').prepareDescriptor;
var capitalizeFirstLetter = require('../../misc/util').capitalizeFirstLetter;

var entityName = 'viewModel';
var isEntityDuckTag = '__is' + capitalizeFirstLetter(entityName);

var entityResource = fw[entityName] = {
  boot: require('./viewModel-boot'),
  getPrivateData: require('../../misc/util').getPrivateData
};

var descriptor;
entityDescriptors.push(descriptor = prepareDescriptor({
  tagName: entityName.toLowerCase(),
  entityName: entityName,
  resource: entityResource,
  isEntityDuckTag: require('../../misc/util').getSymbol(isEntityDuckTag),
  isEntity: function (thing) {
    return _.isObject(thing) && !!thing[ isEntityDuckTag ];
  },
  defaultConfig: {
    namespace: undefined,
    autoRegister: false,
    afterRender: _.noop,
    afterResolving: function resolveEntityImmediately(resolveNow) {
      resolveNow(true);
    },
    sequenceAnimations: false,
    onDispose: _.noop
  }
}));

fw['is' + capitalizeFirstLetter(entityName)] = descriptor.isEntity;

// Form 1
// function TestModel() {
//   fw.viewModel.setConfig(this, {
//     // configuration options
//     namespace: 'testModel',
//     afterBinding: function() {}
//   });
//
//   this.someProperty = fw.observable('someValue');
// }

// Form 2
// var TestModel = fw.viewModel.create({
//   // configuration options
//   initialize: function TestModel() {
//     this.someProperty = fw.observable();
//   },
//   namespace: 'TestModel',
//   afterBinding: function() {}
// });

require('../../misc/config').ViewModel = function ViewModel(params) {
  if (_.isObject(params) && _.isObject(params.$viewModel)) {
    _.extend(this, params.$viewModel);
  }
};


