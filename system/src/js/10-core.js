  /* ---------- Core: helpers, the icon sprite, registration ---------- */
  var inits = [];
  var seq = 0;
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }
  function uid(prefix) { seq += 1; return (prefix || 'tray') + '-' + seq; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function fire(el, name, detail) { el.dispatchEvent(new CustomEvent('tray:' + name, { bubbles: true, detail: detail })); }
  function icon(name, cls) { return '<svg class="tray-icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="#tray-i-' + name + '"/></svg>'; }

  UI.icon = icon;
  /* register(name, fn): fn(el) runs once for every element whose data-tray lists that name. */
  UI.register = function (name, fn) { inits.push([name, fn]); };
  /* upgrade(selector, fn): fn(el) runs once for every element that matches, with no data-tray of its own: what every
     instance of a part gets, such as the sliding pill of a segmented control. */
  UI.upgrade = function (selector, fn) { inits.push([selector, fn, true]); };
  /* init(root): wire up everything under root. Call it after adding markup to the page. */
  UI.init = function (root) {
    root = root || document;
    inits.forEach(function (pair) {
      var sel = pair[2] ? pair[0] : '[data-tray~="' + pair[0] + '"]';
      var els = $$(sel, root);
      if (root.matches && root.matches(sel)) els.unshift(root);
      els.forEach(function (el) {
        el.__tray = el.__tray || {};
        if (el.__tray[pair[0]]) return;
        el.__tray[pair[0]] = true;
        pair[1](el);
      });
    });
  };

  function sprite() {
    if (document.getElementById('tray-sprite')) return;
    var s = '<svg id="tray-sprite" xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">';
    Object.keys(UI.icons).forEach(function (k) { s += '<symbol id="tray-i-' + k + '" viewBox="0 0 24 24">' + UI.icons[k] + '</symbol>'; });
    var wrap = document.createElement('div');
    wrap.innerHTML = s + '</svg>';
    document.body.insertBefore(wrap.firstChild, document.body.firstChild);
  }

  /* Arrow-key movement among the items of a list, menu or strip. */
  function rove(container, sel, opts) {
    opts = opts || {};
    container.addEventListener('keydown', function (e) {
      var items = $$(sel, container).filter(function (i) { return !i.disabled && i.getAttribute('aria-disabled') !== 'true' && i.offsetParent !== null; });
      var i = items.indexOf(document.activeElement);
      var prev = opts.horizontal ? 'ArrowLeft' : 'ArrowUp', next = opts.horizontal ? 'ArrowRight' : 'ArrowDown';
      if (opts.both && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) e = { key: prev, preventDefault: e.preventDefault.bind(e) };
      if (opts.both && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) e = { key: next, preventDefault: e.preventDefault.bind(e) };
      var to = -1;
      if (e.key === next) to = i < 0 ? 0 : (i + 1) % items.length;
      else if (e.key === prev) to = i < 0 ? items.length - 1 : (i - 1 + items.length) % items.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = items.length - 1;
      if (to < 0 || !items.length) return;
      e.preventDefault();
      items[to].focus();
    });
  }

  /* A panel that opens from a trigger and closes on Escape, on a click outside, or when asked. */
  function popup(trigger, panel, opts) {
    opts = opts || {};
    var open = false;
    function set(next, focusBack) {
      if (next === open) return;
      open = next;
      if (open) show(panel); else hide(panel);
      trigger.setAttribute('aria-expanded', String(open));
      if (open && opts.onOpen) opts.onOpen();
      if (!open && opts.onClose) opts.onClose();
      if (!open && focusBack) trigger.focus();
      fire(trigger, open ? 'open' : 'close');
    }
    if (!panel.hasAttribute('data-open')) panel.hidden = true; else { open = true; }
    trigger.setAttribute('aria-expanded', String(open));
    if (!opts.manual) trigger.addEventListener('click', function () { set(!open); });
    document.addEventListener('pointerdown', function (e) { if (open && !panel.contains(e.target) && !trigger.contains(e.target)) set(false); });
    /* Escape closes the panel and nothing else: the event stops here, and a dialog around the panel is not asked to close. */
    [trigger, panel].forEach(function (n) { n.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); set(false, true); } }); });
    /* Tab out of the trigger and the panel closes it: what is open follows the keyboard. A click on plain text inside the
       panel sends focus nowhere in particular, and leaves it open. */
    [trigger, panel].forEach(function (n) { n.addEventListener('focusout', function (e) { var to = e.relatedTarget; if (open && to && !panel.contains(to) && !trigger.contains(to)) set(false); }); });
    return { open: function () { set(true); }, close: function (back) { set(false, back); }, toggle: function () { set(!open); }, isOpen: function () { return open; } };
  }

  /* rescue(el, to): el is about to be hidden, removed or disabled. If focus is in it, focus moves to `to` (an element, or a
     function that gives one) first, so a keyboard user is not dropped to the top of the page. An element that cannot take
     focus is given tabindex="-1" for it. */
  function rescue(el, to) {
    var a = document.activeElement;
    if (!el || !a || (el !== a && !el.contains(a))) return;
    var t = typeof to === 'function' ? to() : to;
    if (!t || !t.focus || !t.isConnected) return;
    if (!t.matches('a[href], button, input, select, textarea, summary, [tabindex]')) t.setAttribute('tabindex', '-1');
    t.focus({ preventScroll: true });
  }
  UI.rescue = rescue;

  /* Run fn now, and again whenever the element's box changes: its first real layout may come after this script has started. */
  function watch(el, fn) {
    fn();
    if (window.ResizeObserver) new ResizeObserver(function () { fn(); }).observe(el);
    else window.addEventListener('load', fn);
  }

  /* ---------- Motion: things come in on their own (CSS @starting-style), and these help them go away ---------- */
  function calm() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  /* Can this browser keep a thing shown while it transitions to display: none? Firefox parses allow-discrete and does not. */
  var exits;
  function canExit() {
    if (exits !== undefined) return exits;
    if (!window.CSS || !CSS.supports('transition-behavior', 'allow-discrete') || !document.body) return false;
    var probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    exits = getComputedStyle(probe).display === 'block';
    probe.remove();
    return exits;
  }
  function topLayerExit() { return !!(window.CSS && CSS.supports('overlay', 'auto')) && canExit(); }
  /* settle(el, fn): fn once every animation and transition in el has finished, or after a second at most. */
  function settle(el, fn) {
    var all = el.getAnimations ? el.getAnimations({ subtree: true }) : [];
    if (!all.length) { fn(); return; }
    Promise.race([Promise.allSettled(all.map(function (a) { return a.finished; })), new Promise(function (r) { setTimeout(r, 1000); })]).then(fn);
  }
  /* hide(el): el goes away with its exit transition, then is [hidden]. Where display cannot transition, data-closing runs
     the transition first. show(el) brings it back, and cancels a hide still running. */
  function hide(el) {
    if (el.hidden || el.hasAttribute('data-closing')) return;
    if (calm() || canExit()) { el.hidden = true; return; }
    el.setAttribute('data-closing', '');
    settle(el, function () { if (el.hasAttribute('data-closing')) { el.removeAttribute('data-closing'); el.hidden = true; } });
  }
  function show(el) { el.removeAttribute('data-closing'); el.hidden = false; }
  /* shut(dialog, value): a dialog goes away with its exit transition, then closes. */
  function shut(d, value) {
    if (!d.open || d.hasAttribute('data-closing')) return;
    if (calm() || topLayerExit()) { d.close(value); return; }
    d.setAttribute('data-closing', '');
    settle(d, function () { if (d.hasAttribute('data-closing')) { d.removeAttribute('data-closing'); d.close(value); } });
  }
  /* glide(strip, current): a pill behind the strip's chosen item that slides to the next one chosen. current() gives the
     chosen item. The pill slides when the choice moves; it is placed at once the first time, and when the strip changes
     size while it is not sliding (a slide under way just takes the new place as its end). A strip whose items are written
     anew (innerHTML, a framework's render) keeps its pill, which slides from the old choice to the new one. Returns
     place(), to call when the choice may have changed. */
  function glide(strip, current) {
    var pill = document.createElement('span'), at = null;
    pill.className = 'tray-glide';
    pill.setAttribute('aria-hidden', 'true');
    strip.insertBefore(pill, strip.firstChild);
    function place() {
      if (pill.parentNode !== strip) strip.insertBefore(pill, strip.firstChild);
      var item = current();
      if (!item || !item.offsetWidth) { strip.removeAttribute('data-glide'); at = null; return; }
      var b = strip.getBoundingClientRect(), r = item.getBoundingClientRect();
      strip.toggleAttribute('data-glide-still', !at || (item === at && !pill.getAnimations().length));
      strip.setAttribute('data-glide', '');
      pill.style.setProperty('--tray-glide-x', (r.left - b.left - strip.clientLeft + strip.scrollLeft) + 'px');
      pill.style.setProperty('--tray-glide-y', (r.top - b.top - strip.clientTop) + 'px');
      pill.style.setProperty('--tray-glide-w', r.width + 'px');
      pill.style.setProperty('--tray-glide-h', r.height + 'px');
      at = item;
      if (strip.hasAttribute('data-glide-still')) requestAnimationFrame(function () { requestAnimationFrame(function () { strip.removeAttribute('data-glide-still'); }); });
    }
    watch(strip, place);
    if (window.MutationObserver) new MutationObserver(function () { place(); }).observe(strip, { childList: true });
    return place;
  }

