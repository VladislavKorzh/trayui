"""Collapsible: README.md. The browser's own <details>: Tab reaches the summary, Enter or Space opens and closes it, a
screen reader hears expanded or collapsed; the trigger's text is its name and the plus tile is aria-hidden; the trigger is at
least 44px tall with the 3px ink ring; the content unfolds to its height, and opens at once under reduced motion."""


def state(t, root):
    return [(t.ax(root.locator('summary').nth(i))['name'], t.ax(root.locator('summary').nth(i)).get('expanded')) for i in range(root.locator('summary').count())]


def test_tree(t):
    pg = t.open()
    root = pg.locator('.tray-demo')
    t.eq('each trigger is a disclosure named by its words, the first open', state(t, root), [('Show the figures', True), ('3 more recipients', False)])
    t.check('the plus tiles are hidden from screen readers', all(t.ax(pg.locator('.tray-tile').nth(i))['ignored'] for i in range(2)))
    t.match_tree('the open one shows its table', root, '''
- group:
  - text: Show the figures
  - table:
    - rowgroup:
      - row "Month Collected"
''')


def test_keys(t):
    pg = t.open()
    root = pg.locator('.tray-demo')
    pg.locator('body').press('Tab')
    t.eq('Tab reaches the first summary', t.focused(pg)['text'], 'Show the figures')
    pg.keyboard.press('Tab')
    t.eq('then the second: nothing inside the open one takes focus', t.focused(pg)['text'], '3 more recipients')
    pg.keyboard.press('Enter')
    t.eq('Enter opens it', state(t, root)[1][1], True)
    t.check('its content shows', pg.locator('.tray-collapsible__body').nth(1).is_visible())
    pg.keyboard.press('Space')
    t.eq('Space closes it', state(t, root)[1][1], False)
    t.eq('the trigger keeps its words, open or closed', state(t, root)[1][0], '3 more recipients')


def test_look(t):
    pg = t.open()
    s = pg.locator('summary').first
    w, h = t.hit(s)
    t.check('the trigger is at least 44px tall', h >= 44, (w, h))
    s.focus(); pg.keyboard.press('Shift+Tab'); pg.keyboard.press('Tab')
    ink = pg.evaluate('getComputedStyle(document.body).color')
    t.eq('it takes the 3px ink ring', t.style(s, 'outline-style', 'outline-width', 'outline-color'), {'outline-style': 'solid', 'outline-width': '3px', 'outline-color': ink})
    t.eq('the tile turns its plus into a cross when open', [t.style(pg.locator('.tray-tile .tray-icon').nth(i), 'transform') for i in range(2)][1], 'none')
    t.check('the open one is turned', t.style(pg.locator('.tray-tile .tray-icon').first, 'transform') != 'none')


def test_motion(t):
    for motion, moves in (('no-preference', True), ('reduce', False)):
        pg = t.open(motion=motion)
        m = t.style(pg.locator('details').nth(1), 'transition-property', 'transition-duration', pseudo='::details-content')
        t.check(f'the content {"unfolds" if moves else "opens at once"} ({motion})', ('block-size' in m['transition-property'] and m['transition-duration'] != '0s') == moves, m)
        pg.close()


PARITY = [('.tray-demo', 'OpenAndClosed', '.tray-stack')]


def test_parity_keys(t):
    r = t.open_react()
    cell = t.cell(r, 'OpenAndClosed')
    s = cell.locator('summary').nth(1)
    s.focus(); r.keyboard.press('Enter')
    t.eq('React: Enter opens it', state(t, cell)[1][1], True)
    r.keyboard.press('Space')
    t.eq('React: Space closes it', state(t, cell)[1][1], False)
    t.eq('React: the tile is hidden', cell.locator('.tray-tile').first.get_attribute('aria-hidden'), 'true')
    ctl = t.cell(r, 'Controlled')
    ctl.get_by_role('button', name='See why').click()
    t.eq('React: open={true} opens it from outside', state(t, ctl)[0], ('Delivery log', True))
