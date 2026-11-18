"""Input: README.md, States and Accessibility. The browser's own <input>, named by the <label for> of its Field and never by
its placeholder; 56px tall, 48px with tray-input--sm; focus draws a 2px ink outline on the edge; aria-invalid="true" is
announced and draws a 2px danger ring inside, kept inside the focus ring with focus; aria-describedby reads the reason;
disabled takes it out of the Tab order, readonly keeps it focusable and is announced read-only; read-only sets the value in
ink-soft; the placeholder is ink-hint."""


def colour(pg, var):
    return pg.evaluate('(v) => { const p = document.createElement("i"); p.style.color = `var(${v})`; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return c; }', var)


def test_tree(t):
    pg = t.open()
    t.match_tree('each input named by its label', pg.locator('.tray-demo'), '''
- textbox "Email"
- textbox "City": Lviv
- textbox "Postcode" [invalid]
- paragraph: A postcode has five digits.
- textbox "Country" [disabled]: Ukraine
- textbox "Order number": PL-20418
- textbox "Small, for toolbars"
- button "Label for the jar"
''')
    t.eq('the reason is read with the invalid field', t.ax(pg.locator('#i3'))['description'], 'A postcode has five digits.')
    t.eq('read-only is announced', t.ax(pg.locator('#i5')).get('readonly'), True)
    t.eq('the placeholder is not the name', t.ax(pg.locator('#i1'))['name'], 'Email')


def test_keys(t):
    pg = t.open()
    ids = [f['id'] for f in t.tab_through(pg, 6)]
    t.eq('Tab passes the disabled field by and stops at the read-only one', ids, ['i1', 'i2', 'i3', 'i5', 'i6', 'i7'])
    pg.focus('#i2')
    s = t.style(pg.locator('#i2'), 'outline-style', 'outline-width', 'outline-offset')
    t.eq('focus draws a 2px ink outline on the edge', s, {'outline-style': 'solid', 'outline-width': '2px', 'outline-offset': '0px'})
    t.eq('in ink', t.style(pg.locator('#i2'), 'outline-color'), colour(pg, '--ink'))
    pg.keyboard.press('Tab')
    s = t.style(pg.locator('#i3'), 'outline-offset', 'box-shadow', 'outline-color')
    t.check('an invalid field with focus keeps its danger ring inside the focus outline', s['outline-offset'] == '0px' and colour(pg, '--danger') in s['box-shadow'] and s['outline-color'] == colour(pg, '--ink'), s)
    pg.keyboard.press('Tab')
    s = t.style(pg.locator('#i3'), 'outline-offset', 'outline-color')
    t.eq('without focus it draws the danger ring inside', s, {'outline-offset': '-2px', 'outline-color': colour(pg, '--danger')})


def test_look(t):
    pg = t.open()
    t.eq('an input is 56px tall', round(pg.locator('#i1').bounding_box()['height']), 56)
    t.eq('tray-input--sm is 48px tall', round(pg.locator('#i6').bounding_box()['height']), 48)
    t.eq('read-only sets the value in ink-soft', t.style(pg.locator('#i5'), 'color'), colour(pg, '--ink-soft'))
    t.eq('the placeholder is ink-hint', t.style(pg.locator('#i1'), 'color', pseudo='::placeholder'), colour(pg, '--ink-hint'))


def drive(t, pg, root):
    inv = root.locator('input[aria-invalid="true"]').first
    ro = root.locator('input[readonly]').first
    off = root.locator('input:disabled').first
    return (t.ax(inv).get('invalid'), bool(t.ax(inv)['description']), t.ax(ro).get('readonly'), t.ax(off).get('focusable', False))


def test_parity_states(t):
    h, r = t.open(), t.open_react()
    a, b = drive(t, h, h.locator('.tray-demo')), drive(t, r, t.cell(r, 'States'))
    t.eq('React: the invalid, read-only and disabled inputs read as the HTML ones do', b, a)
