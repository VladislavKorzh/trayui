#!/usr/bin/env node
/* trayui: puts Tray UI into a project a block or a component at a time, keeps it up to date without losing your edits,
   and checks your markup. No dependencies; Node 18 or later. `npx trayui --help` says how to use it.

   The items come from a registry in shadcn's format (https://trayui.com/r/registry.json): the same files the shadcn CLI
   installs. This command also does what that one cannot: a folder of plain HTML pages with no package.json, the font (a
   binary file), a block placed beside your pages with its links pointed at the system's files, the stylesheet imported
   once in a React app, and a record of what it wrote (trayui.json), so an update keeps a file you changed and `diff`
   shows how it differs.

   This file is the bin of the npm package trayui (cli/trayui.mjs); the build copies it there from system/cli. Its
   syntax stays within what Node 14 parses, so an older Node gets a clear message instead of a syntax error. */
import { createHash } from 'crypto';
import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from 'fs';
import { dirname, isAbsolute, join, posix, relative, resolve, sep } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const NODE = Number(process.versions.node.split('.')[0]);
if (NODE < 18) {
  console.error(`trayui needs Node 18 or later; this is Node ${process.versions.node}. Install a current Node from https://nodejs.org and run it again.`);
  process.exit(1);
}

const DEFAULT_REGISTRY = 'https://trayui.com/r';
const SITE = 'https://trayui.com';
const HERE = dirname(fileURLToPath(import.meta.url));

// ---------- the command line ----------

const VALUE_FLAGS = ['registry', 'cwd', 'dir', 'pages', 'rules'];
const BOOL_FLAGS = ['react', 'html', 'overwrite', 'dry-run', 'no-install', 'json', 'help', 'version', 'agents', 'stat', 'yes'];
const SHORT = { h: 'help', v: 'version', n: 'dry-run', f: 'overwrite', y: 'yes' };

function parseArgs(argv) {
  const flags = {}, rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-' || !a.startsWith('-')) { rest.push(a); continue; }
    let key = a.startsWith('--') ? a.slice(2) : SHORT[a.slice(1)] || a.slice(1);
    let value;
    if (key.includes('=')) { value = key.slice(key.indexOf('=') + 1); key = key.slice(0, key.indexOf('=')); }
    if (VALUE_FLAGS.includes(key)) {
      if (value === undefined) value = argv[++i];
      if (value === undefined || value.startsWith('--')) throw new UsageError(`--${key} needs a value`);
      flags[key] = value;
    } else if (BOOL_FLAGS.includes(key)) flags[key] = true;
    else throw new UsageError(`unknown option ${a}`);
  }
  return { flags, command: rest.shift(), names: rest };
}

class UsageError extends Error {}

const HELP = {
  '': `trayui: add Tray UI to a project, a block or a component at a time, and check its markup.

Usage: npx trayui <command> [options]

Commands
  init                     the system's files: trayui/ (plain HTML), or the core of the React components (React)
  add <name...>            blocks (plain HTML and React) and components (React), with what they need
  update [name...]         take the current version of what you added; files you changed are kept
  diff [name...]           what you changed, and what changed upstream, as a diff
  list                     what the registry holds
  check <file|folder|->    check HTML against the system's rules (exit 1 on an error)
  skill                    copy the agent skill into .claude/skills/trayui (or --agents, --dir)

Options
  --react, --html          the kind of project (found by itself: React when package.json depends on react)
  --dir <folder>           where the system's files go (trayui; in React src/components/trayui or components/trayui)
  --pages <folder>         where plain HTML blocks go (the project's folder)
  --registry <url|folder>  where the items come from (default ${DEFAULT_REGISTRY}; a folder works offline)
  --cwd <folder>           the project (default: this folder)
  --overwrite              replace files you changed (without it they are kept, and diff shows them)
  --dry-run                say what would be written, write nothing
  --no-install             do not run the package manager for the packages an item needs
  --version, --help

Examples
  npx trayui init && npx trayui add login-01        a sign-in page in a folder of plain HTML pages
  npx trayui add button tabs login-01               in a React app (Vite, Next.js): the source, yours to change
  npx trayui check index.html                       the markup against the rules

Every page of the system: ${SITE}. This command: ${SITE}/docs/cli`,
  init: `Usage: npx trayui init [--react | --html] [--dir <folder>]

Plain HTML: writes trayui/ with tokens.css, components/bundle.css, components/bundle.js, the font and the licences.
Link the three files in that order in every page. React: writes the core the components share into
src/components/trayui (components/trayui without src/), installs the package trayui for the stylesheet, and imports
the stylesheet once in the app's entry (src/main.tsx, or app/layout.tsx in Next.js).`,
  add: `Usage: npx trayui add <name...> [--pages <folder>] [--overwrite] [--dry-run]

Adds items and what they need. A block (login-01, dashboard-01: npx trayui list) is a whole page: in plain HTML it is
written beside your pages (--pages) with its links pointed at the trayui folder; in React it is a component,
src/components/trayui/blocks/Login01.tsx. A component (button, tabs) is React source you own. A file you changed since
it was added is kept unless --overwrite; npx trayui diff shows how it differs.`,
  update: `Usage: npx trayui update [name...] [--overwrite] [--dry-run]

Takes the current version of the items added here (all of them, or those named). A file still as it was added is
replaced; a file you changed is kept unless --overwrite.`,
  diff: `Usage: npx trayui diff [name...] [--stat]

For every file added here: unchanged, changed by you, changed upstream, or both, and a line diff of your copy against
the registry's (--stat for the list alone).`,
  list: `Usage: npx trayui list [--react | --html] [--json]

The items of the registry: the core, the components (React) and the blocks.`,
  check: `Usage: npx trayui check <page.html | folder | -> [...] [--json] [--rules rules.json]

Checks Tray UI markup: classes, behaviours and icons that exist, one yellow per view, names and labels, references,
tabs, headings, tokens, and on a whole page its language, theme and the three files. Exit code 1 on an error.
It cannot see the page: look at it at 1280, 768 and 390px wide, in a light and a dark theme, too.`,
  skill: `Usage: npx trayui skill [--agents | --dir <folder>] [--overwrite] [--dry-run]

Copies the agent skill that comes with this package (SKILL.md, a page for every component and block, and the
checker) into .claude/skills/trayui, where Claude Code finds it; --agents puts it in .agents/skills/trayui for other
agents; --dir in a folder you name. A file you changed is kept unless --overwrite.`,
};

