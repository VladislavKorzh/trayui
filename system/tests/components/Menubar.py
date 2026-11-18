"""Menubar: README.md, Accessibility. The strip becomes a role="menubar" named by its aria-label, each tab one of its
menuitems with aria-haspopup="menu" and aria-expanded; the bar is one Tab stop held by the tab last used; ArrowLeft and
ArrowRight move along it and wrap (mirrored right to left), Home and End go to its ends, and with a menu open the arrows
open the next one; ArrowDown, Enter or Space opens a menu on its first item. Inside: ArrowUp and ArrowDown move, Enter runs
an item, Escape closes the menu and returns focus to its tab; on a submenu's item ArrowRight opens it, inside it ArrowLeft
closes it and goes back to its item, and ArrowRight moves on to the next menu of the bar; with one menu open, pointing at
another opens it. Check and radio items announce aria-checked. Under reduced motion a menu only fades, in a tenth of a
second. A menu fires tray:select (an action) and tray:change (a check or radio item), as a Dropdown Menu does."""

BAR = '.tray-menubar'

# The preview holds the View menu open: at 390px it would end 5px past the window, and is moved back inside it (fit() in
# 10-core.js), which the generic "no sideways scroll at 390px" holds it to.


def tabs(scope):
    return scope.locator(f'{BAR} > .tray-anchor > button')


def name(t, pg):
    """What the focused tab or item is called, without the shortcut beside an item (which its accessible name also holds)."""
    f = pg.locator(':focus')
    if not f.count():
        return ''
    text = f.locator('.tray-option__text')
    return text.inner_text().strip() if text.count() else t.ax(f)['name']


def is_open(scope, i):
    return tabs(scope).nth(i).get_attribute('aria-expanded') == 'true'


def drive(t, pg, scope, who='', events=True):
    """The keys of the README on a bar of File, Edit and View, View open at first."""
    bar = scope.locator(BAR)
    pg.mouse.click(5, 5)  # close the menu the preview holds open
    t.settle(pg)
    t.clear_events(pg)
    t.eq(who + 'one Tab stop: only one tab is in the Tab order', tabs(scope).evaluate_all('ts => ts.map(t => t.tabIndex)').count(0), 1)
    tabs(scope).first.focus()
    pg.keyboard.press('ArrowLeft')
    t.eq(who + 'ArrowLeft from the first tab wraps to the last', name(t, pg), 'View')
    pg.keyboard.press('ArrowRight')
    t.eq(who + 'ArrowRight from the last wraps to the first', name(t, pg), 'File')
    pg.keyboard.press('End')
    t.eq(who + 'End goes to the end of the bar', name(t, pg), 'View')
    pg.keyboard.press('Home')
    t.eq(who + 'Home goes to its start', name(t, pg), 'File')
    pg.keyboard.press('ArrowRight')
    pg.keyboard.press('Tab')
    pg.keyboard.press('Shift+Tab')
    t.eq(who + 'the tab last used holds the Tab stop', name(t, pg), 'Edit')
    t.eq(who + 'and it is the only one in the Tab order', tabs(scope).evaluate_all('ts => ts.map(t => t.tabIndex)'), [-1, 0, -1])
    pg.keyboard.press('ArrowDown')
    t.check(who + 'ArrowDown opens the menu on its first item', is_open(scope, 1) and name(t, pg) == 'Undo', t.focused(pg))
    pg.keyboard.press('ArrowDown')
    t.eq(who + 'ArrowDown moves inside the menu', name(t, pg), 'Redo')
    pg.keyboard.press('ArrowUp')
    t.eq(who + 'ArrowUp moves back', name(t, pg), 'Undo')
    pg.keyboard.press('ArrowRight')
    t.check(who + 'with a menu open, ArrowRight opens the next one on its first item', is_open(scope, 2) and not is_open(scope, 1) and name(t, pg) == 'Show the totals', t.focused(pg))
    pg.keyboard.press('Enter')
    if events:
        t.eq(who + 'Enter on a check item fires tray:change and keeps the menu open', ([e['detail'] for e in t.events(pg, 'tray:change')], is_open(scope, 2)), ([{'value': 'Show the totals', 'checked': False}], True))
    t.eq(who + 'and the item announces aria-checked', pg.locator(':focus').get_attribute('aria-checked'), 'false')
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check(who + 'Escape closes the menu and returns focus to its tab', not is_open(scope, 2) and name(t, pg) == 'View', t.focused(pg))
    pg.keyboard.press('Home')
    pg.keyboard.press('Enter')
    t.check(who + 'Enter opens a menu on its first item', is_open(scope, 0) and name(t, pg) == 'New order', t.focused(pg))
    pg.keyboard.press('Escape')
    t.settle(pg)
    pg.keyboard.press('Space')
    t.check(who + 'Space opens it too', is_open(scope, 0) and name(t, pg) == 'New order', t.focused(pg))
    for _ in range(2):
        pg.keyboard.press('ArrowDown')
    t.eq(who + 'the submenu item is reached', name(t, pg), 'Export')
    sub = scope.locator('.tray-submenu > .tray-pop')
    pg.keyboard.press('ArrowRight')
    t.check(who + "ArrowRight on a submenu's item opens it on its first item", sub.is_visible() and name(t, pg) == 'As a spreadsheet', t.focused(pg))
    t.eq(who + 'the item says its submenu is expanded', scope.locator('.tray-submenu > [aria-haspopup]').get_attribute('aria-expanded'), 'true')
    pg.keyboard.press('ArrowLeft')
    t.check(who + 'inside the submenu ArrowLeft closes it and goes back to its item', not sub.is_visible() and name(t, pg) == 'Export' and is_open(scope, 0), t.focused(pg))
    pg.keyboard.press('ArrowRight')
    pg.keyboard.press('ArrowRight')
    t.check(who + 'inside the submenu ArrowRight moves on to the next menu of the bar', is_open(scope, 1) and not is_open(scope, 0) and name(t, pg) == 'Undo', t.focused(pg))
    t.clear_events(pg)
    pg.keyboard.press('Enter')
    t.settle(pg)
    if events:
        t.eq(who + 'Enter runs an item: tray:select, and the menu closes', ([e['detail'] for e in t.events(pg, 'tray:select')], is_open(scope, 1)), ([{'value': 'Undo'}], False))
    t.eq(who + 'and focus goes back to its tab', name(t, pg), 'Edit')
    bar.evaluate('b => { const after = document.createElement("button"); after.type = "button"; after.textContent = "After the bar"; b.after(after); }')
    tabs(scope).first.click()
    tabs(scope).nth(2).hover()
    t.check(who + 'with one menu open, pointing at another opens that one', is_open(scope, 2) and not is_open(scope, 0))
    pg.keyboard.press('Tab')
    t.settle(pg)
    t.check(who + 'Tab from inside leaves the bar and closes the menu', not is_open(scope, 2) and t.focused(pg)['text'] == 'After the bar', t.focused(pg))


