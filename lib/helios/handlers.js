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
      ctx = client.replace(url, {}, true);
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

