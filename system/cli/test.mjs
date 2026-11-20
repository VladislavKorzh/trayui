#!/usr/bin/env node
/* Tests of the markup checker (check.mjs), with no dependencies: every rule catches a small bad page and lets the good
   one through, every block of the system is clean, and the command behaves (files, folders, stdin, --json, exit codes).
   Then npx trayui kit, against a mock of the shop's API on this computer serving zips made here: the list, both
   editions, a folder that holds files, every error the shop sends, a wrong sha256, archives that try to write outside
   their folder, and a licence key that is never printed.

     node cli/test.mjs            from system/; exit code 1 when a test fails

   The rules come from rules.json, which tools/build.py writes beside the checker in dist/cli. */
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';
import { check, loadRules, nearest, parse, report } from './check.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const blocksDir = join(here, '..', 'project', 'blocks');
const rules = await loadRules();
const results = [];
const expect = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });

const HEAD = '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Test</title>\n'
  + '<link rel="stylesheet" href="trayui/tokens.css">\n<link rel="stylesheet" href="trayui/components/bundle.css">\n'
  + '<script src="trayui/components/bundle.js" defer></script>';
const page = (body, { head = HEAD, html = '<html lang="en" data-theme="light">' } = {}) =>
  `<!doctype html>\n${html}\n<head>\n${head}\n</head>\n<body>\n<main class="tray-container tray-section tray-stack">\n<h1 class="title">Orders</h1>\n${body}\n</main>\n</body>\n</html>\n`;
const run = (html) => check(html, rules);
const summary = (f) => f.map((x) => `${x.severity} ${x.rule}:${x.line} ${x.message.slice(0, 90)}`).join(' | ');

/** The fixture must give a finding of this rule (and severity, and words in its message). */
function catches(name, html, rule, { severity, says, line } = {}) {
  const f = run(html);
  const hit = f.find((x) => x.rule === rule && (!severity || x.severity === severity) && (!says || x.message.includes(says)) && (!line || x.line === line));
  expect(`catches ${rule}: ${name}`, hit, summary(f) || 'no findings');
}
/** The fixture must give no finding of this rule (or none at all). */
function passes(name, html, rule) {
  const f = run(html).filter((x) => !rule || x.rule === rule);
  expect(`passes${rule ? ' ' + rule : ''}: ${name}`, !f.length, summary(f));
}

// ---------- a good page: nothing to say ----------
const GOOD = page(`<form class="tray-card tray-stack" action="#">
  <div class="tray-field">
    <label class="tray-label" for="email">Email</label>
    <input class="tray-input" id="email" type="email" autocomplete="username">
  </div>
  <div class="tray-field">
    <label class="tray-label" for="password">Password</label>
    <div class="tray-input-group">
      <input class="tray-input" id="password" type="password" autocomplete="current-password">
      <button class="tray-input-group__btn" type="button" data-tray="reveal" aria-label="Show password"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-eye"/></svg></button>
    </div>
  </div>
  <button class="tray-btn" type="submit">Sign in</button>
  <button class="tray-btn tray-btn--quiet" type="button" data-tray="open" data-target="#help">Get help</button>
</form>
<dialog class="tray-dialog" id="help" aria-labelledby="help-title">
  <h2 class="subtitle" id="help-title">Help</h2>
  <p class="body" style="margin-block-start: var(--space-4)">Write to the desk.</p>
  <button class="tray-btn" type="button">Write to the desk</button>
</dialog>`);
expect('the good page has no findings', !run(GOOD).length, summary(run(GOOD)));

// ---------- 1. classes ----------
catches('an invented class, with the class it was meant to be first', page('<div class="tray-crad">x</div>'), 'unknown-class', { severity: 'error', says: 'Did you mean `tray-card`' });
catches('an invented variant, with what the system has instead', page('<a class="tray-btn tray-btn--primary" href="#">Order</a>'), 'unknown-class', { says: '`tray-btn` alone is the yellow primary' });
passes('classes that exist and type styles', page('<div class="tray-card tray-stack"><p class="lead">x</p><p class="caption">y</p></div>'), 'unknown-class');
catches('utility classes', page('<div class="flex p-4 tray-card">x</div>'), 'foreign-class', { severity: 'warning', says: 'Utility classes' });
catches('a class of its own', page('<div class="order-box">x</div>'), 'foreign-class', { says: '`order-box`' });
passes('the code colours a block of code uses', page('<pre class="tray-code"><code><span class="hljs-addition">+ a</span></code></pre>'), 'foreign-class');
// a project's own prefix: its classes are not foreign, others still are, and tray- names are still checked
const own = page('<div class="kit-hero tray-card"><p class="kit-hero__lead">x</p></div>');
expect('passes foreign-class: the classes of a prefix of the project (prefixes: [kit-])', !check(own, rules, { prefixes: ['kit-'] }).some((x) => x.rule === 'foreign-class'), summary(check(own, rules, { prefixes: ['kit-'] })));
expect('catches foreign-class: the same classes without the prefix given', run(own).some((x) => x.rule === 'foreign-class' && x.message.includes('`kit-hero`')), summary(run(own)));
const mixed = check(page('<div class="kit-hero order-box tray-crad">x</div>'), rules, { prefixes: ['kit-'] });
expect('a prefix leaves other classes foreign and tray- names checked', mixed.some((x) => x.rule === 'foreign-class' && x.message.includes('`order-box`') && !x.message.includes('kit-hero')) && mixed.some((x) => x.rule === 'unknown-class'), summary(mixed));
catches('state in a class', page('<div class="tray-tabs" role="tablist"><button class="tray-tab active" role="tab" type="button" aria-controls="p1">A</button></div><div id="p1" role="tabpanel"></div>'), 'state-in-class', { severity: 'warning', says: '`active`' });

// ---------- 2. behaviours and icons ----------
catches('an unknown behaviour', page('<div data-tray="tabz"></div>'), 'unknown-behaviour', { severity: 'error', says: 'tabs' });
catches('one unknown name among several', page('<span class="tray-anchor" data-tray="tooltip popovr" data-tip="Copy"><button class="tray-btn tray-btn--quiet" type="button">Copy</button></span>'), 'unknown-behaviour', { says: '"popovr"' });
passes('several names that exist', page('<span class="tray-anchor" data-tray="tooltip" data-tip="Copy"><button class="tray-btn tray-btn--quiet" type="button" data-tray="copy" data-target="#t">Copy</button></span><span id="t">x</span>'), 'unknown-behaviour');
catches('an empty data-tray', page('<div data-tray=""></div>'), 'unknown-behaviour', { says: 'empty' });
catches('an icon the sprite does not have', page('<svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chevron-rigth"/></svg>'), 'unknown-icon', { severity: 'error', says: 'chevron-right' });
passes('an icon it has', page('<svg class="tray-icon" aria-hidden="true"><use href="#tray-i-truck"/></svg>'), 'unknown-icon');

