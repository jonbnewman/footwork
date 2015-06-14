// framework/entities/dataModel/DataModel.js
// ------------------

/**
 * Tentative API:
 *
 * var DataModel = fw.dataModel({
 *   id: 'id',
 *
 *   // string based url with automatic RESTful routes
 *   url: 'http://server.com/person',
 *
 *   // custom routes provided by callback
 *   url: function(method) {
 *     switch(method) {
 *       case 'read':
 *         return 'http://server.com/person/:id';
 *         break;
 *
 *       case 'create':
 *         return 'http://server.com/person';
 *         break;
 *
 *       case 'update':
 *         return 'http://server.com/person/:id';
 *         break;
 *
 *       case 'delete':
 *         return 'http://server.com/person/:id';
 *         break;
 *     }
 *   },
 *
 *   initialize: function() {
 *     // field declarations and mapping
 *     this.firstName = fw.observable().mapTo('firstName');
 *     this.lastName = fw.observable().mapTo('lastName');
 *     this.email = fw.observable().mapTo('email');
 *     this.movieCollection = {
 *       action: fw.observable().mapTo('movies.action'),
 *       drama: fw.observable().mapTo('movies.drama'),
 *       comedy: fw.observable().mapTo('movies.comedy'),
 *       horror: fw.observable().mapTo('movies.horror')
 *     };
 *   }
 * });
 */

var dataModelContext = [];
function enterDataModelContext(dataModel) {
  dataModelContext.unshift(dataModel);
}
function exitDataModelContext() {
  dataModelContext.shift();
}

function currentDataModelContext() {
  return dataModelContext.length ? dataModelContext[0] : null;
}

function getPrimaryKey(dataModel) {
  return dataModel.__getConfigParams().idAttribute;
}

fw.subscribable.fn.mapTo = function(option) {
  var mappedObservable = this;
  var mapPath;
  var dataModel;

  if(isString(option)) {
    mapPath = option;
    dataModel = currentDataModelContext();
  } else if(isObject(option)) {
    mapPath = option.path;
    dataModel = option.dataModel;
  } else {
    throw new Error('Invalid options supplied to mapTo');
  }

  if(!isDataModel(dataModel)) {
    throw new Error('No dataModel context found/supplied for mapTo observable');
  }

  var mappings = dataModel.__mappings();
  var primaryKey = getPrimaryKey(dataModel);
  if( !isUndefined(mappings[mapPath]) && (mapPath !== primaryKey && dataModel.$id.__isOriginalPK)) {
    throw new Error('the field \'' + mapPath + '\' is already mapped on this dataModel');
  }

  if(!isUndefined(mappings[mapPath]) && isFunction(mappings[mapPath].dispose)) {
    // remapping a path, we need to dispose of the old one first
    mappings[mapPath].dispose();
  }

  // add/set the registry entry for the mapped observable
  mappings[mapPath] = mappedObservable;

  if(mapPath === primaryKey) {
    // mapping primary key, update/set the $id property on the dataModel
    dataModel.$id = mappings[mapPath];
  }

  mappedObservable.isDirty = fw.observable(false);
  var changeSubscription = mappedObservable.subscribe(function() {
    mappedObservable.isDirty(true);
  });

  var disposeObservable = mappedObservable.dispose || noop;
  if(isFunction(mappedObservable.dispose)) {
    mappedObservable.dispose = function() {
      changeSubscription.dispose();
      disposeObservable.call(mappedObservable);
    };
  }

  dataModel.__mappings.valueHasMutated();

  return mappedObservable;
};

function insertValueIntoObject(rootObject, fieldMap, fieldValue) {
  if(isString(fieldMap)) {
    return insertValueIntoObject(rootObject, fieldMap.split('.'), fieldValue);
  }

  var propName = fieldMap.shift();
  if(fieldMap.length) {
    if(isUndefined(rootObject[propName])) {
      // nested property, lets add the container object
      rootObject[propName] = {};
    }
    // recurse into the next layer
    insertValueIntoObject(rootObject[propName], fieldMap, fieldValue);
  } else {
    rootObject[propName] = fieldValue;
  }

  return rootObject;
}

function getNestedReference(rootObject, fieldMap) {
  var propName = fieldMap;

  if(!isUndefined(fieldMap)) {
    if(isString(fieldMap)) {
      // initial call with string based fieldMap, recurse into main loop
      return getNestedReference(rootObject, fieldMap.split('.'));
    }

    propName = fieldMap.shift();
    if(fieldMap.length) {
      // recurse into the next layer
      return getNestedReference((rootObject || {})[propName], fieldMap);
    }
  }

  return !isString(propName) ? rootObject : (rootObject || {})[propName];
}

runPostInit.push(function(runTask) {
  fw.ajax = ajax;
  extend(fw.settings, {
    emulateHTTP: false,
    emulateJSON: false
  });
});

