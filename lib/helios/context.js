
var facet = require('facet');

module.exports = Context;

function Context (client, url, state) {
  var root = client.get('root');

  if ('/' === url.charAt(0) && 0 !== url.indexOf(root)) {
    url = root + url;
  }

  this.canonicalUrl = url;
  this.client = client;
  this.url = url.substr(root.length) || '/';
  this.state = state || {};
}

facet(Context, 'state', true);

Context.prototype.emit = function (ev) {
  if (ev !== 'state') return;
  if (this.client._handlers.popstate) this.replaceState();
};

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

function buildState(ctx) {
  var state = {};
  state.url = ctx.url;
  state.value = ctx.state;
  return state;
}
