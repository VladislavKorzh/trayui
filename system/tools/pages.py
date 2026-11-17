#!/usr/bin/env python3
"""Render the blocks as the pages they are, at three window widths in both themes, and report problems.

    python3 tools/pages.py                      every block
    python3 tools/pages.py sidebar-03 shop-01   only these (file names without .html)
    python3 tools/pages.py --sheet NAME ...     also write .preview/pages/sheets/NAME-*.png: every page, all its pictures side by side
    python3 tools/pages.py --open ID ...        click the first thing that opens something before the picture (a block shown open)

It copies project/blocks/*.html into dist/ and serves dist/ on a local port, so a page loads
tokens.css, the bundle and the font exactly as it will in a project. Pictures go to .preview/pages/<id>.<width>.<theme>.png
(whole page). Reports script errors, files that do not load, sideways scroll, text under 4.5:1, a missing title,
description or category, ids used twice, and a page with no h1 or more than one.
"""
import functools, http.server, json, pathlib, re, shutil, sys, threading
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
from shoot import CONTRAST_JS

ROOT = pathlib.Path(__file__).resolve().parent.parent
P, DIST, OUT = ROOT / 'project', ROOT / 'dist', ROOT / '.preview' / 'pages'
KINDS = ('blocks',)
SIZES = [(1280, 800), (768, 1024), (390, 844)]

FACTS_JS = r"""
() => {
  const ids = [...document.querySelectorAll('[id]')].map((e) => e.id).filter((id) => id !== 'tray-sprite' && !/^tray-/.test(id));
  const twice = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  const d = document.documentElement;
  const wide = [];
  if (d.scrollWidth > d.clientWidth + 1) {
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > d.clientWidth + 1 && !el.closest('dialog:not([open]), [hidden]')) { wide.push(`<${el.tagName.toLowerCase()} class="${(el.className.baseVal ?? el.className).toString().slice(0, 50)}"> to ${Math.round(r.right)}px`); if (wide.length > 2) break; }
    }
  }
  return { w: d.scrollWidth, cw: d.clientWidth, h1: document.querySelectorAll('h1').length, twice, wide,
           unnamed: [...document.querySelectorAll('button, a[href]')].filter((b) => !b.closest('[hidden], dialog:not([open])') && !(b.textContent.trim() || b.getAttribute('aria-label') || b.getAttribute('aria-labelledby') || b.title)).length };
}
"""


def sync():
    """dist/ gets the current pages; returns {id: (kind, path in dist)}."""
    found = {}
    for kind in KINDS:
        (DIST / kind).mkdir(parents=True, exist_ok=True)
        for old in (DIST / kind).glob('*.html'):
            if not (P / kind / old.name).exists():
                old.unlink()
        for f in sorted((P / kind).glob('*.html')):
            shutil.copyfile(f, DIST / kind / f.name)
            found[f.stem] = (kind, DIST / kind / f.name)
    return found


def meta(text):
    get = lambda name: (re.search(rf'<meta name="{name}" content="([^"]*)"', text) or [None, ''])[1]
    title = re.search(r'<title>([^<]*)</title>', text)
    return {'title': title.group(1).strip() if title else '', 'description': get('description'), 'category': get('tray-category')}