// ---------- small helpers ----------

const say = (s = '') => console.log(s);
const sha = (s) => createHash('sha256').update(s).digest('hex');
const toPosix = (p) => p.split(sep).join('/');
const isUrl = (s) => /^https?:\/\//i.test(s);
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i].concat(Array(b.length).fill(0)));
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function near(name, known) {
  return known.map((k) => [k, k.startsWith(name) || name.startsWith(k) ? 0 : distance(name, k)])
    .filter((x) => x[1] <= Math.max(2, Math.floor(name.length / 3))).sort((x, y) => x[1] - y[1]).slice(0, 4).map((x) => x[0]);
}

function version() {
  for (const p of [join(HERE, '..', 'package.json'), join(HERE, '..', 'dist', 'package.json')]) {
    try { const pkg = readJson(p); if (pkg.name === 'trayui' && pkg.version) return pkg.version; } catch (e) { /* next */ }
  }
  for (const p of [join(HERE, 'rules.json'), join(HERE, '..', 'dist', 'cli', 'rules.json')]) {
    try { return readJson(p).version; } catch (e) { /* next */ }
  }
  return 'unknown';
}

/** A line diff (Myers' algorithm) of two texts as a unified diff with three lines of context; null when they are the same. */
export function unifiedDiff(a, b, nameA, nameB) {
  if (a === b) return null;
  const x = a.split('\n'), y = b.split('\n');
  const n = x.length, m = y.length, max = n + m, off = max + 1;
  const trace = [];
  let v = new Int32Array(2 * max + 3);
  let found = false;
  for (let d = 0; d <= max && !found; d++) {
    trace.push(v.slice());
    if (d > 4000) return `--- ${nameA}\n+++ ${nameB}\n(the files differ in more than 4000 lines)\n`;
    for (let k = -d; k <= d; k += 2) {
      let i = (k === -d || (k !== d && v[off + k - 1] < v[off + k + 1])) ? v[off + k + 1] : v[off + k - 1] + 1;
      let j = i - k;
      while (i < n && j < m && x[i] === y[j]) { i++; j++; }
      v[off + k] = i;
      if (i >= n && j >= m) { found = true; break; }
    }
  }
  trace.push(v.slice());
  // walk back through the trace to the edit script
  const ops = [];
  let i = n, j = m;
  for (let d = trace.length - 2; d >= 0; d--) {
    const t = trace[d], k = i - j;
    const prevK = (k === -d || (k !== d && t[off + k - 1] < t[off + k + 1])) ? k + 1 : k - 1;
    const pi = d === 0 ? 0 : t[off + prevK], pj = pi - prevK;
    while (i > pi && j > pj && i > 0 && j > 0 && x[i - 1] === y[j - 1]) { ops.push([' ', x[i - 1]]); i--; j--; }
    if (d === 0) break;
    if (i === pi) { ops.push(['+', y[j - 1]]); j--; } else { ops.push(['-', x[i - 1]]); i--; }
  }
  while (i > 0 && j > 0) { ops.push([' ', x[i - 1]]); i--; j--; }
  while (j > 0) { ops.push(['+', y[j - 1]]); j--; }
  while (i > 0) { ops.push(['-', x[i - 1]]); i--; }
  ops.reverse();
  // hunks
  const out = [`--- ${nameA}`, `+++ ${nameB}`];
  const changed = ops.map((o, idx) => (o[0] !== ' ' ? idx : -1)).filter((idx) => idx >= 0);
  let h = 0;
  while (h < changed.length) {
    let start = Math.max(0, changed[h] - 3), end = Math.min(ops.length, changed[h] + 4);
    while (h + 1 < changed.length && changed[h + 1] - 3 <= end) { h++; end = Math.min(ops.length, changed[h] + 4); }
    let la = 1, lb = 1;
    for (let q = 0; q < start; q++) { if (ops[q][0] !== '+') la++; if (ops[q][0] !== '-') lb++; }
    const body = ops.slice(start, end);
    const ca = body.filter((o) => o[0] !== '+').length, cb = body.filter((o) => o[0] !== '-').length;
    out.push(`@@ -${ca ? la : la - 1},${ca} +${cb ? lb : lb - 1},${cb} @@`);
    for (const o of body) out.push(o[0] + o[1]);
    h++;
  }
  return out.join('\n') + '\n';
}

