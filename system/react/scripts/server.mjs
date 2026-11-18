// Checks that a server-rendered app (Next.js's App Router, or any React Server Components setup) can import the package,
// and that every component renders on a server.
//   node scripts/server.mjs        `npm run check` runs it after the type check
//
// 1. 'use client'. A module that needs the browser's React (state, effects, refs, context, an event handler, Recharts)
//    starts with 'use client', so a server page can import it and render it: the bundler turns it into a reference and
//    runs it in the browser. Without it, Next.js stops with "useRef is not a function". A module that needs none of
//    those may leave it out, and then renders on the server with no script in the page; everything such a module
//    imports, it imports on the server too, so it may not reach a module that creates a context, nor render a
//    component from lib/ (which carry no 'use client'). The two entries and lib/ never carry it: the hooks and the
//    runtime they export must stay plain functions.
// 2. Every preview (previews/<Name>.tsx) renders to HTML in Node with react-dom/server, where there is no document:
//    a component that reads the page while it renders, or reports an error on a server, fails here.
import { build } from 'esbuild';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const problems = [];

/* ---------- 1. the 'use client' boundary ---------- */
const CLIENT_REACT = /\bReact\.(useState|useEffect|useLayoutEffect|useInsertionEffect|useRef|useContext|useReducer|useImperativeHandle|useSyncExternalStore|useTransition|useDeferredValue|useOptimistic|useActionState|useEffectEvent|startTransition|createContext|Component|PureComponent)\b/;
const SERVER_HOOKS = new Set(['useUid', 'useId', 'useMemo', 'useCallback', 'useDebugValue']); // the hooks a server component may call
const strip = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

const modules = new Map(); // path relative to src -> { client, needs: [why], imports: [{ path, names }] }
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name) && !e.name.endsWith('.d.ts')) modules.set(relative(src, p), null);
  }
}
walk(src);
modules.delete('all.ts'); // kept on one machine for a local tool; no part of the package

function resolve(from, spec) {
  const base = join(dirname(join(src, from)), spec);
  for (const c of [base + '.ts', base + '.tsx', join(base, 'index.ts')]) if (existsSync(c)) return relative(src, c);
  return null;
}

