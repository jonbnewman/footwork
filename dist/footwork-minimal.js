/**
 * footwork.js - A solid footing for web applications.
 * Author: Jonathan Newman (http://staticty.pe)
 * Version: v1.0.0-minimal
 * Url: http://footworkjs.com
 * License(s): MIT
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['lodash', 'knockout'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('lodash'), require('knockout'));
  } else {
    root.fw = factory(root._, root.ko);
  }
}(this, function (_, ko) {
  var windowObject = window;

  window.require = typeof require !== 'undefined' ? require : undefined;
  window.define = typeof define !== 'undefined' ? define : undefined;

  return (function() {
    // define our own root object to supply to the modules as an attachment point
var root = {};

// supply our root for modules that directly check for the window object
var window = root;

// hide requirejs from the modules (AMD environment)
var define = undefined;

// hide node.js or browserified from the modules (CommonJS environment)
var module = undefined,
    exports = undefined,
    global = undefined;

    if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}


    _.extend(root, {
      _: _,
      ko: ko
    });

    (function() {
      /*!
  * Reqwest! A general purpose XHR connection manager
  * license MIT (c) Dustin Diaz 2014
  * https://github.com/ded/reqwest
  */

!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('reqwest', this, function () {

  var win = window
    , doc = document
    , httpsRe = /^http/
    , protocolRe = /(^\w+):\/\//
    , twoHundo = /^(20\d|1223)$/ //http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
    , byTag = 'getElementsByTagName'
    , readyState = 'readyState'
    , contentType = 'Content-Type'
    , requestedWith = 'X-Requested-With'
    , head = doc[byTag]('head')[0]
    , uniqid = 0
    , callbackPrefix = 'reqwest_' + (+new Date())
    , lastValue // data stored by the most recent JSONP callback
    , xmlHttpRequest = 'XMLHttpRequest'
    , xDomainRequest = 'XDomainRequest'
    , noop = function () {}

    , isArray = typeof Array.isArray == 'function'
        ? Array.isArray
        : function (a) {
            return a instanceof Array
          }

    , defaultHeaders = {
          'contentType': 'application/x-www-form-urlencoded'
        , 'requestedWith': xmlHttpRequest
        , 'accept': {
              '*':  'text/javascript, text/html, application/xml, text/xml, */*'
            , 'xml':  'application/xml, text/xml'
            , 'html': 'text/html'
            , 'text': 'text/plain'
            , 'json': 'application/json, text/javascript'
            , 'js':   'application/javascript, text/javascript'
          }
      }

    , xhr = function(o) {
        // is it x-domain
        if (o['crossOrigin'] === true) {
          var xhr = win[xmlHttpRequest] ? new XMLHttpRequest() : null
          if (xhr && 'withCredentials' in xhr) {
            return xhr
          } else if (win[xDomainRequest]) {
            return new XDomainRequest()
          } else {
            throw new Error('Browser does not support cross-origin requests')
          }
        } else if (win[xmlHttpRequest]) {
          return new XMLHttpRequest()
        } else {
          return new ActiveXObject('Microsoft.XMLHTTP')
        }
      }
    , globalSetupOptions = {
        dataFilter: function (data) {
          return data
        }
      }

  function succeed(r) {
    var protocol = protocolRe.exec(r.url);
    protocol = (protocol && protocol[1]) || window.location.protocol;
    return httpsRe.test(protocol) ? twoHundo.test(r.request.status) : !!r.request.response;
  }

  function handleReadyState(r, success, error) {
    return function () {
      // use _aborted to mitigate against IE err c00c023f
      // (can't read props on aborted request objects)
      if (r._aborted) return error(r.request)
      if (r._timedOut) return error(r.request, 'Request is aborted: timeout')
      if (r.request && r.request[readyState] == 4) {
        r.request.onreadystatechange = noop
        if (succeed(r)) success(r.request)
        else
          error(r.request)
      }
    }
  }

  function setHeaders(http, o) {
    var headers = o['headers'] || {}
      , h

    headers['Accept'] = headers['Accept']
      || defaultHeaders['accept'][o['type']]
      || defaultHeaders['accept']['*']

    var isAFormData = typeof FormData === 'function' && (o['data'] instanceof FormData);
    // breaks cross-origin requests with legacy browsers
    if (!o['crossOrigin'] && !headers[requestedWith]) headers[requestedWith] = defaultHeaders['requestedWith']
    if (!headers[contentType] && !isAFormData) headers[contentType] = o['contentType'] || defaultHeaders['contentType']
    for (h in headers)
      headers.hasOwnProperty(h) && 'setRequestHeader' in http && http.setRequestHeader(h, headers[h])
  }

  function setCredentials(http, o) {
    if (typeof o['withCredentials'] !== 'undefined' && typeof http.withCredentials !== 'undefined') {
      http.withCredentials = !!o['withCredentials']
    }
  }

  function generalCallback(data) {
    lastValue = data
  }

  function urlappend (url, s) {
    return url + (/\?/.test(url) ? '&' : '?') + s
  }

  function handleJsonp(o, fn, err, url) {
    var reqId = uniqid++
      , cbkey = o['jsonpCallback'] || 'callback' // the 'callback' key
      , cbval = o['jsonpCallbackName'] || reqwest.getcallbackPrefix(reqId)
      , cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)')
      , match = url.match(cbreg)
      , script = doc.createElement('script')
      , loaded = 0
      , isIE10 = navigator.userAgent.indexOf('MSIE 10.0') !== -1

    if (match) {
      if (match[3] === '?') {
        url = url.replace(cbreg, '$1=' + cbval) // wildcard callback func name
      } else {
        cbval = match[3] // provided callback func name
      }
    } else {
      url = urlappend(url, cbkey + '=' + cbval) // no callback details, add 'em
    }

    win[cbval] = generalCallback

    script.type = 'text/javascript'
    script.src = url
    script.async = true
    if (typeof script.onreadystatechange !== 'undefined' && !isIE10) {
      // need this for IE due to out-of-order onreadystatechange(), binding script
      // execution to an event listener gives us control over when the script
      // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
      script.htmlFor = script.id = '_reqwest_' + reqId
    }

    script.onload = script.onreadystatechange = function () {
      if ((script[readyState] && script[readyState] !== 'complete' && script[readyState] !== 'loaded') || loaded) {
        return false
      }
      script.onload = script.onreadystatechange = null
      script.onclick && script.onclick()
      // Call the user callback with the last value stored and clean up values and scripts.
      fn(lastValue)
      lastValue = undefined
      head.removeChild(script)
      loaded = 1
    }

    // Add the script to the DOM head
    head.appendChild(script)

    // Enable JSONP timeout
    return {
      abort: function () {
        script.onload = script.onreadystatechange = null
        err({}, 'Request is aborted: timeout', {})
        lastValue = undefined
        head.removeChild(script)
        loaded = 1
      }
    }
  }

  function getRequest(fn, err) {
    var o = this.o
      , method = (o['method'] || 'GET').toUpperCase()
      , url = typeof o === 'string' ? o : o['url']
      // convert non-string objects to query-string form unless o['processData'] is false
      , data = (o['processData'] !== false && o['data'] && typeof o['data'] !== 'string')
        ? reqwest.toQueryString(o['data'])
        : (o['data'] || null)
      , http
      , sendWait = false

    // if we're working on a GET request and we have data then we should append
    // query string to end of URL and not post data
    if ((o['type'] == 'jsonp' || method == 'GET') && data) {
      url = urlappend(url, data)
      data = null
    }

    if (o['type'] == 'jsonp') return handleJsonp(o, fn, err, url)

    // get the xhr from the factory if passed
    // if the factory returns null, fall-back to ours
    http = (o.xhr && o.xhr(o)) || xhr(o)

    http.open(method, url, o['async'] === false ? false : true)
    setHeaders(http, o)
    setCredentials(http, o)
    if (win[xDomainRequest] && http instanceof win[xDomainRequest]) {
        http.onload = fn
        http.onerror = err
        // NOTE: see
        // http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/30ef3add-767c-4436-b8a9-f1ca19b4812e
        http.onprogress = function() {}
        sendWait = true
    } else {
      http.onreadystatechange = handleReadyState(this, fn, err)
    }
    o['before'] && o['before'](http)
    if (sendWait) {
      setTimeout(function () {
        http.send(data)
      }, 200)
    } else {
      http.send(data)
    }
    return http
  }

  function Reqwest(o, fn) {
    this.o = o
    this.fn = fn

    init.apply(this, arguments)
  }

  function setType(header) {
    // json, javascript, text/plain, text/html, xml
    if (header.match('json')) return 'json'
    if (header.match('javascript')) return 'js'
    if (header.match('text')) return 'html'
    if (header.match('xml')) return 'xml'
  }

  function init(o, fn) {

    this.url = typeof o == 'string' ? o : o['url']
    this.timeout = null

    // whether request has been fulfilled for purpose
    // of tracking the Promises
    this._fulfilled = false
    // success handlers
    this._successHandler = function(){}
    this._fulfillmentHandlers = []
    // error handlers
    this._errorHandlers = []
    // complete (both success and fail) handlers
    this._completeHandlers = []
    this._erred = false
    this._responseArgs = {}

    var self = this

    fn = fn || function () {}

    if (o['timeout']) {
      this.timeout = setTimeout(function () {
        timedOut()
      }, o['timeout'])
    }

    if (o['success']) {
      this._successHandler = function () {
        o['success'].apply(o, arguments)
      }
    }

    if (o['error']) {
      this._errorHandlers.push(function () {
        o['error'].apply(o, arguments)
      })
    }

    if (o['complete']) {
      this._completeHandlers.push(function () {
        o['complete'].apply(o, arguments)
      })
    }

    function complete (resp) {
      o['timeout'] && clearTimeout(self.timeout)
      self.timeout = null
      while (self._completeHandlers.length > 0) {
        self._completeHandlers.shift()(resp)
      }
    }

    function success (resp) {
      var type = o['type'] || resp && setType(resp.getResponseHeader('Content-Type')) // resp can be undefined in IE
      resp = (type !== 'jsonp') ? self.request : resp
      // use global data filter on response text
      var filteredResponse = globalSetupOptions.dataFilter(resp.responseText, type)
        , r = filteredResponse
      try {
        resp.responseText = r
      } catch (e) {
        // can't assign this in IE<=8, just ignore
      }
      if (r) {
        switch (type) {
        case 'json':
          try {
            resp = win.JSON ? win.JSON.parse(r) : eval('(' + r + ')')
          } catch (err) {
            return error(resp, 'Could not parse JSON in response', err)
          }
          break
        case 'js':
          resp = eval(r)
          break
        case 'html':
          resp = r
          break
        case 'xml':
          resp = resp.responseXML
              && resp.responseXML.parseError // IE trololo
              && resp.responseXML.parseError.errorCode
              && resp.responseXML.parseError.reason
            ? null
            : resp.responseXML
          break
        }
      }

      self._responseArgs.resp = resp
      self._fulfilled = true
      fn(resp)
      self._successHandler(resp)
      while (self._fulfillmentHandlers.length > 0) {
        resp = self._fulfillmentHandlers.shift()(resp)
      }

      complete(resp)
    }

    function timedOut() {
      self._timedOut = true
      self.request.abort()      
    }

    function error(resp, msg, t) {
      resp = self.request
      self._responseArgs.resp = resp
      self._responseArgs.msg = msg
      self._responseArgs.t = t
      self._erred = true
      while (self._errorHandlers.length > 0) {
        self._errorHandlers.shift()(resp, msg, t)
      }
      complete(resp)
    }

    this.request = getRequest.call(this, success, error)
  }

  Reqwest.prototype = {
    abort: function () {
      this._aborted = true
      this.request.abort()
    }

  , retry: function () {
      init.call(this, this.o, this.fn)
    }

    /**
     * Small deviation from the Promises A CommonJs specification
     * http://wiki.commonjs.org/wiki/Promises/A
     */

    /**
     * `then` will execute upon successful requests
     */
  , then: function (success, fail) {
      success = success || function () {}
      fail = fail || function () {}
      if (this._fulfilled) {
        this._responseArgs.resp = success(this._responseArgs.resp)
      } else if (this._erred) {
        fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
      } else {
        this._fulfillmentHandlers.push(success)
        this._errorHandlers.push(fail)
      }
      return this
    }

    /**
     * `always` will execute whether the request succeeds or fails
     */
  , always: function (fn) {
      if (this._fulfilled || this._erred) {
        fn(this._responseArgs.resp)
      } else {
        this._completeHandlers.push(fn)
      }
      return this
    }

    /**
     * `fail` will execute when the request fails
     */
  , fail: function (fn) {
      if (this._erred) {
        fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
      } else {
        this._errorHandlers.push(fn)
      }
      return this
    }
  , 'catch': function (fn) {
      return this.fail(fn)
    }
  }

  function reqwest(o, fn) {
    return new Reqwest(o, fn)
  }

  // normalize newline variants according to spec -> CRLF
  function normalize(s) {
    return s ? s.replace(/\r?\n/g, '\r\n') : ''
  }

  function serial(el, cb) {
    var n = el.name
      , t = el.tagName.toLowerCase()
      , optCb = function (o) {
          // IE gives value="" even where there is no value attribute
          // 'specified' ref: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-862529273
          if (o && !o['disabled'])
            cb(n, normalize(o['attributes']['value'] && o['attributes']['value']['specified'] ? o['value'] : o['text']))
        }
      , ch, ra, val, i

    // don't serialize elements that are disabled or without a name
    if (el.disabled || !n) return

    switch (t) {
    case 'input':
      if (!/reset|button|image|file/i.test(el.type)) {
        ch = /checkbox/i.test(el.type)
        ra = /radio/i.test(el.type)
        val = el.value
        // WebKit gives us "" instead of "on" if a checkbox has no value, so correct it here
        ;(!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val))
      }
      break
    case 'textarea':
      cb(n, normalize(el.value))
      break
    case 'select':
      if (el.type.toLowerCase() === 'select-one') {
        optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null)
      } else {
        for (i = 0; el.length && i < el.length; i++) {
          el.options[i].selected && optCb(el.options[i])
        }
      }
      break
    }
  }

  // collect up all form elements found from the passed argument elements all
  // the way down to child elements; pass a '<form>' or form fields.
  // called with 'this'=callback to use for serial() on each element
  function eachFormElement() {
    var cb = this
      , e, i
      , serializeSubtags = function (e, tags) {
          var i, j, fa
          for (i = 0; i < tags.length; i++) {
            fa = e[byTag](tags[i])
            for (j = 0; j < fa.length; j++) serial(fa[j], cb)
          }
        }

    for (i = 0; i < arguments.length; i++) {
      e = arguments[i]
      if (/input|select|textarea/i.test(e.tagName)) serial(e, cb)
      serializeSubtags(e, [ 'input', 'select', 'textarea' ])
    }
  }

  // standard query string style serialization
  function serializeQueryString() {
    return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments))
  }

  // { 'name': 'value', ... } style serialization
  function serializeHash() {
    var hash = {}
    eachFormElement.apply(function (name, value) {
      if (name in hash) {
        hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]])
        hash[name].push(value)
      } else hash[name] = value
    }, arguments)
    return hash
  }

  // [ { name: 'name', value: 'value' }, ... ] style serialization
  reqwest.serializeArray = function () {
    var arr = []
    eachFormElement.apply(function (name, value) {
      arr.push({name: name, value: value})
    }, arguments)
    return arr
  }

  reqwest.serialize = function () {
    if (arguments.length === 0) return ''
    var opt, fn
      , args = Array.prototype.slice.call(arguments, 0)

    opt = args.pop()
    opt && opt.nodeType && args.push(opt) && (opt = null)
    opt && (opt = opt.type)

    if (opt == 'map') fn = serializeHash
    else if (opt == 'array') fn = reqwest.serializeArray
    else fn = serializeQueryString

    return fn.apply(null, args)
  }

  reqwest.toQueryString = function (o, trad) {
    var prefix, i
      , traditional = trad || false
      , s = []
      , enc = encodeURIComponent
      , add = function (key, value) {
          // If value is a function, invoke it and return its value
          value = ('function' === typeof value) ? value() : (value == null ? '' : value)
          s[s.length] = enc(key) + '=' + enc(value)
        }
    // If an array was passed in, assume that it is an array of form elements.
    if (isArray(o)) {
      for (i = 0; o && i < o.length; i++) add(o[i]['name'], o[i]['value'])
    } else {
      // If traditional, encode the "old" way (the way 1.3.2 or older
      // did it), otherwise encode params recursively.
      for (prefix in o) {
        if (o.hasOwnProperty(prefix)) buildParams(prefix, o[prefix], traditional, add)
      }
    }

    // spaces should be + according to spec
    return s.join('&').replace(/%20/g, '+')
  }

  function buildParams(prefix, obj, traditional, add) {
    var name, i, v
      , rbracket = /\[\]$/

    if (isArray(obj)) {
      // Serialize array item.
      for (i = 0; obj && i < obj.length; i++) {
        v = obj[i]
        if (traditional || rbracket.test(prefix)) {
          // Treat each array item as a scalar.
          add(prefix, v)
        } else {
          buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add)
        }
      }
    } else if (obj && obj.toString() === '[object Object]') {
      // Serialize object item.
      for (name in obj) {
        buildParams(prefix + '[' + name + ']', obj[name], traditional, add)
      }

    } else {
      // Serialize scalar item.
      add(prefix, obj)
    }
  }

  reqwest.getcallbackPrefix = function () {
    return callbackPrefix
  }

  // jQuery and Zepto compatibility, differences can be remapped here so you can call
  // .ajax.compat(options, callback)
  reqwest.compat = function (o, fn) {
    if (o) {
      o['type'] && (o['method'] = o['type']) && delete o['type']
      o['dataType'] && (o['type'] = o['dataType'])
      o['jsonpCallback'] && (o['jsonpCallbackName'] = o['jsonpCallback']) && delete o['jsonpCallback']
      o['jsonp'] && (o['jsonpCallback'] = o['jsonp'])
    }
    return new Reqwest(o, fn)
  }

  reqwest.ajaxSetup = function (options) {
    options = options || {}
    for (var k in options) {
      globalSetupOptions[k] = options[k]
    }
  }

  return reqwest
});

    }).call(root);

    (function() {
      /**
 * riveter - Mix-in, inheritance and constructor extend behavior for your JavaScript enjoyment.
 * © 2012 - Copyright appendTo, LLC 
 * Author(s): Jim Cowart, Nicholas Cloud, Doug Neiner
 * Version: v0.1.2
 * Url: https://github.com/a2labs/riveter
 * License(s): MIT, GPL
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        // Node, or CommonJS-Like environments
        module.exports = factory(require("lodash"));
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["lodash"], function (_) {
            return factory(_, root);
        });
    } else {
        // Browser globals
        root.riveter = factory(root._, root);
    }
}(this, function (_, global, undefined) {
    var slice = Array.prototype.slice;
    var riveter = function () {
        var args = slice.call(arguments, 0);
        while (args.length) {
            riveter.rivet(args.shift());
        }
    };
    riveter.rivet = function (fn) {
        if (!fn.hasOwnProperty("extend")) {
            fn.extend = function (props, ctorProps) {
                return riveter.extend(fn, props, ctorProps);
            };
        }
        if (!fn.hasOwnProperty("compose")) {
            fn.compose = function () {
                return riveter.compose.apply(this, [fn].concat(slice.call(arguments, 0)));
            };
        }
        if (!fn.hasOwnProperty("inherits")) {
            fn.inherits = function (parent, ctorProps) {
                riveter.inherits(fn, parent, ctorProps);
            };
        }
        if (!fn.hasOwnProperty("mixin")) {
            fn.mixin = function () {
                riveter.mixin.apply(this, ([fn].concat(slice.call(arguments, 0))));
            };
        }
    };
    riveter.inherits = function (child, parent, ctorProps) {
        var childProto;
        var TmpCtor = function () {};
        var Child = function () {
            parent.apply(this, arguments);
        };
        if (typeof child === "object") {
            if (child.hasOwnProperty("constructor")) {
                Child = child.constructor;
            }
            childProto = child;
        } else {
            Child = child;
            childProto = child.prototype;
        }
        riveter.rivet(Child);
        _.defaults(Child, parent, ctorProps);
        TmpCtor.prototype = parent.prototype;
        Child.prototype = new TmpCtor();
        _.extend(Child.prototype, childProto, {
            constructor: Child
        });
        Child.__super = parent;
        // Next line is all about Backbone compatibility
        Child.__super__ = parent.prototype;
        return Child;
    };
    riveter.extend = function (ctor, props, ctorProps) {
        return riveter.inherits(props, ctor, ctorProps);
    };
    riveter.compose = function () {
        var args = slice.call(arguments, 0);
        var ctor = args.shift();
        riveter.rivet(ctor);
        var mixin = _.reduce(args, function (memo, val) {
            if (val.hasOwnProperty("_preInit")) {
                memo.preInit.push(val._preInit);
            }
            if (val.hasOwnProperty("_postInit")) {
                memo.postInit.push(val._postInit);
            }
            val = val.mixin || val;
            memo.items.push(val);
            return memo;
        }, {
            items: [],
            preInit: [],
            postInit: []
        });
        var res = ctor.extend({
            constructor: function ( /* options */ ) {
                var args = slice.call(arguments, 0);
                _.each(mixin.preInit, function (initializer) {
                    initializer.apply(this, args);
                }, this);
                ctor.prototype.constructor.apply(this, args);
                _.each(mixin.postInit, function (initializer) {
                    initializer.apply(this, args);
                }, this);
            }
        });
        riveter.rivet(res);
        _.defaults(res.prototype, _.extend.apply(null, [{}].concat(mixin.items)));
        return res;
    };
    riveter.mixin = function () {
        var args = slice.call(arguments, 0);
        var ctor = args.shift();
        riveter.rivet(ctor);
        _.defaults(ctor.prototype, _.extend.apply(null, [{}].concat(args)));
    };
    return riveter;
}));
    }).call(root);

    (function() {
      /**
 * postal - Pub/Sub library providing wildcard subscriptions, complex message handling, etc.  Works server and client-side.
 * Author: Jim Cowart (http://ifandelse.com)
 * Version: v1.0.1
 * Url: http://github.com/postaljs/postal.js
 * License(s): MIT
 */
(function (root, factory) { /* istanbul ignore if  */
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["lodash"], function (_) {
            return factory(_, root);
        }); /* istanbul ignore else */
    } else if (typeof module === "object" && module.exports) {
        // Node, or CommonJS-Like environments
        module.exports = factory(require("lodash"), this);
    } else {
        // Browser globals
        root.postal = factory(root._, root);
    }
}(this, function (_, global, undefined) {
    var prevPostal = global.postal;
    var _defaultConfig = {
        DEFAULT_CHANNEL: "/",
        SYSTEM_CHANNEL: "postal",
        enableSystemMessages: true,
        cacheKeyDelimiter: "|",
        autoCompactResolver: false
    };
    var postal = {
        configuration: _.extend({}, _defaultConfig)
    };
    var _config = postal.configuration;
    var ChannelDefinition = function (channelName, bus) {
        this.bus = bus;
        this.channel = channelName || _config.DEFAULT_CHANNEL;
    };
    ChannelDefinition.prototype.subscribe = function () {
        return this.bus.subscribe({
            channel: this.channel,
            topic: (arguments.length === 1 ? arguments[0].topic : arguments[0]),
            callback: (arguments.length === 1 ? arguments[0].callback : arguments[1])
        });
    };
/*
    publish( envelope [, callback ] );
    publish( topic, data [, callback ] );
*/
    ChannelDefinition.prototype.publish = function () {
        var envelope = {};
        var callback;
        if (typeof arguments[0] === "string") {
            envelope.topic = arguments[0];
            envelope.data = arguments[1];
            callback = arguments[2];
        } else {
            envelope = arguments[0];
            callback = arguments[1];
        }
        envelope.channel = this.channel;
        this.bus.publish(envelope, callback);
    };
    var SubscriptionDefinition = function (channel, topic, callback) {
        if (arguments.length !== 3) {
            throw new Error("You must provide a channel, topic and callback when creating a SubscriptionDefinition instance.");
        }
        if (topic.length === 0) {
            throw new Error("Topics cannot be empty");
        }
        this.channel = channel;
        this.topic = topic;
        this.callback = callback;
        this.pipeline = [];
        this.cacheKeys = [];
        this._context = undefined;
    };
    var ConsecutiveDistinctPredicate = function () {
        var previous;
        return function (data) {
            var eq = false;
            if (typeof data == 'string') {
                eq = data === previous;
                previous = data;
            } else {
                eq = _.isEqual(data, previous);
                previous = _.extend({}, data);
            }
            return !eq;
        };
    };
    var DistinctPredicate = function DistinctPredicateFactory() {
        var previous = [];
        return function DistinctPredicate(data) {
            var isDistinct = !_.any(previous, function (p) {
                return _.isEqual(data, p);
            });
            if (isDistinct) {
                previous.push(data);
            }
            return isDistinct;
        };
    };
    SubscriptionDefinition.prototype = {
        "catch": function (errorHandler) {
            var original = this.callback;
            var safeCallback = function () {
                try {
                    original.apply(this, arguments);
                } catch (err) {
                    errorHandler(err, arguments[0]);
                }
            };
            this.callback = safeCallback;
            return this;
        },
        defer: function defer() {
            return this.delay(0);
        },
        disposeAfter: function disposeAfter(maxCalls) {
            if (typeof maxCalls != 'number' || maxCalls <= 0) {
                throw new Error("The value provided to disposeAfter (maxCalls) must be a number greater than zero.");
            }
            var self = this;
            var dispose = _.after(maxCalls, _.bind(function () {
                self.unsubscribe();
            }));
            self.pipeline.push(function (data, env, next) {
                next(data, env);
                dispose();
            });
            return self;
        },
        distinct: function distinct() {
            return this.constraint(new DistinctPredicate());
        },
        distinctUntilChanged: function distinctUntilChanged() {
            return this.constraint(new ConsecutiveDistinctPredicate());
        },
        invokeSubscriber: function invokeSubscriber(data, env) {
            if (!this.inactive) {
                var self = this;
                var pipeline = self.pipeline;
                var len = pipeline.length;
                var context = self._context;
                var idx = -1;
                var invoked = false;
                if (!len) {
                    self.callback.call(context, data, env);
                    invoked = true;
                } else {
                    pipeline = pipeline.concat([self.callback]);
                    var step = function step(d, e) {
                        idx += 1;
                        if (idx < len) {
                            pipeline[idx].call(context, d, e, step);
                        } else {
                            self.callback.call(context, d, e);
                            invoked = true;
                        }
                    };
                    step(data, env, 0);
                }
                return invoked;
            }
        },
        logError: function logError() { /* istanbul ignore else */
            if (console) {
                var report;
                if (console.warn) {
                    report = console.warn;
                } else {
                    report = console.log;
                }
                this["catch"](report);
            }
            return this;
        },
        once: function once() {
            return this.disposeAfter(1);
        },
        subscribe: function subscribe(callback) {
            this.callback = callback;
            return this;
        },
        unsubscribe: function unsubscribe() { /* istanbul ignore else */
            if (!this.inactive) {
                postal.unsubscribe(this);
            }
        },
        constraint: function constraint(predicate) {
            if (typeof predicate != 'function') {
                throw new Error("Predicate constraint must be a function");
            }
            this.pipeline.push(function (data, env, next) {
                if (predicate.call(this, data, env)) {
                    next(data, env);
                }
            });
            return this;
        },
        constraints: function constraints(predicates) {
            var self = this; /* istanbul ignore else */
            _.each(predicates, function (predicate) {
                self.constraint(predicate);
            });
            return self;
        },
        context: function contextSetter(context) {
            this._context = context;
            return this;
        },
        debounce: function debounce(milliseconds, immediate) {
            if (typeof milliseconds != 'number') {
                throw new Error("Milliseconds must be a number");
            }
            this.pipeline.push(
            _.debounce(function (data, env, next) {
                next(data, env);
            }, milliseconds, !! immediate));
            return this;
        },
        delay: function delay(milliseconds) {
            if (typeof milliseconds != 'number') {
                throw new Error("Milliseconds must be a number");
            }
            var self = this;
            self.pipeline.push(function (data, env, next) {
                setTimeout(function () {
                    next(data, env);
                }, milliseconds);
            });
            return this;
        },
        throttle: function throttle(milliseconds) {
            if (typeof milliseconds != 'number') {
                throw new Error("Milliseconds must be a number");
            }
            var fn = function (data, env, next) {
                next(data, env);
            };
            this.pipeline.push(_.throttle(fn, milliseconds));
            return this;
        }
    };
    // Backwards Compatibility
    // WARNING: these will be removed by version 0.13


    function warnOnDeprecation(oldMethod, newMethod) {
        return function () {
            if (console.warn || console.log) {
                var msg = "Warning, the " + oldMethod + " method has been deprecated. Please use " + newMethod + " instead.";
                if (console.warn) {
                    console.warn(msg);
                } else {
                    console.log(msg);
                }
            }
            return SubscriptionDefinition.prototype[newMethod].apply(this, arguments);
        };
    }
    var oldMethods = ["withConstraint", "withConstraints", "withContext", "withDebounce", "withDelay", "withThrottle"];
    var newMethods = ["constraint", "constraints", "context", "debounce", "delay", "throttle"];
    for (var i = 0; i < 6; i++) {
        var oldMethod = oldMethods[i];
        SubscriptionDefinition.prototype[oldMethod] = warnOnDeprecation(oldMethod, newMethods[i]);
    }
    var bindingsResolver = _config.resolver = {
        cache: {},
        regex: {},
        enableCache: true,
        compare: function compare(binding, topic, headerOptions) {
            var pattern;
            var rgx;
            var prevSegment;
            var cacheKey = topic + _config.cacheKeyDelimiter + binding;
            var result = (this.cache[cacheKey]);
            var opt = headerOptions || {};
            var saveToCache = this.enableCache && !opt.resolverNoCache;
            // result is cached?
            if (result === true) {
                return result;
            }
            // plain string matching?
            if (binding.indexOf("#") === -1 && binding.indexOf("*") === -1) {
                result = (topic === binding);
                if (saveToCache) {
                    this.cache[cacheKey] = result;
                }
                return result;
            }
            // ah, regex matching, then
            if (!(rgx = this.regex[binding])) {
                pattern = "^" + _.map(binding.split("."), function mapTopicBinding(segment) {
                    var res = "";
                    if ( !! prevSegment) {
                        res = prevSegment !== "#" ? "\\.\\b" : "\\b";
                    }
                    if (segment === "#") {
                        res += "[\\s\\S]*";
                    } else if (segment === "*") {
                        res += "[^.]+";
                    } else {
                        res += segment;
                    }
                    prevSegment = segment;
                    return res;
                }).join("") + "$";
                rgx = this.regex[binding] = new RegExp(pattern);
            }
            result = rgx.test(topic);
            if (saveToCache) {
                this.cache[cacheKey] = result;
            }
            return result;
        },
        reset: function reset() {
            this.cache = {};
            this.regex = {};
        },
        purge: function (options) {
            var self = this;
            var keyDelimiter = _config.cacheKeyDelimiter;
            var matchPredicate = function (val, key) {
                var split = key.split(keyDelimiter);
                var topic = split[0];
                var binding = split[1];
                if ((typeof options.topic === "undefined" || options.topic === topic) && (typeof options.binding === "undefined" || options.binding === binding)) {
                    delete self.cache[key];
                }
            };
            var compactPredicate = function (val, key) {
                var split = key.split(keyDelimiter);
                if (postal.getSubscribersFor({
                    topic: split[0]
                }).length === 0) {
                    delete self.cache[key];
                }
            };
            if (typeof options === "undefined") {
                this.reset();
            } else {
                var handler = options.compact === true ? compactPredicate : matchPredicate;
                _.each(this.cache, handler);
            }
        }
    };
    var pubInProgress = 0;
    var unSubQueue = [];
    var autoCompactIndex = 0;
    function clearUnSubQueue() {
        while (unSubQueue.length) {
            postal.unsubscribe(unSubQueue.shift());
        }
    }
    function getCachePurger(subDef, key, cache) {
        return function (sub, i, list) {
            if (sub === subDef) {
                list.splice(i, 1);
            }
            if (list.length === 0) {
                delete cache[key];
            }
        };
    }
    function getCacher(topic, cache, cacheKey, done, envelope) {
        var headers = envelope && envelope.headers || {};
        return function (subDef) {
            if (_config.resolver.compare(subDef.topic, topic, headers)) {
                cache.push(subDef);
                subDef.cacheKeys.push(cacheKey);
                if (done) {
                    done(subDef);
                }
            }
        };
    }
    function getSystemMessage(kind, subDef) {
        return {
            channel: _config.SYSTEM_CHANNEL,
            topic: "subscription." + kind,
            data: {
                event: "subscription." + kind,
                channel: subDef.channel,
                topic: subDef.topic
            }
        };
    }
    var sysCreatedMessage = _.bind(getSystemMessage, this, "created");
    var sysRemovedMessage = _.bind(getSystemMessage, this, "removed");
    function getPredicate(options, resolver) {
        if (typeof options === "function") {
            return options;
        } else if (!options) {
            return function () {
                return true;
            };
        } else {
            return function (sub) {
                var compared = 0,
                    matched = 0;
                _.each(options, function (val, prop) {
                    compared += 1;
                    if (
                    // We use the bindings resolver to compare the options.topic to subDef.topic
                    (prop === "topic" && resolver.compare(sub.topic, options.topic, {
                        resolverNoCache: true
                    })) || (prop === "context" && options.context === sub._context)
                    // Any other potential prop/value matching outside topic & context...
                    || (sub[prop] === options[prop])) {
                        matched += 1;
                    }
                });
                return compared === matched;
            };
        }
    }
    _.extend(postal, {
        cache: {},
        subscriptions: {},
        wireTaps: [],
        ChannelDefinition: ChannelDefinition,
        SubscriptionDefinition: SubscriptionDefinition,
        channel: function channel(channelName) {
            return new ChannelDefinition(channelName, this);
        },
        addWireTap: function addWireTap(callback) {
            var self = this;
            self.wireTaps.push(callback);
            return function () {
                var idx = self.wireTaps.indexOf(callback);
                if (idx !== -1) {
                    self.wireTaps.splice(idx, 1);
                }
            };
        },
        noConflict: function noConflict() { /* istanbul ignore else */
            if (typeof window === "undefined" || (typeof window !== "undefined" && typeof define === "function" && define.amd)) {
                throw new Error("noConflict can only be used in browser clients which aren't using AMD modules");
            }
            global.postal = prevPostal;
            return this;
        },
        getSubscribersFor: function getSubscribersFor(options) {
            var result = [];
            var self = this;
            _.each(self.subscriptions, function (channel) {
                _.each(channel, function (subList) {
                    result = result.concat(_.filter(subList, getPredicate(options, _config.resolver)));
                });
            });
            return result;
        },
        publish: function publish(envelope, cb) {
            ++pubInProgress;
            var channel = envelope.channel = envelope.channel || _config.DEFAULT_CHANNEL;
            var topic = envelope.topic;
            envelope.timeStamp = new Date();
            if (this.wireTaps.length) {
                _.each(this.wireTaps, function (tap) {
                    tap(envelope.data, envelope, pubInProgress);
                });
            }
            var cacheKey = channel + _config.cacheKeyDelimiter + topic;
            var cache = this.cache[cacheKey];
            var skipped = 0;
            var activated = 0;
            if (!cache) {
                cache = this.cache[cacheKey] = [];
                var cacherFn = getCacher(
                topic, cache, cacheKey, function (candidate) {
                    if (candidate.invokeSubscriber(envelope.data, envelope)) {
                        activated++;
                    } else {
                        skipped++;
                    }
                }, envelope);
                _.each(this.subscriptions[channel], function (candidates) {
                    _.each(candidates, cacherFn);
                });
            } else {
                _.each(cache, function (subDef) {
                    if (subDef.invokeSubscriber(envelope.data, envelope)) {
                        activated++;
                    } else {
                        skipped++;
                    }
                });
            }
            if (--pubInProgress === 0) {
                clearUnSubQueue();
            }
            if (cb) {
                cb({
                    activated: activated,
                    skipped: skipped
                });
            }
        },
        reset: function reset() {
            this.unsubscribeFor();
            _config.resolver.reset();
            this.subscriptions = {};
        },
        subscribe: function subscribe(options) {
            var subscriptions = this.subscriptions;
            var subDef = new SubscriptionDefinition(options.channel || _config.DEFAULT_CHANNEL, options.topic, options.callback);
            var channel = subscriptions[subDef.channel];
            var channelLen = subDef.channel.length;
            var subs;
            if (!channel) {
                channel = subscriptions[subDef.channel] = {};
            }
            subs = subscriptions[subDef.channel][subDef.topic];
            if (!subs) {
                subs = subscriptions[subDef.channel][subDef.topic] = [];
            }
            // First, add the SubscriptionDefinition to the channel list
            subs.push(subDef);
            // Next, add the SubscriptionDefinition to any relevant existing cache(s)
            _.each(this.cache, function (list, cacheKey) {
                if (cacheKey.substr(0, channelLen) === subDef.channel) {
                    getCacher(
                    cacheKey.split(_config.cacheKeyDelimiter)[1], list, cacheKey)(subDef);
                }
            }); /* istanbul ignore else */
            if (_config.enableSystemMessages) {
                this.publish(sysCreatedMessage(subDef));
            }
            return subDef;
        },
        unsubscribe: function unsubscribe() {
            var unSubLen = arguments.length;
            var unSubIdx = 0;
            var subDef;
            var channelSubs;
            var topicSubs;
            var idx;
            for (; unSubIdx < unSubLen; unSubIdx++) {
                subDef = arguments[unSubIdx];
                subDef.inactive = true;
                if (pubInProgress) {
                    unSubQueue.push(subDef);
                    return;
                }
                channelSubs = this.subscriptions[subDef.channel];
                topicSubs = channelSubs && channelSubs[subDef.topic]; /* istanbul ignore else */
                if (topicSubs) {
                    var len = topicSubs.length;
                    idx = 0;
                    // remove SubscriptionDefinition from channel list
                    while (idx < len) { /* istanbul ignore else */
                        if (topicSubs[idx] === subDef) {
                            topicSubs.splice(idx, 1);
                            break;
                        }
                        idx += 1;
                    }
                    if (topicSubs.length === 0) {
                        delete channelSubs[subDef.topic];
                        if (!_.keys(channelSubs).length) {
                            delete this.subscriptions[subDef.channel];
                        }
                    }
                    // remove SubscriptionDefinition from postal cache
                    if (subDef.cacheKeys && subDef.cacheKeys.length) {
                        var key;
                        while (key = subDef.cacheKeys.pop()) {
                            _.each(this.cache[key], getCachePurger(subDef, key, this.cache));
                        }
                    }
                    if (typeof _config.resolver.purge === "function") {
                        // check to see if relevant resolver cache entries can be purged
                        var autoCompact = _config.autoCompactResolver === true ? 0 : typeof _config.autoCompactResolver === "number" ? (_config.autoCompactResolver - 1) : false;
                        if (autoCompact >= 0 && autoCompactIndex === autoCompact) {
                            _config.resolver.purge({
                                compact: true
                            });
                            autoCompactIndex = 0;
                        } else if (autoCompact >= 0 && autoCompactIndex < autoCompact) {
                            autoCompactIndex += 1;
                        }
                    }
                }
                if (_config.enableSystemMessages) {
                    this.publish(sysRemovedMessage(subDef));
                }
            }
        },
        unsubscribeFor: function unsubscribeFor(options) {
            var toDispose = []; /* istanbul ignore else */
            if (this.subscriptions) {
                toDispose = this.getSubscribersFor(options);
                this.unsubscribe.apply(this, toDispose);
            }
        }
    });
    if (global && Object.prototype.hasOwnProperty.call(global, "__postalReady__") && _.isArray(global.__postalReady__)) {
        while (global.__postalReady__.length) {
            global.__postalReady__.shift().onReady(postal);
        }
    }
    return postal;
}));
    }).call(root);

    if(root._.isUndefined(root.postal.preserve)) {
      (function() {
        /**
 * postal.preserve - Add-on for postal.js that provides message durability features.
 * Author: Jim Cowart (http://freshbrewedcode.com/jimcowart)
 * Version: v0.1.0
 * Url: http://github.com/postaljs/postal.preserve
 * License(s): MIT
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        // Node, or CommonJS-Like environments
        module.exports = function (postal) {
            factory(require("lodash"), postal, this);
        };
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["lodash", "postal"], function (_, postal) {
            return factory(_, postal, root);
        });
    } else {
        // Browser globals
        root.postal = factory(root._, root.postal, root);
    }
}(this, function (_, postal, global, undefined) {
    var plugin = postal.preserve = {
        store: {},
        expiring: []
    };
    var system = postal.channel(postal.configuration.SYSTEM_CHANNEL);
    var dtSort = function (a, b) {
        return b.expires - a.expires;
    };
    var tap = postal.addWireTap(function (d, e) {
        var channel = e.channel;
        var topic = e.topic;
        if (e.headers && e.headers.preserve) {
            plugin.store[channel] = plugin.store[channel] || {};
            plugin.store[channel][topic] = plugin.store[channel][topic] || [];
            plugin.store[channel][topic].push(e);
            // a bit harder to read, but trying to make
            // traversing expired messages faster than
            // iterating the store object's multiple arrays
            if (e.headers.expires) {
                plugin.expiring.push({
                    expires: e.headers.expires,
                    purge: function () {
                        plugin.store[channel][topic] = _.without(plugin.store[channel][topic], e);
                        plugin.expiring = _.without(plugin.expiring, this);
                    }
                });
                plugin.expiring.sort(dtSort);
            }
        }
    });
    function purgeExpired() {
        var dt = new Date();
        var expired = _.filter(plugin.expiring, function (x) {
            return x.expires < dt;
        });
        while (expired.length) {
            expired.pop().purge();
        }
    }
    postal.SubscriptionDefinition.prototype.enlistPreserved = function () {
        var channel = this.channel;
        var binding = this.topic;
        var self = this;
        purgeExpired(true);
        if (plugin.store[channel]) {
            _.each(plugin.store[channel], function (msgs, topic) {
                if (postal.configuration.resolver.compare(binding, topic)) {
                    _.each(msgs, function (env) {
                        self.callback.call(
                        self.context || (self.callback.context && self.callback.context()) || this, env.data, env);
                    });
                }
            });
        }
        return this;
    };
    return postal;
}));
      }).call(root);
    }

    (function(window) {
      // Console-polyfill. MIT license.
// https://github.com/paulmillr/console-polyfill
// Make it safe to do console.log() always.
(function(global) {
  'use strict';
  global.console = global.console || {};
  var con = global.console;
  var prop, method;
  var empty = {};
  var dummy = function() {};
  var properties = 'memory'.split(',');
  var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
     'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
     'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',');
  while (prop = properties.pop()) if (!con[prop]) con[prop] = empty;
  while (method = methods.pop()) if (!con[method]) con[method] = dummy;
})(typeof window === 'undefined' ? this : window);
// Using `this` for web workers while maintaining compatibility with browser
// targeted script loaders such as Browserify or Webpack where the only way to
// get to the global object is via `window`.

    }).call(root, windowObject);

    // list of dependencies to export from the library as .embed properties
    var embeddedDependencies = [ 'riveter', 'postal', 'reqwest' ];

    return (function footwork(embedded, windowObject, _, ko, postal, riveter, reqwest) {
      var ajax = reqwest.compat;
      // main.js
// -----------

var fw = ko;

// misc/lodashExtract.js
// ----------------

var isFunction = _.isFunction;
var isObject = _.isObject;
var isString = _.isString;
var isBoolean = _.isBoolean;
var isNumber = _.isNumber;
var isUndefined = _.isUndefined;
var isArray = _.isArray;
var isNull = _.isNull;
var contains = _.contains;
var extend = _.extend;
var pick = _.pick;
var each = _.each;
var filter = _.filter;
var bind = _.bind;
var invoke = _.invoke;
var clone = _.clone;
var reduce = _.reduce;
var has = _.has;
var where = _.where;
var result = _.result;
var uniqueId = _.uniqueId;
var map = _.map;
var find = _.find;
var omit = _.omit;
var indexOf = _.indexOf;
var values = _.values;
var reject = _.reject;
var findWhere = _.findWhere;
var once = _.once;
var last = _.last;
var isEqual = _.isEqual;
var noop = _.noop;
var keys = _.keys;
var merge = _.merge;
var pluck = _.pluck;

// framework/init.js
// ------------------

// Record the footwork version as of this build.
fw.footworkVersion = '1.0.0';

// Expose any embedded dependencies
fw.embed = embedded;

fw.viewModels = {};
fw.dataModels = {};
fw.routers = {};
fw.outlets = {};
fw.settings = {};

var runPostInit = [];
var internalComponents = [];
var entityDescriptors = [];
var entityMixins = [];
var footwork = {};

var entityClassName = 'fw-entity';
var bindingClassName = 'fw-entity-bound';
var animationIteration = 20;
var isEntityCtor;
var isEntity;
var isDataModel;
var isRouter;

// framework/utility.js
// ----------------

var trailingSlashRegex = /\/$/;
var startingSlashRegex = /^\//;
var startingHashRegex = /^#/;

var isObservable = fw.isObservable;

var isFullURLRegex = /(^[a-z]+:\/\/|^\/\/)/i;
var isFullURL = fw.utils.isFullURL = function(thing) {
  return isString(thing) && isFullURLRegex.test(thing);
};

function isInternalComponent(componentName) {
  return indexOf(internalComponents, componentName) !== -1;
}

function isPath(pathOrFile) {
  return isString(pathOrFile) && trailingSlashRegex.test(pathOrFile);
};

function hasPathStart(path) {
  return isString(path) && startingSlashRegex.test(path);
};

function hasHashStart(string) {
  return isString(string) && startingHashRegex.test(string);
}

function getFilenameExtension(fileName) {
  var extension = '';
  if(fileName.indexOf('.') !== -1) {
    extension = last(fileName.split('.'));
  }
  return extension;
}

function alwaysPassPredicate() { return true; }
function emptyStringResult() { return ''; }

// dispose a known property type
function propertyDisposal( property ) {
  if( (isObservable(property) || isNamespace(property) || isEntity(property) || fw.isBroadcastable(property) || fw.isReceivable(property)) && isFunction(property.dispose) ) {
    property.dispose();
  }
}

// parseUri() originally sourced from: http://blog.stevenlevithan.com/archives/parseuri
function parseUri(str) {
  var options = parseUri.options;
  var matchParts = options.parser[ options.strictMode ? "strict" : "loose" ].exec(str);
  var uri = {};
  var i = 14;

  while (i--) {
    uri[ options.key[i] ] = matchParts[i] || "";
  }

  uri[ options.q.name ] = {};
  uri[ options.key[12] ].replace(options.q.parser, function ($0, $1, $2) {
    if($1) {
      uri[options.q.name][$1] = $2;
    }
  });

  return uri;
};

parseUri.options = {
  strictMode: false,
  key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
  q: {
    name:   "queryKey",
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

// Generate a random pseudo-GUID
// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
var guid = fw.utils.guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();


// framework/namespace/init.js
// ----------------

// Prepare an empty namespace stack.
// This is where footwork registers its current working namespace name. Each new namespace is
// 'unshifted' and 'shifted' as they are entered and exited, keeping the most current at
// index 0.
var namespaceStack = [];

// This counter is used when model options { autoIncrement: true } and more than one model
// having the same namespace is instantiated. This is used in the event you do not want
// multiple copies of the same model to share the same namespace (if they do share a
// namespace, they receive all of the same events/messages/commands/etc).
var namespaceNameCounter = {};

// framework/namespace/utility.js
// ----------------

// Returns a normalized namespace name based off of 'name'. It will register the name counter
// if not present and increment it if it is, then return the name (with the counter appended
// if autoIncrement === true and the counter is > 0).
function indexedNamespaceName(name, autoIncrement) {
  if( isUndefined(namespaceNameCounter[name]) ) {
    namespaceNameCounter[name] = 0;
  } else {
    namespaceNameCounter[name]++;
  }
  return name + (autoIncrement === true ? namespaceNameCounter[name] : '');
}

// Duck type check for a namespace object
function isNamespace(thing) {
  return isObject(thing) && !!thing.__isNamespace;
}

// enterNamespaceName() adds a namespaceName onto the namespace stack at the current index,
// 'entering' into that namespace (it is now the current namespace).
// The namespace object returned from this method also has a pointer to its parent
function enterNamespaceName(namespaceName) {
  namespaceStack.unshift( namespaceName );
  return fw.namespace( fw.utils.currentNamespaceName() );
}

// enterNamespace() uses a current namespace definition as the one to enter into.
function enterNamespace(namespace) {
  namespaceStack.unshift( namespace.getName() );
  return namespace;
}

// Called at the after a model constructor function is run. exitNamespace()
// will shift the current namespace off of the stack, 'exiting' to the
// next namespace in the stack
function exitNamespace() {
  namespaceStack.shift();
  return fw.utils.currentNamespace();
}

// framework/namespace/proto.js
// ----------------

function createEnvelope(topic, data, expires) {
  var envelope = {
    topic: topic,
    data: data
  };

  if( !isUndefined(expires) ) {
    envelope.headers = { preserve: true };
    if(expires instanceof Date) {
      envelope.expires = expires;
    }
  }

  return envelope;
}

// Method used to trigger an event on a namespace
function triggerEventOnNamespace(eventKey, params, expires) {
  this.publish( createEnvelope('event.' + eventKey, params, expires) );
  return this;
}

// Method used to register an event handler on a namespace
function registerNamespaceEventHandler(eventKey, callback, context) {
  if( !isUndefined(context) ) {
    callback = callback.bind(context);
  }

  var handlerSubscription = this.subscribeToTopic('event.' + eventKey, callback).enlistPreserved();
  this.eventHandlers.push(handlerSubscription);

  return handlerSubscription;
}

// Method used to unregister an event handler on a namespace
function unregisterNamespaceHandler(handlerSubscription) {
  handlerSubscription.unsubscribe();
  return this;
}

// Method used to send a command to a namespace
function sendCommandToNamespace(commandKey, params, expires) {
  this.publish( createEnvelope('command.' + commandKey, params, expires) );
  return this;
}

// Method used to register a command handler on a namespace
function registerNamespaceCommandHandler(commandKey, callback, context) {
  if( !isUndefined(context) ) {
    callback = callback.bind(context);
  }

  var handlerSubscription = this.subscribeToTopic('command.' + commandKey, callback).enlistPreserved();
  this.commandHandlers.push(handlerSubscription);

  return handlerSubscription;
}

// Method used to issue a request for data from a namespace, returning the response (or undefined if no response)
// This method will return an array of responses if more than one is received.
function requestResponseFromNamespace(requestKey, params, allowMultipleResponses) {
  var response = undefined;
  var responseSubscription;

  responseSubscription = this.subscribeToTopic('request.' + requestKey + '.response', function(reqResponse) {
    if( isUndefined(response) ) {
      response = allowMultipleResponses ? [reqResponse] : reqResponse;
    } else if(allowMultipleResponses) {
      response.push(reqResponse);
    }
  });

  this.publish( createEnvelope('request.' + requestKey, params) );
  responseSubscription.unsubscribe();

  return response;
}

// Method used to register a request handler on a namespace.
// Requests sent using the specified requestKey will be called and passed in any params specified, the return value is passed back to the issuer
function registerNamespaceRequestHandler(requestKey, callback, context) {
  if( !isUndefined(context) ) {
    callback = callback.bind(context);
  }

  var requestHandler = function(params) {
    var callbackResponse = callback(params);
    this.publish( createEnvelope('request.' + requestKey + '.response', callbackResponse) );
  }.bind(this);

  var handlerSubscription = this.subscribeToTopic('request.' + requestKey, requestHandler);
  this.requestHandlers.push(handlerSubscription);

  return handlerSubscription;
}

// This effectively shuts down all requests, commands, events, and subscriptions by unsubscribing all handlers on a discreet namespace object
var handlerRepos = ['requestHandlers', 'commandHandlers', 'eventHandlers', 'subscriptions'];
function disconnectNamespaceHandlers() {
  var namespace = this;
  each(handlerRepos, function(handlerRepo) {
    invoke(namespace[handlerRepo], 'unsubscribe');
  });
  return this;
}

function getNamespaceName() {
  return this.channel;
}

// framework/namespace/exports.js
// ----------------

// Return the current namespace name.
fw.utils.currentNamespaceName = function() {
  return namespaceStack[0];
};

// Return the current namespace channel.
fw.utils.currentNamespace = function() {
  return fw.namespace( fw.utils.currentNamespaceName() );
};

// Creates and returns a new namespace instance
fw.namespace = function(namespaceName, $parentNamespace) {
  if( !isUndefined($parentNamespace) ) {
    if( isString($parentNamespace) ) {
      namespaceName = $parentNamespace + '.' + namespaceName;
    } else if( !isUndefined($parentNamespace.channel) ) {
      namespaceName = $parentNamespace.channel + '.' + namespaceName;
    }
  }
  var namespace = postal.channel(namespaceName);

  var subscriptions = namespace.subscriptions = [];
  var subscribeToTopic = namespace.subscribeToTopic = namespace.subscribe;
  namespace.subscribe = function(topic, callback) {
    var subscription = subscribeToTopic.call(namespace, topic, callback);
    subscriptions.push( subscription );
    return subscription;
  };
  namespace.unsubscribe = unregisterNamespaceHandler;

  namespace.__isNamespace = true;
  namespace.dispose = disconnectNamespaceHandlers.bind(namespace);

  namespace.commandHandlers = [];
  namespace.command = sendCommandToNamespace.bind(namespace);
  namespace.command.handler = registerNamespaceCommandHandler.bind(namespace);
  namespace.command.unregister = unregisterNamespaceHandler;

  namespace.requestHandlers = [];
  namespace.request = requestResponseFromNamespace.bind(namespace);
  namespace.request.handler = registerNamespaceRequestHandler.bind(namespace);
  namespace.request.unregister = unregisterNamespaceHandler;

  namespace.eventHandlers = [];
  namespace.event = namespace.trigger = triggerEventOnNamespace.bind(namespace);
  namespace.event.handler = registerNamespaceEventHandler.bind(namespace);
  namespace.event.unregister = unregisterNamespaceHandler;

  namespace.getName = getNamespaceName.bind(namespace);
  namespace.enter = function() {
    return enterNamespace( this );
  };
  namespace.exit = function() {
    if( fw.utils.currentNamespaceName() === this.getName() ) {
      return exitNamespace();
    }
  };

  return namespace;
};

// framework/namespace/entityMixins.js
// ----------------

// mixin provided to viewModels which enables namespace capabilities including pub/sub, cqrs, etc
entityMixins.push({
  runBeforeInit: true,
  _preInit: function( options ) {
    var $configParams = this.__getConfigParams();
    this.$namespace = enterNamespaceName( indexedNamespaceName($configParams.namespace || $configParams.name || _.uniqueId('namespace'), $configParams.autoIncrement) );
    this.$globalNamespace = fw.namespace();
  },
  mixin: {
    getNamespaceName: function() {
      return this.$namespace.getName();
    }
  },
  _postInit: function( options ) {
    exitNamespace();
  }
});


// framework/broadcastable-receivable/broacastable.js
// ------------------

// factory method which turns an observable into a broadcastable
fw.subscribable.fn.broadcastAs = function(varName, option) {
  var broadcastable = this;
  var namespace;
  var subscriptions = [];
  var namespaceSubscriptions = [];
  var isLocalNamespace = false;

  if( isObject(varName) ) {
    option = varName;
  } else {
    if( isBoolean(option) ) {
      option = {
        name: varName,
        writable: option
      };
    } else if( isObject(option) ) {
      option = extend({
        name: varName
      }, option);
    } else {
      option = {
        name: varName
      };
    }
  }

  namespace = option.namespace || fw.utils.currentNamespace();
  if( isString(namespace) ) {
    namespace = fw.namespace(namespace);
    isLocalNamespace = true;
  }

  if( !isNamespace(namespace) ) {
    throw new Error('Invalid namespace provided for broadcastAs() observable.');
  }

  if( option.writable ) {
    namespaceSubscriptions.push( namespace.subscribe( '__change.' + option.name, function( newValue ) {
      broadcastable( newValue );
    }) );
  }

  broadcastable.broadcast = function() {
    namespace.publish( option.name, broadcastable() );
    return this;
  };

  namespaceSubscriptions.push( namespace.subscribe( '__refresh.' + option.name, function() {
    namespace.publish( option.name, broadcastable() );
  }) );
  subscriptions.push( broadcastable.subscribe(function( newValue ) {
    namespace.publish( option.name, newValue );
  }) );

  broadcastable.dispose = function() {
    invoke(namespaceSubscriptions, 'unsubscribe');
    invoke(subscriptions, 'dispose');
    if( isLocalNamespace ) {
      namespace.dispose();
    }
  };

  broadcastable.__isBroadcastable = true;
  return broadcastable.broadcast();
};

// framework/broadcastable-receivable/receivable.js
// ------------------

// factory method which turns an observable into a receivable
fw.subscribable.fn.receiveFrom = function(namespace, variable) {
  var target = this;
  var receivable = this;
  var namespaceSubscriptions = [];
  var isLocalNamespace = false;
  var when = alwaysPassPredicate;

  if( isString(namespace) ) {
    namespace = fw.namespace( namespace );
    isLocalNamespace = true;
  }

  if( !isNamespace(namespace) ) {
    throw new Error('Invalid namespace provided for receiveFrom() observable.');
  }

  receivable = fw.computed({
    read: target,
    write: function( value ) {
      namespace.publish( '__change.' + variable, value );
    }
  });

  receivable.refresh = function() {
    namespace.publish( '__refresh.' + variable );
    return this;
  };

  namespaceSubscriptions.push( namespace.subscribe( variable, function( newValue ) {
    if(when(newValue)) {
      target(newValue);
    } else {
      target(undefined);
    }
  }) );

  var observableDispose = receivable.dispose;
  receivable.dispose = function() {
    invoke(namespaceSubscriptions, 'unsubscribe');
    if( isLocalNamespace ) {
      namespace.dispose();
    }
    observableDispose.call(receivable);
  };

  receivable.when = function(predicate) {
    if(isFunction(predicate)) {
      when = predicate;
    } else {
      when = function(updatedValue) {
        return updatedValue === predicate;
      };
    }
    return this;
  };

  receivable.__isReceivable = true;
  return receivable.refresh();
};

// framework/broadcastable-receivable/broacastable.js
// ------------------

fw.isBroadcastable = function(thing) {
  return isObject(thing) && !!thing.__isBroadcastable;
};

fw.isReceivable = function(thing) {
  return isObject(thing) && !!thing.__isReceivable;
};


// framework/entities/viewModel/ViewModel.js
// ------------------

var ViewModel = function(descriptor, configParams) {
  return {
    mixin: {
      $params: result(configParams, 'params'),
      __getConfigParams: function() {
        return configParams;
      },
      dispose: function() {
        if( !this._isDisposed ) {
          this._isDisposed = true;
          if( configParams.onDispose !== noop ) {
            configParams.onDispose.call(this);
          }
          each(this, propertyDisposal);
        }
      }
    },
    _postInit: function() {
      if( this.__assertPresence !== false ) {
        this.$globalNamespace.request.handler(descriptor.referenceNamespace, function(options) {
          if( !this.__isOutlet || (isObject(options) && options.includeOutlets) ) {
            if( isString(options.namespaceName) || isArray(options.namespaceName) ) {
              var myNamespaceName = this.$namespace.getName();
              if(isArray(options.namespaceName) && indexOf(options.namespaceName, myNamespaceName) !== -1) {
                return this;
              } else if(isString(options.namespaceName) && options.namespaceName === myNamespaceName) {
                return this;
              }
            } else {
              return this;
            }
          }
        }.bind(this));
      }
    }
  };
};


// framework/persistence/sync.js
// ------------------

// Map from CRUD to HTTP for our default `fw.$sync` implementation.
var methodMap = {
  'create': 'POST',
  'update': 'PUT',
  'patch':  'PATCH',
  'delete': 'DELETE',
  'read':   'GET'
};

var parseURLRegex = /^(http[s]*:\/\/[a-zA-Z0-9:\.]*)*([\/]{0,1}[\w\.:\/-]*)$/;
var parseParamsRegex = /(:[\w\.]+)/g;

function noURLError() {
  throw new Error('A "url" property or function must be specified');
};

fw.sync = function(action, dataModel, params) {
  params = params || {};
  action = action || 'noAction';

  if(!isDataModel(dataModel)) {
    throw new Error('Must supply a dataModel to fw.sync()');
  }

  var options = extend({
    type: methodMap[action],
    dataType: 'json',
    url: null,
    data: null,
    headers: {},
    emulateHTTP: fw.settings.emulateHTTP,
    emulateJSON: fw.settings.emulateJSON
  }, params);

  if(!isString(options.type)) {
    throw new Error('Invalid action (' + action + ') specified for sync operation');
  }

  var url = options.url;
  if(isNull(url)) {
    var configParams = dataModel.__getConfigParams();
    url = configParams.url;
    if(isFunction(url)) {
      url = url.call(dataModel, action);
    } else if(isString(url)) {
      if(contains(['read', 'update', 'patch', 'delete'], action)) {
        // need to append /:id to url
        url = url.replace(trailingSlashRegex, '') + '/:' + configParams.idAttribute;
      }
    } else {
      throw new Error('Must provide a URL for/on a dataModel in order to call .sync() on it');
    }
  }
  var urlPieces = (url || noURLError()).match(parseURLRegex);
  var baseURL = urlPieces[1] || '';
  options.url = last(urlPieces);

  // replace any interpolated parameters
  var urlParams = options.url.match(parseParamsRegex);
  if(urlParams) {
    each(urlParams, function(param) {
      options.url = options.url.replace(param, dataModel.$toJS(param.substr(1)));
    });
  }
  options.url = baseURL + options.url;

  if(isNull(options.data) && dataModel && contains(['create', 'update', 'patch'], action)) {
    options.contentType = 'application/json';
    options.data = options.attrs || dataModel.$toJS();
  }

  // For older servers, emulate JSON by encoding the request into an HTML-form.
  if(options.emulateJSON) {
    options.contentType = 'application/x-www-form-urlencoded';
    options.data = options.data ? { model: options.data } : {};
  }

  // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
  // And an `X-HTTP-Method-Override` header.
  if(options.emulateHTTP && contains(['PUT', 'DELETE', 'PATCH'], options.type)) {
    options.type = 'POST';

    if(options.emulateJSON) {
      options.data._method = options.type;
    }
    extend(options.headers, { 'X-HTTP-Method-Override': options.type });
  }

  // Don't process data on a non-GET request.
  if(options.type !== 'GET' && !options.emulateJSON) {
    options.processData = false;
  }

  // Pass along `textStatus` and `errorThrown` from jQuery.
  var error = options.error;
  options.error = function(xhr, textStatus, errorThrown) {
    options.textStatus = textStatus;
    options.errorThrown = errorThrown;
    if (error) error.call(options.context, xhr, textStatus, errorThrown);
  };

  var xhr = options.xhr = fw.ajax(options);
  dataModel.$namespace.trigger('request', { dataModel: dataModel, xhr: xhr, options: options });
  return xhr;
};

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


// framework/entities/router/init.js
// ------------------

// Regular expressions used to parse a uri
var optionalParamRegex = /\((.*?)\)/g;
var namedParamRegex = /(\(\?)?:\w+/g;
var splatParamRegex = /\*\w*/g;
var escapeRegex = /[\-{}\[\]+?.,\\\^$|#\s]/g;
var hashMatchRegex = /(^\/#)/;

var noComponentSelected = '_noComponentSelected';
var invalidRoutePathIdentifier = '___invalid-route';

var routesAreCaseSensitive = true;

var nullRouterData = {
  context: noop,
  childRouters: extend( noop.bind(), { push: noop } ),
  isRelative: function() { return false; }
};

var $nullRouter = {
  path: emptyStringResult,
  __router: function(propName) {
    if(arguments.length) {
      return nullRouterData[propName];
    }
    return nullRouterData;
  },
  path: function() { return ''; },
  __isNullRouter: true
};

var baseRoute = {
  controller: noop,
  indexedParams: [],
  namedParams: {},
  __isRoute: true
};

var baseRouteDescription = {
  filter: alwaysPassPredicate,
  __isRouteDesc: true
};

// framework/entities/router/utility.js
// -----------

function transformRouteConfigToDesc(routeDesc) {
  return extend({ id: uniqueId('route') }, baseRouteDescription, routeDesc );
}

function sameRouteDescription(desc1, desc2) {
  return desc1.id === desc2.id && isEqual(desc1.indexedParams, desc2.indexedParams) && isEqual(desc1.namedParams, desc2.namedParams);
}

// Convert a route string to a regular expression which is then used to match a uri against it and determine
// whether that uri matches the described route as well as parse and retrieve its tokens
function routeStringToRegExp(routeString) {
  routeString = routeString
    .replace(escapeRegex, "\\$&")
    .replace(optionalParamRegex, "(?:$1)?")
    .replace(namedParamRegex, function(match, optional) {
      return optional ? match : "([^\/]+)";
    })
    .replace(splatParamRegex, "(.*?)");

  return new RegExp('^' + routeString + (routeString !== '/' ? '(\\/.*)*$' : '$'), routesAreCaseSensitive ? undefined : 'i');
}

function historyIsReady() {
  var typeOfHistory = typeof History;
  var isReady = ['function','object'].indexOf(typeOfHistory) !== -1 && has(History, 'Adapter');

  if(isReady && !History.Adapter.isSetup) {
    History.Adapter.isSetup = true;

    // why .unbind() is not already present in History.js is beyond me
    History.Adapter.unbind = function(callback) {
      each(History.Adapter.handlers, function(handler) {
        handler.statechange = filter(handler.statechange, function(stateChangeHandler) {
          return stateChangeHandler !== callback;
        });
      });
    };
  }

  return isReady;
}

function isNullRouter(thing) {
  return isObject(thing) && !!thing.__isNullRouter;
}

function isRoute(thing) {
  return isObject(thing) && !!thing.__isRoute;
}

// Recursive function which will locate the nearest $router from a given ko $context
// (travels up through $parentContext chain to find the router if not found on the
// immediate $context). Returns $nullRouter if none is found.
function nearestParentRouter($context) {
  var $parentRouter = $nullRouter;
  if( isObject($context) ) {
    if( isRouter($context.$data) ) {
      // found router in this context
      $parentRouter = $context.$data;
    } else if( isObject($context.$parentContext) || (isObject($context.$data) && isObject($context.$data.$parentContext)) ) {
      // search through next parent up the chain
      $parentRouter = nearestParentRouter( $context.$parentContext || $context.$data.$parentContext );
    }
  }
  return $parentRouter;
}

// framework/entities/router/outlet.js
// ------------------

var noParentViewModelError = { $namespace: { getName: function() { return 'NO-VIEWMODEL-IN-CONTEXT'; } } };

// This custom binding binds the outlet element to the $outlet on the router, changes on its 'route' (component definition observable) will be applied
// to the UI and load in various views
fw.virtualElements.allowedBindings.$bind = true;
fw.bindingHandlers.$bind = {
  init: function(element, valueAccessor, allBindings, outletViewModel, bindingContext) {
    var $parentViewModel = ( isObject(bindingContext) ? (bindingContext.$parent || noParentViewModelError) : noParentViewModelError);
    var $parentRouter = nearestParentRouter(bindingContext);
    var outletName = outletViewModel.outletName;

    if( isRouter($parentRouter) ) {
      // register this outlet with the router so that updates will propagate correctly
      // take the observable returned and define it on the outletViewModel so that outlet route changes are reflected in the view
      outletViewModel.$route = $parentRouter.$outlet( outletName );
    } else {
      throw new Error('Outlet [' + outletName + '] defined inside of viewModel [' + $parentViewModel.$namespace.getName() + '] but no router was defined.');
    }
  }
};

function $routerOutlet(outletName, componentToDisplay, options) {
  options = options || {};
  if( isFunction(options) ) {
    options = { onComplete: options };
  }

  var viewModelParameters = options.params;
  var onComplete = options.onComplete || noop;
  var outlets = this.outlets;

  outletName = fw.unwrap( outletName );
  if( !isObservable(outlets[outletName]) ) {
    outlets[outletName] = fw.observable({
      name: noComponentSelected,
      params: {},
      __getOnCompleteCallback: function() { return noop; }
    }).broadcastAs({ name: outletName, namespace: this.$namespace });
  }

  var outlet = outlets[outletName];
  var currentOutletDef = outlet();
  var valueHasMutated = false;
  var isInitialLoad = outlet().name === noComponentSelected;

  if( !isUndefined(componentToDisplay) && currentOutletDef.name !== componentToDisplay ) {
    currentOutletDef.name = componentToDisplay;
    valueHasMutated = true;
  }

  if( !isUndefined(viewModelParameters) ) {
    currentOutletDef.params = viewModelParameters;
    valueHasMutated = true;
  }

  if( valueHasMutated ) {
    // Return the onComplete callback once the DOM is injected in the page.
    // For some reason, on initial outlet binding only calls update once. Subsequent
    // changes get called twice (correct per docs, once upon initial binding, and once
    // upon injection into the DOM). Perhaps due to usage of virtual DOM for the component?
    var callCounter = (isInitialLoad ? 0 : 1);

    currentOutletDef.__getOnCompleteCallback = function(element) {
      var isComplete = callCounter === 0;
      callCounter--;
      if( isComplete ) {
        return function addBindingOnComplete() {
          setTimeout(function() {
            if(element.className.indexOf(bindingClassName) === -1) {
              element.className += ' ' + bindingClassName;
            }
          }, animationIteration);

          onComplete.call(this, element);
        };
      }
      element.className = element.className.replace(' ' + bindingClassName, '');
      return noop;
    };

    outlet.valueHasMutated();
  }

  return outlet;
};

function registerOutletComponents() {
  internalComponents.push('outlet');
  fw.components.register('outlet', {
    autoIncrement: true,
    viewModel: function(params) {
      this.outletName = fw.unwrap(params.name);
      this.__isOutlet = true;
    },
    template: '<!-- ko $bind, component: $route --><!-- /ko -->'
  });

  internalComponents.push(noComponentSelected);
  fw.components.register(noComponentSelected, {
    viewModel: function(params) {
      this.__assertPresence = false;
    },
    template: '<div class="no-component-selected"></div>'
  });
};

runPostInit.push(registerOutletComponents);

// framework/entities/router/routeBinding.js
// -----------

function hasClass(element, className) {
  return element.className.match( new RegExp('(\\s|^)' + className + '(\\s|$)') );
}

function addClass(element, className) {
  if( !hasClass(element, className) ) {
    element.className += (element.className.length ? ' ' : '') + className;
  }
}

function removeClass(element, className) {
  if( hasClass(element, className) ) {
    var classNameRegex = new RegExp('(\\s|^)' + className + '(\\s|$)');
    element.className = element.className.replace(classNameRegex, ' ');
  }
}

fw.bindingHandlers.$route = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var $myRouter = nearestParentRouter(bindingContext);
    var urlValue = valueAccessor();
    var elementIsSetup = false;
    var stateTracker = null;
    var hashOnly = null;

    var routeHandlerDescription = {
      on: 'click',
      url: function defaultURLForRoute() { return null; },
      addActiveClass: true,
      activeClass: null,
      handler: function defaultHandlerForRoute(event, url) {
        if(hashOnly) {
          windowObject.location.hash = routeHandlerDescription.url;
          return false;
        }

        if( !isFullURL(url) && event.which !== 2 ) {
          event.preventDefault();
          return true;
        }
        return false;
      }
    };

    if( isObservable(urlValue) || isFunction(urlValue) || isString(urlValue) ) {
      routeHandlerDescription.url = urlValue;
    } else if( isObject(urlValue) ) {
      extend(routeHandlerDescription, urlValue);
    } else if( !urlValue ) {
      routeHandlerDescription.url = element.getAttribute('href');
    } else {
      throw new Error('Unknown type of url value provided to $route [' + typeof urlValue + ']');
    }

    var routeHandlerDescriptionURL = routeHandlerDescription.url;
    if( !isFunction(routeHandlerDescriptionURL) ) {
      routeHandlerDescription.url = function() { return routeHandlerDescriptionURL; };
    }

    function getRouteURL(includeParentPath) {
      var parentRoutePath = '';
      var routeURL = routeHandlerDescription.url();
      var myLinkPath = routeURL || element.getAttribute('href') || '';

      if(!isNull(routeURL)) {
        if( isUndefined(routeURL) ) {
          routeURL = myLinkPath;
        }

        if( !isFullURL(myLinkPath) ) {
          if( !hasPathStart(myLinkPath) ) {
            var currentRoute = $myRouter.currentRoute();
            if(hasHashStart(myLinkPath)) {
              if(!isNull(currentRoute)) {
                myLinkPath = $myRouter.currentRoute().segment + myLinkPath;
              }
              hashOnly = true;
            } else {
              // relative url, prepend current segment
              if(!isNull(currentRoute)) {
                myLinkPath = $myRouter.currentRoute().segment + '/' + myLinkPath;
              }
            }
          }

          if( includeParentPath && !isNullRouter($myRouter) ) {
            myLinkPath = $myRouter.__router('parentRouter')().path() + myLinkPath;
          }

          if(fw.routers.html5History() === false) {
            myLinkPath = '#' + (myLinkPath.indexOf('/') === 0 ? myLinkPath.substring(1) : myLinkPath);
          }
        }

        return myLinkPath;
      }

      return null;
    };
    var routeURLWithParentPath = getRouteURL.bind(null, true);
    var routeURLWithoutParentPath = getRouteURL.bind(null, false);

    function checkForMatchingSegment(mySegment, newRoute) {
      if(isString(mySegment)) {
        var currentRoute = $myRouter.currentRoute();
        mySegment = mySegment.replace(startingHashRegex, '/');

        if(isObject(currentRoute)) {
          if(routeHandlerDescription.addActiveClass) {
            var activeRouteClassName = routeHandlerDescription.activeClass || fw.routers.activeRouteClassName();
            if(mySegment === '/') {
              mySegment = '';
            }

            if(!isNull(newRoute) && newRoute.segment === mySegment && isString(activeRouteClassName) && activeRouteClassName.length) {
              // newRoute.segment is the same as this routers segment...add the activeRouteClassName to the element to indicate it is active
              addClass(element, activeRouteClassName);
            } else if( hasClass(element, activeRouteClassName) ) {
              removeClass(element, activeRouteClassName);
            }
          }
        }
      }
    };

    function setUpElement() {
      var myCurrentSegment = routeURLWithoutParentPath();
      var routerConfig = $myRouter.__getConfigParams();
      if( element.tagName.toLowerCase() === 'a' ) {
        element.href = (fw.routers.html5History() ? '' : '/') + routerConfig.baseRoute + routeURLWithParentPath();
      }

      if( isObject(stateTracker) ) {
        stateTracker.dispose();
      }
      stateTracker = $myRouter.currentRoute.subscribe( checkForMatchingSegment.bind(null, myCurrentSegment) );

      if(elementIsSetup === false) {
        elementIsSetup = true;
        checkForMatchingSegment(myCurrentSegment, $myRouter.currentRoute());

        $myRouter.__router('parentRouter').subscribe(setUpElement);
        fw.utils.registerEventHandler(element, routeHandlerDescription.on, function(event) {
          var currentRouteURL = routeURLWithoutParentPath();
          var handlerResult = routeHandlerDescription.handler.call(viewModel, event, currentRouteURL);
          if( handlerResult ) {
            if( isString(handlerResult) ) {
              currentRouteURL = handlerResult;
            }
            if( isString(currentRouteURL) && !isFullURL( currentRouteURL ) ) {
              $myRouter.setState( currentRouteURL );
            }
          }
        });
      }
    }

    if( isObservable(routeHandlerDescription.url) ) {
      $myRouter.__router('subscriptions').push( routeHandlerDescription.url.subscribe(setUpElement) );
    }
    setUpElement();

    ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
      if( isObject(stateTracker) ) {
        stateTracker.dispose();
      }
    });
  }
};

// framework/entities/router/exports.js
// -----------

extend(fw.routers, {
  // baseRoute / path which will always be stripped from the URL prior to processing the route
  baseRoute: fw.observable(''),
  activeRouteClassName: fw.observable('active'),
  disableHistory: fw.observable(false).broadcastAs({ name: 'disableHistory', namespace: fw.namespace() }),
  html5History: function() {
    return footwork.hasHTML5History;
  },
  getNearestParent: function($context) {
    var $parentRouter = nearestParentRouter($context);
    return (!isNullRouter($parentRouter) ? $parentRouter : null);
  }
});

extend(fw.outlets, {
  registerView: function(viewName, templateHTML) {
    fw.components.register(viewName, { template: templateHTML });
  },
  registerViewLocation: function(viewName, viewLocation) {
    fw.components.registerLocation(viewName, { template: viewLocation })
  }
});

// framework/entities/router/Router.js
// ------------------

var Router = function(descriptor, configParams) {
  return {
    _preInit: function( params ) {
      var $router = this;
      var router = {};  // internal data/etc
      var routerConfigParams = extend({}, configParams);

      this.__getConfigParams = function() {
        return routerConfigParams;
      };

      var __router = this.__router = function privateData(propName, propValue) {
        var isGetBaseObjOp = arguments.length === 0;
        var isReadOp = arguments.length === 1;
        var isWriteOp = arguments.length === 2;

        if(isGetBaseObjOp) {
          return router;
        } else if(isReadOp) {
          return router[propName];
        } else if(isWriteOp) {
          router[propName] = propValue;
          return router[propName];
        }
      };

      routerConfigParams.baseRoute = fw.routers.baseRoute() + (result(routerConfigParams, 'baseRoute') || '');

      var subscriptions = router.subscriptions = fw.observableArray();
      router.urlParts = fw.observable();
      router.childRouters = fw.observableArray();
      router.parentRouter = fw.observable($nullRouter);
      router.context = fw.observable();
      router.historyIsEnabled = fw.observable(false);
      router.disableHistory = fw.observable().receiveFrom(this.$globalNamespace, 'disableHistory');
      router.currentState = fw.observable('').broadcastAs('currentState');

      function trimBaseRoute(url) {
        var routerConfig = $router.__getConfigParams();
        if( !isNull(routerConfig.baseRoute) && url.indexOf(routerConfig.baseRoute) === 0 ) {
          url = url.substr(routerConfig.baseRoute.length);
          if(url.length > 1) {
            url = url.replace(hashMatchRegex, '/');
          }
        }
        return url;
      }

      function normalizeURL(url) {
        var urlParts = parseUri(url);
        router.urlParts(urlParts);

        if(!fw.routers.html5History()) {
          if(url.indexOf('#') !== -1) {
            url = '/' + urlParts.anchor.replace(startingSlashRegex, '');
          } else if(router.currentState() !== url) {
            url = '/';
          }
        } else {
          url = urlParts.path;
        }

        return trimBaseRoute(url);
      }
      router.normalizeURL = normalizeURL;

      function getUnknownRoute() {
        var unknownRoute = findWhere(($router.routeDescriptions || []).reverse(), { unknown: true }) || null;

        if( !isNull(unknownRoute) ) {
          unknownRoute = extend({}, baseRoute, {
            id: unknownRoute.id,
            controller: unknownRoute.controller,
            title: unknownRoute.title,
            segment: ''
          });
        }

        return unknownRoute;
      }

      function getRouteForURL(url) {
        var route = null;
        var parentRoutePath = router.parentRouter().path() || '';
        var unknownRoute = getUnknownRoute();

        // If this is a relative router we need to remove the leading parentRoutePath section of the URL
        if(router.isRelative() && parentRoutePath.length > 0 && (routeIndex = url.indexOf(parentRoutePath + '/')) === 0) {
          url = url.substr( parentRoutePath.length );
        }

        // find all routes with a matching routeString
        var matchedRoutes = reduce($router.routeDescriptions, function(matches, routeDescription) {
          var routeString = routeDescription.route;
          var routeParams = [];

          if( isString(routeString) ) {
            routeParams = url.match(routeStringToRegExp(routeString));
            if( !isNull(routeParams) && routeDescription.filter.call($router, routeParams, router.urlParts.peek()) ) {
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
      }

      function DefaultAction() {
        delete router.currentRouteDescription;
        $router.$outlet.reset();
      }

      function RoutedAction(routeDescription) {
        if( !isUndefined(routeDescription.title) ) {
          document.title = isFunction(routeDescription.title) ? routeDescription.title.call($router, routeDescription.namedParams, this__router('urlParts')()) : routeDescription.title;
        }

        if( isUndefined(router.currentRouteDescription) || !sameRouteDescription(router.currentRouteDescription, routeDescription) ) {
          (routeDescription.controller || noop).apply( $router, values(routeDescription.namedParams) );
          router.currentRouteDescription = routeDescription;
        }
      }

      function getActionForRoute(routeDescription) {
        var Action;

        if( isRoute(routeDescription) ) {
          Action = RoutedAction.bind($router, routeDescription);
        }

        return Action || DefaultAction;
      }

      router.isRelative = fw.computed(function() {
        return routerConfigParams.isRelative && !isNullRouter( this.parentRouter() );
      }, router);

      this.currentRoute = router.currentRoute = fw.computed(function() {
        return getRouteForURL(normalizeURL(this.currentState()) );
      }, router);

      this.path = router.path = fw.computed(function() {
        var currentRoute = this.currentRoute();
        var routeSegment = '/';

        if( isRoute(currentRoute) ) {
          routeSegment = (currentRoute.segment === '' ? '/' : currentRoute.segment);
        }

        return (this.isRelative() ? this.parentRouter().path() : '') + routeSegment;
      }, router);

      this.$namespace.command.handler('setState', this.setState, this);
      this.$namespace.request.handler('currentRoute', function() { return this.currentRoute(); }, this);
      this.$namespace.request.handler('urlParts', function() { return router.urlParts(); }, this);

      var parentPathSubscription;
      var $previousParent = $nullRouter;
      subscriptions.push(router.parentRouter.subscribe(function( $parentRouter ) {
        if( !isNullRouter($previousParent) && $previousParent !== $parentRouter ) {
          $previousParent.router.childRouters.remove(this);

          if(parentPathSubscription) {
            subscriptions.remove(parentPathSubscription);
            parentPathSubscription.dispose();
          }
          subscriptions.push(parentPathSubscription = $parentRouter.path.subscribe(function triggerRouteRecompute() {
            $router.router.currentState.notifySubscribers();
          }));
        }
        $parentRouter.__router('childRouters').push(this);
        $previousParent = $parentRouter;
      }, this));

      // Automatically trigger the new Action() whenever the currentRoute() updates
      subscriptions.push( router.currentRoute.subscribe(function getActionForRouteAndTrigger( newRoute ) {
        if(router.currentState().length) {
          getActionForRoute(newRoute)( /* get and call the action for the newRoute */ );
        }
      }, this) );

      this.outlets = {};
      this.$outlet = $routerOutlet.bind(this);
      this.$outlet.reset = function() {
        each( this.outlets, function(outlet) {
          outlet({ name: noComponentSelected, params: {} });
        });
      }.bind(this);

      if( !isUndefined(routerConfigParams.unknownRoute) ) {
        if( isFunction(routerConfigParams.unknownRoute) ) {
          routerConfigParams.unknownRoute = { controller: routerConfigParams.unknownRoute };
        }
        routerConfigParams.routes.push( extend( routerConfigParams.unknownRoute, { unknown: true } ) );
      }
      this.setRoutes( routerConfigParams.routes );

      if( routerConfigParams.activate === true ) {
        subscriptions.push(router.context.subscribe(function activateRouterAfterNewContext( $context ) {
          if( isObject($context) ) {
            this.activate($context);
          }
        }, this));
      }
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
        $context = $context || this.__router('context')();
        $parentRouter = $parentRouter || nearestParentRouter($context);

        if( !isNullRouter($parentRouter) ) {
          this.__router('parentRouter')($parentRouter);
        } else if( isObject($context) ) {
          $parentRouter = nearestParentRouter($context);
          if( $parentRouter !== this ) {
            this.__router('parentRouter')($parentRouter);
          }
        }

        if( !this.__router('historyIsEnabled')() ) {
          if( historyIsReady() && !this.__router('disableHistory')() ) {
            History.Adapter.bind( windowObject, 'popstate', this.__router('stateChangeHandler', function(event) {
              var url = '';
              if(!fw.routers.html5History() && windowObject.location.hash.length > 1) {
                url = windowObject.location.hash;
              } else {
                url = windowObject.location.pathname + windowObject.location.hash;
              }

              this.__router('currentState')( this.__router('normalizeURL')(url) );
            }.bind(this) ));
            this.__router('historyIsEnabled')(true);
          } else {
            this.__router('historyIsEnabled')(false);
          }
        }

        if( this.__router('currentState')() === '' ) {
          this.setState();
        }
        return this;
      },
      setState: function(url) {
        if( this.__router('historyIsEnabled')() && !this.__router('disableHistory')() ) {
          if(isString(url)) {
            var historyAPIWorked = true;
            try {
              historyAPIWorked = History.pushState(null, '', this.__getConfigParams().baseRoute + this.__router('parentRouter')().path() + url.replace(startingHashRegex, '/'));
            } catch(historyException) {
              historyAPIWorked = false;
            } finally {
              if(historyAPIWorked) {
                return;
              }
            }
          } else if(isFunction(History.getState)) {
            this.__router('currentState')( this.__router('normalizeURL')(History.getState().url ) );
          }
        } else if(isString(url)) {
          this.__router('currentState')( this.__router('normalizeURL')(url ) );
        } else {
          this.__router('currentState')('/');
        }

        if(!historyIsReady()) {
          var routePath = this.path();
          each(this.__router('childRouters')(), function(childRouter) {
            childRouter.__router('currentState')(routePath);
          });
        }

        return this;
      },
      dispose: function() {
        var $parentRouter = this.__router('parentRouter')();
        if( !isNullRouter($parentRouter) ) {
          $parentRouter.__router('childRouters').remove(this);
        }

        if( this.__router('historyIsEnabled')() && historyIsReady() ) {
          History.Adapter.unbind( this.__router('stateChangeHandler') );
        }

        this.$namespace.dispose();
        this.$globalNamespace.dispose();
        invoke(this.__router('subscriptions'), 'dispose');

        each(omit(this, function(property) {
          return isEntity(property);
        }), propertyDisposal);

        each(omit(this.__router(), function(property) {
          return isEntity(property);
        }), propertyDisposal);
      }
    }
  };
};



// framework/entities/descriptorConfig.js
// ------------------

entityDescriptors = entityDescriptors.concat([
  {
    tagName: 'viewmodel',
    methodName: 'viewModel',
    defaultLocation: '/viewModel/',
    resource: fw.viewModels,
    behavior: [ ViewModel ],
    defaultConfig: {
      namespace: undefined,
      autoRegister: false,
      autoIncrement: false,
      extend: {},
      mixins: undefined,
      afterBinding: noop,
      onDispose: noop
    }
  }, {
    tagName: 'datamodel',
    methodName: 'dataModel',
    defaultLocation: '/dataModel/',
    resource: fw.dataModels,
    behavior: [ ViewModel, DataModel ],
    defaultConfig: {
      idAttribute: 'id',
      url: null,
      namespace: undefined,
      autoRegister: false,
      autoIncrement: true,
      extend: {},
      mixins: undefined,
      afterBinding: noop,
      onDispose: noop
    }
  }, {
    tagName: 'router',
    methodName: 'router',
    defaultLocation: '/',
    resource: fw.routers,
    behavior: [ ViewModel, Router ],
    defaultConfig: {
      namespace: '$router',
      autoRegister: false,
      autoIncrement: false,
      extend: {},
      mixins: undefined,
      afterBinding: noop,
      onDispose: noop,
      baseRoute: null,
      isRelative: true,
      activate: true,
      routes: []
    }
  }
]);

// framework/entities/bindingInit.js
// ------------------

function entityBinder(element, params, Entity) {
  var entityObj;
  if( isFunction(Entity) ) {
    entityObj = new Entity(params);
  } else {
    entityObj = Entity;
  }
  entityObj.$parentContext = fw.contextFor(element.parentElement || element.parentNode);

  // Have to create a wrapper element for the contents of the element. Cannot bind to
  // existing element as it has already been bound against.
  var wrapperNode = document.createElement('binding-wrapper');
  element.insertBefore(wrapperNode, element.firstChild);

  var childrenToInsert = [];
  each(element.children, function(child) {
    if(!isUndefined(child) && child !== wrapperNode) {
      childrenToInsert.push(child);
    }
  });

  each(childrenToInsert, function(child) {
    wrapperNode.appendChild(child);
  });

  fw.applyBindings(entityObj, wrapperNode);
};

// Monkey patch enables the entity to initialize a viewModel and bind to the html as intended (with lifecycle events)
// TODO: Do this differently once this is resolved: https://github.com/knockout/knockout/issues/1463
var originalComponentInit = fw.bindingHandlers.component.init;

function getResourceLocation(moduleName) {
  var resource = this;
  var resourceLocation = null;

  if( resource.isRegistered(moduleName) ) {
    // viewModel was manually registered, we preferentially use it
    resourceLocation = resource.getRegistered(moduleName);
  } else if( isFunction(require) && isFunction(require.specified) && require.specified(moduleName) ) {
    // we have found a matching resource that is already cached by require, lets use it
    resourceLocation = moduleName;
  } else {
    resourceLocation = resource.getLocation(moduleName);
  }

  return resourceLocation;
}

function initEntityTag(tagName, element, valueAccessor, allBindings, viewModel, bindingContext) {
  var theValueAccessor = valueAccessor;
  if(tagName === '__elementBased') {
    tagName = element.tagName;
  }

  if(isString(tagName)) {
    tagName = tagName.toLowerCase();
    if( entityDescriptors.tagNameIsPresent(tagName) ) {
      var values = valueAccessor();
      var moduleName = ( !isUndefined(values.params) ? fw.unwrap(values.params.name) : undefined ) || element.getAttribute('module') || element.getAttribute('data-module');
      var bindModel = entityBinder.bind(null, element, values.params);
      var resource = entityDescriptors.resourceFor(tagName);
      var getResourceLocationFor = getResourceLocation.bind(resource);

      if(isNull(moduleName) && isString(values)) {
        moduleName = values;
      }

      if( !isUndefined(moduleName) && !isNull(resource) ) {
        var resourceLocation = getResourceLocationFor(moduleName);

        if( isString(resourceLocation) ) {
          if( isFunction(require) ) {
            if( isPath(resourceLocation) ) {
              resourceLocation = resourceLocation + resource.getFileName(moduleName);
            }

            require([ resourceLocation ], bindModel);
          } else {
            throw new Error('Uses require, but no AMD loader is present');
          }
        } else if( isFunction(resourceLocation) ) {
          bindModel( resourceLocation );
        } else if( isObject(resourceLocation) ) {
          if( isObject(resourceLocation.instance) ) {
            bindModel( resourceLocation.instance );
          } else if( isFunction(resourceLocation.createViewModel) ) {
            bindModel( resourceLocation.createViewModel( values.params, { element: element } ) );
          }
        }
      }

      return { 'controlsDescendantBindings': true };
    } else if( tagName === 'outlet' ) {
      // we patch in the 'name' of the outlet into the params valueAccessor on the component definition (if necessary and available)
      var outletName = element.getAttribute('name') || element.getAttribute('data-name');
      if( outletName ) {
        theValueAccessor = function() {
          var valueAccessorResult = valueAccessor();
          if( !isUndefined(valueAccessorResult.params) && isUndefined(valueAccessorResult.params.name) ) {
            valueAccessorResult.params.name = outletName;
          }
          return valueAccessorResult;
        };
      }
    }
  }

  return originalComponentInit(element, theValueAccessor, allBindings, viewModel, bindingContext);
};

fw.bindingHandlers.component.init = initEntityTag.bind(null, '__elementBased');

// NOTE: Do not use the $router binding yet, it is incomplete
fw.bindingHandlers.$router = {
  preprocess: function(moduleName) {
    return "'" + moduleName + "'";
  },
  init: initEntityTag.bind(null, 'router')
};

// NOTE: Do not use the $viewModel binding yet, it is incomplete
fw.bindingHandlers.$viewModel = {
  preprocess: function(moduleName) {
    return "'" + moduleName + "'";
  },
  init: initEntityTag.bind(null, 'viewModel')
};

// framework/entities/lifecycle.js
// ------------------

// Provides lifecycle functionality and $context for a given entity and element
function setupContextAndLifeCycle(entity, element) {
  if( isEntity(entity) ) {
    element = element || document.body;

    var context;
    var elementContext;
    var $configParams = entity.__getConfigParams();
    if(element.tagName.toLowerCase() === 'binding-wrapper') {
      element = element.parentElement || element.parentNode;
    }

    if(element.className.indexOf(entityClassName) === -1) {
      element.className += entityClassName;
    }

    entity.$element = element;
    entity.$context = elementContext = fw.contextFor(element);

    if( isFunction($configParams.afterBinding) ) {
        var afterBinding = noop;
        if(isFunction($configParams.afterBinding)) {
          afterBinding = $configParams.afterBinding;
        }

        $configParams.afterBinding = function(element) {
          setTimeout(function() {
            if(element.className.indexOf(bindingClassName) === -1)
            element.className += ' ' + bindingClassName;
          }, animationIteration);
          afterBinding.call(this, element);
        };
      $configParams.afterBinding.call(entity, element);
    }

    if( isRouter(entity) ) {
      entity.__router('context')( elementContext );
    }

    if( !isUndefined(element) ) {
      fw.utils.domNodeDisposal.addDisposeCallback(element, function() {
        entity.dispose();
      });
    }
  }
}

// framework/entities/applyBinding.js
// ------------------

var historyStateAssessed = false;
function assessHistoryState() {
  if(!historyStateAssessed) {
    historyStateAssessed = true;

    footwork.hasHTML5History = !!windowObject.history && !!windowObject.history.pushState;
    if(!isUndefined(windowObject.History) && isObject(windowObject.History.options) && windowObject.History.options.html4Mode) {
      // user is overriding to force html4mode hash-based history
      footwork.hasHTML5History = false;
    }
  }
}

// Override the original applyBindings method to assess history API state and provide viewModel/dataModel/router life-cycle
var originalApplyBindings = fw.applyBindings;
fw.applyBindings = function(viewModel, element) {
  // must initialize default require context (https://github.com/jrburke/requirejs/issues/1305#issuecomment-87924865)
  isFunction(require) && require([]);

  assessHistoryState();
  originalApplyBindings(viewModel, element);
  setupContextAndLifeCycle(viewModel, element);
};

// framework/entities/createFactories.js
// ------------------

function isBeforeInitMixin(mixin) {
  return !!mixin.runBeforeInit;
}

function entityMixin(thing) {
  return ((isArray(thing) && thing.length) || isObject(thing) ? thing : {});
}

function entityClassFactory(descriptor, configParams) {
  var entityCtor = null;

  configParams = extend({}, descriptor.defaultConfig, configParams || {});

  var descriptorBehavior = [];
  map(descriptor.behavior, function(behavior, index) {
    descriptorBehavior.push( isFunction(behavior) ? behavior(descriptor, configParams || {}) : behavior );
  });

  var ctor = configParams.initialize || configParams.viewModel || noop;
  var userExtendProps = { mixin: configParams.extend || {} };
  if( !descriptor.isEntityCtor(ctor) ) {
    var isEntityDuckTagMixin = {};
    isEntityDuckTagMixin[descriptor.isEntityDuckTag] = true;
    isEntityDuckTagMixin = { mixin: isEntityDuckTagMixin };

    var newInstanceCheckMixin = {
      _preInit: function() {
        if(this === windowObject) {
          throw new Error('Must use the new operator when instantiating a ' + descriptor.methodName + '.');
        }
      }
    };
    var afterInitMixins = reject(entityMixins, isBeforeInitMixin);
    var beforeInitMixins = map(filter(entityMixins, isBeforeInitMixin), function(mixin) {
      delete mixin.runBeforeInit;
      return mixin;
    });

    var composure = [ ctor ].concat(
      entityMixin(userExtendProps),
      entityMixin(newInstanceCheckMixin),
      entityMixin(isEntityDuckTagMixin),
      entityMixin(afterInitMixins),
      entityMixin(beforeInitMixins),
      entityMixin(configParams.mixins),
      entityMixin(descriptorBehavior)
    );

    entityCtor = riveter.compose.apply( undefined, composure );

    entityCtor[ descriptor.isEntityCtorDuckTag ] = true;
    entityCtor.__configParams = configParams;
  } else {
    // user has specified another entity constructor as the 'initialize' function, we extend it with the current constructor to create an inheritance chain
    entityCtor = ctor;
  }

  if( !isNull(entityCtor) && isFunction(configParams.parent) ) {
    entityCtor.inherits(configParams.parent);
  }

  if( configParams.autoRegister ) {
    var namespace = configParams.namespace;
    if( descriptor.resource.isRegistered(namespace) ) {
      if( descriptor.resource.getRegistered(namespace) !== entityCtor ) {
        throw new Error('"' + namespace + '" has already been registered as a ' + descriptor.methodName + ', autoRegister failed.');
      }
    } else {
      descriptor.resource.register(namespace, entityCtor);
    }
  }

  return entityCtor;
}

function createEntityFactories() {
  // create the class factory method for each entity descriptor
  filter(entityDescriptors, function getOnlyDescriptorsWithMethodName(descriptor) {
    return isString(descriptor.methodName);
  }).forEach(function setupClassFactory(descriptor) {
    fw[descriptor.methodName] = entityClassFactory.bind(null, descriptor);
  });
};

runPostInit.unshift(createEntityFactories);

// framework/entities/init.js
// ----------------

function makeBooleanChecks(descriptor) {
  return {
    isEntityCtor: function isEntityCtor(thing) {
      return isFunction(thing) && !!thing[ descriptor.isEntityCtorDuckTag ];
    },
    isEntity: function isEntity(thing) {
      return isObject(thing) && !!thing[ descriptor.isEntityDuckTag ];
    }
  };
}

entityDescriptors = map(entityDescriptors, function prepareDescriptor(descriptor) {
  var methodName = descriptor.methodName.charAt(0).toUpperCase() + descriptor.methodName.slice(1);
  descriptor = extend({
    resourceLocations: {},
    registered: {},
    fileExtensions: fw.observable('.js'),
    isEntityCtorDuckTag: '__is' + methodName + 'Ctor',
    isEntityDuckTag: '__is' + methodName,
    referenceNamespace: (isString(descriptor.methodName) ? ('__' + descriptor.methodName + 'Reference') : undefined)
  }, descriptor);

  return extend(descriptor, makeBooleanChecks(descriptor));
});

extend(entityDescriptors, {
  tagNameIsPresent: function isEntityTagNameDescriptorPresent(tagName) {
    return filter(this, function matchingTagNames(descriptor) {
      return descriptor.tagName === tagName;
    }).length > 0;
  },
  resourceFor: function getResourceForEntityTagName(tagName) {
    return reduce(this, function(resource, descriptor) {
      if(descriptor.tagName === tagName) {
        resource = descriptor.resource;
      }
      return resource;
    }, null);
  },
  getDescriptor: function getDescriptor(methodName) {
    return reduce(this, function reduceDescriptor(foundDescriptor, descriptor) {
      return descriptor.methodName === methodName ? descriptor : foundDescriptor;
    }, null);
  }
});

function getEntityComparator(methodName, compFunctions, entityDescriptor) {
  if(isFunction(entityDescriptor[methodName])) {
    compFunctions.push(entityDescriptor[methodName]);
  }
  return compFunctions;
}

runPostInit.unshift(function() {
  var entityCtorComparators = pluck(entityDescriptors, 'isEntityCtor');
  var entityComparators = pluck(entityDescriptors, 'isEntity');

  isEntityCtor = function(thing) {
    return reduce(entityCtorComparators, function(isThing, comparator) {
      return isThing || comparator(thing);
    }, false);
  };

  isEntity = function(thing) {
    return reduce(entityComparators, function(isThing, comparator) {
      return isThing || comparator(thing);
    }, false);
  };

  isDataModel = entityDescriptors.getDescriptor('dataModel').isEntity;
  isRouter = entityDescriptors.getDescriptor('router').isEntity;
});


// framework/resource/init.js
// ------------------

var baseComponentLocation = {
  combined: null,
  viewModel: null,
  template: null
};

var originalComponentRegisterFunc = fw.components.register;

var defaultComponentFileExtensions = {
  combined: '.js',
  viewModel: '.js',
  template: '.html'
};

var defaultComponentLocation = extend({}, baseComponentLocation, {
  viewModel: '/viewModel/',
  template: '/component/'
});


// framework/resource/proto.js
// ------------------

function isRegistered(descriptor, resourceName) {
  return !isUndefined( descriptor.registered[resourceName] );
};

function getRegistered(descriptor, resourceName) {
  return descriptor.registered[resourceName];
};

function register(descriptor, resourceName, resource) {
  descriptor.registered[resourceName] = resource;
};

function getModelExtension(dataModelExtensions, modelName) {
  var fileExtension = '';

  if( isFunction(dataModelExtensions) ) {
    fileExtension = dataModelExtensions(modelName);
  } else if( isString(dataModelExtensions) ) {
    fileExtension = dataModelExtensions;
  }

  return fileExtension.replace(/^\./, '') || '';
}

function getModelFileName(descriptor, modelName) {
  var modelResourceLocations = descriptor.resourceLocations;
  var fileName = modelName + '.' + getModelExtension(descriptor.fileExtensions(), modelName);

  if( !isUndefined( modelResourceLocations[modelName] ) ) {
    var registeredLocation = modelResourceLocations[modelName];
    if( isString(registeredLocation) && !isPath(registeredLocation) ) {
      // full filename was supplied, lets return that
      fileName = last( registeredLocation.split('/') );
    }
  }

  return fileName;
}

function setDefaultModelLocation(descriptor, path) {
  if( isString(path) ) {
    descriptor.defaultLocation = path;
  }

  return descriptor.defaultLocation;
}

function registerModelLocation(descriptor, modelName, location) {
  if( isArray(modelName) ) {
    each(modelName, function(name) {
      registerModelLocation(descriptor, name, location);
    });
  }
  descriptor.resourceLocations[ modelName ] = location;
}

function modelLocationIsRegistered(descriptor, modelName) {
  return !isUndefined(descriptor.resourceLocations[modelName]);
}

function getModelResourceLocation(descriptor, modelName) {
  if( isUndefined(modelName) ) {
    return descriptor.resourceLocations;
  }
  return descriptor.resourceLocations[modelName] || descriptor.defaultLocation;
}

var $globalNamespace = fw.namespace();
function getModelReferences(descriptor, namespaceName, options) {
  options = options || {};
  if( isString(namespaceName) || isArray(namespaceName) ) {
    options.namespaceName = namespaceName;
  }

  var references = reduce( $globalNamespace.request(descriptor.referenceNamespace, extend({ includeOutlets: false }, options), true), function(models, model) {
    if( !isUndefined(model) ) {
      var namespaceName = isNamespace(model.$namespace) ? model.$namespace.getName() : null;
      if( !isNull(namespaceName) ) {
        if( isUndefined(models[namespaceName]) ) {
          models[namespaceName] = [ model ];
        } else {
          models[namespaceName].push(model);
        }
      }
    }
    return models;
  }, {});

  var referenceKeys = keys(references);
  if(isString(namespaceName) && referenceKeys.length === 1) {
    return references[referenceKeys[0]];
  }
  return references;
}

// framework/resource/component.js
// ------------------

fw.components.resourceLocations = {};

fw.components.fileExtensions = fw.observable( clone(defaultComponentFileExtensions) );

fw.components.register = function(componentName, options) {
  var viewModel = options.initialize || options.viewModel;

  if( !isString(componentName) ) {
    throw new Error('Components must be provided a componentName.');
  }

  if( isFunction(viewModel) && !isEntityCtor(viewModel) ) {
    options.namespace = componentName;
    viewModel = fw.viewModel(options);
  }

  originalComponentRegisterFunc(componentName, {
    viewModel: viewModel || noop,
    template: options.template
  });
};

function getComponentExtension(componentName, fileType) {
  var componentExtensions = fw.components.fileExtensions();
  var fileExtension = '';

  if( isFunction(componentExtensions) ) {
    fileExtension = componentExtensions(componentName)[fileType];
  } else if( isObject(componentExtensions) ) {
    if( isFunction(componentExtensions[fileType]) ) {
      fileExtension = componentExtensions[fileType](componentName);
    } else {
      fileExtension = componentExtensions[fileType] || '';
    }
  }

  return fileExtension.replace(/^\./, '') || '';
}

fw.components.getFileName = function(componentName, fileType) {
  var fileName = componentName;
  var fileExtension = getComponentExtension(componentName, fileType);

  if( fw.components.isRegistered(componentName) ) {
    return null;
  }

  if( !isUndefined( fw.components.resourceLocations[componentName] ) ) {
    var registeredLocation = fw.components.resourceLocations[componentName];
    if( !isUndefined(registeredLocation[fileType]) && !isPath(registeredLocation[fileType]) ) {
      if( isString(registeredLocation[fileType]) ) {
        // full filename was supplied, lets return that
        fileName = last( registeredLocation[fileType].split('/') );
      } else {
        return null;
      }
    }
  }

  return fileName + (fileExtension !== getFilenameExtension(fileName) ? ('.' + fileExtension) : '');
};

fw.components.defaultLocation = function(location) {
  if( isString(location) ) {
    defaultComponentLocation = extend({}, baseComponentLocation, {
      combined: location
    });
  } else if(isObject(location)) {
    defaultComponentLocation = extend({}, baseComponentLocation, location);
  }

  return defaultComponentLocation;
};

fw.components.registerLocation = function(componentName, componentLocation) {
  if( isArray(componentName) ) {
    each(componentName, function(name) {
      fw.components.registerLocation(name, componentLocation);
    });
  }

  if( isString(componentLocation) ) {
    componentLocation = extend({}, baseComponentLocation, {
      combined: componentLocation
    });
  }

  fw.components.resourceLocations[ componentName ] = extend({}, baseComponentLocation, componentLocation);
};

fw.components.locationIsRegistered = function(componentName) {
  return !isUndefined(fw.components.resourceLocations[componentName]);
};

// Return the component resource definition for the supplied componentName
fw.components.getLocation = function(componentName) {
  if( isUndefined(componentName) ) {
    return fw.components.resourceLocations;
  }
  return _.omit(fw.components.resourceLocations[componentName] || defaultComponentLocation, _.isNull);
};

// framework/resource/createResource.js
// ------------------

// Create/extend all resource methods onto each descriptor.resource found inside an array of descriptors
function createResources(descriptors) {
  each(descriptors, function(descriptor) {
    if(!isUndefined(descriptor.resource)) {
      extend(descriptor.resource, resourceHelperFactory(descriptor));
    }
  });
};

runPostInit.push(function() {
  createResources(entityDescriptors);
});

// framework/resource/resourceHelperFactory.js
// ------------------

// assemble all resource methods for a given descriptor object
function resourceHelperFactory(descriptor) {
  var resourceMethods = {
    getFileName: getModelFileName.bind(null, descriptor),
    register: register.bind(null, descriptor),
    isRegistered: isRegistered.bind(null, descriptor),
    getRegistered: getRegistered.bind(null, descriptor),
    registerLocation: registerModelLocation.bind(null, descriptor),
    locationIsRegistered: modelLocationIsRegistered.bind(null, descriptor),
    getLocation: getModelResourceLocation.bind(null, descriptor),
    defaultLocation: setDefaultModelLocation.bind(null, descriptor),
    fileExtensions: descriptor.fileExtensions,
    resourceLocations: descriptor.resourceLocations
  };

  if(!isUndefined(descriptor.referenceNamespace)) {
    // Returns a reference to the specified models.
    // If no name is supplied, a reference to an array containing all viewModel references is returned.
    resourceMethods.getAll = getModelReferences.bind(null, descriptor);
  }

  return resourceMethods;
}


// framework/component/exports.js
// ------------------

// These are tags which are ignored by the custom component loader
// Sourced from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element
var nonComponentTags = [
  'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b', 'base', 'basefont', 'bdi', 'bgsound',
  'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup',
  'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element',
  'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frameset', 'g', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'isindex', 'kbd', 'keygen', 'label',
  'legend', 'li', 'link', 'listing', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'nobr',
  'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'polygon', 'path', 'pre',
  'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'shadow', 'small', 'source', 'spacer',
  'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'svg', 'table', 'tbody', 'td', 'template', 'textarea',
  'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr', 'xmp', 'rect', 'image',
  'lineargradient', 'stop', 'line', 'binding-wrapper', 'font'
];

fw.components.getNormalTagList = function() {
  return clone(nonComponentTags);
};

fw.components.getComponentNameForNode = function(node) {
  var tagName = isString(node.tagName) && node.tagName.toLowerCase();

  if( fw.components.isRegistered(tagName) || fw.components.tagIsComponent(tagName) ) {
    return tagName;
  }
  return null;
};

fw.components.tagIsComponent = function(tagName, isComponent) {
  if( isUndefined(isComponent) ) {
    return indexOf(nonComponentTags, tagName) === -1;
  }

  if( isArray(tagName) ) {
    each(tagName, function(tag) {
      fw.components.tagIsComponent(tag, isComponent);
    });
  }

  if(isComponent !== true) {
    if( contains(nonComponentTags, tagName) === false ) {
      nonComponentTags.push(tagName);
    }
  } else {
    nonComponentTags = filter(nonComponentTags, function(nonComponentTagName) {
      return nonComponentTagName !== tagName;
    });
  }
};

fw.component = function(componentDefinition) {
  var viewModel = componentDefinition.viewModel;

  if( isFunction(viewModel) && !isEntityCtor(viewModel) ) {
    componentDefinition.viewModel = fw.viewModel( omit(componentDefinition, 'template') );
  }

  return componentDefinition;
};

// framework/component/lifecycle.js
// ------------------

function componentTriggerAfterBinding(element, viewModel) {
  if( isEntity(viewModel) ) {
    var configParams = viewModel.__getConfigParams();
    if( isFunction(configParams.afterBinding) ) {
      var afterBinding = noop;
      if(isFunction(configParams.afterBinding)) {
        afterBinding = configParams.afterBinding;
      }

      configParams.afterBinding = function(element) {
        setTimeout(function() {
          if(element.className.indexOf(bindingClassName) === -1) {
            element.className += ' ' + bindingClassName;
          }
        }, animationIteration);
        afterBinding.call(this, element);
      };

      configParams.afterBinding.call(viewModel, element);
    }
  }
}

// $life wrapper binding to provide lifecycle events for components
fw.virtualElements.allowedBindings.$life = true;
fw.bindingHandlers.$life = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    element = element.parentElement || element.parentNode;
    if(isString(element.className)) {
      if(element.className.indexOf(entityClassName) === -1) {
        element.className += entityClassName;
      }
    }

    fw.utils.domNodeDisposal.addDisposeCallback(element, function() {
      if( isEntity(viewModel) ) {
        viewModel.dispose();
      }
    });
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    element = element.parentElement || element.parentNode;
    var $parent = bindingContext.$parent;
    if( isObject($parent) && $parent.__isOutlet ) {
      $parent.$route().__getOnCompleteCallback(element)();
    }
    componentTriggerAfterBinding(element, bindingContext.$data);
  }
};

// Custom loader used to wrap components with the $life custom binding
fw.components.loaders.unshift( fw.components.componentWrapper = {
  loadTemplate: function(componentName, config, callback) {
    if( !isInternalComponent(componentName) ) {
      // TODO: Handle different types of configs
      if( isString(config) ) {
        config = '<!-- ko $life -->' + config + '<!-- /ko -->';
      } else {
        throw new Error('Unhandled config type ' + typeof config + '.');
      }
      fw.components.defaultLoader.loadTemplate(componentName, config, callback);
    } else {
      callback(null);
    }
  },
  loadViewModel: function(componentName, config, callback) {
    var ViewModel = config.viewModel || config;
    if( !isInternalComponent(componentName) ) {
      callback(function(params, componentInfo) {
        var componentElement = componentInfo.element;
        var $element = (componentElement.nodeType === 8 ? (componentElement.parentElement || componentElement.parentNode) : componentElement);
        var LoadedViewModel = ViewModel;
        if( isFunction(ViewModel) ) {
          if( !isEntityCtor(ViewModel) ) {
            ViewModel = fw.viewModel({ initialize: ViewModel });
          }

          // inject the context and element into the ViewModel contructor
          LoadedViewModel = ViewModel.compose({
            _preInit: function() {
              this.$element = $element;
            }
          });
          return new LoadedViewModel(params);
        }
        return LoadedViewModel;
      });
    } else {
      callback(null);
    }
  }
});

// framework/component/loader.js
// ------------------

// This loader is a catch-all in the instance a registered component cannot be found.
// The loader will attempt to use requirejs via knockouts integrated support if it is available.
fw.components.loaders.push( fw.components.requireLoader = {
  getConfig: function(componentName, callback) {
    var combinedFile = fw.components.getFileName(componentName, 'combined');
    var viewModelFile = fw.components.getFileName(componentName, 'viewModel');
    var templateFile = fw.components.getFileName(componentName, 'template');
    var componentLocation = fw.components.getLocation(componentName);
    var configOptions = null;
    var viewModelPath;
    var templatePath;
    var combinedPath;
    var viewModelConfig;

    if( isFunction(require) ) {
      // load component using knockouts native support for requirejs
      if( require.specified(componentName) ) {
        // component already cached, lets use it
        configOptions = {
          require: componentName
        };
      } else if( isString(componentLocation.combined) ) {
        combinedPath = componentLocation.combined;

        if( isPath(combinedPath) ) {
          combinedPath = combinedPath + combinedFile;
        }

        configOptions = {
          require: combinedPath
        };
      } else {
        // check to see if the requested component is templateOnly and should not request a viewModel (we supply a dummy object in its place)
        if( !isString(componentLocation.viewModel) ) {
          // template-only component, substitute with 'blank' viewModel
          viewModelConfig = { instance: {} };
        } else {
          viewModelPath = componentLocation.viewModel;

          if( isPath(viewModelPath) ) {
            viewModelPath = viewModelPath + viewModelFile;
          }

          if( getFilenameExtension(viewModelPath) !== getComponentExtension(componentName, 'viewModel') ) {
            viewModelPath += '.' + getComponentExtension(componentName, 'viewModel');
          }

          viewModelConfig = { require: viewModelPath };
        }

        templatePath = 'text!' + componentLocation.template;
        if( isPath(templatePath) ) {
          templatePath = templatePath + templateFile;
        }
        if( getFilenameExtension(templatePath) !== getComponentExtension(componentName, 'template') ) {
          templatePath += '.' + getComponentExtension(componentName, 'template');
        }

        configOptions = {
          viewModel: viewModelConfig,
          template: { require: templatePath }
        };
      }
    }

    callback(configOptions);
  }
});


// framework/collection/exports.js
// ------------------

var defaultCollectionConfig = {};

fw.collection = function(config) {
  var collection = fw.observableArray();

  extend({}, defaultCollectionConfig, config);

  return collection;
};



// 'start' up the framework at the targetElement (or document.body by default)
fw.start = function(targetElement) {
  targetElement = targetElement || windowObject.document.body;
  fw.applyBindings({}, targetElement);
};

each(runPostInit, function(runTask) {
  runTask();
});


      return ko;
    })( root._.pick(root, embeddedDependencies), windowObject, root._, root.ko, root.postal, root.riveter, root.reqwest );
  })();
}));
