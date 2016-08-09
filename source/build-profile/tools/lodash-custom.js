/**
 * This is for creating a custom build of lodash which only includes the dependencies that footwork needs
 */
root._ = {
  isFunction: require('../../../node_modules/lodash/isFunction'),
  isObject: require('../../../node_modules/lodash/isObject'),
  isString: require('../../../node_modules/lodash/isString'),
  isBoolean: require('../../../node_modules/lodash/isBoolean'),
  isNumber: require('../../../node_modules/lodash/isNumber'),
  isUndefined: require('../../../node_modules/lodash/isUndefined'),
  isArray: require('../../../node_modules/lodash/isArray'),
  isNull: require('../../../node_modules/lodash/isNull'),
  extend: require('../../../node_modules/lodash/extend'),
  pick: require('../../../node_modules/lodash/pick'),
  each: require('../../../node_modules/lodash/each'),
  filter: require('../../../node_modules/lodash/filter'),
  bind: require('../../../node_modules/lodash/bind'),
  invoke: require('../../../node_modules/lodash/invoke'),
  invokeMap: require('../../../node_modules/lodash/invokeMap'),
  clone: require('../../../node_modules/lodash/clone'),
  reduce: require('../../../node_modules/lodash/reduce'),
  has: require('../../../node_modules/lodash/has'),
  result: require('../../../node_modules/lodash/result'),
  uniqueId: require('../../../node_modules/lodash/uniqueId'),
  map: require('../../../node_modules/lodash/map'),
  find: require('../../../node_modules/lodash/find'),
  omitBy: require('../../../node_modules/lodash/omitBy'),
  indexOf: require('../../../node_modules/lodash/indexOf'),
  first: require('../../../node_modules/lodash/first'),
  values: require('../../../node_modules/lodash/values'),
  reject: require('../../../node_modules/lodash/reject'),
  once: require('../../../node_modules/lodash/once'),
  last: require('../../../node_modules/lodash/last'),
  isEqual: require('../../../node_modules/lodash/isEqual'),
  defaults: require('../../../node_modules/lodash/defaults'),
  noop: require('../../../node_modules/lodash/noop'),
  keys: require('../../../node_modules/lodash/keys'),
  merge: require('../../../node_modules/lodash/merge'),
  after: require('../../../node_modules/lodash/after'),
  debounce: require('../../../node_modules/lodash/debounce'),
  throttle: require('../../../node_modules/lodash/throttle'),
  intersection: require('../../../node_modules/lodash/intersection'),
  every: require('../../../node_modules/lodash/every'),
  isRegExp: require('../../../node_modules/lodash/isRegExp'),
  identity: require('../../../node_modules/lodash/identity'),
  includes: require('../../../node_modules/lodash/includes'),
  partial: require('../../../node_modules/lodash/partial'),
  sortBy: require('../../../node_modules/lodash/sortBy')
};
