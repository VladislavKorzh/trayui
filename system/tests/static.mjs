// Renders the React previews (react/previews/<Name>.tsx) to static HTML in static mode (renderToStaticHTML, from the
// entry trayui-react/static), for the component tests: one file per component, <out>/<Name>.html, holding the page's
// body. Each named export is drawn in a <div data-cell="Name">, all of them in one tree, as tests/react.mjs draws them,
// so the ids useId makes are unique across the cells as they are in the React page. The harness serves it at
// /static/<Name> with the system's three files, and at /static/<Name>?bare=1 without bundle.js.
//   node tests/static.mjs                       every preview
//   node tests/static.mjs Tabs Checkbox         only these (and their test pages, tests/static-pages/Tabs-*.tsx)
//   node tests/static.mjs --out <folder>        into that folder (tools/test_components.py gives each run its own)
// Prints the names it rendered, one line of JSON; a preview that fails to render gets a page that says so.
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const system = join(dirname(fileURLToPath(import.meta.url)), '..');
const react = join(system, 'react');
const args = process.argv.slice(2);
const oi = args.indexOf('--out');
const out = oi >= 0 ? args[oi + 1] : join(system, '.cache', 'tests', 'static');
const { build } = createRequire(join(react, 'package.json'))('esbuild');

const want = args.filter((a, i) => !a.startsWith('--') && !(oi >= 0 && i === oi + 1));
// the previews, and the test pages of tests/static-pages/, as tests/react.mjs takes them
const pagesDir = join(system, 'tests', 'static-pages');
const tsx = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)) : []);
const source = new Map([...tsx(join(react, 'previews')).map((n) => [n, join(react, 'previews', n + '.tsx')]), ...tsx(pagesDir).map((n) => [n, join(pagesDir, n + '.tsx')])]);
const names = [...source.keys()].filter((n) => !want.length || want.includes(n) || want.some((w) => n.startsWith(w + '-'))).sort();

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'src'), { recursive: true });
writeFileSync(join(out, 'src', 'all.tsx'), `import * as React from 'react';
import { renderToStaticHTML } from 'trayui-react/static';
${names.map((n, i) => `import * as p${i} from ${JSON.stringify(source.get(n))};`).join('\n')}
const previews: Record<string, any> = { ${names.map((n, i) => `${JSON.stringify(n)}: p${i}`).join(', ')} };
export function render(name: string): string {
  const cells = previews[name];
  const keys = Object.keys(cells).filter((k) => /^[A-Z]/.test(k) && typeof cells[k] === 'function');
  return renderToStaticHTML(<div className="tray-demo tray-demo--col">{keys.map((k) => { const Cell = cells[k]; return <div key={k} data-cell={k}><Cell /></div>; })}</div>);
}
`);
const file = join(out, 'src', 'all.mjs');
try {
  await build({
    entryPoints: [join(out, 'src', 'all.tsx')], outfile: file, bundle: true, format: 'esm', platform: 'node', jsx: 'automatic',
    target: 'node18', logLevel: 'silent', nodePaths: [join(react, 'node_modules')],
    alias: { 'trayui-react/charts': join(react, 'src/charts/index.ts'), 'trayui-react/static': join(react, 'src/static.ts'), 'trayui-react': join(react, 'src/index.ts') },
    define: { 'process.env.NODE_ENV': '"production"' },
    banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  });
} catch (e) {
  console.error('the React previews do not bundle for a static render:\n  ' + String(e.message).split('\n').slice(0, 12).join('\n  '));
  process.exit(1);
}
const quiet = console.error;
console.error = () => {}; // React's warnings on a server: the React package's own check (scripts/server.mjs) reports them
const { render } = await import(pathToFileURL(file).href);
const done = [];
for (const name of names) {
  let html;
  try {
    html = render(name);
    done.push(name);
  } catch (e) {
    html = `<p data-cell-error>${String((e && e.message) || e).split('\n')[0].replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;'))}</p>`;
  }
  writeFileSync(join(out, `${name}.html`), html);
}
console.error = quiet;
console.log(JSON.stringify(done));