// ---------- 3. one yellow per view ----------
catches('two yellow buttons in the page', page('<button class="tray-btn" type="button">Save</button><button class="tray-btn" type="button">Publish</button>'), 'one-yellow', { severity: 'warning', says: '2 yellow' });
catches('two yellow buttons in one dialog', page('<dialog id="d" aria-label="Confirm"><button class="tray-btn" type="button">Keep it</button><button class="tray-btn" type="button">Delete it</button></dialog>'), 'one-yellow', { says: 'the <dialog>' });
passes('one in the page and one in a dialog', page('<button class="tray-btn" type="button">Save</button><dialog id="d" aria-label="Confirm"><button class="tray-btn" type="button">Delete it</button></dialog>'), 'one-yellow');
passes('one in the page header and one in a form far down', page('<header class="tray-topbar"><a class="tray-btn tray-btn--sm" href="#">Order a jar</a></header><form action="#"><button class="tray-btn" type="submit">Post the comment</button></form>'), 'one-yellow');
passes('quiet, ghost, link and danger buttons beside the one yellow', page('<button class="tray-btn" type="button">Save</button><button class="tray-btn tray-btn--quiet" type="button">Cancel</button><button class="tray-btn tray-btn--ghost" type="button">Preview</button><button class="tray-btn tray-btn--danger" type="button">Delete</button>'), 'one-yellow');
catches('two large yellow surfaces', page('<div class="tray-card tray-card--accent">a</div><div class="tray-card tray-card--accent">b</div>'), 'one-yellow', { says: 'yellow surfaces' });
// a long page: each section of <main> is a screen of its own, once there are three or more
const band = (inner, h) => `<section aria-labelledby="${h}"><h2 id="${h}">${h}</h2>${inner}</section>`;
const yes = '<a class="tray-btn" href="#">Start free</a>', card = '<div class="tray-card tray-card--accent">x</div>';
passes('a long page: the hero\'s yellow button and the closing one, sections apart', page(band(yes, 'hero') + band('<p>a</p>', 'how') + band('<p>b</p>', 'proof') + band(yes, 'start')), 'one-yellow');
passes('a long page: a yellow card in the hero and a closing section that is itself yellow', page(band(card, 'hero') + band('<p>a</p>', 'how') + '<div class="tray-section"><section class="tray-card tray-card--accent tray-cta" aria-labelledby="cta"><h2 id="cta">Start</h2></section></div>'), 'one-yellow');
catches('a long page: two yellow buttons in one of its sections', page(band(yes + yes.replace('Start free', 'Book a call'), 'hero') + band('<p>a</p>', 'how') + band('<p>b</p>', 'start')), 'one-yellow', { says: 'the <section>' });
catches('a long page: two large yellow surfaces in one of its sections', page(band(card + card, 'hero') + band('<p>a</p>', 'how') + band('<p>b</p>', 'start')), 'one-yellow', { says: 'yellow surfaces' });
catches('a short page of two sections is one screen', page(band(yes, 'one') + band(yes.replace('Start free', 'Book a call'), 'two')), 'one-yellow', { says: 'the page' });
passes('a step kept hidden until it is shown is a view of its own', page('<form action="#"><section data-step aria-label="Farm"><button class="tray-btn" type="submit">Continue</button></section><section data-step aria-label="Team" hidden><button class="tray-btn" type="submit">Finish</button></section></form>'), 'one-yellow');

// ---------- 4. buttons ----------
catches('tray-btn on a span', page('<span class="tray-btn">Order</span>'), 'button-element', { severity: 'error', says: '<span>' });
catches('a link button without href', page('<a class="tray-btn">Order</a>'), 'button-element', { says: 'href' });
catches('an icon-only button with no name', page('<button class="tray-btn tray-btn--quiet tray-btn--icon" type="button"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-x"/></svg></button>'), 'button-name', { severity: 'error' });
passes('an icon-only button with an aria-label', page('<button class="tray-btn tray-btn--quiet tray-btn--icon" type="button" aria-label="Close"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-x"/></svg></button>'), 'button-name');
catches('"OK" on a button', page('<button class="tray-btn" type="button">OK</button>'), 'button-words', { severity: 'warning' });
catches('"Submit" on a button', page('<form action="#"><button class="tray-btn" type="submit">Submit</button></form>'), 'button-words');
catches('an exclamation mark on a button', page('<button class="tray-btn" type="button">Save now!</button>'), 'no-exclamation');
catches('a button outside a form with no type', page('<button class="tray-btn">Save</button>'), 'button-type', { severity: 'warning' });
passes('a button in a form with no type (it sends the form)', page('<form action="#"><button class="tray-btn">Save</button></form>'), 'button-type');

// ---------- 5. fields ----------
catches('a field with no label', page('<input class="tray-input" id="q">'), 'control-label', { severity: 'error', says: 'id="q"' });
catches('a select with no label', page('<select class="tray-select"><option>One</option></select>'), 'control-label');
passes('a label with for, a label around, an aria-label', page('<label class="tray-label" for="a">A</label><input class="tray-input" id="a"><label class="tray-check"><input type="checkbox"> B</label><input class="tray-input" aria-label="Search" type="search">'), 'control-label');
passes('a hidden input needs no label', page('<input type="hidden" name="t" value="1">'), 'control-label');
catches('a password field with no autocomplete', page('<label class="tray-label" for="p">Password</label><input class="tray-input" id="p" type="password">'), 'autocomplete', { severity: 'warning', says: 'current-password' });
catches('an email field with no autocomplete', page('<label class="tray-label" for="e">Email</label><input class="tray-input" id="e" type="email">'), 'autocomplete', { says: 'username' });

// ---------- 6. references and ids ----------
catches('aria-controls to nothing', page('<button class="tray-btn tray-btn--quiet" type="button" aria-controls="menu-1" aria-expanded="false">More</button>'), 'broken-reference', { severity: 'error', says: 'menu-1' });
catches('aria-labelledby to nothing', page('<section aria-labelledby="t1">x</section>'), 'broken-reference', { says: 't1' });
catches('label for to nothing', page('<label class="tray-label" for="nope">Name</label><input class="tray-input" id="name">'), 'broken-reference', { says: 'for="nope"' });
catches('data-target to nothing', page('<button class="tray-btn tray-btn--quiet" type="button" data-tray="copy" data-target="#missing">Copy</button>'), 'broken-reference', { says: '#missing' });
passes('references that hold, also into a block of code', page('<p id="n">Note</p><button class="tray-btn tray-btn--quiet" type="button" aria-describedby="n" data-tray="copy" data-target="#c">Copy</button><pre class="tray-code"><code id="c">a</code></pre>'), 'broken-reference');
catches('an id used twice', page('<div id="a">1</div><div id="a">2</div>'), 'duplicate-id', { severity: 'error' });

