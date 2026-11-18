"""The harness of the component tests: it loads a component as people use it and holds it to what its README promises.

A test is a module in tests/components/<Name>.py. The harness first runs the checks every component gets, then each
function of the module whose name starts with `test_`, in the order they are written, each given a `T`:

    def test_keys(t):
        pg = t.open()                                     # the preview, Light, at the width of its card
        tab = pg.locator('#tt1'); tab.focus(); pg.keyboard.press('ArrowRight')
        t.eq('ArrowRight moves to the next tab', t.focused(pg)['id'], 'tt2')
        t.eq('it fires tray:change', t.events(pg, 'tray:change')[-1]['detail'], {'tab': 'tt2'})

The checks every component gets (`generic`):
  - the preview loads without a script error, and every <label> names its control (the control's name holds its words);
  - axe-core finds nothing against WCAG 2.2 A and AA, in Light and in Dark;
  - at 390 and at 1440px wide: no sideways scroll, no text cut by a box that hides its overflow, every target at least
    24px (WCAG 2.5.8, with its spacing and inline exceptions), and buttons, fields, tabs, menu items, options, days and
    pages at least 44px tall where they can be pressed (the Targets section of guides/3-accessibility.md);
  - where the component has a React twin: its preview (react/previews/<Name>.tsx) renders every cell without an error,
    names every control its labels are for, passes the same scan in Light and Dark, and does not scroll sideways at 390
    and 1440px.

What a module may set, each with the reason it is right (the report prints it):
  AXE_SKIP = {'rule-id': 'why'}             an axe rule not to run on this preview
  AXE_EXCLUDE = {'selector': 'why'}         a part of the preview the scan leaves out
  LAYOUT_IGNORE = {'selector': 'why'}       elements the clipping and target checks pass over
  NO44 = {'selector': 'why'}                controls inside these the 44px check passes over (a target partly scrolled out
                                            of its box is measured by its visible part: measure it in a test instead)
  REACT = False                             no React parity for this component (say why in a comment)
  PARITY = [(html_selector, react_cell, react_selector), ...]   subtrees whose accessibility trees must be the same, as
                                            aria snapshots, leaving out the addresses of links
  XFAIL = {'check name': 'why'}             a check that fails because of a file outside the system (a React file another
                                            person is fixing): reported apart, not counted as a failure; when it passes,
                                            the run says to take it out. Name the React checks apart ('react: ...').

Functions named test_parity* or test_react_* are counted as React checks. In what `t.ax()` returns, Chrome's protocol gives
checked, pressed and the like as the strings 'true', 'false' and 'mixed' for some roles, and the value of a progress bar or
meter in `value`; `valuetext` is the element's own aria-valuetext. A string given to `pg.evaluate` that is a function is
called.

The pages are served from system/ at http://localhost:4321 by the browser's own request routing (nothing listens on the
port): /project/components/<Name>/preview.html?theme=dark gets <html data-theme> and the three files of the system, linked
as guides/2-behaviour.md says (dist/tokens.css, dist/components/bundle.css, dist/components/bundle.js); /react/<Name>
draws the React preview bundled by tests/react.mjs over react/styles/styles.css. Every `tray:*` event is recorded.
"""
import importlib.util, mimetypes, os, pathlib, re, time
from urllib.parse import urlsplit, parse_qs

SYSTEM = pathlib.Path(__file__).resolve().parent.parent
P = SYSTEM / 'project'
COMPONENTS = P / 'components'
TESTS = SYSTEM / 'tests'
# where tests/react.mjs put the React pages: the runner gives each run its own folder (TRAY_TEST_REACT)
REACT_OUT = pathlib.Path(os.environ.get('TRAY_TEST_REACT') or SYSTEM / '.cache' / 'tests' / 'react')
ORIGIN = 'http://localhost:4321'  # localhost is a secure context, so the clipboard and the like work as on a real site
AXE = TESTS / 'node_modules' / 'axe-core' / 'axe.min.js'
AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
NARROW, WIDE = 390, 1440
COVER = 'Cover'  # a design tool's cover card on the owner's machine: not a component


def components():
    """Every component: {name: group}, from the marker on the first line of its preview."""
    out = {}
    for d in sorted(COMPONENTS.iterdir()):
        prev = d / 'preview.html'
        if d.name == COVER or not prev.exists() or not (d / 'README.md').exists():
            continue
        m = re.search(r'group="([^"]+)"', prev.read_text(encoding='utf-8').split('\n', 1)[0])
        out[d.name] = m.group(1) if m else ''
    return out


BLOCKS = 'Blocks'  # the group the runner gives the blocks


def blocks():
    """Every block: the names of project/blocks/*.html."""
    return sorted(f.stem for f in (P / 'blocks').glob('*.html'))


def marker(name):
    first = (COMPONENTS / name / 'preview.html').read_text(encoding='utf-8').split('\n', 1)[0]
    w = re.search(r'width=(\d+)', first)
    h = re.search(r'height=(\d+)', first)
    return (int(w.group(1)) if w else 920), (int(h.group(1)) if h else 600)


def has_react(name):
    """The component has a React preview. Its page is in REACT_OUT; if the bundle is missing there, the React checks fail
    (the page does not draw), they are not skipped."""
    return (SYSTEM / 'react' / 'previews' / f'{name}.tsx').exists()


