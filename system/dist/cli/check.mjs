#!/usr/bin/env node
/* The Tray UI markup checker: one file with no dependencies, used by `npx trayui check`, by the agent skill
   (scripts/check.mjs) and by anything else that imports it.

     node check.mjs page.html [more.html | folder ...] [--json] [--rules rules.json] [--prefix kit-]
     node check.mjs -                      reads the markup from stdin

   --prefix names the start of a project's own classes (kit-, app-), which are then not reported as foreign; give it
   more than once, or as a list (--prefix kit-,app-).

   It tests what a machine can test: the classes and the behaviours that exist (rules.json, written by the build from
   the bundle beside it), icons that exist, one yellow per view, names and labels, autocomplete, ids that references
   point at, tabs wired as the guide says, headings in order, tokens instead of literal values, and on a whole page
   its language, theme and the three files in order. It cannot see the page: look at it as well.

   As a module: import { check, report } from './check.mjs'; check(html, rules, { prefixes: ['kit-'] }) returns
   [{ rule, severity: 'error' | 'warning', line, message }]. The exit code is 1 when any file has an error. */

const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const RAW = new Set(['script', 'style', 'textarea', 'title']);
const QUIET = ['tray-btn--dark', 'tray-btn--quiet', 'tray-btn--ghost', 'tray-btn--danger', 'tray-btn--link'];
const STATE_CLASSES = /^(active|selected|open|opened|closed|disabled|checked|current|expanded|collapsed|hidden|visible|show|is-[a-z-]+|has-[a-z-]+)$/;
const BAD_WORDS = /^(ok|okay|submit|yes|no|click here|here|go|send)$/i;
const TAILWIND = /^(?:[a-z]+:)*-?(?:flex|grid|block|inline|hidden|container|(?:m|p)[xytrblse]?-\S+|gap-\S+|space-[xy]-\S+|w-\S+|h-\S+|min-[wh]-\S+|max-[wh]-\S+|text-\S+|font-\S+|bg-\S+|border\S*|rounded\S*|shadow\S*|items-\S+|justify-\S+|leading-\S+|tracking-\S+|col-span-\S+|row-span-\S+|grid-cols-\S+|top-\S+|left-\S+|right-\S+|bottom-\S+|z-\S+|opacity-\S+|ring\S*|sr-only)$/;

