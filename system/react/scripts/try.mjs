// Tries components before the package is built: type-checks their files, renders their previews and takes a picture.
//   node scripts/try.mjs Button Tabs          -> .try/Button.png, .try/Tabs.png (light theme)
//   node scripts/try.mjs Button --dark        -> also .try/Button.dark.png
//   node scripts/try.mjs Button --width 1180  -> a wider window (default 920)
// A component is tried through its preview, previews/<Name>.tsx: every named export is one labelled cell.
// The preview imports from 'trayui-react'; here that name resolves to the components in src/, built from source.
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const dark = args.includes('--dark');
const wi = args.indexOf('--width');
const width = wi >= 0 ? parseInt(args[wi + 1], 10) : 920;
const names = args.filter((a, i) => !a.startsWith('--') && !(wi >= 0 && i === wi + 1));
if (!names.length) { console.error('usage: node scripts/try.mjs <Name> [<Name>...] [--dark] [--width N]'); process.exit(2); }

const all = readdirSync(join(root, 'src/components')).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4));
const out = join(root, '.try');
mkdirSync(out, { recursive: true });
let failed = false;

for (const name of names) {
  const src = [`src/components/${name}.tsx`, `src/charts/${name}.tsx`].map((f) => join(root, f)).find(existsSync) || join(root, `src/components/${name}.tsx`);
  const preview = join(root, `previews/${name}.tsx`);
  for (const f of [src, preview]) if (!existsSync(f)) { console.error(`${name}: missing ${f.slice(root.length + 1)}`); failed = true; }
  if (!existsSync(src) || !existsSync(preview)) continue;

  // the entry this run sees as 'trayui-react': every component and the icon names
  const entry = join(out, `entry-${name}.ts`);
  writeFileSync(entry, all.map((n) => `export * from '../src/components/${n}';`).join('\n') + "\nexport type { IconName } from '../src/icons';\n");

  // 1. types: only errors in this component's own two files count
  const tsconfig = join(out, `tsconfig-${name}.json`);
  writeFileSync(tsconfig, JSON.stringify({
    compilerOptions: { target: 'ES2020', lib: ['ES2020', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, noUnusedLocals: true,
      skipLibCheck: true, noEmit: true, esModuleInterop: true, baseUrl: root, paths: { 'trayui-react/charts': [join(root, 'src/charts/index.ts')], 'trayui-react': [entry] }, types: [] },
    files: [src, preview],
  }));
  let typeErrors = [];
  try { execFileSync(join(root, 'node_modules/.bin/tsc'), ['-p', tsconfig, '--pretty', 'false'], { cwd: root, stdio: 'pipe' }); }
  catch (e) {
    const lines = String(e.stdout || '').split('\n').filter(Boolean);
    typeErrors = lines.filter((l) => l.includes(src.slice(root.length + 1)) || l.includes(`previews/${name}.tsx`));
    const others = lines.length - typeErrors.length;
    if (others && !typeErrors.length) console.error(`${name}: types ok here (${others} error line(s) in other files, not yours)`);
  }
  if (typeErrors.length) { failed = true; console.error(`${name}: ${typeErrors.length} type error(s)`); typeErrors.slice(0, 12).forEach((l) => console.error('  ' + l.replace(root + '/', ''))); continue; }

  // 2. bundle the preview with React and the components
  const page = join(out, `${name}.entry.tsx`);
  writeFileSync(page, `import * as React from 'react';
import { createRoot } from 'react-dom/client';
import * as cells from '../previews/${name}';
const names = Object.keys(cells).filter((k) => /^[A-Z]/.test(k) && typeof (cells as any)[k] === 'function');
class Catch extends React.Component<{ label: string; children: React.ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: any) { return { error: String(e && e.message || e) }; }
  render() { return this.state.error ? <p data-try-error style={{ color: '#b3261e', font: '14px monospace' }}>{'\\u26A0 ' + this.state.error}</p> : this.props.children; }
}
function Sheet() {
  return <div>{names.map((k) => { const Cell = (cells as any)[k]; return (
    <section key={k} data-try-cell={k} style={{ padding: '16px 24px 24px', borderBottom: '1px solid #dedcd6' }}>
      <p data-no-contrast style={{ margin: '0 0 12px', font: '12px/1 ui-monospace, monospace', color: '#6e6c66' }}>{k}</p>
      <Catch label={k}><Cell /></Catch>
    </section>); })}</div>;
}
(window as any).__tryCells = names;
createRoot(document.getElementById('root')!).render(<Sheet />);
`);
  let js;
  try {
    const r = await build({ entryPoints: [page], bundle: true, write: false, format: 'iife', jsx: 'automatic', platform: 'browser', logLevel: 'silent',
      alias: { 'trayui-react/charts': join(root, 'src/charts/index.ts'), 'trayui-react': entry }, define: { 'process.env.NODE_ENV': '"development"' } });
    js = r.outputFiles[0].text;
  } catch (e) { failed = true; console.error(`${name}: the preview does not bundle\n  ` + String(e.message).split('\n').slice(0, 6).join('\n  ')); continue; }

  // 3. render and take the picture
  const css = readFileSync(join(root, 'styles/styles.css'), 'utf8').replace(/url\("fonts\//g, `url("file://${join(root, 'styles/fonts')}/`);
  const html = (theme) => `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8"><style>${css}</style></head><body><div id="root"></div><script>${js.replace(/<\/script/g, '<\\/script')}</script></body></html>`;
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const theme of dark ? ['light', 'dark'] : ['light']) {
    const file = join(out, `${name}.${theme}.html`);
    writeFileSync(file, html(theme));
    const pg = await browser.newPage({ viewport: { width, height: 700 }, reducedMotion: 'reduce' });
    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e.message).slice(0, 220)));
    pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 220)); });
    await pg.goto('file://' + file, { waitUntil: 'load' });
    await pg.waitForTimeout(350);
    const info = await pg.evaluate(() => ({
      cells: window.__tryCells || [],
      empty: [...document.querySelectorAll('[data-try-cell]')].filter((s) => s.children.length < 2 || !s.children[1].getBoundingClientRect().height).map((s) => s.getAttribute('data-try-cell')),
      crashed: [...document.querySelectorAll('[data-try-error]')].map((p) => p.closest('[data-try-cell]').getAttribute('data-try-cell') + ': ' + p.textContent),
      over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    const shot = join(out, theme === 'light' ? `${name}.png` : `${name}.dark.png`);
    await pg.screenshot({ path: shot, fullPage: true });
    await pg.close();
    const notes = [];
    if (!info.cells.length) notes.push('no cells: the preview exports no PascalCase function');
    if (info.empty.length) notes.push('empty cells: ' + info.empty.join(', '));
    if (info.crashed.length) notes.push('crashed: ' + info.crashed.join(' | '));
    if (info.over > 1) notes.push(`scrolls sideways by ${info.over}px at ${width}px`);
    if (errors.length) notes.push('errors: ' + [...new Set(errors)].slice(0, 4).join(' | '));
    if (notes.length) failed = true;
    console.log(`${name} [${theme}] ${info.cells.length} cell(s): ${info.cells.join(', ')} -> ${shot.slice(root.length + 1)}${notes.length ? '\n  ' + notes.join('\n  ') : ''}`);
  }
  await browser.close();
}
process.exit(failed ? 1 : 0);
