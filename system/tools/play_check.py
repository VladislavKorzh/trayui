#!/usr/bin/env python3
"""Check the playgrounds of the site: render every choice of every playground and report what is wrong.

    python3 tools/play_check.py                  every playground in tools/site/play/
    python3 tools/play_check.py Button Alert     only these
    python3 tools/play_check.py --sheet NAME     also write .preview/play/NAME-*.png: every choice of each, side by side

Each playground is rendered by tools/site/playground.js, the script the site runs, in a page with tokens.css, the
bundle and its script: first as it starts, then with each control moved one at a time (each option, a switch on, a
long text, a range at both ends), and as it starts on the other grounds and in the dark theme. It reports a class
that is not in the stylesheet, an unknown icon, a template that leaves {{…}} behind, a script error, something that
draws nothing or runs past the stage, and text under 4.5:1. Run tools/build.py first.
"""
import functools, http.server, json, pathlib, re, sys, threading
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
from shoot import CONTRAST_JS

ROOT = pathlib.Path(__file__).resolve().parent.parent
P, DIST, PLAY, OUT = ROOT / 'project', ROOT / 'dist', ROOT / 'tools' / 'site' / 'play', ROOT / '.preview' / 'play'
ENGINE = ROOT / 'tools' / 'site' / 'playground.js'
WIDTH = 560  # about the stage's width beside the controls at 1280
LONG = 'A much longer text than anyone would write here, to see where it wraps'

HARNESS = '''<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/components/bundle.css"><link rel="stylesheet" href="/__site.css"></head>
<body style="margin: 0"><div id="stage" class="site-play__stage" style="inline-size: ''' + str(WIDTH) + '''px; box-sizing: border-box"></div>
<script src="/components/bundle.js"></script><script src="/__playground.js"></script></body></html>'''

DRAW = '''([spec, values, ground]) => {
  const g = TrayPlay.GROUNDS.filter((x) => x[0] === ground)[0], stage = document.getElementById('stage');
  stage.style.setProperty('--play-w', spec.width || '30rem');
  const html = TrayPlay.render(spec, values);
  stage.innerHTML = '<div class="site-play__ground ' + g[2] + '">' + html + '</div>';
  TrayUI.init(stage);
  const root = stage.firstElementChild, first = root.firstElementChild, r = first ? first.getBoundingClientRect() : { width: 0, height: 0 };
  let wide = 0;
  for (const el of root.querySelectorAll('*')) { const b = el.getBoundingClientRect(); if (b.width && !el.closest('[hidden], dialog:not([open])')) wide = Math.max(wide, b.right - stage.getBoundingClientRect().right); }
  return { html, w: r.width, h: r.height, over: Math.round(wide), scroll: stage.scrollWidth - stage.clientWidth };
}'''


def variants(spec):
    """(label, values, ground): as it starts, then each control moved on its own, then the other grounds."""
    base = {}
    for c in spec['controls']:
        kind = c.get('type', 'choice')
        if 'default' in c: base[c['name']] = ('on' if c['default'] else '') if kind == 'switch' else str(c['default'])
        else: base[c['name']] = str(c['options'][0][0]) if kind == 'choice' else str(c['min']) if kind == 'range' else ''
    out = [('as it starts', dict(base), 'page')]
    for c in spec['controls']:
        kind, name = c.get('type', 'choice'), c['name']
        moves = ([(str(o[0]), o[1]) for o in c['options']] if kind == 'choice' else [('' if base[name] else 'on', 'on' if not base[name] else 'off')] if kind == 'switch'
                 else [(LONG[:c.get('max', 60)], 'long text'), ('', 'empty')] if kind == 'text' else [(str(c['min']), str(c['min'])), (str(c['max']), str(c['max']))])
        for value, label in moves:
            if value != base[name]:
                out.append((f'{c["label"]}: {label}', dict(base, **{name: value}), 'page'))
    if spec.get('grounds') is not False:
        # every choice again on every other ground the playground offers: a fill that works on the page may not on the ink card
        grounds = [g for g in ('tray', 'ink', 'accent') if not isinstance(spec.get('grounds'), list) or g in spec['grounds']]
        out += [(f'{label}, on {g}' if label != 'as it starts' else f'on {g}', values, g) for g in grounds for label, values, _ in list(out)
                if not label.endswith('long text') and not label.endswith('empty')]
    return out


