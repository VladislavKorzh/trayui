"""Call to Action: README.md. A <section> opened by a heading; its buttons are links that lead to another page, their
words saying what happens; on the yellow card every colour keeps the light palette and the focus ring takes the card's
own ink, so it shows in every theme; the email form's field is named by a tray-vh <label>, not by its placeholder. The text
sits at the start edge, the buttons at the end edge on the same baseline, and they drop under the text when there is no
room."""

RING = r"""(el) => {
  const parse = (s) => (s.match(/[\d.]+/g) || []).map(Number);
  const lum = (c) => { const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  const card = el.closest('.tray-card'), bg = parse(getComputedStyle(card).backgroundColor), cs = getComputedStyle(el), o = parse(cs.outlineColor), a = lum(o), b = lum(bg);
  return { visible: el.matches(':focus-visible'), style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor, ground: getComputedStyle(card).backgroundColor,
           ink: getComputedStyle(card).color, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) };
}"""


def test_tree(t):
    pg = t.open()
    offer, mail = pg.locator('section.tray-cta').nth(0), pg.locator('section.tray-cta').nth(1)
    t.match_tree('the offer: a heading, a sentence, and two links that say what happens', offer, '''
- heading "Pack tomorrow's orders with Counter" [level=2]
- paragraph: Free for 14 days. Your products and customers stay yours.
- link "Start free"
- link "Talk to us"
''')
    t.check('the section opens with its heading', offer.evaluate('s => s.querySelector("h1, h2, h3, h4, h5, h6") === s.querySelector("*:is(h1, h2, h3, h4, h5, h6, a, button, input)")'))
    t.match_tree('the email form: a field named Email and a button', mail, '''
- heading "One letter a month about running a small food business" [level=2]
- textbox "Email"
- button "Subscribe"
''')
    f = t.ax(pg.locator('#cta-email'))
    t.check('the field is named by its label, not by the placeholder', f['name'] == 'Email' and pg.get_attribute('#cta-email', 'placeholder') != 'Email', f)
    vh = pg.locator('label[for="cta-email"]').evaluate('l => [l.classList.contains("tray-vh"), Math.round(l.getBoundingClientRect().width)]')
    t.check('the label is hidden from view and read by screen readers', vh[0] and vh[1] <= 1, vh)
    t.eq('the field asks for an email and lets the browser fill it', [pg.get_attribute('#cta-email', 'type'), pg.get_attribute('#cta-email', 'autocomplete')], ['email', 'email'])


def test_yellow(t):
    seen = {}
    for theme in ('light', 'dark'):
        pg = t.open(theme)
        btn = pg.locator('.tray-card--accent a.tray-btn').first
        btn.focus()
        r = btn.evaluate(RING)
        seen[theme] = r
        t.check(f'[{theme}] the focus ring on the yellow card is a solid 3px ring in the card\'s own ink', r['visible'] and r['style'] == 'solid' and r['width'] == '3px' and r['color'] == r['ink'], r)
        t.check(f'[{theme}] the ring shows on the yellow: at least 3:1', r['ratio'] >= 3, r)
        pg.close()
    t.check('the yellow card keeps the light palette in Dark: the same yellow, ink and ring', all(seen['light'][k] == seen['dark'][k] for k in ('ground', 'ink', 'color')), seen)


def test_layout(t):
    pg = t.open(width=1440)
    m = pg.evaluate('''() => { const s = document.querySelector('.tray-cta'), cs = getComputedStyle(s), b = s.getBoundingClientRect(), x = s.querySelector('.tray-cta__text').getBoundingClientRect(), a = s.querySelector('.tray-cta__actions').getBoundingClientRect();
        return { start: Math.round(x.left - b.left - parseFloat(cs.paddingLeft)), end: Math.round(b.right - parseFloat(cs.paddingRight) - a.right), bottom: Math.round(x.bottom - a.bottom), beside: a.left >= x.right }; }''')
    t.check('at 1440px the text is at the start edge, the buttons beside it at the end edge, on its last line', m['start'] == 0 and m['end'] == 0 and abs(m['bottom']) <= 2 and m['beside'], m)
    pg.close()
    pg = t.open(width=390)
    m = pg.evaluate('''() => { const s = document.querySelector('.tray-cta'), x = s.querySelector('.tray-cta__text').getBoundingClientRect(), a = s.querySelector('.tray-cta__actions').getBoundingClientRect(); return [Math.round(a.top - x.bottom), Math.round(a.left - x.left)]; }''')
    t.check('at 390px the buttons drop under the text', m[0] >= 0 and m[1] == 0, m)
    t.scan(pg, '390px')


PARITY = [('section.tray-cta.tray-card--accent', 'Offer', 'section.tray-cta'), ('section.tray-cta:not(.tray-card--accent)', 'Newsletter', 'section.tray-cta')]


def test_parity_form(t):
    pg = t.open_react()
    cell = t.cell(pg, 'Newsletter')
    cell.locator('input[type="email"]').fill('dana@farm.example')
    cell.locator('button').click()
    t.check('React: the email form sends what was typed', 'Subscribed: dana@farm.example' in cell.inner_text(), cell.inner_text())
    f = t.ax(cell.locator('input[type="email"]'))
    t.eq('React: the field is named Email by a hidden label', f['name'], 'Email')