// ---------- the project ----------

class Project {
  constructor(flags) {
    this.flags = flags;
    this.cwd = resolve(flags.cwd || '.');
    if (!existsSync(this.cwd) || !statSync(this.cwd).isDirectory()) throw new Error(`${this.cwd} is not a folder`);
    this.configPath = join(this.cwd, 'trayui.json');
    this.config = existsSync(this.configPath) ? readJson(this.configPath) : {};
    if (!this.config.items) this.config.items = {};
    const pkgPath = join(this.cwd, 'package.json');
    this.pkg = existsSync(pkgPath) ? readJson(pkgPath) : null;
    const deps = this.pkg ? Object.assign({}, this.pkg.dependencies, this.pkg.devDependencies) : {};
    this.deps = deps;
    this.framework = flags.react ? 'react' : flags.html ? 'html' : this.config.framework || (deps.react ? 'react' : 'html');
    if (flags.react && flags.html) throw new UsageError('--react and --html cannot go together');
    this.next = !!deps.next;
    // the folders recorded in trayui.json hold for the kind of project recorded there (a React app with a plain page
    // added once with --html keeps its React folders)
    this.same = !this.config.framework || this.config.framework === this.framework;
    this.dir = toPosix(flags.dir || (this.same && this.config.dir) || (this.framework === 'react'
      ? (existsSync(join(this.cwd, 'src')) ? 'src/components/trayui' : 'components/trayui') : 'trayui')).replace(/\/+$/, '');
    this.pages = toPosix(flags.pages || (this.same && this.config.pages) || '.').replace(/\/+$/, '') || '.';
    const given = flags.registry || this.config.registry || DEFAULT_REGISTRY;
    this.registry = isUrl(given) ? given.replace(/\/+$/, '') : resolve(given);
    this.sub = this.framework === 'html' ? 'html/' : '';
    this.dry = !!flags['dry-run'];
    for (const p of [this.dir, this.pages]) this.inside(p);
  }

  /** A path inside the project, or an error: an item never writes outside it. */
  inside(rel) {
    const abs = resolve(this.cwd, rel);
    const back = relative(this.cwd, abs);
    if (back.startsWith('..') || isAbsolute(back)) throw new Error(`${rel} is outside the project (${this.cwd})`);
    return abs;
  }

  /** Where an item is: by name in this registry, or a dependency's URL mapped onto this registry. */
  locate(ref, sub = this.sub) {
    let rest;
    if (isUrl(ref) && ref.includes('/r/')) rest = ref.slice(ref.lastIndexOf('/r/') + 3);
    else if (isUrl(ref)) return ref;
    else if (ref.endsWith('.json') && existsSync(resolve(ref))) return resolve(ref);
    else rest = `${sub}${ref}.json`;
    return isUrl(this.registry) ? `${this.registry}/${rest}` : join(this.registry, ...rest.split('/'));
  }

