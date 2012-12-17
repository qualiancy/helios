/*!
 * Helio - proto methods
 * Copyright(c) 2012 jake luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var debug = require('sherlock')('helios:client')
  , ev = require('cell-ev')
  , EventEmitter = require('drip').EventEmitter
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
 * Initialize the helio client with the default
 * settings, including detect browser support
 * for `pushState` and resetting all event
 * listeners.
 *
 * This is automatically called and should
 * not need to be invoked, unless doing tests
 * and wish to reset settings. `.stop()` should
 * be called first in that scenario.
 *
 * @api public
 */

proto.init = function () {
  debug('booting');

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
  this._features.pushState = !! (window.history
    && window.history.pushState);

  // default hash change setting
  this.set('hash change', !this._features.pushState);
  debug('pushState support is %s', this._features.pushState ? 'enabled' : 'disabled');

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
 * - Else, continue as expected emitting the first request.
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

  debug('starting using %s on root \'%s\'', event, root);

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
  ev.bind(window, event, listener);

  if (!this.disabled('click')) {
    debug('enabling href click support');
    this._handlers.click = handlers.click(this);
    ev.bind(window, 'click', this._handlers.click);
  }

  this.started = true;
  this.replace(url, null, true);
};

/**
 * ### .stop ()
 *
 * Remove all of the dom listeners, effectively turning
 * off the helios client. Useful in tests but probably shouldn't
 * be used in production.
 *
 * @api public
 */

proto.stop = function () {
  for (var event in this._handlers) {
    ev.unbind(window, event, this._handlers[event]);
    delete this._handlers[event];
  }

  this.started = false;
  debug('stopped');
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
 * ```js
 * helio.redirect('/blog/article-1', { newComment: false });
 * ```
 *
 * @param {String} url
 * @param {Object} state (optional)
 * @api public
 */

proto.redirect = function (url, state) {
  var ctx = new Context(this, url, state);

  ctx.pushState();

  debug('emitting redirect request for url \'%s\'', ctx.url);
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
 * ```js
 * helio.replace('/blog/article-1', { newComment: true, commentId: 123 });
 * ```
 *
 * @param {String} url
 * @param {Object} state object, can be null
 * @param {Boolean} force (not recommended)
 */

proto.replace = function (url, state, force) {
  var ctx = new Context(this, url, state)
    , pop = !! this._handlers.popstate;

  ctx.replaceState();

  if (pop || force) {
    debug('emitting replace request for url \'%s\'', ctx.url);
    this.emit('request', ctx);
  }

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
