"""Filter Bar: README.md. The search field is named by its aria-label; each filter is a Dropdown Menu of menuitemcheckbox
items whose aria-checked says which are on, Enter or Space flips one and the menu stays open; checking an item with a
data-value adds a chip (its text from data-label), the chip's button unchecks it, Clear all removes them all and the chip
row hides while it is empty; tray:change carries { filters }; each chip's button is named with the whole filter ("Remove
Status: To pack") and is 28px to the eye and 44px to a finger; each radio of the icon-only view switch has an aria-label;
when a chip goes, focus moves to the next chip's button, or the one before, or back to the menu it came from, and Clear all
sends it back to the menu of the first filter."""



def chips(pg, root=None):
    return (root or pg).locator('.tray-filterbar__chips .tray-chip').evaluate_all('cs => cs.map(c => c.getAttribute("data-value"))')


def test_tree(t):
    pg = t.open()
    t.match_tree('the search, the two filter menus, the sort, the view and the chips', pg.locator('.tray-filterbar'), '''
- searchbox "Search orders"
- button "Status"
- button "Delivery"
- combobox "Sort by"
- radiogroup "View":
  - radio "List" [checked]
  - radio "Grid"
- text: "Status: To pack"
- 'button "Remove Status: To pack"'
- text: "Delivery: Courier"
- 'button "Remove Delivery: Courier"'
- button "Clear all"
''')
    a = t.ax(pg.locator('[data-tray="menu"] > button').first)
    t.eq('each filter button says it opens a menu, closed at first', (a.get('hasPopup'), a.get('expanded')), ('menu', False))
    pg.locator('[data-tray="menu"] > button').first.click()
    t.match_tree('the menu holds checkbox items, the ones on checked', pg.locator('[data-tray="menu"] .tray-pop').first, '''
- menu "Status":
  - menuitemcheckbox "To pack 12" [checked]
  - menuitemcheckbox "With the courier 7" [checked=false]
  - menuitemcheckbox "Delivered 214" [checked=false]
  - menuitemcheckbox "Refunded 3" [checked=false]
''')


def test_targets(t):
    pg = t.open()
    x = pg.locator('.tray-chip__x').first
    box = x.bounding_box()
    w, h = t.hit(x)
    t.check('the remove button is 28px to the eye', round(box['width']) == 28 and round(box['height']) == 28, box)
    t.check('and 44px to a finger', w >= 44 and h >= 44, (w, h))


def test_menu_keys(t):
    pg = t.open()
    status = pg.locator('[data-tray="menu"] > button').first
    status.focus(); pg.keyboard.press('Enter')
    t.eq('Enter opens the filter menu on its first item', t.focused(pg)['role'], 'menuitemcheckbox')
    t.clear_events(pg)
    pg.keyboard.press('ArrowDown'); pg.keyboard.press('Space')
    pg.wait_for_timeout(30)
    item = pg.locator('[data-value="status:courier"][role="menuitemcheckbox"]')
    t.eq('Space flips the item', item.get_attribute('aria-checked'), 'true')
    t.check('and the menu stays open', pg.locator('[data-tray="menu"] .tray-pop').first.is_visible())
    t.eq('checking it adds its chip, named by data-label, before Clear all', chips(pg), ['status:to-pack', 'delivery:courier', 'status:courier'])
    t.eq('the chip says the whole filter', pg.locator('.tray-chip[data-value="status:courier"]').inner_text().strip(), 'Status: With the courier')
    t.eq('it fires tray:change with the filters that are on', [e['detail'] for e in t.events(pg, 'tray:change') if 'filters' in (e['detail'] or {})][-1:], [{'filters': ['status:to-pack', 'delivery:courier', 'status:courier']}])
    pg.keyboard.press('Enter')
    pg.wait_for_timeout(30)
    t.eq('Enter flips it back and its chip goes', (item.get_attribute('aria-checked'), chips(pg)), ('false', ['status:to-pack', 'delivery:courier']))


def test_chips(t):
    pg = t.open()
    t.clear_events(pg)
    first_x = pg.locator('.tray-chip__x').first
    first_x.focus(); pg.keyboard.press('Enter')
    t.eq('the chip\'s button removes the chip', chips(pg), ['delivery:courier'])
    t.eq('and unchecks its menu item', pg.get_attribute('[role="menuitemcheckbox"][data-value="status:to-pack"]', 'aria-checked'), 'false')
    t.eq('focus moves to the next chip\'s button', t.focused(pg)['label'], 'Remove Delivery: Courier')
    t.eq('it fires tray:change', [e['detail'] for e in t.events(pg, 'tray:change')], [{'filters': ['delivery:courier']}])
    pg.keyboard.press('Enter')
    f = t.focused(pg)
    t.check('when the last chip goes, focus goes back to the menu it came from', f['text'] == 'Delivery' and f['tag'] == 'button', f)
    t.check('and the empty chip row hides', not pg.locator('.tray-filterbar__chips').is_visible())


def test_chip_before(t):
    pg = t.open()
    last = pg.locator('.tray-chip__x').nth(1)
    last.focus(); pg.keyboard.press('Enter')
    t.eq('removing the last chip moves focus to the one before', t.focused(pg)['label'], 'Remove Status: To pack')


def test_clear_all(t):
    pg = t.open()
    t.clear_events(pg)
    clear = pg.locator('[data-filter="clear"]')
    clear.focus(); pg.keyboard.press('Enter')
    t.eq('Clear all removes every chip', chips(pg), [])
    t.eq('and unchecks every item', pg.locator('[role="menuitemcheckbox"][aria-checked="true"]').count(), 0)
    f = t.focused(pg)
    t.check('focus goes back to the menu of the first filter', f['text'] == 'Status' and not f['body'], f)
    t.eq('it fires tray:change with no filters', [e['detail'] for e in t.events(pg, 'tray:change')][-1:], [{'filters': []}])
    t.check('the chip row hides while it is empty', not pg.locator('.tray-filterbar__chips').is_visible())


def drive_react(t, pg, cell, label):
    x = cell.locator('.tray-chip__x').first
    x.focus(); pg.keyboard.press('Enter')
    t.eq(f'{label}removing a chip moves focus to the next chip\'s button', t.focused(pg)['label'], 'Remove Delivery: Courier')
    pg.keyboard.press('Enter')
    f = t.focused(pg)
    t.check(f'{label}when the last goes, focus goes back to its menu', f['text'] == 'Delivery', f)


def test_react(t):
    pg = t.open_react()
    cell = t.cell(pg, 'OverTheOrders')
    t.eq('react: the chips of the filters on', chips(pg, cell), ['status:to-pack', 'delivery:courier'])
    drive_react(t, pg, cell, 'react: ')
    t.check('react: the empty chip row hides', not cell.locator('.tray-filterbar__chips').is_visible())


PARITY = [('.tray-filterbar', 'OverTheOrders', '.tray-filterbar')]
