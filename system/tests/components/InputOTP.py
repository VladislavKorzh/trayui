"""Input OTP: README.md, Markup and Accessibility. The cells are one role="group" named by its label; the behaviour names each
cell "Character 1 of 6", keeps one character in each and sets inputmode="numeric"; a numeric cell keeps digits only (a key it
does not take changes nothing; "123-456" loses its hyphen); typing moves to the next cell, Backspace in an empty cell clears
the one before and moves there, ArrowLeft and ArrowRight step to that side (left to right in a right-to-left page as well);
a pasted code, or a whole code a phone fills into one cell, is spread from that cell on and focus goes to the cell after it;
a cell selects its character on focus; tray:complete with detail.value when every cell is filled; the group's aria-invalid
and aria-describedby are copied to every cell, and kept in step."""

OTP = '.tray-otp'


def cells(pg, n=0):
    return pg.locator(OTP).nth(n).locator('input')


def values(pg, n=0):
    return ''.join(cells(pg, n).evaluate_all('cs => cs.map(c => c.value || "·")'))




def test_tree(t):
    pg = t.open()
    t.match_tree('a group named by its label, its cells named in order', pg.locator(OTP).first, '''
- group "Code from the message":
  - textbox "Character 1 of 6": "4"
  - textbox "Character 2 of 6": "0"
  - textbox "Character 3 of 6": "9"
  - textbox "Character 4 of 6"
  - textbox "Character 5 of 6"
  - textbox "Character 6 of 6"
''')
    t.eq('every cell is numeric', set(cells(pg).evaluate_all('cs => cs.map(c => c.inputMode)')), {'numeric'})
    t.eq('the first cell offers the code from the message', cells(pg).first.get_attribute('autocomplete'), 'one-time-code')
    bad = t.ax(cells(pg, 1).first)
    t.eq('the cells of a wrong code are read as invalid, with the error', (bad.get('invalid'), bad['description']), ('true', 'That code does not match. Try again.'))
    pg.locator(OTP).nth(1).evaluate('g => { g.removeAttribute("aria-invalid"); g.setAttribute("aria-describedby", "o1h"); }')
    pg.wait_for_timeout(30)
    now = t.ax(cells(pg, 1).first)
    t.eq('and follow the group when it changes', (now.get('invalid', 'false'), now['description']), ('false', 'Sent to the number ending in 27.'))


def test_typing(t):
    pg = t.open()
    cells(pg).nth(3).click()
    pg.keyboard.type('1')
    t.eq('a digit moves focus to the next cell', pg.evaluate('document.activeElement.getAttribute("aria-label")'), 'Character 5 of 6')
    pg.keyboard.type('a')
    t.eq('a key a numeric cell does not take changes nothing', (values(pg), pg.evaluate('document.activeElement.getAttribute("aria-label")')), ('4091··', 'Character 5 of 6'))
    t.clear_events(pg)
    pg.keyboard.type('27')
    t.eq('when every cell is filled it fires tray:complete with the code', [e['detail'] for e in t.events(pg, 'tray:complete')], [{'value': '409127'}])
    pg.keyboard.press('Backspace')
    t.eq('Backspace clears the cell', values(pg), '40912·')
    pg.keyboard.press('Backspace')
    t.eq('Backspace in an empty cell clears the one before and moves there', (values(pg), pg.evaluate('document.activeElement.getAttribute("aria-label")')), ('4091··', 'Character 5 of 6'))
    pg.keyboard.press('ArrowLeft')
    t.eq('ArrowLeft steps to the cell on the left', pg.evaluate('document.activeElement.getAttribute("aria-label")'), 'Character 4 of 6')
    t.eq('a cell selects its character as it takes focus', pg.evaluate('[document.activeElement.selectionStart, document.activeElement.selectionEnd]'), [0, 1])
    pg.keyboard.type('7')
    t.eq('so typing replaces it', values(pg)[:4], '4097')
    pg.keyboard.press('ArrowRight')
    t.eq('ArrowRight steps to the cell on the right', pg.evaluate('document.activeElement.getAttribute("aria-label")'), 'Character 6 of 6')


