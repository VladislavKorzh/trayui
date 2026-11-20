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
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from 'fs';
import { dirname, isAbsolute, join, posix, relative, resolve, sep } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { inflateRawSync } from 'zlib';

const NODE = Number(process.versions.node.split('.')[0]);
if (NODE < 18) {
  console.error(`trayui needs Node 18 or later; this is Node ${process.versions.node}. Install a current Node from https://nodejs.org and run it again.`);
  process.exit(1);
}

const DEFAULT_REGISTRY = 'https://trayui.com/r';
const DEFAULT_SHOP = 'https://trayui.com/kits';
const SITE = 'https://trayui.com';
const HERE = dirname(fileURLToPath(import.meta.url));

// ---------- the command line ----------

const VALUE_FLAGS = ['registry', 'cwd', 'dir', 'pages', 'rules', 'prefix', 'key', 'edition', 'shop'];
const BOOL_FLAGS = ['react', 'html', 'overwrite', 'dry-run', 'no-install', 'json', 'help', 'version', 'agents', 'stat', 'yes', 'list', 'force'];
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
    else {   // the option's name alone, never what follows it (=, :, …), which may be a key
      const name = (a.match(/^-+[A-Za-z][A-Za-z-]{0,11}/) || ['-'])[0];
      throw new UsageError(`unknown option ${name}${a.length > name.length ? '…' : ''}`);
    }
  }
  return { flags, command: rest.shift(), names: rest };
}

class UsageError extends Error {
  constructor(message, topic) { super(message); this.topic = topic; }   // topic: the help that says more
}

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
  kit <name>               a paid kit from trayui.com/kits, unpacked into <name>-html/ (or -react/), with your licence key

