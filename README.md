# helios

> Manage HTML5 pushState changes like a Node.js server.

### Features

- pushState support
- graceful fallback to hash change
- node.js like api
- same-app a-href click detection

## Installation

### Component

`helios` is available as a [component](https://github.com/component/component).

    $ component install qualiancy/helios

## Usage

### helios ([fn || uri], [state])

* **@param** _{Function|String}_ function request listener or string url
* **@param** _{Object}_ state iff redirecting

The primary export is the helio app client.
Multiple requires to this client will yield
the same instance. The primary export can be
used in three distinct ways.

```js
var helio = require('helios');
```

**add request listeners**

Similiar to the way node.js handles requests
to an http server, helios will emit a `request`
event with a context object. For more information
about contexts, see context documentation.

```js
helios(functon (ctx) {
  // handle request for ctx.url
});

// alternative
helios.on('request', function (ctx) {
  // handle request for ctx.url
});
```

**redirect shorthand**

To trigger a pushState or hash change, and emit
a `request` event, helio can instructed to redirect
the browser to a url under it's root. See `.redirect()`
for more information.

```
helios('/blog/some-article', { hello: 'universe' });
helios.redirect('/blog/some-article', { hello: 'universe' });
```

**start application**

If you disable autostart, helios can be started
by simply invoking it. This should occur after the
dom has emitted the `load` event. Alternatively,
helio will emit the `ready` event.

```js
helios.disable('autostart');

window.onload = function () {
  helios();
};

// x-browser compatible
helios.on('ready', function () {
  helios();
});
```

##### Settings

Settings can be read or modified using the
following methods: `.get(key)`, `.set(key, value)`,
`.enable(key)`, `.disable(key)`.

- `root`: set the url path that represents the top for this client application; default: **empty**
- `autostart`: emit the first request on dom load; default: **enabled**
- `hash change`: force hash change instead of pushState; default: **is pushstate not available**
- `click`: emit redirects and request events for `a href` clicks in current root; default: **enabled**

##### Events

Since the helios export is a node.js style
event-emitter, the api permits listening for
and emitting of arbitrary events. The following
events are reserved.

- `request`: emitted when a pushState change has occurred and the url
is different from the currently url (redirects);


### .start ()


This is will start the listeners for `popstate` or
`hashchange` events. Will also start the `click` listener
if it is enabled.

- If url includes hash but pushstate is enabled, convert
the url to pushstate.
- If url is pushstate but hashchange is enabled, redirect
to root with hash.
- Else, continue as expected emitting the first request.

```js
helios.start();
```


### .stop ()


Remove all of the dom listeners, effectively turning
off the helios client. Useful in tests but probably shouldn't
be used in production.

```js
helios.stop();
```


### .url ([url])

* **@param** _{String}_ url (optional)

If no parameters are provided, will return the
current url (without root) that is active. If a
url is provided, it will normalize and decode uri
components. Works the same whether using pushState
or hash change.

```js
var current = helios.url();
```


### .redirect (url, [state])

* **@param** _{String}_ url 
* **@param** _{Object}_ state (optional)

Redirect the client to the url specified by
either `pushState` or hash change event. Will
create a new history entry in the browser and
trigger a request for the helios client.

```js
helio.redirect('/blog/article-1', { newComment: false });
```


### .replace (url, [state], [force])

* **@param** _{String}_ url 
* **@param** _{Object}_ state object, can be null
* **@param** _{Boolean}_ force (not recommended)

Replace the current state using `replaceState`
or `history.replace`. Will not create a new
history entry, but will emit a `request` event.

If not using `pushState` and force is used, then
it is likely that two `request` events will be emitted.

```js
helio.replace('/blog/article-1', { newComment: true, commentId: 123 });
```


### Context

A context is simliar to a request object in node
in such that it stores parameters for a given request
from the client.

##### Properties

- `client` : reference to original helios
- `canonicalUrl` : the full url of the request
- `url` : the url in relation to the app (without root)
- `state` : state object to be set on client when using pushState

##### Changing State

You may use the normal configuration modifiers to
change the state (get/set/enable/disable). When the state is
changed and if the client is using `pushState` then it will
be cached for later use (such as back button). Do not rely on
these properties to be available if the client does not support
HTML5 `pushState`.

### .pushState ()


Push this context to the history. This will create a new
history entry but will not emit a new request object. Use
`helios.redirect()` to create a new request event.


### .replaceState ()


Replace the state in the history. This will not
create a ne history entry and will not create a new
request. Use `helio.replace()` to create a new request
event. Also, changes to the state of a context do not
require this to be called manually.



## License

(The MIT License)

Copyright (c) 2012 Jake Luer <jake@qualiancy.com> (http://qualiancy.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
