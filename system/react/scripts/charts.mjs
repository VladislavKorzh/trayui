// Bundles the chart examples for the site: React, Recharts, the chart kit and every file in examples/charts, as one script
// that puts `TrayCharts` on the page. tools/site.py runs it.
//   node scripts/charts.mjs <outfile.js>
// Beside the script it writes <outfile>.licenses.txt: the licence of every package that went into it.
import { build } from 'esbuild';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'examples/charts');
const out = process.argv[2];
if (!out) {
  console.error('charts: say where to write the script: node scripts/charts.mjs <outfile.js>');
  process.exit(1);
}
const files = readdirSync(dir).filter((f) => f.endsWith('.tsx')).sort();
const entry =
  files.map((f, i) => `import * as m${i} from ${JSON.stringify(join(dir, f))};`).join('\n') +
  `
import * as React from 'react';
import { createRoot } from 'react-dom/client';
const all = { ${files.map((f, i) => `${JSON.stringify(f.slice(0, -4))}: m${i}`).join(', ')} };
const roots = new Map();
const pick = (m) => Object.values(m).find((v) => typeof v === 'function');
window.TrayCharts = {
  ids: Object.keys(all),
  /* mount(id, el): draw the example with that id into el. */
  mount(id, el) {
    const Example = all[id] && pick(all[id]);
    if (!Example) return false;
    const root = createRoot(el);
    roots.set(el, root);
    root.render(React.createElement(Example));
    return true;
  },
  /* clear(): take every example off the page, before the page changes. */
  clear() {
    roots.forEach((root) => root.unmount());
    roots.clear();
  },
};
`;

/* The examples import the package by its name; here that name is the source next door. */
const local = {
  name: 'local-package',
  setup(b) {
    b.onResolve({ filter: /^trayui-react(\/charts)?$/ }, (a) => ({ path: join(root, a.path.endsWith('/charts') ? 'src/charts/index.ts' : 'src/index.ts') }));
    b.onResolve({ filter: /\/runtime$/ }, (a) => (a.importer.startsWith(join(root, 'src')) ? { path: join(root, 'scripts/site-runtime.ts') } : null));
  },
};

const result = await build({
  stdin: { contents: entry, resolveDir: root, loader: 'tsx', sourcefile: 'charts-entry.tsx' },
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2020',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'none',
  metafile: true,
  outfile: out,
  plugins: [local],
  logLevel: 'warning',
});

const packages = new Set();
for (const input of Object.keys(result.metafile.inputs)) {
  const m = /^(?:.*\/)?node_modules\/((?:@[^/]+\/)?[^/]+)\//.exec(input);
  if (m) packages.add(m[1]);
}
let notice = 'The chart examples of the Tray UI site are bundled with these packages. Each is used under its own licence, given below.\n';
for (const name of [...packages].sort()) {
  const at = join(root, 'node_modules', name);
  const meta = JSON.parse(readFileSync(join(at, 'package.json'), 'utf8'));
  const file = readdirSync(at).find((f) => /^licen[sc]e(\.md|\.txt)?$/i.test(f));
  notice += `\n${'='.repeat(72)}\n${name} ${meta.version} (${typeof meta.license === 'string' ? meta.license : 'see below'})\n${'='.repeat(72)}\n`;
  notice += file && existsSync(join(at, file)) ? readFileSync(join(at, file), 'utf8').trim() + '\n' : 'No licence file in the package; see its page on npm.\n';
}
writeFileSync(out.replace(/\.js$/, '') + '.licenses.txt', notice);
const size = readFileSync(out).length;
console.log(`charts: ${files.length} examples, ${packages.size} packages -> ${out} (${Math.round(size / 1024)} KB)`);
