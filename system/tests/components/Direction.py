"""Direction: README.md. dir="rtl" (with lang) on a region mirrors it through logical properties: the order of a row, the
side of an input group's addon, the side a switch knob travels to; icons marked tray-icon--flip mirror, others do not; the
reading and Tab order follow the source. The keys that swap are tested with each component (Tabs, Carousel, Resizable...)."""

SIDES = '''sel => { const card = document.querySelector(sel), box = card.getBoundingClientRect(), r = (q) => card.querySelector(q).getBoundingClientRect();
  const addon = r(".tray-input-group__addon"), input = r(".tray-input"), back = r(".tray-btn--ghost"), next = r(".tray-btn:not(.tray-btn--ghost)");
  return { addonFirst: addon.left < input.left, backFirst: back.left < next.left, dir: getComputedStyle(card).direction }; }'''


def test_tree(t):
    pg = t.open()
    t.eq('each card says its language with its direction', pg.evaluate('[...document.querySelectorAll(".tray-card")].map(c => c.dir + " " + c.lang)'), ['ltr en', 'rtl ar'])
    t.match_tree('both read in the same order: label, field, switch, Back, Next', pg.locator('.tray-demo'), '''
- textbox "City": Lviv
- switch "Gift box" [checked]
- button "Back"
- button "Next"
- textbox "المدينة": لفيف
- switch "علبة هدية" [checked]
- button "رجوع"
- button "التالي"
''')


def test_mirror(t):
    pg = t.open(width=1440)
    ltr, rtl = pg.evaluate(SIDES, '[dir="ltr"]'), pg.evaluate(SIDES, '[dir="rtl"]')
    t.eq('left to right: the addon and Back come first, on the left', ltr, {'addonFirst': True, 'backFirst': True, 'dir': 'ltr'})
    t.eq('right to left: they come first on the right', rtl, {'addonFirst': False, 'backFirst': False, 'dir': 'rtl'})
    flip = pg.evaluate('[...document.querySelectorAll(".tray-card")].map(c => getComputedStyle(c.querySelector(".tray-icon--flip")).transform)')
    t.check('an icon marked tray-icon--flip mirrors right to left only', flip[0] == 'none' and flip[1].startswith('matrix(-1'), flip)
    plain = pg.evaluate('getComputedStyle(document.querySelector("[dir=rtl] .tray-input-group__addon .tray-icon")).transform')
    t.eq('an icon that is not marked does not mirror', plain, 'none')
    ends = pg.evaluate('''[...document.querySelectorAll(".tray-switch")].map(l => { const tr = l.querySelector(".tray-switch__track").getBoundingClientRect(), tx = l.querySelector(".tray-switch__text").getBoundingClientRect(); return tr.left >= tx.right ? "end-right" : tr.right <= tx.left ? "end-left" : "?"; })''')
    t.eq('the switch sits after its words: on the right in ltr, on the left in rtl', ends, ['end-right', 'end-left'])
    knob = pg.evaluate('''[...document.querySelectorAll(".tray-switch__track")].map(tr => { const b = tr.getBoundingClientRect(), k = getComputedStyle(tr, "::before"); const m = new DOMMatrix(k.transform === "none" ? undefined : k.transform); return Math.sign(m.m41); })''')
    t.check('a switch that is on has its knob travelled to the end: right in ltr, left in rtl', knob[0] > 0 and knob[1] < 0, knob)


def test_keys(t):
    pg = t.open()
    pg.locator('#dr2').focus()
    pg.keyboard.press('Tab')
    t.eq('Tab follows the source in the right-to-left card: field, then the switch', t.focused(pg)['type'], 'checkbox')
    pg.keyboard.press('Tab')
    t.eq('then Back', t.focused(pg)['text'], 'رجوع')


PARITY = [('.tray-demo', 'BothDirections', None)]
