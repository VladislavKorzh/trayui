"""Invite Form: README.md. The emails field is a real <input> named by its label, with the error tied by aria-describedby;
Enter or a comma turns what is typed into a chip, Backspace in the empty field removes the last one, leaving the field
keeps what was typed; each address added or removed is said through a polite live region; a chip's button is named
"Remove" and the address and focus returns to the field after it; a wrong address is a danger chip (data-pattern="email")
that says so to a screen reader, and the field is aria-invalid; the tag input fires tray:change with detail.valid; at
data-max what is typed stays; the button stays enabled; below 40rem the emails, the role and the button stack."""

FIELD = '#iv-emails'
LIVE = '.tray-tags [aria-live="polite"]'


def chips(pg):
    return pg.locator('.tray-tags .tray-chip').evaluate_all('cs => cs.map(c => c.getAttribute("data-value") + (c.hasAttribute("data-invalid") ? " (wrong)" : ""))')


def said(pg, words):
    pg.wait_for_function('(w) => document.querySelector(".tray-tags [aria-live=polite]").textContent.trim().startsWith(w)', arg=words, timeout=2000)
    return pg.locator(LIVE).inner_text().strip()


def test_tree(t):
    pg = t.open()
    field = t.ax(pg.locator(FIELD))
    t.eq('the emails field is a textbox named by its label, described by the error, and invalid',
         (field['role'], field['name'], field['description'], field.get('invalid')), ('textbox', 'Emails', '“marta@perly” is not a full email address.', 'true'))
    t.eq('the mark of a wrong address is on the field, not on the tray around it', pg.get_attribute('.tray-tags', 'aria-invalid'), None)
    t.eq('each chip button names the address it removes', pg.locator('.tray-chip__x').evaluate_all('bs => bs.map(b => b.getAttribute("aria-label"))'),
         ['Remove andriy@perly.example', 'Remove marta@perly'])
    t.check('a wrong address says so to a screen reader', 'marta@perly , not an email address' in t.tree(pg.locator('.tray-tags')), t.tree(pg.locator('.tray-tags')))
    t.eq('the live region is polite and hidden to the eye', (pg.locator(LIVE).count(), pg.locator(LIVE).evaluate('e => e.classList.contains("tray-vh")')), (1, True))
    t.check('the button stays enabled while an address is wrong', pg.is_enabled('button[type="submit"]'))


def test_keys(t):
    pg = t.open()
    f = pg.locator(FIELD)
    f.focus()
    pg.keyboard.type('dana@perly.example')
    pg.keyboard.press('Enter')
    t.eq('Enter turns what is typed into a chip and empties the field', (chips(pg)[-1], f.input_value()), ('dana@perly.example', ''))
    t.eq('the live region says it was added', said(pg, 'dana'), 'dana@perly.example added')
    t.eq('tray:change has the values and says one is wrong', t.events(pg, 'tray:change')[-1]['detail'],
         {'values': ['andriy@perly.example', 'marta@perly', 'dana@perly.example'], 'valid': False})
    pg.keyboard.type('oleh,')
    t.eq('a comma does it too, and an address that is not one is a wrong chip', chips(pg)[-1], 'oleh (wrong)')
    t.eq('which is said', said(pg, 'oleh'), 'oleh added, not an email address')
    pg.keyboard.press('Backspace')
    t.eq('Backspace in the empty field removes the last chip', chips(pg)[-1], 'dana@perly.example')
    t.eq('and says so', said(pg, 'oleh'), 'oleh removed')
    pg.keyboard.type('ira@perly.example')
    pg.locator('#iv-role').focus()
    t.eq('leaving the field keeps what was typed, as a chip', chips(pg)[-1], 'ira@perly.example')


def test_remove(t):
    pg = t.open()
    pg.locator('.tray-chip__x').nth(1).click()
    t.eq('the remove button takes its chip away', chips(pg), ['andriy@perly.example'])
    t.eq('focus returns to the field', t.focused(pg)['id'], 'iv-emails')
    t.eq('with no wrong address left, the field is no longer invalid', pg.get_attribute(FIELD, 'aria-invalid'), None)
    t.eq('and tray:change says it is valid', t.events(pg, 'tray:change')[-1]['detail'], {'values': ['andriy@perly.example'], 'valid': True})
    btn = pg.locator('.tray-chip__x').first
    btn.focus()
    pg.keyboard.press('Enter')
    t.eq('from the keyboard too, focus returns to the field, not to the page', (chips(pg), t.focused(pg)['id']), ([], 'iv-emails'))


def test_limit(t):
    pg = t.open()
    f = pg.locator(FIELD)
    f.focus()
    for a in ('a@perly.example', 'b@perly.example', 'c@perly.example'):
        pg.keyboard.type(a)
        pg.keyboard.press('Enter')
    pg.keyboard.type('d@perly.example')
    pg.keyboard.press('Enter')
    t.eq('at data-max (the free seats) what is typed stays in the field', (len(chips(pg)), f.input_value()), (5, 'd@perly.example'))
    t.eq('and the limit is said', said(pg, 'd@perly'), 'd@perly.example not added: the limit is 5')


def test_stacks(t):
    pg = t.open(width=390)
    boxes = [pg.locator(s).bounding_box() for s in ('.tray-invite > .tray-field >> nth=0', '.tray-invite > .tray-field >> nth=1', '.tray-invite > button')]
    t.check('below 40rem the emails, the role and the button stack', boxes[0]['y'] < boxes[1]['y'] < boxes[2]['y'] and abs(boxes[0]['x'] - boxes[1]['x']) < 1, boxes)
    pg.close()
    pg = t.open(width=1440)
    boxes = [pg.locator(s).bounding_box() for s in ('.tray-invite > .tray-field >> nth=0', '.tray-invite > .tray-field >> nth=1', '.tray-invite > button')]
    t.check('wider, they sit in one row', abs(boxes[0]['y'] - boxes[1]['y']) < 1 and boxes[0]['x'] < boxes[1]['x'] < boxes[2]['x'], boxes)


def test_parity_keys(t):
    """The React form takes, refuses and removes addresses as the HTML one does, and says the same."""
    out = []
    for react in (False, True):
        pg = t.open(react=react)
        root = t.cell(pg, 'WithAWrongAddress') if react else pg
        f = root.locator('.tray-tags input:not([type="hidden"])')
        f.focus()
        pg.keyboard.type('dana@perly.example')
        pg.keyboard.press('Enter')
        pg.keyboard.type('oleh,')
        pg.keyboard.press('Backspace')
        pg.wait_for_timeout(80)
        got = [root.locator('.tray-chip').evaluate_all('cs => cs.map(c => c.getAttribute("data-value") + (c.hasAttribute("data-invalid") ? " (wrong)" : ""))'),
               root.locator('.tray-tags [aria-live]').inner_text().strip(), t.ax(f).get('invalid')]
        root.locator('.tray-chip__x').nth(1).click()
        # the chip leaves with its exit (a tenth of a second); React marks the field once the change has reached its state
        t.settle(pg); pg.wait_for_timeout(150)
        got += [t.focused(pg)['tag'], t.ax(f).get('invalid')]
        out.append(got)
    t.eq('React: the same chips, the same words, the same focus and mark', out[1], out[0])


PARITY = [('form', 'WithAWrongAddress', 'form')]
