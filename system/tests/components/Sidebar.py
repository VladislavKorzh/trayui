"""Sidebar: README.md, Accessibility. A <nav> named by its aria-label; the link to the current page carries
aria-current="page" and is solid ink (SelectedItem with forced colours); focus draws the ring inside the row. The collapse
button (data-tray="sidebar-toggle") keeps aria-expanded in step and its name follows what a press will do ("Collapse the
sidebar", then "Expand the sidebar"); it fires tray:change with detail.collapsed. In the rail an item's label and count are
only hidden from sight, so the link keeps its name ("Orders 12"); group names and second levels are display: none and not
read. Items are 44px rows; second-level links are 36px (guides/3-accessibility.md, Targets)."""

SIDE = 'nav.tray-sidebar'


def test_tree(t):
    pg = t.open()
    t.match_tree('a named navigation of links, the current one marked, a collapse button', pg.locator(SIDE), '''
- navigation "Main":
  - link "Perly"
  - button "Collapse the sidebar" [expanded]
  - paragraph: Shop
  - link "Orders 12"
  - link "Batches"
  - link "Customers"
  - paragraph: Farm
  - link "Beds"
  - list:
    - listitem:
      - link "Bed A"
    - listitem:
      - link "Bed B"
  - link "Field notes"
  - link "Settings"
''')
    cur = pg.locator(f'{SIDE} [aria-current]')
    t.eq('the link to the current page carries aria-current="page"', (cur.inner_text().split('\n')[0], cur.get_attribute('aria-current')), ('Orders', 'page'))
    ink = pg.evaluate('() => { const i = document.createElement("i"); i.style.color = "var(--ink)"; document.body.append(i); const v = getComputedStyle(i).color; i.remove(); return v; }')
    t.eq('the current item is solid ink', t.style(cur, 'background-color'), ink)
    hs = pg.locator(f'{SIDE} > .tray-sidebar__group > .tray-sidebar__item').evaluate_all('es => es.map(e => Math.round(e.getBoundingClientRect().height))')
    t.check('items are 44px rows', all(h >= 44 for h in hs), hs)
    sub = pg.locator(f'{SIDE} .tray-sidebar__sub .tray-sidebar__item').evaluate_all('es => es.map(e => Math.round(e.getBoundingClientRect().height))')
    t.check('second-level links are 36px rows', all(h >= 36 for h in sub), sub)


def drive(t, pg, scope, who='', events=True):
    side = scope.locator(SIDE)
    btn = side.locator('[data-tray~="sidebar-toggle"], .tray-sidebar__head button').first
    t.clear_events(pg)
    btn.focus()
    pg.keyboard.press('Enter')
    t.check(who + 'a press collapses the sidebar to a rail', side.evaluate('e => e.hasAttribute("data-collapsed")'))
    a = t.ax(btn)
    t.eq(who + 'the button keeps aria-expanded in step and is named for the next press', (a.get('expanded'), a['name']), (False, 'Expand the sidebar'))
    t.check(who + 'focus stays on the button', btn.evaluate('e => e === document.activeElement'), t.focused(pg))
    if events:
        t.eq(who + 'it fires tray:change with detail.collapsed', [e['detail'] for e in t.events(pg, 'tray:change')], [{'collapsed': True}])
    tree = t.tree(side)
    t.check(who + 'in the rail an item keeps its name', 'link "Orders 12"' in tree and 'link "Customers"' in tree, tree)
    t.check(who + 'group names and second levels are not read in the rail', 'Shop' not in tree.replace('shopping', '') and 'Bed A' not in tree, tree)
    w = side.evaluate('e => Math.round(e.getBoundingClientRect().width)')
    t.check(who + 'the rail is narrow', w < 100, w)
    pg.keyboard.press('Space')
    a = t.ax(btn)
    t.eq(who + 'a second press opens it again', (side.evaluate('e => e.hasAttribute("data-collapsed")'), a.get('expanded'), a['name']), (False, True, 'Collapse the sidebar'))


def test_collapse(t):
    pg = t.open()
    drive(t, pg, pg.locator('body'))
    item = pg.locator(f'{SIDE} [aria-current]')
    pg.locator(f'{SIDE} button').first.focus()
    pg.keyboard.press('Tab')
    ring = t.style(item, 'outline-width', 'outline-offset')
    t.eq('focus draws the ring inside the row', (ring['outline-width'], ring['outline-offset']), ('3px', '-3px'))


