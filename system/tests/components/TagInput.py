"""Tag Input: README.md, Behaviour and Accessibility. The text field is named by the <label> and described by the hint or
error; Enter or a comma adds what was typed, so does leaving the field; Backspace in the empty field removes the last chip;
each chip's button is named "Remove" and the value, 44px to a finger, and after a press focus goes back to the field; a
pasted list is split on commas, semicolons and spaces and said in one message; repeats are ignored and said; at data-max
the typed text stays and the limit is said; a polite hidden live region says "gift added" / "gift removed"; with
data-pattern="email" a wrong value keeps a danger chip with a hidden ", not an email address", and the text field (not the
tray) takes aria-invalid, which goes once no wrong chip is left, while an aria-invalid set from elsewhere stays; the hidden
input holds the values joined by commas; tray:change with { values, valid }; the tray draws its focus ring and a danger edge
inside it."""

T1, T2, T3 = '#ti-1', '#ti-2', '#ti-3'


def tray(pg, field):
    return pg.locator(f'.tray-tags:has({field})')


def chips(pg, field):
    return tray(pg, field).locator('.tray-chip').evaluate_all('cs => cs.map(c => c.dataset.value)')


def frame(pg):
    """The live region is written a frame after it is emptied, so that the same words are read again."""
    pg.evaluate('() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))')


def said(pg, field):
    frame(pg)
    return tray(pg, field).locator('[aria-live]').inner_text()


def test_tree(t):
    pg = t.open()
    a = t.ax(pg.locator(T1))
    t.eq('the text field is named by its label and described by the hint', (a['name'], a['description']), ('Order tags', 'Press Enter or a comma after each one.'))
    t.match_tree('each chip has a remove button named after its value', tray(pg, T1), '''
- button "Remove gift"
- button "Remove chilled"
- textbox "Order tags"
''')
    bad = tray(pg, T2).locator('.tray-chip[data-invalid]')
    t.eq('a wrong chip says so to a screen reader', bad.locator('[data-invalid-text]').inner_text(), ', not an email address')
    t.eq('the text field of a tray with a wrong chip is invalid, and the tray is not', (t.ax(pg.locator(T2)).get('invalid'), tray(pg, T2).get_attribute('aria-invalid')), ('true', None))
    live = tray(pg, T1).locator('[aria-live]')
    t.eq('a polite live region, hidden from view, waits', (live.get_attribute('aria-live'), live.get_attribute('class')), ('polite', 'tray-vh'))
    t.eq('the hidden input holds the values', pg.locator('input[name="tags"]').input_value(), 'gift,chilled')


def test_keys(t):
    pg = t.open()
    pg.focus(T1)
    t.clear_events(pg)
    pg.keyboard.type('jam')
    pg.keyboard.press('Enter')
    t.eq('Enter turns what was typed into a chip', (chips(pg, T1), pg.input_value(T1)), (['gift', 'chilled', 'jam'], ''))
    t.eq('and says so', said(pg, T1), 'jam added')
    t.eq('tray:change says the values and that they are valid', t.events(pg, 'tray:change')[-1]['detail'], {'values': ['gift', 'chilled', 'jam'], 'valid': True})
    t.eq('the hidden input follows', pg.locator('input[name="tags"]').input_value(), 'gift,chilled,jam')
    pg.keyboard.type('salt,')
    t.eq('a comma does too', chips(pg, T1)[-1], 'salt')
    pg.keyboard.type('gift'); pg.keyboard.press('Enter')
    t.eq('a repeat is ignored and said', (chips(pg, T1).count('gift'), said(pg, T1)), (1, 'gift is already in the list'))
    pg.keyboard.press('Backspace')
    t.eq('Backspace in the empty field removes the last chip, and says so', (chips(pg, T1)[-1], said(pg, T1)), ('jam', 'salt removed'))
    pg.keyboard.type('honey')
    pg.keyboard.press('Tab')
    t.eq('leaving the field adds what was typed', chips(pg, T1)[-1], 'honey')


def test_remove_button(t):
    pg = t.open()
    x = tray(pg, T1).locator('.tray-chip__x').first
    w, h = t.hit(x)
    t.check('a chip\'s remove button is 28px to the eye and 44px to a finger', round(x.bounding_box()['height']) == 28 and h >= 44, (x.bounding_box()['height'], w, h))
    x.focus(); pg.keyboard.press('Enter')
    t.eq('pressed, it removes its chip and focus goes back to the field', (chips(pg, T1), t.focused(pg)['id'], said(pg, T1)), (['chilled'], 'ti-1', 'gift removed'))
    t.check('focus never falls to the page', not t.lost_focus(pg))


