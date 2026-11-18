"""Breadcrumb: README.md. A <nav> landmark named "Breadcrumb" (a second trail named apart) around an ordered list of
links; the last level is a span with aria-current="page", announced as the current page and not a link; the chevrons are
drawn by CSS with no text and mirror right to left; the "more" button is an icon button with an aria-label; links take the
3px ink focus ring; the current page is ink and semibold."""


def test_tree(t):
    pg = t.open()
    t.match_tree('the trail: a named navigation landmark around a list of links, the current page not a link', pg.locator('nav').first, '''
- navigation "Breadcrumb":
  - list:
    - listitem:
      - link "Orders"
    - listitem:
      - link "November"
    - listitem: PL-20418
''')
    t.match_tree('a second trail has a name of its own, and its "more" button is named', pg.locator('nav').nth(1), '''
- navigation "Breadcrumb, shortened":
  - list:
    - listitem:
      - link "Farm"
    - listitem:
      - button "Show the levels between"
    - listitem:
      - link "Bed A"
    - listitem: Night walk, 12 June
''')
    cur = pg.locator('[aria-current="page"]').first
    t.eq('the current page is a span, not a link', cur.evaluate('e => e.tagName'), 'SPAN')
    t.eq('the current page is semibold', t.style(cur, 'font-weight'), '600')
    t.check('the chevrons are drawn with no text', pg.evaluate('''() => [...document.querySelectorAll('.tray-crumbs li + li')].every(li => getComputedStyle(li, '::before').content === '""')'''))
    t.match_tree('the back link of a phone is a link', pg.locator('.tray-back'), '- link "All field notes"')


def test_keys(t):
    pg = t.open()
    pg.keyboard.press('Tab')
    seq = [t.focused(pg)['text'] or t.focused(pg)['label']] + [f['text'] or f['label'] for f in t.tab_through(pg, 4)]
    t.eq('Tab goes through the links and the "more" button, never the current page', seq, ['Orders', 'November', 'Farm', 'Show the levels between', 'Bed A'])
    ring = t.style(pg.locator('.tray-crumbs a', has_text='Bed A'), 'outline-style', 'outline-width')
    t.eq('a focused link takes the 3px ring', (ring['outline-style'], ring['outline-width']), ('solid', '3px'))


def test_rtl(t):
    pg = t.open(rtl=True)
    tr = pg.evaluate('''() => getComputedStyle(document.querySelector('.tray-crumbs li + li'), '::before').transform''')
    ltr = t.open().evaluate('''() => getComputedStyle(document.querySelector('.tray-crumbs li + li'), '::before').transform''')
    t.check('the chevron mirrors on a right-to-left page', tr != ltr and tr != 'none', f'rtl {tr}, ltr {ltr}')


PARITY = [
    ('nav[aria-label="Breadcrumb"]', 'Trail', 'nav'),
    ('nav[aria-label="Breadcrumb, shortened"]', 'Shortened', 'nav'),
    ('.tray-back', 'BackLink', '.tray-back'),
]
