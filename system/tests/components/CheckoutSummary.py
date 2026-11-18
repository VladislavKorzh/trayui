"""Checkout Summary: README.md. An <aside> named by its heading through aria-labelledby (a landmark called "Your plan");
the lines a list with role="list", each read as its name, the note in <small>, then the amount; a discount written with
the minus sign; the promo code field named by its visible <label> (not a placeholder); the total; a pay button that
repeats the amount. Each line has its name at the start edge and its amount at the end edge, in either direction."""


def test_tree(t):
    pg = t.open()
    aside = pg.locator('aside.tray-summary')
    a = t.ax(aside)
    t.eq('the aside is a complementary landmark named by its heading', (a['role'], a['name']), ('complementary', 'Your plan'))
    t.match_tree('the lines, the promo field, the total and the pay button', aside, '''
- heading "Your plan" [level=2]
- list:
  - listitem: Shop plan 12 months at $24, billed yearly $288.00
  - listitem: Two extra seats 12 months at $4 each $96.00
  - listitem: "Promo code AUTUMN 10% off the first year −$38.40"
  - listitem: VAT 20% $69.12
- textbox "Promo code": AUTUMN
- button "Apply"
- paragraph: Total today $414.72
- button "Pay $414.72"
- paragraph: Renews on 15 November 2027. Cancel any time.
''')
    for sel in ('aside .tray-summary__lines', '.tray-stack .tray-summary__lines'):
        t.eq(f'the lines without markers are still a list ({sel})', t.ax(pg.locator(sel))['role'], 'list')
    t.check('the discount is written with the minus sign U+2212, so it is read as minus', '−$38.40' in pg.inner_text('aside .tray-summary__line:nth-child(3)'), pg.inner_text('aside .tray-summary__line:nth-child(3)'))
    promo = t.ax(pg.locator('#sum-promo'))
    t.check('the promo field is named by its visible label, and stays named once filled', promo['name'] == 'Promo code' and pg.get_attribute('#sum-promo', 'placeholder') is None, promo)
    t.check('the lock in the note is hidden from screen readers', pg.get_attribute('.tray-summary__note svg', 'aria-hidden') == 'true')
    t.check('the pay button repeats the amount of the total', pg.inner_text('aside .tray-summary__total span:last-child').strip() in pg.inner_text('aside .tray-btn--block'))
    t.check('a summary that never changes has no live region', pg.locator('aside [aria-live], aside [role="status"]').count() == 0)


EDGES = r"""() => [...document.querySelectorAll('.tray-summary__line, .tray-summary__total')].map(l => { const b = l.getBoundingClientRect(), n = l.firstElementChild.getBoundingClientRect(), m = l.lastElementChild.getBoundingClientRect();
  return getComputedStyle(l).direction === 'rtl' ? [Math.round(b.right - n.right), Math.round(m.left - b.left)] : [Math.round(n.left - b.left), Math.round(b.right - m.right)]; })"""


def test_edges(t):
    for rtl in (False, True):
        pg = t.open(rtl=rtl)
        gaps = pg.evaluate(EDGES)
        t.check(f'{"right to left: " if rtl else ""}each name sits at the start edge and each amount at the end edge', gaps and all(abs(g[0]) <= 1 and abs(g[1]) <= 1 for g in gaps), gaps)
        pg.close()
    pg = t.open(width=390)
    t.scan(pg, '390px')


PARITY = [('aside.tray-summary', 'YearlyPlan', 'aside.tray-summary'), ('.tray-stack .tray-summary', 'SingleItem', '.tray-summary')]
