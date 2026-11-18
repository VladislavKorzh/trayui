"""Spinner: README.md. The ring carries aria-hidden; role="status" on tray-loading makes the words a polite live region; a
busy button keeps words that say what it is doing beside its aria-busy="true"; under prefers-reduced-motion: reduce the
ring turns slowly instead of stopping. Sizes 16, 20 and 32px."""


def test_tree(t):
    pg = t.open()
    t.match_tree('the loading line is a status, the busy button says what it does', pg.locator('.tray-demo'), '''
- status: Sending the order
- button "Paying"
- text: Syncing
''')
    t.check('every ring is aria-hidden', pg.evaluate('[...document.querySelectorAll(".tray-spinner")].every(s => s.getAttribute("aria-hidden") === "true")'))
    t.eq('the busy button carries aria-busy', pg.get_attribute('.tray-btn[aria-busy]', 'aria-busy'), 'true')
    a = t.ax(pg.locator('.tray-loading'))
    t.eq('the status region is polite', (a['role'], a.get('live')), ('status', 'polite'))
    # offsetWidth, not the bounding box: the ring turns, and a turned square has a wider box
    sizes = pg.evaluate('[...document.querySelectorAll(".tray-demo > .tray-spinner")].map(s => s.offsetWidth)')
    t.eq('the three sizes are 16, 20 and 32px', sizes, [16, 20, 32])


def test_motion(t):
    pg = t.open(motion='no-preference')
    spin = t.style(pg.locator('.tray-demo > .tray-spinner').nth(1), 'animation-name', 'animation-duration')
    t.eq('the ring turns', (spin['animation-name'], spin['animation-duration']), ('tray-spin', '0.8s'))
    pg.close()
    pg = t.open(motion='reduce')
    spin = t.style(pg.locator('.tray-demo > .tray-spinner').nth(1), 'animation-name', 'animation-duration')
    t.eq('under reduced motion it turns slowly instead of stopping', (spin['animation-name'], spin['animation-duration']), ('tray-spin', '2.4s'))
    spin = t.style(pg.locator('.tray-btn .tray-spinner'), 'animation-name', 'animation-duration')
    t.eq('the ring of a busy button too', (spin['animation-name'], spin['animation-duration']), ('tray-spin', '2.4s'))


def test_react(t):
    pg = t.open_react()
    cell = t.cell(pg, 'Sizes')
    t.match_tree('react: a spinner with a label is a status that says it', cell, '''
- status: Checking the address
- status: Sending the order
- status: Loading the season
''')
    t.check('react: its ring is aria-hidden', cell.evaluate('c => [...c.querySelectorAll(".tray-spinner")].every(s => s.getAttribute("aria-hidden") === "true")'))
    btn = t.cell(pg, 'InAButton').locator('button').first
    t.eq('react: a busy button carries aria-busy and its words', (btn.get_attribute('aria-busy'), btn.inner_text().strip()), ('true', 'Placing the order'))
