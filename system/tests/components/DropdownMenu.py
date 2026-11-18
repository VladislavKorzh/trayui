"""Dropdown Menu: README.md. The behaviour makes the panel a menu named by its button (aria-labelledby) and gives the button
aria-haspopup="menu" and aria-expanded. Enter, Space or ArrowDown opens it on its first item; ArrowUp and ArrowDown move and
wrap, Home and End jump, Escape closes it and returns focus to the button, Tab leaves and closes it, Shift+Tab closes it and
returns focus to the button. An action fires tray:select with detail.value and closes the menu; a check or radio item sets
aria-checked, fires tray:change with detail.value and detail.checked, and the menu stays open. A submenu is a menu named by
its item, which reports aria-expanded; ArrowRight, Enter or Space opens it on its first item, up and down stay inside, and
ArrowLeft or Escape closes it and returns focus to its item (the arrows swap right to left, where it opens to the left); up
and down in the menu step over its items. The focus ring is drawn inside the item; under reduced motion the panel only
fades, in 0.1s."""

FIRST = '[data-tray="menu"]:nth-of-type(1)'


def menus(pg, scope=None):
    root = scope or pg
    return root.locator('[data-tray~="menu"]')


def drive(t, pg, menu, where=''):
    """The keys of the "Actions" menu (open at load in both previews): the same driver for the HTML and the React preview."""
    btn, panel = menu.locator('> button'), menu.locator('> .tray-pop')
    btn.focus()
    pg.keyboard.press('Escape')  # it is open at load: close it from its button
    t.settle(pg)
    t.check(f'{where}Escape on the button closes the open menu', not panel.is_visible())
    for key in ('Enter', 'Space', 'ArrowDown'):
        btn.focus()
        pg.keyboard.press(key)
        f = t.focused(pg)
        t.check(f'{where}{key} on the button opens the menu on its first item', panel.is_visible() and f['role'] == 'menuitem' and f['text'].startswith('Open'), f)
        t.eq(f'{where}{key}: the button reports aria-expanded="true"', btn.get_attribute('aria-expanded'), 'true')
        pg.keyboard.press('Escape')
        t.settle(pg)
        t.check(f'{where}{key}: Escape closes it and returns focus to the button', not panel.is_visible() and btn.evaluate('b => b === document.activeElement'), t.focused(pg))
    btn.focus()
    pg.keyboard.press('ArrowDown')
    walk = []
    for key in ('ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowUp', 'Home', 'End'):
        pg.keyboard.press(key)
        walk.append(t.focused(pg)['text'].split(' ')[0])
    t.eq(f'{where}up and down move, wrap at the ends and step over the submenu; Home and End jump', walk,
         ['Duplicate', 'Copy', 'Notify', 'Move', 'Delete', 'Open', 'Delete', 'Open', 'Delete'])
    # a check item: Enter sets aria-checked and the menu stays open
    pg.keyboard.press('Home')
    for _ in range(3):
        pg.keyboard.press('ArrowDown')
    item = panel.locator('[role="menuitemcheckbox"]')
    t.clear_events(pg)
    pg.keyboard.press('Enter')
    t.eq(f'{where}Enter on a check item turns it off', item.get_attribute('aria-checked'), 'false')
    t.check(f'{where}and the menu stays open, focus on the item', panel.is_visible() and item.evaluate('i => i === document.activeElement'))
    pg.keyboard.press('Space')
    t.eq(f'{where}Space turns it on again', item.get_attribute('aria-checked'), 'true')
    ev = [e['detail'] for e in t.events(pg, 'tray:change')]
    t.eq(f'{where}each fires tray:change with the value and the state', [{'value': e.get('value'), 'checked': e.get('checked')} for e in ev],
         [{'value': 'Notify the customer', 'checked': False}, {'value': 'Notify the customer', 'checked': True}])
    # the submenu
    move = panel.locator('.tray-submenu > [aria-haspopup]')
    sub = panel.locator('.tray-submenu > .tray-pop')
    pg.keyboard.press('ArrowDown')
    t.eq(f'{where}the submenu item reports aria-expanded="false"', move.get_attribute('aria-expanded'), 'false')
    pg.keyboard.press('ArrowRight')
    t.check(f'{where}ArrowRight opens the submenu on its first item', sub.is_visible() and t.focused(pg)['text'] == 'Packed', t.focused(pg))
    t.eq(f'{where}and the item reports aria-expanded="true"', move.get_attribute('aria-expanded'), 'true')
    a = t.ax(sub)
    t.eq(f'{where}the submenu is a menu named by its item', (a['role'], a['name']), ('menu', 'Move to'))
    seq = []
    for key in ('ArrowDown', 'ArrowDown', 'ArrowUp', 'End', 'Home'):
        pg.keyboard.press(key)
        seq.append(t.focused(pg)['text'])
    t.eq(f'{where}inside the submenu up and down stay in it', seq, ['On hold', 'Packed', 'On hold', 'On hold', 'Packed'])
    pg.keyboard.press('ArrowLeft')
    t.check(f'{where}ArrowLeft closes the submenu and returns focus to its item', not sub.is_visible() and move.evaluate('i => i === document.activeElement') and panel.is_visible(), t.focused(pg))
    pg.keyboard.press('Enter')
    t.check(f'{where}Enter on the item opens it too', sub.is_visible() and t.focused(pg)['text'] == 'Packed', t.focused(pg))
    pg.keyboard.press('Escape')
    t.check(f'{where}Escape in the submenu closes it alone, focus on its item', not sub.is_visible() and panel.is_visible() and move.evaluate('i => i === document.activeElement'), t.focused(pg))
    pg.keyboard.press('Space')
    t.check(f'{where}Space on the item opens it too', sub.is_visible() and t.focused(pg)['text'] == 'Packed', t.focused(pg))
    # run an action from the submenu
    t.clear_events(pg)
    pg.keyboard.press('Enter')
    t.settle(pg)
    ev = t.events(pg, 'tray:select')
    t.eq(f'{where}Enter runs the submenu item: tray:select with its value', [e['detail'] for e in ev], [{'value': 'Packed'}])
    t.check(f'{where}and the menu closes, focus back on the button', not panel.is_visible() and btn.evaluate('b => b === document.activeElement'), t.focused(pg))
    # an action with a shortcut: the value is its words, not its words and the shortcut
    btn.focus()
    pg.keyboard.press('ArrowDown')
    pg.keyboard.press('ArrowDown')
    t.clear_events(pg)
    pg.keyboard.press('Enter')
    t.settle(pg)
    t.eq(f'{where}an action fires tray:select with its words as the value', [e['detail'] for e in t.events(pg, 'tray:select')], [{'value': 'Duplicate'}])
    # Tab and Shift+Tab
    btn.focus()
    pg.keyboard.press('ArrowDown')
    pg.keyboard.press('Shift+Tab')
    t.settle(pg)
    t.check(f'{where}Shift+Tab closes it and returns focus to the button', not panel.is_visible() and btn.evaluate('b => b === document.activeElement'), t.focused(pg))
    pg.keyboard.press('ArrowDown')
    pg.keyboard.press('Tab')
    t.settle(pg)
    f = t.focused(pg)
    t.check(f'{where}Tab leaves the menu and closes it', not panel.is_visible() and not panel.evaluate('p => p.contains(document.activeElement)') and not f['body'], f)


