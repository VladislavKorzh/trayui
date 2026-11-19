"""Checkbox: README.md, Accessibility. The browser's own checkbox inside a <label>: the label's text is its name, Space turns
it on and off, it is announced checked, not checked or mixed; the input lies unseen over the whole row (at least 44px tall)
and takes the focus and every press; the drawn tick is aria-hidden; an error tied with aria-describedby is read with it;
focus draws the 3px ring round the box; under reduced motion the tick appears at once. Guide (forced colours): a checked
box is drawn in SelectedItem."""

BOX = '.tray-check input'


def test_tree(t):
    pg = t.open()
    t.match_tree('the checkboxes, their names and states', pg.locator('.tray-demo'), '''
- checkbox "Gift box"
- checkbox "Chilled delivery" [checked]
- checkbox "All extras" [checked=mixed]
- checkbox "Farm sticker, always included" [checked] [disabled]
- checkbox /^Remind me before the season ends/ [checked]
- checkbox /^I agree to the terms of the order/ [invalid]
''')
    bad = t.ax(pg.locator(BOX).nth(5))
    t.eq('the error is read with the invalid checkbox, as its description', (bad['description'], bad.get('invalid')), ('Agree to the terms to place the order.', 'true'))
    t.check('the drawn box is hidden from screen readers', pg.locator('.tray-check__box svg').evaluate_all('s => s.every(x => x.getAttribute("aria-hidden") === "true")'))


def test_keys(t):
    pg = t.open()
    pg.keyboard.press('Tab')
    t.eq('Tab reaches the first checkbox', t.ax(pg.locator(':focus'))['name'], 'Gift box')
    t.eq('focus draws a 3px ring round the box', t.style(pg.locator('.tray-check__box').first, 'outline-style', 'outline-width'), {'outline-style': 'solid', 'outline-width': '3px'})
    pg.keyboard.press('Space')
    t.check('Space turns it on', pg.locator(BOX).first.is_checked())
    pg.keyboard.press('Space')
    t.check('Space turns it off again', not pg.locator(BOX).first.is_checked())
    names = []
    for _ in range(3):
        pg.keyboard.press('Tab')
        names.append(t.ax(pg.locator(':focus'))['name'][:20])
    t.eq('Tab passes the disabled checkbox by', names, ['Chilled delivery', 'All extras', 'Remind me before the'])


def test_row_target(t):
    pg = t.open()
    row = pg.locator('.tray-check').first
    box = row.bounding_box()
    corners = row.evaluate('''r => { const b = r.getBoundingClientRect(), i = r.querySelector('input');
        return [[b.left + 8, b.top + 8], [b.right - 8, b.top + 8], [b.left + 8, b.bottom - 8], [b.right - 8, b.bottom - 8], [b.left + b.width / 2, b.top + b.height / 2]]
          .every(([x, y]) => { const e = document.elementFromPoint(x, y); return e === i || [...i.labels].some(l => l.contains(e)); }); }''')
    t.check('every press on the row lands on the input or its label, to the corners', corners)
    t.check('the row is at least 44px tall', box['height'] >= 44, box['height'])
    # a press on the words of the row turns it, since the input lies over them
    words = row.locator('span').last.bounding_box()
    pg.mouse.click(words['x'] + words['width'] / 2, words['y'] + words['height'] / 2)
    t.check('a press on the words turns it on', pg.locator(BOX).first.is_checked())


def test_marks(t):
    pg = t.open()
    dash = pg.locator('.tray-check').nth(2).locator('.tray-check__dash')
    tick = pg.locator('.tray-check').nth(2).locator('.tray-check__tick')
    t.eq('an indeterminate box shows the dash and not the tick', (t.style(dash, 'opacity'), t.style(tick, 'opacity')), ('1', '0'))
    t.eq('a checked box shows the tick', t.style(pg.locator('.tray-check').nth(1).locator('.tray-check__tick'), 'opacity'), '1')


def test_data_indeterminate(t):
    # markup alone can write a mixed box: data-indeterminate on the input, which the behaviours turn into the property
    pg = t.open()
    pg.evaluate('''() => { const row = document.querySelector('.tray-check').cloneNode(true), box = row.querySelector('input');
        box.id = 'k-mixed'; box.checked = false; box.setAttribute('data-indeterminate', ''); row.querySelector('span:last-child').textContent = 'Every jar';
        document.querySelector('.tray-demo').append(row); TrayUI.init(row); }''')
    box = pg.locator('#k-mixed')
    t.check('data-indeterminate makes the box mixed', box.evaluate('b => b.indeterminate'))
    t.eq('and it is announced mixed', t.ax(box)['checked'], 'mixed')
    box.click()
    t.eq('a press turns it on, as on any mixed box', box.evaluate('b => [b.checked, b.indeterminate]'), [True, False])
    t.check('and the attribute goes, so the markup no longer says mixed', box.get_attribute('data-indeterminate') is None)


def test_motion(t):
    pg = t.open(motion='reduce')
    tick = pg.locator('.tray-check').nth(1).locator('.tray-check__tick')
    calm = t.style(tick, 'transition-duration', 'stroke-dashoffset')
    t.check('with reduced motion the tick appears at once', calm['transition-duration'] in ('0s', '') and calm['stroke-dashoffset'] in ('0px', '0'), calm)
    pg = t.open(motion='no-preference')
    tick = pg.locator('.tray-check').nth(1).locator('.tray-check__tick')
    t.check('otherwise the tick draws itself', 'stroke-dashoffset' in t.style(tick, 'transition-property'), t.style(tick, 'transition-property'))


def test_forced_colours(t):
    pg = t.open(forced=True)
    sel = t.system_colors(pg)['SelectedItem']
    t.eq('with forced colours a checked box takes SelectedItem', t.style(pg.locator('.tray-check').nth(1).locator('.tray-check__box'), 'background-color'), sel)
    t.eq('and so does a mixed one', t.style(pg.locator('.tray-check').nth(2).locator('.tray-check__box'), 'background-color'), sel)


PARITY = [('.tray-stack:nth-child(1)', 'States', '.tray-stack:nth-child(1)'),
          ('.tray-stack:nth-child(2)', 'States', '.tray-stack:nth-child(2)')]


def drive(t, pg, root, label):
    first = root.locator('input[type="checkbox"]').first
    first.focus()
    before = first.is_checked()
    pg.keyboard.press('Space')
    t.check(f'{label}: Space turns the checkbox', first.is_checked() != before)
    bad = t.ax(root.locator('input[aria-invalid="true"]').first)
    return bad['description']


def test_parity_keys(t):
    h = t.open()
    r = t.open_react()
    a = drive(t, h, h.locator('.tray-demo'), 'HTML')
    b = drive(t, r, t.cell(r, 'States'), 'React')
    t.eq('the error is the description of the invalid checkbox in both', b, a)


# The React preview rendered in static mode (trayui-react/static) works with bundle.js as it does in React: a mixed box
# carries data-indeterminate there, and bundle.js sets the property it stands for.
STATIC = True
STATIC_SKIP = {'SelectAll': "\"All extras\" follows the boxes under it through the preview's own React state, which a static page's own script keeps"}
