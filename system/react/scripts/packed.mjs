// Checks the package as npm would publish it: packs it, unpacks the copy into an app of its own, and imports both of its
// entries there in Node, as an application does. A relative import that does not name its file (0.2.0 shipped
// './components/Button', which Node and webpack cannot load), a file the exports name but the package leaves out, or a
// file that must not ship (dist/all.*, built from a file kept on one machine) fails here instead of in someone's app.
// It also checks what a server-rendered app needs of the copy: every file whose source starts with 'use client' still
// does (a server page that imports it fails otherwise), and the runtime, loaded in a page that is already parsed, adds
// the icon sprite and wires nothing (wiring server-rendered markup before React hydrates it is React error #418).
//   node scripts/packed.mjs        scripts/build.mjs runs it after every build
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const tmp = mkdtempSync(join(tmpdir(), 'trayui-react-packed-'));
const problems = [];

try {
  const [info] = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', tmp], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  const files = new Set(info.files.map((f) => f.path));

  for (const f of files) if (/^dist\/all\./.test(f)) problems.push(`${f} is in the package: it is built from src/all.ts, which is not part of it`);
  // every file the exports map names is in the package
  const targets = [];
  (function walk(v) { if (typeof v === 'string') targets.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); })(pkg.exports);
  for (const t of new Set(targets)) if (!files.has(t.replace(/^\.\//, ''))) problems.push(`the exports name ${t}, which is not in the package`);

  // the copy, installed in an app of its own: its peers come from this package's node_modules, as an app would bring them
  const app = join(tmp, 'app'), modules = join(app, 'node_modules');
  mkdirSync(modules, { recursive: true });
  execFileSync('tar', ['-xzf', join(tmp, info.filename), '-C', modules]);
  renameSync(join(modules, 'package'), join(modules, pkg.name));
  for (const peer of Object.keys(pkg.peerDependencies || {})) {
    if (existsSync(join(root, 'node_modules', peer))) symlinkSync(join(root, 'node_modules', peer), join(modules, peer), 'dir');
  }
  writeFileSync(join(app, 'package.json'), '{ "type": "module", "private": true }\n');
  writeFileSync(join(app, 'try.mjs'), [
    `const ui = await import('${pkg.name}');`,
    `const charts = await import('${pkg.name}/charts');`,
    `if (typeof ui.Button !== 'function' && typeof ui.Button !== 'object') throw new Error('${pkg.name} has no Button');`,
    `if (!charts.Chart) throw new Error('${pkg.name}/charts has no Chart');`,
    `console.log(Object.keys(ui).length + ' exports in ${pkg.name}, ' + Object.keys(charts).length + ' in ${pkg.name}/charts');`,
  ].join('\n') + '\n');
  try {
    process.stdout.write('packed: ' + execFileSync(process.execPath, ['try.mjs'], { cwd: app, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  } catch (e) {
    problems.push(`the packed copy does not import in Node:\n${String(e.stderr || e.message).trim().split('\n').slice(0, 8).join('\n')}`);
  }

  // 'use client' survives the compile: the first statement of the packed file, wherever the source has it
  const pkgDir = join(modules, pkg.name);
  let marked = 0;
  for (const dir of ['components', 'charts']) {
    for (const f of readdirSync(join(root, 'src', dir)).filter((n) => n.endsWith('.tsx'))) {
      if (!/^\s*['"]use client['"]/.test(readFileSync(join(root, 'src', dir, f), 'utf8'))) continue;
      const out = join(pkgDir, 'dist', dir, f.replace(/\.tsx$/, '.js'));
      if (!existsSync(out) || !/^['"]use client['"];/.test(readFileSync(out, 'utf8'))) problems.push(`dist/${dir}/${f.replace(/\.tsx$/, '.js')} lost its 'use client'`);
      else marked += 1;
    }
  }
  for (const entry of ['dist/index.js', 'dist/charts/index.js', 'dist/lib/util.js']) {
    if (/^\s*['"]use client['"]/.test(readFileSync(join(pkgDir, entry), 'utf8'))) problems.push(`${entry} starts with 'use client': its hooks and the runtime would not be plain functions`);
  }

  // the runtime in a page that is already parsed, as when a server-rendered page loads its scripts: it adds the sprite
  // and asks the page for nothing else (the behaviours look their elements up with querySelectorAll)
  writeFileSync(join(app, 'dom.mjs'), `
    const asked = [], added = [];
    const el = () => ({ set innerHTML(html) { this.firstChild = { html }; }, firstChild: null });
    const ask = (name) => (...args) => { asked.push(name + '(' + args.map(String).join(', ').slice(0, 60) + ')'); return name === 'querySelector' ? null : []; };
    globalThis.document = {
      readyState: 'complete',
      body: { firstChild: null, insertBefore(node) { added.push(node.html || ''); } },
      getElementById: (id) => (added.length && id === 'tray-sprite' ? {} : null),
      createElement: el,
      addEventListener() {}, removeEventListener() {},
      querySelector: ask('querySelector'), querySelectorAll: ask('querySelectorAll'),
    };
    globalThis.window = globalThis;
    const { default: UI } = await import('./node_modules/${pkg.name}/dist/runtime.js');
    const sprite = added.filter((h) => h.startsWith('<svg id="tray-sprite"')).length;
    console.log(JSON.stringify({ sprite, asked, init: typeof UI.init, restore: typeof UI.sprite }));
  `);
  try {
    const seen = JSON.parse(execFileSync(process.execPath, ['dom.mjs'], { cwd: app, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
    if (seen.sprite !== 1) problems.push(`the runtime added the icon sprite ${seen.sprite} times on import, not once`);
    if (seen.asked.length) problems.push(`the runtime looked through the page on import, so it wires server-rendered markup before React hydrates it: ${seen.asked.slice(0, 3).join('; ')}`);
    if (seen.init !== 'function' || seen.restore !== 'function') problems.push('the runtime has no init() or sprite() in a page');
  } catch (e) {
    problems.push(`the runtime does not load in a page that is already parsed:\n${String(e.stderr || e.message).trim().split('\n').slice(0, 6).join('\n')}`);
  }
  if (!problems.length) {
    console.log(`packed: ${info.filename}, ${files.size} files, imports in Node`);
    console.log(`packed: ${marked} files keep 'use client'; the runtime adds the icon sprite on import and wires nothing`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

if (problems.length) {
  console.error('packed: the package as npm would publish it is broken:\n  ' + problems.join('\n  '));
  process.exit(1);
}