def test_tree(t):
    pg = t.open()
    t.match_tree('a menubar of menuitems with popups, the open one expanded, its items with their states', pg.locator(BAR), '''
- menubar "Orders":
  - menuitem "File"
  - menuitem "Edit"
  - menuitem "View" [expanded]
  - menu "View":
    - menuitemcheckbox "Show the totals" [checked]
    - menuitemcheckbox "Show cancelled orders"
    - separator
    - text: Density
    - menuitemradio "Comfortable" [checked]
    - menuitemradio "Compact"
''')
    a = t.ax(pg.locator(BAR))
    t.eq('the bar is a menubar named by its aria-label', (a['role'], a['name']), ('menubar', 'Orders'))
    for i, label in enumerate(('File', 'Edit', 'View')):
        n = t.ax(tabs(pg).nth(i))
        t.eq(f'the tab {label} is a menuitem with a menu popup and aria-expanded', (n['role'], n['name'], n.get('hasPopup'), 'expanded' in n), ('menuitem', label, 'menu', True))
    tg = tabs(pg).nth(2)
    t.check('the open tab is drawn from aria-expanded (the ground colour of the strip)', t.style(tg, 'background-color') != 'rgba(0, 0, 0, 0)', t.style(tg, 'background-color'))


def test_keys(t):
    pg = t.open()
    drive(t, pg, pg.locator('body'))
    pg.get_by_role('button', name='After the bar').focus()
    pg.keyboard.press('Shift+Tab')
    t.check('Shift+Tab comes back to the bar at its one Tab stop', name(t, pg) in ('File', 'Edit', 'View'), t.focused(pg))
    ring = t.style(pg.locator(':focus'), 'outline-width', 'outline-offset')
    t.eq('a focused tab draws the 3px ring inside its edge', (ring['outline-width'], ring['outline-offset']), ('3px', '-3px'))
    pg.keyboard.press('ArrowDown')
    ring = t.style(pg.locator(':focus'), 'outline-width', 'outline-offset')
    t.check('a focused item draws the 3px ring inside its edge', ring['outline-width'] == '3px' and ring['outline-offset'].startswith('-'), ring)


def test_rtl(t):
    pg = t.open(rtl=True)
    pg.mouse.click(5, 5)
    tabs(pg).first.focus()
    pg.keyboard.press('ArrowLeft')
    t.eq('right to left, ArrowLeft moves to the next tab', name(t, pg), 'Edit')
    pg.keyboard.press('ArrowRight')
    pg.keyboard.press('ArrowRight')
    t.eq('and ArrowRight wraps back to the last', name(t, pg), 'View')
    tabs(pg).first.focus()
    pg.keyboard.press('ArrowDown')
    pg.keyboard.press('ArrowDown')
    pg.keyboard.press('ArrowDown')
    pg.keyboard.press('ArrowLeft')
    t.eq("right to left, ArrowLeft opens a submenu", name(t, pg), 'As a spreadsheet')


def test_motion(t):
    pg = t.open()
    pg.mouse.click(5, 5)
    t.settle(pg)
    tabs(pg).first.click()
    panel = pg.locator(f'{BAR} > .tray-anchor').first.locator(':scope > .tray-pop')
    m = t.motion(panel)
    durs = [float(d.strip().rstrip('s')) for d in m['transition-duration'].split(',')]
    t.check('under reduced motion a menu only fades, in a tenth of a second', 'opacity' in m['transition-property'] and max(durs) <= 0.1 + 1e-9 and m['transform'] == 'none', m)
    pg = t.open(motion='no-preference')
    pg.mouse.click(5, 5)
    t.settle(pg)
    tabs(pg).first.click()
    m2 = t.motion(pg.locator(f'{BAR} > .tray-anchor').first.locator(':scope > .tray-pop'))
    t.check('without the setting it moves as well as fading', m2['transition-property'] != m['transition-property'] or m2['transition-duration'] != m['transition-duration'], (m, m2))


def test_parity_keys(t):
    pg = t.open_react()
    drive(t, pg, t.cell(pg, 'ViewOpen'), 'react: ', events=False)


PARITY = [(BAR, 'ViewOpen', BAR)]
