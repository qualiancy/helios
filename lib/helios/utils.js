
/*!
 * Cross-browser event binding
 * TODO: this needs its own module
 */

exports.bind = (function () {
  var fn;

  if (window.addEventListener) {
    fn = function (el, ev, fn) {
      el.addEventListener(ev, fn);
    };
  } else if (window.attachEvent) {
    fn = function (el, ev, fn) {
      el.attachEvent('on' + ev, fn);
    };
  } else {
    fn = function (el, ev, fn) {
      el['on' + ev] = fn;
    };
  }

  return fn;
})();

/*!
 * Cross-browser event unbinding
 * TODO: this needs its own module
 */

exports.unbind = (function () {
  var fn;

  if (window.addEventListener) {
    fn = function (el, ev, fn) {
      el.removeEventListener(ev, fn);
    };
  } else if (window.attachEvent) {
    fn = function (el, ev, fn) {
      el.detachEvent('on' + ev, fn);
    };
  } else {
    fn = function (el, ev, fn) {
      el['on' + ev] = null;
    };
  }

  return fn;
})();