Options
  --react, --html          the kind of project (found by itself: React when package.json depends on react)
  --dir <folder>           where the system's files go (trayui; in React src/components/trayui or components/trayui)
  --pages <folder>         where plain HTML blocks go (the project's folder)
  --registry <url|folder>  where the items come from (default ${DEFAULT_REGISTRY}; a folder works offline)
  --cwd <folder>           the project (default: this folder)
  --overwrite              replace files you changed (without it they are kept, and diff shows them)
  --dry-run                say what would be written, write nothing
  --no-install             do not run the package manager for the packages an item needs
  --json                   list, check, kit --list: the result as JSON
  --stat                   diff: the names of the files that differ, without the diff
  --rules <file>           check: rules of your own in place of the system's (rules.json)
  --prefix <start>         check: the start of your own classes (kit-), not reported as foreign (kit-,app- for more)
  --key <key>              kit: your licence key (better in the environment variable TRAYUI_KEY: npx trayui help kit)
  --edition <html|react>   kit: the edition (html by default; --react is the same as --edition react)
  --list                   kit: the kits your licence opens, with their versions and editions
  --force                  kit: unpack into a folder that already holds files, writing the kit's over them
  --yes, -y                accepted and ignored, for scripts written for other CLIs: nothing here asks a question
  --version, --help

Examples
  npx trayui init && npx trayui add login-01        a sign-in page in a folder of plain HTML pages
  npx trayui add button tabs login-01               in a React app (Vite, Next.js): the source, yours to change
  npx trayui check index.html                       the markup against the rules
  npx trayui kit --list                             with TRAYUI_KEY set: the kits your licence opens

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
  check: `Usage: npx trayui check <page.html | folder | -> [...] [--json] [--rules rules.json] [--prefix kit-]

Checks Tray UI markup: classes, behaviours and icons that exist, one yellow per view, names and labels, references,
tabs, headings, tokens, and on a whole page its language, theme and the three files. Exit code 1 on an error.
--prefix names the start of your project's own classes (kit-), which are then not reported as foreign; give it again,
or a list (kit-,app-), for more. It cannot see the page: look at it at 1280, 768 and 390px wide, in a light and a dark
theme, too.`,
  skill: `Usage: npx trayui skill [--agents | --dir <folder>] [--overwrite] [--dry-run]

Copies the agent skill that comes with this package (SKILL.md, a page for every component and block, and the
checker) into .claude/skills/trayui, where Claude Code finds it; --agents puts it in .agents/skills/trayui for other
agents; --dir in a folder you name. A file you changed is kept unless --overwrite.`,
  kit: `Usage: npx trayui kit <name> [--react | --edition html|react] [--dir <folder>] [--force] [--dry-run]
       npx trayui kit --list [--json]

Downloads a paid kit from ${DEFAULT_SHOP}, a whole site or app built with Tray UI, and unpacks it into
<name>-html/, or <name>-react/ with --react, in this folder or in the folder --dir names. --list names the kits your
licence opens, with their versions and editions.

The licence key is in your licence mail and at ${DEFAULT_SHOP}/account. Give it in the environment variable
TRAYUI_KEY, which keeps it out of your shell's history (read -rs TRAYUI_KEY && export TRAYUI_KEY, then paste it and
press Enter), or with --key. This command never prints it.

Before it writes a file it checks the download against its sha256 and every path in the archive, so nothing lands
outside the kit's folder. A folder that already holds files is left alone unless --force, which writes the kit's files
over it and keeps the others (--overwrite does the same). Exit code 1 when the shop refuses or the download is wrong.`,
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
function unifiedDiff(a, b, nameA, nameB) {
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

// ---------- a kit: a paid site or app from the shop, unpacked from its zip ----------

let secret = '';   // the licence key once it is known: taken out of anything this command prints
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const EDITION = { html: 'HTML', react: 'React' };

const hide = (s) => (secret ? String(s).split(secret).join('[your key]') : String(s));
/** Text from the shop or an archive, fit to print on one line: no control characters (no terminal escapes), no key, not too long. */
function clean(s) {
  const t = hide(s === undefined || s === null ? '' : s).replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ');
  return t.length > 400 ? t.slice(0, 400) + '…' : t;
}
const tell = (s = '') => say(String(s).split('\n').map(clean).join('\n'));
const size = (n) => (!(n >= 0) ? '' : n < 1000 ? `${n} B` : n < 1e6 ? `${Math.round(n / 1000)} KB` : `${(n / 1e6).toFixed(1)} MB`);
const shown = (abs) => { const r = relative(process.cwd(), abs); return r && !r.startsWith('..') && !isAbsolute(r) ? toPosix(r) : abs; };

function licenceKey(flags) {
  const raw = flags.key !== undefined ? flags.key : (process.env.TRAYUI_KEY || '');
  const key = raw.trim();
  if (!key) {
    throw new UsageError(`a kit needs your licence key, in the environment variable TRAYUI_KEY (or --key). It is in your licence mail, and at ${DEFAULT_SHOP}/account.`, 'kit');
  }
  secret = key;
  // a header cannot carry these, and fetch's own error would quote the key: say it here, without the key
  if (!/^[\x21-\x7e]+$/.test(key)) {
    throw new UsageError('the licence key holds a character no key has (a space, a line break, or a letter beyond plain ASCII): copy it again from your licence mail.', 'kit');
  }
  return key;
}

/** https, or plain http on this computer alone (a test's shop): the key never travels in the clear. */
const secure = (u) => u.protocol === 'https:' || (u.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname));

function shopAddress(flags) {
  const given = String(flags.shop || process.env.TRAYUI_SHOP || DEFAULT_SHOP).replace(/\/+$/, '');
  let u;
  try { u = new URL(given); } catch (e) { throw new UsageError(`the shop's address is not an address: ${clean(given)}`, 'kit'); }
  if (!secure(u)) {
    throw new UsageError(`the shop's address must start with https:// (http only on this computer), so the key never travels in the clear: ${clean(given)}`, 'kit');
  }
  return given;
}

/** A request to the shop's API. The key goes only to the shop's own origin: a redirect elsewhere is followed without it. */
async function ask(shop, path, key, timeout) {
  const origin = new URL(shop).origin;
  let url = `${shop}/api/v1${path}`;
  for (let hop = 0; hop < 5; hop++) {
    const headers = { 'User-Agent': `trayui-cli/${version()}` };
    if (new URL(url).origin === origin) headers.Authorization = `Bearer ${key}`;
    let res;
    try {
      res = await fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(timeout) });
    } catch (e) {   // never e.message: it can quote a header
      const why = e.name === 'TimeoutError' ? `no answer in ${timeout / 1000} seconds` : (e.cause && e.cause.code) || 'no connection';
      throw new Error(`could not reach ${shop} (${why}). Check the connection and try again.`);
    }
    const to = res.status >= 300 && res.status < 400 && res.headers.get('location');
    if (!to) return res;
    url = new URL(to, url).href;
    if (!secure(new URL(url))) throw new Error(`${shop} sent the request on to an address that is not https; it was not followed.`);
  }
  throw new Error(`${shop} sent the request on too many times.`);
}

