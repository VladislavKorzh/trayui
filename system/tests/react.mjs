// Bundles the React previews (react/previews/<Name>.tsx) for the component tests, from the package's sources and with its
// own esbuild, into one page script per component: system/.cache/tests/react/<Name>.js, sharing one chunk of React and
// the components. Each named export of a preview is drawn in a <div data-cell="Name">, inside an error boundary.
//   node tests/react.mjs                       every preview
//   node tests/react.mjs Tabs Card             only these (and their test pages, tests/static-pages/Tabs-*.tsx)
//   node tests/react.mjs --out <folder>        into that folder (each run of the tests has its own, so runs at the same
//                                              time do not wipe each other's pages)
// Run by tools/test_components.py before the tests; it prints the names it bundled, one line of JSON.
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const system = join(dirname(fileURLToPath(import.meta.url)), '..');
const react = join(system, 'react');
const args = process.argv.slice(2);
const oi = args.indexOf('--out');
const out = oi >= 0 ? args[oi + 1] : join(system, '.cache', 'tests', 'react');
const { build } = createRequire(join(react, 'package.json'))('esbuild');

const want = args.filter((a, i) => !a.startsWith('--') && !(oi >= 0 && i === oi + 1));
// the previews, and the test pages of tests/static-pages/ (<Name>-<state>.tsx: states no preview reaches, for static parity)
const pagesDir = join(system, 'tests', 'static-pages');
const tsx = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)) : []);
const source = new Map([...tsx(join(react, 'previews')).map((n) => [n, join(react, 'previews', n + '.tsx')]), ...tsx(pagesDir).map((n) => [n, join(pagesDir, n + '.tsx')])]);
const names = [...source.keys()].filter((n) => !want.length || want.includes(n) || want.some((w) => n.startsWith(w + '-'))).sort();

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'src'), { recursive: true });
for (const name of names) {
  writeFileSync(join(out, 'src', `${name}.tsx`), `import * as React from 'react';
import { createRoot } from 'react-dom/client';
import * as cells from ${JSON.stringify(source.get(name))};
const names = Object.keys(cells).filter((k) => /^[A-Z]/.test(k) && typeof (cells as any)[k] === 'function');
class Catch extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: any) { return { error: String((e && e.message) || e) }; }
  componentDidCatch(e: any) { ((window as any).__cellErrors ||= []).push(String((e && e.message) || e)); }
  render() { return this.state.error ? <p data-cell-error>{this.state.error}</p> : this.props.children; }
}
function Sheet() {
  // <div>s, not a <main> or <section>s: inside either a <header> is no banner and a <footer> no content information
  return <div className="tray-demo tray-demo--col">{names.map((k) => { const Cell = (cells as any)[k]; return (
    <div key={k} data-cell={k}><Catch><Cell /></Catch></div>); })}</div>;
}
(window as any).__cells = names;
createRoot(document.getElementById('root')!).render(<Sheet />);
requestAnimationFrame(() => requestAnimationFrame(() => { (window as any).__drawn = true; }));
`);
}

try {
  await build({
    entryPoints: names.map((n) => join(out, 'src', `${n}.tsx`)),
    outdir: out, bundle: true, splitting: true, format: 'esm', jsx: 'automatic', platform: 'browser', target: 'es2022',
    logLevel: 'silent', nodePaths: [join(react, 'node_modules')], chunkNames: 'chunks/[name]-[hash]',
    alias: { 'trayui-react/charts': join(react, 'src/charts/index.ts'), 'trayui-react': join(react, 'src/index.ts') },
    define: { 'process.env.NODE_ENV': '"development"' },
  });
} catch (e) {
  console.error('the React previews do not bundle:\n  ' + String(e.message).split('\n').slice(0, 12).join('\n  '));
  process.exit(1);
}
console.log(JSON.stringify(names.filter((n) => existsSync(join(out, `${n}.js`)))));
