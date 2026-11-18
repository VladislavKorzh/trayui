"""Resizable: README.md. The handle is a focusable separator: role="separator", aria-orientation, aria-valuemin and
aria-valuemax from the limits, aria-valuenow following the size, named by its aria-label ("Resize the panes" without one);
ArrowLeft and ArrowRight (ArrowUp and ArrowDown in tray-split--v) move it two percent in the arrow's direction, mirrored
under dir="rtl"; Home and End jump to the limits; a pointer drags it; tray:change with detail.size each time the size
changes, nothing at load; focus draws the ring inside the handle and turns its pill ink; the handle is a 16px strip as long
as the panes (guides/3-accessibility.md, Targets)."""

VERTICAL = '''() => { const d = document.createElement('div'); d.innerHTML = `<div class="tray-split tray-split--v" data-tray="split" data-size="60" data-min="30" data-max="80" id="v" style="block-size: 20rem">
  <div class="tray-split__pane">Note</div><button class="tray-split__handle" type="button"></button><div class="tray-split__pane">Draft</div></div>`;
  document.querySelector('.tray-demo').appendChild(d.firstElementChild); TrayUI.init(document.getElementById('v')); }'''


def share(pg, root='.tray-split'):
    return pg.evaluate('s => { const r = document.querySelector(s), a = r.firstElementChild.getBoundingClientRect(), b = r.getBoundingClientRect(); return r.classList.contains("tray-split--v") ? a.height / b.height * 100 : a.width / b.width * 100; }', root)


def test_tree(t):
    pg = t.open()
    h = pg.locator('.tray-split__handle')
    a = t.ax(h)
    t.eq('the handle is a vertical separator named for what it resizes, with its limits and its size',
         (a['role'], a['name'], a.get('orientation'), a.get('valuemin'), a.get('valuemax'), a['value'], a.get('focusable')),
         ('separator', 'Resize the order list', 'vertical', 22, 60, 34, True))
    t.check('the first pane takes its data-size', abs(share(pg) - 34) < 2, share(pg))
    t.eq('the size set at load fires nothing', t.events(pg, 'tray:change'), [])
    pg.evaluate(VERTICAL)
    v = t.ax(pg.locator('#v .tray-split__handle'))
    t.eq('without an aria-label it is called "Resize the panes"; stacked panes have a horizontal separator', (v['name'], v.get('orientation'), v['value']), ('Resize the panes', 'horizontal', 60))


def test_keys(t):
    pg = t.open()
    h = pg.locator('.tray-split__handle')
    h.focus()
    now = lambda: h.get_attribute('aria-valuenow')
    pg.keyboard.press('ArrowRight')
    t.eq('ArrowRight widens the first pane by two percent', now(), '36')
    t.check('and the pane follows', abs(share(pg) - 36) < 2, share(pg))
    t.eq('it fires tray:change with detail.size', [e['detail'] for e in t.events(pg, 'tray:change')], [{'size': 36}])
    pg.keyboard.press('ArrowLeft'); pg.keyboard.press('ArrowLeft')
    t.eq('ArrowLeft narrows it', now(), '32')
    pg.keyboard.press('Home')
    t.eq('Home jumps to the lower limit', now(), '22')
    pg.keyboard.press('ArrowLeft')
    t.eq('and it goes no further', now(), '22')
    pg.keyboard.press('End')
    t.eq('End jumps to the upper limit', now(), '60')
    t.check('focus stays on the handle', t.is_focused(h))
    pg.evaluate(VERTICAL)
    v = pg.locator('#v .tray-split__handle')
    v.focus(); pg.keyboard.press('ArrowDown')
    t.eq('stacked, ArrowDown makes the first pane taller', v.get_attribute('aria-valuenow'), '62')
    pg.keyboard.press('ArrowUp'); pg.keyboard.press('ArrowUp')
    t.eq('and ArrowUp shorter', v.get_attribute('aria-valuenow'), '58')
    pg.keyboard.press('ArrowRight')
    t.eq('stacked, the sideways arrows do nothing', v.get_attribute('aria-valuenow'), '58')


