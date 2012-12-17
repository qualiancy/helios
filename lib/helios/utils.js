/*!
 * Helio - Utils
 * Copyright(c) 2012 jake luer <jake@qualiancy.com>
 * MIT Licensed
 */

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
