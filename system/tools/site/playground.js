/* The playground of a component's page: a few controls (its variant, its size, its state, its text), the component drawn
   live with the choice, and its markup to copy. site.js loads this file when a page with a playground opens and calls
   TrayPlay.mount. tools/play_check.py runs the same render() over every choice of every playground.

   A playground is one file in tools/site/play/<Name>.json:
     { "lead": "…",                                   one sentence over the controls (optional)
       "controls": [                                  in the order they are shown
         { "name": "variant", "label": "Variant", "options": [["", "Primary"], [" tray-btn--quiet", "Quiet"]], "default": "" },
         { "name": "disabled", "label": "Disabled", "type": "switch" },
         { "name": "text", "label": "Text", "type": "text", "default": "Order a jar" },
         { "name": "value", "label": "Value", "type": "range", "min": 0, "max": 100, "step": 1, "default": 60 } ],
       "template": "<button class=\"tray-btn{{variant}}\"{{#disabled}} disabled{{/disabled}}>{{text}}</button>",
       "grounds": ["page", "tray"] }                  the grounds it may be shown on, of page, tray, ink and accent; false for none (optional)
   In the template:
     {{name}}                  the value: an option's value as written, a text escaped, a number as it is
     {{#name}}…{{/name}}       only when the value is not empty (a switch that is on)
     {{^name}}…{{/name}}       only when it is empty
     {{#name=v}}…{{/name=v}}   only when the value is v ({{^name=v}} when it is not)
     {{icon:truck}}            a built-in icon; {{icon:truck:sm}} the small one
   Sections may hold other sections, but not one of the same name. */