def test_tree(t):
    pg = t.open()
    m = menus(pg).first
    t.match_tree('the button opens a menu named by it; items, a check item, a submenu item, rules', pg.locator('.tray-demo'), '''
- button "Actions" [expanded]
- menu "Actions":
  - menuitem /^Open/
  - menuitem /^Duplicate/
  - menuitem "Copy the link"
  - separator
  - menuitemcheckbox "Notify the customer" [checked]
  - menuitem "Move to"
  - separator
  - menuitem "Delete order"
- button "More actions"
''')
    a = t.ax(m.locator('> button'))
    t.eq('the button has aria-haspopup="menu" and aria-expanded', (a.get('hasPopup'), a.get('expanded')), ('menu', True))
    t.eq('the submenu item has aria-haspopup="menu"', t.ax(m.locator('.tray-submenu > [aria-haspopup]')).get('hasPopup'), 'menu')
    more = menus(pg).nth(1)
    a = t.ax(more.locator('> button'))
    t.eq('the icon-only trigger is named "More actions", collapsed', (a['name'], a.get('expanded')), ('More actions', False))
    t.eq('the items are out of the Tab order (tabindex="-1")', set(m.locator('[role^="menuitem"]').evaluate_all('l => l.map(i => i.tabIndex)')), {-1})


