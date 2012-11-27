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