/** The shop's refusal, as it words it: { "error": "<code>", "message": "<sentence>" }. */
async function refusal(res, shop) {
  let body = null;
  try { body = JSON.parse(await res.text()); } catch (e) { /* not JSON: a proxy's page */ }
  const code = body && typeof body.error === 'string' ? clean(body.error) : '';
  let text = body && typeof body.message === 'string' && body.message.trim() ? clean(body.message.trim()) : `${shop} answered ${res.status} ${clean(res.statusText)}`.trim();
  if (!/[.!?]$/.test(text)) text += '.';
  if (code) text += ` [${code}]`;
  if (code === 'no_key' || code === 'bad_key' || (!code && res.status === 401)) {
    text += `\nYour licence key is in your licence mail, and at ${shop}/account. Give it in TRAYUI_KEY or with --key.`;
  }
  return new Error(text);
}

async function licence(shop, key) {
  const res = await ask(shop, '/licence', key, 30000);
  if (!res.ok) throw await refusal(res, shop);
  let data = null;
  try { data = await res.json(); } catch (e) { /* said below */ }
  if (!data || !Array.isArray(data.kits)) throw new Error(`${shop} sent no list of kits for this licence. Try again later.`);
  data.kits = data.kits.filter((k) => k && typeof k.slug === 'string');
  return data;
}

// CRC-32 of a file in the archive (zlib.crc32 is newer than Node 18)
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/** The files of a zip, read from its central directory and checked before anything is written: every path inside one
    folder, `top`, none that climbs out of it, no link; stored and deflated entries only, each the size and the CRC its
    directory says. Folders are 0755, files 0644, or 0755 when the archive made them executable. */
