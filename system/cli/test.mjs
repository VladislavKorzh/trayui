#!/usr/bin/env node
/* Tests of the markup checker (check.mjs), with no dependencies: every rule catches a small bad page and lets the good
   one through, every block of the system is clean, and the command behaves (files, folders, stdin, --json, exit codes).

     node cli/test.mjs            from system/; exit code 1 when a test fails

   The rules come from rules.json, which tools/build.py writes beside the checker in dist/cli. */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const bad = results.filter((r) => !r.ok);
for (const r of bad) console.log(`FAIL ${r.name}\n     ${r.detail}`);
console.log(`${results.length - bad.length} of ${results.length} checks pass (rules of Tray UI ${rules.version}: ${rules.classes.length} classes, ${rules.behaviours.length} behaviours, ${rules.icons.length} icons)`);
process.exitCode = bad.length ? 1 : 0;