var DataModel = function(descriptor, configParams) {
  return {
    runBeforeInit: true,
    _preInit: function(params) {
      params = params || {};
      enterDataModelContext(this);
      var pkField = configParams.idAttribute;

      this.__mappings = fw.observable({});
      this.$dirty = fw.computed(function() {
        var mappings = this.__mappings();
        return reduce(mappings, function(isDirty, mappedField) {
          return isDirty || mappedField.isDirty();
        }, false);
      }, this);
      this.$cid = fw.utils.guid();
      this[pkField] = this.$id = fw.observable(params[pkField]).mapTo(pkField);
      this.$id.__isOriginalPK = true;
    },
    mixin: {
      // GET from server and $set in model
      $fetch: function() {
        var dataModel = this;
        var id = this[configParams.idAttribute]();
        if(id) {
          // retrieve data dataModel the from server using the id
          this.$sync('read', dataModel)
            .done(function(response) {
              dataModel.$set(response);
            });
        }
      },

      // PUT / POST / PATCH to server
      $save: function(key, val, options) {
        var viewModel = this;
        var attrs = null;

        if(isObject(key)) {
          attrs = key;
          options = val;
        } else {
          (attrs = {})[key] = val;
        }

        options = extend({
          parse: true,
          wait: false,
          patch: false
        }, options);

        var method = isUndefined(viewModel.$id()) ? 'create' : (options.patch ? 'patch' : 'update');

        if(method === 'patch' && !options.attrs) {
          options.attrs = attrs;
        }

        var promise = viewModel.$sync(method, viewModel, options);

        if(!isNull(attrs)) {
          if(options.wait) {
            promise.done(function(response) {
              if(options.parse && isObject(response)) {
                viewModel.$set(response);
              } else {
                viewModel.$set(attrs);
              }
            });
          } else {
            viewModel.$set(attrs);
          }
        }

        return promise;
      },

      $destroy: function() {}, // DELETE

      // set attributes in model (clears isDirty on observables/fields it saves to by default)
      $set: function(key, value, options) {
        var attributes = {};

        if(isString(key)) {
          attributes = insertValueIntoObject(attributes, key, value);
        } else if(isObject(key)) {
          attributes = key;
          options = value;
        }

        options = extend({
          clearDirty: true
        }, options);

        var mappingsChanged = false;
        each(this.__mappings(), function(fieldObservable, fieldMap) {
          var fieldValue = getNestedReference(attributes, fieldMap);
          if(!isUndefined(fieldValue)) {
            fieldObservable(fieldValue);
            mappingsChanged = true;
            options.clearDirty && fieldObservable.isDirty(false);
          }
        });

        if(mappingsChanged && options.clearDirty) {
          // we updated the dirty state of a/some field(s), lets tell the dataModel $dirty computed to (re)run its evaluator function
          this.__mappings.valueHasMutated();
        }
      },

      $clean: function(field) {
        if(!isUndefined(field)) {
          var fieldMatch = new RegExp('^' + field + '$|^' + field + '\..*');
        }
        each(this.__mappings(), function(fieldObservable, fieldMap) {
          if(isUndefined(field) || fieldMap.match(fieldMatch)) {
            fieldObservable.isDirty(false);
          }
        });
      },

      $sync: function() {
        return fw.sync.apply(this, arguments);
      },

      $hasMappedField: function(referenceField) {
        return !!this.__mappings()[referenceField];
      },

      // return current data in POJO form
      $toJS: function(referenceField, includeRoot) {
        var dataModel = this;
        if(isArray(referenceField)) {
          return reduce(referenceField, function(jsObject, fieldMap) {
            return merge(jsObject, dataModel.$toJS(fieldMap, true));
          }, {});
        } else if(!isUndefined(referenceField) && !isString(referenceField)) {
          throw new Error(dataModel.$namespace.getName() + ': Invalid referenceField [' + typeof referenceField + '] provided to dataModel.$toJS().');
        }

        var mappedObject = reduce(this.__mappings(), function reduceModelToObject(jsObject, fieldObservable, fieldMap) {
          if(isUndefined(referenceField) || ( fieldMap.indexOf(referenceField) === 0 && (fieldMap.length === referenceField.length || fieldMap.substr(referenceField.length, 1) === '.')) ) {
            insertValueIntoObject(jsObject, fieldMap, fieldObservable());
          }
          return jsObject;
        }, {});

        return includeRoot ? mappedObject : getNestedReference(mappedObject, referenceField);
      },

      // return current data in JSON form
      $toJSON: function(referenceField, includeRoot) {
        return JSON.stringify( this.$toJS(referenceField, includeRoot) );
      },

      $valid: function( referenceField ) {}, // get validation of entire model or selected field
      $validate: function() {} // perform a validation and return the result on a specific field or the entire model
    },
    _postInit: function() {
      this.$globalNamespace.request.handler(descriptor.referenceNamespace, function(options) {
        if( isString(options.namespaceName) || isArray(options.namespaceName) ) {
          var myNamespaceName = configParams.namespace;
          if(isArray(options.namespaceName) && indexOf(options.namespaceName, myNamespaceName) !== -1) {
            return this;
          } else if(isString(options.namespaceName) && options.namespaceName === myNamespaceName) {
            return this;
          }
        }
      }.bind(this));

      exitDataModelContext();
    }
  };
};
