/*!
 * Helio
 * Copyright(c) 2012 jake luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var bind = require('cell-ev').bind
  , debug = require('sherlock')('helios:app')
  , extend = require('tea-extend')

/*!
 * Internal dependencies
 */

var client = require('./helios/client')
  , Context = require('./helios/context');

/*!
 * Primary export
 */

module.exports = app;

/**
 * ### helios ([fn || uri], [state])
 *
 * The primary export is the helio app client.
 * Multiple requires to this client will yield
 * the same instance. The primary export can be
 * used in three distinct ways.
 *
 * ```js
 * var helio = require('helios');
 * ```
 *
 * **add request listeners**
 *
 * Similiar to the way node.js handles requests
 * to an http server, helios will emit a `request`
 * event with a context object. For more information
 * about contexts, see context documentation.
 *
 * ```js
 * helios(functon (ctx) {
 *   // handle request for ctx.url
 * });
 *
 * // alternative
 * helios.on('request', function (ctx) {
 *   // handle request for ctx.url
 * });
 * ```
 *
 * **redirect shorthand**
 *
 * To trigger a pushState or hash change, and emit
 * a `request` event, helio can instructed to redirect
 * the browser to a url under it's root. See `.redirect()`
 * for more information.
 *
 * ```js
 * helios('/blog/some-article', { hello: 'universe' });
 * helios.redirect('/blog/some-article', { hello: 'universe' });
 * ```
 *
 * **start application**
 *
 * If you disable autostart, helios can be started
 * by simply invoking it. This should occur after the
 * dom has emitted the `load` event. Alternatively,
 * helio will emit the `ready` event.
 *
 * ```js
 * helios.disable('autostart');
 *
 * window.onload = function () {
 *   helios();
 * };
 *
 * // x-browser compatible
 * helios.on('ready', function () {
 *   helios();
 * });
 * ```
 *
 * ##### Settings
 *
 * Settings can be read or modified using the
 * following methods: `.get(key)`, `.set(key, value)`,
 * `.enable(key)`, `.disable(key)`.
 *
 * - `root`: set the url path that represents the top for this client application; default: **empty**
 * - `autostart`: emit the first request on dom load; default: **enabled**
 * - `hash change`: force hash change instead of pushState; default: **is pushstate not available**
 * - `click`: emit redirects and request events for `a href` clicks in current root; default: **enabled**
 *
 * ##### Events
 *
 * Since the helios export is a node.js style
 * event-emitter, the api permits listening for
 * and emitting of arbitrary events. The following
 * events are reserved.
 *
 * - `request`: emitted when a pushState change has occurred and the url
 * is different from the currently url (redirects);
 *
 * @param {Function|String} function request listener or string url
 * @param {Object} state iff redirecting
 * @api public
 */

function app (uri, state) {
  if ('function' === typeof uri) {
    app.on('request', uri);
    return app;
  } else if ('string' === typeof uri) {
    return app.redirect(uri, state);
  } else {
    app.start();
    return this;
  }
}

/*!
 * Extend app with client methods
 */

extend(app, client);

/*!
 * Expose context constructor
 */

app.Context = Context;

/*!
 * Initialize settings
 */

app.init();

/*!
 * Emit ready on page load
 */

bind(window, 'load', function () {
  debug('dom ready');
  if (!app.disabled('autostart')) app.start();
  app.emit('ready');
});