for (const rel of modules.keys()) {
  const raw = readFileSync(join(src, rel), 'utf8');
  const text = strip(raw);
  // a directive counts only as the first statement: comments may come before it, nothing else
  const client = /^\s*['"]use client['"];?/.test(text);
  if (!client && /^\s*['"]use client['"]/m.test(text)) problems.push(`${rel}: 'use client' is not its first statement, so it does nothing`);
  const needs = [];
  const r = text.match(CLIENT_REACT);
  if (r) needs.push(`React.${r[1]}`);
  for (const m of text.matchAll(/\b(use[A-Z]\w*)\(/g)) if (!SERVER_HOOKS.has(m[1]) && !needs.includes(m[1])) needs.push(m[1]);
  const handler = text.match(/\s(on[A-Z][A-Za-z]*)=\{/);
  if (handler) needs.push(`an ${handler[1]} handler`);
  if (/from\s+['"]recharts['"]/.test(text)) needs.push('Recharts');
  const topLevel = (text.match(/^(?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*React\.createContext\b/m) || [])[0];
  const imports = [];
  for (const m of text.matchAll(/^\s*(import|export)\s+(type\s+)?([^'";]*?)\s*from\s*['"](\.{1,2}\/[^'"]+)['"]/gm)) {
    if (m[2]) continue; // a type import or export is erased
    const to = resolve(rel, m[4]);
    if (!to) { problems.push(`${rel}: cannot find ${m[4]}`); continue; }
    const names = (m[3].match(/\{([^}]*)\}/)?.[1] || '').split(',').map((s) => s.trim()).filter((s) => s && !s.startsWith('type ')).map((s) => s.split(/\s+as\s+/)[0]);
    imports.push({ path: to, names, star: /^\*/.test(m[3]) });
  }
  modules.set(rel, { client, needs, imports, createsContext: !!topLevel });
}

const isComponent = (rel) => /^(components|charts)\//.test(rel) && !rel.endsWith('index.ts');
for (const [rel, m] of modules) {
  if (isComponent(rel) && m.needs.length && !m.client)
    problems.push(`${rel} uses ${m.needs.slice(0, 3).join(', ')} but does not start with 'use client': a server page that imports it fails`);
  if (!isComponent(rel) && m.client)
    problems.push(`${rel} starts with 'use client': only component files may, so the hooks, the runtime and the helpers stay plain functions`);
}

// the server's graph: from the two entries, through every module that is not a 'use client' boundary
const entries = ['index.ts', 'charts/index.ts'];
const onServer = new Set();
const queue = [...entries];
while (queue.length) {
  const rel = queue.shift();
  if (onServer.has(rel)) continue;
  onServer.add(rel);
  const m = modules.get(rel);
  if (!m) continue;
  for (const imp of m.imports) {
    const to = modules.get(imp.path);
    if (!to) continue;
    if (to.client) continue; // a reference on the server: its own imports stay in the browser
    if (isComponent(rel) && imp.path.startsWith('lib/')) {
      const parts = imp.names.filter((n) => /^[A-Z]/.test(n));
      if (parts.length) problems.push(`${rel} renders on the server but uses ${parts.join(', ')} from ${imp.path}, which runs only in the browser: give ${rel} 'use client'`);
    }
    if (to.createsContext) problems.push(`${rel} renders on the server but imports ${imp.path}, which creates a context (only the browser's React can): give ${rel} 'use client', or move what it needs out of ${imp.path}`);
    queue.push(imp.path);
  }
}
const marked = [...modules].filter(([rel, m]) => isComponent(rel) && m.client).length;
const plain = [...modules].filter(([rel, m]) => isComponent(rel) && !m.client).map(([rel]) => rel.replace(/^.*\/|\.tsx$/g, ''));

/* ---------- 2. every preview renders on a server ---------- */
const previews = readdirSync(join(root, 'previews')).filter((f) => f.endsWith('.tsx')).sort();
const entry = previews.map((f, i) => `export * as P${i} from './previews/${f.slice(0, -4)}';`).join('\n');
const bundle = await build({
  stdin: { contents: entry, resolveDir: root, loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic', logLevel: 'silent',
  external: ['react', 'react-dom', 'react-icons', 'recharts'],
  alias: { 'trayui-react/charts': join(src, 'charts/index.ts'), 'trayui-react': join(src, 'index.ts') },
  outfile: join(root, 'node_modules/.cache/trayui-server/previews.mjs'),
});
const out = bundle.outputFiles[0];
mkdirSync(dirname(out.path), { recursive: true });
writeFileSync(out.path, out.text);
const React = (await import('react')).default;
const { renderToString } = await import('react-dom/server');
const said = [];
const real = console.error;
console.error = (...args) => said.push(args.map(String).join(' ').split('\n')[0]);
let rendered = 0;
try {
  if (typeof globalThis.document !== 'undefined' || typeof globalThis.window !== 'undefined') throw new Error('this check needs a Node with no document');
  const mod = await import(pathToFileURL(out.path).href + '?' + Date.now());
  for (const [i, f] of previews.entries()) {
    for (const [name, Example] of Object.entries(mod['P' + i])) {
      if (typeof Example !== 'function') continue;
      said.length = 0;
      try {
        const html = renderToString(React.createElement(React.StrictMode, null, React.createElement(Example)));
        if (!html) problems.push(`previews/${f} ${name} renders nothing on a server`);
        rendered += 1;
      } catch (e) {
        problems.push(`previews/${f} ${name} fails on a server: ${String(e.message || e).split('\n')[0]}`);
      }
      for (const s of new Set(said)) problems.push(`previews/${f} ${name}: on a server React says: ${s.slice(0, 200)}`);
    }
  }
} finally {
  console.error = real;
}

if (problems.length) {
  console.error('server: a server-rendered app would break:\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log(`server: ${marked} component files start with 'use client'; ${plain.length} render on the server with no script (${plain.join(', ')})`);
console.log(`server: ${rendered} preview examples render to HTML in Node, with no document and no warning`);
