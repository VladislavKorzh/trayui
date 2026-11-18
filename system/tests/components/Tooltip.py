"""Tooltip: README.md. The bubble is a role="tooltip" tied to its control by aria-describedby, read as its description.
Words the control's name already holds are drawn for the eye alone, so the description holds just the keys (none: the
bubble is hidden from screen readers). It shows on hover and on keyboard focus and stays while the control has focus; the
pointer can rest on the bubble, which goes a moment after the pointer leaves both (WCAG 1.4.13); Escape hides it wherever
focus is, also when the pointer alone showed it, and focus stays put; in a dialog that Escape hides only the bubble.
data-tip changes follow; data-side="bottom" puts it under the control; data-keys adds key caps. Solid ink, 12px corners.
Under reduced motion it only fades, in 0.1s."""

ANCHORS = '[data-tray="tooltip"]'


def anchor(pg, i):
    a = pg.locator(ANCHORS).nth(i)
    return a, a.locator('button'), a.locator('.tray-tooltip')


def test_tree(t):
    pg = t.open()
    for i, (name, desc) in enumerate([('Copy the link', ''), ('Download the receipt', ''), ('Search', 'Ctrl K'), ('Dark theme', '')]):
        a, btn, tip = anchor(pg, i)
        x = t.ax(btn)
        t.eq(f'"{name}" keeps its name, and its description holds only the keys', (x['name'], x['description']), (name, desc))
        t.eq(f'"{name}": the bubble is a tooltip tied by aria-describedby', (tip.get_attribute('role'), btn.get_attribute('aria-describedby')), ('tooltip', tip.get_attribute('id')))
    _, _, tip = anchor(pg, 0)
    t.eq('the bubble that only repeats the name is hidden from screen readers', tip.get_attribute('aria-hidden'), 'true')
    t.eq('the words are drawn for the eye: CSS content with an empty alternative', t.style(tip.locator('.tray-tooltip__said'), 'content', pseudo='::before'), '"Copy the link" / ""')
    _, _, tip = anchor(pg, 2)
    t.check('the bubble with keys is read: a tooltip with key caps', tip.get_attribute('aria-hidden') is None and tip.locator('kbd.tray-kbd').all_inner_texts() == ['Ctrl', 'K'],
            tip.get_attribute('aria-hidden'))
    t.match_tree('the open bubble with keys is in the tree as a tooltip', pg.locator(ANCHORS).nth(2), '- tooltip "Ctrl K"')
    # words of its own (not in the name) are its description
    a, btn, tip = anchor(pg, 1)
    a.evaluate('a => a.setAttribute("data-tip", "Saves a PDF of order PL-20418")')
    pg.wait_for_timeout(30)
    x = t.ax(btn)
    t.eq('words the name does not hold are read as the description', x['description'], 'Saves a PDF of order PL-20418')
    t.check('and that bubble is not hidden from screen readers', tip.get_attribute('aria-hidden') is None)


def test_follow(t):
    pg = t.open()
    a, btn, tip = anchor(pg, 0)
    a.evaluate('a => a.setAttribute("data-tip", "Copied")')
    pg.wait_for_timeout(30)
    t.eq('the bubble follows data-tip', tip.inner_text(), 'Copied')
    t.eq('and the new words are the description', t.ax(btn)['description'], 'Copied')
    a.evaluate('a => a.setAttribute("data-keys", "Ctrl C")')
    pg.wait_for_timeout(30)
    t.eq('and data-keys', tip.locator('kbd').all_inner_texts(), ['Ctrl', 'C'])


def test_hover(t):
    pg = t.open()
    a, btn, tip = anchor(pg, 1)
    t.check('hidden at first', not tip.is_visible())
    btn.hover()
    t.check('it shows on hover', tip.is_visible())
    box = tip.bounding_box()
    pg.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2, steps=5)
    pg.wait_for_timeout(250)
    t.check('the pointer can move onto the bubble and rest there', tip.is_visible())
    pg.mouse.move(5, 5)
    t.check('it stays a moment after the pointer leaves both', tip.is_visible())
    pg.wait_for_timeout(300)
    t.settle(pg)
    t.check('then it goes', not tip.is_visible())
    btn.hover()
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('Escape hides a bubble the pointer alone showed', not tip.is_visible())
    t.check('and focus stayed where it was', t.lost_focus(pg))