(function () {
  'use strict';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function icon(name, size) { return '<svg class="tray-icon' + (size ? ' tray-icon--' + size : '') + '" aria-hidden="true"><use href="#tray-i-' + name + '"/></svg>'; }

  /* The value each control starts at. */
  function defaults(spec) {
    var v = {};
    spec.controls.forEach(function (c) {
      var type = c.type || 'choice';
      if (c.default !== undefined) v[c.name] = type === 'switch' ? (c.default ? 'on' : '') : String(c.default);
      else v[c.name] = type === 'choice' ? String(c.options[0][0]) : type === 'range' ? String(c.min) : '';
    });
    return v;
  }

  /* render(spec, values): the markup for these values. */
  var SECTION = /\{\{([#^])([a-z][\w-]*)(?:=([^}]*))?\}\}([\s\S]*?)\{\{\/\2(?:=\3)?\}\}/;
  function render(spec, values) {
    var types = {}, out = spec.template, m, i = 0;
    spec.controls.forEach(function (c) { types[c.name] = c.type || 'choice'; });
    while ((m = SECTION.exec(out)) && i < 500) {
      var v = values[m[2]] == null ? '' : String(values[m[2]]);
      var on = m[3] !== undefined ? v === m[3] : v !== '';
      if (m[1] === '^') on = !on;
      out = out.slice(0, m.index) + (on ? m[4] : '') + out.slice(m.index + m[0].length);
      i += 1;
    }
    out = out.replace(/\{\{icon:([a-z0-9-]+)(?::(sm|lg))?\}\}/g, function (_, name, size) { return icon(name, size); });
    return out.replace(/\{\{([a-z][\w-]*)\}\}/g, function (_, name) {
      var v = values[name] == null ? '' : String(values[name]);
      return types[name] === 'text' ? esc(v) : v;
    });
  }

  /* The markup laid out to read: a block-level element on a line of its own, indented by nesting. */
  var BLOCK = 'div|ul|ol|li|section|article|aside|nav|header|main|footer|form|fieldset|table|thead|tbody|tr|dl|dialog|figure|details|summary|p|h1|h2|h3|label|button|select|option';
  function pretty(markup) {
    var open = new RegExp('^<(?:' + BLOCK + ')\\b'), close = new RegExp('^</(?:' + BLOCK + ')>');
    /* what a pre or a textarea holds keeps its lines: it is set aside while the rest is laid out */
    var kept = [];
    markup = markup.replace(/<(pre|textarea)\b[\s\S]*?<\/\1>/g, function (m) { kept.push(m); return '\u0000' + (kept.length - 1) + '\u0000'; });
    var tokens = markup.replace(/\n\s*/g, '').split(new RegExp('(<(?:' + BLOCK + ')\\b[^>]*>|</(?:' + BLOCK + ')>)')).filter(function (t) { return t.trim(); });
    var out = [], depth = 0, i = 0, pad = function (n) { return new Array(n + 1).join('  '); };
    while (i < tokens.length) {
      var t = tokens[i];
      if (open.test(t)) {
        if (i + 2 < tokens.length && !open.test(tokens[i + 1]) && !close.test(tokens[i + 1]) && close.test(tokens[i + 2])) { out.push(pad(depth) + t + tokens[i + 1].trim() + tokens[i + 2]); i += 3; continue; }
        if (i + 1 < tokens.length && close.test(tokens[i + 1])) { out.push(pad(depth) + t + tokens[i + 1]); i += 2; continue; }
        out.push(pad(depth) + t); depth += 1;
      } else if (close.test(t)) { depth = Math.max(0, depth - 1); out.push(pad(depth) + t); }
      else out.push(pad(depth) + t.trim());
      i += 1;
    }
    return out.join('\n').replace(/\u0000(\d+)\u0000/g, function (_, i) { return kept[+i]; });
  }

  /* The grounds a component can sit on: the page, a tray, the ink card and the yellow card. */
  var GROUNDS = [['page', 'Page', ''], ['tray', 'Tray', 'tray-card'], ['ink', 'Ink', 'tray-card tray-card--inverse'], ['accent', 'Yellow', 'tray-card tray-card--accent']];

  /* ---------- The controls ---------- */
  function control(c, id, value) {
    var type = c.type || 'choice', label = esc(c.label);
    if (type === 'switch') {
      return '<label class="tray-switch"><input type="checkbox" role="switch" data-play-name="' + c.name + '"' + (value ? ' checked' : '') + '><span class="tray-switch__track"></span><span>' + label + '</span></label>';
    }
    if (type === 'text') {
      return '<div class="tray-field"><label class="tray-label" for="' + id + '">' + label + '</label><input class="tray-input tray-input--sm" id="' + id + '" data-play-name="' + c.name + '" value="' + esc(value) +
        '" maxlength="' + (c.max || 60) + '" autocomplete="off" spellcheck="false"></div>';
    }
    if (type === 'range') {
      return '<div class="tray-slider-field"><div class="tray-slider-field__head"><label class="tray-label tray-label--inline" for="' + id + '">' + label + '</label><output for="' + id + '"></output></div>' +
        '<input class="tray-slider" id="' + id + '" type="range" min="' + c.min + '" max="' + c.max + '" step="' + (c.step || 1) + '" value="' + esc(value) + '" data-tray="slider"' + (c.unit ? ' data-unit="' + esc(c.unit) + '"' : '') + ' data-play-name="' + c.name + '"></div>';
    }
    /* a choice: segments when there are a few short ones, a list otherwise */
    var short = c.options.length <= 4 && c.options.every(function (o) { return String(o[1]).length <= 9; });
    if (short) {
      return '<div class="tray-field"><span class="tray-label" id="' + id + '-l">' + label + '</span><div class="tray-seg tray-seg--sm tray-seg--fill" role="radiogroup" aria-labelledby="' + id + '-l">' +
        c.options.map(function (o) { return '<label class="tray-seg__item"><input type="radio" name="' + id + '" value="' + esc(o[0]) + '" data-play-name="' + c.name + '"' + (String(o[0]) === value ? ' checked' : '') + '><span>' + esc(o[1]) + '</span></label>'; }).join('') + '</div></div>';
    }
    return '<div class="tray-field"><label class="tray-label" for="' + id + '">' + label + '</label><span class="tray-select tray-select--sm"><select id="' + id + '" data-play-name="' + c.name + '">' +
      c.options.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === value ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></span></div>';
  }

  /* The controls of a spec, set to these values and this ground. */
  function controlsHtml(spec, values, ground) {
    var rows = spec.controls.map(function (c, i) { return control(c, 'play-' + i, values[c.name]); });
    var grounds = GROUNDS.filter(function (g) { return !Array.isArray(spec.grounds) || spec.grounds.indexOf(g[0]) >= 0; });
    if (spec.grounds !== false && grounds.length > 1) {
      rows.push(control({ name: '__ground', label: 'On', options: grounds.map(function (g) { return [g[0], g[1]]; }) }, 'play-ground', ground));
    }
    return '<div class="tray-stack">' + rows.join('') + '<button class="tray-btn tray-btn--ghost tray-btn--sm" type="button" data-play-reset>Start again</button></div>';
  }
  /* What the stage holds for these values on this ground. */
  function stageHtml(spec, values, ground) {
    var g = GROUNDS.filter(function (x) { return x[0] === ground; })[0];
    return '<div class="site-play__ground ' + g[2] + '">' + render(spec, values) + '</div>';
  }
  /* first(spec): the playground as it opens, for tools/site.py to write into the page, so the page arrives with it drawn
     and nothing moves when this file comes: { controls, stage, ground, code }. */
  function first(spec) {
    var values = defaults(spec);
    return { controls: controlsHtml(spec, values, 'page'), stage: stageHtml(spec, values, 'page'), ground: 'page', code: pretty(render(spec, values)) };
  }

  /* mount(host, spec, UI): the controls, the stage and the code inside host, which holds [data-play-controls],
     [data-play-stage] and [data-play-code]. A playground the page came with, drawn at its first choice by the build
     (first()), is kept as it is and only wired. */
  function mount(host, spec, UI) {
    var values = defaults(spec), ground = 'page';
    var controls = host.querySelector('[data-play-controls]'), stage = host.querySelector('[data-play-stage]'), code = host.querySelector('[data-play-code]');
    var drawn = !!controls.firstElementChild && !!stage.firstElementChild;
    if (!drawn) {
      controls.innerHTML = controlsHtml(spec, values, ground);
      UI.init(controls);
    }

    function draw() {
      var html = render(spec, values);
      stage.innerHTML = stageHtml(spec, values, ground);
      stage.setAttribute('data-ground', ground);
      UI.init(stage);
      var text = pretty(html), site = typeof window !== 'undefined' && window.TRAY_SITE;
      if (site && site.paint) site.paint(code, text, 'html'); else code.textContent = text;
    }
    function take(el) {
      var name = el.getAttribute('data-play-name');
      if (!name) return false;
      if (name === '__ground') { if (el.checked || el.tagName === 'SELECT') ground = el.value; }
      else if (el.type === 'checkbox') values[name] = el.checked ? 'on' : '';
      else if (el.type === 'radio') { if (el.checked) values[name] = el.value; }
      else values[name] = el.value;
      return true;
    }
    function read(el) { if (take(el)) draw(); }
    /* a browser that kept what was chosen before a reload has set the controls the page came with: the stage follows them */
    if (drawn) {
      var was = JSON.stringify(values) + ground;
      [].forEach.call(controls.querySelectorAll('[data-play-name]'), take);
      if (JSON.stringify(values) + ground !== was) draw();
    }
    controls.addEventListener('input', function (e) { read(e.target); });
    controls.addEventListener('change', function (e) { read(e.target); });
    controls.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('[data-play-reset]')) return;
      var fresh = defaults(spec);
      Object.keys(fresh).forEach(function (k) { values[k] = fresh[k]; });
      ground = 'page';
      [].forEach.call(controls.querySelectorAll('[data-play-name]'), function (el) {
        var name = el.getAttribute('data-play-name'), v = name === '__ground' ? ground : values[name];
        if (el.type === 'checkbox') el.checked = !!v;
        else if (el.type === 'radio') el.checked = el.value === v;
        else { el.value = v; if (el.type === 'range') el.dispatchEvent(new Event('input', { bubbles: true })); }
      });
      /* a segmented control set from script: its pill follows (the event does not bubble to these controls) */
      [].forEach.call(controls.querySelectorAll('.tray-seg'), function (s) { s.dispatchEvent(new Event('change')); });
      draw();
    });
    /* a form in the stage posts nowhere and a link goes nowhere: it is an example */
    stage.addEventListener('submit', function (e) { e.preventDefault(); });
    stage.addEventListener('click', function (e) { var a = e.target.closest ? e.target.closest('a[href]') : null; if (a) e.preventDefault(); });
    if (!drawn) draw();
    return { values: values, draw: draw };
  }

  var api = { render: render, first: first, mount: mount, GROUNDS: GROUNDS };
  if (typeof module === 'object' && module.exports) module.exports = api; else window.TrayPlay = api;
})();