def paste(pg, sel, text):
    pg.locator(sel).evaluate('(c, text) => { const dt = new DataTransfer(); dt.setData("text", text); c.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true })); }', text)


def test_paste_and_limit(t):
    pg = t.open()
    paste(pg, T1, 'jam, honey;salt  pepper')
    t.eq('a pasted list is split on commas, semicolons and spaces', chips(pg, T1), ['gift', 'chilled', 'jam', 'honey', 'salt', 'pepper'])
    t.eq('and said in one message, every value', said(pg, T1), 'jam added. honey added. salt added. pepper added')
    pg.focus(T3)
    pg.keyboard.type('Odesa'); pg.keyboard.press('Enter')
    pg.keyboard.type('Dnipro'); pg.keyboard.press('Enter')
    pg.keyboard.type('Kharkiv'); pg.keyboard.press('Enter')
    t.eq('past data-max no more is taken, the text stays in the field', (chips(pg, T3), pg.input_value(T3)), (['Kyiv', 'Lviv', 'Odesa', 'Dnipro'], 'Kharkiv'))
    t.eq('and the limit is said', said(pg, T3), 'Kharkiv not added: the limit is 4')


def test_email(t):
    pg = t.open()
    pg.locator(T2).evaluate('i => i.removeAttribute("aria-invalid")')  # start from the behaviour's own mark
    tray(pg, T2).locator('.tray-chip[data-invalid] .tray-chip__x').click()
    t.eq('once no wrong chip is left the field is valid again', t.ax(pg.locator(T2)).get('invalid', 'false'), 'false')
    pg.focus(T2)
    t.clear_events(pg)
    pg.keyboard.type('dana@perly'); pg.keyboard.press('Enter')
    t.eq('a value that is not an email address becomes a wrong chip, said as such', (tray(pg, T2).locator('.tray-chip[data-invalid]').count(), said(pg, T2)), (1, 'dana@perly added, not an email address'))
    t.eq('the field takes aria-invalid', t.ax(pg.locator(T2)).get('invalid'), 'true')
    t.eq('tray:change says it is not valid', t.events(pg, 'tray:change')[-1]['detail']['valid'], False)
    s = t.style(tray(pg, T2), 'box-shadow', 'outline-width', 'outline-offset')
    t.check('the tray draws a danger edge inside its focus ring', 'inset' in s['box-shadow'] and s['outline-width'] == '2px' and s['outline-offset'] == '0px', s)
    # an aria-invalid put on the field from elsewhere (a server's error) stays when the wrong chips go
    pg2 = t.open()
    pg2.locator(T1).evaluate('i => i.setAttribute("aria-invalid", "true")')
    pg2.focus(T1); pg2.keyboard.type('x'); pg2.keyboard.press('Enter'); pg2.keyboard.press('Backspace')
    t.eq('an aria-invalid set from elsewhere is left alone', pg2.get_attribute(T1, 'aria-invalid'), 'true')


PARITY = [('.tray-field:nth-child(1)', 'Tags', '.tray-field:nth-child(1)'), ('.tray-field:nth-child(2)', 'Tags', '.tray-field:nth-child(2)'),
          ('.tray-card .tray-field', 'OnACard', '.tray-field')]


def drive(t, pg, field):
    field.focus()
    pg.keyboard.type('jam'); pg.keyboard.press('Enter')
    root = field.locator('xpath=ancestor::*[contains(@class, "tray-tags")][1]')
    a = root.locator('.tray-chip').evaluate_all('cs => cs.map(c => c.textContent.trim())')
    frame(pg)
    msg = root.locator('[aria-live]').inner_text()
    pg.keyboard.press('Backspace')
    root.locator('.tray-chip__x').first.click()
    return a, msg, root.locator('.tray-chip').count(), t.focused(pg)['tag'], t.ax(root.locator('.tray-chip__x').first)['name'] if root.locator('.tray-chip__x').count() else None


def test_parity_keys(t):
    h, r = t.open(), t.open_react()
    a = drive(t, h, h.locator(T1))
    b = drive(t, r, t.cell(r, 'Tags').locator('.tray-tags input:not([type="hidden"])').first)
    t.eq('React: Enter adds, Backspace removes, a chip\'s button removes and gives focus back, as in HTML', b, a)