  async load(at, binary) {
    if (isUrl(at)) {
      let res;
      try { res = await fetch(at); } catch (e) {
        throw new Error(`could not reach ${at} (${(e.cause && e.cause.code) || e.message}). Check the connection, or use --registry with another address or a folder.`);
      }
      if (!res.ok) { const err = new Error(`${at}: ${res.status} ${res.statusText}`); err.status = res.status; throw err; }
      return binary ? Buffer.from(await res.arrayBuffer()) : res.text();
    }
    if (!existsSync(at)) { const err = new Error(`${at} does not exist`); err.status = 404; throw err; }
    return readFileSync(at, binary ? undefined : 'utf8');
  }

  async index(sub = this.sub) {
    try { return JSON.parse(await this.load(this.locate('registry', sub))); } catch (e) { return { items: [] }; }
  }

  /** Why a name is not in this registry, said helpfully. */
  async unknown(name) {
    const here = (await this.index()).items.map((i) => i.name);
    if (this.framework === 'html') {
      const react = (await this.index('')).items.find((i) => i.name === name);
      if (react && react.meta && react.meta.trayui && react.meta.trayui.kind !== 'block') {
        const page = (react.meta.trayui.page) || `${SITE}/components/${name}`;
        return `${name} is a React component. In plain HTML a component is markup to copy, not a file: its page has it, ${page}. `
          + 'Here you can add the system (npx trayui init) and whole pages, the blocks (npx trayui list). In a React app, add it there.';
      }
    }
    const close = near(name, here);
    return `there is no item ${name} in ${this.registry}${this.sub ? '/' + this.sub.slice(0, -1) : ''}.` + (close.length ? ` Did you mean ${close.join(', ')}?` : '') + ' npx trayui list shows them all.';
  }

  async resolveTree(names) {
    const seen = new Set(), order = [];
    const visit = async (ref, asked) => {
      const at = this.locate(ref);
      if (seen.has(at)) return;
      seen.add(at);
      let text;
      try { text = await this.load(at); } catch (e) {
        if (e.status === 404 && asked) throw new Error(await this.unknown(ref));
        throw e;
      }
      const item = JSON.parse(text);
      for (const d of item.registryDependencies || []) await visit(d, false);
      order.push(Object.assign({}, item, { at }));   // dependencies first
    };
    for (const n of names) await visit(n, true);
    return order;
  }

  /** Where a file of an item goes in this project, and what it holds once there. */
  place(file) {
    let target = toPosix(file.target).replace(/^~\//, '').replace(/^\.\//, '');
    let content = file.content;
    if (target.startsWith('src/components/trayui/')) target = posix.join(this.dir, target.slice('src/components/trayui/'.length));
    else if (/^trayui\/blocks\/[^/]+\.html$/.test(target)) {
      const out = posix.join(this.pages, target.slice('trayui/blocks/'.length));
      // the block links ../tokens.css from trayui/blocks/: point each ../ link at the same file in the trayui folder
      content = content.replace(/(\s(?:href|src)=")\.\.\/([^"]+)"/g, (m, lead, rest) =>
        `${lead}${posix.relative(posix.dirname(out), posix.join(this.dir, rest)) || '.'}"`);
      target = out;
    } else if (target.startsWith('trayui/')) target = posix.join(this.dir, target.slice('trayui/'.length));
    target = posix.normalize(target);
    this.inside(target);
    return { target, content };
  }

  record(name) {
    if (!this.config.items[name]) this.config.items[name] = { files: {} };
    return this.config.items[name];
  }

  /** Write one file: added, the same, updated (still as written before), or kept (changed by you) unless --overwrite. */
  writeFile(target, content, was) {
    const abs = this.inside(target);
    const now = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
    let tag;
    if (now === null) tag = 'add';
    else if (now === content) tag = 'same';
    else if (was && sha(now) === was) tag = 'update';
    else tag = this.flags.overwrite ? 'replace' : 'kept';
    if (tag !== 'same' && tag !== 'kept' && !this.dry) {
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, content);
    }
    return tag;
  }

  saveConfig() {
    if (this.dry) return;
    const c = this.config;
    const out = { $comment: 'Written by npx trayui: what it added here, so update keeps your edits and diff shows them.' };
    if (c.registry && c.registry !== DEFAULT_REGISTRY) out.registry = c.registry;
    Object.assign(out, { framework: c.framework, dir: c.dir });
    if (c.pages && c.framework === 'html') out.pages = c.pages;
    if (c.skill) out.skill = c.skill;
    out.items = {};
    for (const k of Object.keys(c.items).sort()) out.items[k] = c.items[k];
    writeFileSync(this.configPath, JSON.stringify(out, null, 2) + '\n');
  }
}

const LABEL = { add: 'add    ', same: 'same   ', update: 'update ', replace: 'replace', kept: 'kept   ' };