function readZip(buf, top) {
  const bad = (why) => new Error(`the kit's archive ${why}. Nothing was written.`);
  const zip64 = () => bad('is a zip64 archive, which this command does not read');
  let end = -1;   // the end of the central directory: 22 bytes, then a comment of up to 64 KB, at the very end
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 22 - 0xffff; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50 && i + 22 + buf.readUInt16LE(i + 20) === buf.length) { end = i; break; }
  }
  if (end < 0) throw bad('is not a zip file');
  if (end >= 20 && buf.readUInt32LE(end - 20) === 0x07064b50) throw zip64();
  const count = buf.readUInt16LE(end + 10), dirSize = buf.readUInt32LE(end + 12), dirAt = buf.readUInt32LE(end + 16);
  if (count === 0xffff || dirSize === 0xffffffff || dirAt === 0xffffffff) throw zip64();
  if (buf.readUInt16LE(end + 4) || buf.readUInt16LE(end + 6) || buf.readUInt16LE(end + 8) !== count) throw bad('is split over several files');
  if (dirAt + dirSize > end) throw bad('is cut short');
  const entries = [], seen = new Map();
  let p = dirAt, total = 0;
  for (let n = 0; n < count; n++) {
    if (p + 46 > end || buf.readUInt32LE(p) !== 0x02014b50) throw bad('has a broken directory');
    const os = buf[p + 5], flags = buf.readUInt16LE(p + 8), method = buf.readUInt16LE(p + 10);
    const crc = buf.readUInt32LE(p + 16), packed = buf.readUInt32LE(p + 20), length = buf.readUInt32LE(p + 24);
    const nameLength = buf.readUInt16LE(p + 28), next = p + 46 + nameLength + buf.readUInt16LE(p + 30) + buf.readUInt16LE(p + 32);
    const attrs = buf.readUInt32LE(p + 38), at = buf.readUInt32LE(p + 42);
    if (next > end) throw bad('has a broken directory');
    const name = buf.toString('utf8', p + 46, p + 46 + nameLength);
    p = next;
    const what = clean(name);
    if (packed === 0xffffffff || length === 0xffffffff || at === 0xffffffff) throw zip64();
    if (flags & 0x41) throw bad(`is encrypted (${what}), which this command does not read`);
    if (method !== 0 && method !== 8) throw bad(`packs ${what} in a way this command does not read (method ${method}; it reads stored and deflated files)`);
    // the path: inside the one folder, and nothing that leaves it
    if (!name || /[\u0000-\u001f\\:]/.test(name) || name.startsWith('/')) throw bad(`names a path that is not safe to write (${what})`);
    const parts = name.replace(/\/$/, '').split('/');
    if (parts.some((s) => s === '' || s === '.' || s === '..')) throw bad(`names a path that is not safe to write (${what})`);
    if (parts[0] !== top) throw bad(`holds ${what}, outside the folder ${top}/ that it should hold alone`);
    const unix = os === 3 || os === 19;   // made on Unix or macOS: the type and the mode are in the high 16 bits
    const mode = unix ? attrs >>> 16 : 0, type = mode & 0o170000;
    if (type === 0o120000) throw bad(`holds a link (${what}), which this command does not write`);
    const dir = name.endsWith('/') || type === 0o040000 || (!unix && (attrs & 0x10) !== 0);
    if (type && type !== 0o040000 && type !== 0o100000) throw bad(`holds ${what}, which is neither a file nor a folder`);
    const lower = parts.join('/').toLowerCase();   // a disk that ignores case would write them to one place
    if (seen.has(lower) && !(dir && seen.get(lower).dir)) throw bad(`names ${what} twice`);
    if (dir) { if (!seen.has(lower)) { const e = { parts, dir: true, mode: 0o755 }; seen.set(lower, e); entries.push(e); } continue; }
    if (parts.length < 2) throw bad(`holds a file named ${what} where its folder should be`);
    total += length;
    if (total > 2 ** 31) throw bad('unpacks to more than 2 GB');
    // where the data starts is the local header's own business: its name and extra field can differ from the directory's
    if (at + 30 > dirAt || buf.readUInt32LE(at) !== 0x04034b50) throw bad(`is broken where ${what} should start`);
    const from = at + 30 + buf.readUInt16LE(at + 26) + buf.readUInt16LE(at + 28);
    if (from + packed > dirAt) throw bad(`is cut short in ${what}`);
    const raw = buf.subarray(from, from + packed);
    let data;
    if (method === 0) data = raw;
    else {
      try { data = inflateRawSync(raw, { maxOutputLength: Math.max(length, 1) }); } catch (e) { throw bad(`is damaged: ${what} does not inflate to the size its directory says`); }
    }
    if (data.length !== length || crc32(data) !== crc) throw bad(`is damaged: ${what} is not what its directory says (size or CRC)`);
    const e = { parts, dir: false, mode: unix && (mode & 0o111) ? 0o755 : 0o644, data };
    seen.set(lower, e);
    entries.push(e);
  }
  // a file that is also a folder of other entries
  for (const e of entries) {
    for (let i = 1; i < e.parts.length; i++) {
      const up = seen.get(e.parts.slice(0, i).join('/').toLowerCase());
      if (up && !up.dir) throw bad(`holds ${clean(up.parts.join('/'))} both as a file and as a folder`);
    }
  }
  if (!entries.some((e) => !e.dir)) throw bad('holds no files');
  return entries;
}

