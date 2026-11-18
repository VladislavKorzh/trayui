"""Radio Group: README.md, Accessibility. The browser's own radios in a <fieldset> named by its <legend>, or a wrapper with
role="radiogroup" and an aria-label; Tab reaches the group at its checked radio, the arrow keys move the choice and pass
over a disabled one, Space checks the radio in focus; each radio is named by its label (on a choice card: the title, the
detail and the value at the end); the input covers its whole label; focus draws the 3px ink ring round the ring of a plain
radio or round the whole card; the chosen ring is filled, and with forced colours takes the system's colours."""

R = 'input[type="radio"]'


def test_tree(t):
    pg = t.open()
    t.match_tree('groups named by their legends or labels, each radio by its label', pg.locator('.tray-demo'), '''
- group "Payment":
  - radio "Card, on delivery" [checked]
  - radio "Card, online now"
  - radio "Cash, not for chilled orders" [disabled]
- group "Delivery":
  - radio "Courier Chilled box, the same day $9" [checked]
  - radio "Pickup Farm shop, from tomorrow Free"
- radiogroup "Gift wrapping":
  - radio "No wrapping The jar in its chilled sleeve" [checked]
  - radio "Gift box A card box with a note from you $12"
''')


def test_keys(t):
    pg = t.open()
    pg.keyboard.press('Tab')
    t.eq('Tab reaches the group at its checked radio', t.ax(pg.locator(':focus'))['name'], 'Card, on delivery')
    ring = pg.locator('.tray-radio__ring').first
    t.eq('focus draws the 3px ring round the ring', t.style(ring, 'outline-style', 'outline-width'), {'outline-style': 'solid', 'outline-width': '3px'})
    pg.keyboard.press('ArrowDown')
    t.eq('ArrowDown moves the choice to the next radio', (t.ax(pg.locator(':focus'))['name'], t.ax(pg.locator(':focus')).get('checked')), ('Card, online now', 'true'))
    pg.keyboard.press('ArrowDown')
    t.eq('and passes over the disabled one, round to the first', t.ax(pg.locator(':focus'))['name'], 'Card, on delivery')
    pg.keyboard.press('Tab')
    t.eq('Tab goes on to the next group, at its checked radio', t.ax(pg.locator(':focus'))['name'], 'Courier Chilled box, the same day $9')
    card = pg.locator('.tray-choice').first
    t.eq('on a choice card focus draws the 3px ring round the whole card', t.style(card, 'outline-style', 'outline-width', 'outline-offset'), {'outline-style': 'solid', 'outline-width': '3px', 'outline-offset': '3px'})
    pg.keyboard.press('ArrowRight')
    t.eq('the arrow checks the next card', t.ax(pg.locator(':focus')).get('checked'), 'true')
    # Space checks the radio in focus: reach an unchecked one with Shift+Tab? Radios in a group take focus only at the
    # checked one, so check it on a fresh page from the keyboard by moving focus there without choosing.
    pg2 = t.open()
    pg2.locator(R).nth(1).focus()
    pg2.keyboard.press('Space')
    t.check('Space checks the radio in focus', pg2.locator(R).nth(1).is_checked())


def test_targets(t):
    pg = t.open()
    for sel in ('.tray-radio', '.tray-choice'):
        row = pg.locator(sel).first
        ok = row.evaluate('''r => { const b = r.getBoundingClientRect(), i = r.querySelector('input');
            return [[b.left + 8, b.top + 8], [b.right - 8, b.bottom - 8], [b.left + b.width / 2, b.top + b.height / 2]]
            .every(([x, y]) => { const e = document.elementFromPoint(x, y); return e === i || [...i.labels].some(l => l.contains(e)); }); }''')
        t.check(f'every press on the label reaches the radio ({sel})', ok)
    t.check('a plain radio row is at least 44px tall', pg.locator('.tray-radio').first.bounding_box()['height'] >= 44)


def test_chosen(t):
    pg = t.open()
    ring = t.style(pg.locator('.tray-radio__ring').first, 'border-top-width')
    t.eq('the chosen ring is filled: a 7px ink border round the dot', ring, '7px')
    pg = t.open(forced=True)
    c = t.system_colors(pg)
    t.eq('with forced colours the chosen ring takes SelectedItem', t.style(pg.locator('.tray-radio__ring').first, 'border-top-color'), c['SelectedItem'])
    t.eq('on a choice card too', t.style(pg.locator('.tray-choice .tray-radio__ring').first, 'border-top-color'), c['SelectedItem'])


PARITY = [('fieldset:nth-of-type(1)', 'Plain', 'fieldset'), ('fieldset:nth-of-type(2)', 'Choices', 'fieldset'),
          ('[role="radiogroup"]', 'OnACard', '[role="radiogroup"]')]


def test_parity_keys(t):
    for label in ('HTML', 'React'):
        pg = t.open() if label == 'HTML' else t.open_react()
        root = pg.locator('fieldset').first if label == 'HTML' else t.cell(pg, 'Plain').locator('fieldset').first
        root.locator(R).first.focus()
        pg.keyboard.press('ArrowDown'); pg.keyboard.press('ArrowDown')
        t.eq(f'{label}: the arrows move the choice and pass over the disabled radio', t.ax(pg.locator(':focus'))['name'], 'Card, on delivery')
