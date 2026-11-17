#!/usr/bin/env python3
"""The picture a link to the site shows in a chat or on a social site (og:image): a card of 1200 by 630 for every page.

tools/site.py calls make() once it has written site/. Each card is drawn by the system itself, in Chrome through
Playwright: the page's name and its section on the grey tray, and beside them the component's live preview, or the
top of a block in a frame; a page with nothing to show gets the mark instead, and the home page a yellow card. Cards
are kept in .cache/og/ under a hash of what they show and of the three files, so a build draws only what changed.
They are written to site/_/og/, each name with that hash in it, which lets the host keep them for a year.

Without Playwright or Chrome the site is built without cards, and says so.
"""
import asyncio, hashlib, html, json, pathlib, shutil, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache' / 'og'
W, H = 1200, 630
VERSION = '2'  # change it to draw every card again after the look of the cards changes
TYPES = {'.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.svg': 'image/svg+xml',
         '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.vtt': 'text/vtt'}

MARK = ('<svg class="og__mark" viewBox="0 0 32 32" aria-hidden="true"><rect class="og__tile" width="32" height="32" rx="10"/>'
        '<rect class="og__bar" x="8" y="14" width="16" height="10" rx="4"/></svg>')

STYLE = '''
html, body { margin: 0; }
body { inline-size: 1200px; block-size: 630px; overflow: hidden; background: var(--surface); color: var(--ink); font-family: var(--font-sans); }
.og { box-sizing: border-box; display: grid; grid-template-columns: 450px minmax(0, 1fr); gap: 36px; inline-size: 1200px; block-size: 630px; padding: 48px; }
.og--wide { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: 28px; }
.og__text { display: flex; flex-direction: column; justify-content: space-between; min-inline-size: 0; padding: 4px 0 8px; }
.og--wide .og__text { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 32px; padding: 0; }
.og__brand { display: flex; align-items: center; gap: 14px; font: 700 36px/1 var(--font-sans); letter-spacing: -.04em; }
.og__mark { inline-size: 1.25em; block-size: 1.25em; flex: none; }
.og__tile { fill: var(--accent); }
.og__bar { fill: var(--on-accent); }
.og__kind { margin: 0 0 12px; color: var(--ink-soft); font: 500 28px/1.2 var(--font-sans); }
.og__title { margin: 0; font: 700 68px/1.03 var(--font-sans); letter-spacing: -.035em; overflow-wrap: break-word; }
.og--wide .og__title { font-size: 56px; }
.og__line { margin: 18px 0 0; color: var(--ink-soft); font: 400 26px/1.35 var(--font-sans); }
.og__show { position: relative; display: grid; place-items: center; min-inline-size: 0; min-block-size: 0; border-radius: 40px; background: var(--page); overflow: hidden; }
.og__fit { position: absolute; inset-block-start: 50%; inset-inline-start: 50%; box-sizing: border-box; padding: 24px; transform: translate(-50%, -50%); transform-origin: center; }
.og__frame { position: absolute; inset-block-start: 0; inset-inline-start: 0; border: 0; inline-size: 1280px; block-size: 800px; transform-origin: 0 0; }
.og__big { inline-size: 300px; block-size: 300px; }
.og--home { background: var(--accent); color: var(--on-accent); grid-template-columns: minmax(0, 1fr); }
.og--home .og__text { justify-content: space-between; }
.og--home .og__tile { fill: var(--on-accent); }
.og--home .og__bar { fill: var(--accent); }
.og--home .og__title { font-size: 96px; max-inline-size: 15ch; }
.og--home .og__line { color: var(--on-accent); }
'''

FIT = '''() => {
  const box = document.querySelector('.og__show'); if (!box) return;
  const frame = box.querySelector('.og__frame');
  if (frame) { frame.style.transform = 'scale(' + box.clientWidth / 1280 + ')'; return; }
  const fit = box.querySelector('.og__fit'); if (!fit) return;
  /* what the preview really takes, overflow included */
  const w = Math.max(fit.offsetWidth, fit.scrollWidth), h = Math.max(fit.offsetHeight, fit.scrollHeight);
  if (w > fit.offsetWidth) fit.style.inlineSize = w + 'px';
  const k = Math.min(1, (box.clientWidth - 16) / w, (box.clientHeight - 16) / h);
  fit.style.transform = 'translate(-50%, -50%) scale(' + k + ')';
}'''