/** Is the folder free to unpack into: missing, empty, or (with --force) a real folder of the user's. */
function freeFolder(folder, force) {
  let st = null;
  try { st = lstatSync(folder); } catch (e) { return { existed: false }; }
  if (st.isSymbolicLink()) throw new Error(`${shown(folder)} is a link to another place; the kit is not unpacked through it. Move it away, or unpack elsewhere with --dir.`);
  if (!st.isDirectory()) throw new Error(`${shown(folder)} is a file; the kit unpacks into a folder of that name. Move it away, or unpack elsewhere with --dir.`);
  const files = readdirSync(folder);
  if (files.length && !force) {
    throw new Error(`${shown(folder)}/ already exists and holds files. Unpack the kit elsewhere with --dir <folder>, move that folder away, or add --force to write the kit's files over it (the files the kit does not have are kept).`);
  }
  return { existed: files.length > 0 };
}

/** Writes the checked entries under root. With --force the folder may hold the user's files: nothing on the way may be a link. */
function unpack(entries, root) {
  for (const e of entries) {
    let at = root;
    for (let i = 1; i < e.parts.length; i++) {
      at = join(at, e.parts[i]);
      let st;
      try { st = lstatSync(at); } catch (x) { break; }
      if (st.isSymbolicLink()) throw new Error(`${shown(at)} is a link to another place; the kit is not unpacked through it. Move it away and run this again. Nothing was written.`);
      if ((i < e.parts.length - 1 || e.dir) ? !st.isDirectory() : st.isDirectory()) {
        throw new Error(`${shown(at)} is a ${st.isDirectory() ? 'folder' : 'file'} where the kit has a ${st.isDirectory() ? 'file' : 'folder'}. Move it away and run this again. Nothing was written.`);
      }
    }
  }
  mkdirSync(root, { recursive: true, mode: 0o755 });
  const counts = { files: 0, replaced: 0, bytes: 0 };
  for (const e of entries) {
    const abs = join(root, ...e.parts.slice(1));
    if (e.dir) { mkdirSync(abs, { recursive: true, mode: 0o755 }); continue; }
    mkdirSync(dirname(abs), { recursive: true, mode: 0o755 });
    if (existsSync(abs)) counts.replaced++;
    writeFileSync(abs, e.data, { mode: e.mode });
    counts.files++;
    counts.bytes += e.data.length;
  }
  return counts;
}

/** What to do next, from what the kit holds: its page to open, or its package's scripts. Nothing assumed beyond that. */
function nextSteps(root) {
  const lines = [], where = shown(root);
  const readme = existsSync(join(root, 'README.md')) ? `${where}/README.md` : '';
  let pkg = null;
  try { pkg = readJson(join(root, 'package.json')); } catch (e) { /* not a package */ }
  const scripts = (pkg && pkg.scripts) || {};
  if (pkg && (scripts.dev || scripts.start)) {
    const pm = existsSync(join(root, 'pnpm-lock.yaml')) ? 'pnpm' : existsSync(join(root, 'yarn.lock')) ? 'yarn' : existsSync(join(root, 'bun.lock')) ? 'bun' : 'npm';
    const run = scripts.dev ? (pm === 'npm' ? 'npm run dev' : `${pm} dev`) : `${pm} start`;
    lines.push('Then:', `  cd ${/\s/.test(where) ? `"${where}"` : where}`, `  ${pm} install`, `  ${run}`);
    const node = pkg.engines && typeof pkg.engines.node === 'string' ? pkg.engines.node : '';
    if (node || readme) lines.push([node ? `It needs Node ${clean(node)} (its package.json says so).` : '', readme ? `${readme} says more.` : ''].filter(Boolean).join(' '));
  } else if (existsSync(join(root, 'index.html'))) {
    lines.push(`Open ${where}/index.html in a browser.${readme ? ` ${readme} says more.` : ''}`);
  } else if (readme) lines.push(`${readme} says how to start.`);
  return lines;
}

