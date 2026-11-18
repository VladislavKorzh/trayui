"""App Shell: README.md. The shell gives the page its landmarks: the sidebar a <nav> with an aria-label, the top bar a
<header>, the content the page's one <main>. The collapse button (tray-app__collapse, data-tray="sidebar-toggle") carries
aria-controls naming the sidebar, keeps aria-expanded in step and changes its name from "Collapse the sidebar" to "Expand the
sidebar"; in the rail the item text is only hidden from sight, so each item keeps its name (and the Workspace Switcher too,
by its README). Below 56rem the collapse button hides and the tray-app__menu button (data-tray="sidebar-sheet") opens the
same sidebar in a modal Sheet named after it: focus moves in, Escape or the close button shuts it, focus returns to the button,
and following a link in the sheet closes it."""


NAV = '#app-sb'
COLLAPSE = '[data-tray="sidebar-toggle"]'
MENU = '[data-tray="sidebar-sheet"]'


def test_tree(t):
    pg = t.open()
    t.eq('one main, one banner, the sidebar a nav named "Main"', pg.evaluate('''[document.querySelectorAll('main').length, document.querySelectorAll('.tray-app__main > header').length,
        document.querySelector('.tray-app__side > nav').getAttribute('aria-label')]'''), [1, 1, 'Main'])
    t.match_tree('the landmarks of the page', pg.locator('.tray-app'), '''
- navigation "Main"
- banner:
  - button "Collapse the sidebar" [expanded]
  - navigation "Breadcrumb"
- main:
  - heading "Orders" [level=1]
''')
    b = pg.locator(COLLAPSE)
    t.eq('the collapse button names the sidebar it controls', b.get_attribute('aria-controls'), 'app-sb')
    t.check('the menu button is hidden on a wide window', not pg.locator(MENU).is_visible())
    t.eq('the table of the content has a name', t.ax(pg.locator('.tray-app__content table'))['name'], 'Orders')


def test_collapse(t):
    pg = t.open()
    nav = pg.locator(NAV)
    before = [' '.join(n.split()) for n in pg.locator(NAV).locator('a.tray-sidebar__item').evaluate_all('es => es.map(e => e.textContent)')]
    names_before = [t.ax(pg.locator(NAV).locator('a.tray-sidebar__item').nth(i))['name'] for i in range(3)]
    switcher_before = t.ax(pg.locator('.tray-switcher'))['name']
    b = pg.locator(COLLAPSE)
    b.focus(); pg.keyboard.press('Enter')
    t.check('Enter on the button collapses the sidebar to a rail', nav.get_attribute('data-collapsed') is not None)
    a = t.ax(b)
    t.eq('the button now says it expands, and is not expanded', (a['name'], a.get('expanded')), ('Expand the sidebar', False))
    t.eq('it fires tray:change on the sidebar', [(e['target'], e['detail']) for e in t.events(pg, 'tray:change')], [('nav#app-sb.tray-sidebar', {'collapsed': True})])
    t.eq('in the rail each item keeps its name', [t.ax(pg.locator(NAV).locator('a.tray-sidebar__item').nth(i))['name'] for i in range(3)], names_before)
    t.check('while its text is hidden from sight', pg.locator(NAV).locator('a.tray-sidebar__item > span').first.evaluate('s => s.getBoundingClientRect().width <= 1'))
    t.eq('the workspace switcher keeps its name in the rail', t.ax(pg.locator('.tray-switcher'))['name'], switcher_before)
    t.check('the rail is narrower than the sidebar', nav.bounding_box()['width'] < 100, nav.bounding_box())
    pg.keyboard.press('Space')
    t.check('Space expands it again', nav.get_attribute('data-collapsed') is None and b.get_attribute('aria-label') == 'Collapse the sidebar' and b.get_attribute('aria-expanded') == 'true')
    t.eq('and the items read as before', [' '.join(n.split()) for n in pg.locator(NAV).locator('a.tray-sidebar__item').evaluate_all('es => es.map(e => e.textContent)')], before)


