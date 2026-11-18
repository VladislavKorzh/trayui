"""Scroll Area: README.md. With tabindex="0", role="region" and an aria-label it is a named region Tab reaches; once
focused the arrow keys, PageUp, PageDown, Home and End scroll it, as the browser does; it draws the 3px ink ring; its height
comes from --tray-scroll; tray-scroll--x lays its child out on one line and scrolls sideways."""


def still(pg, loc):
    """Wait until the box stops scrolling: the browser animates the scroll of a key press."""
    loc.evaluate('''e => new Promise((done) => { let last = null, same = 0; const step = () => { const now = e.scrollTop + ',' + e.scrollLeft;
        same = now === last ? same + 1 : 0; last = now; if (same >= 3) done(); else requestAnimationFrame(step); }; requestAnimationFrame(step); setTimeout(done, 1500); })''')


def test_tree(t):
    pg = t.open()
    t.match_tree('two named regions', pg.locator('.tray-demo'), '''
- region "Pickup points":
  - list
- region "Filters"
''')
    t.eq('the height comes from --tray-scroll (13rem)', t.style(pg.locator('.tray-scroll').first, 'max-height'), '208px')


def test_keys(t):
    pg = t.open()
    box = pg.locator('[aria-label="Pickup points"]')
    pg.locator('body').press('Tab')
    t.eq('Tab reaches the area', t.focused(pg)['label'], 'Pickup points')
    ink = pg.evaluate('getComputedStyle(document.body).color')
    t.eq('focus draws the 3px ink ring round it', t.style(box, 'outline-style', 'outline-width', 'outline-color'), {'outline-style': 'solid', 'outline-width': '3px', 'outline-color': ink})
    top = lambda: box.evaluate('e => e.scrollTop')
    pg.keyboard.press('ArrowDown'); still(pg, box)
    t.check('ArrowDown scrolls it', top() > 0, top())
    pg.keyboard.press('End'); still(pg, box)
    t.check('End scrolls it to the end', box.evaluate('e => Math.abs(e.scrollTop + e.clientHeight - e.scrollHeight) <= 1'), box.evaluate('e => [e.scrollTop, e.clientHeight, e.scrollHeight]'))
    pg.keyboard.press('Home'); still(pg, box)
    t.eq('Home scrolls it back to the start', top(), 0)
    pg.keyboard.press('PageDown'); still(pg, box)
    t.check('PageDown scrolls a page', top() > 0, top())
    pg.keyboard.press('Tab')
    t.eq('Tab moves on to the sideways area', t.focused(pg)['label'], 'Filters')
    side = pg.locator('[aria-label="Filters"]')
    t.check('tray-scroll--x keeps its child on one line, wider than the box', side.evaluate('e => e.scrollWidth > e.clientWidth && new Set([...e.querySelectorAll(".tray-chip")].map(c => Math.round(c.getBoundingClientRect().top))).size === 1'))
    pg.keyboard.press('ArrowRight'); still(pg, side)
    t.check('ArrowRight scrolls it sideways', side.evaluate('e => e.scrollLeft') > 0, side.evaluate('e => e.scrollLeft'))


PARITY = [('[aria-label="Pickup points"]', 'Vertical', '[role="region"]'),
          ('[aria-label="Filters"]', 'Sideways', '[role="region"]')]


def test_parity_markup(t):
    r = t.open_react()
    t.eq('React: each area is focusable, a region, named', r.evaluate('[...document.querySelectorAll("[data-cell] .tray-scroll")].map(e => [e.tabIndex, e.getAttribute("role"), !!e.getAttribute("aria-label")])'), [[0, 'region', True], [0, 'region', True]])
