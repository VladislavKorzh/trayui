"""Pagination: README.md. A <nav> named by its aria-label around a list of links; the current page carries
aria-current="page" (announced, and drawn in ink from that attribute); pages are 44px targets; the gap is aria-hidden; a
step that cannot be used has no href, role="link" and aria-disabled="true", and keeps its aria-label; the compact form's
steps are icons named by aria-label; each page takes the 3px ink focus ring; with forced colours the current page takes
the system's colours for a chosen item."""


def test_tree(t):
    pg = t.open()
    t.match_tree('a named navigation around a list of page links, the current one marked, the gap hidden', pg.locator('nav').first, '''
- navigation "Pages":
  - list:
    - listitem:
      - link "Previous"
    - listitem:
      - link "1"
    - listitem:
      - link "2"
    - listitem:
      - link "3"
    - listitem
    - listitem:
      - link "12"
    - listitem:
      - link "Next"
''')
    cur = pg.locator('[aria-current="page"]')
    t.eq('the current page is the link "2", marked aria-current="page"', (t.ax(cur)['role'], t.ax(cur)['name'], cur.get_attribute('aria-current')), ('link', '2', 'page'))
    t.check('the gap is hidden from screen readers', t.ax(pg.locator('.tray-page--gap'))['ignored'])
    t.match_tree('the compact form: icon steps named by aria-label, the one that cannot be used disabled', pg.locator('nav').nth(1), '''
- navigation "Pages, compact":
  - list:
    - listitem:
      - link "Previous page" [disabled]
    - listitem: Page 1 of 12
    - listitem:
      - link "Next page"
''')
    off = pg.locator('[aria-disabled="true"]')
    t.check('a step that cannot be used has no href and takes role="link"', off.get_attribute('href') is None and off.get_attribute('role') == 'link')


def test_look(t):
    pg = t.open()
    ink = pg.evaluate('() => { const i = document.createElement("i"); i.style.color = "var(--ink)"; document.body.append(i); const v = getComputedStyle(i).color; i.remove(); return v; }')
    t.eq('the current page is solid ink', t.style(pg.locator('[aria-current="page"]'), 'background-color'), ink)
    for a in pg.locator('a.tray-page').all():
        h = round(a.evaluate('e => e.getBoundingClientRect().height'))
        if h < 44:
            t.check(f'page "{a.inner_text() or a.get_attribute("aria-label")}" is a 44px target', False, h)
    t.check('every page is a 44px target', all(round(a.evaluate('e => e.getBoundingClientRect().height')) >= 44 for a in pg.locator('a.tray-page').all()))
    pg.locator('a.tray-page').first.focus()
    pg.keyboard.press('Shift+Tab')
    pg.keyboard.press('Tab')
    t.eq('a focused page takes the 3px ring', t.style(pg.locator('a.tray-page').first, 'outline-width'), '3px')
    seq = [f['text'] or f['label'] for f in t.tab_through(pg, 6)]
    t.eq('Tab passes over the gap and the step that cannot be used', seq, ['1', '2', '3', '12', 'Next', 'Next page'])
    pg = t.open(forced=True)
    sc = t.system_colors(pg)
    c = t.style(pg.locator('[aria-current="page"]'), 'background-color', 'color')
    t.eq('with forced colours the current page takes SelectedItem', (c['background-color'], c['color']), (sc['SelectedItem'], sc['SelectedItemText']))
    t.eq('and a step that cannot be used is GrayText', t.style(pg.locator('[aria-disabled="true"]'), 'color'), sc['GrayText'])


def bare(tree):
    """An aria snapshot without the addresses of its links: the two previews link different places."""
    return '\n'.join(l for l in tree.split('\n') if not l.strip().startswith('- /url:'))


def test_parity_trees(t):
    h, r = t.open(), t.open_react()
    for sel, cell in (('nav[aria-label="Pages"]', 'Numbers'), ('nav[aria-label="Pages, compact"]', 'Compact')):
        a, b = bare(t.tree(h.locator(sel))), bare(t.tree(t.cell(r, cell).locator('nav')))
        t.check(f'parity: {sel} = {cell} nav', a == b, f'html:\n{a}\nreact:\n{b}')

