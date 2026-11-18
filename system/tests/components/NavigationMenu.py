"""Navigation Menu: README.md. A <header> holding a <nav> named by its aria-label (both landmarks); the current section
carries aria-current="page" and its ink fill is drawn from it; a link with children is a Popover trigger that reports
aria-expanded, moves focus to the panel's first link on opening, and Escape closes it and puts focus back on the button;
the panel is a disclosure, not a menu: Tab moves through its links. Links draw their focus ring inside their edge; the theme
switch is an icon button with an aria-label and aria-pressed. From 76rem the header is one row; below, the strip takes a
second row of its own and scrolls sideways when its links do not fit."""

HEAD = 'header.tray-nav'


def test_tree(t):
    pg = t.open()
    t.match_tree('a banner holding a named navigation of links, a button that opens a panel, and the actions', pg.locator(HEAD), '''
- banner:
  - link "Perly"
  - navigation "Main":
    - list:
      - listitem:
        - button "Shop" [expanded]
        - link /White caviar/
        - link /Jars/
        - link /Gift boxes/
        - link /Delivery and pickup/
      - listitem:
        - link "The farm"
      - listitem:
        - link "Field notes"
      - listitem:
        - link "Questions"
  - button "Dark theme"
  - link "Order a jar"
''')
    cur = pg.locator(f'{HEAD} [aria-current]')
    t.eq('the current section is marked aria-current="page"', (cur.inner_text(), cur.get_attribute('aria-current')), ('Field notes', 'page'))
    ink = pg.evaluate('() => { const i = document.createElement("i"); i.style.color = "var(--ink)"; document.body.append(i); const v = getComputedStyle(i).color; i.remove(); return v; }')
    t.eq('and its ink fill is drawn from it', t.style(cur, 'background-color'), ink)
    theme = t.ax(pg.get_by_role('button', name='Dark theme'))
    t.eq('the theme switch is a named toggle button', (theme['role'], theme.get('pressed')), ('button', 'false'))
    t.check('the panel is a disclosure, not a menu', pg.locator(f'{HEAD} [role="menu"], {HEAD} [role="menuitem"]').count() == 0)


def drive(t, pg, scope, who=''):
    shop = scope.get_by_role('button', name='Shop')
    pg.mouse.click(5, 5)  # close the panel the preview holds open
    t.settle(pg)
    t.eq(who + 'a closed panel is reported by aria-expanded', shop.get_attribute('aria-expanded'), 'false')
    shop.focus()
    pg.keyboard.press('Enter')
    t.check(who + 'Enter opens the panel and moves focus to its first link', shop.get_attribute('aria-expanded') == 'true' and 'White caviar' in t.focused(pg)['text'], t.focused(pg))
    pg.keyboard.press('Tab')
    t.check(who + 'Tab moves through its links', 'Jars' in t.focused(pg)['text'], t.focused(pg))
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check(who + 'Escape closes it and puts focus back on the button', shop.get_attribute('aria-expanded') == 'false' and t.focused(pg)['text'].startswith('Shop'), t.focused(pg))
    pg.keyboard.press('Space')
    t.check(who + 'Space opens it too', shop.get_attribute('aria-expanded') == 'true')
    pg.keyboard.press('Escape')
    t.settle(pg)


def test_keys(t):
    pg = t.open()
    drive(t, pg, pg.locator(HEAD))
    pg.keyboard.press('Shift+Tab')
    pg.keyboard.press('Tab')
    ring = t.style(pg.locator(f'{HEAD} .tray-tab').first, 'outline-width', 'outline-offset')
    t.eq('links and tabs draw their focus ring inside their edge', (ring['outline-width'], ring['outline-offset']), ('3px', '-3px'))


def test_rows(t):
    pg = t.open(width=1440)
    tops = pg.evaluate('''() => ['.tray-wordmark', '.tray-nav__strip', '.tray-nav__actions'].map(s => Math.round(document.querySelector(s).getBoundingClientRect().top))''')
    t.check('from 76rem the header is one row', max(tops) - min(tops) < 20, tops)
    pg = t.open(width=390)
    strip = pg.locator('.tray-nav__links')
    r = pg.evaluate('''() => { const w = document.querySelector('.tray-wordmark').getBoundingClientRect(), s = document.querySelector('.tray-nav__strip').getBoundingClientRect(); return [w.bottom, s.top]; }''')
    t.check('below 76rem the strip takes a second row of its own', r[1] >= r[0], r)
    t.check('and scrolls sideways when its links do not fit', strip.evaluate('e => e.scrollWidth > e.clientWidth && getComputedStyle(e).overflowX === "auto"'), strip.evaluate('e => [e.scrollWidth, e.clientWidth, getComputedStyle(e).overflowX]'))
    box = pg.locator(f'{HEAD} .tray-pop').bounding_box()
    t.check('the open panel stays inside a 390px window', box['x'] >= 0 and box['x'] + box['width'] <= 390, box)
    t.check('and hangs under the strip', box['y'] >= pg.locator('.tray-nav__strip').bounding_box()['y'] + 40, box)
    drive(t, pg, pg.locator(HEAD), '390px: ')


def test_parity_keys(t):
    pg = t.open_react()
    drive(t, pg, t.cell(pg, 'ShopOpen').locator(HEAD), 'react: ')


def test_parity_tree(t):
    h, r = t.open(), t.open_react()
    a = t.tree(h.locator(HEAD))
    b = t.tree(t.cell(r, 'ShopOpen').locator(HEAD))
    t.check('parity: the header = ShopOpen header', a == b, f'html:\n{a}\nreact:\n{b}')