def test_keys(t):
    pg = t.open()
    drive(t, pg, menus(pg).first)
    m = menus(pg).first
    m.locator('> button').focus(); pg.keyboard.press('ArrowDown')
    for _ in range(4):
        pg.keyboard.press('ArrowDown')
    pg.keyboard.press('ArrowRight')
    t.scan(pg, 'Light, the menu and its submenu open')


def test_more_menu(t):
    pg = t.open()
    more = menus(pg).nth(1)
    more.locator('> button').click()
    f = t.focused(pg)
    t.eq('a click opens the menu on its first item', f['text'], 'Edit')
    t.eq('its panel is named by the icon-only button', t.ax(more.locator('> .tray-pop'))['name'], 'More actions')
    t.check('tray-pop--end aligns it to the end edge of its trigger',
            abs(more.locator('> .tray-pop').bounding_box()['x'] + more.locator('> .tray-pop').bounding_box()['width'] - (more.locator('> button').bounding_box()['x'] + more.locator('> button').bounding_box()['width'])) < 1)
    pg.mouse.click(5, 300)
    t.settle(pg)
    t.check('a click outside closes it', not more.locator('> .tray-pop').is_visible())
    ev = [e['type'] for e in t.events(pg) if e['type'] in ('tray:open', 'tray:close')]
    t.check('tray:open and tray:close tell it', ev[-2:] == ['tray:open', 'tray:close'], ev)


def test_pointer_submenu(t):
    pg = t.open()
    m = menus(pg).first
    m.locator('.tray-submenu > [aria-haspopup]').hover()
    t.check('the pointer resting on the submenu item opens it', m.locator('.tray-submenu > .tray-pop').is_visible())
    m.locator('.tray-submenu .tray-pop [role="menuitem"]').nth(1).click()
    t.settle(pg)
    t.eq('a click on a submenu item runs it', [e['detail'] for e in t.events(pg, 'tray:select')], [{'value': 'On hold'}])


def test_rtl(t):
    pg = t.open(rtl=True)
    m = menus(pg).first
    btn = m.locator('> button')
    btn.focus(); pg.keyboard.press('Escape'); pg.keyboard.press('ArrowDown')
    for _ in range(4):
        pg.keyboard.press('ArrowDown')
    t.eq('right to left: focus on the submenu item', t.focused(pg)['text'], 'Move to')
    pg.keyboard.press('ArrowRight')
    t.check('right to left, ArrowRight does not open the submenu', not m.locator('.tray-submenu > .tray-pop').is_visible())
    pg.keyboard.press('ArrowLeft')
    sub = m.locator('.tray-submenu > .tray-pop')
    t.check('ArrowLeft opens it', sub.is_visible() and t.focused(pg)['text'] == 'Packed', t.focused(pg))
    item = m.locator('.tray-submenu > [aria-haspopup]').bounding_box()
    t.check('and it opens to the left', sub.bounding_box()['x'] + sub.bounding_box()['width'] <= item['x'] + 1, (sub.bounding_box(), item))
    pg.keyboard.press('ArrowRight')
    t.check('ArrowRight closes it, focus on its item', not sub.is_visible() and t.focused(pg)['text'] == 'Move to', t.focused(pg))


