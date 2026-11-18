"""Tabs: README.md, Accessibility. A tablist of tab buttons tied to their panels; the chosen one alone in the Tab order;
arrows (mirrored right to left), Home and End; a disabled tab passed over; tray:change with detail.tab; navigation tabs are
links in a nav with aria-current."""


def test_tree(t):
    pg = t.open()
    t.match_tree('a tablist of tabs, the first selected, the disabled one disabled', pg.locator('[data-tray="tabs"]'), '''
- tablist "Order PL-20418":
  - tab "Items" [selected]
  - tab "Delivery"
  - tab /Messages/
  - tab "Refunds" [disabled]
- tabpanel "Items"
''')
    a = t.ax(pg.locator('#tt1'))
    t.eq('the tab controls its panel', pg.get_attribute('#tt1', 'aria-controls'), 'tp1')
    t.check('the chosen tab is the only one in the Tab order', pg.evaluate('[...document.querySelectorAll("[role=tab]")].map(t => t.tabIndex).join()') == '0,-1,-1,-1', pg.evaluate('[...document.querySelectorAll("[role=tab]")].map(t => t.tabIndex).join()'))
    t.eq('the AX node of the chosen tab', (a['role'], a['name'], a.get('selected')), ('tab', 'Items', True))


def test_keys(t):
    pg = t.open()
    pg.focus('#tt1')
    pg.keyboard.press('ArrowRight')
    t.eq('ArrowRight moves to the next tab', t.focused(pg)['id'], 'tt2')
    t.check('and shows its panel at once', pg.is_visible('#tp2') and not pg.is_visible('#tp1'))
    t.eq('it fires tray:change with the tab', [e['detail'] for e in t.events(pg, 'tray:change')], [{'tab': 'tt2'}])
    pg.keyboard.press('End')
    t.eq('End jumps to the last tab that is not disabled', t.focused(pg)['id'], 'tt3')
    pg.keyboard.press('ArrowRight')
    t.eq('ArrowRight wraps past the disabled tab', t.focused(pg)['id'], 'tt1')
    pg.keyboard.press('Tab')
    t.eq('Tab goes from the tab into its panel', t.focused(pg)['id'], 'tp1')


def test_rtl(t):
    pg = t.open(rtl=True)
    pg.focus('#tt1')
    pg.keyboard.press('ArrowLeft')
    t.eq('right to left, ArrowLeft moves to the next tab', t.focused(pg)['id'], 'tt2')


PARITY = [('[data-tray="tabs"] [role="tablist"]', 'Panels', '[role="tablist"]')]


def drive_panels(t, pg, root, who='', events=True):
    """Keys on a strip of four tabs (Items, Delivery, Messages, Refunds disabled), from the first."""
    tabs = root.get_by_role('tab')
    t.clear_events(pg)
    tabs.first.focus()
    pg.keyboard.press('End')
    t.eq(who + 'End jumps to the last tab that can be chosen', t.ax(pg.locator(':focus'))['name'].startswith('Messages'), True)
    pg.keyboard.press('Home')
    t.eq(who + 'Home jumps to the first', t.ax(pg.locator(':focus'))['name'], 'Items')
    pg.keyboard.press('ArrowLeft')
    t.check(who + 'ArrowLeft from the first wraps to the last that can be chosen, passing over the disabled one', t.ax(pg.locator(':focus'))['name'].startswith('Messages'), t.focused(pg))
    t.check(who + 'and shows its panel at once', root.get_by_role('tabpanel').count() == 1 and 'Three messages' in root.get_by_role('tabpanel').inner_text(), root.get_by_role('tabpanel').all_inner_texts())
    if events:
        t.eq(who + 'each change fires tray:change', len(t.events(pg, 'tray:change')), 3)
    t.eq(who + 'the chosen tab is the only one in the Tab order', tabs.evaluate_all('ts => ts.map(t => t.tabIndex)'), [-1, -1, 0, -1])
    pg.keyboard.press('Tab')
    t.check(who + 'Tab goes from the chosen tab into its panel', pg.locator(':focus').get_attribute('role') == 'tabpanel', t.focused(pg))


def test_more_keys(t):
    pg = t.open()
    t.eq('the tab shown at load fires nothing', t.events(pg, 'tray:change'), [])
    drive_panels(t, pg, pg.locator('[data-tray="tabs"]'))
    pg.locator('#tt1').focus()
    pg.keyboard.press('Shift+Tab')
    pg.keyboard.press('Tab')
    ring = t.style(pg.locator('#tt3'), 'outline-style', 'outline-width', 'outline-offset')
    t.eq('focus draws the ring inside the tab', (ring['outline-style'], ring['outline-width'], ring['outline-offset']), ('solid', '3px', '-3px'))


def test_navigation(t):
    pg = t.open()
    t.match_tree('navigation tabs are links in a named nav, the current one marked', pg.locator('.tray-card nav'), '''
- navigation "Sections":
  - link "The guide"
  - link "Field notes"
  - link "Orders"
''')
    t.eq('the current link carries aria-current="page"', pg.locator('.tray-card nav [aria-current]').inner_text(), 'Field notes')
    pg.locator('.tray-card nav a').first.focus()
    t.eq('Tab moves through the links', [f['text'] for f in t.tab_through(pg, 2)], ['Field notes', 'Orders'])
    strip = pg.locator('[data-tray="strip"]')
    t.check('a strip that does not fit scrolls sideways', strip.evaluate('e => getComputedStyle(e).overflowX === "auto" && e.scrollWidth > e.clientWidth'))
    t.check('and is marked while tabs run past its end', strip.evaluate('e => e.classList.contains("is-clipped")'))
    strip.evaluate('e => { e.scrollLeft = e.scrollWidth; e.dispatchEvent(new Event("scroll")); }')
    pg.wait_for_timeout(50)
    t.check('scrolled to its end it is no longer marked', not strip.evaluate('e => e.classList.contains("is-clipped")'))


def test_look(t):
    pg = t.open(motion='no-preference')
    pg.click('#tt2')
    pill = pg.locator('[role="tablist"] > .tray-glide')
    t.check('the ink pill slides to the tab chosen', 'translate' in t.style(pill, 'transition-property'), t.motion(pill))
    t.check('and the panel chosen by a press fades in', 'opacity' in t.style(pg.locator('#tp2'), 'transition-property'), t.motion(pg.locator('#tp2')))
    pg = t.open()
    pg.click('#tt2')
    t.eq('under reduced motion the pill moves at once', t.style(pg.locator('[role="tablist"] > .tray-glide'), 'transition-duration').split(',')[0].strip(), '0s')
    t.eq('and the panel appears without fading', t.style(pg.locator('#tp2'), 'transition-duration').split(',')[0].strip(), '0s')
    pg = t.open(forced=True)
    sc = t.system_colors(pg)
    for sel in ('#tt1', '.tray-card nav [aria-current]'):
        c = t.style(pg.locator(sel), 'background-color', 'color')
        t.eq(f'with forced colours the chosen tab ({sel}) takes SelectedItem', (c['background-color'], c['color']), (sc['SelectedItem'], sc['SelectedItemText']))


def test_parity_keys(t):
    pg = t.open_react()
    drive_panels(t, pg, t.cell(pg, 'Panels'), 'react: ', events=False)


PARITY += [
    ('.tray-card nav', 'NavigationFill', 'nav'),
    ('[data-tray="strip"]', 'ScrollingStrip', 'nav'),
]