def test_focus(t):
    pg = t.open()
    a, btn, tip = anchor(pg, 1)
    pg.locator(ANCHORS).nth(0).locator('button').focus()
    pg.keyboard.press('Tab')
    t.check('it shows on keyboard focus', btn.evaluate('b => b === document.activeElement') and tip.is_visible(), t.focused(pg))
    t.scan(pg, 'Light, a third bubble shown')
    pg.mouse.move(btn.bounding_box()['x'] + 5, btn.bounding_box()['y'] + 5)
    pg.mouse.move(5, 5)
    pg.wait_for_timeout(300)
    t.check('it stays while the control has focus, though the pointer passed and left', tip.is_visible())
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('Escape hides it', not tip.is_visible())
    t.check('while focus stays on the control', btn.evaluate('b => b === document.activeElement'), t.focused(pg))
    pg.keyboard.press('Tab')
    t.settle(pg)
    t.check('it goes when focus leaves', not tip.is_visible())
    _, _, held = anchor(pg, 0)
    pg.keyboard.press('Escape')
    t.check('a bubble held open by data-open stays', held.is_visible())


def test_dialog(t):
    pg = t.open()
    pg.evaluate('''() => { const d = document.createElement('dialog'); d.className = 'tray-dialog'; d.id = 'dt'; d.dataset.tray = 'dialog';
        d.setAttribute('aria-label', 'Note');
        d.innerHTML = '<span class="tray-anchor" data-tray="tooltip" data-tip="Copy the note"><button class="tray-btn tray-btn--icon" type="button" aria-label="Copy the note">' + TrayUI.icon('copy') + '</button></span>';
        document.body.append(d); TrayUI.init(d); d.showModal(); d.querySelector('button').focus(); }''')
    tip = pg.locator('#dt .tray-tooltip')
    t.check('in a dialog the bubble shows on focus', tip.is_visible())
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('the first Escape hides only the bubble', not tip.is_visible() and pg.evaluate('document.getElementById("dt").open'))
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('the next one closes the dialog', not pg.evaluate('document.getElementById("dt").open'))


def test_look(t):
    pg = t.open(width=1280)
    _, btn, tip = anchor(pg, 0)
    tb, bb = tip.bounding_box(), btn.bounding_box()
    t.check('above its control by default', tb['y'] + tb['height'] <= bb['y'], (tb, bb))
    _, btn, tip = anchor(pg, 2)
    tb, bb = tip.bounding_box(), btn.bounding_box()
    t.check('data-side="bottom" puts it under its control', tb['y'] >= bb['y'] + bb['height'], (tb, bb))
    ink = pg.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--ink").trim()')
    probe = pg.evaluate('(c) => { const i = document.createElement("i"); i.style.color = c; document.body.append(i); const v = getComputedStyle(i).color; i.remove(); return v; }', ink)
    t.eq('solid ink with 12px corners', t.style(tip, 'background-color', 'border-top-left-radius'), {'background-color': probe, 'border-top-left-radius': '12px'})


def test_motion(t):
    pg = t.open()
    _, btn, tip = anchor(pg, 1)
    btn.hover()
    anims = [a for a in t.running_animations(pg) if 'tray-tooltip' in str(a['target'])]
    names = {a['name'] for a in anims}
    t.check('reduced motion: it only fades', 'opacity' in names and 'translate' not in names, anims)
    t.check('in a tenth of a second', max([a['duration'] for a in anims] or [0]) <= 100, anims)
    pg = t.open(motion='no-preference')
    _, btn, tip = anchor(pg, 1)
    btn.hover()
    names = {a['name'] for a in t.running_animations(pg) if 'tray-tooltip' in str(a['target'])}
    t.check('without the setting it rises a little', {'opacity', 'translate'} <= names, names)


def test_forced(t):
    pg = t.open(forced=True)
    _, _, tip = anchor(pg, 0)
    sysc = t.system_colors(pg)
    t.eq('with forced colours the bubble gets a 1px edge', t.style(tip, 'border-top-width', 'border-top-color'), {'border-top-width': '1px', 'border-top-color': sysc['CanvasText']})


PARITY = [('.tray-demo', 'Default', '.tray-row')]


def test_parity_tooltip(t):
    r = t.open_react()
    cell = t.cell(r, 'Default')
    btns = cell.locator('[data-tray="tooltip"] button, .tray-anchor button')
    for name, desc in (('Copy the link', ''), ('Download the receipt', ''), ('Search', 'Ctrl K')):
        x = t.ax(cell.get_by_role('button', name=name, exact=True))
        t.eq(f'react: "{name}" has the same name and description', (x['name'], x['description']), (name, desc))
    btn = cell.get_by_role('button', name='Download the receipt')
    tip = btn.locator('xpath=..').locator('.tray-tooltip')
    btn.hover()
    t.check('react: it shows on hover', tip.is_visible())
    r.keyboard.press('Escape')
    t.settle(r)
    t.check('react: Escape hides it', not tip.is_visible())
