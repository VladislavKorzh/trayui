#!/usr/bin/env python3
"""Prove the registry and the trayui command end to end, the way a user meets them: from a local server of the built
site, into a fresh folder of plain HTML pages, a fresh Vite React app and a fresh Next.js app, each built and opened in
Chrome at 1440 and 390 pixels wide.

    python3 tools/cli_check.py                 serve site/ (tools/serve.py) and check it all
    python3 tools/cli_check.py --site DIR      serve another folder that holds r/ and fonts/ (registry.py --out DIR)
    python3 tools/cli_check.py --skip compare,shadcn     leave steps out (registry plain updates skill vite next types compare shadcn)

It needs Node 18 or later, npm and the network (it creates the apps with npm and installs Vite and Next.js once; they
are kept in .cache/cli-check/ and reused), Google Chrome and Pillow. The steps:

  registry  every item valid against shadcn's schemas (registry.validate, and the jsonschema library when present)
  plain     init and add three blocks in an empty folder; in Chrome the font loads, the tokens and the yellow apply,
            the sprite is there, the password shows, nothing fails and nothing scrolls sideways at 390
  vite      a fresh Vite react-ts app: init (which installs trayui and imports the stylesheet), add four items, build,
            the same in Chrome, and the tooltip and the tabs work
  next      a fresh Next.js app (App Router): the copied components imported straight into a Server Component, built,
            started, the same in Chrome, and no hydration error
  updates   a file you changed is kept by update and add, diff shows it, --overwrite replaces it; a change upstream
            reaches a file you left alone; a file changed on both sides is kept
  types     every React item (all the components, the shared code, all the blocks) type-checked in both apps
  compare   all the blocks, the React component against the HTML page, in Chrome: the same pixels and no script error
  skill     npx trayui skill copies the agent skill into .claude/skills/trayui and keeps a SKILL.md you changed
  shadcn    npx shadcn add of a plain HTML block and of a React block (universal items), into empty folders

The items name the package trayui at this version, which npm has only once it is published. So init and shadcn install
it from a small npm registry of this check's own that holds the package built here (dist/, packed with npm pack) and
sends every other package on to registry.npmjs.org: the check holds before a release as after it, and the stylesheet
the apps render with is the one this build makes. Exit 1 when a check fails.
"""
import argparse, functools, http.server, json, os, re, shutil, socket, subprocess, sys, threading, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / '.cache' / 'cli-check'
sys.path.insert(0, str(ROOT / 'tools'))
import registry  # noqa: E402

results = []
ENV = dict(os.environ, NEXT_TELEMETRY_DISABLED='1', npm_config_fund='false', npm_config_audit='false', npm_config_update_notifier='false')


def check(name, ok, detail=''):
    results.append((name, bool(ok), str(detail)))
    print(('PASS ' if ok else 'FAIL ') + name + (f'  [{str(detail)[:400]}]' if detail and not ok else ''), flush=True)
    return bool(ok)


def step(title):
    print(f'\n== {title}', flush=True)


def run(cmd, cwd, timeout=900, quiet=True, env=None):
    """Run a command; its output comes back (and is printed when it fails)."""
    done = subprocess.run(cmd, cwd=cwd, env=env or ENV, capture_output=True, text=True, timeout=timeout, shell=isinstance(cmd, str))
    out = done.stdout + done.stderr
    if done.returncode and quiet:
        print(f'   $ {cmd if isinstance(cmd, str) else " ".join(map(str, cmd))}  (in {cwd}) exit {done.returncode}\n' + '\n'.join('   | ' + l for l in out.strip().split('\n')[-25:]))
    return done.returncode, out


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


def serve_folder(folder):
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(folder)))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s, f'http://127.0.0.1:{s.server_address[1]}/'


def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


# ---------- Chrome ----------

PROBE = r'''async (want) => {
  const out = {};
  await document.fonts.ready;
  out.font = document.fonts.check('16px Onest') && [...document.fonts].some(f => f.family.replace(/"/g, '') === 'Onest' && f.status === 'loaded');
  out.ink = getComputedStyle(document.body).color;
  const primary = document.querySelector('.tray-btn:not(.tray-btn--quiet):not(.tray-btn--ghost):not(.tray-btn--dark):not(.tray-btn--link):not(.tray-btn--danger)');
  out.button = primary ? getComputedStyle(primary).backgroundColor : null;
  out.sprite = !!document.getElementById('tray-sprite') && !!document.querySelector('#tray-sprite symbol');
  out.icons = [...document.querySelectorAll('svg.tray-icon use')].length;
  out.over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  return out;
}'''


