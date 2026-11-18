"""Payment Method: README.md. The saved cards are native radios in a <fieldset> named by its <legend>; the whole row is
each radio's label; the arrow keys move the choice and pass over a disabled card, which is announced as unavailable and
says why in words; the focus ring goes round the whole row. Each new-card field has its own <label> and its autocomplete
value; the security code's hint is tied on with aria-describedby. data-tray="mask": data-mask="card" groups the digits in
fours (19 at most), data-mask="expiry" writes MM/YY, and the caret goes back after the digit it followed."""


def test_tree(t):
    pg = t.open()
    t.match_tree('the saved cards: a group named by its legend, the chosen one checked, the expired one disabled', pg.locator('fieldset'), '''
- group "Pay with":
  - radio "Card ending 4242 Expires 08/27 Default" [checked]
  - radio "Card ending 0005 Expires 01/28"
  - radio "Card ending 1881 Expired in 03/26" [disabled]
''')
    dead = t.ax(pg.locator('input[name="pm-card"]').nth(2))
    t.check('a card that cannot be used is announced as unavailable, and its line says why in words', dead.get('disabled') is True and 'Expired in 03/26' in dead['name'], dead)
    fields = pg.evaluate('''() => ['pm-number', 'pm-exp', 'pm-cvc'].map(id => { const i = document.getElementById(id); return [i.labels.length ? i.labels[0].textContent.trim() : '', i.getAttribute('autocomplete'), i.getAttribute('inputmode')]; })''')
    t.eq('each new-card field has its own label, its autocomplete value and a numeric keyboard', fields,
         [['Card number', 'cc-number', 'numeric'], ['Expires', 'cc-exp', 'numeric'], ['Security code', 'cc-csc', 'numeric']])
    cvc = t.ax(pg.locator('#pm-cvc'))
    t.eq('the hint of the security code is its description', (cvc['name'], cvc['description']), ('Security code', 'The three digits on the back of the card.'))
    t.check('the card icon is hidden from screen readers', pg.get_attribute('.tray-input-group__addon svg', 'aria-hidden') == 'true')


def test_rows(t):
    pg = t.open()
    rows = pg.evaluate('''() => [...document.querySelectorAll('.tray-choice')].map(l => { const r = l.getBoundingClientRect(), i = l.querySelector('input').getBoundingClientRect(); return [Math.round(r.width - i.width), Math.round(r.height - i.height)]; })''')
    t.check('the input lies over the whole row, so the row is its label and its target', all(abs(w) <= 1 and abs(h) <= 1 for w, h in rows), rows)
    w, h = t.hit(pg.locator('input[name="pm-card"]').nth(1))
    t.check('a press anywhere on the row reaches the radio', w >= 80 and h >= 44, (w, h))
    pg.locator('.tray-choice').nth(1).click(position={'x': 300, 'y': 20})
    t.check('a click on the words of the row chooses it', pg.is_checked('input[name="pm-card"] >> nth=1'))


def test_keys(t):
    pg = t.open()
    radios = pg.locator('input[name="pm-card"]')
    pg.keyboard.press('Tab')
    t.check('Tab reaches the chosen card', radios.nth(0).evaluate('e => e === document.activeElement'), t.focused(pg))
    ring = pg.locator('.tray-choice').nth(0).evaluate('l => { const s = getComputedStyle(l); return [s.outlineStyle, s.outlineWidth, s.outlineOffset]; }')
    t.eq('the focus ring goes round the whole row: 3px, 3px out', ring, ['solid', '3px', '3px'])
    pg.keyboard.press('ArrowDown')
    t.check('ArrowDown moves the choice to the next card', radios.nth(1).evaluate('e => e === document.activeElement && e.checked'))
    pg.keyboard.press('ArrowDown')
    t.check('the arrow keys pass over the disabled card', radios.nth(0).evaluate('e => e === document.activeElement && e.checked') and not radios.nth(2).is_checked())
    pg.keyboard.press('ArrowUp')
    t.check('ArrowUp goes back, past the disabled card again', radios.nth(1).evaluate('e => e === document.activeElement && e.checked'))
    pg.keyboard.press('Tab')
    t.eq('Tab leaves the group for the next control', t.focused(pg)['text'], 'Add a card')


CARET = '(e) => [e.value, e.selectionStart]'


def mask_checks(t, pg, scope, label=''):
    """The mask, typed as a person types: the same driver for the HTML and the React preview."""
    card = pg.locator(f'{scope} [data-mask="card"]').first
    exp = pg.locator(f'{scope} [data-mask="expiry"]').first
    card.fill('')
    card.press_sequentially('4242424242424242')
    t.eq(f'{label}the card number is grouped in fours as it is typed', card.input_value(), '4242 4242 4242 4242')
    card.press_sequentially('9999999')
    t.eq(f'{label}a card number stops at 19 digits', card.input_value(), '4242 4242 4242 4242 999')
    card.fill('424242424242')
    t.eq(f'{label}a pasted number is grouped too', card.input_value(), '4242 4242 4242')
    card.evaluate('e => { e.focus(); e.setSelectionRange(7, 7); }')  # 4242 42|42 4242
    pg.keyboard.type('9')
    t.eq(f'{label}a digit typed in the middle keeps the caret after it', card.evaluate(CARET), ['4242 4294 2424 2', 8])
    card.evaluate('e => e.setSelectionRange(5, 5)')  # 4242 |4294 2424 2: after the fourth digit, before the space's next
    pg.keyboard.press('Backspace')  # takes the space: no digit goes, the grouping comes back, the caret stays after the fourth digit
    v, at = card.evaluate(CARET)
    t.check(f'{label}Backspace over a space keeps four digits before the caret', v.replace(' ', '') == '4242429424242' and v[:at].replace(' ', '') == '4242', [v, at])
    card.evaluate('e => e.setSelectionRange(6, 6)')
    pg.keyboard.press('Backspace')
    v, at = card.evaluate(CARET)
    t.check(f'{label}Backspace on a digit removes it and keeps the caret after the digit before it', v == '4242 2942 4242' and v[:at].replace(' ', '') == '4242', [v, at])
    exp.fill('')
    steps = []
    for k in '0827':
        exp.press_sequentially(k)
        steps.append(exp.input_value())
    t.eq(f'{label}the expiry date is written MM/YY as it is typed', steps, ['0', '08', '08/2', '08/27'])
    exp.press_sequentially('9')
    t.eq(f'{label}the expiry date takes four digits at most', exp.input_value(), '08/27')
    exp.fill('08/2a7')
    t.eq(f'{label}what is not a digit is dropped', exp.input_value(), '08/27')


def test_mask(t):
    pg = t.open()
    mask_checks(t, pg, 'form')
    cvc = pg.locator('#pm-cvc')
    cvc.fill('12a')
    t.eq('the security code has no mask: it formats nothing', cvc.input_value(), '12a')


def test_parity_mask(t):
    pg = t.open_react()
    mask_checks(t, pg, '[data-cell="SavedAndNew"]', 'React: ')


def test_parity_keys(t):
    pg = t.open_react()
    cell = t.cell(pg, 'SavedAndNew')
    radios = cell.locator('input[type="radio"]')
    radios.nth(0).focus()
    pg.keyboard.press('ArrowDown')
    pg.keyboard.press('ArrowDown')
    t.check('React: the arrow keys move the choice and pass over the disabled card', radios.nth(0).evaluate('e => e === document.activeElement && e.checked'))


PARITY = [('fieldset', 'SavedAndNew', 'fieldset'), ('form.tray-card', 'SavedAndNew', 'form')]