def paste(pg, cell, text):
    cell.evaluate('(c, text) => { const dt = new DataTransfer(); dt.setData("text", text); c.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true })); }', text)


def test_paste(t):
    pg = t.open()
    t.clear_events(pg)
    paste(pg, cells(pg).first, '123-456')
    t.eq('a pasted code loses its hyphen and is spread over the cells', values(pg), '123456')
    t.eq('focus goes to the last cell', pg.evaluate('document.activeElement.getAttribute("aria-label")'), 'Character 6 of 6')
    t.eq('tray:complete fires once with the code', [e['detail'] for e in t.events(pg, 'tray:complete')], [{'value': '123456'}])
    pg = t.open()
    paste(pg, cells(pg).nth(3), '78')
    t.eq('a code pasted into a later cell fills from that cell on', values(pg), '40978·')
    t.eq('focus goes to the cell after it', pg.evaluate('document.activeElement.getAttribute("aria-label")'), 'Character 6 of 6')
    # a phone fills the whole code into the first cell (autocomplete="one-time-code")
    pg = t.open()
    cells(pg).first.evaluate('c => { c.focus(); c.value = "555123"; c.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertReplacementText" })); }')
    t.eq('a whole code a phone puts in the first cell is spread over the cells', values(pg), '555123')


def test_rtl(t):
    pg = t.open(rtl=True)
    t.eq('in a right-to-left page the cells still run left to right', t.style(pg.locator(OTP).first, 'direction'), 'ltr')
    boxes = cells(pg).evaluate_all('cs => cs.map(c => c.getBoundingClientRect().left)')
    t.check('the first cell is on the left', boxes == sorted(boxes), boxes)
    cells(pg).nth(2).focus()
    pg.keyboard.press('ArrowLeft')
    t.eq('ArrowLeft still steps to the cell on the left', pg.evaluate('document.activeElement.getAttribute("aria-label")'), 'Character 2 of 6')


def test_focus(t):
    pg = t.open()
    pg.keyboard.press('Tab')
    c = cells(pg).first
    t.eq('a focused cell draws the ring on its edge', t.style(c, 'outline-width', 'outline-offset'), {'outline-width': '2px', 'outline-offset': '0px'})
    cells(pg, 1).first.focus()
    s = t.style(cells(pg, 1).first, 'outline-offset', 'box-shadow')
    t.check('a focused cell of a wrong code keeps its danger edge inside', s['outline-offset'] == '0px' and 'inset' in s['box-shadow'], s)


PARITY = [('.tray-field:nth-child(1)', 'States', '.tray-field:nth-child(1)'), ('.tray-field:nth-child(2)', 'States', '.tray-field:nth-child(2)')]


def drive(t, pg, otp):
    cs = otp.locator('input')
    cs.nth(3).click()
    pg.keyboard.type('12')
    a = pg.evaluate('document.activeElement.getAttribute("aria-label")')
    pg.keyboard.press('Backspace'); pg.keyboard.press('Backspace')
    b = pg.evaluate('document.activeElement.getAttribute("aria-label")')
    v = ''.join(cs.evaluate_all('cs => cs.map(c => c.value || "·")'))
    return a, b, v


def test_parity_keys(t):
    h, r = t.open(), t.open_react()
    a = drive(t, h, h.locator(OTP).first)
    b = drive(t, r, t.cell(r, 'States').locator(OTP).first)
    t.eq('React: typing and Backspace move through the cells as in HTML', b, a)
    bad = t.ax(t.cell(r, 'States').locator(OTP).nth(1).locator('input').first)
    t.eq('React: the cells of a wrong code are invalid with the error', (bad.get('invalid'), bad['description']), ('true', 'That code does not match. Try again.'))
