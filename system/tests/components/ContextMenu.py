"""Context Menu: README.md. The region takes focus (tabindex="0") and is a group named by its aria-label (the behaviour adds
role="group" to a named div without one). A right-click opens the menu at the pointer, kept inside the region; the Menu key
or Shift+F10 opens it from the keyboard. The panel becomes a menu and focus moves to its first item: ArrowUp and ArrowDown
move and wrap, Home and End jump, Enter or Space runs an item (tray:select with detail.value). Running an item or Escape
closes the menu and returns focus to the region; Tab out of the menu or a click elsewhere closes it too. Items are
menuitem buttons with aria-hidden icons and the focus ring inside. Under reduced motion the menu only fades, in 0.1s."""

REGION = '[data-tray="contextmenu"]'


def drive(t, pg, region, where='', first='Open', second='Duplicate', last='Delete order'):
    panel = region.locator('.tray-pop').first
    region.focus()
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check(f'{where}Escape in the region closes the open menu', not panel.is_visible())
    pg.keyboard.press('Shift+F10')
    f = t.focused(pg)
    t.check(f'{where}Shift+F10 opens the menu with focus on its first item', panel.is_visible() and f['text'].startswith(first), f)
    walk = []
    for key in ('ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowUp', 'Home', 'End'):
        pg.keyboard.press(key)
        walk.append(t.focused(pg)['text'])
    t.check(f'{where}up and down move and wrap, Home and End jump', walk[3].startswith(first) and walk[4] == last and walk[5].startswith(first) and walk[6] == last, walk)
    pg.keyboard.press('Home')
    pg.keyboard.press('ArrowDown')
    t.clear_events(pg)
    pg.keyboard.press('Enter')
    t.settle(pg)
    t.eq(f'{where}Enter runs the item: tray:select with its value', [e['detail'] for e in t.events(pg, 'tray:select')], [{'value': second}])
    t.check(f'{where}and closes the menu, focus back on the region', not panel.is_visible() and region.evaluate('r => r === document.activeElement'), t.focused(pg))
    pg.keyboard.press('ContextMenu')
    t.check(f'{where}the Menu key opens it too', panel.is_visible() and t.focused(pg)['text'].startswith(first), t.focused(pg))
    t.clear_events(pg)
    pg.keyboard.press('Space')
    t.settle(pg)
    t.check(f'{where}Space runs an item', len(t.events(pg, 'tray:select')) == 1 and not panel.is_visible() and region.evaluate('r => r === document.activeElement'), t.events(pg))
    pg.keyboard.press('Shift+F10')
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check(f'{where}Escape closes it, focus back on the region', not panel.is_visible() and region.evaluate('r => r === document.activeElement'), t.focused(pg))
    pg.keyboard.press('Shift+F10')
    pg.keyboard.press('Tab')
    t.settle(pg)
    t.check(f'{where}Tab out of the menu closes it', not panel.is_visible() and not panel.evaluate('p => p.contains(document.activeElement)'), t.focused(pg))
    # the pointer: a right-click opens it where it was pressed, kept inside the region
    box = region.bounding_box()
    region.click(button='right', position={'x': 60, 'y': 30})
    p = panel.bounding_box()
    t.check(f'{where}a right-click opens it at the pointer', panel.is_visible() and abs(p['x'] - (box['x'] + 60)) < 2 and abs(p['y'] - (box['y'] + 30)) < 2, (box, p))
    t.check(f'{where}with focus on its first item', t.focused(pg)['text'].startswith(first), t.focused(pg))
    pg.mouse.click(2, 2)
    t.settle(pg)
    t.check(f'{where}a click elsewhere closes it', not panel.is_visible())
    region.click(button='right', position={'x': box['width'] - 30, 'y': box['height'] - 30})
    p = panel.bounding_box()
    t.check(f'{where}near the corner it stays inside its region', p['x'] + p['width'] <= box['x'] + box['width'] + 1 and p['y'] + p['height'] <= box['y'] + box['height'] + 1, (box, p))
    t.clear_events(pg)
    panel.get_by_role('menuitem', name=last).click()
    t.settle(pg)
    t.eq(f'{where}a click runs an item', [e['detail'] for e in t.events(pg, 'tray:select')], [{'value': last}])
    t.check(f'{where}focus goes back to the region, not to the page', region.evaluate('r => r === document.activeElement'), t.focused(pg))