class Browser:
    def __init__(self, p):
        self.b = p.chromium.launch(channel='chrome')

    def open(self, url, width, height=900):
        page = self.b.new_page(viewport={'width': width, 'height': height}, reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda e: errors.append(f'pageerror: {str(e)[:200]}'))
        # a resource that fails is reported by its answer below, with its address; the console's line for it says less
        page.on('console', lambda m: errors.append(f'console: {m.text[:200]}') if m.type == 'error' and not m.text.startswith('Failed to load resource') else None)
        page.on('requestfailed', lambda r: None if 'ERR_ABORTED' in (r.failure or '') else errors.append(f'failed: {r.url[-80:]}'))
        page.on('response', lambda r: errors.append(f'{r.status}: {r.url[-80:]}') if r.status >= 400 and not r.url.endswith('favicon.ico') else None)
        page.goto(url, wait_until='networkidle')
        page.wait_for_timeout(400)
        return page, errors

    def screen(self, label, url, width, wants, shot=None):
        """The checks every screen gets, and those asked for: tooltip, tabs, reveal."""
        page, errors = self.open(url, width)
        got = page.evaluate(PROBE, wants)
        check(f'{label} at {width}: the font Onest is loaded', got['font'])
        check(f'{label} at {width}: the tokens apply (ink text)', got['ink'] == 'rgb(20, 20, 20)', got['ink'])
        if 'button' in wants:
            check(f'{label} at {width}: the primary button is the yellow', got['button'] == 'rgb(255, 212, 38)', got['button'])
        check(f'{label} at {width}: the icon sprite is in the page', got['sprite'] and got['icons'] > 0, got)
        if width <= 400:
            check(f'{label} at {width}: nothing scrolls sideways', got['over'] <= 1, got['over'])
        if 'tooltip' in wants:
            anchor = page.locator('[data-tray~="tooltip"]').first
            anchor.hover()
            page.wait_for_timeout(800)
            bubble = page.evaluate("""(() => { const b = document.querySelector('[data-tray~="tooltip"] .tray-tooltip');
                return b ? { text: b.textContent.trim(), visible: b.checkVisibility() } : null })()""")
            check(f'{label} at {width}: the tooltip bubble shows on hover', bubble and bubble['visible'], bubble)
            page.mouse.move(1, 1)
        if 'tabs' in wants:
            tabs = page.locator('[role="tab"]')
            tabs.first.focus()
            page.keyboard.press('ArrowRight')
            page.wait_for_timeout(150)
            sel = page.evaluate("[...document.querySelectorAll('[role=tab]')].map(t => t.getAttribute('aria-selected'))")
            check(f'{label} at {width}: the tabs move with ArrowRight', sel[:2] == ['false', 'true'], sel)
        if 'reveal' in wants:
            before = page.evaluate("document.querySelector('#password').type")
            page.locator('[data-tray~="reveal"]').first.click()
            after = page.evaluate("document.querySelector('#password').type")
            check(f'{label} at {width}: the reveal button shows the password', before == 'password' and after == 'text', f'{before} -> {after}')
        if shot:
            page.screenshot(path=str(shot), full_page=True)
        check(f'{label} at {width}: no script error, console error or failed request', not errors, '; '.join(errors)[:500])
        page.close()


# ---------- the steps ----------

def cli(args, cwd, reg, env=None):
    code, out = run(['node', str(CLI)] + args + ['--registry', reg], cwd, env=env)
    return code, out


def fresh(folder):
    shutil.rmtree(folder, ignore_errors=True)
    folder.mkdir(parents=True)
    return folder


def local_package():
    """dist/ packed as npm would publish it, so the apps render with this build's stylesheet."""
    out = WORK / 'pack'
    fresh(out)
    code, text = run(['npm', 'pack', str(ROOT / 'dist'), '--pack-destination', str(out), '--silent'], WORK)
    tgz = next(out.glob('trayui-*.tgz'), None)
    if code or not tgz:
        raise SystemExit('npm pack of dist/ failed')
    return tgz


