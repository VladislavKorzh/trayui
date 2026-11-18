"""Slider: README.md, Accessibility; guide, Targets. The browser's own range input named by its <label for>; the arrow keys
move it by one step, Home and End jump to min and max; with data-unit the behaviour sets aria-valuetext to the value and its
unit ("30 km"); the <output> shows the same words and is aria-hidden; the behaviour fills the track; a disabled slider is
out of the Tab order; with forced colours it is drawn in the system's colours; 28px tall, and a press anywhere on the track
moves the knob there."""


def test_tree(t):
    pg = t.open()
    t.match_tree('sliders named by their labels', pg.locator('.tray-demo'), '''
- slider "Jars per month": "4"
- slider "Delivery radius": "30"
- slider "Salt, on a tray": "65"
- slider "Locked" [disabled]: "20"
''')
    # The DevTools protocol's "valuetext" does not carry aria-valuetext (it gives the bare number even for a role="slider"
    # with aria-valuetext), so the attribute the README promises is read from the element.
    vt = lambda sel: pg.locator(sel).get_attribute('aria-valuetext')
    t.eq('with data-unit the value is read with its unit', (vt('#r2'), vt('#r3')), ('30 km', '65%'))
    t.eq('without one the bare number is read', vt('#r1'), None)
    t.eq('the outputs show the same words to the eye', pg.locator('output').evaluate_all('os => os.map(o => o.textContent)'), ['4', '30 km', '65%', '20'])
    t.check('and are hidden from screen readers, so the value is not read twice', pg.locator('output').evaluate_all('os => os.every(o => o.getAttribute("aria-hidden") === "true")'))


def test_keys(t):
    pg = t.open()
    pg.focus('#r2')
    pg.keyboard.press('ArrowRight')
    t.eq('an arrow moves it by one step, and the words follow', (pg.input_value('#r2'), pg.get_attribute('#r2', 'aria-valuetext'), pg.inner_text('output[for="r2"]')), ('40', '40 km', '40 km'))
    pg.keyboard.press('ArrowLeft'); pg.keyboard.press('ArrowLeft')
    t.eq('the other arrow moves it back', pg.input_value('#r2'), '20')
    pg.keyboard.press('End')
    t.eq('End jumps to max', pg.input_value('#r2'), '50')
    pg.keyboard.press('Home')
    t.eq('Home jumps to min', pg.input_value('#r2'), '0')
    fill = pg.locator('#r2').evaluate('e => e.style.getPropertyValue("--tray-v")')
    t.eq('the fill follows the value', fill, '0%')
    pg.focus('#r3')
    pg.keyboard.press('Tab')
    t.check('Tab passes the disabled slider by', pg.evaluate('document.activeElement.id') != 'r4', pg.evaluate('document.activeElement.id'))


def test_pointer(t):
    pg = t.open()
    s = pg.locator('#r1')
    b = s.bounding_box()
    t.eq('the slider is 28px tall', round(b['height']), 28)
    pg.mouse.click(b['x'] + b['width'] - 14, b['y'] + b['height'] / 2)
    t.eq('a press near the end of the track moves the knob there', pg.input_value('#r1'), '12')
    pg.mouse.click(b['x'] + 14, b['y'] + b['height'] / 2)
    t.eq('a press near its start moves it back', pg.input_value('#r1'), '1')


def test_forced_colours(t):
    pg = t.open(forced=True)
    t.eq('with forced colours the slider draws itself in system colours', t.style(pg.locator('#r1'), 'forced-color-adjust'), 'none')


PARITY = [('.tray-demo', 'Fields', '.tray-bento')]


def test_parity_keys(t):
    for label in ('HTML', 'React'):
        pg = t.open() if label == 'HTML' else t.open_react()
        root = pg.locator('.tray-demo') if label == 'HTML' else t.cell(pg, 'Fields')
        s = root.locator('input[type="range"]').nth(1)
        s.focus(); pg.keyboard.press('ArrowRight')
        out = root.locator('output').nth(1)
        t.eq(f'{label}: the arrow moves the slider by a step, the unit read and shown', (s.input_value(), s.get_attribute('aria-valuetext'), out.inner_text(), out.get_attribute('aria-hidden')), ('40', '40 km', '40 km', 'true'))
