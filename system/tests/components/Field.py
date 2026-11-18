"""Field: README.md, Accessibility. The <label for> names the control and aria-describedby adds the hint or the error, read
when the field takes focus; aria-invalid="true" is announced and draws the danger edge; an invalid control with focus still
draws the focus ring, the danger edge inside it; a <fieldset> is read with the name of its <legend>; under reduced motion
the error appears at once instead of sliding in."""


def test_tree(t):
    pg = t.open()
    t.match_tree('a fieldset named by its legend, each control by its label', pg.locator('form'), '''
- group "Where to deliver":
  - textbox "Name": Dana Kovalenko
  - textbox "Phone" [invalid]
  - paragraph: Enter the phone number with its area code.
  - textbox "Address"
  - paragraph: The courier calls ten minutes before arriving.
- textbox "Display name": Dana
''')
    t.eq('the error is read with the invalid control', t.ax(pg.locator('#f2'))['description'], 'Enter the phone number with its area code.')
    t.eq('the hint is read with its control', t.ax(pg.locator('#f3'))['description'], 'The courier calls ten minutes before arriving.')
    t.eq('the hint of a row field too', t.ax(pg.locator('#f4'))['description'], 'Shown on your orders and reviews.')
    t.eq('the placeholder is not the name: the label is', t.ax(pg.locator('#f3'))['name'], 'Address')


def test_focus(t):
    pg = t.open()
    pg.keyboard.press('Tab'); pg.keyboard.press('Tab')
    t.eq('Tab reaches the invalid field', t.focused(pg)['id'], 'f2')
    s = t.style(pg.locator('#f2'), 'outline-style', 'outline-width', 'outline-offset', 'box-shadow')
    t.check('focus draws the 2px ring on its edge and keeps the danger edge inside', s['outline-style'] == 'solid' and s['outline-width'] == '2px' and s['outline-offset'] == '0px' and 'inset' in s['box-shadow'], s)
    pg.keyboard.press('Tab')
    calm = t.style(pg.locator('#f2'), 'outline-width', 'outline-offset')
    t.eq('without focus the danger edge is a 2px ring inside the field', calm, {'outline-width': '2px', 'outline-offset': '-2px'})


def test_motion(t):
    pg = t.open(motion='no-preference')
    t.check('the error slides in', 'translate' in t.style(pg.locator('.tray-field__error'), 'transition-property'), t.style(pg.locator('.tray-field__error'), 'transition-property'))
    pg = t.open(motion='reduce')
    s = t.style(pg.locator('.tray-field__error'), 'transition-property', 'transition-duration')
    t.check('with reduced motion it appears at once', s['transition-duration'] == '0s' or 'translate' not in s['transition-property'], s)


def test_layout(t):
    for w, cols in ((390, 1), (1440, 2)):
        pg = t.open(width=w)
        n = pg.locator('.tray-fields').evaluate('e => getComputedStyle(e).gridTemplateColumns.split(" ").length')
        t.eq(f'tray-fields lays fields out {cols} per row at {w}px', n, cols)
    full = pg.locator('.tray-field--full').bounding_box()['width']
    t.check('tray-field--full spans both columns', full > pg.locator('.tray-fields .tray-field').first.bounding_box()['width'] * 1.8)


PARITY = [('.tray-fields > .tray-field:nth-child(2)', 'Basic', '.tray-fields > .tray-field:nth-child(2)'),
          ('.tray-field--row', 'Row', '.tray-field--row')]


def test_parity_descriptions(t):
    h, r = t.open(), t.open_react()
    cell = t.cell(r, 'Basic')
    t.eq('the error is the description of the invalid control in both', t.ax(cell.locator('input[aria-invalid="true"]'))['description'], t.ax(h.locator('#f2'))['description'])
    t.eq('the hint is the description in both', t.ax(cell.locator('input[placeholder="Street, house, apartment"]'))['description'], t.ax(h.locator('#f3'))['description'])
