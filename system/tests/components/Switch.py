"""Switch: README.md, Accessibility. A real checkbox with role="switch", announced on or off and named by the words of its
<label>; Space turns it; the input covers the whole label, so the row is the target, at least 44px tall; focus draws the 3px
ink ring round the track; on is a solid ink track with the knob at the far end; with forced colours the track takes the
system's colours. Guide, Motion: under reduced motion the knob is at its place at once (92-motion.css)."""

SW = 'input[role="switch"]'


def test_tree(t):
    pg = t.open()
    t.match_tree('switches, named by their labels, on, off and disabled', pg.locator('.tray-demo'), '''
- switch "Email me the receipt"
- switch "Order updates by text" [checked]
- switch "Courier tracking, not in your area yet" [disabled]
- switch "Gift box A card box with a note, $12" [checked]
- switch "Leave at the door The courier sends a photo"
''')


def test_keys(t):
    pg = t.open()
    pg.keyboard.press('Tab')
    t.eq('Tab reaches the first switch', t.ax(pg.locator(':focus'))['name'], 'Email me the receipt')
    track = pg.locator('.tray-switch__track').first
    t.eq('focus draws a 3px ring round the track', t.style(track, 'outline-style', 'outline-width'), {'outline-style': 'solid', 'outline-width': '3px'})
    pg.keyboard.press('Space')
    t.eq('Space turns it on', t.ax(pg.locator(SW).first).get('checked'), 'true')
    t.settle(pg)
    on = t.style(track, 'background-color')
    ink = pg.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--ink").trim()')
    t.check('on is a solid ink track', on == pg.evaluate('(c) => { const p = document.createElement("i"); p.style.color = c; document.body.append(p); const v = getComputedStyle(p).color; p.remove(); return v; }', ink), (on, ink))
    t.eq('with the knob at the far end', t.style(track, 'transform', pseudo='::before'), 'matrix(1, 0, 0, 1, 24, 0)')
    pg.keyboard.press('Tab'); pg.keyboard.press('Tab')
    t.check('Tab passes the disabled switch by', 'Gift box' in t.ax(pg.locator(':focus'))['name'], t.ax(pg.locator(':focus'))['name'])


def test_row_target(t):
    pg = t.open()
    for i in (0, 3):
        row = pg.locator('.tray-switch').nth(i)
        h = row.bounding_box()['height']
        corners = row.evaluate('''r => { const b = r.getBoundingClientRect(), i = r.querySelector('input');
            return [[b.left + 8, b.top + 8], [b.right - 8, b.bottom - 8], [b.left + b.width / 2, b.top + b.height / 2]]
            .every(([x, y]) => { const e = document.elementFromPoint(x, y); return e === i || [...i.labels].some(l => l.contains(e)); }); }''')
        t.check(f'the input covers the whole row {i + 1}, which is at least 44px tall', corners and h >= 44, (corners, h))


def test_motion(t):
    pg = t.open(motion='reduce')
    props = t.style(pg.locator('.tray-switch__track').first, 'transition-property', pseudo='::before')
    t.check('with reduced motion the knob moves at once (its transform is not eased)', 'transform' not in props and 'all' not in props, props)
    pg = t.open(motion='no-preference')
    props = t.style(pg.locator('.tray-switch__track').first, 'transition-property', pseudo='::before')
    t.check('otherwise the knob slides', 'transform' in props, props)


def test_forced_colours(t):
    pg = t.open(forced=True)
    c = t.system_colors(pg)
    on, off = pg.locator('.tray-switch__track').nth(1), pg.locator('.tray-switch__track').nth(0)
    t.eq('with forced colours an on track takes SelectedItem, its knob SelectedItemText', (t.style(on, 'background-color'), t.style(on, 'background-color', pseudo='::before')), (c['SelectedItem'], c['SelectedItemText']))
    t.eq('an off track is Canvas with a CanvasText knob', (t.style(off, 'background-color'), t.style(off, 'background-color', pseudo='::before')), (c['Canvas'], c['CanvasText']))


PARITY = [('.tray-stack:nth-child(1)', 'Inline', '.tray-stack'), ('.tray-stack:nth-child(2)', 'Rows', '.tray-stack')]


def test_parity_keys(t):
    for label, pg, root in (('HTML', None, None), ('React', None, None)):
        pg = t.open() if label == 'HTML' else t.open_react()
        root = pg.locator('.tray-demo') if label == 'HTML' else t.cell(pg, 'Inline')
        sw = root.locator(SW).first
        sw.focus(); pg.keyboard.press('Space')
        t.eq(f'{label}: Space turns the switch on', t.ax(sw).get('checked'), 'true')