# ---------------------------------------------------------------------------------------------------------------- pages

# A preview with a script of its own calls TrayUI as it is parsed (as on the site, where the bundle is already on the page),
# so there the bundle loads first, as a classic script in the head; every other preview loads it with defer, as the guide does.
HEAD = ('<link rel="stylesheet" href="/dist/tokens.css">\n<link rel="stylesheet" href="/dist/components/bundle.css">\n'
        '<script src="/dist/components/bundle.js"{defer}></script>\n')

RECORDER = r"""
(() => {
  const orig = EventTarget.prototype.dispatchEvent;
  const who = (n) => {
    if (!n || n === window) return 'window';
    if (n === document) return 'document';
    if (!n.tagName) return String(n);
    let s = n.tagName.toLowerCase();
    if (n.id) s += '#' + n.id;
    const tray = n.getAttribute && n.getAttribute('data-tray'); if (tray) s += '[data-tray="' + tray + '"]';
    else if (n.classList && n.classList.length) s += '.' + [...n.classList].slice(0, 2).join('.');
    return s;
  };
  const safe = (v, depth = 0) => {
    if (v === null || v === undefined || typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return v ?? null;
    if (depth > 4) return '…';
    if (typeof Node !== 'undefined' && v instanceof Node) return { node: who(v), text: (v.textContent || '').trim().slice(0, 60) };
    if (v instanceof Date) return v.toISOString();
    if (typeof File !== 'undefined' && v instanceof File) return { file: v.name, size: v.size, type: v.type };
    if (Array.isArray(v) || (typeof FileList !== 'undefined' && v instanceof FileList)) return [...v].map((x) => safe(x, depth + 1));
    if (typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = safe(v[k], depth + 1); return o; }
    return String(v);
  };
  window.__trayEvents = [];
  EventTarget.prototype.dispatchEvent = function (e) {
    if (e && typeof e.type === 'string' && e.type.startsWith('tray:')) {
      try { window.__trayEvents.push({ type: e.type, target: who(this), detail: safe(e.detail), t: performance.now() }); } catch (err) {}
    }
    return orig.call(this, e);
  };
})();
"""

FOCUSED = r"""() => {
  let a = document.activeElement;
  while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
  if (!a || a === document.body || a === document.documentElement) return { tag: a ? a.tagName.toLowerCase() : null, body: true, id: '', text: '', label: '', role: '' };
  return { tag: a.tagName.toLowerCase(), body: false, id: a.id || '', text: (a.innerText || a.value || '').trim().replace(/\s+/g, ' ').slice(0, 80),
           label: a.getAttribute('aria-label') || '', role: a.getAttribute('role') || '', cls: (a.getAttribute('class') || '').slice(0, 80),
           name: a.getAttribute('name') || '', type: a.getAttribute('type') || '' };
}"""

SETTLED = "() => !document.getAnimations().some(a => a.playState === 'running' && isFinite(a.effect.getComputedTiming().endTime))"

SYSCOLORS = r"""() => {
  const out = {};
  for (const c of ['Canvas', 'CanvasText', 'LinkText', 'VisitedText', 'ActiveText', 'ButtonFace', 'ButtonText', 'ButtonBorder', 'Field', 'FieldText',
                   'Highlight', 'HighlightText', 'SelectedItem', 'SelectedItemText', 'Mark', 'MarkText', 'GrayText', 'AccentColor', 'AccentColorText']) {
    const p = document.createElement('i'); p.style.color = c; document.body.appendChild(p);
    out[c] = getComputedStyle(p).color; p.remove();
  }
  return out;
}"""

