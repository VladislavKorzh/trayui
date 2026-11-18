"""Label: README.md, Accessibility. The browser's own <label>: for makes it the control's name and a click on it focuses the
field; the words in tray-label__opt are part of the label and read with it; a field without them is required, which a
screen reader hears only from required or aria-required on the control; a label hidden with tray-vh is still read; a
disabled field's label is muted."""


def test_tree(t):
    pg = t.open()
    t.match_tree('each field named by its label, "(optional)" and all', pg.locator('.tray-demo'), '''
- textbox "Full name": Dana Kovalenko
- textbox "Apartment (optional)"
- textbox "Promo code" [disabled]: SPRING
''')
    # The README: "Fields without it are required ... set required or aria-required="true" on the control so it is
    # announced." The preview is the example to copy, so its field without "(optional)" says it is required.
    t.eq('the field without "(optional)" is announced as required', t.ax(pg.locator('#l1')).get('required'), True)
    t.check('the optional one is not', not t.ax(pg.locator('#l2')).get('required'))


def test_click(t):
    pg = t.open()
    pg.click('label[for="l2"]')
    t.eq('a click on the label focuses its field', t.focused(pg)['id'], 'l2')


def test_hidden_label(t):
    pg = t.open()
    pg.evaluate('''() => { const d = document.createElement('div'); d.innerHTML = '<label class="tray-label tray-vh" for="lvh">Search orders</label><input class="tray-input" id="lvh" type="search">'; document.querySelector('.tray-demo').append(d); }''')
    t.eq('a label hidden with tray-vh still names its field', t.ax(pg.locator('#lvh'))['name'], 'Search orders')


def test_look(t):
    pg = t.open()
    t.check('a disabled field\'s label is muted', t.style(pg.locator('label[for="l3"]'), 'color') != t.style(pg.locator('label[for="l1"]'), 'color'))
    t.check('labels are not set in capitals or with tracking', t.style(pg.locator('label[for="l1"]'), 'text-transform') == 'none' and t.style(pg.locator('label[for="l1"]'), 'letter-spacing') in ('normal', '0px'))


def test_parity_optional(t):
    r = t.open_react()
    t.eq('React: "(optional)" is part of the name', t.ax(t.cell(r, 'Basic').locator('#lb-2'))['name'], 'Gift note (optional)')


def test_parity_required(t):
    r = t.open_react()
    t.eq('React: the field without "(optional)" is announced as required', t.ax(t.cell(r, 'Basic').locator('#lb-1')).get('required'), True)