def test_focus_ring_and_motion(t):
    pg = t.open()
    m = menus(pg).first
    m.locator('> button').focus(); pg.keyboard.press('Escape'); pg.keyboard.press('ArrowDown')
    t.eq('the item under focus draws a 3px ring inside its edge', t.style(m.locator('[role="menuitem"]').first, 'outline-width', 'outline-style', 'outline-offset'),
         {'outline-width': '3px', 'outline-style': 'solid', 'outline-offset': '-3px'})
    pg.keyboard.press('Escape')
    anims = [a for a in t.running_animations(pg) if 'tray-pop' in str(a['target'])]
    names = {a['name'] for a in anims}
    t.check('reduced motion: the panel only fades', 'opacity' in names and not names & {'scale', 'translate'}, anims)
    t.check('in a tenth of a second', max([a['duration'] for a in anims] or [0]) <= 100, anims)
    pg = t.open(motion='no-preference')
    m = menus(pg).nth(1)
    m.locator('> button').click()
    names = {a['name'] for a in t.running_animations(pg) if 'tray-pop' in str(a['target'])}
    t.check('without the setting it also grows from its corner', {'opacity', 'scale'} <= names, names)


def test_radio_items(t):
    """One of several: menuitemradio items sharing a data-group; a choice checks it alone, fires tray:change with
    checked: true, and the menu stays open."""
    pg = t.open()
    pg.evaluate('''() => { const s = document.createElement('span'); s.className = 'tray-anchor'; s.dataset.tray = 'menu'; s.id = 'sort';
        s.innerHTML = '<button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">Sort</button><div class="tray-pop"><div class="tray-list">' +
          ['Newest first', 'Oldest first', 'Largest total'].map((w, i) => '<button type="button" class="tray-option" role="menuitemradio" data-group="sort" aria-checked="' + (i === 0) + '"><span class="tray-option__text">' + w + '</span>' + TrayUI.icon('check', 'tray-option__check') + '</button>').join('') +
          '</div></div>';
        document.querySelector('.tray-demo').append(s); TrayUI.init(s); }''')
    m = pg.locator('#sort')
    m.locator('> button').click()
    t.eq('the panel of radio items is a menu named by its button', t.ax(m.locator('> .tray-pop'))['name'], 'Sort')
    pg.keyboard.press('ArrowDown')
    pg.keyboard.press('Enter')
    t.eq('Enter checks the item and unchecks the others in its group', m.locator('[role="menuitemradio"]').evaluate_all('l => l.map(i => i.getAttribute("aria-checked"))'), ['false', 'true', 'false'])
    t.check('and the menu stays open', m.locator('> .tray-pop').is_visible())
    t.eq('tray:change says which, checked: true', [e['detail'] for e in t.events(pg, 'tray:change')], [{'value': 'Oldest first', 'checked': True}])


def test_forced(t):
    pg = t.open(forced=True)
    m = menus(pg).first
    m.locator('> button').focus(); pg.keyboard.press('Escape'); pg.keyboard.press('ArrowDown')
    sysc = t.system_colors(pg)
    t.eq('with forced colours the panel gets a 1px edge', t.style(m.locator('> .tray-pop'), 'border-top-width', 'border-top-color'), {'border-top-width': '1px', 'border-top-color': sysc['CanvasText']})
    item = m.locator('[role="menuitem"]').first
    t.eq('and the item under focus keeps its ring', t.style(item, 'outline-style', 'outline-width'), {'outline-style': 'solid', 'outline-width': '3px'})
    # guides/3-accessibility.md: "the option under the keyboard in a list is Highlight", as under the pointer
    t.eq('the item under the keyboard is drawn in Highlight, as under the pointer', t.style(item, 'background-color', 'color'),
         {'background-color': sysc['Highlight'], 'color': sysc['HighlightText']})


PARITY = [('.tray-demo', 'Actions', '.tray-row')]


def test_parity_keys(t):
    r = t.open_react()
    drive(t, r, menus(r, t.cell(r, 'Actions')).first, 'react: ')


def test_parity_radio(t):
    r = t.open_react()
    m = menus(r, t.cell(r, 'ChoicesAtTheEnd')).first
    radios = m.locator('[role="menuitemradio"]')
    radios.nth(1).click()
    t.eq('react: a radio item checks itself alone', radios.evaluate_all('l => l.map(i => i.getAttribute("aria-checked"))'), ['false', 'true', 'false'])
    t.check('react: and the menu stays open', m.locator('> .tray-pop').is_visible())
    t.eq('react: tray:change says which, checked: true', [e['detail'].get('checked') for e in t.events(r, 'tray:change')], [True])
