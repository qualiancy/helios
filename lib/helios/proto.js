var EventEmitter = require('drip').EventEmitter
  , extend = require('tea-extend')
  , facet = require('facet');

var Context = require('./context')
  , utils = require('./utils');

var proto = exports = module.exports = {};

// configuration mixin
facet(proto, '_settings');

proto.init = function () {
  // default state
  this.started = false;

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
  this.set('root', '');
};

/**
 * ### .start ()
 *
 * @api public
 */

proto.start = function () {
  if (this.started) return;
  var event = this.enabled('hash change') || !this._features.pushState
      ? 'hashchange'
      : 'popstate'
    , listener = event === 'popstate'
      ? buildPop(this)
      : buildHash(this)
    , loc = window.location
    , root = normalizeUrl(this.get('root'))
    , isRoot = normalizeUrl(loc.pathname) === root
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
  this.started = true;
  this.replace(url, null, true);
};

/**
 * ### .stop ()
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

proto.url = function (url) {
  var loc = window.location
    , root = this.get('root');

  if (!url && this._handlers.popstate) {
    url = loc.pathname;
    url = url.substr(root.length) || '/';
    url =+ (loc.search || '');
  } else if (!url && this._handlers.hashchange) {
    url = getHash(loc.href);
  }

  return decode(url);
};

proto.redirect = function (url, state) {
  var ctx = new Context(this, url, state);

  ctx.pushState();
  this.emit('request', ctx);

  return ctx;
};

proto.replace = function (url, state, force) {
  var ctx = new Context(this, url, state)
    , pop = !! this._handlers.popstate;

  ctx.replaceState();
  if (pop || force) this.emit('request', ctx);

  return ctx;
};

function buildPop (client) {
  return function onpopstate (e) {
    if (e.state) {
      var url = e.state.url
        , state = e.state.value;

      client.replace(url, state);
    }
  }
}

function buildHash (client) {
  return function onhashchange (e) {
    var url = client.url()
      , ctx;

    if (client._currentUrl !== url) {
      ctx = client.replace(url, {});
      client.emit('request', ctx);
    }
  }
}

function decode (uri) {
  uri = uri.replace(/^#|\s+$/g, '');
  return decodeURIComponent(uri);
}

function normalizeUrl (url) {
  return ('/' + url + '/').replace(/^\/+|\/+$/g, '/');
}

function getHash (url) {
  var m = url.match(/#(.*)$/);
  return m ? m[1] : '/';
}
