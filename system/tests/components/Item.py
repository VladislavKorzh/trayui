"""Item: README.md. A row that is a link or a button is named by all its text and holds no other control, its chevron
aria-hidden; a control in the end slot of a plain row has a name that says which row it belongs to; an avatar of initials
is aria-hidden when the title names the person; rows have 16px corners and stand 8px apart."""


def test_tree(t):
    pg = t.open()
    t.match_tree('a link row named by its text; plain rows with their controls named for the row', pg.locator('.tray-demo'), '''
- list:
  - listitem:
    - link "Order PL-20418 Two jars of 50 g, out for delivery"
  - listitem: Oksana Franko Farm manager On shift
  - listitem:
    - text: Order updates A text when the courier sets off
    - switch "Order updates" [checked]
- list:
  - listitem:
    - text: Receipt, 14 November PDF, 84 KB
    - button "Download the receipt of 14 November"
  - listitem:
    - text: Receipt, 3 October PDF, 81 KB
    - button "Download the receipt of 3 October"
''')
    t.eq('the chevron of the link row is hidden', pg.locator('a.tray-item .tray-item__end svg').get_attribute('aria-hidden'), 'true')
    t.eq('a link row holds no other control', pg.evaluate('document.querySelectorAll("a.tray-item :is(a, button, input, select, textarea)").length'), 0)
    t.check('the avatar beside the name is hidden', t.ax(pg.locator('.tray-item .tray-avatar'))['ignored'])
    names = pg.evaluate('[...document.querySelectorAll(".tray-item__end button")].map(b => b.getAttribute("aria-label"))')
    t.check('no two end controls share a name', len(names) == len(set(names)), names)


def test_keys(t):
    pg = t.open()
    pg.locator('body').press('Tab')
    seq = [t.focused(pg)] + t.tab_through(pg, 3)
    t.eq('Tab goes through the link row, the switch and the two download buttons, in reading order',
         [f['label'] or f['text'] for f in seq], ['Order PL-20418 Two jars of 50 g, out for delivery', 'Order updates', 'Download the receipt of 14 November', 'Download the receipt of 3 October'])


def test_look(t):
    pg = t.open()
    t.eq('a filled row has 16px corners; rows stand 8px apart', pg.evaluate('[getComputedStyle(document.querySelector(".tray-items:not(.tray-items--ruled) .tray-item")).borderTopLeftRadius, getComputedStyle(document.querySelector(".tray-items")).rowGap]'), ['16px', '8px'])
    t.eq('a ruled list has no fills, hairlines between rows', pg.evaluate('(() => { const i = document.querySelector(".tray-items--ruled .tray-item"); const c = getComputedStyle(i); return [c.backgroundColor, c.borderBottomStyle, c.borderBottomWidth]; })()'), ['rgba(0, 0, 0, 0)', 'solid', '1px'])


PARITY = [('ul.tray-items >> nth=0', 'Filled', 'ul.tray-items'),
          ('ul.tray-items--ruled', 'Ruled', 'ul.tray-items')]



def test_parity_rows(t):
    r = t.open_react()
    btn = t.cell(r, 'AsButtons').locator('button.tray-item').first
    t.check('React: a row that is a button is a <button class="tray-item"> named by all its text', btn.count() == 1 and 'Jar of 30 g' in t.ax(btn)['name'], t.ax(btn) if btn.count() else 'no button.tray-item')
    t.eq('React: its end holds no other control', t.cell(r, 'AsButtons').evaluate('c => c.querySelectorAll("button.tray-item :is(a, button, input)").length'), 0)
