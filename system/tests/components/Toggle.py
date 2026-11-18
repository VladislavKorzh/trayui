"""Toggle: README.md. A <button> whose aria-pressed carries the state (announced pressed or not pressed); Enter or Space
flips it and it fires tray:change with detail.pressed; its name is its label or its aria-label and stays the same in both
states; data-when icons swap with the state; pressed is solid ink, and with forced colours the system's colours for a
chosen item; focus draws the 3px ink ring outside it; the xs toggle reaches 44px past its edge."""


def test_tree(t):
    pg = t.open()
    t.match_tree('toggle buttons with their pressed state', pg.locator('.tray-demo'), '''
- button "Bold" [pressed]
- button "Italic"
- button "Pin"
- button "Notify me" [pressed]
- button "Dark theme"
- button "Favourite"
- button "Locked" [disabled]
''')
    n = t.ax(pg.locator('.tray-toggle').nth(1))
    t.eq('an unpressed toggle is announced as not pressed', (n['role'], n['name'], n.get('pressed')), ('button', 'Italic', 'false'))


def drive(t, pg, scope, who='', events=True):
    """Press the "Pin" toggle from the keyboard: Enter, then Space."""
    t.clear_events(pg)
    pin = scope.get_by_role('button', name='Pin', exact=True)
    pin.focus()
    pg.keyboard.press('Enter')
    t.eq(who + 'Enter presses it', pin.get_attribute('aria-pressed'), 'true')
    pg.keyboard.press('Space')
    t.eq(who + 'Space releases it', pin.get_attribute('aria-pressed'), 'false')
    if events:  # the React twin reports through onPressedChange, not with tray:change
        t.eq(who + 'it fires tray:change with detail.pressed', [e['detail'] for e in t.events(pg, 'tray:change')], [{'pressed': True}, {'pressed': False}])
    t.eq(who + 'the name stays the same in both states', t.ax(pin)['name'], 'Pin')


def test_keys(t):
    pg = t.open()
    drive(t, pg, pg.locator('.tray-demo'))
    theme = pg.get_by_role('button', name='Dark theme')
    shown = lambda: theme.evaluate('e => [...e.querySelectorAll("[data-when]")].filter(s => s.offsetParent !== null).map(s => s.dataset.when).join()')
    t.eq('the theme switch shows the moon while off', shown(), 'off')
    theme.click()
    t.eq('and the sun while on', shown(), 'on')
    t.eq('its name does not change', t.ax(theme)['name'], 'Dark theme')
    pg.locator('.tray-toggle').first.focus()
    pg.keyboard.press('Shift+Tab')
    pg.keyboard.press('Tab')
    ring = t.style(pg.locator('.tray-toggle').first, 'outline-style', 'outline-width', 'outline-offset')
    t.eq('focus draws a 3px ring outside it', (ring['outline-style'], ring['outline-width'], ring['outline-offset']), ('solid', '3px', '3px'))
    w, h = t.hit(pg.locator('.tray-toggle--xs'))
    t.check('the xs toggle is 40px to the eye and reaches 44px', round(pg.locator('.tray-toggle--xs').evaluate('e => e.getBoundingClientRect().height')) == 40 and h >= 44 and w >= 44, f'{w}x{h}')


def test_pressed_look(t):
    pg = t.open()
    ink = pg.evaluate('() => { const i = document.createElement("i"); i.style.color = "var(--ink)"; document.body.append(i); const v = getComputedStyle(i).color; i.remove(); return v; }')
    t.eq('pressed is solid ink', t.style(pg.locator('.tray-toggle[aria-pressed="true"]').first, 'background-color'), ink)
    pg = t.open(forced=True)
    sc = t.system_colors(pg)
    on = t.style(pg.locator('.tray-toggle[aria-pressed="true"]').first, 'background-color', 'color')
    t.eq('with forced colours a pressed toggle takes SelectedItem and SelectedItemText', (on['background-color'], on['color']), (sc['SelectedItem'], sc['SelectedItemText']))
    off = t.style(pg.locator('.tray-toggle[aria-pressed="false"]').first, 'border-top-style')
    t.eq('and one that is not pressed keeps an edge', off, 'solid')


def test_parity_keys(t):
    pg = t.open_react()
    drive(t, pg, t.cell(pg, 'Toolbar'), 'react: ', events=False)


PARITY = [('.tray-demo', 'Toolbar', '.tray-row')]
