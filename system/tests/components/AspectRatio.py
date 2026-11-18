"""Aspect Ratio: README.md. The box keeps its proportion while its width changes (16 to 9 by default, the photo, square and
portrait presets, any ratio through --tray-ratio); its one child fills it, cropped and never stretched; corners are 28px;
the box adds nothing for a screen reader, only its child is heard."""

RATIOS = 'sel => [...document.querySelectorAll(sel)].map(e => { const r = e.getBoundingClientRect(); return Math.round(r.width / r.height * 1000) / 1000; })'


def test_tree(t):
    pg = t.open()
    t.eq('the boxes add no role: only what is inside them is read', pg.evaluate('[...document.querySelectorAll(".tray-ratio")].map(e => e.getAttribute("role"))'), [None] * 4)
    t.match_tree('a screen reader hears the labels and nothing of the boxes', pg.locator('.tray-demo'), '- text: 16 / 9 4 / 3 1 / 1 3 / 4')


def test_ratio(t):
    want = [round(16 / 9, 3), round(4 / 3, 3), 1.0, .75]
    for w in (390, 920, 1440):
        pg = t.open(width=w)
        got = pg.evaluate(RATIOS, '.tray-ratio')
        t.check(f'at {w}px every box keeps its ratio', all(abs(g - x) < .02 for g, x in zip(got, want)), f'{got} want {want}')
        pg.close()
    pg = t.open()
    pg.evaluate('''() => { const b = document.querySelector(".tray-ratio"); b.style.setProperty("--tray-ratio", "21 / 9");
        b.innerHTML = '<img alt="" src="../../assets/Media/beds.webp" width="640" height="415">'; }''')
    pg.wait_for_function('document.querySelector(".tray-ratio img").complete')
    t.check('--tray-ratio sets any other ratio', abs(pg.evaluate(RATIOS, '.tray-ratio')[0] - 21 / 9) < .02, pg.evaluate(RATIOS, '.tray-ratio'))
    img = pg.evaluate('(() => { const i = document.querySelector(".tray-ratio img"), b = i.parentElement.getBoundingClientRect(), r = i.getBoundingClientRect(); return [Math.round(r.width - b.width), Math.round(r.height - b.height), getComputedStyle(i).objectFit]; })()')
    t.eq('its child fills it and is cropped, not stretched', img, [0, 0, 'cover'])
    t.eq('corners are 28px', t.style(pg.locator('.tray-ratio').first, 'border-top-left-radius'), '28px')


PARITY = [('.tray-demo', 'Presets', '.tray-row')]


def test_parity_ratio(t):
    r = t.open_react(width=920)
    got = r.evaluate(RATIOS, '[data-cell="Presets"] .tray-ratio')
    t.check('React: the presets keep the same ratios', all(abs(g - x) < .02 for g, x in zip(got, [16 / 9, 4 / 3, 1, .75])), got)
    t.check('React: a ratio given as a number is kept', abs(r.evaluate(RATIOS, '[data-cell="InACard"] .tray-ratio')[0] - 21 / 9) < .02)