/** A small tolerant HTML tree: enough for a checker, not a full parser. Nodes are { tag, attrs, children, parent, line }. */
export function parse(html) {
  const starts = [0];
  for (let i = 0; i < html.length; i++) if (html.charCodeAt(i) === 10) starts.push(i + 1);
  const lineAt = (pos) => { // binary search over the line starts
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= pos) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
  const root = { tag: '#root', attrs: {}, children: [], parent: null, line: 1 };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<![^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
  let last = 0, m;
  const text = (t, at) => { if (t.trim()) stack.at(-1).children.push({ tag: '#text', text: t, line: lineAt(at) }); };
  while ((m = re.exec(html))) {
    text(html.slice(last, m.index), last);
    last = re.lastIndex;
    if (m[0].startsWith('<!')) continue;
    if (m[1]) { // an end tag closes up to the nearest open element of its name
      const name = m[1].toLowerCase();
      const at = stack.map((n) => n.tag).lastIndexOf(name);
      if (at > 0) stack.length = at;
      continue;
    }
    const tag = m[2].toLowerCase();
    const attrs = {};
    for (const a of (m[3] || '').matchAll(/([^\s=>/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      const key = a[1].toLowerCase();
      if (!(key in attrs)) attrs[key] = a[3] ?? a[4] ?? a[5] ?? '';
    }
    const node = { tag, attrs, children: [], parent: stack.at(-1), line: lineAt(m.index) };
    stack.at(-1).children.push(node);
    if (RAW.has(tag) && !m[4]) { // keep raw text whole
      const close = html.toLowerCase().indexOf(`</${tag}`, last);
      const end = close < 0 ? html.length : close;
      node.children.push({ tag: '#text', text: html.slice(last, end), line: lineAt(last) });
      re.lastIndex = last = close < 0 ? html.length : html.indexOf('>', close) + 1;
      continue;
    }
    if (!VOID.has(tag) && !m[4]) stack.push(node);
  }
  text(html.slice(last), last);
  return root;
}

const walk = (node, fn) => { for (const c of node.children || []) if (c.tag !== '#text') { fn(c); walk(c, fn); } };
const classesOf = (n) => (n.attrs.class || '').split(/\s+/).filter(Boolean);
const textOf = (n) => n.tag === '#text' ? n.text : (n.tag === 'svg' || n.tag === 'script' || n.tag === 'style') ? '' : (n.children || []).map(textOf).join(' ');
const words = (s) => s.replace(/&nbsp;|\s+/g, ' ').trim();
const ancestor = (n, test) => { for (let p = n.parent; p; p = p.parent) if (test(p)) return p; return null; };
const quote = (x) => '`' + x + '`';

function distance(a, b) { // edits between two short names: insert, delete, change, or swap two letters side by side
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}
/** The known names nearest to an unknown one: the closest spellings, then the other parts and variants of the same
    block (tray-btn--primary: tray-btn first). */
export function nearest(name, known, n = 3) {
  const base = name.split('--')[0].split('__')[0];
  const score = (k) => {
    const edits = distance(name, k);
    if (edits <= 2) return edits;
    if (k === base) return 2.5;
    if (k.startsWith(base + '_') || k.startsWith(base + '-')) return 3;
    return edits + 1;
  };
  return known.map((k) => [k, score(k)]).filter(([, s]) => s <= 4)
    .sort((x, y) => x[1] - y[1] || x[0].length - y[0].length || (x[0] < y[0] ? -1 : 1)).slice(0, n).map(([k]) => k);
}

// Names agents invent most, and what the system has instead
const INSTEAD = {
  'tray-btn--primary': '`tray-btn` alone is the yellow primary button.',
  'tray-btn--secondary': 'Every button but the main one is `tray-btn--quiet` (or `--ghost`, `--link`, `--dark`, `--danger`).',
  'tray-btn--outline': 'Nothing is outlined in Tray UI: a second button is `tray-btn--quiet` or `--ghost`.',
  'tray-btn--outlined': 'Nothing is outlined in Tray UI: a second button is `tray-btn--quiet` or `--ghost`.',
  'tray-btn--accent': '`tray-btn` alone is the yellow one.',
  'tray-btn--lg': 'Buttons come in the default size, `--md`, `--sm` and `--xs`.',
  'tray-card__body': 'A card holds its content directly; it has `tray-card__head` and `tray-card__foot`.',
  'tray-input--error': 'An invalid field says so in an attribute: aria-invalid="true", with a `tray-field__error` message.',
  'tray-container--narrow': 'For a narrow column, use `tray-screen__body--narrow` or a token in a style (max-inline-size).',
};

/** Checks one document or fragment against the rules: { classes, typeStyles, behaviours, icons }. options.prefixes: the
    starts of a project's own classes ('kit-'), which are not reported as foreign. */
export function check(html, rules, { prefixes = [] } = {}) {
  const known = new Set([...(rules.classes || []), ...(rules.typeStyles || [])]);
  const ownClass = (c) => prefixes.some((p) => p && c.startsWith(p));
  const trayClasses = (rules.classes || []).filter((c) => c.startsWith('tray-'));
  const behaviours = new Set(rules.behaviours || []);
  const icons = rules.icons ? new Set(rules.icons) : null;
  const out = [];
  const add = (rule, severity, line, message) => out.push({ rule, severity, line, message });
  const tree = parse(html);
  const all = [];
  walk(tree, (n) => all.push(n));
  const inTemplate = (n) => !!ancestor(n, (p) => p.tag === 'template');
  const live = all.filter((n) => !inTemplate(n)); // a <template> holds markup for a script to copy, not part of the page yet
  const ids = new Map();
  for (const n of live) if (n.attrs.id) {
    if (ids.has(n.attrs.id)) add('duplicate-id', 'error', n.line, `id="${n.attrs.id}" is used again (first on line ${ids.get(n.attrs.id).line}): an id names one element.`);
    else ids.set(n.attrs.id, n);
  }
  const labelled = new Set(live.filter((n) => n.tag === 'label' && n.attrs.for).map((n) => n.attrs.for));

  // 1. classes that exist; no state in classes
  const foreign = new Map();
  for (const n of live) for (const c of classesOf(n)) {
    if (c.startsWith('tray-')) {
      if (!known.has(c)) {
        const near = nearest(c, trayClasses);
        add('unknown-class', 'error', n.line, `${quote(c)} is not a Tray UI class.` + (INSTEAD[c] ? ' ' + INSTEAD[c] : near.length ? ` Did you mean ${near.map(quote).join(', ')}?` : ''));
      }
    } else if (STATE_CLASSES.test(c)) {
      add('state-in-class', 'warning', n.line, `${quote(c)}: state lives in attributes (aria-selected, aria-current, aria-pressed, aria-expanded, open, hidden, disabled), never in classes.`);
    } else if (!known.has(c) && !ownClass(c)) {
      const at = foreign.get(c) || { line: n.line, count: 0 };
      at.count++;
      foreign.set(c, at);
    }
  }
  if (foreign.size) {
    const list = [...foreign.keys()];
    const utility = list.filter((c) => TAILWIND.test(c));
    add('foreign-class', 'warning', foreign.get(list[0]).line, `${list.length} class${list.length > 1 ? 'es' : ''} that Tray UI does not have: ${list.slice(0, 12).map(quote).join(', ')}${list.length > 12 ? ' …' : ''}`
      + ` (first on line ${foreign.get(list[0]).line}). ` + (utility.length ? 'Utility classes (Tailwind and the like) have no place here. ' : '')
      + 'Use tray- classes and the type styles (display, headline, title, subtitle, lead, body, caption, label); where no class gives a value, a token in a style attribute (style="gap: var(--space-6)").');
  }

  // 2. behaviours and icons that exist
  for (const n of live) if ('data-tray' in n.attrs) {
    for (const name of n.attrs['data-tray'].split(/\s+/).filter(Boolean)) if (!behaviours.has(name)) {
      const near = nearest(name, [...behaviours]);
      add('unknown-behaviour', 'error', n.line, `data-tray="${name}" is not a behaviour.` + (near.length ? ` Known near it: ${near.join(', ')}.` : ''));
    }
    if (!n.attrs['data-tray'].trim()) add('unknown-behaviour', 'error', n.line, 'An empty data-tray attribute: name a behaviour or leave the attribute out.');
  }
  if (icons) for (const n of live) if (n.tag === 'use') {
    const ref = n.attrs.href ?? n.attrs['xlink:href'] ?? '';
    const name = (ref.match(/^#tray-i-(.+)$/) || [])[1];
    if (name && !icons.has(name)) {
      const near = nearest(name, [...icons]);
      add('unknown-icon', 'error', n.line, `#tray-i-${name} is not one of the icons built in.` + (near.length ? ` Near it: ${near.join(', ')}.` : '') + ' The icons page lists them; another Lucide icon goes in as its own inline <svg>.');
    }
  }

  // 3. one yellow per view: the page, and each part shown on its own (a dialog, a sheet, a tab panel, a popover, a
  // folded section, a task of a checklist, a plan, a form, the page's header and footer, a part kept hidden until it is
  // shown, such as a step of a wizard). A heuristic: a long page that scrolls shows several views. A form far down the
  // page is one of them, and so is each band of a long page: a <section> straight inside <main> (through plain wrappers),
  // when <main> holds three or more; a band that is itself yellow is a view of its own.
  const landmark = (p) => (p.tag === 'header' || p.tag === 'footer') && !ancestor(p, (q) => ['main', 'article', 'section', 'aside', 'dialog'].includes(q.tag));
  const main = live.find((n) => n.tag === 'main');
  const SECTIONS = ['section', 'article', 'aside', 'nav', 'dialog', 'form', 'details', 'header', 'footer'];
  const isBand = (p) => !!main && p.tag === 'section' && ancestor(p, (q) => q === main || SECTIONS.includes(q.tag)) === main;
  const long = live.filter(isBand).length >= 3;
  const band = (p) => long && isBand(p);
  const own = (p) => p.tag === 'dialog' || p.tag === 'details' || p.tag === 'form' || p.attrs.role === 'tabpanel' || p.attrs.role === 'dialog'
    || 'popover' in p.attrs || 'hidden' in p.attrs || landmark(p) || band(p) || classesOf(p).some((c) => c === 'tray-task' || c === 'tray-pop' || c === 'tray-plan');
  const views = new Map();
  for (const n of live) {
    const cls = classesOf(n);
    const yellowButton = cls.includes('tray-btn') && !QUIET.some((v) => cls.includes(v));
    const yellowSurface = cls.includes('tray-card--accent') || cls.includes('tray-island');
    if (!yellowButton && !yellowSurface) continue;
    const view = (yellowSurface && band(n) ? n : ancestor(n, own)) || tree;
    const v = views.get(view) || { buttons: [], surfaces: [] };
    (yellowButton ? v.buttons : v.surfaces).push(n);
    views.set(view, v);
  }
  for (const [view, v] of views) {
    const where = view === tree ? 'the page' : `the <${view.tag}> on line ${view.line}`;
    if (v.buttons.length > 1) add('one-yellow', 'warning', v.buttons[1].line,
      `${v.buttons.length} yellow (primary) buttons in ${where}, on lines ${v.buttons.map((b) => b.line).join(', ')}. Keep the one for the main action; make the others ${quote('tray-btn--quiet')}, ${quote('--ghost')} or ${quote('--link')}.`);
    if (v.surfaces.length > 1) add('one-yellow', 'warning', v.surfaces[1].line, `${v.surfaces.length} large yellow surfaces in ${where} (lines ${v.surfaces.map((b) => b.line).join(', ')}); at most one per screen.`);
  }

  // 4. buttons: the browser's element, a name, words that say what happens
  for (const n of live) {
    const cls = classesOf(n);
    if (cls.includes('tray-btn') && !['button', 'a', 'input', 'summary', 'label'].includes(n.tag))
      add('button-element', 'error', n.line, `${quote('tray-btn')} on a <${n.tag}>: use <button type="button"> when it does something, <a href> when it goes somewhere.`);
    if (n.tag === 'a' && cls.includes('tray-btn') && !('href' in n.attrs))
      add('button-element', 'error', n.line, 'A link styled as a button needs an href; a control that does something is a <button type="button">.');
    if (n.tag === 'button' || (n.tag === 'a' && cls.includes('tray-btn'))) {
      const name = words(textOf(n));
      const hasName = name || n.attrs['aria-label'] || n.attrs['aria-labelledby'] || n.attrs.title;
      if (!hasName) add('button-name', 'error', n.line, 'A button with no text needs an aria-label that says what it does.');
      if (BAD_WORDS.test(name)) add('button-words', 'warning', n.line, `Button text "${name}": start with a verb and name the outcome ("Sign in", "Save changes"), never OK, Submit or Yes.`);
      if (/!/.test(name)) add('no-exclamation', 'warning', n.line, `Button text "${name}": no exclamation marks.`);
      if (n.tag === 'button' && !n.attrs.type && !ancestor(n, (p) => p.tag === 'form'))
        add('button-type', 'warning', n.line, 'Give a button outside a form type="button" (inside a form, type="submit" or "button" says which it is).');
    }
  }

  // 5. every form control has a name; sign-in and sign-up fields say what they hold
  for (const n of live) {
    if (!['input', 'select', 'textarea'].includes(n.tag)) continue;
    const type = (n.attrs.type || 'text').toLowerCase();
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) continue;
    const named = (n.attrs.id && labelled.has(n.attrs.id)) || n.attrs['aria-label'] || n.attrs['aria-labelledby'] || n.attrs.title || ancestor(n, (p) => p.tag === 'label');
    if (!named) add('control-label', 'error', n.line, `<${n.tag}${n.attrs.id ? ` id="${n.attrs.id}"` : ''}> has no label: add <label class="tray-label" for="…">, or an aria-label when what it is for shows otherwise.`);
    if (type === 'password' && !n.attrs.autocomplete) add('autocomplete', 'warning', n.line, 'A password field takes autocomplete="current-password" (sign in) or "new-password" (sign up, a new password).');
    if (type === 'email' && !n.attrs.autocomplete) add('autocomplete', 'warning', n.line, 'An email field takes autocomplete="email", or "username" on a sign-in form.');
  }

  // 6. references point at an element that exists
  for (const n of live) {
    for (const ref of ['aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-owns', 'aria-activedescendant', 'aria-errormessage']) {
      if (!n.attrs[ref]) continue;
      for (const id of n.attrs[ref].split(/\s+/).filter(Boolean)) if (!ids.has(id)) add('broken-reference', 'error', n.line, `${ref}="${id}" points at no element with that id.`);
    }
    if (n.tag === 'label' && n.attrs.for && !ids.has(n.attrs.for)) add('broken-reference', 'error', n.line, `<label for="${n.attrs.for}"> points at no element with that id.`);
    for (const ref of ['popovertarget', 'commandfor', 'list', 'form']) {
      if (n.attrs[ref] && n.tag !== 'form' && !ids.has(n.attrs[ref])) add('broken-reference', 'error', n.line, `${ref}="${n.attrs[ref]}" points at no element with that id.`);
    }
    const target = n.attrs['data-target'];
    if (target && /^#[\w-]+$/.test(target) && !ids.has(target.slice(1))) add('broken-reference', 'error', n.line, `data-target="${target}" points at no element with that id.`);
  }

  // 7. tabs wired as the guide says
  for (const n of live) {
    if (n.attrs.role === 'tab') {
      if (!n.attrs['aria-controls']) add('tabs', 'error', n.line, 'A role="tab" needs aria-controls pointing at its role="tabpanel".');
      if (n.tag === 'button' && n.attrs.type !== 'button') add('tabs', 'warning', n.line, 'Keep type="button" on a tab, so a tab inside a form does not send it.');
    }
    if ((n.attrs['data-tray'] || '').split(/\s+/).includes('tabs') && !live.some((c) => c.attrs.role === 'tablist' && ancestor(c, (p) => p === n)))
      add('tabs', 'error', n.line, 'data-tray="tabs" wraps a role="tablist" of role="tab" buttons and their role="tabpanel"s.');
  }

  // 8. headings in order; no exclamation marks
  const heads = live.filter((n) => /^h[1-6]$/.test(n.tag));
  let prev = 0;
  for (const h of heads) {
    const level = +h.tag[1];
    if (prev && level > prev + 1) add('heading-order', 'warning', h.line, `<${h.tag}> after <h${prev}> skips a level.`);
    if (/!/.test(textOf(h))) add('no-exclamation', 'warning', h.line, 'No exclamation marks in headings.');
    prev = level;
  }

  // 9. tokens, never literal values: colours anywhere, sizes of space, corners and type in a style attribute
  for (const n of all) {
    const style = n.attrs.style || (n.tag === 'style' ? textOf(n) : '');
    if (!style || inTemplate(n)) continue;
    const colour = style.replace(/var\([^)]*\)/g, '').match(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\(|(?<![-\w])(?:white|black|red|blue|green|yellow|gray|grey|orange|purple|pink)\b/);
    if (colour) add('literal-value', 'warning', n.line, `A literal colour (${colour[0]}) in ${n.tag === 'style' ? 'a <style>' : 'a style attribute'}: use a token, var(--ink), var(--surface), var(--accent)…`);
    // space, corners and type come from tokens; a width cap such as max-inline-size: 48rem is left alone (the blocks use them)
    // (a hairline measure of 1 or 2px, as the stylesheet writes them inside a part, is left alone too)
    const size = style.replace(/var\([^)]*\)/g, '').match(/(?:margin|padding|gap|inset|radius|font-size|line-height|letter-spacing)[\w-]*\s*:\s*[^;]*?(?<![\w.-])(?!(?:0?\.\d+|[12])px\b)\d*\.?\d+(?:px|rem|em)\b/);
    if (size && n.tag !== 'style') add('literal-value', 'warning', n.line, `A literal size (${size[0].trim()}) in a style attribute: use a token, var(--space-6), var(--radius-card)…`);
  }
  if (live.some((n) => n.tag === 'style'))
    add('own-css', 'warning', all.find((n) => n.tag === 'style').line, 'A <style> element: the look comes from the system\'s classes and tokens. Where a layout needs a value no class gives, set a token in a style attribute instead.');
  for (const n of live) if (n.tag === 'img' && !('alt' in n.attrs)) add('img-alt', 'error', n.line, 'An <img> needs alt ("" when it only decorates).');

  // 10. a whole page: its language and theme, the three files in order, one <h1>
  const htmlEl = live.find((n) => n.tag === 'html');
  if (htmlEl) {
    if (!htmlEl.attrs.lang) add('document', 'error', htmlEl.line, '<html> needs lang, such as lang="en".');
    if (!htmlEl.attrs['data-theme']) add('document', 'warning', htmlEl.line, '<html> takes data-theme ("light", "dark" or another of the themes).');
    if (!live.some((n) => n.tag === 'meta' && n.attrs.name === 'viewport')) add('document', 'warning', htmlEl.line, 'Add <meta name="viewport" content="width=device-width, initial-scale=1">, so the page fits a phone.');
    const files = live.filter((n) => (n.tag === 'link' && /stylesheet/.test(n.attrs.rel || '')) || (n.tag === 'script' && n.attrs.src)).map((n) => ({ n, src: n.attrs.href || n.attrs.src }));
    const at = (re) => files.findIndex((f) => re.test(f.src));
    const t = at(/(^|\/)tokens\.css([?#]|$)/), c = at(/(^|\/)bundle\.css([?#]|$)/), j = at(/(^|\/)bundle\.js([?#]|$)/);
    const reactStyles = at(/styles\.css([?#]|$)/);
    if ((t < 0 || c < 0 || j < 0) && reactStyles < 0) add('three-files', 'error', htmlEl.line, `Link the three files: ${[t < 0 && 'tokens.css', c < 0 && 'components/bundle.css', j < 0 && 'components/bundle.js'].filter(Boolean).join(', ')} missing.`);
    else if (t >= 0 && c >= 0 && j >= 0 && !(t < c && c < j)) add('three-files', 'error', files[c].n.line, 'Link tokens.css, then components/bundle.css, then components/bundle.js, in that order.');
    if (j >= 0 && ancestor(files[j].n, (p) => p.tag === 'head') && !('defer' in files[j].n.attrs)) add('three-files', 'warning', files[j].n.line, 'Load bundle.js with defer when it is in the <head>, or at the end of the <body>.');
    const h1 = heads.filter((h) => h.tag === 'h1');
    if (heads.length && !h1.length) add('heading-order', 'warning', heads[0].line, 'A page needs one <h1>.');
    if (h1.length > 1) add('heading-order', 'warning', h1[1].line, `${h1.length} <h1> on the page: keep one.`);
  }
  const rank = { error: 0, warning: 1 };
  return out.sort((a, b) => rank[a.severity] - rank[b.severity] || a.line - b.line);
}

/** The findings as text, one line each. */
export function report(findings) {
  if (!findings.length) return 'no problems found by these checks. They do not replace looking at the page at 1280, 768 and 390px wide in a light and a dark theme.';
  const errors = findings.filter((f) => f.severity === 'error').length;
  return `${errors} error${errors === 1 ? '' : 's'}, ${findings.length - errors} warning${findings.length - errors === 1 ? '' : 's'}\n`
    + findings.map((f) => `  ${f.severity === 'error' ? 'error  ' : 'warning'} ${f.line ? `line ${String(f.line).padEnd(5)}` : '          '}${f.message}  [${f.rule}]`).join('\n');
}

/** The rules beside this file: rules.json, which the build writes from the bundle of the same version. */
export async function loadRules(path) {
  const { readFileSync, existsSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  // beside this file in the package and the skill; in the repository, where the build writes it (system/dist/cli)
  const found = path || [new URL('./rules.json', import.meta.url), new URL('../dist/cli/rules.json', import.meta.url)].find((u) => existsSync(fileURLToPath(u)));
  if (!found) throw new Error('rules.json is missing beside check.mjs: it comes with the trayui package and the skill');
  return JSON.parse(readFileSync(found, 'utf8'));
}

/** The command: check files, folders (every .html in them) or stdin (-). Returns the exit code. */
export async function main(argv, { name = 'check.mjs' } = {}) {
  const print = console.log;
  const { readFileSync, readdirSync, statSync } = await import('node:fs');
  const { join } = await import('node:path');
  const json = argv.includes('--json');
  // the options that take a value: --rules file, --prefix kit- (again, or kit-,app-), each also as --name=value
  const taken = new Set();
  const values = (flag) => argv.flatMap((a, i) => {
    if (a === flag) { taken.add(i + 1); return argv[i + 1] === undefined ? [] : [argv[i + 1]]; }
    return a.startsWith(flag + '=') ? [a.slice(flag.length + 1)] : [];
  });
  const rulesFile = values('--rules')[0];
  const prefixes = values('--prefix').flatMap((v) => v.split(',')).map((p) => p.trim()).filter(Boolean);
  const targets = argv.filter((a, i) => !a.startsWith('--') && !taken.has(i));
  if (argv.includes('--help') || argv.includes('-h') || !targets.length) {
    print(`usage: ${name} <page.html | folder | -> [...] [--json] [--rules rules.json] [--prefix kit-]\n\nChecks Tray UI markup: classes, behaviours and icons that exist, one yellow per view, names and labels, references,\ntabs, headings, tokens, and on a whole page its language, theme and the three files. Exit code 1 when a file has an error.\n--prefix names the start of your own classes (kit-), which are then not reported as foreign; give it again for more.`);
    return targets.length || argv.includes('--help') || argv.includes('-h') ? 0 : 2;
  }
  let rules;
  try { rules = await loadRules(rulesFile); } catch (e) { print(`${name}: cannot read the rules: ${e.message}`); return 2; }
  const files = [];
  const visit = (p) => {
    if (p === '-') return files.push(p);
    const s = statSync(p);
    if (s.isDirectory()) {
      for (const f of readdirSync(p).sort()) if (f !== 'node_modules' && !f.startsWith('.')) {
        const q = join(p, f);
        if (statSync(q).isDirectory() || /\.html?$/i.test(f)) visit(q);
      }
    } else files.push(p);
  };
  for (const t of targets) {
    try { visit(t); } catch { print(`${t}: no such file or folder`); return 2; }
  }
  let failed = false;
  const results = [];
  for (const f of files) {
    const html = f === '-' ? readFileSync(0, 'utf8') : readFileSync(f, 'utf8');
    const findings = check(html, rules, { prefixes });
    if (findings.some((x) => x.severity === 'error')) failed = true;
    results.push({ file: f === '-' ? 'stdin' : f, findings });
    if (!json) print(`${f === '-' ? 'stdin' : f}: ${report(findings)}`);
  }
  if (json) print(JSON.stringify({ version: rules.version, files: results }, null, 1));
  else if (files.length > 1) print(`\n${files.length} files, ${results.filter((r) => r.findings.some((x) => x.severity === 'error')).length} with errors (Tray UI ${rules.version}).`);
  return failed ? 1 : 0;
}

// run as a script (node check.mjs …), not when imported
if (typeof process !== 'undefined' && process.argv[1]) {
  const { realpathSync } = await import('node:fs');
  const { pathToFileURL } = await import('node:url');
  let self = '';
  try { self = pathToFileURL(realpathSync(process.argv[1])).href; } catch { /* not a file */ }
  if (self === import.meta.url) process.exitCode = await main(process.argv.slice(2));
}