LAYOUT = r"""(opts) => {
  const ignore = (el) => opts.ignore.some((s) => { try { return el.closest(s); } catch (e) { return false; } });
  const desc = (n) => {
    if (!n || !n.tagName) return String(n);
    let s = n.tagName.toLowerCase();
    if (n.id) s += '#' + n.id;
    const c = (n.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (c.length) s += '.' + c.join('.');
    const name = n.getAttribute('aria-label') || (n.innerText || n.value || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    return name ? s + ' "' + name + '"' : s;
  };
  const de = document.documentElement, W = de.clientWidth, out = { scroll: de.scrollWidth, client: W, wide: [], clipped: [], small: [], short: [], covered: 0, checked: 0 };
  const shown = (el) => el.checkVisibility ? el.checkVisibility({ visibilityProperty: true }) : !!el.getClientRects().length;
  const flows = (v) => v === 'auto' || v === 'scroll';
  /* what scrolls sideways: the outermost elements that end past the window, outside anything that scrolls */
  if (de.scrollWidth > W + 1) {
    const all = [...document.body.querySelectorAll('*')].filter((el) => {
      const r = el.getBoundingClientRect(); if (!r.width || r.right <= W + 1) return false;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflowX !== 'visible') return false; }
      return true; });
    out.wide = all.filter((el) => !all.includes(el.parentElement)).slice(0, 6).map((el) => desc(el) + ' ends at ' + Math.round(el.getBoundingClientRect().right) + 'px');
  }
  /* text cut by a box that hides its overflow (not one that scrolls, not an ellipsis or a line clamp, not a 1px box that hides text on purpose) */
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const seen = new Set();
  for (let node; (node = walker.nextNode());) {
    const text = node.textContent.trim(); if (!text) continue;
    const el = node.parentElement; if (!el || el.closest('script, style, template, noscript, svg, [hidden]') || ignore(el) || !shown(el)) continue;
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
    for (const r of rects) {
      let cut = null;
      for (let a = el; a && a !== de; a = a.parentElement) {
        const cs = getComputedStyle(a);
        const ox = cs.overflowX, oy = cs.overflowY;
        if (ox === 'visible' && oy === 'visible') continue;
        const b = a.getBoundingClientRect();
        const box = { l: b.left + a.clientLeft, t: b.top + a.clientTop, r: b.left + a.clientLeft + a.clientWidth, b: b.top + a.clientTop + a.clientHeight };
        if (a.clientWidth <= 2 || a.clientHeight <= 2) { cut = 'none'; break; }  /* a visually hidden box, or one folded shut */
        const sideways = ox !== 'visible' && (r.left < box.l - 1.5 || r.right > box.r + 1.5);
        const over = Math.max(box.t - r.top, r.bottom - box.b, 0);
        const down = oy !== 'visible' && over > Math.max(3, r.height * 0.25);
        if (!sideways && !down) continue;
        if ((sideways && flows(ox)) || (down && flows(oy))) { cut = 'none'; break; }  /* it scrolls into view */
        let ell = false;
        for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if ((s.textOverflow === 'ellipsis' && sideways) || (s.webkitLineClamp && s.webkitLineClamp !== 'none')) { ell = true; break; } if (e === a) break; }
        if (ell || ignore(a)) { cut = 'none'; break; }
        cut = (sideways ? 'sideways' : 'at the ' + (box.t - r.top > r.bottom - box.b ? 'top' : 'bottom')) + ' by ' + desc(a);
        break;
      }
      if (!cut && (r.right > W + 1.5 || r.left < -1.5)) cut = 'by the edge of the window';
      if (cut && cut !== 'none') { const k = desc(el) + ' ' + cut; if (!seen.has(k)) { seen.add(k); out.clipped.push('"' + text.slice(0, 40) + '" in ' + desc(el) + ' is cut ' + cut); } break; }
    }
  }
  /* targets: what a pointer presses, measured by hit-testing from its centre outwards, so a hit area drawn by ::before
     (the extra-small button, a chip's remove button) and a label that forwards its presses (a checkbox's row) count */
  const SEL = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], [role="checkbox"], [role="radio"], [role="switch"], [role="slider"], [role="spinbutton"], [role="treeitem"], [contenteditable="true"]';
  const T44 = '.tray-btn:not(.tray-btn--link), .tray-tab, [role="tab"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], .tray-cal__day, .tray-page, input.tray-input, .tray-input-group, .tray-select select, .tray-select-trigger, textarea.tray-textarea';
  const cands = [...document.querySelectorAll(SEL)].filter((el) => {
    if (el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[inert], fieldset[disabled], [aria-hidden="true"]') || ignore(el)) return false;
    if (!shown(el)) return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
  });
  const rects = new Map(cands.map((el) => [el, el.getBoundingClientRect()]));
  const part = (el, n) => {
    if (!n) return false;
    if (el === n || el.contains(n)) return true;
    if (el.labels) for (const l of el.labels) if (l === n || l.contains(n)) return true;
    return false;
  };
  const H = de.clientHeight;
  const span = (el, x, y, dx, dy, max) => { let k = 0; for (; k < max; k++) { const px = x + dx * (k + 1), py = y + dy * (k + 1); if (px < 0 || py < 0 || px >= W || py >= H) break; if (!part(el, document.elementFromPoint(px, py))) break; } return k; };
  const sizes = new Map();
  for (const el of cands) {
    const r = rects.get(el);
    const x = Math.round(Math.min(Math.max(r.left + r.width / 2, 1), W - 2)), y = Math.round(Math.min(Math.max(r.top + r.height / 2, 1), H - 2));
    if (!part(el, document.elementFromPoint(x, y))) { out.covered++; continue; }
    out.checked++;
    const w = span(el, x, y, -1, 0, 40) + span(el, x, y, 1, 0, 40) + 1, h = span(el, x, y, 0, -1, 40) + span(el, x, y, 0, 1, 40) + 1;
    sizes.set(el, { w, h, x, y });
  }
  const small = [...sizes].filter(([el, s]) => s.w < 24 || s.h < 24);
  const dist = (x, y, r) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
  for (const [el, s] of small) {
    const r = rects.get(el), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    /* the spacing exception: a 24px circle on its centre meets no other target, nor the circle of another small one */
    const others = [...sizes.keys()].filter((o) => o !== el && !o.contains(el) && !el.contains(o));
    const spaced = others.every((o) => { const q = rects.get(o); if (dist(cx, cy, q) < 12) return false;
      if (small.some(([e]) => e === o)) { const ox = q.left + q.width / 2, oy = q.top + q.height / 2; return Math.hypot(ox - cx, oy - cy) >= 24; } return true; });
    if (spaced) continue;
    /* the inline exception: a link in a sentence */
    if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') {
      const blk = el.parentElement; if (blk && (blk.innerText || '').trim().length > (el.innerText || '').trim().length + 8) continue;
    }
    out.small.push(desc(el) + ' ' + s.w + '×' + s.h + 'px');
  }
  for (const [el, s] of sizes) {
    if (!el.matches(T44) || opts.no44.some((q) => el.closest(q))) continue;
    if (s.h < 44) out.short.push(desc(el) + ' ' + s.h + 'px tall');
  }
  return out;
}"""

