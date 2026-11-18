"""User Menu: README.md. A Dropdown Menu on the avatar button: the button gets aria-haspopup="menu" and aria-expanded and is
named by its aria-label, which ends with the initials it shows ("Account: Oksana Franko, OF", as the Avatar README says: WCAG 2.5.3); the panel is a menu named by the
person in its head ("Oksana Franko oksana@perly.example"); Enter, Space or ArrowDown opens it on the first item; ArrowUp and
ArrowDown go round, Home and End jump, Escape closes and returns focus to the avatar; a menuitem fires tray:select, closes and
returns focus; the theme item is a menuitemcheckbox that flips aria-checked, fires tray:change with detail.checked and leaves
the menu open; focus draws its ring inside the item; under reduced motion the menu only fades."""


AVATAR = '.tray-anchor > button.tray-avatar'


def close(pg):
    pg.keyboard.press('Escape')


def test_tree(t):
    pg = t.open()
    a = t.ax(pg.locator(AVATAR))
    t.eq('the avatar button is named by the person and ends with its initials', a['name'], 'Account: Oksana Franko, OF')
    t.eq('it says it opens a menu', a.get('hasPopup'), 'menu')
    t.eq('the open menu shows aria-expanded', a.get('expanded'), True)
    t.eq('it shows the initials', pg.locator(AVATAR).inner_text().strip(), 'OF')
    t.match_tree('the panel is a menu named by the person, of menu items and the theme checkbox', pg.locator('.tray-pop'), '''
- menu "Oksana Franko oksana@perly.example":
  - separator
  - menuitem "Profile"
  - menuitem "Billing Shop plan"
  - menuitem "Settings"
  - menuitemcheckbox "Dark theme" [checked=false]
  - separator
  - menuitem "Help"
  - menuitem "Sign out"
''')
    t.eq('the items are out of the Tab order (the arrow keys move between them)', pg.evaluate('[...document.querySelectorAll("[role^=menuitem]")].map(i => i.tabIndex).join()'), '-1,-1,-1,-1,-1,-1')


def test_keys(t):
    pg = t.open()
    av = pg.locator(AVATAR)
    av.focus(); close(pg); t.settle(pg)
    t.check('Escape closes the menu the preview holds open', not pg.locator('.tray-pop').is_visible())
    t.eq('and leaves aria-expanded false', av.get_attribute('aria-expanded'), 'false')
    for key in ('Enter', 'Space', 'ArrowDown'):
        av.focus(); pg.keyboard.press(key)
        f = t.focused(pg)
        t.check(f'{key} opens the menu with focus on the first item', pg.locator('.tray-pop').is_visible() and f['text'] == 'Profile', f)
        close(pg); t.settle(pg)
        t.check(f'after {key}, Escape closes it and focus is back on the avatar', not pg.locator('.tray-pop').is_visible() and t.focused(pg)['label'] == 'Account: Oksana Franko, OF', t.focused(pg))
    av.focus(); pg.keyboard.press('Enter')
    pg.keyboard.press('ArrowDown')
    t.eq('ArrowDown moves to the next item', t.focused(pg)['text'], 'Billing Shop plan')
    pg.keyboard.press('End')
    t.eq('End jumps to the last item', t.focused(pg)['text'], 'Sign out')
    pg.keyboard.press('ArrowDown')
    t.eq('ArrowDown goes round to the first', t.focused(pg)['text'], 'Profile')
    pg.keyboard.press('ArrowUp')
    t.eq('ArrowUp goes round to the last', t.focused(pg)['text'], 'Sign out')
    pg.keyboard.press('Home')
    t.eq('Home jumps to the first', t.focused(pg)['text'], 'Profile')
    pg.keyboard.press('Shift+Tab'); t.settle(pg)
    t.check('Shift+Tab closes the menu and puts focus on the avatar', not pg.locator('.tray-pop').is_visible() and t.focused(pg)['label'] == 'Account: Oksana Franko, OF', t.focused(pg))