def main(argv):
    sheet, opened = None, set()
    if '--sheet' in argv:
        i = argv.index('--sheet'); sheet = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
    while '--open' in argv:
        i = argv.index('--open'); opened.add(argv[i + 1]); argv = argv[:i] + argv[i + 2:]
    found = sync()
    themes = ['light', 'dark']
    if '--themes' in argv:  # --themes all, or --themes mint,forest: the other themes of tokens.json
        i = argv.index('--themes'); want = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
        every = [t['id'] for t in json.loads((P / 'tokens.json').read_text(encoding='utf-8'))['color']['themes']]
        themes = every if want == 'all' else [t for t in want.split(',') if t in every]
    ids = argv or sorted(found)
    missing = [i for i in ids if i not in found]
    if missing:
        sys.exit(f'no such page: {" ".join(missing)}')
    OUT.mkdir(parents=True, exist_ok=True)
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
        def do_GET(self):
            if self.path == '/favicon.ico':  # the browser asks for one by itself
                self.send_response(204); self.end_headers(); return
            super().do_GET()
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(DIST)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_address[1]}'
    report, shots = [], {}
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        for ident in ids:
            kind, path = found[ident]
            text = path.read_text(encoding='utf-8')
            m = meta(text)
            for key in ('title', 'description', 'category'):
                if not m[key]:
                    report.append(f'{ident} no {key}: add <title> or <meta name="{"description" if key == "description" else "tray-category"}">' if key != 'title' else f'{ident} no <title>')
            for url in re.findall(r'(?:src|href)="(https?://[^"]+)"', text):
                report.append(f'{ident} loads {url}: a page loads only the three files of the system')
            for theme in themes:
                for width, height in SIZES:
                    ctx = b.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
                    ctx.add_init_script('new MutationObserver((_, o) => { if (document.documentElement) { document.documentElement.setAttribute("data-theme", ' + json.dumps(theme) + '); o.disconnect(); } }).observe(document, { childList: true });')
                    pg = ctx.new_page(); errs = []
                    pg.on('pageerror', lambda e: errs.append('script: ' + str(e)[:160]))
                    pg.on('console', lambda msg: errs.append('console: ' + msg.text[:160]) if msg.type == 'error' else None)
                    pg.on('requestfailed', lambda r: errs.append('does not load: ' + r.url.replace(base, '')))
                    pg.on('response', lambda r: errs.append(f'{r.status}: ' + r.url.replace(base, '')) if r.status >= 400 else None)
                    pg.goto(f'{base}/{kind}/{ident}.html', wait_until='load'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(300)
                    pg.evaluate('document.documentElement.setAttribute("data-theme", ' + json.dumps(theme) + ')')
                    if ident in opened:
                        pg.evaluate('''() => { const t = document.querySelector('[data-open-first]') || document.querySelector('[data-tray~="open"], [data-tray~="popover"] > button, [data-tray~="menu"] > button'); if (t) t.click(); }''')
                        pg.wait_for_timeout(250)
                    f = pg.evaluate(FACTS_JS)
                    notes = list(dict.fromkeys(errs))
                    if f['w'] > f['cw'] + 1:
                        notes.append(f'scrolls sideways: {f["w"]}px in {f["cw"]}px' + (' (' + '; '.join(f['wide']) + ')' if f['wide'] else ''))
                    if width == SIZES[0][0] and theme == 'light':
                        if f['h1'] != 1: notes.append(f'{f["h1"]} h1 elements: a page has exactly one (tray-vh hides it when the design shows none)')
                        if f['twice']: notes.append('ids used twice: ' + ', '.join(f['twice'][:6]))
                        if f['unnamed']: notes.append(f'{f["unnamed"]} button(s) or link(s) with no text and no aria-label')
                    notes += ['contrast ' + c for c in pg.evaluate(CONTRAST_JS)]
                    out = OUT / f'{ident}.{width}.{theme}.png'
                    pg.screenshot(path=str(out), full_page=True)
                    if len(Image.open(out).convert('RGB').resize((64, 64)).getcolors(4096) or []) < 4: notes.append('looks blank')
                    for n in notes: report.append(f'{ident} [{width} {theme}] {n}')
                    shots.setdefault(ident, []).append(out)
                    ctx.close()
        b.close()
    server.shutdown()
    print(f'rendered {len(ids)} page(s) at {len(SIZES)} widths in {len(themes)} themes -> {OUT.relative_to(ROOT)}/<id>.<width>.<theme>.png; {len(report)} note(s)')
    for r in report: print(' -', r)
    if sheet:
        (OUT / 'sheets').mkdir(exist_ok=True)
        for old in (OUT / 'sheets').glob(f'{sheet}-*.png'): old.unlink()
        rows = []
        for ident in ids:
            want = [(1280, 'light', 640), (1280, 'dark', 640), (768, 'light', 300), (390, 'light', 170), (390, 'dark', 170)]
            ims = []
            for w, th, tw in want:
                im = Image.open(OUT / f'{ident}.{w}.{th}.png').convert('RGB')
                im = im.resize((tw, max(1, round(im.size[1] * tw / im.size[0]))))
                ims.append(im.crop((0, 0, tw, min(im.size[1], 1500))))
            h = max(i.size[1] for i in ims)
            row = Image.new('RGB', (sum(i.size[0] for i in ims) + 10 * (len(ims) + 1), h + 34), '#7a7a7a')
            ImageDraw.Draw(row).text((10, 10), f'{ident}: 1280 light, 1280 dark, 768 light, 390 light, 390 dark', fill='white')
            x = 10
            for im in ims: row.paste(im, (x, 28)); x += im.size[0] + 10
            rows.append(row)
        page, y, n = [], 0, 1
        def flush():
            nonlocal page, y, n
            if not page: return
            s = Image.new('RGB', (max(r.size[0] for r in page), y), '#7a7a7a'); yy = 0
            for r in page: s.paste(r, (0, yy)); yy += r.size[1] + 8
            f = OUT / 'sheets' / f'{sheet}-{n}.png'; s.save(f); print('sheet', f.relative_to(ROOT), s.size); page, y, n = [], 0, n + 1
        for r in rows:
            if page and y + r.size[1] > 2400: flush()
            page.append(r); y += r.size[1] + 8
        flush()
    return 1 if report else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
