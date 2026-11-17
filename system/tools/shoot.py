#!/usr/bin/env python3
"""Render component previews the way the Design System page frames them, in both themes, and report problems.

    python3 tools/shoot.py                 every component
    python3 tools/shoot.py Button Tabs     only these
    python3 tools/shoot.py --sheet Name    also write .preview/sheets/Name-*.png: light and dark side by side
    python3 tools/shoot.py --themes all    render in every theme of tokens.json, not only Light and Dark (or --themes mint,forest)
    python3 tools/shoot.py --fit           first set each marker's height to what the preview needs
    python3 tools/shoot.py --media forced  render as a person who asked for it would see them: forced (Windows high contrast,
                                           the colours forced on the page), contrast (more contrast) or print; the pictures
                                           are named <Name>.<theme>.<media>.png

A preview is loaded from its own path with tokens.css, bundle.css and bundle.js already in place and
<html data-theme> set, as the page's frame does. Reports script errors, blank renders, sideways overflow
and text that falls below 4.5:1 against its own background.
"""
import json, pathlib, re, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
P, PREV = ROOT / 'project', ROOT / '.preview'
SHOTS, SHEETS = PREV / 'shots', PREV / 'sheets'
WIDTH = 920

CONTRAST_JS = r"""
() => {
  const lum = (r, g, b) => { const f = (c) => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const parse = (s) => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : null; };
  const over = (top, under) => { const a = top[3] === undefined ? 1 : top[3]; return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)); };
  /* the chosen item of a segmented control or a strip of tabs has no fill of its own: the sliding pill behind it is its ground */
  const CHOSEN = '.tray-seg[data-glide] input:checked + span, .tray-tabs[data-glide] [aria-selected="true"], .tray-tabs[data-glide] [aria-current]:not([aria-current="false"])';
  const pillOf = (n) => { const p = n.matches(CHOSEN) && n.closest('[data-glide]').querySelector(':scope > .tray-glide'); return p && getComputedStyle(p).display !== 'none' ? parse(getComputedStyle(p).backgroundColor) : null; };
  const bgOf = (el) => { const stack = []; for (let n = el; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor), p = pillOf(n);
    /* a chosen item's own fill, still fading out as its strip takes the pill, lies over the pill */
    if (c && (c[3] === undefined || c[3] > 0)) { stack.push(c); if (c[3] === undefined || c[3] === 1) break; }
    if (p) { stack.push(p); if (p[3] === undefined || p[3] === 1) break; } }
    let base = [255, 255, 255]; for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base); return base; };
  const bad = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node; (node = walker.nextNode());) {
    const text = node.textContent.trim(); if (!text) continue;
    const el = node.parentElement; const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < .5) continue;
    if (el.closest('[hidden], [disabled], [aria-disabled="true"], [inert], .tray-skeleton, .tray-vh, svg, script, style, [data-no-contrast]')) continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const fg = parse(cs.color); if (!fg) continue;
    const bg = bgOf(el); const c = over(fg, bg);
    const l1 = lum(...c), l2 = lum(...bg); const ratio = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    if (ratio < need - .05) bad.push(`${ratio.toFixed(2)}:1 "${text.slice(0, 28)}" <${el.tagName.toLowerCase()} class="${(el.className.baseVal ?? el.className).toString().slice(0, 40)}">`);
  }
  return [...new Set(bad)].slice(0, 8);
}
"""