REACT_PAGE = ('<!doctype html><html lang="en" data-theme="{theme}"{dir}><head><meta charset="utf-8"><title>{name}, React</title>'
              '<link rel="stylesheet" href="/react/styles/styles.css"></head><body><div id="root"></div>'
              '<script type="module" src="/{out}/{name}.js"></script></body></html>')


class Server:
    """Answers the browser's requests from system/: the previews get the system's three files, /react/<Name> its React preview."""

    def __init__(self):
        self.cache = {}

    def file(self, rel):
        if rel not in self.cache:
            path = (SYSTEM / rel).resolve()
            if SYSTEM not in path.parents or not path.is_file():
                return None
            self.cache[rel] = path.read_bytes()
        return self.cache[rel]

    def handle(self, route):
        url = urlsplit(route.request.url)
        q = parse_qs(url.query)
        theme = (q.get('theme') or ['light'])[0]
        rtl = ' dir="rtl"' if (q.get('dir') or [''])[0] == 'rtl' else ''
        path = url.path.lstrip('/')
        if path.startswith('react/') and path.count('/') == 1 and not path.endswith(('.css', '.js')):
            name = path.split('/', 1)[1]
            return route.fulfill(status=200, content_type='text/html; charset=utf-8', body=REACT_PAGE.format(theme=theme, name=name, dir=rtl, out=REACT_OUT.relative_to(SYSTEM).as_posix()))
        if path.startswith('media/'):  # the React previews name their pictures and film as the site serves them
            path = 'project/assets/Media/' + path[6:]
        block = re.fullmatch(r'dist/blocks/([a-z0-9-]+)\.html', path)
        if block:  # a block, from its source in project/blocks, at the place it is published (it links ../tokens.css)
            path = f'project/blocks/{block.group(1)}.html'
        body = self.file(path)
        if body is None:
            return route.fulfill(status=404, content_type='text/plain', body='not found: ' + path)
        if block:
            html = re.sub(r'<html([^>]*)>', lambda m: '<html' + re.sub(r'\s(data-theme|dir)="[^"]*"', '', m.group(1)) + f' data-theme="{theme}"' + rtl + '>', body.decode('utf-8'), count=1)
            return route.fulfill(status=200, content_type='text/html; charset=utf-8', body=html)
        if path.endswith('/preview.html'):
            html = body.decode('utf-8')
            head = HEAD.format(defer='' if '<script>' in html else ' defer')
            html = re.sub(r'<html([^>]*)>', lambda m: '<html' + re.sub(r'\s(data-theme|dir)="[^"]*"', '', m.group(1)) + f' data-theme="{theme}"' + rtl + '>', html, count=1)
            if '<head>' in html:
                html = re.sub(r'(<head>(?:\s*<meta charset="utf-8">)?)', lambda m: m.group(1) + '\n' + head, html, count=1)
            else:
                html = re.sub(r'(<html[^>]*>)', lambda m: m.group(1) + '\n<head>' + head + '</head>', html, count=1)
            return route.fulfill(status=200, content_type='text/html; charset=utf-8', body=html)
        ctype = mimetypes.guess_type(path)[0] or 'application/octet-stream'
        if path.endswith('.js') or path.endswith('.mjs'):
            ctype = 'text/javascript'
        if path.endswith('.vtt'):
            ctype = 'text/vtt'
        rng = re.match(r'bytes=(\d*)-(\d*)$', route.request.headers.get('range', ''))
        if rng and (rng.group(1) or rng.group(2)):  # a film is read in ranges, so it can seek
            n = len(body)
            a, z = (int(rng.group(1)), int(rng.group(2) or n - 1)) if rng.group(1) else (n - int(rng.group(2)), n - 1)
            z = min(z, n - 1)
            return route.fulfill(status=206, content_type=ctype, body=body[a:z + 1],
                                 headers={'Content-Range': f'bytes {a}-{z}/{n}', 'Accept-Ranges': 'bytes', 'Content-Type': ctype})
        return route.fulfill(status=200, content_type=ctype, body=body, headers={'Accept-Ranges': 'bytes', 'Content-Type': ctype})


class Browser:
    """One Chrome per worker, and one context per kind of window (width, motion, forced colours, more contrast)."""

    def __init__(self):
        from playwright.sync_api import sync_playwright
        self.pw = sync_playwright().start()
        self.server = Server()
        self.launch()
        self.axe = AXE.read_text(encoding='utf-8') if AXE.exists() else None

    def launch(self):
        self.browser = self.pw.chromium.launch(channel='chrome')
        self.contexts = {}

    def alive(self):
        try:
            return self.browser.is_connected()
        except Exception:
            return False

    def context(self, width, height, motion, forced, contrast, media):
        key = (width, height, motion, forced, contrast, media)
        if key not in self.contexts:
            opts = dict(viewport={'width': width, 'height': height}, reduced_motion=motion, device_scale_factor=1,
                        permissions=['clipboard-read', 'clipboard-write'], locale='en-GB', timezone_id='Europe/Kyiv')
            if forced:
                opts['forced_colors'] = 'active'
            if contrast:
                opts['contrast'] = 'more'
            if media:
                opts['media'] = media
            ctx = self.browser.new_context(**opts)
            ctx.add_init_script(RECORDER)
            ctx.route(ORIGIN + '/**', self.server.handle)
            ctx.set_default_timeout(3000)
            self.contexts[key] = ctx
        return self.contexts[key]

    def close(self):
        try:
            self.browser.close()
        except Exception:
            pass
        try:
            self.pw.stop()
        except Exception:
            pass


