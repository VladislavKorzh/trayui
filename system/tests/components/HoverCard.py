"""Hover Card: README.md. The card has no role and is not tied to the link, so a screen reader reads the link alone. It
opens a quarter of a second after the pointer arrives or the link takes focus, and closes shortly after both have left;
Escape closes it at once while focus stays on the link. A control in the open card comes next in the Tab order, and the
card stays open while it has focus. Under reduced motion the card only fades, in 0.1s."""

ANCHOR = '[data-tray="hovercard"]'

# A floating panel that would leave the window is moved back inside it (fit() in 10-core.js): the card held open
# mid-sentence would pass the right edge at 390px.


def fits(t, react):
    pg = t.open(width=390, react=react)
    r = pg.locator('.tray-pop--card').first.bounding_box()
    t.check(('react: ' if react else '') + 'at 390px the open card stays inside the window', r['x'] >= 0 and r['x'] + r['width'] <= 390, r)


def test_fits_the_window(t):
    fits(t, False)


def test_react_fits_the_window(t):
    fits(t, True)


def closed(pg, scope=None):
    a = (scope or pg).locator(ANCHOR).first
    link, card = a.locator('> a'), a.locator('> .tray-pop')
    card.evaluate('c => { c.hidden = true; c.removeAttribute("data-open"); }')
    return a, link, card


def drive(t, pg, scope=None, where=''):
    a, link, card = closed(pg, scope)
    link.hover()
    pg.wait_for_timeout(120)
    t.check(f'{where}it does not open the moment the pointer arrives', not card.is_visible())
    pg.wait_for_timeout(250)
    t.check(f'{where}it opens a quarter of a second after', card.is_visible())
    pg.mouse.move(2, 2)
    pg.wait_for_timeout(60)
    t.check(f'{where}it stays a moment after the pointer leaves', card.is_visible())
    pg.wait_for_timeout(250)
    t.settle(pg)
    t.check(f'{where}then it closes', not card.is_visible())
    link.focus()
    pg.wait_for_timeout(350)
    t.check(f'{where}it opens on keyboard focus too', card.is_visible())
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check(f'{where}Escape closes it at once', not card.is_visible())
    t.check(f'{where}while focus stays on the link', link.evaluate('l => l === document.activeElement'), t.focused(pg))


def test_tree(t):
    pg = t.open()
    a = pg.locator(ANCHOR)
    x = t.ax(a.locator('> a'))
    t.eq('the link is read alone: its name, no description', (x['role'], x['name'], x['description']), ('link', 'Oksana Franko', ''))
    t.check('the link is not tied to the card (no aria-controls, aria-expanded, aria-haspopup, aria-describedby)',
            a.locator('> a').evaluate('l => !["aria-controls", "aria-expanded", "aria-haspopup", "aria-describedby"].some(n => l.hasAttribute(n))'))
    c = t.ax(a.locator('> .tray-pop'))
    t.check('the card has no role and no name', c['role'] in ('generic', 'none', None) and not c['name'], c)


def test_open_close(t):
    pg = t.open()
    drive(t, pg)


def test_control_in_card(t):
    pg = t.open()
    a, link, card = closed(pg)
    card.evaluate('c => { const b = document.createElement("a"); b.href = "#"; b.textContent = "Message Oksana"; c.firstElementChild.append(b); }')
    link.focus()
    pg.wait_for_timeout(350)
    pg.keyboard.press('Tab')
    pg.wait_for_timeout(350)
    f = t.focused(pg)
    t.check('a control in the open card comes next in the Tab order', f['text'] == 'Message Oksana', f)
    t.check('and the card stays open while it has focus', card.is_visible())
    pg.keyboard.press('Tab')
    pg.wait_for_timeout(300)
    t.settle(pg)
    t.check('it closes once focus has left both', not card.is_visible())


def test_motion(t):
    pg = t.open()
    a, link, card = closed(pg)
    link.focus()
    pg.wait_for_function('() => !document.querySelector("[data-tray=hovercard] > .tray-pop").hidden')
    anims = [x for x in t.running_animations(pg) if 'tray-pop' in str(x['target'])]
    names = {x['name'] for x in anims}
    t.check('reduced motion: the card only fades', 'opacity' in names and not names & {'scale', 'translate'}, anims)
    t.check('in a tenth of a second', max([x['duration'] for x in anims] or [0]) <= 100, anims)


PARITY = [('.tray-demo > p', 'Person', 'p')]


def test_parity_open_close(t):
    r = t.open_react()
    drive(t, r, t.cell(r, 'Person'), 'react: ')
