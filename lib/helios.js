/*!
 * Module dependencies
 */

var extend = require('tea-extend')

var proto = require('./helios/proto')
  , utils = require('./helios/utils');

/*!
 * Primary export
 */

module.exports = client;

function client (uri, state) {
  if ('function' === typeof uri) {
    client.on('request', uri);
    return client;
  } else {
    client.redirect(uri, state);
  }
}

extend(client, proto);
client.init();

/*!
 * Emit ready
 */

utils.bind(window, 'load', function () {
  if (!client.disabled('autostart')) client.start();
  client.emit('ready');
});