async function install(project, names, { init = false } = {}) {
  const tree = await project.resolveTree(names);
  const where = project.registry + (project.sub ? '/' + project.sub.slice(0, -1) : '');
  say(`trayui ${project.dry ? '(dry run) ' : ''}${project.framework === 'react' ? 'React' : 'plain HTML'}, from ${where}`);
  const counts = {}, kept = [];
  for (const item of tree) {
    const rec = project.record(item.name);
    const files = {};
    for (const file of item.files || []) {
      const { target, content } = project.place(file);
      const was = rec.files[target];
      const tag = project.writeFile(target, content, was);
      counts[tag] = (counts[tag] || 0) + 1;
      files[target] = tag === 'kept' ? (was || null) : sha(content);
      if (tag === 'kept') kept.push(target);
      say(`  ${LABEL[tag]} ${target}${tag === 'kept' ? (was ? '   you changed it: kept (diff shows how; --overwrite replaces it)' : '   it was here before: kept (--overwrite replaces it)') : ''}`);
    }
    // binary files a registry item cannot carry (the font): fetched from beside the item
    const assets = (item.meta && item.meta.trayui && item.meta.trayui.assets) || [];
    for (const a of assets) {
      const src = isUrl(item.at) ? new URL(a.url, item.at).href : resolve(dirname(item.at), a.url);
      const { target } = project.place({ target: a.target, content: '' });
      const abs = project.inside(target);
      if (existsSync(abs)) { say(`  ${LABEL.same} ${target}`); files[target] = rec.files[target] || null; continue; }
      const bytes = project.dry ? Buffer.from('') : await project.load(src, true);
      if (!project.dry) { mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, bytes); }
      files[target] = project.dry ? null : sha(bytes);
      counts.add = (counts.add || 0) + 1;
      say(`  ${LABEL.add} ${target}`);
    }
    Object.assign(rec, { version: item.meta && item.meta.trayui && item.meta.trayui.version, kind: item.meta && item.meta.trayui && item.meta.trayui.kind, files });
  }
  // npm packages the items name, when this is a package
  const wanted = [...new Set(tree.flatMap((i) => i.dependencies || []))];
  const missing = wanted.filter((d) => !project.deps[d.replace(/^(@?[^@]+)@.*$/, '$1')]);
  if (missing.length) {
    if (!project.pkg) say(`\nThese items need the npm package${missing.length > 1 ? 's' : ''} ${missing.join(' ')}, and there is no package.json here.`);
    else if (project.flags['no-install'] || project.dry) say(`  needs  ${missing.join(' ')}${project.dry ? '' : '   (--no-install: install it yourself)'}`);
    else runInstall(project, missing);
  }
  if (project.framework === 'react') {
    barrel(project);
    if (tree.some((i) => i.name === 'core')) importStyles(project);
  }
  if (project.same) Object.assign(project.config, { framework: project.framework, dir: project.dir, pages: project.pages });
  if (project.flags.registry) project.config.registry = project.registry;
  project.saveConfig();
  const parts = Object.keys(counts).map((k) => `${counts[k]} ${k === 'add' ? 'added' : k === 'same' ? 'the same' : k === 'update' ? 'updated' : k === 'replace' ? 'replaced' : 'kept'}`);
  say(`\n${parts.join(', ')}${project.dry ? ' (nothing written: --dry-run)' : ''}.`);
  if (kept.length) say(`${plural(kept.length, 'file')} you changed ${kept.length === 1 ? 'was' : 'were'} kept: npx trayui diff shows how ${kept.length === 1 ? 'it differs' : 'they differ'}, --overwrite takes the registry's.`);
  const asked = new Set(names.map((n) => project.locate(n)));
  for (const item of tree) {
    if (!asked.has(item.at)) continue;
    const page = item.meta && item.meta.trayui && item.meta.trayui.page;
    if (project.framework === 'react' && item.docs) say(`\n${item.name}: ${item.docs}`);
    else if (project.framework === 'html' && item.name !== 'trayui') {
      const file = (item.files || []).map((f) => project.place(f).target).find((x) => x.endsWith('.html'));
      if (file) say(`\n${item.name}: open ${file} in a browser, and change it to make it yours.${page ? ` Its page: ${page}` : ''}`);
    }
  }
  if (init && project.framework === 'html') {
    const at = project.dir;
    say(`\nLink the three files in every page, in this order:\n  <link rel="stylesheet" href="${at}/tokens.css">\n  <link rel="stylesheet" href="${at}/components/bundle.css">\n  <script src="${at}/components/bundle.js" defer></script>\nThen add a whole page: npx trayui add login-01 (npx trayui list shows them).`);
  } else if (init) say('\nThen add components and blocks: npx trayui add button tabs login-01 (npx trayui list shows them).');
  return kept.length;
}