def test_phone_sheet(t):
    pg = t.open(width=390, height=800)
    t.check('below 56rem the sidebar is hidden', not pg.locator('.tray-app__side').is_visible())
    t.check('the collapse button hides too, with nothing to collapse', not pg.locator(COLLAPSE).is_visible())
    m = pg.locator(MENU)
    a = t.ax(m)
    t.check('the menu button shows, says it opens a dialog, and is not expanded', m.is_visible() and a.get('hasPopup') == 'dialog' and a.get('expanded') is False, a)
    m.focus(); pg.keyboard.press('Enter')
    sheet = pg.locator('dialog.tray-sheet--nav')
    t.check('it opens the sidebar in a modal sheet', sheet.evaluate('d => d.matches(":modal")') and sheet.locator(NAV).count() == 1)
    t.eq('the sheet is named after the sidebar', t.ax(sheet)['name'], 'Main')
    t.check('focus moves into it', sheet.evaluate('d => d.contains(document.activeElement)'), t.focused(pg))
    t.eq('the button reports it open', m.get_attribute('aria-expanded'), 'true')
    t.has('and fires tray:open', [e['type'] for e in t.events(pg)], 'tray:open')
    pg.keyboard.press('Escape'); t.settle(pg)
    t.check('Escape shuts it', not sheet.evaluate('d => d.open'))
    t.eq('focus returns to the menu button', t.focused(pg)['label'], 'Open the navigation')
    t.check('the sidebar goes back to its place in the shell', pg.locator('.tray-app__side > ' + NAV).count() == 1)
    t.eq('the button reports it shut', m.get_attribute('aria-expanded'), 'false')
    m.click()
    sheet.locator('.tray-sheet__close').click(); t.settle(pg)
    t.check('the close button shuts it', not sheet.evaluate('d => d.open'))
    m.click()
    sheet.locator('a.tray-sidebar__item', has_text='Customers').click(); t.settle(pg)
    t.check('following a link in the sheet closes it', not sheet.evaluate('d => d.open'))


def test_collapsed_then_sheet(t):
    pg = t.open()
    pg.locator(COLLAPSE).click()
    pg.set_viewport_size({'width': 390, 'height': 800})
    pg.wait_for_timeout(100)
    pg.locator(MENU).click()
    t.check('the sheet shows the full sidebar, not the rail', pg.locator('dialog.tray-sheet--nav ' + NAV).get_attribute('data-collapsed') is None)
    pg.keyboard.press('Escape'); t.settle(pg)
    t.check('and the rail comes back with the sidebar to the shell', pg.locator('.tray-app__side > ' + NAV).get_attribute('data-collapsed') is not None)


def drive_collapse(t, pg, root, label):
    b = root.locator('.tray-topbar button[aria-controls]').first
    side = pg.locator('#' + b.get_attribute('aria-controls'))
    t.check(f'{label}the collapse button controls the sidebar, expanded at first', side.count() == 1 and b.get_attribute('aria-expanded') == 'true' and b.get_attribute('aria-label') == 'Collapse the sidebar')
    b.focus(); pg.keyboard.press('Enter')
    t.check(f'{label}Enter collapses it and the button says Expand', side.get_attribute('data-collapsed') is not None and b.get_attribute('aria-label') == 'Expand the sidebar' and b.get_attribute('aria-expanded') == 'false')
    t.check(f'{label}the switcher keeps its name in the rail', bool(t.ax(side.locator('.tray-switcher'))['name']))


def test_react(t):
    pg = t.open_react()
    cell = t.cell(pg, 'Product')
    drive_collapse(t, pg, cell, 'react: ')
    t.eq('react: the avatar button ends its name with its initials', t.ax(cell.locator('button.tray-avatar'))['name'], 'Account: Oksana Franko, OF')
    ph = t.open_react(width=390)
    cell = t.cell(ph, 'Product')
    t.check('react: the collapse button hides below 56rem, where nothing is left to collapse', not cell.locator('.tray-topbar button[aria-controls]').first.is_visible())
    m = cell.locator('.tray-app__menu')
    m.click()
    sheet = ph.locator('dialog[open]')
    t.check('react: the menu button opens the sidebar in a modal sheet', sheet.count() == 1 and sheet.evaluate('d => d.matches(":modal")'))
    ph.keyboard.press('Escape'); t.settle(ph)
    t.check('react: Escape shuts it and focus returns to the menu button', ph.locator('dialog[open]').count() == 0 and 'tray-app__menu' in t.focused(ph)['cls'], t.focused(ph))
