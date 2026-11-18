// Checks the package as npm would publish it: packs it, unpacks the copy into an app of its own, and imports both of its
// entries there in Node, as an application does. A relative import that does not name its file (0.2.0 shipped
// './components/Button', which Node and webpack cannot load), a file the exports name but the package leaves out, or a
// file that must not ship (dist/all.*, built from a file kept on one machine) fails here instead of in someone's app.
//   node scripts/packed.mjs        scripts/build.mjs runs it after every build
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, existsSync, writeFileSync } from 'node:fs';
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
  if (!problems.length) console.log(`packed: ${info.filename}, ${files.size} files, imports in Node`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

if (problems.length) {
  console.error('packed: the package as npm would publish it is broken:\n  ' + problems.join('\n  '));
  process.exit(1);
}
