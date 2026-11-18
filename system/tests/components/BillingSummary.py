"""Billing Summary: README.md. Two cards, each opened by a heading: the plan on an ink card (a badge read as its word, the
price, the renewal date in full, "Change plan" and "Cancel plan" named for their outcome) and the next invoice as a
Description List, each fact under its term. On the ink card the focus ring takes its on-dark step and shows on the dark
ground. tray-billing lays the cards side by side from 20rem each and stacks them below that."""

RING = r"""(el) => {
  const parse = (s) => (s.match(/[\d.]+/g) || []).map(Number);
  const lum = (c) => { const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  let bg = [255, 255, 255];
  for (let g = el.parentElement; g; g = g.parentElement) { const c = parse(getComputedStyle(g).backgroundColor); if (c.length >= 3 && (c[3] === undefined || c[3] > .5)) { bg = c; break; } }
  const cs = getComputedStyle(el), o = parse(cs.outlineColor), a = lum(o), b = lum(bg);
  return { style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05), visible: el.matches(':focus-visible') };
}"""


def tab_to(pg, loc, limit=30):
    for _ in range(limit):
        pg.keyboard.press('Tab')
        if loc.evaluate('e => e === document.activeElement'):
            return True
    return False


def test_tree(t):
    pg = t.open()
    t.match_tree('the plan card: heading, badge as a word, price, renewal, two actions named for their outcome', pg.locator('.tray-card--inverse'), '''
- paragraph: Current plan
- heading "Shop" [level=2]
- text: Active
- paragraph: $29 a month
- paragraph: Renews on 1 December 2026.
- link "Change plan"
- button "Cancel plan"
''')
    t.match_tree('the next invoice: a heading, then each fact under its term', pg.locator('.tray-billing > .tray-card:not(.tray-card--inverse)'), '''
- heading "Next invoice" [level=2]
- term: Date
- definition: 1 December 2026
- term: Shop plan
- definition: $29.00
- term: Two extra seats
- definition: $10.00
- term: Total
- definition: $39.00
- term: Paid with
- definition: Card ending 4242
- link "Change the card"
- link "All invoices"
''')
    heads = pg.evaluate('''() => [...document.querySelectorAll('.tray-billing > section')].map(s => { const h = s.querySelector('h1, h2, h3, h4, h5, h6');
        const before = h ? [...s.querySelectorAll('a, button, input, dl')].filter(n => n.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING).length : -1; return before; })''')
    t.eq('each card opens with a heading, before any of its facts or actions', heads, [0, 0])
    badge = t.ax(pg.locator('.tray-card--inverse .tray-badge'))
    t.check('the badge is plain text with no role, out of the Tab order', badge['role'] in ('generic', 'StaticText', 'none') and not badge.get('focusable'), badge)
    t.check('the renewal date is printed in full, with the year', '1 December 2026' in pg.inner_text('.tray-card--inverse'))


def test_ring_on_ink(t):
    for theme in ('light', 'dark'):
        pg = t.open(theme)
        btn = pg.locator('.tray-card--inverse .tray-btn').first
        t.check(f'[{theme}] Tab reaches "Change plan"', tab_to(pg, btn))
        r = btn.evaluate(RING)
        inverse = pg.evaluate('() => { const p = document.createElement("i"); p.style.color = "var(--on-inverse)"; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; }')
        t.check(f'[{theme}] the focus ring on the ink card is a solid 3px ring in the on-dark ink', r['visible'] and r['style'] == 'solid' and r['width'] == '3px' and r['color'] == inverse, f'{r}, on-inverse {inverse}')
        t.check(f'[{theme}] the ring shows on the dark ground: at least 3:1', r['ratio'] >= 3, r)
        pg.close()


def test_layout(t):
    for w, side in ((1440, True), (390, False)):
        pg = t.open(width=w)
        a, b = [pg.locator('.tray-billing > section').nth(i).bounding_box() for i in (0, 1)]
        if side:
            t.check(f'at {w}px the two cards sit side by side', abs(a['y'] - b['y']) < 2 and b['x'] >= a['x'] + a['width'], (a, b))
        else:
            t.check(f'at {w}px the cards stack', b['y'] >= a['y'] + a['height'] and abs(a['x'] - b['x']) < 2, (a, b))
        if w == 390:
            t.scan(pg, '390px')
        pg.close()


PARITY = [('.tray-billing', 'Active', '.tray-billing')]