# ----------------------------------------------------------------------------------------------------------- the tests

class T:
    """What a test is given: the component's name and group, ways to open it, and ways to say what was found."""

    def __init__(self, browser, name, group, module):
        self.b, self.name, self.group, self.module = browser, name, group, module
        self.block = group == BLOCKS
        self.width, self.height = (WIDE, 900) if self.block else marker(name)
        self.results = []
        self.kind = 'html'
        self.fn = ''
        self.pages = []
        self.errors = {}

    # ---- opening pages

    def open(self, theme='light', width=None, height=None, motion='reduce', forced=False, contrast=False, media=None, rtl=False, react=False, wait=150):
        """A fresh page with the preview (or, with react=True, the React preview) loaded and its fonts ready.
        motion='reduce' (the default, so panels only fade) or 'no-preference'; forced=True for forced colours."""
        ctx = self.b.context(width or (WIDE if react else self.width), height or 900, motion, forced, contrast, media)
        pg = ctx.new_page()
        errs = self.errors.setdefault(id(pg), [])
        pg.on('pageerror', lambda e: errs.append(str(e).split('\n')[0][:200]))
        pg.on('console', lambda m: errs.append(m.text.split('\n')[0][:200]) if m.type == 'error' and 'Download the React DevTools' not in m.text else None)
        q = f'?theme={theme}' + ('&dir=rtl' if rtl else '')
        url = (f'{ORIGIN}/react/{self.name}{q}' if react else f'{ORIGIN}/dist/blocks/{self.name}.html{q}' if self.block
               else f'{ORIGIN}/project/components/{self.name}/preview.html{q}')
        pg.goto(url, wait_until='load')
        if react:
            try:
                pg.wait_for_function('() => window.__drawn === true', timeout=5000)
            except Exception:
                errs.append('the React preview did not draw')
        pg.evaluate('document.fonts.ready.then(() => true)')
        if wait:
            pg.wait_for_timeout(wait)
        self.pages.append(pg)
        return pg

    def open_react(self, **kw):
        return self.open(react=True, **kw)

    def cell(self, pg, name):
        """The part of the React preview (a <div data-cell>) that draws one of its named exports."""
        return pg.locator(f'[data-cell="{name}"]')

    def page_errors(self, pg):
        return list(self.errors.get(id(pg), []))

    def close_pages(self):
        for pg in self.pages:
            try:
                pg.close()
            except Exception:
                pass
        self.pages = []

    # ---- saying what was found

    def check(self, name, ok, detail=''):
        xfail = getattr(self.module, 'XFAIL', {}).get(name)
        self.results.append({'component': self.name, 'group': self.group, 'kind': self.kind, 'fn': self.fn, 'check': name,
                             'ok': bool(ok), 'detail': '' if ok else str(detail)[:1500], 'xfail': xfail})
        return bool(ok)

    def eq(self, name, actual, expected):
        return self.check(name, actual == expected, f'got {actual!r}, expected {expected!r}')

    def has(self, name, container, item):
        return self.check(name, item in container, f'{item!r} not in {container!r}')

    def note_error(self, name, e):
        msg = str(e).strip().split('\n')
        self.check(name, False, (type(e).__name__ + ': ' + ' | '.join(l.strip() for l in msg[:4] if l.strip()))[:600])

    # ---- reading the page

    def ax(self, loc):
        """The browser's accessibility node for one element, read through the DevTools protocol:
        {role, name, description, value, ignored, focusable, expanded, selected, checked, pressed, disabled, invalid,
         required, level, valuemin, valuemax, valuetext, haspopup, modal, multiselectable, orientation, live, ...}.
        valuetext is the element's aria-valuetext where it has one (the protocol does not report it)."""
        pg = loc.page
        loc.first.evaluate('e => { window.__axProbe = e; }')
        cdp = pg.context.new_cdp_session(pg)
        try:
            obj = cdp.send('Runtime.evaluate', {'expression': 'window.__axProbe'})['result']['objectId']
            nodes = cdp.send('Accessibility.getPartialAXTree', {'objectId': obj, 'fetchRelatives': False})['nodes']
        finally:
            cdp.detach()
        n = nodes[0] if nodes else {}
        out = {'role': (n.get('role') or {}).get('value'), 'name': (n.get('name') or {}).get('value', ''),
               'description': (n.get('description') or {}).get('value', ''), 'value': (n.get('value') or {}).get('value'),
               'ignored': n.get('ignored', False)}
        for p in n.get('properties', []):
            v = p.get('value', {})
            out[p['name']] = v.get('value') if 'value' in v else [r.get('backendDOMNodeId') for r in v.get('relatedNodes', [])]
        # Chrome's protocol reports an empty or a computed valuetext even when aria-valuetext is set: take the attribute
        vt = loc.first.get_attribute('aria-valuetext')
        if vt is not None:
            out['valuetext'] = vt
        return out

    def tree(self, loc):
        """The accessibility tree of a subtree as Playwright writes it (roles, names, states, text)."""
        return loc.first.aria_snapshot(timeout=3000)

    def match_tree(self, name, loc, template):
        """Check that a subtree's accessibility tree matches a template, as Playwright's to_match_aria_snapshot reads it:
        each line '- role "name" [state]', children indented; a line may leave out what does not matter."""
        from playwright.sync_api import expect
        try:
            expect(loc.first).to_match_aria_snapshot(template, timeout=1500)
            return self.check(name, True)
        except AssertionError as e:
            return self.check(name, False, str(e).split('Call log')[0].strip()[-1400:])

    def focused(self, pg):
        """What has focus: {tag, id, text, label, role, cls, name, type, body}; body is True when focus fell to the page."""
        return pg.evaluate(FOCUSED)

    def is_focused(self, loc):
        """True when the element itself has focus."""
        return loc.first.evaluate('e => e === document.activeElement')

    def events(self, pg, kind=None, clear=False):
        """The tray:* events fired so far, oldest first: [{type, target, detail}]."""
        ev = pg.evaluate('() => window.__trayEvents || []')
        if clear:
            pg.evaluate('() => { window.__trayEvents = []; }')
        return [e for e in ev if not kind or e['type'] == kind]

    def clear_events(self, pg):
        pg.evaluate('() => { window.__trayEvents = []; }')

    def tab_through(self, pg, count, back=False):
        """Press Tab (or Shift+Tab) `count` times and say where focus went each time: a list of focused() dicts."""
        out = []
        for _ in range(count):
            pg.keyboard.press('Shift+Tab' if back else 'Tab')
            out.append(self.focused(pg))
        return out

    def lost_focus(self, pg):
        """True when focus fell to the page itself (<body>): what rescue() is there to prevent."""
        return self.focused(pg)['body']

    def motion(self, loc, pseudo=None):
        """The motion of the first element: its transitions and animations, as computed."""
        return self.style(loc, 'transition-property', 'transition-duration', 'animation-name', 'animation-duration', 'animation-iteration-count', 'transform', pseudo=pseudo)

    def running_animations(self, pg):
        """Animations running on the page now: [{name, target, duration, iterations}]."""
        return pg.evaluate('''() => document.getAnimations().filter(a => a.playState === 'running').map(a => ({ name: a.animationName || a.transitionProperty || a.id || '',
            target: a.effect && a.effect.target ? (a.effect.target.className && a.effect.target.className.baseVal === undefined ? a.effect.target.className : a.effect.target.tagName) : '',
            duration: a.effect ? a.effect.getComputedTiming().duration : 0, iterations: a.effect ? a.effect.getComputedTiming().iterations : 0 }))''')

    def settle(self, pg, timeout=2000):
        """Wait until every animation with an end has ended (a panel fading out, a dialog leaving)."""
        try:
            pg.wait_for_function(SETTLED, timeout=timeout)
        except Exception:
            pass

    def style(self, loc, *props, pseudo=None):
        """Computed style values of the first element: one value for one property, else a dict."""
        vals = loc.first.evaluate('(e, a) => { const s = getComputedStyle(e, a[1]); return a[0].map(p => s.getPropertyValue(p)); }', [list(props), pseudo])
        return vals[0] if len(props) == 1 else dict(zip(props, vals))

    def system_colors(self, pg):
        """The colours of the system keywords on this page (under forced colours: the person's own)."""
        return pg.evaluate(SYSCOLORS)

    def hit(self, loc):
        """The size of the area that answers a press on the element, by hit-testing from its centre: (width, height)."""
        return tuple(loc.first.evaluate(r'''e => { const r = e.getBoundingClientRect(); const x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
          const part = (n) => n && (n === e || e.contains(n) || (e.labels && [...e.labels].some(l => l === n || l.contains(n))));
          const span = (dx, dy) => { let k = 0; for (; k < 60; k++) if (!part(document.elementFromPoint(x + dx * (k + 1), y + dy * (k + 1)))) break; return k; };
          return part(document.elementFromPoint(x, y)) ? [span(-1, 0) + span(1, 0) + 1, span(0, -1) + span(0, 1) + 1] : [0, 0]; }'''))

    # ---- the checks every component gets, which a test may also run on a state of its own

    def scan(self, pg, label, include=None):
        """axe-core against WCAG 2.2 A and AA; `include` narrows it to a part of the page."""
        if not self.b.axe:
            return self.check(f'axe: {label}', False, 'axe-core is not installed: npm ci --prefix system/tests')
        if not pg.evaluate('() => !!window.axe'):
            pg.evaluate(self.b.axe + '\n;void 0')
        skip = getattr(self.module, 'AXE_SKIP', {})
        exclude = list(getattr(self.module, 'AXE_EXCLUDE', {}).keys())
        res = pg.evaluate('''async (o) => {
            const r = await axe.run(o.include ? { include: [o.include], exclude: o.exclude } : { exclude: o.exclude }, { runOnly: { type: 'tag', values: o.tags }, resultTypes: ['violations'],
              rules: Object.fromEntries(o.skip.map(id => [id, { enabled: false }])) });
            return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 4).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\\n').slice(1, 2).join('').trim()), count: v.nodes.length })); }''',
                          {'include': include, 'exclude': exclude, 'tags': AXE_TAGS, 'skip': list(skip)})
        return self.check(f'axe: {label}', not res, '; '.join(f"{v['id']} ({v['count']}): {v['help']} -> " + ' | '.join(v['nodes']) for v in res))

    def layout(self, pg, label):
        """No sideways scroll, no text cut, targets of 24px and 44px: the window is made as tall as the page first."""
        h = pg.evaluate('() => Math.min(8000, Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))')
        vp = pg.viewport_size
        if h > vp['height']:
            pg.set_viewport_size({'width': vp['width'], 'height': h})
            pg.wait_for_timeout(80)
        ignore = list(getattr(self.module, 'LAYOUT_IGNORE', {}).keys())
        no44 = list(getattr(self.module, 'NO44', {}).keys())
        m = pg.evaluate(LAYOUT, {'ignore': ignore, 'no44': no44})
        self.check(f'no sideways scroll at {label}', m['scroll'] <= m['client'] + 1, f"{m['scroll']}px in {m['client']}px: " + '; '.join(m['wide']))
        self.check(f'nothing cut at {label}', not m['clipped'], '; '.join(m['clipped'][:8]))
        self.check(f'targets of 24px at {label}', not m['small'], '; '.join(m['small'][:10]))
        self.check(f'44px controls at {label}', not m['short'], '; '.join(m['short'][:10]))
        return m

    def labels(self, pg, label):
        """Every label on the page names its control: a <label> names the control it is for (or holds), and the control's
        accessible name holds the label's words; a label that names nothing is one too. (An id given to the wrong element
        cuts a label from its field, and the field is then read with no name.)"""
        bad = []
        cdp = pg.context.new_cdp_session(pg)
        try:
            for item in pg.evaluate(LABELS):
                if 'problem' in item:
                    bad.append(f'"{item["label"][:40]}": {item["problem"]}'); continue
                obj = cdp.send('Runtime.evaluate', {'expression': f'window.__labelled[{item["i"]}]'})['result']['objectId']
                nodes = cdp.send('Accessibility.getPartialAXTree', {'objectId': obj, 'fetchRelatives': False})['nodes']
                name = ' '.join(((nodes[0].get('name') or {}).get('value') or '').split()) if nodes else ''
                want = item['label'].rstrip(' *')
                if want.lower() not in name.lower():
                    bad.append(f'"{want[:40]}" does not name {item["control"]}, which is named "{name[:60]}"')
        finally:
            cdp.detach()
        return self.check(label, not bad, '; '.join(bad[:6]))


