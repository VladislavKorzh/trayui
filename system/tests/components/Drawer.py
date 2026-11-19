"""Drawer: README.md. A modal <dialog class="tray-drawer"> named by its title; the page behind is inert; focus moves into it
and returns to the opener; Escape, a click on the veil and a data-close button all close it; the grip is aria-hidden. It is
pinned to the bottom, at most 40rem wide and 85% of the window tall, and scrolls inside when its content is long. It rises
from the foot; under reduced motion it only fades, in 0.1s."""

SETUP = '''() => { const d = document.querySelector('.tray-drawer'); d.close(); d.id = 'dr'; document.body.append(d);
  const b = document.createElement('button'); b.type = 'button'; b.className = 'tray-btn tray-btn--quiet'; b.id = 'opener';
  b.textContent = 'Add jars'; b.dataset.tray = 'open'; b.dataset.target = '#dr';
  document.querySelector('.tray-demo').prepend(b); TrayUI.init(b); }'''


def open_modal(t, **kw):
    pg = t.open(**kw)
    pg.evaluate(SETUP)
    pg.click('#opener')
    return pg, pg.locator('#dr')


def test_tree(t):
    pg = t.open()
    d = pg.locator('.tray-drawer')
    t.match_tree('a dialog named by its title, the choices and the action', d, '''
- dialog "Add to the order":
  - heading "Add to the order" [level=2]
  - radiogroup "Jar size":
    - radio "30 g"
    - radio "50 g" [checked]
    - radio "100 g"
  - group "Quantity":
    - button "One fewer"
    - button "One more"
  - button /Add to the order/
''')
    t.eq('the grip is aria-hidden', pg.get_attribute('.tray-drawer__grip', 'aria-hidden'), 'true')


def test_keys(t):
    pg, d = open_modal(t)
    a = t.ax(d)
    t.eq('opened, a modal dialog named by its title', (a['role'], a['name'], a.get('modal')), ('dialog', 'Add to the order', True))
    t.check('focus moves into it', d.evaluate('d => d.contains(document.activeElement)'), t.focused(pg))
    t.check('the page behind is inert', t.ax(pg.locator('#opener'))['ignored'])
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('Escape closes it', not d.evaluate('d => d.open'))
    t.check('focus returns to the opener', pg.locator('#opener').evaluate('b => b === document.activeElement'), t.focused(pg))
    pg.click('#opener')
    pg.mouse.click(4, 4)
    t.settle(pg)
    t.check('a click on the veil closes it', not d.evaluate('d => d.open'))
    pg.click('#opener')
    pg.click('#dr [data-close]')
    t.settle(pg)
    t.check('a data-close button closes it', not d.evaluate('d => d.open'))


def test_place(t):
    pg, d = open_modal(t, width=1280, height=800)
    b = d.bounding_box()
    t.check('pinned to the bottom, centred, at most 40rem wide', abs(b['y'] + b['height'] - 800) < 1 and round(b['width']) == 640 and abs(b['x'] - 320) < 1, b)
    d.evaluate('d => { const p = document.createElement("div"); p.style.blockSize = "2000px"; d.insertBefore(p, d.lastElementChild); }')
    b = d.bounding_box()
    t.check('with long content it is at most 85% of the window tall', round(b['height']) <= 680, b)
    t.check('and scrolls inside', d.evaluate('d => d.scrollHeight > d.clientHeight && getComputedStyle(d).overflowY === "auto"'))
    pg, d = open_modal(t, width=390)
    t.eq('on a phone it takes the whole width', round(d.bounding_box()['width']), 390)


def test_motion(t):
    pg, d = open_modal(t)
    anims = [a for a in t.running_animations(pg) if 'tray-drawer' in str(a['target'])]
    names = {a['name'] for a in anims}
    t.check('reduced motion: it only fades', 'opacity' in names and 'translate' not in names, names)
    t.check('in a tenth of a second', max([a['duration'] for a in anims] or [0]) <= 100, anims)
    pg, d = open_modal(t, motion='no-preference')
    names = {a['name'] for a in t.running_animations(pg) if 'tray-drawer' in str(a['target'])}
    t.check('without the setting it rises from the foot', 'translate' in names, names)


PARITY = [('.tray-stage', 'AddToOrder', '.tray-stage')]


def test_parity_modal(t):
    r = t.open_react()
    cell = t.cell(r, 'CourierNote')
    opener = cell.get_by_role('button', name='Note for the courier')
    d = cell.locator('dialog.tray-drawer').first
    opener.click()
    a = t.ax(d)
    t.eq('react: the trigger opens a modal drawer named by its title', (a['role'], a['name'], a.get('modal')), ('dialog', 'Note for the courier', True))
    t.check('react: focus moves into it', d.evaluate('d => d.contains(document.activeElement)'), t.focused(r))
    r.keyboard.press('Escape')
    t.settle(r)
    t.check('react: Escape closes it and focus returns to the trigger', not d.evaluate('d => d.open') and opener.evaluate('b => b === document.activeElement'), t.focused(r))
    opener.click()
    r.mouse.click(4, 4)
    t.settle(r)
    t.check('react: a click on the veil closes it', not d.evaluate('d => d.open'))
    t.eq('react: the grip is aria-hidden', cell.locator('.tray-drawer__grip').first.get_attribute('aria-hidden'), 'true')


def test_parity_stepper(t):
    """The quantity in the drawer counts in the HTML preview (data-tray="stepper"); the React one should too."""
    h = t.open()
    h.locator('.tray-drawer').get_by_role('button', name='One more').click()
    t.eq('the HTML drawer counts one more', h.locator('.tray-drawer output').inner_text(), '3')
    r = t.open_react()
    d = t.cell(r, 'AddToOrder').locator('.tray-drawer')
    d.get_by_role('button', name='One more').click()
    t.eq('react: the drawer counts one more', d.locator('output').inner_text(), '3')


# Static parity (trayui-react/static): as for Dialog.
STATIC = True
