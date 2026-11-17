// The syntax colours of the site: highlight.js, with the languages the docs are written in. tools/site.py runs it two ways.
//   node scripts/code.mjs --serve           colours code while the site is built: one request a line on stdin,
//                                           {"lang": "html", "text": "..."}, and one answer a line on stdout, the HTML as a JSON string
//   node scripts/code.mjs --bundle <out.js> the same colouring as one script for the page, which puts `TrayCode` on window,
//                                           for the code the page writes itself (a playground, a theme, the source of a
//                                           block): HTML and CSS, so it holds only those grammars; beside it, <out>.licenses.txt
// The HTML holds highlight.js's own classes (hljs-keyword, hljs-string…); the code block of the system colours them.
import { build } from 'esbuild';
import { createInterface } from 'node:readline';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/* The languages, by the name a fence gives them on the site; anything else is left as plain text. */
const LANGS = { html: 'xml', xml: 'xml', css: 'css', js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', sh: 'bash', bash: 'bash', json: 'json' };
const GRAMMARS = ['xml', 'css', 'javascript', 'typescript', 'bash', 'json'];
/* The page writes HTML (with the CSS and scripts it may hold) and CSS; the rest is coloured while the site is built. */
const PAGE = ['xml', 'css', 'javascript'];

const source = (grammars) => `
import hljs from 'highlight.js/lib/core';
${grammars.map((g) => `import ${g} from 'highlight.js/lib/languages/${g}';`).join('\n')}
${grammars.map((g) => `hljs.registerLanguage('${g}', ${g});`).join('\n')}
const LANGS = ${JSON.stringify(Object.fromEntries(Object.entries(LANGS).filter(([, g]) => grammars.includes(g))))};
const escape = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
/* html(text, lang): the code as HTML, escaped, with its parts in spans. */
export function html(text, lang) {
  const name = LANGS[String(lang || '').toLowerCase()];
  return name ? hljs.highlight(String(text), { language: name, ignoreIllegals: true }).value : escape(text);
}
`;

const mode = process.argv[2];
if (mode === '--bundle') {
  const out = process.argv[3];
  if (!out) {
    console.error('code: say where to write the script: node scripts/code.mjs --bundle <out.js>');
    process.exit(1);
  }
  await build({
    stdin: { contents: source(PAGE) + '\nwindow.TrayCode = { html };\n', resolveDir: root, loader: 'js', sourcefile: 'code-entry.js' },
    bundle: true,
    format: 'iife',
    minify: true,
    target: 'es2020',
    legalComments: 'none',
    outfile: out,
    logLevel: 'warning',
  });
  const at = join(root, 'node_modules', 'highlight.js');
  const meta = JSON.parse(readFileSync(join(at, 'package.json'), 'utf8'));
  writeFileSync(
    out.replace(/\.js$/, '') + '.licenses.txt',
    `The syntax colours of the Tray UI site come from highlight.js, used under its licence, given below.\n\n${'='.repeat(72)}\n` +
      `highlight.js ${meta.version} (${meta.license})\n${'='.repeat(72)}\n${readFileSync(join(at, 'LICENSE'), 'utf8').trim()}\n`,
  );
  console.log(`code: highlight.js ${meta.version}, ${PAGE.length} grammars -> ${out} (${Math.round(readFileSync(out).length / 1024)} KB)`);
} else if (mode === '--serve') {
  /* The same module, bundled for node in memory, so the build and the page colour code alike. */
  const made = await build({
    stdin: { contents: source(GRAMMARS), resolveDir: root, loader: 'js', sourcefile: 'code-entry.js' },
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    logLevel: 'warning',
  });
  const { html } = await import('data:text/javascript;base64,' + Buffer.from(made.outputFiles[0].text).toString('base64'));
  const lines = createInterface({ input: process.stdin });
  for await (const line of lines) {
    if (!line.trim()) continue;
    const ask = JSON.parse(line);
    process.stdout.write(JSON.stringify(html(ask.text, ask.lang)) + '\n');
  }
} else {
  console.error('code: node scripts/code.mjs --serve | --bundle <out.js>');
  process.exit(1);
}