def main(argv):
    sheet = None
    if '--sheet' in argv:
        i = argv.index('--sheet'); sheet = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
    files = [PLAY / f'{n}.json' for n in argv] if argv else sorted(PLAY.glob('*.json'))
    css = (DIST / 'components' / 'bundle.css').read_text(encoding='utf-8')
    icons = set(json.loads((ROOT / 'src' / 'icons.json').read_text(encoding='utf-8')))
    site_css = (ROOT / 'tools' / 'site' / 'site.css').read_text(encoding='utf-8')
    known = lambda cls: re.search(r'\.' + re.escape(cls) + r'(?![A-Za-z0-9_-])', css)

    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
        def do_GET(self):
            body = {'/__play.html': (HARNESS, 'text/html'), '/__playground.js': (ENGINE.read_text(encoding='utf-8'), 'text/javascript'), '/__site.css': (site_css, 'text/css')}.get(self.path)
            if body:
                data = body[0].encode(); self.send_response(200); self.send_header('Content-Type', body[1] + '; charset=utf-8'); self.send_header('Content-Length', str(len(data))); self.end_headers(); self.wfile.write(data); return
            super().do_GET()
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(DIST)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_address[1]}'
    report, tiles, count = [], {}, 0
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': WIDTH + 40, 'height': 900}, reduced_motion='reduce')
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:160]))
        pg.on('console', lambda m: errs.append(m.text[:160]) if m.type == 'error' else None)
        pg.goto(base + '/__play.html', wait_until='load'); pg.evaluate('document.fonts.ready')
        for f in files:
            name = f.stem
            try:
                spec = json.loads(f.read_text(encoding='utf-8'))
            except ValueError as e:
                report.append(f'{name}: not JSON: {e}'); continue
            for theme in ('light', 'dark'):
                pg.evaluate('t => document.documentElement.setAttribute("data-theme", t)', theme)
                runs = variants(spec) if theme == 'light' else [(f'{label}, dark theme', values, ground) for label, values, ground in variants(spec)]
                for label, values, ground in runs:
                    del errs[:]
                    r = pg.evaluate(DRAW, [spec, values, ground]); count += 1
                    where = f'{name} [{label}]'
                    if '{{' in r['html'] or '}}' in r['html']: report.append(f'{where}: the template leaves {{{{…}}}} in the markup')
                    for cls in sorted({c for v in re.findall(r'class="([^"]*)"', r['html']) for c in v.split() if c.startswith('tray-')}):
                        if not known(cls): report.append(f'{where}: class {cls} is not in the stylesheet')
                    for ic in re.findall(r'#tray-i-([a-z0-9-]+)', r['html']):
                        if ic not in icons: report.append(f'{where}: unknown icon {ic}')
                    if re.search(r'style="[^"]*(?:#[0-9a-fA-F]{3,8}\b|rgba?\(|color\s*:|font)', r['html']): report.append(f'{where}: an inline style sets a colour or a font')
                    if r['w'] < 2 or r['h'] < 2: report.append(f'{where}: draws nothing ({r["w"]:.0f}x{r["h"]:.0f})')
                    if r['over'] > 1 or r['scroll'] > 1: report.append(f'{where}: runs {max(r["over"], r["scroll"])}px past a stage {WIDTH}px wide')
                    for e in errs: report.append(f'{where}: script error: {e}')
                    for c in pg.evaluate(CONTRAST_JS): report.append(f'{where}: contrast {c}')
                    if sheet and theme == 'light':
                        shot = OUT / f'{name}.{len(tiles.get(name, []))}.png'
                        pg.locator('#stage').screenshot(path=str(shot)); tiles.setdefault(name, []).append((label, shot))
        b.close()
    server.shutdown()
    report = list(dict.fromkeys(report))
    print(f'play: {len(files)} playground(s), {count} renders; {len(report)} problem(s)')
    for r in report: print(' -', r)
    if sheet:
        for old in OUT.glob(f'{sheet}-*.png'): old.unlink()
        T, n = 300, 1
        for name, items in tiles.items():
            ims = [(label, Image.open(f).convert('RGB')) for label, f in items]
            ims = [(label, im.resize((T, max(1, round(im.size[1] * T / im.size[0]))))) for label, im in ims]
            cols = 6; rows = [ims[i:i + cols] for i in range(0, len(ims), cols)]
            hs = [max(im.size[1] for _, im in row) + 22 for row in rows]
            s = Image.new('RGB', (cols * (T + 8) + 8, sum(hs) + 30 + 8 * len(rows)), '#7a7a7a'); d = ImageDraw.Draw(s)
            d.text((8, 8), name, fill='white'); y = 30
            for row, h in zip(rows, hs):
                for k, (label, im) in enumerate(row):
                    x = 8 + k * (T + 8); d.text((x, y), label[:46], fill='white'); s.paste(im, (x, y + 16))
                y += h + 8
            out = OUT / f'{sheet}-{n:02d}-{name}.png'; s.save(out); n += 1
        print(f'sheets: {OUT.relative_to(ROOT)}/{sheet}-*.png')
    return 1 if report else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
