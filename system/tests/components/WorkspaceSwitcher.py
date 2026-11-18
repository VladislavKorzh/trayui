"""Workspace Switcher: README.md. A Dropdown Menu: the switcher button gets aria-haspopup="menu" and aria-expanded and is
named by its text (the workspace and its plan; the avatar and the icon are aria-hidden); Enter, Space or ArrowDown opens it on
the first item, ArrowUp and ArrowDown go round, Escape closes and returns focus to the switcher; the workspaces are
menuitemradio items sharing a data-group, the current one aria-checked="true" with a check and a semibold name; choosing one
checks it and leaves the menu open (tray:change). In a collapsed sidebar the words are only hidden from sight, so the button
keeps its name (that case is tested in the App Shell, whose sidebar collapses)."""


TRIGGER = '[data-tray="menu"] > .tray-switcher'


def item(pg):
    """The words of the item in focus, without the initials of its aria-hidden avatar."""
    return pg.evaluate('(() => { const a = document.activeElement, w = a && a.querySelector(".tray-option__text"); return w ? w.textContent.trim() : (a ? a.textContent.trim() : ""); })()')


def drive(t, pg, root, label):
    """The keys of the README, on a switcher whose menu is open at first. label prefixes the checks."""
    btn = root.locator('.tray-switcher').first
    btn.focus(); pg.keyboard.press('Escape'); t.settle(pg)
    t.check(f'{label}Escape closes the menu', not root.locator('.tray-pop').first.is_visible())
    for key in ('Enter', 'Space', 'ArrowDown'):
        btn.focus(); pg.keyboard.press(key)
        f = t.focused(pg)
        t.check(f'{label}{key} opens the menu with focus on the first workspace', f['role'] == 'menuitemradio' and item(pg) == 'Perly Farm', f)
        pg.keyboard.press('Escape'); t.settle(pg)
        t.check(f'{label}after {key}, Escape returns focus to the switcher', 'tray-switcher' in t.focused(pg)['cls'] and not root.locator('.tray-pop').first.is_visible(), t.focused(pg))
    btn.focus(); pg.keyboard.press('Enter')
    pg.keyboard.press('ArrowUp')
    t.eq(f'{label}ArrowUp goes round to the last item', item(pg), 'New workspace')
    pg.keyboard.press('ArrowDown')
    t.eq(f'{label}ArrowDown goes round to the first', item(pg), 'Perly Farm')
    pg.keyboard.press('ArrowDown')
    t.clear_events(pg)
    pg.keyboard.press('Enter')
    radios = root.locator('[role="menuitemradio"]')
    t.eq(f'{label}choosing a workspace checks it and unchecks the others', [radios.nth(i).get_attribute('aria-checked') for i in range(3)], ['false', 'true', 'false'])
    return btn


def test_tree(t):
    pg = t.open()
    btn = pg.locator(TRIGGER)
    a = t.ax(btn)
    t.eq('the switcher is named by its text, the workspace and its plan', a['name'], 'Perly Farm Shop plan')
    t.eq('it says it opens a menu', a.get('hasPopup'), 'menu')
    t.eq('the open menu shows aria-expanded', a.get('expanded'), True)
    t.match_tree('the workspaces are radio items, the current one checked, then the rule and New workspace', pg.locator('[data-tray="menu"] .tray-pop'), '''
- menu "Perly Farm Shop plan":
  - menuitemradio "Perly Farm" [checked]
  - menuitemradio "Meadow Bakery" [checked=false]
  - menuitemradio "Hill Cheese" [checked=false]
  - separator
  - menuitem "New workspace"
''')
    cur = pg.locator('[role="menuitemradio"][aria-checked="true"]')
    t.check('the current one shows its check and a semibold name, not only a colour',
            t.style(cur.locator('.tray-option__check'), 'visibility') == 'visible' and int(t.style(cur, 'font-weight')) >= 600)
    other = pg.locator('[role="menuitemradio"][aria-checked="false"]').first
    t.eq('the others hide their check', t.style(other.locator('.tray-option__check'), 'visibility'), 'hidden')
    t.eq('the second switcher, on the page, is named by its text too', t.ax(pg.locator('.tray-stack > .tray-switcher'))['name'], 'Meadow Bakery You are a packer here')


def test_keys(t):
    pg = t.open()
    root = pg.locator('[data-tray="menu"]')
    drive(t, pg, root, '')
    t.eq('it fires tray:change with the workspace', [e['detail'] for e in t.events(pg, 'tray:change')], [{'value': 'Meadow Bakery', 'checked': True}])
    t.check('and leaves the menu open', root.locator('.tray-pop').is_visible())


def test_react_keys(t):
    pg = t.open_react()
    cell = t.cell(pg, 'Open')
    t.eq('react: the switcher is named by its text', t.ax(cell.locator('.tray-switcher').first)['name'], 'Perly Farm Shop plan')
    drive(t, pg, cell.locator('.tray-anchor').first, 'react: ')
    t.check('react: the menu stays open after the choice', cell.locator('.tray-pop').first.is_visible())


PARITY = [('[data-tray="menu"] .tray-pop', 'Open', '.tray-pop')]