// ---------- 7. tabs ----------
catches('a tab with no panel', page('<div data-tray="tabs"><div class="tray-tabs" role="tablist" aria-label="Views"><button class="tray-tab" role="tab" type="button" aria-selected="true">A</button></div></div>'), 'tabs', { severity: 'error', says: 'aria-controls' });
catches('data-tray="tabs" with no tablist inside', page('<div data-tray="tabs"><button class="tray-tab" type="button">A</button></div>'), 'tabs', { says: 'role="tablist"' });
catches('a tab with no type', page('<div data-tray="tabs"><div class="tray-tabs" role="tablist" aria-label="Views"><button class="tray-tab" role="tab" aria-controls="p">A</button></div><div id="p" role="tabpanel">x</div></div>'), 'tabs', { severity: 'warning', says: 'type="button"' });
passes('tabs as the guide writes them', page('<div data-tray="tabs"><div class="tray-tabs" role="tablist" aria-label="Views"><button class="tray-tab" role="tab" type="button" aria-selected="true" aria-controls="p1" id="t1">A</button><button class="tray-tab" role="tab" type="button" aria-controls="p2" id="t2">B</button></div><div class="tray-tabpanel" role="tabpanel" id="p1" aria-labelledby="t1">a</div><div class="tray-tabpanel" role="tabpanel" id="p2" aria-labelledby="t2" hidden>b</div></div>'), 'tabs');

// ---------- 8. headings ----------
catches('a skipped level', page('<h3 class="subtitle">Detail</h3>'), 'heading-order', { severity: 'warning', says: 'skips' });
catches('two h1', page('<h1 class="title">Again</h1>'), 'heading-order', { says: '2 <h1>' });
catches('a page with no h1', `<!doctype html>\n<html lang="en" data-theme="light">\n<head>\n${HEAD}\n</head>\n<body><h2 class="title">Orders</h2></body>\n</html>`, 'heading-order', { says: 'one <h1>' });
catches('an exclamation mark in a heading', page('<h2 class="subtitle">Done!</h2>'), 'no-exclamation');

// ---------- 9. tokens ----------
catches('a literal colour', page('<div style="color: #e33">x</div>'), 'literal-value', { severity: 'warning', says: '#e33' });
catches('a named colour', page('<div style="background: white">x</div>'), 'literal-value', { says: 'white' });
catches('a literal space', page('<div style="padding: 12px">x</div>'), 'literal-value', { says: 'padding: 12px' });
passes('tokens, a width cap and a hairline gap', page('<div style="gap: var(--space-6); max-inline-size: 48rem; padding-block: var(--space-4)">x</div><div style="gap: 2px">y</div>'), 'literal-value');
catches('a <style> of its own', page('<style>.x { color: red }</style><p>x</p>'), 'own-css', { severity: 'warning' });
catches('an image with no alt', page('<img src="a.png">'), 'img-alt', { severity: 'error' });
passes('an image with an empty alt', page('<img src="a.png" alt="">'), 'img-alt');

// ---------- 10. a whole page ----------
catches('no lang', page('', { html: '<html data-theme="light">' }), 'document', { severity: 'error', says: 'lang' });
catches('no data-theme', page('', { html: '<html lang="en">' }), 'document', { severity: 'warning', says: 'data-theme' });
catches('no viewport', page('', { head: HEAD.replace(/<meta name="viewport"[^>]*>/, '') }), 'document', { says: 'viewport' });
catches('a missing file', page('', { head: HEAD.replace(/<script[^>]*><\/script>/, '') }), 'three-files', { severity: 'error', says: 'components/bundle.js missing' });
catches('the files out of order', page('', { head: '<meta name="viewport" content="width=device-width, initial-scale=1">\n<link rel="stylesheet" href="components/bundle.css">\n<link rel="stylesheet" href="tokens.css">\n<script src="components/bundle.js" defer></script>' }), 'three-files', { says: 'in that order' });
catches('the script in the head without defer', page('', { head: HEAD.replace(' defer', '') }), 'three-files', { severity: 'warning', says: 'defer' });
passes('the script at the end of the body', `<!doctype html>\n<html lang="en" data-theme="light">\n<head>\n${HEAD.replace(/<script[^>]*><\/script>/, '')}\n</head>\n<body><h1 class="title">x</h1>\n<script src="trayui/components/bundle.js"></script></body>\n</html>`, 'three-files');
passes('the CDN links', page('', { head: '<meta name="viewport" content="width=device-width, initial-scale=1">\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/trayui@0.2.0/tokens.css">\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/trayui@0.2.0/components/bundle.css">\n<script src="https://cdn.jsdelivr.net/npm/trayui@0.2.0/components/bundle.js" defer></script>' }), 'three-files');
passes('a fragment is not a page', '<div class="tray-card"><h2 class="subtitle">x</h2></div>', 'document');
passes('a fragment needs no three files', '<div class="tray-card"><h2 class="subtitle">x</h2></div>', 'three-files');

// ---------- the parser and the suggestions ----------
const tree = parse('<div>\n  <p id="a">x</p>\n\n<span>y</span></div>');
expect('the parser gives each element its line', tree.children[0].children[0].line === 2 && tree.children[0].children[1].line === 4);
expect('a swap of two letters is one edit: tray-crad suggests tray-card first', nearest('tray-crad', rules.classes.filter((c) => c.startsWith('tray-')))[0] === 'tray-card');
expect('a misspelt icon suggests the icon', nearest('chevron-rigth', rules.icons)[0] === 'chevron-right');
expect('the report says when there is nothing to say', report([]).startsWith('no problems found'));

// ---------- every block of the system is clean ----------
const blocks = readdirSync(blocksDir).filter((f) => f.endsWith('.html')).sort();
const dirty = blocks.map((f) => [f, run(readFileSync(join(blocksDir, f), 'utf8'))]).filter(([, x]) => x.length);
expect(`all ${blocks.length} blocks are clean (no error, no warning)`, blocks.length >= 64 && !dirty.length, dirty.map(([f, x]) => `${f}: ${summary(x)}`).join(' || '));
const templatesDir = join(here, '..', 'project', 'templates');
const templates = readdirSync(templatesDir).filter((f) => f.endsWith('.html')).sort();
const yellow = templates.map((f) => [f, run(readFileSync(join(templatesDir, f), 'utf8')).filter((x) => x.rule === 'one-yellow')]).filter(([, x]) => x.length);
expect(`no one-yellow warning on the ${templates.length} templates (long pages, a wizard of hidden steps)`, templates.length >= 10 && !yellow.length, yellow.map(([f, x]) => `${f}: ${summary(x)}`).join(' || '));

