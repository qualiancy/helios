/*!
 * Helio
 * Copyright(c) 2012 jake luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var debug = require('sherlock')('helios:app')
  , extend = require('tea-extend')

/*!
 * Internal dependencies
 */

var client = require('./helios/client')
  , utils = require('./helios/utils');

/*!
 * Primary export
 */

module.exports = app;

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
 * Initialize settings
 */

app.init();

/*!
 * Emit ready on page load
 */

utils.bind(window, 'load', function () {
  debug('dom ready');
  if (!app.disabled('autostart')) app.start();
  app.emit('ready');
});