async function kitList(shop, flags) {
  const lic = await licence(shop, licenceKey(flags));
  if (flags.json) {
    const kits = lic.kits.map((k) => ({ slug: k.slug, name: k.name, version: k.version, editions: k.editions }));
    say(hide(JSON.stringify({ licence: lic.licence, sku: lic.sku, name: lic.name, kits }, null, 1)));   // JSON escapes control characters itself
    return 0;
  }
  const what = [lic.name || lic.sku, lic.licence ? `a ${lic.licence} licence` : ''].filter(Boolean).join(', ');
  tell(`trayui kit: ${what ? what + ': ' : ''}${plural(lic.kits.length, 'kit')}, from ${shop}`);
  if (!lic.kits.length) { tell('\nThis licence opens no kit yet.'); return 0; }
  const rows = lic.kits.map((k) => [clean(k.slug), clean(k.version || ''),
    Object.keys(k.editions || {}).map((e) => `${clean(e)}${k.editions[e] && k.editions[e].bytes ? ' ' + size(k.editions[e].bytes) : ''}`).join(', '), clean(k.name || '')]);
  const w = [0, 1, 2].map((i) => Math.max(...rows.map((r) => r[i].length)));
  say('');
  for (const r of rows) say(`  ${r[0].padEnd(w[0])}  ${r[1].padEnd(w[1])}  ${r[2].padEnd(w[2])}  ${r[3]}`.replace(/\s+$/, ''));
  say('\nUnpack one: npx trayui kit <name> (the HTML edition), or npx trayui kit <name> --react.');
  return 0;
}