// ---------- the command ----------
const tmp = mkdtempSync(join(tmpdir(), 'trayui-check-'));
try {
  const node = (args, input) => spawnSync(process.execPath, [join(here, 'check.mjs'), ...args], { encoding: 'utf8', input });
  writeFileSync(join(tmp, 'good.html'), GOOD);
  writeFileSync(join(tmp, 'bad.html'), page('<div class="tray-crad">x</div>'));
  let r = node([join(tmp, 'good.html')]);
  expect('a clean file: exit 0, and it says so', r.status === 0 && r.stdout.includes('no problems found'), r.stdout + r.stderr);
  r = node([join(tmp, 'bad.html')]);
  expect('a file with an error: exit 1, the line and the rule', r.status === 1 && /error\s+line \d+\s+`tray-crad`/.test(r.stdout) && r.stdout.includes('[unknown-class]'), r.stdout + r.stderr);
  r = node([tmp]);
  expect('a folder: every .html in it', r.status === 1 && r.stdout.includes('good.html') && r.stdout.includes('bad.html') && r.stdout.includes('2 files, 1 with errors'), r.stdout);
  r = node([blocksDir]);
  expect('the blocks folder: exit 0', r.status === 0 && r.stdout.includes(`${blocks.length} files, 0 with errors`), r.stdout.slice(-300));
  r = node(['-'], page('<img src="a.png">'));
  expect('stdin with -', r.status === 1 && r.stdout.startsWith('stdin:') && r.stdout.includes('[img-alt]'), r.stdout);
  r = node(['--json', join(tmp, 'bad.html')]);
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch { /* checked below */ }
  expect('--json: the findings as JSON', r.status === 1 && parsed && parsed.files[0].findings.some((x) => x.rule === 'unknown-class') && parsed.version === rules.version, r.stdout.slice(0, 200));
  r = node([]);
  expect('no file: the usage, exit 2', r.status === 2 && r.stdout.includes('usage'), r.stdout);
  r = node(['--help']);
  expect('--help: exit 0', r.status === 0 && r.stdout.includes('usage'), r.stdout);
  r = node([join(tmp, 'missing.html')]);
  expect('a file that is not there: exit 2', r.status === 2 && r.stdout.includes('no such file'), r.stdout + r.stderr);
  r = node(['--rules', join(tmp, 'nope.json'), join(tmp, 'good.html')]);
  expect('rules that cannot be read: exit 2, and it says why', r.status === 2 && r.stdout.includes('cannot read the rules'), r.stdout + r.stderr);
  writeFileSync(join(tmp, 'kit.html'), page('<div class="kit-hero app-band">x</div>'));
  r = node([join(tmp, 'kit.html')]);
  expect('a page of a project\'s own classes warns foreign-class without --prefix', r.stdout.includes('[foreign-class]'), r.stdout);
  r = node(['--prefix', 'kit-', join(tmp, 'kit.html'), '--prefix=app-']);
  expect('--prefix kit- and --prefix=app-: no foreign-class, and the value is not taken for a file', r.status === 0 && !r.stdout.includes('[foreign-class]') && !r.stdout.includes('no such file'), r.stdout);
  r = node([join(tmp, 'kit.html'), '--prefix', 'kit-,app-']);
  expect('--prefix kit-,app-: a list', r.status === 0 && !r.stdout.includes('[foreign-class]'), r.stdout);
  r = spawnSync(process.execPath, [join(here, 'trayui.mjs'), '--prefix', 'kit-,app-', 'check', join(tmp, 'kit.html')], { encoding: 'utf8' });
  expect('npx trayui --prefix kit-,app- check: passed on to the checker', r.status === 0 && !r.stdout.includes('[foreign-class]'), r.stdout + r.stderr);
  r = spawnSync(process.execPath, [join(here, 'trayui.mjs'), 'check', join(tmp, 'kit.html'), '--prefix', 'kit-,app-'], { encoding: 'utf8' });
  expect('npx trayui check … --prefix kit-,app-', r.status === 0 && !r.stdout.includes('[foreign-class]'), r.stdout + r.stderr);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// ---------- npx trayui kit ----------

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const hex = (b) => createHash('sha256').update(b).digest('hex');

/** A zip, written here: each entry { name, data, dir, mode, method (0 stored, 8 deflated), flags, crc, zip64,
    localExtra (an extra field in the local header only), descriptor (sizes after the data, as a stream writes them) }. */
function zip(entries) {
  const parts = [], central = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name);
    const data = Buffer.from(e.data || '');
    const method = e.method !== undefined ? e.method : e.dir ? 0 : 8;
    const body = method === 8 ? deflateRawSync(data) : data;
    const sum = e.crc !== undefined ? e.crc : crc(data);
    const packed = e.zip64 ? 0xffffffff : body.length, length = e.zip64 ? 0xffffffff : data.length;
    const flags = (e.flags || 0) | (e.descriptor ? 8 : 0);
    const extra = e.localExtra || Buffer.alloc(0);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(flags, 6); local.writeUInt16LE(method, 8);
    if (!e.descriptor) { local.writeUInt32LE(sum, 14); local.writeUInt32LE(packed, 18); local.writeUInt32LE(length, 22); }
    local.writeUInt16LE(name.length, 26); local.writeUInt16LE(extra.length, 28);
    const tail = e.descriptor ? Buffer.alloc(16) : Buffer.alloc(0);
    if (e.descriptor) { tail.writeUInt32LE(0x08074b50, 0); tail.writeUInt32LE(sum, 4); tail.writeUInt32LE(packed, 8); tail.writeUInt32LE(length, 12); }
    parts.push(local, name, extra, body, tail);
    const mode = e.mode !== undefined ? e.mode : e.dir ? 0o40755 : 0o100644;
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(0x0314, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(flags, 8); c.writeUInt16LE(method, 10);
    c.writeUInt32LE(sum, 16); c.writeUInt32LE(packed, 20); c.writeUInt32LE(length, 24); c.writeUInt16LE(name.length, 28);
    c.writeUInt32LE((((mode << 16) >>> 0) | (e.dir ? 0x10 : 0)) >>> 0, 38); c.writeUInt32LE(offset, 42);
    central.push(c, name);
    offset += 30 + name.length + extra.length + body.length + tail.length;
  }
  const dir = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(dir.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, dir, end]);
}