def main(argv):
    sheet = None
    fit = '--fit' in argv
    argv = [a for a in argv if a != '--fit']
    if '--sheet' in argv:
        i = argv.index('--sheet'); sheet = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
    themes, media = ['light', 'dark'], None
    if '--media' in argv:
        i = argv.index('--media'); media = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
        if media not in ('forced', 'contrast', 'print'):
            sys.exit('--media is forced, contrast or print')
    emulate = {'forced': {'forced_colors': 'active'}, 'contrast': {'contrast': 'more'}, 'print': {'media': 'print'}}.get(media, {})
    if '--themes' in argv:  # --themes all, or --themes mint,forest: the other themes of tokens.json
        i = argv.index('--themes'); want = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
        every = [t['id'] for t in json.loads((P / 'tokens.json').read_text(encoding='utf-8'))['color']['themes']]
        themes = every if want == 'all' else [t for t in want.split(',') if t in every]
    names = argv or sorted(d.name for d in (P / 'components').iterdir() if (d / 'preview.html').exists())
    tokens = (PREV / 'tokens.css').read_text(encoding='utf-8')
    css = (ROOT / 'dist' / 'components' / 'bundle.css').read_text(encoding='utf-8')
    js = (ROOT / 'dist' / 'components' / 'bundle.js').read_text(encoding='utf-8')
    SHOTS.mkdir(parents=True, exist_ok=True); SHEETS.mkdir(parents=True, exist_ok=True)
    report, tiles, needs = [], [], {}
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        for theme in themes:
            ctx = b.new_context(viewport={'width': WIDTH, 'height': 600}, reduced_motion='reduce')
            ctx.add_init_script('(() => { const boot = () => { const d = document.documentElement; if (!d) return false; d.setAttribute("data-theme", ' + json.dumps(theme) + ');'
                                ' for (const t of ' + json.dumps([tokens, css]) + ') { const s = document.createElement("style"); s.textContent = t; d.appendChild(s); } return true; };'
                                ' if (!boot()) new MutationObserver((_, o) => { if (boot()) o.disconnect(); }).observe(document, { childList: true }); })();')
            ctx.add_init_script(js)
            for name in names:
                path = P / 'components' / name / 'preview.html'
                marker = path.read_text(encoding='utf-8').split('\n', 1)[0]
                height = int(re.search(r'height=(\d+)', marker).group(1))
                wide = re.search(r'width=(\d+)', marker)  # a preview laid out wider than the card, which the page scales down
                width = int(wide.group(1)) if wide else WIDTH
                pg = ctx.new_page(); errs = []
                if emulate: pg.emulate_media(**emulate)
                pg.on('pageerror', lambda e: errs.append(str(e)[:160])); pg.on('console', lambda m: errs.append(m.text[:160]) if m.type == 'error' and 'Unsafe attempt to load URL file:' not in m.text else None)  # a file:// page may not load captions (.vtt) from a file; over http it does
                pg.set_viewport_size({'width': width, 'height': 40})
                pg.goto(path.as_uri(), wait_until='load'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(250)
                m = pg.evaluate('({w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, cw: document.documentElement.clientWidth, b: Math.ceil(document.body.getBoundingClientRect().height)})')
                if m['h'] > m['b'] + 1: m['h'] += 24  # something floats past the end of the body: leave room for its shadow
                needs[name] = max(needs.get(name, 0), m['h'])
                pg.set_viewport_size({'width': width, 'height': max(height, m['h']) if fit or media else height}); pg.wait_for_timeout(120)
                out = SHOTS / (f'{name}.{theme}.{media}.png' if media else f'{name}.{theme}.png')
                # a picture of the whole page drops what is emulated (Chromium resets it with the size), so with a medium the
                # window takes the height of the page and the picture is of the window
                pg.screenshot(path=str(out), full_page=not media)
                im = Image.open(out).convert('RGB')
                colours = im.resize((64, 64)).getcolors(4096) or []
                notes = list(errs)
                if len(colours) < 4: notes.append('looks blank')
                if m['w'] > m['cw'] + 1: notes.append(f'overflows sideways: {m["w"]}px in {m["cw"]}px')
                # the cover fills its frame, so it has no height of its own to measure
                if m['h'] > height + 2 and not fit and not media and name != 'Cover': notes.append(f'taller than its card: {m["h"]}px, marker says {height}')
                if media != 'forced':  # with the colours forced, contrast is the system's, not the page's
                    notes += ['contrast ' + c for c in pg.evaluate(CONTRAST_JS)]
                for n in notes: report.append(f'{name} [{theme}] {n}')
                tiles.append((name, theme, out)); pg.close()
            ctx.close()
        b.close()
    if fit:
        for name, h in needs.items():
            if name == 'Cover': continue  # a design tool's cover card, where there is one (see COVER in build.py), is always 288px tall
            path = P / 'components' / name / 'preview.html'; text = path.read_text(encoding='utf-8')
            new = re.sub(r'height=\d+', f'height={min(4000, max(40, h))}', text, count=1)
            if new != text: path.write_text(new, encoding='utf-8')
    print(f'rendered {len(names)} previews in {len(themes)} themes; {len(report)} notes')
    for r in report: print(' -', r)
    if sheet:
        rows = []
        for name in names:
            pair = [Image.open(o).convert('RGB') for n, t, o in tiles if n == name]
            pair = [i if i.size[0] == WIDTH else i.resize((WIDTH, round(i.size[1] * WIDTH / i.size[0]))) for i in pair]
            h = max(i.size[1] for i in pair); row = Image.new('RGB', (WIDTH * 2 + 12, h + 30), '#7a7a7a')
            ImageDraw.Draw(row).text((8, 8), name, fill='white')
            for k, i in enumerate(pair): row.paste(i, (k * (WIDTH + 12), 30))
            rows.append(row)
        page, y, n = [], 0, 1
        def flush():
            nonlocal page, y, n
            if not page: return
            s = Image.new('RGB', (WIDTH * 2 + 12, y), '#7a7a7a'); yy = 0
            for r in page: s.paste(r, (0, yy)); yy += r.size[1] + 10
            f = SHEETS / f'{sheet}-{n}.png'; s.save(f); print('sheet', f, s.size); page, y, n = [], 0, n + 1
        for r in rows:
            if page and y + r.size[1] > 2300: flush()
            page.append(r); y += r.size[1] + 10
        flush()
    return 1 if report and not fit else 0  # a note is a failure; --fit only writes the heights


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
