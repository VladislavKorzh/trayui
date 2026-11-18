"""Sheet: README.md. A modal <dialog class="tray-sheet"> named by its title; showModal() moves focus into it and makes the
page inert; Escape and a press on the veil close it (not with data-static); focus returns to the opener; the close button is
an icon button named "Close". It sits on the end side (the left, right to left), full height, at most 26rem wide;
tray-sheet--start puts it on the start side. Under reduced motion it fades in, in 0.1s, instead of sliding in."""

SETUP = '''() => { const d = document.querySelector('.tray-sheet'); d.close(); d.id = 'sh'; document.body.append(d);
  const b = document.createElement('button'); b.type = 'button'; b.className = 'tray-btn tray-btn--quiet'; b.id = 'opener';
  b.textContent = 'Filters'; b.dataset.tray = 'open'; b.dataset.target = '#sh';
  document.querySelector('.tray-demo').prepend(b); TrayUI.init(b); }'''

# The harness measures the part of a target in view: in the preview at 390px the sheet scrolls and its last foot button
# is partly under the fold (it is 56px tall: test_targets scrolls it into view and measures it).
NO44 = {'.tray-stage .tray-sheet .tray-dialog__foot .tray-btn': 'scrolled partly out of the sheet at 390px; measured in test_targets'}


def open_modal(t, **kw):
    pg = t.open(**kw)
    pg.evaluate(SETUP)
    pg.click('#opener')
    return pg, pg.locator('#sh')


def test_tree(t):
    pg = t.open()
    t.match_tree('a dialog named by its title, a Close button, the filters, and the foot', pg.locator('.tray-stage'), '''
- dialog "Filters":
  - heading "Filters" [level=2]
  - button "Close"
  - group "Status":
    - checkbox "Paid" [checked]
    - checkbox "Pay on delivery" [checked]
    - checkbox "Payment failed"
  - radiogroup "Placed":
    - radio "Today"
    - radio "Week" [checked]
    - radio "Month"
  - switch "Gift boxes only"
  - button "Clear"
  - button "Show 8 orders"
''')


def test_keys(t):
    pg, d = open_modal(t)
    a = t.ax(d)
    t.eq('opened, a modal dialog named "Filters"', (a['role'], a['name'], a.get('modal')), ('dialog', 'Filters', True))
    t.eq('focus moves into it, to the Close button', t.focused(pg)['label'], 'Close')
    t.check('the page behind is inert', t.ax(pg.locator('#opener'))['ignored'])
    out = []
    for _ in range(12):
        pg.keyboard.press('Tab')
        if not d.evaluate('d => document.activeElement === document.body || d.contains(document.activeElement)'):
            out.append(t.focused(pg))
    t.check('focus stays inside', not out, out)
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('Escape closes it', not d.evaluate('d => d.open'))
    t.check('focus returns to the opener', pg.locator('#opener').evaluate('b => b === document.activeElement'), t.focused(pg))
    pg.click('#opener')
    pg.mouse.click(4, 300)
    t.settle(pg)
    t.check('a press on the veil closes it', not d.evaluate('d => d.open'))
    d.evaluate('d => d.setAttribute("data-static", "")')
    pg.click('#opener')
    pg.mouse.click(4, 300)
    pg.wait_for_timeout(60)
    t.check('not with data-static', d.evaluate('d => d.open'))
    pg.click('#sh [data-close]:not([aria-label])')
    t.settle(pg)
    t.check('its data-close button closes it', not d.evaluate('d => d.open'))


def test_place(t):
    pg, d = open_modal(t, width=1280)
    b = d.bounding_box()
    t.check('on the end side, full height, 26rem wide', abs(b['x'] + b['width'] - 1280) < 1 and b['y'] == 0 and b['height'] == 900 and round(b['width']) == 416, b)
    t.eq('its corners are on its inner edge', t.style(d, 'border-top-left-radius', 'border-top-right-radius'),
         {'border-top-left-radius': '40px', 'border-top-right-radius': '0px'})
    pg, d = open_modal(t, width=1280, rtl=True)
    b = d.bounding_box()
    t.check('right to left, the end side is the left', b['x'] == 0, b)
    pg, d = open_modal(t, width=1280)
    d.evaluate('d => { d.close(); d.classList.add("tray-sheet--start"); }')
    pg.click('#opener')
    b = d.bounding_box()
    t.check('tray-sheet--start puts it on the start side', b['x'] == 0, b)
    pg, d = open_modal(t, width=390)
    t.eq('on a phone it takes the whole width', round(d.bounding_box()['width']), 390)


def test_targets(t):
    pg = t.open(width=390)
    sheet = pg.locator('.tray-stage .tray-sheet')
    sheet.evaluate('s => { s.scrollTop = s.scrollHeight; }')
    for name in ('Clear', 'Show 8 orders'):
        w, h = t.hit(sheet.get_by_role('button', name=name))
        t.check(f'scrolled into view, "{name}" is at least 44px tall', h >= 44, (w, h))


def test_motion(t):
    pg, d = open_modal(t)
    anims = [a for a in t.running_animations(pg) if 'tray-sheet' in str(a['target'])]
    names = {a['name'] for a in anims}
    t.check('reduced motion: it fades in, without sliding', 'opacity' in names and 'translate' not in names, names)
    t.check('in a tenth of a second', max([a['duration'] for a in anims] or [0]) <= 100, anims)
    pg, d = open_modal(t, motion='no-preference')
    names = {a['name'] for a in t.running_animations(pg) if 'tray-sheet' in str(a['target'])}
    t.check('without the setting it slides in from its edge', 'translate' in names, names)


PARITY = [('.tray-stage', 'Filters', '.tray-stage')]


def test_parity_modal(t):
    r = t.open_react()
    cell = t.cell(r, 'RowDetails')
    opener = cell.get_by_role('button', name='Open order PL-20431')
    d = cell.locator('dialog.tray-sheet').first
    opener.click()
    a = t.ax(d)
    t.eq('react: the trigger opens a modal sheet named by its title', (a['role'], a['name'], a.get('modal')), ('dialog', 'Order PL-20431', True))
    t.eq('react: focus moves into it, to the Close button', t.focused(r)['label'], 'Close')
    r.keyboard.press('Escape')
    t.settle(r)
    t.check('react: Escape closes it and focus returns to the trigger', not d.evaluate('d => d.open') and opener.evaluate('b => b === document.activeElement'), t.focused(r))
    opener.click()
    r.mouse.click(4, 300)
    t.settle(r)
    t.check('react: a press on the veil closes it', not d.evaluate('d => d.open'))