class NpmMirror(http.server.BaseHTTPRequestHandler):
    """An npm registry that holds one package, trayui, as this build packs it, and sends every other request on to
    registry.npmjs.org. The items name trayui@<version>, which npm has only once it is published: with this registry,
    init and shadcn install the version about to be released, so the check holds before the release as after it."""
    tgz, manifest = None, None
    UPSTREAM = 'https://registry.npmjs.org'

    def log_message(self, *a):
        pass

    def do_GET(self):
        port, name = self.server.server_address[1], self.manifest['name']
        if self.path.split('?')[0].rstrip('/') == f'/{name}':
            v = self.manifest['version']
            data = dict(self.manifest, _id=f'{name}@{v}', dist=dict(tarball=f'http://127.0.0.1:{port}/{name}/-/{self.tgz.name}', **self.server.digests))
            body = json.dumps({'name': name, 'dist-tags': {'latest': v}, 'versions': {v: data}}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
        elif self.path == f'/{name}/-/{self.tgz.name}':
            body = self.tgz.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', 'application/octet-stream')
        else:
            self.send_response(302)
            self.send_header('Location', self.UPSTREAM + self.path)
            self.end_headers()
            return
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)


def npm_mirror(tgz):
    """Serve tgz as the package trayui; the environment that points npm (and npx) at it."""
    import base64, hashlib
    raw = tgz.read_bytes()
    handler = type('Mirror', (NpmMirror,), {'tgz': tgz, 'manifest': json.loads((ROOT / 'dist' / 'package.json').read_text())})
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    s.digests = {'shasum': hashlib.sha1(raw).hexdigest(), 'integrity': 'sha512-' + base64.b64encode(hashlib.sha512(raw).digest()).decode()}
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s, dict(ENV, npm_config_registry=f'http://127.0.0.1:{s.server_address[1]}/')


