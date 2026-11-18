"""Integration Card: README.md. Each card is an <article>; the switch is a checkbox with role="switch", announced on or off,
flipped by Space, named by the service; Connect, Fix and Settings hold the service in their names after the visible word;
the mark is decoration; a failed connection is said in words with an icon, in danger; the grid takes cards of at least
17rem that fill the row."""


def test_tree(t):
    pg = t.open()
    t.match_tree('articles, each with its switch or button, its name, what it does, its state and settings', pg.locator('.tray-integrations'), '''
- article:
  - switch "Courier tracking" [checked]
  - text: Courier tracking
  - paragraph: Shows where each box is and tells the customer.
  - text: On since 2 November
  - link "Settings for Courier tracking"
- article:
  - switch "Accounting export" [checked]
- article:
  - button "Connect Chat alerts"
  - text: Chat alerts
- article:
  - button "Fix Email receipts"
  - text: Email receipts
  - paragraph: Sends the customer a receipt from your own address.
  - text: The address needs to be confirmed again
- article:
  - button "Upgrade Webhooks"
- article:
  - button "Connect Spreadsheet sync"
''')
    # WCAG 2.5.3, Label in Name: the name starts with the word the button or link shows
    bad = pg.evaluate('''[...document.querySelectorAll(".tray-integration [aria-label]")].filter(e => e.textContent.trim() && !e.getAttribute("aria-label").startsWith(e.textContent.trim()))
        .map(e => e.getAttribute("aria-label"))''')
    t.eq('every name starts with the visible word, then holds the service', bad, [])
    t.eq('the marks are decoration', pg.evaluate('[...document.querySelectorAll(".tray-integration__icon svg, .tray-integration__icon img")].every(i => i.getAttribute("aria-hidden") === "true" || i.getAttribute("alt") === "")'), True)


def test_switch(t):
    pg = t.open()
    sw = pg.locator('.tray-integration input[role="switch"]').first
    sw.focus()
    pg.keyboard.press('Space')
    t.eq('Space turns the switch off, and it is announced off', (sw.is_checked(), t.ax(sw).get('checked')), (False, 'false'))
    pg.keyboard.press('Space')
    t.eq('and on again', t.ax(sw).get('checked'), 'true')
    pg.locator('.tray-integration').first.locator('.tray-switch__track').click()
    t.check('a press on the drawn switch flips it too', not sw.is_checked())


def test_failed(t):
    pg = t.open()
    bad = pg.locator('.tray-integration__foot .tray-danger')
    danger = pg.evaluate('() => { const p = document.createElement("i"); p.style.color = "var(--danger)"; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; }')
    t.check('a failed connection is said in words, with an icon, in danger', 'confirmed again' in bad.inner_text() and bad.locator('svg').count() == 1 and t.style(bad, 'color') == danger)


def test_grid(t):
    for width in (1440, 390):
        pg = t.open(width=width)
        w = pg.evaluate('[...document.querySelectorAll(".tray-integration")].map(c => Math.round(c.getBoundingClientRect().width))')
        row = pg.locator('.tray-integrations').bounding_box()['width']
        if width == 390:
            t.check('on a phone each card takes the row', all(abs(x - row) <= 1 for x in w), (w, row))
        else:
            t.check('cards are at least 17rem wide and fill the row', min(w) >= 272 and len(set(w)) == 1, (w, row))
        pg.close()


def test_parity_switch(t):
    out = []
    for react in (False, True):
        pg = t.open(react=react)
        root = t.cell(pg, 'Grid') if react else pg
        sw = root.locator('input[role="switch"]').first
        sw.focus()
        pg.keyboard.press('Space')
        out.append((t.ax(sw)['name'], t.ax(sw).get('checked')))
    t.eq('React: the switch is named and flips as in the HTML', out[1], out[0])


PARITY = [('.tray-integrations', 'Grid', '.tray-integrations')]