function packageManager(project) {
  const lock = { 'pnpm-lock.yaml': 'pnpm', 'yarn.lock': 'yarn', 'bun.lock': 'bun', 'bun.lockb': 'bun', 'package-lock.json': 'npm', 'npm-shrinkwrap.json': 'npm' };
  for (let dir = project.cwd, i = 0; i < 6; i++) {
    for (const f of Object.keys(lock)) if (existsSync(join(dir, f))) return lock[f];
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  const field = project.pkg && project.pkg.packageManager;
  if (field) return field.split('@')[0];
  const agent = process.env.npm_config_user_agent || '';
  for (const pm of ['pnpm', 'yarn', 'bun']) if (agent.startsWith(pm + '/')) return pm;
  return 'npm';
}

function runInstall(project, deps) {
  const pm = packageManager(project);
  const args = pm === 'npm' ? ['install', ...deps] : ['add', ...deps];
  say(`  ${pm} ${args.join(' ')}`);
  const r = spawnSync(pm, args, { cwd: project.cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.error || r.status !== 0) throw new Error(`${pm} ${args.join(' ')} failed${r.error ? ': ' + r.error.message : ''}. Install ${deps.join(' ')} yourself, then run this again with --no-install.`);
}

/** index.ts: one line per component and block in the folder, so `import { Button } from './components/trayui'` works. */
function barrel(project) {
  const lines = ['/* Written by npx trayui after each add: one line for each file in components/ and blocks/. Do not edit: it is written again. */'];
  for (const folder of ['components', 'blocks']) {
    const at = join(project.cwd, project.dir, folder);
    if (!existsSync(at)) continue;
    for (const f of readdirSync(at).filter((x) => /\.tsx?$/.test(x)).sort()) lines.push(`export * from './${folder}/${f.replace(/\.tsx?$/, '')}';`);
  }
  const target = posix.join(project.dir, 'index.ts');
  const rec = project.record('_index');
  const tag = project.writeFile(target, lines.join('\n') + '\n', rec.files[target]);
  if (tag === 'kept') say(`  ${LABEL.kept} ${target}   you changed it: kept, so it may not list what was just added`);
  else if (tag !== 'same') say(`  ${LABEL[tag]} ${target}`);
  rec.kind = 'index';
  if (tag !== 'kept') rec.files[target] = sha(lines.join('\n') + '\n');
}

/** The stylesheet imported once, from the app's entry when there is one this knows. */
function importStyles(project) {
  const entries = ['src/main.tsx', 'src/main.jsx', 'src/main.ts', 'src/main.js', 'src/index.tsx', 'src/index.jsx', 'app/layout.tsx', 'app/layout.jsx',
    'src/app/layout.tsx', 'src/app/layout.jsx', 'pages/_app.tsx', 'pages/_app.jsx', 'src/pages/_app.tsx', 'src/pages/_app.jsx'];
  const entry = entries.find((e) => existsSync(join(project.cwd, e)));
  const spec = (from) => {
    const rel = posix.relative(posix.dirname(from), posix.join(project.dir, 'styles'));
    return rel.startsWith('.') ? rel : './' + rel;
  };
  if (!entry) { say(`\nImport the stylesheet once, at the entry of your app: import '${spec('src/main.tsx')}' (from src/), and the font comes with it.`); return; }
  const text = readFileSync(join(project.cwd, entry), 'utf8');
  const line = `import '${spec(entry)}';`;
  if (text.includes(`'${spec(entry)}'`) || text.includes(`"${spec(entry)}"`) || /['"]trayui\/tokens\.css['"]/.test(text)) return;
  const lines = text.split('\n');
  // before the app's own modules and styles, so they come after the system's and win
  let at = lines.findIndex((l) => /^import\s.*['"]\.{1,2}\//.test(l) || /^import\s+['"]\.{1,2}\//.test(l));
  if (at < 0) { at = 0; lines.forEach((l, i) => { if (/^import\s|^['"]use (client|strict)['"]/.test(l)) at = i + 1; }); }
  lines.splice(at, 0, line);
  if (!project.dry) writeFileSync(join(project.cwd, entry), lines.join('\n'));
  say(`  edit    ${entry}   (imports the stylesheet: ${line})`);
}

async function diff(project, names) {
  const want = names.length ? names : Object.keys(project.config.items).filter((n) => n !== '_index');
  if (!want.length) { say('Nothing was added here with npx trayui (no trayui.json with items).'); return 0; }
  let differ = 0;
  for (const n of want) {
    const rec = project.config.items[n];
    if (!rec) { say(`${n}: not added here`); continue; }
    let item;
    try { item = JSON.parse(await project.load(project.locate(n))); } catch (e) {
      say(`${n}: ${e.status === 404 ? 'no longer in the registry' : e.message}`); continue;
    }
    const upstream = {};
    for (const f of item.files || []) { const p = project.place(f); upstream[p.target] = p.content; }
    const v = item.meta && item.meta.trayui && item.meta.trayui.version;
    say(`${n}${v && rec.version && v !== rec.version ? `  ${rec.version} -> ${v}` : ''}`);
    const targets = [...new Set(Object.keys(rec.files).concat(Object.keys(upstream)))];
    for (const target of targets) {
      const was = rec.files[target];
      const abs = project.inside(target);
      if (!(target in upstream)) {   // a binary asset, or a file the item no longer has
        const isAsset = ((item.meta && item.meta.trayui && item.meta.trayui.assets) || []).some((a) => project.place({ target: a.target, content: '' }).target === target);
        if (!isAsset) say(`  gone upstream        ${target}`);
        continue;
      }
      const mine = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
      const theirs = upstream[target];
      const you = mine === null ? 'deleted by you' : (was === undefined ? 'not added by trayui' : (was === null || sha(mine) !== was) ? 'changed by you' : '');
      const up = was === undefined ? 'new upstream' : (was === null || sha(theirs) !== was) ? 'changed upstream' : '';
      const state = mine === theirs ? 'unchanged' : [you, up].filter(Boolean).join(', ') || 'unchanged';
      say(`  ${state.padEnd(20)} ${target}`);
      if (mine !== null && mine !== theirs) {
        differ++;
        if (!project.flags.stat) {
          const d = unifiedDiff(mine, theirs, `${target} (yours)`, `${target} (registry, ${v || 'current'})`);
          say(d.replace(/\n$/, '').split('\n').map((l) => '    ' + l).join('\n'));
        }
      }
    }
  }
  say(differ ? `\n${plural(differ, 'file')} differ${differ === 1 ? 's' : ''} from the registry. npx trayui update takes the registry's version of files you have not changed; --overwrite also replaces the ones you have.`
    : '\nEvery file is as the registry has it.');
  return 0;
}

async function list(project) {
  const reg = await project.index();
  if (!reg.items.length) throw new Error(`could not read ${project.locate('registry')}`);
  if (project.flags.json) { say(JSON.stringify(reg.items.map((i) => ({ name: i.name, title: i.title, kind: i.meta && i.meta.trayui && i.meta.trayui.kind })), null, 1)); return 0; }
  const groups = {};
  for (const it of reg.items) { const k = (it.meta && it.meta.trayui && it.meta.trayui.kind) || 'other'; (groups[k] = groups[k] || []).push(it); }
  say(`${project.framework === 'react' ? 'React' : 'Plain HTML'} items in ${project.registry}${project.sub ? '/html' : ''}${project.framework === 'html' ? ' (React has the components too: --react)' : ''}`);
  for (const kind of ['core', 'component', 'block', 'lib']) {
    const items = groups[kind];
    if (!items) continue;
    say(`\n${{ core: 'Core', component: 'Components', block: 'Blocks', lib: 'Shared code (comes with the components that need it)' }[kind]} (${items.length})`);
    for (const it of items) say(`  ${it.name.padEnd(26)} ${it.title}`);
  }
  return 0;
}

async function skill(project) {
  const from = join(HERE, '..', 'skills', 'trayui');
  const fallback = join(HERE, '..', 'dist', 'skills', 'trayui');   // in the repository: system/dist/skills/trayui
  const source = existsSync(join(from, 'SKILL.md')) ? from : existsSync(join(fallback, 'SKILL.md')) ? fallback : null;
  if (!source) {
    throw new Error(`the skill is not beside this command (${from}). It ships in the package trayui (npx trayui@latest skill), `
      + `and the build of the site writes it to system/dist/skills/trayui; it is also at ${SITE}/skills/trayui.zip.`);
  }
  const dest = toPosix(project.flags.dir || (project.flags.agents ? '.agents/skills/trayui' : '.claude/skills/trayui'));
  project.inside(dest);
  const rec = project.config.skill && project.config.skill.dir === dest ? project.config.skill : { dir: dest, files: {} };
  const files = [];
  const walk = (dir, rel) => {
    for (const f of readdirSync(dir).sort()) {
      const abs = join(dir, f), r = rel ? `${rel}/${f}` : f;
      if (statSync(abs).isDirectory()) walk(abs, r); else files.push([r, readFileSync(abs, 'utf8')]);
    }
  };
  walk(source, '');
  say(`trayui ${project.dry ? '(dry run) ' : ''}skill, from ${source}`);
  const counts = {}, next = {}, kept = [];
  for (const [rel, content] of files) {
    const target = posix.join(dest, rel);
    const tag = project.writeFile(target, content, rec.files[rel]);
    counts[tag] = (counts[tag] || 0) + 1;
    next[rel] = tag === 'kept' ? (rec.files[rel] || null) : sha(content);
    if (tag === 'kept') { kept.push(target); say(`  ${LABEL.kept} ${target}   ${rec.files[rel] ? 'you changed it' : 'it was here before'}: kept (--overwrite replaces it)`); }
    else if (tag !== 'same') counts.shown = (counts.shown || 0) + 1;
  }
  const v = version();
  project.config.skill = { dir: dest, version: v, files: next };
  if (!project.config.framework) Object.assign(project.config, { framework: project.framework, dir: project.dir, pages: project.pages });
  project.saveConfig();
  say(`  ${counts.add || 0} added, ${counts.update || 0} updated, ${counts.replace || 0} replaced, ${counts.same || 0} the same, ${kept.length} kept, in ${dest}`);
  say(`\nThe skill is in ${dest}. ${dest.startsWith('.claude/') ? 'Claude Code finds it there (as /trayui) when it starts in this folder.' : 'Point your agent at its SKILL.md.'} `
    + `It has the agent check what it writes with: node ${dest}/scripts/check.mjs page.html`);
  return 0;
}

async function check(args) {
  let mod;
  try { mod = await import(pathToFileURL(join(HERE, 'check.mjs')).href); } catch (e) {
    throw new Error(`the checker is missing beside this command (${join(HERE, 'check.mjs')}): ${e.message}`);
  }
  return mod.main(args, { name: 'npx trayui check' });
}

async function main(argv) {
  if (argv[0] === 'check') return check(argv.slice(1));   // the checker reads its own options
  const { flags, command, names } = parseArgs(argv);
  if (flags.version && !command) { say(version()); return 0; }
  if (flags.help || !command || command === 'help') {
    const topic = command === 'help' ? names[0] || '' : command || '';
    if (!(topic in HELP)) throw new UsageError(`unknown command ${topic}`);
    say(HELP[topic]);
    return command || flags.help ? 0 : 2;
  }
  if (!(command in HELP)) throw new UsageError(`unknown command ${command}. npx trayui --help lists them.`);
  if (command === 'check') {   // options before the command: trayui --cwd site check pages/
    const base = resolve(flags.cwd || '.');
    return check(names.map((n) => (n === '-' ? n : resolve(base, n))).concat(flags.json ? ['--json'] : [], flags.rules ? ['--rules', flags.rules] : []));
  }
  const project = new Project(flags);
  if (command === 'init') {
    if (names.length) throw new UsageError('init takes no names; add takes them: npx trayui add ' + names.join(' '));
    await install(project, [project.framework === 'react' ? 'core' : 'trayui'], { init: true });
    return 0;
  }
  if (command === 'add') {
    if (!names.length) throw new UsageError('add needs at least one name: npx trayui add login-01 (npx trayui list shows them)');
    await install(project, names);
    return 0;
  }
  if (command === 'update') {
    const all = Object.keys(project.config.items).filter((n) => n !== '_index');
    const want = names.length ? names : all;
    if (!want.length) { say('Nothing was added here yet: npx trayui init, then npx trayui add <name>.'); return 0; }
    const unknown = want.filter((n) => !all.includes(n));
    if (unknown.length) throw new UsageError(`${unknown.join(', ')} ${unknown.length === 1 ? 'was' : 'were'} not added here; add ${unknown.length === 1 ? 'it' : 'them'} with npx trayui add`);
    await install(project, want);
    return 0;
  }
  if (command === 'diff') return diff(project, names);
  if (command === 'list') return list(project);
  if (command === 'skill') return skill(project);
  return 2;
}

// run as the command (npx trayui, node trayui.mjs), not when a test imports unifiedDiff
let self = '';
try { self = pathToFileURL(realpathSync(process.argv[1])).href; } catch (e) { /* not a file */ }
if (self === import.meta.url) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => {
    console.error(`trayui: ${e.message}`);
    if (e instanceof UsageError) console.error('npx trayui --help says how to use it.');
    if (process.env.TRAYUI_DEBUG) console.error(e.stack);
    process.exitCode = e instanceof UsageError ? 2 : 1;
  });
}