// two invented kits: orchard in both editions, lantern in HTML alone
const ORCHARD_HTML = [
  { name: 'orchard-html/', dir: true },
  { name: 'orchard-html/index.html', data: '<!doctype html>\n<title>Orchard</title>\n<p>The farm shop.</p>\n' },
  { name: 'orchard-html/README.md', data: '# Orchard, HTML edition\n' },
  { name: 'orchard-html/pages/', dir: true },
  { name: 'orchard-html/pages/about.html', data: '<!doctype html>\n<title>About</title>\n'.repeat(40) },
  { name: 'orchard-html/assets/logo.svg', data: '<svg xmlns="http://www.w3.org/2000/svg"/>', method: 0 },   // stored, its folder named by no entry
  { name: 'orchard-html/tools/serve.sh', data: '#!/bin/sh\npython3 -m http.server\n', mode: 0o104755 },   // executable, and setuid, which is dropped
  { name: 'orchard-html/notes.txt', data: 'world-writable in the archive\n', mode: 0o100666 },
];
const ORCHARD_REACT = [
  { name: 'orchard-react/', dir: true },
  { name: 'orchard-react/package.json', data: JSON.stringify({ name: 'orchard', private: true, engines: { node: '>=20.0.0' }, scripts: { dev: 'vite', build: 'vite build' } }, null, 2) },
  { name: 'orchard-react/src/main.tsx', data: 'export {};\n' },
  { name: 'orchard-react/README.md', data: '# Orchard, React edition\n' },
];
const LANTERN_HTML = [{ name: 'lantern-html/index.html', data: '<!doctype html>\n<title>Lantern</title>\n' }];
const zips = { 'orchard/html': zip(ORCHARD_HTML), 'orchard/react': zip(ORCHARD_REACT), 'lantern/html': zip(LANTERN_HTML) };