def test_tree(t):
    pg = t.open()
    r = pg.locator(REGION)
    a = t.ax(r)
    t.eq('the region is a focusable group named by its aria-label', (a['role'], a['name'], a.get('focusable')), ('group', 'Order PL-20418', True))
    t.match_tree('the panel is a menu of items', r, '''
- group "Order PL-20418":
  - text: Right-click anywhere in this area
  - menu:
    - menuitem "Open"
    - menuitem "Duplicate"
    - menuitem "Copy the link"
    - separator
    - menuitem "Delete order"
''')
    t.check('the items are out of the Tab order and their icons aria-hidden',
            r.locator('[role="menuitem"]').evaluate_all('l => l.every(i => i.tabIndex === -1 && [...i.querySelectorAll("svg")].every(s => s.getAttribute("aria-hidden") === "true"))'))


def test_role_added(t):
    pg = t.open()
    pg.evaluate('''() => { const d = document.createElement('div'); d.className = 'tray-context'; d.dataset.tray = 'contextmenu'; d.tabIndex = 0; d.id = 'cm2';
        d.setAttribute('aria-label', 'Batch of 12 November');
        d.innerHTML = '<span>412 jars</span><div class="tray-pop"><div class="tray-list"><button type="button" class="tray-option" role="menuitem">Reserve</button></div></div>';
        document.querySelector('.tray-demo').append(d); TrayUI.init(d); }''')
    t.eq('the behaviour gives a named div without a role role="group"', pg.get_attribute('#cm2', 'role'), 'group')


def test_keys(t):
    pg = t.open()
    # a control after the region, for Tab to go to (the React preview has its second example there)
    pg.evaluate('() => { const b = document.createElement("button"); b.type = "button"; b.className = "tray-btn"; b.textContent = "Next"; document.querySelector(".tray-demo").append(b); }')
    drive(t, pg, pg.locator(REGION))


def test_ring_and_motion(t):
    pg = t.open()
    r = pg.locator(REGION)
    r.focus()
    pg.keyboard.press('Escape')
    pg.keyboard.press('Shift+F10')
    t.eq('the item under focus draws the ring inside its edge', t.style(r.locator('[role="menuitem"]').first, 'outline-width', 'outline-offset'), {'outline-width': '3px', 'outline-offset': '-3px'})
    t.scan(pg, 'Light, opened from the keyboard')
    pg.keyboard.press('Escape')
    anims = [a for a in t.running_animations(pg) if 'tray-pop' in str(a['target'])]
    names = {a['name'] for a in anims}
    t.check('reduced motion: the menu only fades', 'opacity' in names and not names & {'scale', 'translate'}, anims)
    t.check('in a tenth of a second', max([a['duration'] for a in anims] or [0]) <= 100, anims)


PARITY = [(REGION, 'Open', REGION)]


def test_parity_keys(t):
    r = t.open_react()
    drive(t, r, t.cell(r, 'Open').locator(REGION), 'react: ')


def test_forced(t):
    pg = t.open(forced=True)
    r = pg.locator(REGION)
    r.focus()
    pg.keyboard.press('Escape')
    pg.keyboard.press('Shift+F10')
    sysc = t.system_colors(pg)
    t.eq('with forced colours the item under the keyboard is drawn in Highlight', t.style(r.locator('[role="menuitem"]').first, 'background-color', 'color'),
         {'background-color': sysc['Highlight'], 'color': sysc['HighlightText']})
