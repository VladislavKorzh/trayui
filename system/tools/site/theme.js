/* The theme engine of Tray UI: it derives a whole theme from a few colours, measures it, and writes it as CSS.
   One file for two places: the Themes page of the site runs it in the browser, and tools/themes.py runs it in node to
   write the themes that come with the system. So a theme made on the site follows the same rules as the built-in ones.

   A theme is a value for every colour token. Three colours are chosen (the page, the ink, the accent) and the rest are
   steps between the page and the ink, each at a set contrast with the page: the same contrasts the Light and the Dark
   theme were tuned to by hand. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TrayTheme = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- Colour ---------- */
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function parse(hex) {
    var h = String(hex).trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(h)) h = h.replace(/./g, '$&$&');
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
  }
  function valid(hex) { return !!parse(hex); }
  function hex(rgb) {
    return '#' + rgb.map(function (c) { var n = Math.round(clamp(c, 0, 1) * 255).toString(16); return n.length < 2 ? '0' + n : n; }).join('');
  }
  function normal(value) { var rgb = parse(value); return rgb ? hex(rgb) : null; }
  function toLinear(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function toGamma(c) { return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; }
  function luminance(value) {
    var c = parse(value).map(toLinear);
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  /* The WCAG contrast of two colours, 1 to 21. */
  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  /* OKLab: a space where a straight line between two colours looks even, so a step between the page and the ink keeps their tint. */
  function toLab(value) {
    var c = parse(value).map(toLinear);
    var l = Math.cbrt(0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2]);
    var m = Math.cbrt(0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2]);
    var s = Math.cbrt(0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2]);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  }
  function fromLab(lab) {
    var l = Math.pow(lab[0] + 0.3963377774 * lab[1] + 0.2158037573 * lab[2], 3);
    var m = Math.pow(lab[0] - 0.1055613458 * lab[1] - 0.0638541728 * lab[2], 3);
    var s = Math.pow(lab[0] - 0.0894841775 * lab[1] - 1.291485548 * lab[2], 3);
    return hex([4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(toGamma));
  }
  /* A colour by lightness (0 to 1), chroma and hue in degrees. */
  function oklch(l, c, h) { var r = h * Math.PI / 180; return fromLab([l, c * Math.cos(r), c * Math.sin(r)]); }
  function mix(a, b, t) {
    var x = toLab(a), y = toLab(b);
    return fromLab([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
  }
  /* The colour on the way from `from` to `to` whose contrast with `ground` is `ratio`: the first that reaches it. */
  function along(from, to, ground, ratio) {
    if (contrast(from, ground) >= ratio) return normal(from);
    if (contrast(to, ground) <= ratio) return normal(to);
    var lo = 0, hi = 1, i, t;
    for (i = 0; i < 24; i += 1) { t = (lo + hi) / 2; if (contrast(mix(from, to, t), ground) >= ratio) hi = t; else lo = t; }
    return mix(from, to, hi);
  }

  /* ---------- The rules ---------- */
  /* The contrast of each neutral step with the page, as measured in the two themes tuned by hand. */
  var STEPS = {
    light: { surface: 1.11, hairline: 1.37, track: 1.44, 'rule-strong': 2.1, 'control-off': 3.54, 'ink-hint': 5.25, 'ink-muted': 6.72, 'ink-soft': 8.9 },
    dark: { surface: 1.13, raised: 1.25, inverse: 1.31, hairline: 1.39, track: 1.65, 'rule-strong': 2.52, 'control-off': 3.6, 'ink-hint': 5.69, 'ink-muted': 7.76, 'ink-soft': 11.17 },
  };
  /* What every theme must hold: a colour, the grounds it is read on, the least contrast, and what it is. */
  var NEEDS = [
    ['ink', ['page', 'surface', 'raised', 'leaf'], 10, 'Text'],
    ['ink-soft', ['page', 'surface', 'raised', 'leaf'], 6.6, 'Secondary text'],
    ['ink-muted', ['page', 'surface', 'raised', 'leaf'], 4.5, 'Captions and hints'],
    ['ink-hint', ['page', 'surface', 'raised'], 4.5, 'Axis ticks and placeholders'],
    ['control-off', ['page', 'surface'], 3, 'An unselected ring, an off switch'],
    ['on-accent', ['accent'], 4.5, 'Text on the accent'],
    ['on-inverse', ['inverse'], 10, 'Text on the ink card'],
    ['on-dark-soft', ['inverse'], 7, 'Secondary text on the ink card'],
    ['on-dark-muted', ['inverse'], 4.5, 'Captions on the ink card'],
    ['on-dark-soft', ['inverse-off'], 4.5, 'Secondary text on a fill in the ink card'],
    ['on-dark-muted', ['inverse-off'], 4.5, 'Captions on a fill in the ink card'],
    ['on-dark-danger', ['inverse', 'inverse-off'], 4.5, 'Error text on the ink card'],
    ['on-dark-success', ['inverse', 'inverse-off'], 4.5, 'Success text on the ink card'],
    ['paper-danger', ['accent', 'paper'], 4.5, 'Error text on the yellow card'],
    ['paper-success', ['accent', 'paper'], 4.5, 'Success text on the yellow card'],
    ['danger', ['page', 'surface', 'raised'], 4.5, 'Error text'],
    ['success', ['page', 'surface', 'raised'], 4.5, 'Success text'],
    ['on-danger', ['danger'], 4.5, 'Text on the destructive button'],
    ['code-comment', ['page', 'surface'], 4.5, 'Code: comments'],
    ['code-keyword', ['page', 'surface'], 4.5, 'Code: keywords'],
    ['code-string', ['page', 'surface'], 4.5, 'Code: strings'],
    ['code-function', ['page', 'surface'], 4.5, 'Code: functions'],
    ['code-tag', ['page', 'surface'], 4.5, 'Code: tags'],
    ['code-constant', ['page', 'surface'], 4.5, 'Code: constants'],
    ['code-variable', ['page', 'surface'], 4.5, 'Code: variables'],
    ['on-dark-code-comment', ['inverse', 'inverse-off'], 4.5, 'Code on the ink card: comments'],
    ['on-dark-code-keyword', ['inverse', 'inverse-off'], 4.5, 'Code on the ink card: keywords'],
    ['on-dark-code-string', ['inverse', 'inverse-off'], 4.5, 'Code on the ink card: strings'],
    ['on-dark-code-function', ['inverse', 'inverse-off'], 4.5, 'Code on the ink card: functions'],
    ['on-dark-code-tag', ['inverse', 'inverse-off'], 4.5, 'Code on the ink card: tags'],
    ['on-dark-code-constant', ['inverse', 'inverse-off'], 4.5, 'Code on the ink card: constants'],
    ['on-dark-code-variable', ['inverse', 'inverse-off'], 4.5, 'Code on the ink card: variables'],
  ];
  /* More contrast (prefers-contrast: more): a grey takes the value its theme gives the step after it, towards the ink.
     The yellow card has greys of its own (paper-*), which step the same way. A rule stays at least 3:1 on every ground it
     is drawn on (RULES): where the next step is short of that in a theme, it takes the step after. tools/build.py writes
     the same for the themes of the system (MORE and RULES there): keep the two lists alike. */
  var MORE = [['ink-soft', 'ink'], ['ink-muted', 'ink-soft'], ['ink-hint', 'ink-muted'], ['control-off', 'ink-hint'], ['rule-strong', 'ink-hint'],
              ['hairline', 'control-off'], ['track', 'rule-strong'], ['on-dark-soft', 'on-inverse'], ['on-dark-muted', 'on-dark-soft'], ['dark-rule', 'on-dark-muted'],
              ['paper-hairline', 'paper-soft'], ['paper-track', 'paper-soft']];
  var RULES = { hairline: ['page', 'surface', 'raised'], 'dark-rule': ['inverse', 'inverse-off'], 'paper-hairline': ['accent', 'paper', 'paper-tray'] };
  /* Past the last grey of its list, a rule's next step towards the ink is the ink of its grounds. A theme made here may
     have grounds the system's never have (a dark accent under the yellow card's greys): when no step towards the ink
     holds 3:1, the rule keeps the colour that holds the most, its own included. The themes of the system never get there,
     so they come out as tools/build.py writes them. */
  var INK = { hairline: 'ink', 'dark-rule': 'on-inverse', 'paper-hairline': 'paper-ink' };
  /* The colours that are the system's own and keep their hue in every theme: the status colours of the yellow card and the
     ink card, and the colours of code. Each, the grounds it is read on, and the text it moves towards when a theme's grounds
     are too close to it. */
  var CODE = ['comment', 'keyword', 'string', 'function', 'tag', 'constant', 'variable'];
  var CARDS = [['paper-danger', ['accent', 'paper'], 'paper-ink'], ['paper-success', ['accent', 'paper'], 'paper-ink'],
               ['on-dark-danger', ['inverse', 'inverse-off'], 'on-inverse'], ['on-dark-success', ['inverse', 'inverse-off'], 'on-inverse']]
    .concat(CODE.map(function (r) { return ['code-' + r, ['page', 'surface'], 'ink']; }))
    .concat(CODE.map(function (r) { return ['on-dark-code-' + r, ['inverse', 'inverse-off'], 'on-inverse']; }));
  /* The corners that scale with the roundness of a theme, and the two that never do. */
  var CORNERS = ['radius-card', 'radius-panel', 'radius-button', 'radius-input', 'radius-control', 'radius-chip'];

  /* Light or dark: which of white and black reads better on the page. */
  function modeOf(page) { return contrast(page, '#ffffff') > contrast(page, '#000000') ? 'dark' : 'light'; }

  function least(tokens, name, grounds) {
    return Math.min.apply(null, grounds.map(function (g) { return contrast(tokens[name], tokens[g]); }));
  }

  /* derive(seed, base): every colour token of a theme.
     seed: { page, ink, accent, surface? } as hex; anything else it holds by a token's name is taken as it is.
     base: { light: {token: value}, dark: {…} }, the two themes tuned by hand; what a seed does not decide comes from the one of its mode. */
  function derive(seed, base) {
    var mode = modeOf(seed.page), t = {}, steps = STEPS[mode], name;
    for (name in base[mode]) t[name] = base[mode][name];
    t.page = normal(seed.page); t.ink = normal(seed.ink); t.accent = normal(seed.accent);
    t.surface = seed.surface && valid(seed.surface) ? normal(seed.surface) : along(t.page, t.ink, t.page, steps.surface);
    /* The steps past the tray lie between the tray and the ink, so they keep the tray's tint. */
    for (name in steps) if (name !== 'surface') t[name] = along(t.surface, t.ink, t.page, steps[name]);
    if (mode === 'light') { t.raised = t.page; t.inverse = t.ink; }
    t['dark-rule'] = along(t.inverse, '#ffffff', t.inverse, 1.33);
    /* A step that falls short on one of its grounds moves towards the ink until it holds. */
    NEEDS.forEach(function (need) {
      var n = need[0];
      if (!(n in steps) || least(t, n, need[1]) >= need[2]) return;
      var lo = 0, hi = 1, i, k, from = t[n];
      for (i = 0; i < 24; i += 1) { k = (lo + hi) / 2; t[n] = mix(from, t.ink, k); if (least(t, n, need[1]) >= need[2]) hi = k; else lo = k; }
      t[n] = mix(from, t.ink, hi);
    });
    /* The status colours of the two cards and the colours of code are the system's own. On grounds far from the system's
       they move towards the text read there until they read too. */
    CARDS.forEach(function (c) {
      var n = c[0];
      if (!valid(t[n]) || !c[1].every(function (g) { return valid(t[g]); }) || least(t, n, c[1]) >= 4.5) return;
      var lo = 0, hi = 1, i, k, from = t[n];
      for (i = 0; i < 24; i += 1) { k = (lo + hi) / 2; t[n] = mix(from, t[c[2]], k); if (least(t, n, c[1]) >= 4.5) hi = k; else lo = k; }
      t[n] = mix(from, t[c[2]], hi);
    });
    /* What the seed sets by name wins over what was derived. */
    for (name in seed) if (name in t && name !== 'page' && name !== 'ink' && name !== 'accent' && name !== 'surface' && valid(seed[name])) t[name] = normal(seed[name]);
    return t;
  }

  /* report(tokens): one row for each rule: { token, on, ratio, need, ok, what }. */
  function report(tokens) {
    var rows = [];
    NEEDS.forEach(function (need) {
      need[1].forEach(function (ground) {
        if (!valid(tokens[need[0]]) || !valid(tokens[ground])) return;
        var ratio = contrast(tokens[need[0]], tokens[ground]);
        rows.push({ token: need[0], on: ground, ratio: Math.floor(ratio * 100) / 100, need: need[2], ok: ratio >= need[2], what: need[3] });
      });
    });
    return rows;
  }

  /* corners(scale, radii): the corner tokens at a roundness, 1 being the system's own. They keep their order: a card stays rounder than its panel. */
  function corners(scale, radii) {
    var out = {};
    CORNERS.forEach(function (name) { if (name in radii) out[name] = Math.max(0, Math.round(parseFloat(radii[name]) * scale)) + 'px'; });
    return out;
  }

  /* The colour a token holds, through a reference to another token ("{ink}") where a theme has one. */
  function resolved(tokens, name) {
    var v = tokens[name], i;
    for (i = 0; i < 8 && typeof v === 'string' && /^\{[^}]+\}$/.test(v); i += 1) v = tokens[v.slice(1, -1)];
    return valid(v) ? normal(v) : null;
  }
  /* moreContrast(tokens): what each grey takes in more contrast, { name: colour }: the next step towards the ink, or for a
     rule, the first step from there that holds 3:1 on each of its grounds. */
  function moreContrast(tokens) {
    var after = {}, out = {};
    MORE.forEach(function (m) { after[m[0]] = m[1]; });
    MORE.forEach(function (m) {
      var a = m[0], b = m[1];
      if (!resolved(tokens, a) || !resolved(tokens, b)) return;
      var grounds = (RULES[a] || []).filter(function (g) { return resolved(tokens, g); });
      function held(step) { return Math.min.apply(null, grounds.map(function (g) { return contrast(resolved(tokens, step), resolved(tokens, g)); })); }
      if (!grounds.length) { out[a] = resolved(tokens, b); return; }
      var steps = [b];
      while (after[b] && resolved(tokens, after[b])) { b = after[b]; steps.push(b); }
      if (INK[a] && resolved(tokens, INK[a]) && steps.indexOf(INK[a]) < 0) steps.push(INK[a]);
      var first = steps.filter(function (s) { return held(s) >= 3; })[0];
      if (!first) first = [a].concat(steps).reduce(function (best, s) { return held(s) > held(best) ? s : best; });
      out[a] = resolved(tokens, first);
    });
    return out;
  }

  /* css(id, tokens, names, more): the theme as a rule for [data-theme="id"]. `names` are the tokens that differ between the
     themes of the system: each is written, so a part of a page in this theme takes nothing from the theme around it.
     The tokens every theme shares are left to tokens.css. `more` adds other custom properties, such as the shadow and corners.
     A second rule gives its greys a step more contrast for a person who asks for it. */
  function css(id, tokens, names, more) {
    var rows = ['  color-scheme: ' + modeOf(tokens.page) + ';'], name;
    names.forEach(function (n) { if (n in tokens) rows.push('  --' + n + ': ' + tokens[n] + ';'); });
    for (name in more || {}) rows.push('  --' + name + ': ' + more[name] + ';');
    var stepped = moreContrast(tokens), up = Object.keys(stepped).map(function (n) { return '    --' + n + ': ' + stepped[n] + ';'; });
    return '[data-theme="' + id + '"] {\n' + rows.join('\n') + '\n}' + (up.length ? '\n@media (prefers-contrast: more) {\n  [data-theme="' + id + '"] {\n' + up.join('\n') + '\n  }\n}' : '');
  }

  /* slug('My theme!') is 'my-theme': a name that is safe in an attribute and a selector. */
  function slug(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'my-theme';
  }

  return { oklch: oklch, normal: normal, valid: valid, modeOf: modeOf, along: along, derive: derive, report: report, corners: corners, css: css,
           more: moreContrast, slug: slug, STEPS: STEPS, CARDS: CARDS, MORE: MORE, RULES: RULES };
});
