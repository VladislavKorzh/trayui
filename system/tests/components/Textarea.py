"""Textarea: README.md, Markup and Accessibility. The browser's own <textarea>, named by the Field's <label for>; the hint,
the error and the count tied with aria-describedby, so the count is read when the field takes focus; the count is not a
live region; data-tray="count" shows "42 / 280" as the person types; it grows by its handle, vertically only; focus draws
the 2px ring on the edge and an invalid textarea keeps its danger edge inside it."""


def test_tree(t):
    pg = t.open()
    t.match_tree('textareas named by their labels', pg.locator('.tray-demo'), '''
- textbox "Note for the courier (optional)": Call from the gate, the bell is broken.
- textbox "What went wrong" [invalid]
''')
    t.eq('the hint and the count are read with it', t.ax(pg.locator('#t1'))['description'], 'Door codes, landmarks, a safe place. 39 / 140')
    t.eq('the error is read with the invalid one', t.ax(pg.locator('#t2'))['description'], 'Tell us what happened, in a sentence or two.')
    live = pg.locator('#t1c').evaluate('e => [e.getAttribute("aria-live"), e.getAttribute("role"), !!e.closest("[aria-live], [role=status], [role=log], [role=alert]")]')
    t.eq('the count is not a live region', live, [None, None, False])


def test_count(t):
    pg = t.open()
    pg.focus('#t1')
    pg.keyboard.press('End')
    pg.keyboard.type(' Ok')
    t.eq('the count follows the typing', pg.inner_text('#t1c'), '42 / 140')
    t.eq('and so does the description', t.ax(pg.locator('#t1'))['description'], 'Door codes, landmarks, a safe place. 42 / 140')
    t.eq('the limit holds', pg.evaluate('document.getElementById("t1").maxLength'), 140)


def test_look(t):
    pg = t.open()
    t.eq('it grows by its handle, vertically only', t.style(pg.locator('#t1'), 'resize'), 'vertical')
    pg.keyboard.press('Tab'); pg.keyboard.press('Tab')
    t.eq('Tab reaches the invalid textarea', t.focused(pg)['id'], 't2')
    s = t.style(pg.locator('#t2'), 'outline-width', 'outline-offset', 'box-shadow')
    t.check('with focus it draws the 2px ring on the edge and keeps the danger edge inside', s['outline-width'] == '2px' and s['outline-offset'] == '0px' and 'inset' in s['box-shadow'], s)


PARITY = [('.tray-demo', 'States', '.tray-fields')]


def test_parity_count(t):
    h, r = t.open(), t.open_react()
    cell = t.cell(r, 'States')
    t.eq('React: the hint and the count are the description, as in HTML', t.ax(cell.locator('textarea').first)['description'], t.ax(h.locator('#t1'))['description'])
    cell.locator('textarea').first.focus(); r.keyboard.press('End'); r.keyboard.type(' Ok')
    t.eq('React: the count follows the typing', cell.locator('.tray-field__count').first.inner_text(), '42 / 140')