def card_doc(card, files):
    """The card as a page of its own, linking the three files from the fake origin the browser is given."""
    head = ''.join(f'<link rel="stylesheet" href="/{f}">' for f in ('tokens.css', 'components/bundle.css'))
    esc = lambda s: html.escape(s, quote=False)
    brand = f'<p class="og__brand">{MARK}<span>Tray UI</span></p>'
    if card['kind'] == 'home':
        body = (f'<div class="og og--home"><div class="og__text">{brand}<div><h1 class="og__title">{esc(card["title"])}</h1>'
                f'<p class="og__line">{esc(card["line"])}</p></div></div></div>')
    else:
        text = f'<div><p class="og__kind">{esc(card["kind"])}</p><h1 class="og__title">{esc(card["title"])}</h1></div>'
        if card.get('block'):
            body = (f'<div class="og og--wide"><div class="og__text">{text}{brand}</div>'
                    f'<div class="og__show"><iframe class="og__frame" src="/__block/{card["block"]}.html"></iframe></div></div>')
        elif card.get('show'):
            body = (f'<div class="og"><div class="og__text">{brand}{text}</div><div class="og__show">'
                    f'<div class="og__fit" style="inline-size: {card.get("width", 760)}px">{card["show"]}</div></div></div>')
        else:
            line = f'<p class="og__line">{esc(card["line"])}</p>' if card.get('line') else ''
            body = (f'<div class="og"><div class="og__text">{brand}<div><p class="og__kind">{esc(card["kind"])}</p>'
                    f'<h1 class="og__title">{esc(card["title"])}</h1>{line}</div></div>'
                    f'<div class="og__show"><svg class="og__big" viewBox="0 0 32 32" aria-hidden="true"><rect class="og__tile" width="32" height="32" rx="10"/>'
                    f'<rect class="og__bar" x="8" y="14" width="16" height="10" rx="4"/></svg></div></div>')
    script = f'<script>{card["script"]}</script>' if card.get('script') else ''
    return (f'<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8">{head}<style>{STYLE}</style></head>'
            f'<body>{body}<script src="/components/bundle.js"></script>{script}</body></html>')


async def draw(cards, site, blocks):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel='chrome')
        ctx = await browser.new_context(viewport={'width': W, 'height': H}, reduced_motion='reduce')
        docs = {}

        async def serve(route):
            path = urllib.parse.unquote(urllib.parse.urlparse(route.request.url).path)
            if path.startswith('/__card/'):
                return await route.fulfill(body=docs[path[8:]], content_type='text/html; charset=utf-8')
            if path.startswith('/__block/'):
                return await route.fulfill(body=blocks[path[9:-5]], content_type='text/html; charset=utf-8')
            f = site / path.lstrip('/')
            if f.is_file():
                return await route.fulfill(body=f.read_bytes(), content_type=TYPES.get(f.suffix, 'application/octet-stream'))
            await route.fulfill(status=404, body='')
        await ctx.route('https://og.local/**', serve)
        room = asyncio.Semaphore(6)

        async def one(key, card, out):
            docs[key] = card_doc(card, None)
            async with room:
                pg = await ctx.new_page()
                try:
                    await pg.goto(f'https://og.local/__card/{key}', wait_until='load')
                    await pg.evaluate('document.fonts.ready')
                    await pg.evaluate(FIT)
                    await pg.wait_for_timeout(400 if card.get('block') else 150)
                    await pg.screenshot(path=str(out), type='jpeg', quality=86)
                finally:
                    await pg.close()
        await asyncio.gather(*(one(k, c, o) for k, c, o in cards))
        await browser.close()


def make(cards, site, blocks):
    """Draw the cards that are not in the cache and copy every card into site/_/og/. cards: [{'path', 'kind', 'title',
    'line', 'show', 'script', 'width', 'block'}], blocks: {name: source}. Returns ({path: address of its card}, a note)."""
    try:
        import playwright  # noqa: F401
    except ImportError:
        return {}, 'og: Playwright is not installed, so the pages have no picture for links (pip install -r requirements.txt)'
    seed = hashlib.sha256(VERSION.encode())
    for f in ('tokens.css', 'components/bundle.css', 'components/bundle.js'):
        seed.update((site / f).read_bytes())
    CACHE.mkdir(parents=True, exist_ok=True)
    todo, found = [], {}
    for card in cards:
        h = seed.copy()
        h.update(json.dumps(card, sort_keys=True).encode())
        if card.get('block'):
            h.update(blocks[card['block']].encode())
        key = h.hexdigest()[:12]
        cached = CACHE / f'{key}.jpg'
        found[card['path']] = key
        if not cached.exists():
            todo.append((key, card, cached))
    if todo:
        try:
            asyncio.run(draw(todo, site, blocks))
        except Exception as e:  # no Chrome, or it would not start: the site is still built
            return {}, f'og: the pictures for links were not drawn ({str(e).splitlines()[0][:160]})'
    out = {}
    for path, key in found.items():
        rel = f'_/og/{path or "index"}.{key}.jpg'
        (site / rel).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(CACHE / f'{key}.jpg', site / rel)
        out[path] = rel
    keep = set(found.values())
    for f in CACHE.glob('*.jpg'):  # what no page shows any more
        if f.stem not in keep:
            f.unlink()
    return out, f'og: {len(found)} pictures for links, {len(todo)} drawn now'
