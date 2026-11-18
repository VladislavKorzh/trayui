"""Skeleton: README.md. The shapes are aria-hidden and mean nothing to a screen reader; the tray-vh line in the aria-busy
wrapper is what it reads; the pulse stops under prefers-reduced-motion: reduce; with forced colours each shape is drawn as
an outline."""


def test_tree(t):
    pg = t.open()
    t.match_tree('a screen reader reads the hidden line, and none of the shapes', pg.locator('.tray-demo'), '- text: Loading orders')
    t.eq('the wrapper is busy', pg.get_attribute('.tray-demo', 'aria-busy'), 'true')
    t.check('every shape is inside aria-hidden', pg.evaluate('[...document.querySelectorAll(".tray-skeleton")].every(s => s.closest("[aria-hidden=true]"))'))
    t.check('the line is visually hidden', pg.evaluate('(() => { const r = document.querySelector(".tray-vh").getBoundingClientRect(); return r.width <= 1 && r.height <= 1; })()'))


def test_motion(t):
    pg = t.open(motion='no-preference')
    t.eq('the shapes pulse', t.style(pg.locator('.tray-skeleton').first, 'animation-name'), 'tray-pulse')
    pg.close()
    pg = t.open(motion='reduce')
    t.eq('the pulse stops under reduced motion', t.style(pg.locator('.tray-skeleton').first, 'animation-name'), 'none')


def test_forced(t):
    pg = t.open(forced=True)
    sc = t.system_colors(pg)
    s = t.style(pg.locator('.tray-skeleton').first, 'border-top-style', 'border-top-width', 'border-top-color')
    t.eq('with forced colours a shape is an outline', (s['border-top-style'], s['border-top-width'], s['border-top-color']), ('solid', '1px', sc['CanvasText']))


PARITY = [('.tray-demo', 'ListAndCard', '.tray-bento')]