const KEY = 'tk_test_Q7v9Zr2xW4mN8pL';   // the good key; tk_test_lic-<code> fails the licence with <code>, tk_test_dl-<code> the download
const ERRORS = {
  no_key: [401, 'No licence key came with the request.'], bad_key: [401, 'This licence key is not one the shop knows.'],
  revoked: [403, 'This licence was revoked after a refund.'], not_in_licence: [403, 'Your licence does not include this kit.'],
  no_such_kit: [404, 'There is no kit of that name.'], no_such_edition: [404, 'This kit has no such edition.'],
  limit: [429, 'This licence has downloaded this kit too many times today.'], rate: [429, 'Too many requests: wait a minute.'],
  not_ready: [503, 'This kit is being packed: try again in a few minutes.'],
};
const state = { seen: [], zip: null, sha: undefined, redirect: false, plain: null, version: null };
const listing = () => ({
  licence: 'team', sku: 'all-access-team', name: 'All-access, team',
  kits: [
    { slug: 'orchard', name: 'Orchard: a farm shop', version: '1.2.0', editions: { html: { bytes: zips['orchard/html'].length, sha256: hex(zips['orchard/html']) }, react: { bytes: zips['orchard/react'].length, sha256: hex(zips['orchard/react']) } } },
    { slug: 'lantern', name: 'Lantern: a reading app', version: '0.3.1', editions: { html: { bytes: zips['lantern/html'].length, sha256: hex(zips['lantern/html']) } } },
  ],
});
const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
const fail = (res, code, key) => json(res, ERRORS[code] ? ERRORS[code][0] : 401, { error: code === 'echo' ? 'bad_key' : code, message: code === 'echo' ? `The key ${key} is not one the shop knows.` : ERRORS[code][1] });
const sendZip = (res, slug, edition) => {
  const body = state.zip || zips[`${slug}/${edition}`];
  const headers = { 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${slug}-${edition}-1.2.0.zip"`, 'X-Kit-Version': state.version || (slug === 'lantern' ? '0.3.1' : '1.2.0') };
  if (state.sha !== null) headers['X-Content-SHA256'] = state.sha || hex(body);
  res.writeHead(200, headers);
  res.end(body);
};
const elsewhere = createServer((req, res) => {   // another origin, where a redirect leads: the key must not come here
  state.seen.push({ where: 'elsewhere', auth: req.headers.authorization || '' });
  const m = req.url.match(/^\/files\/([a-z]+)\/([a-z]+)$/);
  if (m) sendZip(res, m[1], m[2]); else json(res, 404, { error: 'no_such_kit', message: 'Nothing here.' });
});
const shopServer = createServer((req, res) => {
  const auth = req.headers.authorization || '';
  const key = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const url = req.url.replace(/^\/kits(?=\/)/, '');   // the API is under the shop's address: /kits/api/v1/…
  state.seen.push({ where: 'shop', url, auth, ua: req.headers['user-agent'] || '' });
  if (!key) return fail(res, 'no_key');
  const mode = key.startsWith('tk_test_lic-') ? ['licence', key.slice(12)] : key.startsWith('tk_test_dl-') ? ['download', key.slice(11)] : key === KEY ? [] : ['licence', 'bad_key'];
  if (url === '/api/v1/licence') {
    if (mode[0] === 'licence') return fail(res, mode[1], key);
    return json(res, 200, listing());
  }
  const m = url.match(/^\/api\/v1\/kits\/([a-z0-9-]+)\/([a-z]+)$/);
  if (!m) return json(res, 404, { error: 'no_such_kit', message: 'No such address.' });
  if (mode[0] === 'download') return fail(res, mode[1], key);
  if (state.plain) { res.writeHead(502, { 'Content-Type': 'text/html' }); return res.end('<html>Bad gateway</html>'); }
  if (state.cut) { res.writeHead(200, { 'Content-Type': 'application/zip', 'Content-Length': '100000' }); res.write(zips['orchard/html'].subarray(0, 200)); return setTimeout(() => res.socket.destroy(), 50); }
  if (state.redirect) { res.writeHead(302, { Location: `${state.redirect}/files/${m[1]}/${m[2]}` }); return res.end(); }
  sendZip(res, m[1], m[2]);
});
const listen = (s) => new Promise((done) => s.listen(0, '127.0.0.1', () => done(`http://127.0.0.1:${s.address().port}`)));
const shopUrl = await listen(shopServer), elsewhereUrl = await listen(elsewhere);
const SHOP = `${shopUrl}/kits`;
const outputs = [];
/** The command, run as a user runs it, with its own environment: no TRAYUI_ variable unless the test gives one. */
const kit = (args, { env = {}, cwd } = {}) => new Promise((done) => {
  const base = Object.assign({}, process.env);
  for (const k of Object.keys(base)) if (k.startsWith('TRAYUI_')) delete base[k];
  const child = spawn(process.execPath, [join(here, 'trayui.mjs'), 'kit', ...args], { cwd, env: Object.assign(base, env) });
  let stdout = '', stderr = '';
  child.stdout.on('data', (d) => { stdout += d; });
  child.stderr.on('data', (d) => { stderr += d; });
  child.on('close', (status) => { const out = stdout + stderr; outputs.push(out); done({ status, stdout, stderr, out }); });
});
const shopEnv = { TRAYUI_SHOP: SHOP, TRAYUI_KEY: KEY };
const pkgVersion = (() => { try { return JSON.parse(readFileSync(join(here, '..', 'dist', 'package.json'), 'utf8')).version; } catch { return 'unknown'; } })();
const ktmp = mkdtempSync(join(tmpdir(), 'trayui-kit-'));
let caseNo = 0;
const fresh = () => { const d = join(ktmp, `case-${++caseNo}`); mkdirSync(d); return d; };

try {
  // the help, and the words it is given
  let r = await kit(['--help']);
  expect('kit --help: the kit\'s own help, exit 0', r.status === 0 && r.stdout.includes('TRAYUI_KEY') && r.stdout.includes('--list') && r.stdout.includes('https://trayui.com/kits/account'), r.out);
  r = await kit([], { env: shopEnv });
  expect('kit with no name: usage, exit 2, and help kit named', r.status === 2 && r.stderr.includes('needs the name of a kit') && r.stderr.includes('npx trayui help kit'), r.out);
  r = await kit(['orchard', '--edition', 'vue'], { env: shopEnv });
  expect('--edition other than html or react: exit 2', r.status === 2 && r.stderr.includes('html or react'), r.out);
  r = await kit(['orchard', '--react', '--edition', 'html'], { env: shopEnv });
  expect('--react with --edition html: exit 2', r.status === 2 && r.stderr.includes('cannot go together'), r.out);
  r = await kit(['Orchard/../x'], { env: shopEnv });
  expect('a name that is not a kit\'s name: exit 2, and the words are not echoed', r.status === 2 && !r.out.includes('Orchard/../x'), r.out);
  r = await kit(['orchard'], { env: { TRAYUI_SHOP: SHOP } });
  expect('no key: exit 2, where the key is, and TRAYUI_KEY', r.status === 2 && r.stderr.includes('TRAYUI_KEY') && r.stderr.includes('licence mail') && r.stderr.includes('/kits/account'), r.out);
  r = await kit(['orchard'], { env: { TRAYUI_SHOP: 'http://shop.example.com/kits', TRAYUI_KEY: KEY } });
  expect('a shop on plain http away from this computer: refused, exit 2, nothing sent', r.status === 2 && r.stderr.includes('https://'), r.out);

  // --list
  state.seen = [];
  r = await kit(['--list'], { env: shopEnv });
  expect('--list: the licence, each kit with its version and editions, exit 0', r.status === 0 && r.stdout.includes('All-access, team') && r.stdout.includes('a team licence') && /orchard\s+1\.2\.0\s+html [\d.]+ [KMB]+, react/.test(r.stdout) && /lantern\s+0\.3\.1\s+html/.test(r.stdout) && r.stdout.includes('Orchard: a farm shop'), r.out);
  const hit = state.seen.find((x) => x.url === '/api/v1/licence');
  expect('the key is sent as a Bearer token, with User-Agent trayui-cli/<version>', hit && hit.auth === `Bearer ${KEY}` && hit.ua === `trayui-cli/${pkgVersion}`, JSON.stringify(hit));
  r = await kit(['--list', '--json'], { env: shopEnv });
  let listed = null;
  try { listed = JSON.parse(r.stdout); } catch { /* checked below */ }
  expect('--list --json: the licence as JSON', r.status === 0 && listed && listed.licence === 'team' && listed.kits.length === 2 && listed.kits[0].editions.react, r.out.slice(0, 300));
  r = await kit(['--list', 'orchard'], { env: shopEnv });
  expect('--list with a name: exit 2', r.status === 2, r.out);

  // the HTML edition, the key from TRAYUI_KEY
  let d = fresh();
  r = await kit(['orchard'], { env: shopEnv, cwd: d });
  const root = join(d, 'orchard-html');
  expect('kit orchard: the HTML edition unpacked into orchard-html/, exit 0', r.status === 0 && readFileSync(join(root, 'index.html'), 'utf8').includes('The farm shop')
    && readFileSync(join(root, 'pages', 'about.html'), 'utf8') === ORCHARD_HTML[4].data && readFileSync(join(root, 'assets', 'logo.svg'), 'utf8').startsWith('<svg'), r.out);
  expect('it says what it wrote and checked: the version, the sha256, the files', r.stdout.includes('orchard 1.2.0, the HTML edition') && r.stdout.includes('against its sha256') && r.stdout.includes('orchard-html/: 6 files'), r.out);
  expect('it says to open index.html, and names the README', r.stdout.includes('Open orchard-html/index.html in a browser') && r.stdout.includes('orchard-html/README.md says more'), r.out);
  expect('nothing but the kit\'s folder is written', readdirSync(d).join() === 'orchard-html', readdirSync(d).join());
  if (process.platform !== 'win32') {
    const m = (f) => { try { return statSync(join(root, f)).mode; } catch { return 0; } };
    expect('modes: an executable file stays executable, without setuid; others are not executable nor writable by all', (m('tools/serve.sh') & 0o111) && !(m('tools/serve.sh') & 0o7000)
      && !(m('index.html') & 0o111) && !(m('notes.txt') & 0o022) && (m('pages') & 0o700) === 0o700, [m('tools/serve.sh'), m('index.html'), m('notes.txt')].map((x) => x.toString(8)).join(' '));
  }
  // the same again: the folder holds files now
  writeFileSync(join(root, 'mine.txt'), 'my own notes\n');
  writeFileSync(join(root, 'index.html'), 'my edit\n');
  r = await kit(['orchard'], { env: shopEnv, cwd: d });
  expect('a folder that holds files: refused, exit 1, --force named, nothing changed', r.status === 1 && r.stderr.includes('already exists and holds files') && r.stderr.includes('--force')
    && readFileSync(join(root, 'index.html'), 'utf8') === 'my edit\n', r.out);
  r = await kit(['orchard', '--force'], { env: shopEnv, cwd: d });
  expect('--force: the kit\'s files written over it, a file of yours kept, and it says so', r.status === 0 && readFileSync(join(root, 'index.html'), 'utf8').includes('The farm shop')
    && readFileSync(join(root, 'mine.txt'), 'utf8') === 'my own notes\n' && r.stdout.includes('written over the files there'), r.out);
  d = fresh();
  mkdirSync(join(d, 'orchard-html'));
  r = await kit(['orchard'], { env: shopEnv, cwd: d });
  expect('an empty folder of that name is used as it is', r.status === 0 && existsSync(join(d, 'orchard-html', 'index.html')), r.out);
  if (process.platform !== 'win32') {
    d = fresh();
    const away = fresh();
    mkdirSync(join(d, 'orchard-html'));
    writeFileSync(join(d, 'orchard-html', 'mine.txt'), 'x');
    symlinkSync(away, join(d, 'orchard-html', 'pages'));
    r = await kit(['orchard', '--force'], { env: shopEnv, cwd: d });
    expect('--force over a folder with a link in it: refused, nothing written through the link', r.status === 1 && r.stderr.includes('is a link') && !readdirSync(away).length && !existsSync(join(d, 'orchard-html', 'index.html')), r.out);
  }

  // the React edition, the key from --key, into --dir
  d = fresh();
  r = await kit(['orchard', '--react', '--key', KEY, '--dir', 'apps/new'], { env: { TRAYUI_SHOP: SHOP }, cwd: d });
  const rroot = join(d, 'apps', 'new', 'orchard-react');
  expect('kit orchard --react --key … --dir apps/new: the React edition there, exit 0', r.status === 0 && existsSync(join(rroot, 'package.json')) && existsSync(join(rroot, 'src', 'main.tsx')), r.out);
  expect('it says cd, npm install, npm run dev, and the Node its package.json asks for', r.stdout.includes('cd apps/new/orchard-react') && r.stdout.includes('npm install') && r.stdout.includes('npm run dev') && r.stdout.includes('>=20.0.0'), r.out);
  d = fresh();
  const outside = fresh();
  r = await kit(['orchard', '--edition', 'react', `--key=${KEY}`, '--dir', outside], { env: { TRAYUI_SHOP: SHOP }, cwd: d });
  expect('--edition react, --key=…, and --dir a folder outside this one', r.status === 0 && existsSync(join(outside, 'orchard-react', 'package.json')) && !readdirSync(d).length, r.out);
  d = fresh();
  r = await kit(['orchard', '--dry-run'], { env: shopEnv, cwd: d });
  expect('--dry-run: says where it would unpack, downloads and writes nothing', r.status === 0 && r.stdout.includes('would unpack into orchard-html/') && !readdirSync(d).length, r.out);

  // what the licence does not open
  r = await kit(['orchrd'], { env: shopEnv, cwd: fresh() });
  expect('a kit the licence does not open: exit 1, the names near it', r.status === 1 && r.stderr.includes('does not open a kit named orchrd') && r.stderr.includes('Did you mean orchard'), r.out);
  r = await kit(['lantern', '--react'], { env: shopEnv, cwd: fresh() });
  expect('an edition the kit does not have: exit 1, the editions it has', r.status === 1 && r.stderr.includes('lantern has no React edition; it has HTML') && r.stderr.includes('npx trayui kit lantern unpacks it'), r.out);

  // every error the shop sends: its own sentence, exit 1, and for the key, where the key is
  for (const [code, [status, message]] of Object.entries(ERRORS)) {
    for (const leg of code === 'no_key' || code === 'bad_key' || code === 'revoked' ? ['lic', 'dl'] : ['dl']) {
      d = fresh();
      r = await kit(['orchard'], { env: { TRAYUI_SHOP: SHOP, TRAYUI_KEY: `tk_test_${leg}-${code}` }, cwd: d });
      const hint = r.stderr.includes('Your licence key is in your licence mail, and at') && r.stderr.includes('/kits/account');
      expect(`${status} ${code} (${leg === 'lic' ? 'the licence' : 'the download'}): the shop's message, exit 1${code.endsWith('_key') ? ', where the key is' : ''}, nothing written`,
        r.status === 1 && r.stderr.includes(message) && r.stderr.includes(`[${code}]`) && hint === code.endsWith('_key') && !readdirSync(d).length, r.out);
    }
  }
  r = await kit(['orchard'], { env: { TRAYUI_SHOP: SHOP, TRAYUI_KEY: 'tk_test_unknown_key' }, cwd: fresh() });
  expect('a key the shop does not know: bad_key, exit 1', r.status === 1 && r.stderr.includes('[bad_key]'), r.out);
  state.plain = true;
  r = await kit(['orchard'], { env: shopEnv, cwd: fresh() });
  state.plain = null;
  expect('an answer that is not the shop\'s JSON (a proxy\'s 502 page): the status, exit 1', r.status === 1 && r.stderr.includes('answered 502'), r.out);
  d = fresh();
  state.cut = true;
  r = await kit(['orchard'], { env: shopEnv, cwd: d });
  state.cut = false;
  expect('a download cut off before its end: exit 1, it says so, nothing written', r.status === 1 && r.stderr.includes('stopped before its end') && !readdirSync(d).length, r.out);
  const closed = createServer();
  const closedUrl = await listen(closed);
  await new Promise((done) => closed.close(done));
  r = await kit(['orchard'], { env: { TRAYUI_SHOP: `${closedUrl}/kits`, TRAYUI_KEY: KEY }, cwd: fresh() });
  expect('a shop that cannot be reached: exit 1, and it says so', r.status === 1 && r.stderr.includes('could not reach'), r.out);

  // the checksum
  d = fresh();
  state.sha = 'f'.repeat(64);
  r = await kit(['orchard'], { env: shopEnv, cwd: d });
  expect('X-Content-SHA256 that does not match: refused, exit 1, nothing written', r.status === 1 && r.stderr.includes('does not match its sha256') && !readdirSync(d).length, r.out);
  state.sha = null;
  state.zip = zip(ORCHARD_HTML.slice(0, 3));
  r = await kit(['orchard'], { env: shopEnv, cwd: fresh() });
  expect('no X-Content-SHA256: checked against the licence\'s sha256 for the same version', r.status === 1 && r.stderr.includes('does not match its sha256'), r.out);
  state.version = '1.3.0';
  d = fresh();
  r = await kit(['orchard'], { env: shopEnv, cwd: d });
  expect('no X-Content-SHA256 and a newer version than the licence lists: unpacked, and it says nothing was checked', r.status === 0 && r.stdout.includes('orchard 1.3.0') && r.stdout.includes('sent no sha256') && existsSync(join(d, 'orchard-html', 'README.md')), r.out);
  state.version = null;
  state.sha = undefined;

  // archives that are not what they should be: refused before a file is written
  const evil = join(ktmp, 'evil.txt');
  const bads = [
    ['a path that climbs out of the folder (orchard-html/../../evil.txt)', [{ name: 'orchard-html/index.html', data: 'x' }, { name: 'orchard-html/../../evil.txt', data: 'pwned' }], 'not safe to write'],
    ['a path that starts above it (../evil.txt)', [{ name: '../evil.txt', data: 'pwned' }], 'not safe to write'],
    ['an absolute path', [{ name: `${evil}`, data: 'pwned' }], 'not safe to write'],
    ['a backslash path', [{ name: 'orchard-html\\..\\..\\evil.txt', data: 'pwned' }], 'not safe to write'],
    ['a drive letter', [{ name: 'C:/evil.txt', data: 'pwned' }], 'not safe to write'],
    ['a file outside the one folder', [{ name: 'orchard-html/index.html', data: 'x' }, { name: 'other/index.html', data: 'x' }], 'outside the folder orchard-html/'],
    ['a link', [{ name: 'orchard-html/link', data: '/etc', mode: 0o120777 }, { name: 'orchard-html/index.html', data: 'x' }], 'holds a link'],
    ['an encrypted entry', [{ name: 'orchard-html/index.html', data: 'x', flags: 1 }], 'is encrypted'],
    ['zip64 sizes', [{ name: 'orchard-html/index.html', data: 'x', zip64: true }], 'zip64'],
    ['a compression it does not read (bzip2)', [{ name: 'orchard-html/index.html', data: 'x', method: 12 }], 'method 12'],
    ['a wrong CRC', [{ name: 'orchard-html/index.html', data: 'x', crc: 1234 }], 'is damaged'],
    ['the same name twice', [{ name: 'orchard-html/index.html', data: 'x' }, { name: 'orchard-html/INDEX.html', data: 'y' }], 'twice'],
    ['a name that is a file and a folder', [{ name: 'orchard-html/a', data: 'x' }, { name: 'orchard-html/a/b', data: 'y' }], 'both as a file and as a folder'],
    ['a file named as the folder itself', [{ name: 'orchard-html', data: 'x' }], 'where its folder should be'],
  ];
  for (const [label, entries, says] of bads) {
    d = fresh();
    state.zip = zip(entries);
    r = await kit(['orchard'], { env: shopEnv, cwd: d });
    expect(`refused: ${label}, exit 1, nothing written`, r.status === 1 && r.stderr.includes(says) && r.stderr.includes('Nothing was written') && !readdirSync(d).length && !existsSync(evil), r.out);
  }
  d = fresh();
  state.zip = Buffer.from('<html>not a zip</html>');
  r = await kit(['orchard'], { env: shopEnv, cwd: d });
  expect('refused: a download that is not a zip, exit 1', r.status === 1 && r.stderr.includes('is not a zip file') && !readdirSync(d).length, r.out);
  d = fresh();
  state.zip = zip([{ name: 'orchard-html/index.html', data: 'streamed\n', descriptor: true, localExtra: Buffer.from([0x55, 0x54, 5, 0, 1, 0, 0, 0, 0]) }, { name: 'orchard-html/README.md', data: 'r', localExtra: Buffer.alloc(12) }]);
  r = await kit(['orchard'], { env: shopEnv, cwd: d });
  expect('read: sizes after the data and an extra field in the local header alone, as other zip writers make them', r.status === 0 && readFileSync(join(d, 'orchard-html', 'index.html'), 'utf8') === 'streamed\n', r.out);
  state.zip = null;

  // a redirect to another origin: followed, without the key
  d = fresh();
  state.redirect = elsewhereUrl;
  state.seen = [];
  r = await kit(['orchard'], { env: shopEnv, cwd: d });
  state.redirect = false;
  const there = state.seen.find((x) => x.where === 'elsewhere');
  expect('a redirect to another origin is followed without the key', r.status === 0 && there && !there.auth && existsSync(join(d, 'orchard-html', 'index.html')), JSON.stringify(state.seen) + r.out);

  // the key is never printed: not in an error the shop words with it, not when it is malformed, not in the stack
  r = await kit(['orchard'], { env: { TRAYUI_SHOP: SHOP, TRAYUI_KEY: 'tk_test_lic-echo' }, cwd: fresh() });
  expect('a message from the shop that quotes the key: printed without it', r.status === 1 && r.stderr.includes('The key [your key] is not one') && !r.out.includes('tk_test_lic-echo'), r.out);
  r = await kit(['orchard', '--key', 'tk_test_Zq8\nsecond-line'], { env: { TRAYUI_SHOP: SHOP, TRAYUI_DEBUG: '1' }, cwd: fresh() });
  expect('a key with a line break: refused before it is sent, and not printed, even with TRAYUI_DEBUG', r.status === 2 && r.stderr.includes('copy it again') && !r.out.includes('tk_test_Zq8') && !r.out.includes('second-line'), r.out);
  r = await kit(['orchard', '--key', 'tk_test_ключ9'], { env: { TRAYUI_SHOP: SHOP, TRAYUI_DEBUG: '1' }, cwd: fresh() });
  expect('a key beyond plain ASCII: refused, not printed', r.status === 2 && !r.out.includes('ключ'), r.out);
  r = await kit(['orchard', '--kye=tk_test_Mistyped77'], { env: { TRAYUI_SHOP: SHOP } });
  expect('a mistyped --key=…: the unknown option named, its value not', r.status === 2 && r.stderr.includes('unknown option --kye') && !r.out.includes('tk_test_Mistyped77'), r.out);
  r = await kit(['orchard', '--key:tk_test_Colon66'], { env: { TRAYUI_SHOP: SHOP } });
  expect('--key:… (a colon for an equals sign): the unknown option named, its value not', r.status === 2 && r.stderr.includes('unknown option --key') && !r.out.includes('tk_test_Colon66'), r.out);
  r = await kit(['orchard', 'tk_test_Positional55'], { env: { TRAYUI_SHOP: SHOP } });
  expect('a key given where a name goes: exit 2, not echoed', r.status === 2 && !r.out.includes('tk_test_Positional55'), r.out);
  r = await kit(['orchard'], { env: { TRAYUI_SHOP: SHOP, TRAYUI_KEY: 'tk_test_lic-bad_key', TRAYUI_DEBUG: '1' }, cwd: fresh() });
  expect('TRAYUI_DEBUG prints the stack, and no key in it', r.status === 1 && r.stderr.includes('at ') && !r.out.includes('tk_test_lic-bad_key'), r.out);
  const leaked = outputs.filter((o) => /tk_test_/.test(o));
  expect(`no key given, good or bad, is in any of the ${outputs.length} outputs`, outputs.length > 40 && !leaked.length, leaked.slice(0, 2).join(' || '));
} finally {
  shopServer.close();
  elsewhere.close();
  rmSync(ktmp, { recursive: true, force: true });
}

const bad = results.filter((r) => !r.ok);
for (const r of bad) console.log(`FAIL ${r.name}\n     ${r.detail}`);
console.log(`${results.length - bad.length} of ${results.length} checks pass (rules of Tray UI ${rules.version}: ${rules.classes.length} classes, ${rules.behaviours.length} behaviours, ${rules.icons.length} icons)`);
process.exitCode = bad.length ? 1 : 0;