async function kit(flags, names) {
  if (flags.react && flags.html) throw new UsageError('--react and --html cannot go together', 'kit');
  const edition = flags.edition ? String(flags.edition).toLowerCase() : flags.react ? 'react' : 'html';
  if (!EDITION[edition]) throw new UsageError('--edition is html or react', 'kit');
  if ((flags.react && edition !== 'react') || (flags.html && edition !== 'html')) throw new UsageError(`--${flags.react ? 'react' : 'html'} and --edition ${edition} cannot go together`, 'kit');
  const shop = shopAddress(flags);
  if (flags.list) {
    if (names.length) throw new UsageError('kit --list takes no name: npx trayui kit --list', 'kit');
    return kitList(shop, flags);
  }
  // the words given are never echoed: a key pasted in the wrong place must not be printed
  if (names.length !== 1) throw new UsageError(names.length ? 'kit takes one name, such as npx trayui kit <name> --react (a key goes in TRAYUI_KEY or after --key)' : 'kit needs the name of a kit: npx trayui kit <name> (npx trayui kit --list names those your licence opens)', 'kit');
  const slug = names[0];
  if (!SLUG.test(slug)) throw new UsageError('a kit\'s name is in lowercase letters, digits and hyphens: npx trayui kit --list names those your licence opens', 'kit');
  const base = resolve(flags.cwd || '.', flags.dir || '.');
  if (existsSync(base) && !statSync(base).isDirectory()) throw new Error(`${shown(base)} is a file, not a folder to unpack the kit in.`);
  const top = `${slug}-${edition}`, root = join(base, top);
  const force = !!(flags.force || flags.overwrite);
  const dry = !!flags['dry-run'];
  freeFolder(root, force || dry);
  const key = licenceKey(flags);

  // the licence first: a friendly word when the kit or the edition is not in it, before anything is downloaded
  const lic = await licence(shop, key);
  const item = lic.kits.find((k) => k.slug === slug);
  if (!item) {
    const open = lic.kits.map((k) => k.slug);
    const close = near(slug, open);
    throw new Error(`your licence does not open a kit named ${slug}.${close.length ? ` Did you mean ${close.map(clean).join(', ')}?` : ''}`
      + (open.length ? ` npx trayui kit --list names the ${plural(open.length, 'kit')} it opens.` : ' It opens no kit yet.'));
  }
  const editions = Object.keys(item.editions || {});
  if (!editions.includes(edition)) {
    throw new Error(`${slug} has no ${EDITION[edition]} edition; it has ${editions.length ? editions.map((e) => EDITION[e] || clean(e)).join(' and ') : 'none'}.`
      + (editions.length === 1 && EDITION[editions[0]] ? ` npx trayui kit ${slug}${editions[0] === 'react' ? ' --react' : ''} unpacks it.` : ''));
  }
  const listed = item.editions[edition] || {};
  if (dry) {
    tell(`trayui (dry run) kit ${slug} ${clean(item.version || '')}, the ${EDITION[edition]} edition${listed.bytes ? ` (${size(listed.bytes)})` : ''}, from ${shop}`);
    const busy = existsSync(root) && readdirSync(root).length;
    tell(`  would unpack into ${shown(root)}/${busy ? (force ? ', writing over the files there' : ', which holds files: without --force it would stop there') : ''}`);
    tell('\nNothing was downloaded or written (--dry-run).');
    return 0;
  }

  const res = await ask(shop, `/kits/${slug}/${edition}`, key, 300000);
  if (!res.ok) throw await refusal(res, shop);
  let bytes;
  try { bytes = Buffer.from(await res.arrayBuffer()); } catch (e) {
    throw new Error(`the download from ${shop} stopped before its end (${e.name === 'TimeoutError' ? 'no end in 300 seconds' : 'the connection broke'}). Nothing was written; run the command again.`);
  }
  const version = clean(res.headers.get('x-kit-version') || item.version || '');
  // the checksum the download came with, or else the licence's when it is for the same version
  const sent = (res.headers.get('x-content-sha256') || '').trim();
  const same = !res.headers.get('x-kit-version') || res.headers.get('x-kit-version') === item.version;
  const want = sent || (same && typeof listed.sha256 === 'string' ? listed.sha256.trim() : '');
  const got = sha(bytes);
  if (want && want.toLowerCase() !== got && want !== Buffer.from(got, 'hex').toString('base64')) {
    throw new Error(`the download does not match its sha256: it was changed or cut short on the way (${size(bytes.length)} came). Nothing was written; run the command again.`);
  }
  const entries = readZip(bytes, top);
  freeFolder(root, force);   // again: the download took a while
  const counts = unpack(entries, root);
  tell(`trayui kit ${slug} ${version}, the ${EDITION[edition]} edition, from ${shop}`);
  tell(`  checked  ${want ? 'the download against its sha256' : 'nothing: the shop sent no sha256 for this download'} (${size(bytes.length)})`);
  tell(`  wrote    ${shown(root)}/: ${plural(counts.files, 'file')}${counts.replaced ? ` (${counts.replaced} written over the files there; files the kit does not have were kept)` : ''}, ${size(counts.bytes)}`);
  const steps = nextSteps(root);
  if (steps.length) { tell(''); for (const l of steps) tell(l); }
  return 0;
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
    return check(names.map((n) => (n === '-' ? n : resolve(base, n))).concat(flags.json ? ['--json'] : [], flags.rules ? ['--rules', flags.rules] : [], flags.prefix ? ['--prefix', flags.prefix] : []));
  }
  if (command === 'kit') return kit(flags, names);   // not a project's files: --dir is any folder, trayui.json is not read
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

// run as the command (npx trayui, node trayui.mjs), not when the file is imported
let self = '';
try { self = pathToFileURL(realpathSync(process.argv[1])).href; } catch (e) { /* not a file */ }
if (self === import.meta.url) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => {
    console.error(`trayui: ${hide(e.message)}`);   // hide: no message prints the licence key, should one carry it
    if (e instanceof UsageError) console.error(`npx trayui ${e.topic ? 'help ' + e.topic : '--help'} says how to use it.`);
    if (process.env.TRAYUI_DEBUG) console.error(hide(e.stack));
    process.exitCode = e instanceof UsageError ? 2 : 1;
  });
}
