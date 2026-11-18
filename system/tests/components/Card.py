"""Card: README.md. A card has no role: a screen reader hears its heading and content; <a class="tray-card"> is one link
named by all its text, heading first, with no control inside; the 3px focus ring goes round the whole card, and on the
yellow and the ink card it takes the theme's ink so it shows on the page around them; 40px corners, a panel 28px; below
56rem every card of a bento takes the full width."""

RING = '''e => { const c = getComputedStyle(e); return { style: c.outlineStyle, width: c.outlineWidth, offset: c.outlineOffset, color: c.outlineColor }; }'''
PAGE_INK = '(() => { const p = document.createElement("i"); p.style.color = "var(--ink)"; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; })()'


def test_tree(t):
    pg = t.open()
    roles = pg.evaluate('[...document.querySelectorAll(".tray-card")].map(e => e.getAttribute("role"))')
    t.check('no card carries a role', all(r is None for r in roles), roles)
    t.eq('a section card is not a landmark: it has no name, so a screen reader hears its heading', t.ax(pg.locator('section.tray-card').first)['name'], '')
    t.match_tree('a link card is one link named by all its text, its heading first', pg.locator('.tray-bento'), '''
- link "A night on the farm Snails wake after sunset. Twice a week, so do we. 12 June 2026":
  - heading "A night on the farm" [level=3]
''')
    t.eq('a link card holds no other control', pg.evaluate('document.querySelectorAll("a.tray-card :is(a, button, input, select, textarea)").length'), 0)


def test_focus(t):
    for theme in ('light', 'dark'):
        pg = t.open(theme)
        link = pg.locator('a.tray-card')
        pg.locator('body').press('Tab')
        n = 0
        while not t.is_focused(link) and n < 8:
            pg.keyboard.press('Tab'); n += 1
        ink = pg.evaluate(PAGE_INK)
        for tone in ('tray-card--leaf', 'tray-card--accent', 'tray-card--inverse'):
            link.evaluate('(e, c) => { e.classList.remove("tray-card--leaf", "tray-card--accent", "tray-card--inverse"); e.classList.add(c); }', tone)
            ring = link.evaluate(RING)
            t.eq(f'{theme}: a focused {tone} link takes the 3px ring of the page\'s ink, 3px out', ring, {'style': 'solid', 'width': '3px', 'offset': '3px', 'color': ink})
        pg.close()


def test_layout(t):
    for w, full in ((1440, False), (800, True)):
        pg = t.open(width=w)
        widths = pg.evaluate('[...document.querySelectorAll(".tray-bento > .tray-card")].map(c => Math.round(c.getBoundingClientRect().width))')
        bento = pg.evaluate('Math.round(document.querySelector(".tray-bento").getBoundingClientRect().width)')
        if full:
            t.check(f'below 56rem every card takes the full width ({w}px)', all(abs(x - bento) <= 1 for x in widths), (widths, bento))
        else:
            t.check(f'at {w}px the cards share their rows in unequal widths', len(set(widths)) > 1 and max(widths) < bento, (widths, bento))
        pg.close()
    pg = t.open()
    t.eq('a card has 40px corners and a panel 28px', pg.evaluate('[getComputedStyle(document.querySelector(".tray-card")).borderTopLeftRadius, getComputedStyle(document.querySelector(".tray-panel")).borderTopLeftRadius]'), ['40px', '28px'])
    t.eq('cards are flat: no border, no shadow', pg.evaluate('[...document.querySelectorAll(".tray-card")].map(c => getComputedStyle(c).borderTopStyle + " " + getComputedStyle(c).boxShadow).filter(s => s !== "none none")'), [])


def test_parity_markup(t):
    """The React Card renders the same classes for its tones, its link form and its panel."""
    r = t.open_react()
    t.eq('React: the tones are the classes of the HTML cards',
         t.cell(r, 'Tones').evaluate('c => [...c.querySelectorAll(".tray-bento > *")].map(e => [...e.classList].filter(k => k.startsWith("tray-card")).join("."))'),
         ['tray-card.tray-card--accent', 'tray-card.tray-card--inverse', 'tray-card.tray-card--leaf', 'tray-card'])
    t.eq('React: a panel inside a card is tray-panel, not a card in a card', t.cell(r, 'Tones').locator('.tray-card .tray-card').count(), 0)
    t.eq('React: href makes the whole card one link with the heading first', t.cell(r, 'AsLink').evaluate('c => [...c.querySelectorAll("a.tray-card")].map(a => a.firstElementChild && a.querySelector("h1, h2, h3, h4") ? a.querySelector("h1, h2, h3, h4").textContent : null)'),
         ['Field notes', 'How to serve it'])
    pg = t.open_react(theme='dark')
    link = t.cell(pg, 'AsLink').locator('a.tray-card').first
    link.focus(); pg.keyboard.press('Shift+Tab'); pg.keyboard.press('Tab')
    t.eq('React: a focused link card takes the same ring', link.evaluate(RING)['width'], '3px')
