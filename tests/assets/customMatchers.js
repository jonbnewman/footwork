define(['lodash'],
  function(_) {
    /**
     * Capitalize the first letter of the supplied string.
     *
     * @param {string} str
     * @returns {string} The original string with the first character upper-cased
     */
    function capitalizeFirstLetter (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function checkType (util, customEqualityTesters) {
      return {
        compare: function (actual, expected) {
          var result = {};
          switch (expected.toLowerCase()) {
            case 'promise':
              result.pass = util.equals(typeof actual, 'object', customEqualityTesters) && util.equals(typeof actual.then, 'function', customEqualityTesters);
              break;

            case 'array':
              result.pass = util.equals(Object.prototype.toString.call(actual), '[object Array]', customEqualityTesters);
              break;

            case 'viewmodel':
            case 'datamodel':
            case 'router':
              result.pass = fw['is' + capitalizeFirstLetter(expected)](actual);
              break;

            default:
              result.pass = util.equals(typeof actual, expected, customEqualityTesters);
              break;
          }

          if (!result.pass) {
            result.message = '\'' + (typeof actual) + '\' is not a ' + expected;
          }
          return result;
        }
      };
    }

    function checkLength (util, customEqualityTesters) {
      return {
        compare: function (actual, expected) {
          var result = {
            pass: !_.isUndefined(actual) && actual.length === expected
          };

          if (!result.pass) {
            result.message = '\'' + (typeof actual) + '\' is not ' + expected + ' elements in length';
          }
          return result;
        }
      };
    }

    function checkLengthGreaterThan (util, customEqualityTesters) {
      return {
        compare: function (actual, expected) {
          var result = {
            pass: !_.isUndefined(actual) && actual.length > expected
          };

          if (!result.pass) {
            result.message = '\'' + (typeof actual) + '\' is not ' + expected + ' elements in length';
          }
          return result;
        }
      };
    }

    function checkForExternallyLoadedModule (util, customEqualityTesters) {
      return {
        compare: function (actual, expected) {
          var result = { pass: !!loadedModules[actual] };
          if (!result.pass) {
            result.message = 'Expected \'' + actual + '\' requirejs module to have been loaded.';
          }
          return result;
        }
      };
    }

    function toBeInstanceOf (util, customEqualityTesters) {
      return {
        compare: function (actual, expected) {
          var result = { pass: actual instanceof expected };
          if (!result.pass) {
            result.message = "Expected " + actual + " is not an instance of " + expected.name;
          }
          return result;
        }
      };
    }

    return {
      toBeA: checkType,
      toBeAn: checkType,
      lengthToBe: checkLength,
      lengthToBeGreaterThan: checkLengthGreaterThan,
      toBeLoaded: checkForExternallyLoadedModule,
      toBeInstanceOf: toBeInstanceOf
    };
  }
);