LABELS = r"""() => {
  const words = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const shown = (el) => el.checkVisibility ? el.checkVisibility({ visibilityProperty: true }) : !!el.getClientRects().length;
  const out = [];
  window.__labelled = [];
  for (const l of document.querySelectorAll('label')) {
    if (!shown(l) || l.closest('[aria-hidden="true"], [inert]')) continue;
    const text = words(l.innerText); if (!text) continue;
    const c = l.control;
    if (!c) {
      const used = l.id && document.querySelector('[aria-labelledby~="' + CSS.escape(l.id) + '"]');
      if (!used) out.push({ label: text, problem: l.htmlFor ? 'for="' + l.htmlFor + '" points at nothing a label can name' : 'it labels no control' });
      continue;
    }
    window.__labelled.push(c);
    out.push({ label: text, i: window.__labelled.length - 1, control: c.tagName.toLowerCase() + (c.id ? '#' + c.id : '') });
  }
  return out;
}"""


def load_module(name):
    path = TESTS / 'components' / f'{name}.py'
    if not path.exists():
        return None
    spec = importlib.util.spec_from_file_location(f'tray_test_{name}', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def generic(t):
    """The checks every component gets."""
    t.kind, t.fn = 'html', 'generic'
    pg = t.open('light')
    t.check('loads without a script error', not t.page_errors(pg), '; '.join(t.page_errors(pg)[:4]))
    t.labels(pg, 'every label names its control')
    t.scan(pg, 'Light')
    pg.close()
    pg = t.open('dark')
    t.scan(pg, 'Dark')
    pg.close()
    for w in (NARROW, WIDE):
        pg = t.open('light', width=w)
        t.layout(pg, f'{w}px')
        pg.close()
    t.close_pages()


def generic_react(t):
    t.kind, t.fn = 'react', 'generic'
    for theme in ('light', 'dark'):
        pg = t.open_react(theme=theme)
        if theme == 'light':
            cells = pg.evaluate('() => window.__cells || []')
            crashed = pg.evaluate('() => [...document.querySelectorAll("[data-cell-error]")].map(p => p.closest("[data-cell]").dataset.cell + ": " + p.textContent)')
            empty = pg.evaluate('() => [...document.querySelectorAll("[data-cell]")].filter(s => !s.getBoundingClientRect().height).map(s => s.dataset.cell)')
            t.check('react: every cell renders', cells and not crashed and not empty, f'cells {cells}; crashed {crashed}; empty {empty}')
            t.check('react: no script error or React warning', not t.page_errors(pg), '; '.join(list(dict.fromkeys(t.page_errors(pg)))[:4]))
            t.labels(pg, 'react: every label names its control')
        t.scan(pg, f'react {theme.title()}')
        pg.close()
    for w in (NARROW, WIDE):
        pg = t.open_react(width=w)
        m = pg.evaluate('() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth })')
        t.check(f'react: no sideways scroll at {w}px', m['s'] <= m['c'] + 1, f"{m['s']}px in {m['c']}px")
        pg.close()
    t.close_pages()


# what parity leaves out of both trees: the address of a link (the previews link '#' or '#page-1' at will)
NORMALISE = [(re.compile(r'^\s*- /url: .*\n?', re.M), ''), (re.compile(r'[ \t]+$', re.M), '')]


def normalise(tree):
    for rx, to in NORMALISE:
        tree = rx.sub(to, tree)
    return tree.strip()


def parity(t):
    """Each pair in PARITY: the same accessibility tree in the HTML preview and in the React cell."""
    t.kind, t.fn = 'parity', 'PARITY'
    pairs = getattr(t.module, 'PARITY', [])
    if not pairs:
        return
    h = t.open('light')
    r = t.open_react(theme='light')
    for html_sel, cell, react_sel in pairs:
        label = f'parity: {html_sel} = {cell} {react_sel}'
        try:
            a = normalise(t.tree(h.locator(html_sel)))
            loc = t.cell(r, cell).locator(react_sel) if react_sel else t.cell(r, cell)
            b = normalise(t.tree(loc))
            t.check(label, a == b, diff(a, b))
        except Exception as e:
            t.note_error(label, e)
    t.close_pages()


def diff(a, b):
    import difflib
    d = [l for l in difflib.unified_diff(a.split('\n'), b.split('\n'), 'html', 'react', lineterm='', n=1)][2:]
    return '\n'.join(d[:40])


def run_block(browser, name, only=None):
    """A block is a page made of components: it loads without an error, its labels name their controls, and axe-core finds
    nothing against WCAG 2.2 A and AA in Light and Dark, at 390 and 1440px. What a block may be excused, with the reason, is
    in tests/blocks.py (AXE_SKIP and XFAIL by block)."""
    start = time.time()
    spec = importlib.util.spec_from_file_location('tray_test_blocks', TESTS / 'blocks.py')
    mod = None
    if (TESTS / 'blocks.py').exists():
        mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    own = type('BlockModule', (), {'AXE_SKIP': getattr(mod, 'AXE_SKIP', {}).get(name, {}), 'XFAIL': getattr(mod, 'XFAIL', {}).get(name, {}),
                                   'AXE_EXCLUDE': getattr(mod, 'AXE_EXCLUDE', {}).get(name, {})})
    t = T(browser, name, BLOCKS, own)
    t.kind, t.fn = 'block', 'block'
    if only and not any(o in 'block' for o in only):  # -k names steps: a block's checks are its one step, "block"
        return t.results, time.time() - start
    try:
        for w in (NARROW, WIDE):
            for theme in ('light', 'dark'):
                pg = t.open(theme, width=w, height=844 if w == NARROW else 900)
                if theme == 'light':
                    t.check(f'loads without a script error at {w}px', not t.page_errors(pg), '; '.join(t.page_errors(pg)[:4]))
                    t.labels(pg, f'every label names its control at {w}px')
                t.scan(pg, f'{theme.title()} at {w}px')
                pg.close()
    except Exception as e:
        t.note_error('the block could be checked', e)
        if not browser.alive():
            browser.launch()
    finally:
        t.close_pages()
    return t.results, time.time() - start


def run_component(browser, name, group, only=None, skip_generic=False, react=True):
    """Run every check of one component; returns its results and the time it took."""
    start = time.time()
    mod = load_module(name)
    t = T(browser, name, group, mod)
    if mod is None:
        t.kind, t.fn = 'html', 'module'
        t.check('has a test module', False, f'tests/components/{name}.py is missing')
    steps = []
    if not skip_generic:
        steps.append(('generic', generic))
        if react and has_react(name) and getattr(mod, 'REACT', True):
            steps.append(('generic_react', generic_react))
    if react and has_react(name) and getattr(mod, 'REACT', True) and getattr(mod, 'PARITY', None):
        steps.append(('PARITY', parity))
    if mod is not None:
        for k, fn in vars(mod).items():
            if k.startswith('test_') and callable(fn):
                kind = 'parity' if k.startswith('test_parity') or k.startswith('test_react_') or k == 'test_react' else 'html'
                if kind == 'parity' and not (react and has_react(name)):
                    continue
                steps.append((k, (lambda f, kd: (lambda tt: (setattr(tt, 'kind', kd), f(tt))))(fn, kind)))
    for k, fn in steps:
        if only and not any(o in k for o in only):
            continue
        t.fn = k
        before = len(t.results)
        try:
            fn(t)
        except Exception as e:
            t.note_error(f'{k} ran to its end', e)
            if not browser.alive():
                browser.launch()
        finally:
            t.close_pages()
        if len(t.results) == before:
            t.check(f'{k} checked something', False, 'the test made no check')
    return t.results, time.time() - start