def test_forced(t):
    pg = t.open(forced=True)
    sc = t.system_colors(pg)
    c = t.style(pg.locator(f'{SIDE} [aria-current]'), 'background-color', 'color')
    t.eq('with forced colours the current item takes SelectedItem', (c['background-color'], c['color']), (sc['SelectedItem'], sc['SelectedItemText']))


def test_phone(t):
    pg = t.open(width=390)
    main = pg.locator('.tray-shell__main').bounding_box()
    side = pg.locator(SIDE).bounding_box()
    t.check('on a phone the content goes under the sidebar, inside the window', main['y'] >= side['y'] + side['height'] - 1 and main['x'] + main['width'] <= 390, (side, main))


def test_parity_keys(t):
    pg = t.open_react()
    drive(t, pg, t.cell(pg, 'InAShell'), 'react: ', events=False)


def test_parity_tree(t):
    h, r = t.open(), t.open_react()
    a, b = t.tree(h.locator(SIDE)), t.tree(t.cell(r, 'InAShell').locator(SIDE))
    bare = lambda s: '\n'.join(l for l in s.split('\n') if not l.strip().startswith('- /url:'))
    t.check('parity: the sidebar = InAShell sidebar', bare(a) == bare(b), f'html:\n{a}\nreact:\n{b}')


def test_account(t):
    pg = t.open()
    t.eq('the avatar beside the name is aria-hidden, so the name is not heard twice (Avatar README)', pg.get_attribute(f'{SIDE} .tray-sidebar__user .tray-avatar', 'aria-hidden'), 'true')



def test_sheet(t):
    """The phone: a data-tray="sidebar-sheet" button opens this same sidebar in a modal sheet (the preview has none, so the
    test adds one, as the app shell blocks have it)."""
    pg = t.open(width=390)
    pg.evaluate('''() => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon tray-app__menu';
        b.setAttribute('data-tray', 'sidebar-sheet'); b.setAttribute('aria-controls', 'sb1'); b.setAttribute('aria-label', 'Menu');
        document.querySelector('.tray-shell__main').prepend(b); TrayUI.init(b.parentNode); }''')
    btn = pg.get_by_role('button', name='Menu')
    a = t.ax(btn)
    t.eq('the menu button gets aria-haspopup="dialog" and aria-expanded', (a.get('hasPopup'), a.get('expanded')), ('dialog', False))
    t.clear_events(pg)
    btn.click()
    sheet = pg.locator('dialog.tray-sheet')
    t.check('it opens the sidebar in a modal sheet', sheet.evaluate('d => d.open && d.matches(":modal") && !!d.querySelector("#sb1")'))
    n = t.ax(sheet)
    t.eq('the sheet takes the sidebar\'s name', (n['role'], n['name']), ('dialog', 'Main'))
    t.eq('and the button says it is expanded', btn.get_attribute('aria-expanded'), 'true')
    t.check('focus moves into the sheet', sheet.evaluate('d => d.contains(document.activeElement)'), t.focused(pg))
    sheet.get_by_role('link', name='Batches').click()
    t.settle(pg)
    t.check('following a link closes the sheet', not sheet.evaluate('d => d.open'))
    t.check('and puts the sidebar back where it was', pg.evaluate('() => document.querySelector(".tray-shell").contains(document.getElementById("sb1"))'))
    t.eq('the button says it is collapsed again, and focus is back on it', (btn.get_attribute('aria-expanded'), t.focused(pg)['label']), ('false', 'Menu'))
    t.eq('it fires tray:open and tray:close', [e['type'] for e in t.events(pg) if e['type'] in ('tray:open', 'tray:close')], ['tray:open', 'tray:close'])
    btn.click()
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('Escape closes it too', not sheet.evaluate('d => d.open') and t.focused(pg)['label'] == 'Menu', t.focused(pg))


# Static parity (trayui-react/static): the collapse button carries data-tray="sidebar-toggle" there, and bundle.js collapses
# the sidebar to its rail and renames the button.
STATIC = True
STATIC_SKIP = {'CollapsedRail': "the preview's own button and the sidebar follow the preview's React state (collapsed), which a static page's own script keeps"}
