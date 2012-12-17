/*!
 * Helio - Context
 * Copyright(c) 2012 jake luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var debug = require('sherlock')('helios:context')
  , facet = require('facet');

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
 * You may use the normal configuration modifiers to
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
 * history entry but will not emit a new request object. Use
 * `helios.redirect()` to create a new request event.
 *
 * @api public
 */

Context.prototype.pushState = function () {
  var handlers = this.client._handlers
    , hash = !! handlers.hashchange
    , pop = !! handlers.popstate
    , state = buildState(this);

  debug('pushing state for url \'%s\'', this.url);

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
 * request. Use `helio.replace()` to create a new request
 * event. Also, changes to the state of a context do not
 * require this to be called manually.
 *
 * @api public
 */

Context.prototype.replaceState = function () {
  var handlers = this.client._handlers
    , hash = !! handlers.hashchange
    , pop = !! handlers.popstate
    , state = buildState(this)
    , href;

  debug('replacing state for url \'%s\'', this.url);

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
