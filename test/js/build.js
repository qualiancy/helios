/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("qualiancy-tea-concat/lib/concat.js", function(module, exports, require){
/*!
 * tea-inherits
 * Copyright(c) 2012 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/**
 * ### concat (arr1, arr2)
 *
 * A much faster concat for two arrays.
 * Returns a new array.
 *
 * ```js
 * var concat = require('tea-concat')
 *   , arr = concat([ 1, 2 ], [ 3, 4 ]);
 * ```
 *
 * @param {Array} first array
 * @param {Array} second array
 * @return {Array} combined
 * @api public
 */

module.exports = function concat (arr1, arr2) {
  var l1 = arr1.length
    , l2 = arr2.length
    , res = Array(l1 + l2);
  for (var i = 0; i < l1; i++) res[i] = arr1[i];
  for (var i2 = 0; i2 < l2; i2++) res[i + i2] = arr2[i2];
  return res;
}

});
require.register("qualiancy-drip/lib/drip.js", function(module, exports, require){
/*!
 * drip - Node.js event emitter.
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Node.js compatible emitter
 */

exports.EventEmitter = require('./drip/emitter');

/*!
 * Enhanced emitter
 */

exports.EnhancedEmitter = require('./drip/enhanced');

});
require.register("qualiancy-drip/lib/drip/common.js", function(module, exports, require){
var concat = require('tea-concat');

/**
 * ### .many (event, ttl, callback)
 *
 * Bind a `callback` function to count(`ttl`) emits of `event`.
 *
 *     // 3 times then auto turn off callback
 *     drop.many('event', 3, callback)
 *
 * @param {String|Array} event
 * @param {Integer} TTL Times to listen
 * @param {Function} callback
 * @api public
 */

exports.many = function (ev, times, fn) {
  var self = this;

  function wrap () {
    if (--times === 0) self.off(ev, wrap);
    fn.apply(null, arguments);
  };

  this.on(ev, wrap);
  return this;
};

/**
 * ### .once (event, callback)
 *
 * Bind a `callback` function to one emit of `event`.
 *
 *      drip.once('event', callback)
 *
 * @param {String|Array} event
 * @param {Function} callback
 * @api public
 */

exports.once = function (ev, fn) {
  this.many(ev, 1, fn);
  return this;
};

/**
 * Determine if a function is included in a
 * list of functions. Or, if a check function
 * is not available, return true.
 *
 * @param {Function|Array} function list
 * @param {Function|null} function to validate
 * @api public
 */

exports.hasListener = function (fns, fn) {
  if (!fn && 'function' === typeof fns) return true;
  else if (fn && 'function' === typeof fns && fn == fns) return true;
  else if (fns.length === 0) return false;
  else if (fn && fns.indexOf(fn) > -1) return true;
  else if (fn) return false;
  else return true;
};

exports.bindEvent = function (ev, target) {
  var proxy = eventProxy.call(this, ev, target);
  this.on(ev, proxy);
  return this;
};

exports.unbindEvent = function (ev, target) {
  var proxy = eventProxy.call(this, ev, target);
  this.off(ev, proxy);
  return this;
};

exports.proxyEvent = function (ev, ns, target) {
  if (arguments.length === 2) target = ns, ns = null;
  var drip = this._drip || {}
    , listen = !drip.delimeter
      ? (ns  ? ns + ':' + ev : ev)
      : (ns
        ? (Array.isArray(ns)
          ? concat(ns, [ ev ])
          : concat(ns.split(drip.delimeter), [ ev ]))
        : ev);

  target.addListener(ev, eventProxy.call(this, listen, this));
  return this;
};

exports.unproxyEvent = function (ev, ns, target) {
  if (arguments.length === 2) target = ns, ns = null;
  var drip = this._drip || {}
    , listen = !drip.delimeter
      ? (ns  ? ns + ':' + ev : ev)
      : (ns
        ? (Array.isArray(ns)
          ? concat(ns, [ ev ])
          : concat(ns.split(drip.delimeter), [ ev ]))
        : ev);

  target.removeListener(ev, eventProxy.call(this, listen, this));
  return this;
};


/*!
 * Create a function to use as a listener for bind/unbind or
 * proxy/unproxy calls. It will memoize the result to always
 * ensure the name function is provided for subequent calls.
 * This ensure that the the listener is correctly removed during
 * the un(bind|proxy) variants
 *
 * @param {String} event
 * @param {Object} target
 * @returns {Function} new or found callback
 * @api public
 */

function eventProxy (ev, target) {
  var _drip = this._drip || (this._drip = {})
    , _memoize = _drip.memoize || (_drip.memoize = {})
    , event = (_drip.delimeter && Array.isArray(ev))
      ? ev.join(_drip.delimeter)
      : ev
    , mem = _memoize[event]
    , proxy = null;

  if (!mem) {
    proxy = makeProxy(event, target);
    _memoize[event] = [ [ target, proxy ] ];
  } else {
    for (var i = 0, l = mem.length; i < l; i++)
      if (mem[i][0] === target) return mem[i][1];
    proxy = makeProxy(event, target);
    mem.push([ target, proxy ]);
  }

  return proxy;
}

/*!
 * makeProxy (event, target)
 *
 * Provide a context independant proxy function
 * for using with `eventProxy` construction.
 *
 * @param {String} event
 * @param {Object} target
 * @returns {Function} to be used callback
 * @api private
 */

function makeProxy(ev, target) {
  return function proxy () {
    var args = Array.prototype.slice.call(arguments)
      , evs = [ ev ].concat(args);
    target.emit.apply(target, evs);
  };
}

});
require.register("qualiancy-drip/lib/drip/emitter.js", function(module, exports, require){
var common = require('./common');

module.exports = EventEmitter;

function EventEmitter () {
  // nothing to see here
}

/**
 * ### .on (event, callback)
 *
 * Bind a `callback` function to all emits of `event`.
 *
 * ```js
 * drop.on('foo', callback);
 * ```
 *
 * @param {String} event
 * @param {Function} callback
 * @alias addListener
 * @name on
 * @api public
 */

EventEmitter.prototype.on =
EventEmitter.prototype.addListener = function () {
  var map = this._events || (this._events = {})
    , ev = arguments[0]
    , fn = arguments[1];
  if (!map[ev]) map[ev] = fn;
  else if ('function' === typeof map[ev]) map[ev] = [ map[ev], fn ];
  else map[ev].push(fn);
  return this;
};

/**
 * @import ./common.js#exports.many
 * @api public
 */

EventEmitter.prototype.many = common.many;

/**
 * @import ./common.js#exports.once
 * @api public
 */

EventEmitter.prototype.once = common.once;

/**
 * ### .off ([event], [callback])
 *
 * Unbind `callback` function from `event`. If no function
 * is provided will unbind all callbacks from `event`. If
 * no event is provided, event store will be purged.
 *
 * ```js
 * emitter.off('event', callback);
 * ```
 *
 * @param {String} event _optional_
 * @param {Function} callback _optional_
 * @alias removeListener
 * @alias removeAllListeners
 * @name off
 * @api public
 */

EventEmitter.prototype.off =
EventEmitter.prototype.removeListener =
EventEmitter.prototype.removeAllListeners = function (ev, fn) {
  if (!this._events || arguments.length == 0) {
    this._events = {};
    return this;
  }

  if (!fn) {
    this._events[ev] = null;
    return this;
  }

  var fns = this._events[ev];

  if (!fns) return this;
  else if ('function' === typeof fns && fns == fn) this._events[ev] = null;
  else {
    for (var i = 0; i < fns.length; i++)
      if (fns[i] == fn) fns.splice(i, 1);
    if (fns.length === 0) this._events[ev] = null;
    else if (fns.length === 1) this._events[ev] = fns[0];
  }

  return this;
}

/**
 * ### .emit (event[, args], [...])
 *
 * Trigger `event`, passing any arguments to callback functions.
 *
 * ```js
 * emitter.emit('event', arg, ...);
 * ```
 *
 * @param {String} event name
 * @param {Mixed} multiple parameters to pass to callback functions
 * @name emit
 * @api public
 */

EventEmitter.prototype.emit = function () {
  if (!this._events) return false;

  var ev = arguments[0]
    , fns = this._events[ev];

  if (!fns) return false;

  if ('function' == typeof fns) {
    if (arguments.length == 1) fns.call(this);
    else if (arguments.length == 2) fns.call(this, arguments[1]);
    else if (arguments.length == 3) fns.call(this, arguments[1], arguments[2]);
    else {
      var l = arguments.length
        , a = Array(l - 1);
      for (var i = 1; i < l; i++) a[i - 1] = arguments[i];
      fns.apply(this, a);
    }
  } else {
    var a;
    for (var i = 0, l = fns.length; i < l; i++) {
      if (arguments.length === 1) fns[i].call(this);
      else if (arguments.length === 2) fns[i].call(this, arguments[1]);
      else if (arguments.length === 3) fns[i].call(this, arguments[1], arguments[2]);
      else {
        if (!a) {
          var l = arguments.length
          a = Array(l - 1);
          for (var i2 = 1; i2 < l; i2++) a[i2 - 1] = arguments[i2];
        }
        fns[i].apply(this, a);
      }
    }
  }

  return true;
};

/**
 * ### .hasListener (ev[, function])
 *
 * Determine if an event has listeners. If a function
 * is proved will determine if that function is a
 * part of the listeners.
 *
 * @param {String} event key to seach for
 * @param {Function} optional function to check
 * @returns {Boolean} found
 * @name hasListeners
 * @api public
 */

EventEmitter.prototype.hasListener = function (ev, fn) {
  if (!this._events) return false;
  var fns = this._events[ev];
  if (!fns) return false;
  return common.hasListener(fns, fn);
};

/**
 * ### .bindEvent (event, target)
 *
 * A bound event will listen for events on the current emitter
 * instance and emit them on the target when they occur. This
 * functionality is compable with node event emitter.
 *
 * ```js
 * emitter.bindEvent('request', target);
 * ```
 *
 * Note that proxies will also be removed if a generic `off` call
 * is used.
 *
 * @param {String} event key to bind
 * @param {Object} target drip or node compatible event emitter
 * @name bindEvent
 * @api public
 */

EventEmitter.prototype.bindEvent = common.bindEvent;

/**
 * ### .unbindEvent (event, target)
 *
 * Remove a bound event listener. Event and target
 * must be provied the same as in `bindEvent`.
 *
 * ```js
 * emitter.unbindEvent('request', target);
 * ```
 *
 * @param {String} event key to bind
 * @param {Object} target drip or node compatible event emitter
 * @name unbindEvent
 * @api public
 */

EventEmitter.prototype.unbindEvent = common.unbindEvent;

/**
 * ### .proxyEvent (event, [namespace], target)
 *
 * An event proxy will listen for events on a different
 * event emitter and emit them on the current drip instance
 * when they occur. An optional namespace will be pre-pended
 * to the event when they are emitted on the current drip
 * instance.
 *
 * For example, the following will demonstrate a
 * namspacing pattern for node.
 *
 * ```js
 * function ProxyServer (port) {
 *   Drip.call(this, { delimeter: ':' });
 *   this.server = http.createServer().listen(port);
 *   this.bindEvent('request', 'server', this.server);
 * }
 * ```
 *
 * Anytime `this.server` emits a `request` event, it will be
 * emitted on the constructed ProxyServer as `server:request`.
 * All arguments included in the original emit will also be
 * available.
 *
 * ```js
 * var proxy = new ProxyServer(8080);
 *   proxy.on('server:request', function (req, res) {
 *   // ..
 * });
 * ```
 *
 * If you decide to use the namespace option, you can namespace
 * as deep as you like using either an array or a string that
 * uses your delimeter or `:`. The following examples are valid.
 *
 * ```js
 * emitter.proxyEvent('request', 'proxy:server', server);
 * emitter.proxyEvent('request', [ 'proxy', 'server' ], server);
 * emitter.on('proxy:server:request', cb);
 * ```
 *
 * @param {String} event key to proxy
 * @param {String} namespace to prepend to this emit
 * @param {Object} target event emitter
 * @name proxyEvent
 * @api public
 */

EventEmitter.prototype.proxyEvent = common.proxyEvent;

/**
 * ### .unproxyEvent (event, [namespace], target)
 *
 * Remove an event proxy by removing the listening event
 * from the target. Don't forget to include a namespace
 * if it was used during `proxyEvent`.
 *
 * ```js
 * proxy.unbindEvent('request', proxy.server);
 * proxy.unbindEvent('request', 'request', proxy.server);
 * ```
 *
 * @param {String} event key to proxy
 * @param {String} namespace to prepend to this emit
 * @param {Object} target event emitter
 * @name unproxyEvent
 * @api public
 */

EventEmitter.prototype.unproxyEvent = common.unproxyEvent;

});
require.register("qualiancy-drip/lib/drip/enhanced.js", function(module, exports, require){
var concat = require('tea-concat');

var common = require('./common');

module.exports = EnhancedEmitter;

function EnhancedEmitter (opts) {
  opts = opts || {};
  this._drip = {};
  this._drip.delimeter = opts.delimeter || ':';
  this._drip.wildcard = opts.wildcard || (opts.delimeter ? true : false);
}

/**
 * ### .on (event, callback)
 *
 * Bind a `callback` function to all emits of `event`.
 * Wildcards `*`, will be executed for every event at
 * that level of heirarchy.
 *
 *     // for simple drips
 *     drop.on('foo', callback);
 *
 *     // for delimeted drips
 *     drop.on('foo:bar', callback);
 *     drop.on([ 'foo', 'bar' ], callback);
 *     drop.on('foo:*', callback);
 *     drop.on([ 'foo', '*' ], callback);
 *
 * An array can be passed for event when a delimeter has been
 * defined. Events can also have as many levels as you like.
 *
 * @param {String|Array} event
 * @param {Function} callback
 * @alias addListener
 * @name on
 * @api public
 */

EnhancedEmitter.prototype.on =
EnhancedEmitter.prototype.addListener = function () {
  var map = this._events || (this._events = {})
    , ev = arguments[0]
    , fn = arguments[1]
    , evs = Array.isArray(ev)
      ? ev.slice(0)
      : ev.split(this._drip.delimeter)
    , store = this._events || (this._events = {});

  function iterate (events, map) {
    var event = events.shift();
    map[event] = map[event] || {};

    if (events.length) {
      iterate(events, map[event]);
    } else {
      if (!map[event]._) map[event]._= [ fn ];
      else map[event]._.push(fn);
    }
  };

  iterate(evs, store);
  return this;
};

/**
 * @import ./common.js#exports.many
 * @api public
 */

EnhancedEmitter.prototype.many = common.many;

/**
 * @import ./common.js#exports.once
 * @api public
 */

EnhancedEmitter.prototype.once = common.once;

/**
 * ### .off ([event], [callback])
 *
 * Unbind `callback` function from `event`. If no function
 * is provided will unbind all callbacks from `event`. If
 * no event is provided, event store will be purged.
 *
 * ```js
 * emitter.off('event', callback);
 * emitter.off('event:nested', callback);
 * emitter.off([ 'event', 'nested' ], callback);
 * ```
 *
 * @param {String|Array} event _optional_
 * @param {Function} callback _optional_
 * @alias removeListener
 * @alias removeAllListeners
 * @name off
 * @api public
 */

EnhancedEmitter.prototype.off =
EnhancedEmitter.prototype.removeListener =
EnhancedEmitter.prototype.removeAllListeners = function (ev, fn) {
  if (!this._events || arguments.length === 0) {
    this._events = {};
    return this;
  }

  var evs = Array.isArray(ev)
      ? ev.slice(0)
      : ev.split(this._drip.delimeter);

  if (evs.length === 1 && !fn) {
    if (this._events[ev]) this._events[ev]._ = null;
    return this;
  } else {
    function isEmpty (obj) {
      for (var name in obj)
        if (obj[name] && name != '_') return false;
      return true;
    };

    function clean (event) {
      if (fn && 'function' === typeof fn) {
        for (var i = 0; i < event._.length; i++)
          if (fn == event._[i]) event._.splice(i, 1);
        if (event._.length === 0) event._ = null;
        if (event._ && event._.length == 1) event._ = event._[0];
      } else {
        event._ = null;
      }

      if (!event._ && isEmpty(event)) event = null;
      return event;
    };

    function iterate (events, map) {
      var event = events.shift();
      if (map[event] && map[event]._ && !events.length) map[event] = clean(map[event]);
      if (map[event] && events.length) map[event] = iterate(events, map[event]);
      if (!map[event] && isEmpty(map)) map = null;
      return map;
    };

    this._events = iterate(evs, this._events);
  }

  return this;
};

/**
 * ### .emit (event[, args], [...])
 *
 * Trigger `event`, passing any arguments to callback functions.
 *
 * ```js
 * emitter.emit('event', arg, ...);
 * emitter.emit('event:nested', arg, ...);
 * emitter.emit([ 'event', 'nested' ], arg, ...);
 * ```
 *
 * @param {String} event name
 * @param {Mixed} multiple parameters to pass to callback functions
 * @name emit
 * @api public
 */

EnhancedEmitter.prototype.emit = function () {
  if (!this._events) return false;

  var ev = arguments[0]
    , evs = Array.isArray(ev)
      ? ev.slice(0)
      : ev.split(this._drip.delimeter)
    , fns = traverse(evs, this._events);

  if (!fns.length) return false;

  var a;
  for (var i = 0, l = fns.length; i < l; i++) {
    if (arguments.length === 1) fns[i].call(this);
    else if (arguments.length === 2) fns[i].call(this, arguments[1]);
    else if (arguments.length === 3) fns[i].call(this, arguments[1], arguments[2]);
    else {
      if (!a) {
        var la = arguments.length
        a = Array(la - 1);
        for (var i2 = 1; i2 < la; i2++) a[i2 - 1] = arguments[i2];
      }
      fns[i].apply(this, a);
    }
  }

  return true;
};

/**
 * ### .hasListener (ev[, function])
 *
 * Determine if an event has listeners. If a function
 * is proved will determine if that function is a
 * part of the listeners.
 *
 * @param {String|Array} event key to seach for
 * @param {Function} optional function to check
 * @returns {Boolean} found
 * @name hasListeners
 * @api public
 */

EnhancedEmitter.prototype.hasListener = function (ev, fn) {
  if (!this._events) return false;
  var evs = Array.isArray(ev)
      ? ev.slice(0)
      : ev.split(this._drip.delimeter)
    , fns = traverse(evs, this._events);
  if (fns.length === 0) return false;
  return common.hasListener(fns, fn);
}

/**
 * ### .bindEvent (event, target)
 *
 * A bound event will listen for events on the current emitter
 * instance and emit them on the target when they occur. This
 * functionality is compable with node event emitter. Wildcarded
 * events on this instance will be emitted using the delimeter
 * on the target.
 *
 * ```js
 * emitter.bindEvent('request', target);
 * emitter.bindEvent('server:request', target);
 * emitter.bindEvent([ 'server', 'request' ], target);
 * ```
 *
 * Note that proxies will also be removed if a generic `off` call
 * is used.
 *
 * @param {String|Array} event key to bind
 * @param {Object} target drip or node compatible event emitter
 * @name bindEvent
 * @api public
 */

EnhancedEmitter.prototype.bindEvent = common.bindEvent;

/**
 * ### .unbindEvent (event, target)
 *
 * Remove a bound event listener. Event and target
 * must be provied the same as in `bindEvent`.
 *
 * ```js
 * emitter.unbindEvent('request', target);
 * emitter.unbindEvent('server:request', target);
 * emitter.unbindEvent([ 'server', 'request' ], target);
 * ```
 *
 * @param {String|Array} event key to bind
 * @param {Object} target drip or node compatible event emitter
 * @name unbindEvent
 * @api public
 */

EnhancedEmitter.prototype.unbindEvent = common.unbindEvent;

/**
 * ### .proxyEvent (event, [namespace], target)
 *
 * An event proxy will listen for events on a different
 * event emitter and emit them on the current drip instance
 * when they occur. An optional namespace will be pre-pended
 * to the event when they are emitted on the current drip
 * instance.
 *
 * For example, the following will demonstrate a
 * namspacing pattern for node.
 *
 * ```js
 * function ProxyServer (port) {
 *   Drip.call(this, { delimeter: ':' });
 *   this.server = http.createServer().listen(port);
 *   this.bindEvent('request', 'server', this.server);
 * }
 * ```
 *
 * Anytime `this.server` emits a `request` event, it will be
 * emitted on the constructed ProxyServer as `server:request`.
 * All arguments included in the original emit will also be
 * available.
 *
 * ```js
 * var proxy = new ProxyServer(8080);
 *   proxy.on('server:request', function (req, res) {
 *   // ..
 * });
 * ```
 *
 * If you decide to use the namespace option, you can namespace
 * as deep as you like using either an array or a string that
 * uses your delimeter. The following examples are valid.
 *
 * ```js
 * emitter.proxyEvent('request', 'proxy:server', server);
 * emitter.proxyEvent('request', [ 'proxy', 'server' ], server);
 * emitter.on('proxy:server:request', cb);
 * ```
 *
 * @param {String|Array} event key to proxy
 * @param {String} namespace to prepend to this emit
 * @param {Object} target event emitter
 * @name proxyEvent
 * @api public
 */

EnhancedEmitter.prototype.proxyEvent = common.proxyEvent;

/**
 * ### .unproxyEvent (event, [namespace], target)
 *
 * Remove an event proxy by removing the listening event
 * from the target. Don't forget to include a namespace
 * if it was used during `bindEvent`.
 *
 * ```js
 * proxy.unbindEvent('request', proxy.server);
 * proxy.unbindEvent('request', 'request', proxy.server);
 * ```
 *
 * @param {String|Array} event key to proxy
 * @param {String} namespace to prepend to this emit
 * @param {Object} target event emitter
 * @name unproxyEvent
 * @api public
 */

EnhancedEmitter.prototype.unproxyEvent = common.unproxyEvent;

/*!
 * Traverse through a wildcard event tree
 * and determine which callbacks match the
 * given lookup. Recursive. Returns array
 * of events at that level and all subsequent
 * levels.
 *
 * @param {Array} event lookup
 * @param {Object} events tree to search
 * @api private
 */

function traverse (events, map) {
  var event = events.shift()
    , fns = [];

  if (event !== '*' && map[event] && map[event]._ && !events.length) {
    if ('function' == typeof map[event]._) fns.push(map[event]._);
    else fns = concat(fns, map[event]._);
  }

  if (map['*'] && map['*']._ && !events.length) {
    if ('function' == typeof map['*']._) fns.push(map['*']._);
    else fns = concat(fns, map['*']._);
  }

  if (events.length && (map[event] || map['*'])) {
    var l = events.length
      , arr1 = Array(l)
      , arr2 = Array(l);
    for (var i = 0; i < l; i++) {
      arr1[i] = events[i];
      arr2[i] = events[i];
    }
    if (map[event]) {
      var trav = traverse(arr1, map[event]);
      fns = concat(fns, trav);
    }
    if (map['*']) {
      var trav = traverse(arr2, map['*']);
      fns = concat(fns, trav);
    }
  }

  return fns;
};

});
require.register("qualiancy-facet/lib/facet.js", function(module, exports, require){
/**
 * ### facet (object[, property])
 *
 * This mixin provides a way to store arbitray key/value
 * pairs on a constructor or object. Furthermore, it provides
 * a number of helper methods to retrieve the stored values.
 *
 * Begin by applying the mixin to a constructor or object.
 *
 * ```js
 * // on a constructor (prototype)
 * facet(MyConstructor);
 *
 * // on an object
 * var obj = {};
 * facet(obj);
 * ```
 *
 * Facet will default to creating and using the `.settings`
 * property on the constructor or object to store the
 * key/value pairs. If you would like to use something else
 * you may specify a different property key.
 *
 * ```js
 * facet(MyConstructor, 'options');
 * ```
 *
 * Facet can also emit events anytime a setting has changed
 * by assuming the constructor that was extended has an `emit`
 * method that conforms to node.js standards. The event emitted
 * will equal the name of the storage property. This is **disabled**
 * by default.
 *
 * ```js
 * facet(MyConstructor, true);
 * // facet(MyConstructor, 'options', true);
 *
 * var obj = new MyConstructor();
 *
 * // obj.on('options', ...
 * obj.on('settings', function (key, value) {
 *   console.log(key + ' was set to: ', value);
 * });
 *
 * obj.set('hello', 'universe');
 * // "hello was set to: universe"
 * ```
 *
 * @param {Object} Constructor or Object
 * @param {String} Object property to use as storage  _(optional)_
 * @param {Boolean} Emit `settings` events. _(optional)_
 */

module.exports = function (obj, prop, events) {
  if ('string' !== typeof prop) events = prop, prop = 'settings';
  var proto = 'function' === typeof obj
    ? obj.prototype
    : obj;

  /**
   * Once an object is extended,
   * you may use any of the following methods.
   */

  /**
   * #### .set (key[, value])
   *
   * Modify a key/value pair of settings, or use
   * an object to modify many settings at once.
   *
   * ```js
   * obj.set('hello', 'universe');
   * obj.set({ hello: 'universe', say: 'loudly' });
   * ```
   *
   * @param {String|Object} key or object
   * @param {Mixed} value
   * @name set
   * @api public
   */

  proto.set = (function (prop, events) {
    events = 'boolean' === typeof events ? events: false;
    var emit = function () {};

    if (events) {
      emit = function (obj, key, value) {
        obj.emit(prop, key, value);
      };
    }

    return function (key, value) {
      var settings = this[prop] || (this[prop] = {});

      if (1 === arguments.length) {
        if ('string' === typeof key) {
          return settings[key];
        } else {
          for (var name in key) {
            settings[name] = key[name];
            emit(this, name, key[name]);
          }
        }
      } else {
        settings[key] = value;
        emit(this, key, value);
      }

      return this;
    };
  })(prop, events);

  /**
   * #### .get (key)
   *
   * Return the value of a stored setting.
   *
   * ```js
   * obj.get('hello').should.equal('universe');
   * ```
   *
   * @param {String} key
   * @name get
   * @api public
   */

  proto.get = function (key) {
    return this.set(key);
  };

  /**
   * #### .enable (key)
   *
   * Mark a setting key as "enabled" (true).
   *
   * ```js
   * obj.enable('loudly');
   * ```
   *
   * @param {String} key
   * @name enable
   * @api public
   */

  proto.enable = function (key) {
    return this.set(key, true);
  };

  /**
   * #### .disable (key)
   *
   * Mark a setting key as "disabled" (false)
   *
   * ```js
   * obj.disable('whisper');
   * ```
   *
   * @param {String} key
   * @name disable
   * @api public
   */

  proto.disable = function (key) {
    return this.set(key, false);
  };

  /**
   * #### .enabled (key)
   *
   * Confirm that a given key is enabled (=== true).
   * Settings that do not exist will return `false`.
   *
   * ```js
   * obj.enabled('loudly').should.be.true;
   * obj.enabled('whisper').should.be.false;
   * obj.enabled('scream').should.be.false;
   * ```
   *
   * @param {String} key
   * @name enabled
   * @api public
   */

  proto.enabled = function (key) {
    return !! this.get(key);
  };

  /**
   * #### .disabled (key)
   *
   * Confirm that a setting key is disabled (=== false).
   * Settings that do not exists will return `true`.
   *
   * ```js
   * obj.disabled('loudly').should.be.false;
   * obj.disabled('whisper').should.be.true;
   * obj.disabled('scream').should.be.true;
   * ```
   *
   * @param {String} key
   * @name disabled
   * @api public
   */

  proto.disabled = function (key) {
    return !!! this.get(key);
  };
};

});
require.register("qualiancy-tea-extend/lib/extend.js", function(module, exports, require){
/*!
 * tea-extend
 * Copyright(c) 2012 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/**
 * ### extend (destination, source, ...)
 *
 * For each source, shallow merge its key/values to the
 * destinatino. Sources are read in order, meaning the same
 * key in a later source will overwrite the key's value earlier
 * set.
 *
 * ```js
 * var extend = require('tea-extend');
 *
 * // sample objects
 * var a = { hello: 'world' }
 *   , b = { speak: 'loudly' };
 *
 * // change a
 * extend(a, b);
 *
 * // shallow clone to c
 * var c = extend({}, a);
 * ```
 *
 * @param {Object} destination
 * @param {Object} sources ...
 * @return {Object} destination extended
 * @api public
 */

module.exports = function () {
  var args = [].slice.call(arguments, 0)
    , res = args[0];

  for (var i = 1; i < args.length; i++) {
    extend(res, args[i]);
  }

  return res;
};

/*!
 * Actually extend
 */

function extend (a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

});
require.register("helios/lib/helios.js", function(module, exports, require){
/*!
 * Helio
 * Copyright(c) 2012 jake luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var extend = require('tea-extend')

/*!
 * Internal dependencies
 */

var proto = require('./helios/proto')
  , utils = require('./helios/utils');

/*!
 * Primary export
 */

module.exports = client;

/**
 * ### helio ([fn || uri], [state])
 *
 * ```js
 * var helio = require('helios');
 *
 * // add a request listener
 * helios(functon (ctx) {
 *
 * });
 *
 * // redirect client to url
 * helios('/blog/some-article', { hello: 'universe' });
 *
 * // start helios
 * helios();
 * ```
 *
 * @param {Function|String} function request listener or string url
 * @param {Object} state if redirecting
 * @api public
 */

function client (uri, state) {
  if ('function' === typeof uri) {
    client.on('request', uri);
    return client;
  } else if ('string' === typeof uri) {
    return client.redirect(uri, state);
  } else {
    client.start();
    return this;
  }
}

/*!
 * Extend client with proto methods
 */

extend(client, proto);

/*!
 * Initialize settings
 */

client.init();

/*!
 * Emit ready on page load
 */

utils.bind(window, 'load', function () {
  if (!client.disabled('autostart')) client.start();
  client.emit('ready');
});

});
require.register("helios/lib/helios/context.js", function(module, exports, require){
/*!
 * Helio - Context
 * Copyright(c) 2012 jake luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var facet = require('facet');

/*!
 * Primary export
 */

module.exports = Context;

/**
 * ### Context
 *
 * A context is simliar to a request object in node
 * in such that it stores parameters for a given request
 * from the client.
 *
 * ##### Properties
 *
 * - `client` : reference to original helios
 * - `canonicalUrl` : the full url of the request
 * - `url` : the url in relation to the app (without root)
 * - `state` : state object to be set on client when using pushState
 *
 * ##### Changing State
 *
 * You may use and of the normal configuration modifiers to
 * change the state (get/set/enable/disable). When the state is
 * changed and if the client is using `pushState` then it will
 * be cached for later use (such as back button). Do not rely on
 * these properties to be available if the client does not support
 * HTML5 `pushState`.
 */

function Context (client, url, state) {
  /*!
   * @param {Object} client reference
   * @param {String} url
   * @param {Object} state
   * @api private
   */

  var root = client.get('root');

  if ('/' === url.charAt(0) && 0 !== url.indexOf(root)) {
    url = root + url;
  }

  this.canonicalUrl = url;
  this.client = client;
  this.url = url.substr(root.length) || '/';
  this.state = state || {};
}

/*!
 * Provide configuration (get/set/etc)
 */

facet(Context, 'state', true);

/*!
 * ### .emit (ev, key, value)
 *
 * A context is not an event emitter, but facet will
 * invoke this function on the change of a state by
 * the user. This allows us to hook into that change
 * and save the state (if possible).
 *
 * @param {String} event (`state`)
 * @api public
 */

Context.prototype.emit = function (ev) {
  if (ev !== 'state') return;
  if (this.client._handlers.popstate) this.replaceState();
};

/**
 * ### .pushState ()
 *
 * Push this context to the history. This will create a new
 * history entry but will not emit a new request object.
 *
 * @api public
 */

Context.prototype.pushState = function () {
  var handlers = this.client._handlers
    , hash = !! handlers.hashchange
    , pop = !! handlers.popstate
    , state = buildState(this);

  if (hash) {
    location.hash = '#' + this.url;
  } else if (pop) {
    history.pushState(state, document.title, this.canonicalUrl);
  }

  this.client._currentUrl = this.url;
};

/**
 * ### .replaceState ()
 *
 * Replace the state in the history. This will not
 * create a ne history entry and will not create a new
 * request.
 *
 * @api public
 */

Context.prototype.replaceState = function () {
  var handlers = this.client._handlers
    , hash = !! handlers.hashchange
    , pop = !! handlers.popstate
    , state = buildState(this)
    , href;

  if (hash) {
    href = location.href.replace(/(javascript:|#).*$/, '');
    location.replace(href + '#' + this.url);
  } else if (pop) {
    history.replaceState(state, document.title, this.canonicalUrl);
  }

  this.client._currentUrl = this.url;
};

/*!
 * Convert state to standardized object.
 */

function buildState(ctx) {
  var state = {};
  state.url = ctx.url;
  state.value = ctx.state;
  return state;
}

});
require.register("helios/lib/helios/handlers.js", function(module, exports, require){
/*!
 * Helio - Handlers
 * Copyright(c) 2012 jake luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Internal Dependencies
 */

var utils = require('./utils');

/**
 * ### .popstate (client)
 *
 * Return the handler for `pushState` based
 * url listening to be memoized by the client.
 *
 * @param {Object} client
 * @return {Function} handler
 * @api public
 */

exports.popstate = function (client) {
  return function onpopstate (e) {
    if (e.state) {
      var url = e.state.url
        , state = e.state.value;

      client.replace(url, state);
    }
  }
}

/**
 * ### .hashchange (client)
 *
 * Return the handler for `hash change` based
 * url listening to be memoized by the client.
 *
 * @param {Object} client
 * @return {Function} handler
 * @api public
 */

exports.hashchange = function (client) {
  return function onhashchange (e) {
    var url = client.url()
      , ctx;

    if (client._currentUrl !== url) {
      ctx = client.replace(url, {});
      client.emit('request', ctx);
    }
  }
}

/**
 * ### .click (client)
 *
 * Return the handler for `click` href
 * listening to be memoized by the client.
 *
 * @param {Object} client
 * @return {Function} handler
 * @api public
 */

exports.click = function (client) {
  // left mouse click?
  function which (e) {
    return e.which
      ? e.which
      : e.button;
  }

  // in same domain?
  function sameOrigin (href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return 0 == href.indexOf(origin);
  }

  // check if target not in this root
  function sameBase (url) {
    var root = utils.normalizeUrl(client.get('root'));
    return !(root !== '/' && 0 !== url.indexOf(root));
  }

  // return handler
  return function onclick (e) {
    if (e.defaultPrevented) return;
    if (which(e) != 1) return;

    var el = e.target;

    // get topmost link
    while (el && 'A' != el.nodeName) {
      el = el.parentNode;
    }

    // filters
    if (!el || 'A' != el.nodeName) return;
    if (el.hash || el.getAttribute('href') === '#') return;
    if (!sameOrigin(el.href)) return;

    var url = el.pathname + el.search;
    if (!sameBase(url)) return;

    // dispatch
    e.preventDefault();
    client.redirect(url);
  }
}


});
require.register("helios/lib/helios/proto.js", function(module, exports, require){
/*!
 * Helio - proto methods
 * Copyright(c) 2012 jake luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var EventEmitter = require('drip').EventEmitter
  , extend = require('tea-extend')
  , facet = require('facet');

/*!
 * Internal dependencies
 */

var Context = require('./context')
  , handlers = require('./handlers')
  , utils = require('./utils');

/*!
 * Primary export
 */

var proto = exports = module.exports = {};

/*!
 * Provide configuration (get/set/etc)
 */

facet(proto, '_settings');

/*!
 * ### .init ()
 *
 * Initialize this object with the default
 * settings, including detect browser support
 * for `pushState`.
 *
 * This is automatically called and should
 * not need to be invoked, unless doing tests
 * and wish to reset settings.
 *
 * @api public
 */

proto.init = function () {
  // default state
  this.started = false;

  // if resetting, remove events
  if (this._events) delete this._events;

  // extend from EventEmitter
  EventEmitter.call(this);
  extend(this, EventEmitter.prototype);

  // storage
  this._handlers = {};
  this._features = {};

  // detect pushState
  this._features.pushState = window.history
    && window.history.pushState;

  // default hash change setting
  this.set('hash change', !this._features.pushState);

  // other defaults
  this.enable('autostart');
  this.enable('click');
  this.set('root', '');
};

/**
 * ### .start ()
 *
 * This is will start the listeners for `popstate` or
 * `hashchange` events. Will also start the `click` listener
 * if it is enabled.
 *
 * - If url includes hash but pushstate is enabled, convert
 * the url to pushstate.
 * - If url is pushstate but hashchange is enabled, redirect
 * to root with hash.
 * - Else, continue as planned.
 *
 * @api public
 */

proto.start = function () {
  if (this.started) return;
  var event = this.enabled('hash change') || !this._features.pushState
      ? 'hashchange'
      : 'popstate'
    , listener = handlers[event](this)
    , loc = window.location
    , root = utils.normalizeUrl(this.get('root'))
    , isRoot = utils.normalizeUrl(loc.pathname) === root
    , url;

  if ('popstate' === event && isRoot && loc.hash) {
    url = getHash(loc.hash);
  } else if ('hashchange' === event && !isRoot) {
    loc.replace(root + '#' + loc.pathname + loc.search);
    return true;
  } else if ('hashchange' === event) {
    url = getHash(loc.hash);
  } else {
    url = loc.pathname + loc.search;
  }

  this._handlers[event] = listener;
  utils.bind(window, event, listener);

  if (!this.disabled('click')) {
    this._handlers.click = handlers.click(this);
    utils.bind(window, 'click', this._handlers.click);
  }

  this.started = true;
  this.replace(url, null, true);
};

/**
 * ### .stop ()
 *
 * Remove all of the listeners, effectively turning
 * off this service. Useful in tests but probably shouldn't
 * be used in production.
 *
 * @api public
 */

proto.stop = function () {
  for (var event in this._handlers) {
    utils.unbind(window, event, this._handlers[event]);
    delete this._handlers[event];
  }

  this.started = false;
};

/**
 * ### .url ([url])
 *
 * If no parameters are provided, will return the
 * current url (without root) that is active. If a
 * url is provided, it will normalize and decode uri
 * components.
 *
 * @param {String} url (optional)
 * @api public
 */

proto.url = function (url) {
  var loc = window.location
    , root = utils.normalizeUrl(this.get('root'));

  if (!url && this._handlers.popstate) {
    url = loc.pathname;
    url += (loc.search || '');
    if (0 === url.indexOf(root)) url = '/' + url.substr(root.length);
  } else if (!url && this._handlers.hashchange) {
    url = getHash(loc.href);
  }

  return decode(url);
};

/**
 * ### .redirect (url, [state])
 *
 * Redirect the client to the url specified by
 * either `pushState` or hash change event. Will
 * create a new history entry in the browser and
 * trigger a request for the helios client.
 *
 * @param {String} url
 * @param {Object} state (optional)
 * @api public
 */

proto.redirect = function (url, state) {
  var ctx = new Context(this, url, state);

  ctx.pushState();
  this.emit('request', ctx);

  return ctx;
};

/**
 * ### .replace (url, [state], [force])
 *
 * Replace the current state using `replaceState`
 * or `history.replace`. Will not create a new
 * history entry, but will emit a `request` event.
 *
 * If not using `pushState` and force is used, then
 * it is likely that two `request` events will be emitted.
 *
 * @param {String} url
 * @param {Object} state object, can be null
 * @param {Boolean} force (not recommended)
 */

proto.replace = function (url, state, force) {
  var ctx = new Context(this, url, state)
    , pop = !! this._handlers.popstate;

  ctx.replaceState();
  if (pop || force) this.emit('request', ctx);

  return ctx;
};

/*!
 * Remove the first hash character and all trailing
 * spaces, then `decodeURIComponent`.
 *
 * @param {String} url
 * @api private
 */

function decode (uri) {
  uri = uri.replace(/^#|\s+$/g, '');
  return decodeURIComponent(uri);
}

/*!
 * Given a url/href, return the hash or `/` for root.
 *
 * @param {String} url
 * @api private
 */

function getHash (url) {
  var m = url.match(/#(.*)$/);
  return m ? m[1] : '/';
}

});
require.register("helios/lib/helios/utils.js", function(module, exports, require){
/*!
 * Helio - Utils
 * Copyright(c) 2012 jake luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Cross-browser event binding
 * TODO: this needs its own module
 */

exports.bind = (function () {
  var fn;

  if (window.addEventListener) {
    fn = function (el, ev, fn) {
      el.addEventListener(ev, fn);
    };
  } else if (window.attachEvent) {
    fn = function (el, ev, fn) {
      el.attachEvent('on' + ev, fn);
    };
  } else {
    fn = function (el, ev, fn) {
      el['on' + ev] = fn;
    };
  }

  return fn;
})();

/*!
 * Cross-browser event unbinding
 * TODO: this needs its own module
 */

exports.unbind = (function () {
  var fn;

  if (window.addEventListener) {
    fn = function (el, ev, fn) {
      el.removeEventListener(ev, fn);
    };
  } else if (window.attachEvent) {
    fn = function (el, ev, fn) {
      el.detachEvent('on' + ev, fn);
    };
  } else {
    fn = function (el, ev, fn) {
      el['on' + ev] = null;
    };
  }

  return fn;
})();

/**
 * ### .normalizeUrl (url)
 *
 * Remove double backslashes and ensure trailing
 * and leading.
 *
 * @param {String} url
 * @api public
 */

exports.normalizeUrl = function (url) {
  return ('/' + url + '/').replace(/^\/+|\/+$/g, '/');
};

});
require.alias("qualiancy-drip/lib/drip.js", "helios/deps/drip/lib/drip.js");
require.alias("qualiancy-drip/lib/drip/common.js", "helios/deps/drip/lib/drip/common.js");
require.alias("qualiancy-drip/lib/drip/emitter.js", "helios/deps/drip/lib/drip/emitter.js");
require.alias("qualiancy-drip/lib/drip/enhanced.js", "helios/deps/drip/lib/drip/enhanced.js");
require.alias("qualiancy-drip/lib/drip.js", "helios/deps/drip/index.js");
require.alias("qualiancy-tea-concat/lib/concat.js", "qualiancy-drip/deps/tea-concat/lib/concat.js");
require.alias("qualiancy-tea-concat/lib/concat.js", "qualiancy-drip/deps/tea-concat/index.js");

require.alias("qualiancy-facet/lib/facet.js", "helios/deps/facet/lib/facet.js");
require.alias("qualiancy-facet/lib/facet.js", "helios/deps/facet/index.js");

require.alias("qualiancy-tea-extend/lib/extend.js", "helios/deps/tea-extend/lib/extend.js");
require.alias("qualiancy-tea-extend/lib/extend.js", "helios/deps/tea-extend/index.js");

require.alias("helios/lib/helios.js", "helios/index.js");