def test_choose(t):
    pg = t.open()
    t.clear_events(pg)
    theme = pg.locator('[role="menuitemcheckbox"]')
    theme.focus(); pg.keyboard.press('Enter')
    t.eq('the theme item flips its aria-checked', theme.get_attribute('aria-checked'), 'true')
    t.check('and the menu stays open', pg.locator('.tray-pop').is_visible())
    t.eq('it fires tray:change with the value and checked', [e['detail'] for e in t.events(pg, 'tray:change')], [{'value': 'Dark theme', 'checked': True}])
    t.eq('on the anchor', [e['target'] for e in t.events(pg, 'tray:change')], ['span[data-tray="menu"]'])
    pg.keyboard.press('Space')
    t.eq('Space flips it back', theme.get_attribute('aria-checked'), 'false')
    t.clear_events(pg)
    out = pg.locator('[role="menuitem"]', has_text='Sign out')
    out.focus(); pg.keyboard.press('Enter'); t.settle(pg)
    t.eq('choosing a menuitem fires tray:select with its value', [e['detail'] for e in t.events(pg, 'tray:select')], [{'value': 'Sign out'}])
    t.check('closes the menu', not pg.locator('.tray-pop').is_visible())
    t.eq('and returns focus to the avatar', t.focused(pg)['label'], 'Account: Oksana Franko, OF')
    t.eq('the trigger reports tray:close', [e['type'] for e in t.events(pg) if e['type'] in ('tray:open', 'tray:close')], ['tray:close'])


def test_focus_ring(t):
    pg = t.open()
    item = pg.locator('[role="menuitem"]').first
    item.focus(); pg.keyboard.press('ArrowDown'); pg.keyboard.press('ArrowUp')
    st = t.style(item, 'outline-style', 'outline-width', 'outline-offset')
    t.check('focus draws a solid 3px ring inside the item', st['outline-style'] == 'solid' and st['outline-width'] == '3px' and st['outline-offset'].startswith('-'), st)


def test_motion(t):
    calm = t.open()
    moving = t.open(motion='no-preference')
    p_calm, p_move = calm.locator('.tray-pop'), moving.locator('.tray-pop')
    for pg in (calm, moving):
        pg.evaluate('document.querySelector(".tray-pop").hidden = true')
        t.settle(pg)
    st = t.style(p_move, 'scale', 'translate', 'opacity')
    t.check('with motion a closed menu is scaled down and lifted, so it grows and slides as it opens', st['scale'] == '0.96' and st['translate'] != 'none', st)
    # under reduced motion nothing travels or scales: the closed state differs from the open one in opacity alone
    st = t.style(p_calm, 'scale', 'translate', 'opacity', 'transition-duration')
    t.check('under reduced motion it neither scales nor moves, and fades in a tenth of a second', st['scale'] == 'none' and st['translate'] == 'none' and st['opacity'] == '0' and st['transition-duration'] == '0.1s', st)


def test_react_keys(t):
    pg = t.open_react()
    cell = t.cell(pg, 'Open')
    av = cell.locator('button.tray-avatar')
    a = t.ax(av)
    t.eq('react: the avatar button has the same name', a['name'], 'Account: Oksana Franko, OF')
    t.eq('react: it says it opens a menu', a.get('hasPopup'), 'menu')
    av.focus(); pg.keyboard.press('Escape'); t.settle(pg)
    t.check('react: Escape closes the open menu', not cell.locator('.tray-pop').is_visible())
    pg.keyboard.press('Enter')
    t.eq('react: Enter opens it on the first item', t.focused(pg)['text'], 'Profile')
    pg.keyboard.press('End')
    t.eq('react: End jumps to the last item', t.focused(pg)['text'], 'Sign out')
    t.clear_events(pg)
    theme = cell.locator('[role="menuitemcheckbox"]')
    theme.focus(); pg.keyboard.press('Enter')
    t.check('react: the theme item flips and the menu stays open', theme.get_attribute('aria-checked') == 'true' and cell.locator('.tray-pop').is_visible())
    pg.keyboard.press('Escape'); t.settle(pg)
    t.check('react: Escape returns focus to the avatar', t.focused(pg)['cls'].startswith('tray-avatar'), t.focused(pg))


PARITY = [('.tray-pop', 'Open', '.tray-pop')]
