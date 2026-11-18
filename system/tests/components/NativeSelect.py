"""Native Select: README.md, Accessibility. The browser's own <select>, named by its <label for>; <optgroup> labels read with
their options; the chevron is drawn in CSS and not read; a disabled first option is read as unavailable and cannot be
chosen; aria-invalid="true" is announced and draws the danger edge, which stays inside the focus ring with focus, and
aria-describedby reads the error; tray-select--sm is the 48px size."""


def test_tree(t):
    pg = t.open()
    t.match_tree('selects named by their labels, with their options', pg.locator('.tray-demo'), '''
- combobox "Delivery window":
  - option "14:00 to 18:00" [selected]
- combobox "Pickup point" [invalid]:
  - option "Choose a point" [disabled] [selected]
- paragraph: Choose where to collect the order.
- combobox "Rows per page"
''')
    t.eq('the error is read with the invalid select', t.ax(pg.locator('#n2'))['description'], 'Choose where to collect the order.')
    groups = pg.locator('#n2 optgroup').evaluate_all('gs => gs.map(g => g.label)')
    t.eq('the options are grouped with labels', groups, ['City', 'Farm'])
    t.eq('the chevron is drawn in CSS and has no text', t.style(pg.locator('.tray-select').first, 'content', pseudo='::after'), '""')


def test_keys(t):
    pg = t.open()
    pg.keyboard.press('Tab'); pg.keyboard.press('Tab')
    t.eq('Tab reaches the second select', t.focused(pg)['id'], 'n2')
    s = t.style(pg.locator('#n2'), 'outline-width', 'outline-offset', 'box-shadow')
    t.check('focus draws the ring on the edge and keeps the danger edge inside', s['outline-width'] == '2px' and s['outline-offset'] == '0px' and 'inset' in s['box-shadow'], s)
    pg.select_option('#n2', 'Farm shop')
    t.eq('a real option can be chosen', pg.input_value('#n2'), 'Farm shop')
    try:
        pg.select_option('#n2', 'Choose a point', timeout=500)
        chosen = pg.input_value('#n2')
    except Exception:
        chosen = 'refused'
    t.check('the disabled first option cannot be chosen', chosen in ('refused', 'Farm shop'), chosen)


def test_look(t):
    pg = t.open()
    t.eq('tray-select--sm is 48px tall', round(pg.locator('#n3').bounding_box()['height']), 48)
    t.eq('a select is 56px tall', round(pg.locator('#n1').bounding_box()['height']), 56)


PARITY = [('.tray-field:nth-child(1)', 'States', '.tray-field:nth-child(1)'),
          ('.tray-field:nth-child(2)', 'States', '.tray-field:nth-child(2)'),
          ('.tray-field:nth-child(3)', 'States', '.tray-field:nth-child(3)')]


def test_parity_error(t):
    h, r = t.open(), t.open_react()
    t.eq('React: the error is the description of the invalid select', t.ax(t.cell(r, 'States').locator('select[aria-invalid="true"]'))['description'], t.ax(h.locator('#n2'))['description'])