def vite_app():
    """A fresh Vite react-ts app: made once (npm create vite, npm install) and reset to the template on every run."""
    base, app = WORK / 'vite-template', WORK / 'vite'
    if not (base / 'node_modules').exists():
        fresh(WORK / 'vite-make')
        code, _ = run('npm create vite@latest vite-template -- --template react-ts --no-interactive', WORK / 'vite-make')
        shutil.rmtree(base, ignore_errors=True)
        shutil.move(str(WORK / 'vite-make' / 'vite-template'), str(base))
        code, _ = run(['npm', 'install'], base)
        if code:
            raise SystemExit('npm install in the Vite template failed')
        # the template's own demo styles would restyle the page: a project that uses the system starts without them
        for f in ('src/App.css', 'src/index.css'):
            (base / f).unlink(missing_ok=True)
        main = base / 'src' / 'main.tsx'
        main.write_text(''.join(l for l in main.read_text().splitlines(True) if 'index.css' not in l))
    if not app.exists():
        shutil.copytree(base, app, symlinks=True)
    for f in ('package.json', 'package-lock.json', 'index.html', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json'):
        if (base / f).exists():
            shutil.copyfile(base / f, app / f)
    shutil.rmtree(app / 'src', ignore_errors=True)
    shutil.copytree(base / 'src', app / 'src')
    for f in ('trayui.json', 'dist'):
        p = app / f
        shutil.rmtree(p, ignore_errors=True) if p.is_dir() else p.unlink(missing_ok=True)
    run(['npm', 'install'], app)   # back to the template's packages
    return app


NEXT_LAYOUT = '''import type { ReactNode } from 'react';

export const metadata = { title: 'Tray UI in Next.js' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
'''


def next_app():
    base, app = WORK / 'next-template', WORK / 'next'
    if not (base / 'node_modules' / 'next').exists():
        fresh(base)
        (base / 'package.json').write_text(json.dumps({'name': 'trayui-next-check', 'private': True,
                                                       'scripts': {'build': 'next build', 'start': 'next start'}}, indent=2) + '\n')
        code, _ = run(['npm', 'install', 'next@latest', 'react@latest', 'react-dom@latest', 'typescript', '@types/react', '@types/react-dom', '@types/node'], base)
        if code:
            raise SystemExit('npm install of Next.js failed')
        (base / 'app').mkdir()
        (base / 'app' / 'layout.tsx').write_text(NEXT_LAYOUT)
        (base / 'app' / 'page.tsx').write_text('export default function Page() { return <main>Next.js</main>; }\n')
        code, _ = run(['npx', 'next', 'build'], base)   # writes tsconfig.json and next-env.d.ts, as a new app's first build does
        if code:
            raise SystemExit('the empty Next.js app does not build')
    if not app.exists():
        shutil.copytree(base, app, symlinks=True)
    for f in ('package.json', 'package-lock.json', 'tsconfig.json', 'next-env.d.ts'):
        if (base / f).exists():
            shutil.copyfile(base / f, app / f)
    for f in ('app', 'components', 'trayui.json', '.next'):
        p = app / f
        shutil.rmtree(p, ignore_errors=True) if p.is_dir() else p.unlink(missing_ok=True)
    shutil.copytree(base / 'app', app / 'app')
    run(['npm', 'install'], app)
    return app


VITE_APP = '''import { Button, Login01, Tabs, Tooltip } from './components/trayui';

export default function App() {
  return (
    <>
      <main className="tray-container tray-section tray-stack">
        <h1 className="title">Orders</h1>
        <Tabs label="Order" items={[{ value: 'items', label: 'Items', content: <p>Three jars</p> }, { value: 'delivery', label: 'Delivery', content: <p>Tomorrow</p> }]} />
        <div className="tray-row">
          <Tooltip tip="Copy the link">
            <Button variant="quiet" icon="copy" aria-label="Copy the link" />
          </Tooltip>
          <Button iconEnd="arrow-right">Order a jar</Button>
        </div>
      </main>
      <Login01 />
    </>
  );
}
'''

NEXT_PAGE = '''import { Button, Login01, Tabs, Tooltip } from '../components/trayui';

/* A Server Component: no 'use client' here. The copied components and the blocks bring their own. */
export default function Page() {
  return (
    <>
      <main className="tray-container tray-section tray-stack">
        <h1 className="title">Orders</h1>
        <Tabs label="Order" items={[{ value: 'items', label: 'Items', content: <p>Three jars</p> }, { value: 'delivery', label: 'Delivery', content: <p>Tomorrow</p> }]} />
        <div className="tray-row">
          <Tooltip tip="Copy the link">
            <Button variant="quiet" icon="copy" aria-label="Copy the link" />
          </Tooltip>
          <Button iconEnd="arrow-right">Order a jar</Button>
        </div>
      </main>
      <Login01 />
    </>
  );
}
'''

BLOCK_APP = '''import type { ComponentType } from 'react';
import * as Tray from './components/trayui';

/* One block, named in the address: ?b=Login01. */
export default function App() {
  const name = new URLSearchParams(location.search).get('b') ?? 'Login01';
  const Block = (Tray as unknown as Record<string, ComponentType>)[name];
  return Block ? <Block /> : <p>No block {name}</p>;
}
'''


def tsc_errors(out):
    return [l for l in out.split('\n') if 'error TS' in l]


def compare_blocks(browser, plain_url, react_url, names, out):
    from PIL import Image, ImageChops
    out.mkdir(parents=True, exist_ok=True)
    pascal = lambda n: ''.join(x[:1].upper() + x[1:] for x in n.split('-'))
    rows = []
    for name in names:
        shots, errs = {}, {}
        for side, url in (('html', f'{plain_url}{name}.html'), ('react', f'{react_url}index.html?b={pascal(name)}')):
            page, e = browser.open(url, 1280)
            page.evaluate('document.fonts.ready')
            page.wait_for_timeout(300)
            path = out / f'{name}-{side}.png'
            page.screenshot(path=str(path), full_page=True, animations='disabled')
            shots[side], errs[side] = path, e
            page.close()
        a, b = Image.open(shots['html']).convert('RGB'), Image.open(shots['react']).convert('RGB')
        w, h = min(a.width, b.width), min(a.height, b.height)
        d = ImageChops.difference(a.crop((0, 0, w, h)), b.crop((0, 0, w, h))).convert('L').point(lambda v: 255 if v > 24 else 0)
        share = d.histogram()[255] / (w * h)
        rows.append({'block': name, 'diff': round(share * 100, 2), 'h_html': a.height, 'h_react': b.height, 'errors_html': errs['html'], 'errors_react': errs['react']})
    (out / 'compare.json').write_text(json.dumps(rows, indent=1))
    return rows


def main():
    global CLI
    ap = argparse.ArgumentParser()
    ap.add_argument('--site', help='serve this folder (holding r/ and fonts/) instead of site/')
    ap.add_argument('--skip', default='', help='steps to leave out, comma-separated')
    ap.add_argument('--cli', default=str(ROOT / 'dist' / 'cli' / 'trayui.mjs'), help='the command to test (default: the packaged copy)')
    args = ap.parse_args()
    skip = set(filter(None, args.skip.split(',')))
    CLI = Path(args.cli)
    if CLI == ROOT / 'dist' / 'cli' / 'trayui.mjs' and (ROOT / 'cli' / 'trayui.mjs').read_text() != CLI.read_text():
        sys.exit('dist/cli/trayui.mjs is not the same as cli/trayui.mjs: run tools/build.py first (or pass --cli cli/trayui.mjs)')
    WORK.mkdir(parents=True, exist_ok=True)
    site = Path(args.site) if args.site else ROOT / 'site'
    if not (site / 'r' / 'registry.json').exists():
        sys.exit(f'{site}/r/registry.json is missing: build the site (tools/site.py), or write one with tools/registry.py --out')
    if args.site:
        server, url = serve_folder(site)
    else:
        from serve import serve
        server, url = serve()
    reg = url + 'r'
    names = [i['name'] for i in json.loads((site / 'r' / 'registry.json').read_text())['items']]
    blocks = sorted(i['name'] for i in json.loads((site / 'r' / 'html' / 'registry.json').read_text())['items'] if i['name'] != 'trayui')
    print(f'registry {reg}: {len(names)} React items, {len(blocks)} blocks; the command {CLI}; apps in {WORK}')

    if 'registry' not in skip:
        step('the registry against shadcn\'s schemas')
        problems = registry.validate(site / 'r')
        check(f'every item of r/ and r/html/ valid against registry-item.json and registry.json, and the registry whole', not problems, problems[:5])
        try:
            import jsonschema
            from referencing import Registry
            from referencing.jsonschema import DRAFT7
            sch = registry.Schemas()
            store = Registry().with_resources([(u, DRAFT7.create_resource(s)) for u, s in sch.store.items()])
            iv = jsonschema.Draft7Validator(sch.store[registry.SCHEMA_ITEM], registry=store)
            rv = jsonschema.Draft7Validator(sch.store[registry.SCHEMA_REG], registry=store)
            files = sorted((site / 'r').glob('*.json')) + sorted((site / 'r' / 'html').glob('*.json'))
            bad = [f'{p.name}: {e.message}' for p in files for e in (rv if p.name == 'registry.json' else iv).iter_errors(json.loads(p.read_text()))]
            check(f'the same {len(files)} files valid by the jsonschema library too', not bad, bad[:3])
        except ImportError:
            print('   (jsonschema is not installed: the cross-check is left out)')

    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = Browser(p)
        plain = WORK / 'plain'
        if not {'plain', 'updates'} <= skip:
            step('plain HTML: an empty folder, no package.json')
            fresh(plain)
            code, out = cli(['init'], plain, reg)
            check('init writes the three files, the font and the licences into trayui/', code == 0 and all((plain / 'trayui' / f).exists() for f in (
                'tokens.css', 'components/bundle.css', 'components/bundle.js', 'fonts/Onest-Variable.woff2', 'fonts/Onest-Variable.ttf', 'fonts/OFL.txt', 'LICENSE')), out[-300:])
            code, out = cli(['add', 'login-01', 'article-01', 'articles-01'], plain, reg)
            page = (plain / 'login-01.html').read_text() if (plain / 'login-01.html').exists() else ''
            check('add puts the blocks beside the pages, their links pointed at trayui/', code == 0 and 'href="trayui/tokens.css"' in page and 'src="trayui/components/bundle.js"' in page
                  and '../' not in re.sub(r'<script>.*?</script>', '', page, flags=re.S), out[-300:])
            nested = fresh(WORK / 'plain-nested')
            cli(['init'], nested, reg)
            code, out = cli(['add', 'login-01', '--pages', 'pages/account'], nested, reg)
            page = (nested / 'pages' / 'account' / 'login-01.html').read_text() if (nested / 'pages' / 'account' / 'login-01.html').exists() else ''
            check('with --pages a block in a folder further down links ../../trayui/', 'href="../../trayui/tokens.css"' in page, out[-200:])
            psrv, purl = serve_folder(plain)
            for w in (1440, 390):
                browser.screen('plain login-01', purl + 'login-01.html', w, {'button', 'reveal'}, WORK / f'plain-{w}.png')
                browser.screen('plain article-01', purl + 'article-01.html', w, set())
            psrv.shutdown()

        if 'updates' not in skip:
            step('updates: edits are kept, diff shows them, --overwrite replaces them, upstream changes reach untouched files')
            page = plain / 'login-01.html'
            page.write_text(page.read_text().replace('<title>', '<title>My shop: ', 1))
            code, out = cli(['update'], plain, reg)
            check('update keeps a file you changed, and says so', code == 0 and 'kept    login-01.html' in out and 'you changed it' in out and 'My shop' in page.read_text(), out[-300:])
            code, out = cli(['add', 'login-01'], plain, reg)
            check('add again keeps it too', 'kept    login-01.html' in out and 'My shop' in page.read_text())
            code, out = cli(['diff', 'login-01'], plain, reg)
            check('diff says it changed and shows the lines', code == 0 and 'changed by you' in out and '-<title>My shop: ' in out and '+<title>' in out and '@@ -' in out, out[-400:])
            code, out = cli(['add', 'login-01', '--overwrite'], plain, reg)
            check('--overwrite replaces it with the registry\'s', 'replace login-01.html' in out and 'My shop' not in page.read_text(), out[-200:])
            # a registry where two blocks changed upstream: one left alone here, one changed on both sides
            mod = WORK / 'registry-changed'
            shutil.rmtree(mod, ignore_errors=True)
            shutil.copytree(site / 'r', mod / 'r')
            for name in ('article-01', 'articles-01'):
                f = mod / 'r' / 'html' / f'{name}.json'
                item = json.loads(f.read_text())
                item['files'][0]['content'] = item['files'][0]['content'].replace('<title>', '<title>Changed upstream: ', 1)
                f.write_text(json.dumps(item))
            both = plain / 'articles-01.html'
            both.write_text(both.read_text().replace('</body>', '<!-- mine -->\n</body>', 1))
            code, out = run(['node', str(CLI), 'update', '--registry', str(mod / 'r')], plain)
            check('a change upstream reaches a file you left alone', 'update  article-01.html' in out and 'Changed upstream' in (plain / 'article-01.html').read_text(), out[-300:])
            check('a file changed here and upstream is kept', 'kept    articles-01.html' in out and '<!-- mine -->' in both.read_text())
            code, out = run(['node', str(CLI), 'diff', 'articles-01', '--registry', str(mod / 'r')], plain)
            check('diff names both changes', 'changed by you, changed upstream' in out, out[-300:])
            code, out = cli(['add', 'button'], plain, reg)
            check('asking for a React component in plain HTML says where its markup is', code == 1 and 'https://trayui.com/components/button' in out, out[-200:])
            code, out = cli(['add', 'logn-01'], plain, reg)
            check('an unknown name gets the names near it', code == 1 and 'login-01' in out, out[-200:])
            code, out = cli(['add', 'blog-01', '--dry-run'], plain, reg)
            check('--dry-run writes nothing', code == 0 and not (plain / 'blog-01.html').exists() and 'dry run' in out)

        if 'skill' not in skip:
            step('the agent skill, copied into a project')
            proj = fresh(WORK / 'skill')
            code, out = cli(['skill'], proj, reg)
            dest = proj / '.claude' / 'skills' / 'trayui'
            check('trayui skill copies SKILL.md, the references and the checker into .claude/skills/trayui', code == 0 and (dest / 'SKILL.md').exists()
                  and (dest / 'scripts' / 'check.mjs').exists() and (dest / 'scripts' / 'rules.json').exists(), out[-300:])
            if (dest / 'scripts' / 'check.mjs').exists() and (plain / 'login-01.html').exists():
                code, out = run(['node', str(dest / 'scripts' / 'check.mjs'), str(plain / 'login-01.html')], proj)
                check('the checker runs from the copied skill, and finds nothing in a block', code == 0 and 'no problems' in out, out[-200:])
            (dest / 'SKILL.md').write_text((dest / 'SKILL.md').read_text() + '\nMy own note.\n')
            code, out = cli(['skill'], proj, reg)
            check('trayui skill again keeps a SKILL.md you changed', 'kept    .claude/skills/trayui/SKILL.md' in out and 'My own note.' in (dest / 'SKILL.md').read_text(), out[-300:])
            code, out = cli(['skill', '--agents'], proj, reg)
            check('--agents puts it in .agents/skills/trayui', code == 0 and (proj / '.agents' / 'skills' / 'trayui' / 'SKILL.md').exists(), out[-200:])

        tgz = local_package() if not skip >= {'vite', 'next', 'types', 'compare'} else None
        npm_srv, npm_env = npm_mirror(tgz) if tgz else (None, None)   # trayui@<version> is this build, published or not
        vite = None
        if not skip >= {'vite', 'types', 'compare'}:
            step('React: a fresh Vite react-ts app')
            vite = vite_app()
            code, out = cli(['init'], vite, reg, npm_env)
            pkg = json.loads((vite / 'package.json').read_text())
            check('init in a Vite app writes the core, installs trayui and imports the stylesheet in src/main.tsx', code == 0 and (vite / 'src/components/trayui/lib/util.ts').exists()
                  and 'trayui' in pkg.get('dependencies', {}) and "import './components/trayui/styles';" in (vite / 'src/main.tsx').read_text(), out[-400:])
            code, out = cli(['add', 'button', 'tooltip', 'tabs', 'login-01'], vite, reg)
            check('add writes the components, what they share, the block and the index', code == 0 and all((vite / 'src/components/trayui' / f).exists() for f in (
                'components/Button.tsx', 'components/Tooltip.tsx', 'components/Tabs.tsx', 'blocks/Login01.tsx', 'index.ts')), out[-300:])
            if 'vite' not in skip:
                (vite / 'src' / 'App.tsx').write_text(VITE_APP)
                code, out = run(['npm', 'run', 'build'], vite)
                check('the Vite app builds (tsc -b and vite build)', code == 0, tsc_errors(out)[:5] or out[-300:])
                if code == 0:
                    vsrv, vurl = serve_folder(vite / 'dist')
                    for w in (1440, 390):
                        browser.screen('Vite', vurl + 'index.html', w, {'button', 'tooltip', 'tabs', 'reveal'}, WORK / f'vite-{w}.png')
                    vsrv.shutdown()
                # an edit to a React file is kept the same way
                btn = vite / 'src/components/trayui/components/Button.tsx'
                btn.write_text(btn.read_text() + '\n// mine\n')
                code, out = cli(['update', 'button'], vite, reg)
                check('in React too, update keeps a component you changed', 'kept    src/components/trayui/components/Button.tsx' in out and btn.read_text().endswith('// mine\n'), out[-300:])
                cli(['add', 'button', '--overwrite'], vite, reg)

        nxt = None
        if not skip >= {'next', 'types'}:
            step('React: a fresh Next.js app, the components in a Server Component')
            nxt = next_app()
            code, out = cli(['init'], nxt, reg, npm_env)
            check('init in a Next.js app writes components/trayui and imports the stylesheet in app/layout.tsx', code == 0 and (nxt / 'components/trayui/lib/util.ts').exists()
                  and "import '../components/trayui/styles';" in (nxt / 'app/layout.tsx').read_text(), out[-400:])
            code, out = cli(['add', 'button', 'tooltip', 'tabs', 'login-01', 'sidebar-14'], nxt, reg)
            check('add writes them under components/trayui', code == 0 and (nxt / 'components/trayui/blocks/Login01.tsx').exists(), out[-300:])
            if 'next' not in skip:
                (nxt / 'app' / 'page.tsx').write_text(NEXT_PAGE)
                (nxt / 'app' / 'dialog').mkdir(exist_ok=True)
                (nxt / 'app' / 'dialog' / 'page.tsx').write_text("import { Sidebar14 } from '../../components/trayui';\n\nexport default function Page() { return <Sidebar14 />; }\n")
                code, out = run(['npx', 'next', 'build'], nxt)
                check('the Next.js app builds (next build, with its type check)', code == 0, tsc_errors(out)[:5] or out[-500:])
                if code == 0:
                    port = free_port()
                    proc = subprocess.Popen(['npx', 'next', 'start', '-p', str(port)], cwd=nxt, env=ENV, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    try:
                        for _ in range(60):
                            try:
                                socket.create_connection(('127.0.0.1', port), timeout=1).close()
                                break
                            except OSError:
                                time.sleep(0.5)
                        nurl = f'http://127.0.0.1:{port}/'
                        for w in (1440, 390):
                            browser.screen('Next.js', nurl, w, {'button', 'tooltip', 'tabs', 'reveal'}, WORK / f'next-{w}.png')
                        page, errors = browser.open(nurl + 'dialog', 1440)
                        page.wait_for_timeout(500)
                        opened = page.evaluate("!!document.querySelector('dialog#settings[open]')")
                        check('Next.js: sidebar-14\'s script, which waits for the load event, still opens its dialog in React', opened and not errors, errors[:3])
                        page.close()
                    finally:
                        proc.terminate()
                        proc.wait(timeout=20)

        if 'types' not in skip and vite and nxt:
            step('every React item type-checked in both apps')
            every = [n for n in names]
            for label, app, cmd in (('Vite', vite, ['npx', 'tsc', '-p', 'tsconfig.app.json', '--noEmit']), ('Next.js', nxt, ['npx', 'tsc', '--noEmit'])):
                code, out = cli(['add', *every, '--no-install'], app, reg)
                where = app / ('src/components/trayui' if label == 'Vite' else 'components/trayui')
                count = sum(1 for _ in where.rglob('*.ts*'))
                check(f'{label}: all {len(every)} items added ({count} files)', code == 0 and (where / 'blocks' / 'Wiki03.tsx').exists(), out[-300:])
                code, out = run(cmd, app)
                errs = tsc_errors(out)
                check(f'{label}: tsc finds no error in any of them', code == 0 and not errs, errs[:8])

        if 'compare' not in skip and vite:
            step('all the blocks, React against HTML, in Chrome at 1280')
            allp = fresh(WORK / 'plain-all')
            cli(['init'], allp, reg)
            code, out = cli(['add', *blocks], allp, reg)
            if not (vite / 'src/components/trayui/blocks/Wiki03.tsx').exists():
                cli(['add', *blocks, '--no-install'], vite, reg)
            (vite / 'src' / 'App.tsx').write_text(BLOCK_APP)
            code, out = run(['npx', 'vite', 'build'], vite)
            if check('the Vite app with every block builds', code == 0, out[-300:]):
                a, aurl = serve_folder(allp)
                b, burl = serve_folder(vite / 'dist')
                rows = compare_blocks(browser, aurl, burl, blocks, WORK / 'compare')
                a.shutdown(); b.shutdown()
                off = [r for r in rows if not (r['diff'] < 0.5 and r['h_html'] == r['h_react'] and not r['errors_react'] and not r['errors_html'])]
                for r in off:
                    print(f"   {r['block']:14} {r['diff']:6.2f}% of pixels, height {r['h_html']}/{r['h_react']}, errors {r['errors_html'][:1]} {r['errors_react'][:1]}")
                check(f'{len(rows) - len(off)} of {len(rows)} blocks: the React component draws what the HTML page draws (under 0.5% of pixels, same height, no script error)', not off and len(rows) == len(blocks))

        browser.b.close()

    if 'shadcn' not in skip:
        step('the shadcn CLI, with the universal items')
        mirror = WORK / 'shadcn-site'
        shutil.rmtree(mirror, ignore_errors=True)
        port = free_port()
        mirror.mkdir(parents=True)
        registry.write(mirror, f'http://127.0.0.1:{port}/r')   # the dependencies' URLs must name this server for shadcn to follow them
        shutil.copytree(ROOT / 'dist' / 'fonts', mirror / 'fonts')
        s = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Quiet, directory=str(mirror)))
        threading.Thread(target=s.serve_forever, daemon=True).start()
        h = fresh(WORK / 'shadcn-html')
        code, out = run(['npx', '--yes', 'shadcn@latest', 'add', f'http://127.0.0.1:{port}/r/html/login-01.json', '--yes'], h, timeout=600)
        check('npx shadcn add of a plain HTML block writes the page and the three files', code == 0 and (h / 'trayui/blocks/login-01.html').exists() and (h / 'trayui/tokens.css').exists(), out[-400:])
        if vite:
            sv = WORK / 'shadcn-vite'
            shutil.rmtree(sv, ignore_errors=True)
            shutil.copytree(WORK / 'vite-template', sv, symlinks=True)
            code, out = run(['npx', '--yes', 'shadcn@latest', 'add', f'http://127.0.0.1:{port}/r/login-01.json', '--yes'], sv, timeout=600, env=npm_env)
            check('npx shadcn add of a React block writes it, the core, and adds trayui to package.json', code == 0 and (sv / 'src/components/trayui/blocks/Login01.tsx').exists()
                  and (sv / 'src/components/trayui/lib/util.ts').exists() and 'trayui' in json.loads((sv / 'package.json').read_text()).get('dependencies', {}), out[-400:])
        s.shutdown()

    server.shutdown()
    if npm_srv:
        npm_srv.shutdown()
    bad = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(bad)} of {len(results)} checks pass; screenshots in {WORK}')
    for name, _, detail in bad:
        print(' FAIL', name, '|', detail[:300])
    return 1 if bad else 0


CLI = None

if __name__ == '__main__':
    sys.exit(main())