def test_rtl(t):
    pg = t.open(rtl=True)
    h = pg.locator('.tray-split__handle')
    first = pg.evaluate('document.querySelector(".tray-split").firstElementChild.getBoundingClientRect().left > document.querySelector(".tray-split__handle").getBoundingClientRect().left')
    t.check('right to left the first pane is on the right', first)
    h.focus(); pg.keyboard.press('ArrowLeft')
    t.eq('and ArrowLeft, towards the second pane, widens it', h.get_attribute('aria-valuenow'), '36')


def test_pointer(t):
    pg = t.open()
    h = pg.locator('.tray-split__handle')
    box = pg.locator('.tray-split').bounding_box(); hb = h.bounding_box()
    pg.mouse.move(hb['x'] + hb['width'] / 2, hb['y'] + hb['height'] / 2); pg.mouse.down()
    pg.mouse.move(box['x'] + box['width'] * .5, hb['y'] + hb['height'] / 2, steps=5); pg.mouse.up()
    t.check('dragging the handle sets the size where it is let go', abs(int(h.get_attribute('aria-valuenow')) - 50) <= 2, h.get_attribute('aria-valuenow'))
    pg.mouse.move(box['x'] + box['width'] * .5, hb['y'] + 10); pg.mouse.down()
    pg.mouse.move(box['x'] + 5, hb['y'] + 10, steps=5); pg.mouse.up()
    t.eq('a drag stops at the limit', h.get_attribute('aria-valuenow'), '22')
    t.check('every step of a drag fires tray:change', len(t.events(pg, 'tray:change')) >= 2)


def test_look(t):
    pg = t.open()
    h = pg.locator('.tray-split__handle')
    w, ht = t.hit(h)
    pane = pg.evaluate('document.querySelector(".tray-split").getBoundingClientRect().height')
    t.check('the handle is a 16px strip as long as the panes, and all of it answers a press', h.bounding_box()['width'] == 16 and w >= 15 and abs(h.bounding_box()['height'] - pane) < 1, (h.bounding_box(), w, ht, pane))
    rule = t.style(h, 'background-color', pseudo='::before')
    h.focus(); pg.keyboard.press('ArrowRight'); pg.keyboard.press('ArrowLeft')  # focus from the keyboard
    ring = t.style(h, 'outline-style', 'outline-width', 'outline-offset')
    t.eq('focus draws the 3px ring inside the handle', ring, {'outline-style': 'solid', 'outline-width': '3px', 'outline-offset': '-3px'})
    ink = pg.evaluate('getComputedStyle(document.body).color')
    t.eq('and turns its pill ink', t.style(h, 'background-color', pseudo='::before'), ink)
    t.check('the pill rests in another colour', rule != ink, rule)


PARITY = [('.tray-split', 'ListAndDetail', '.tray-split')]


def test_parity_keys(t):
    r = t.open_react()
    h = t.cell(r, 'ListAndDetail').locator('.tray-split__handle')
    a = t.ax(h)
    t.eq('React: the same separator', (a['role'], a['name'], a.get('orientation'), a.get('valuemin'), a.get('valuemax'), a['value']), ('separator', 'Resize the order list', 'vertical', 22, 60, 34))
    t.eq('React: nothing fires at load', t.events(r, 'tray:change'), [])
    h.focus(); r.keyboard.press('ArrowRight')
    t.eq('React: ArrowRight widens it by two', h.get_attribute('aria-valuenow'), '36')
    r.keyboard.press('End')
    t.eq('React: End jumps to the limit', h.get_attribute('aria-valuenow'), '60')
    v = t.cell(r, 'StackedWithSize').locator('.tray-split__handle')
    t.eq('React: orientation="vertical" stacks the panes with a horizontal separator', t.ax(v).get('orientation'), 'horizontal')
    v.focus(); r.keyboard.press('ArrowDown')
    t.eq('React: ArrowDown makes the first pane taller', v.get_attribute('aria-valuenow'), '62')
    try:
        r.wait_for_function('() => document.querySelector("[data-cell=StackedWithSize]").innerText.includes("62%")', timeout=1000); heard = True
    except Exception:
        heard = False
    t.check('React: and onSizeChange hears it', heard, t.cell(r, 'StackedWithSize').inner_text()[-120:])
