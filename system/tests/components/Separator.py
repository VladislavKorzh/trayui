"""Separator: README.md. An <hr> is a separator; a <span class="tray-rule tray-rule--v"> with role="separator" and
aria-orientation="vertical" is one too; a separator has no name and takes no focus; a labelled rule is a plain <p> read as
its words, with no role; a 1px hairline, drawn in the text colour under forced colours."""


def test_tree(t):
    pg = t.open()
    t.match_tree('rules are separators; the labelled one is its word', pg.locator('.tray-demo'), '''
- paragraph: Two jars of 50 g
- separator
- paragraph: Delivered chilled, today between 14:00 and 18:00.
- text: Orders
- separator
- text: Batches
- separator
- text: Couriers
- button "Continue with a phone number"
- paragraph: or
- button "Continue with email"
''')
    v = t.ax(pg.locator('.tray-rule--v').first)
    t.eq('the vertical rule is a vertical separator with no name', (v['role'], v.get('orientation'), v['name']), ('separator', 'vertical', ''))
    t.eq('the labelled rule has no role', pg.locator('.tray-rule--label').get_attribute('role'), None)
    t.eq('no rule takes focus', pg.evaluate('[...document.querySelectorAll(".tray-rule")].filter(e => e.tabIndex >= 0).length'), 0)


def test_look(t):
    pg = t.open()
    hair = pg.evaluate('(() => { const p = document.createElement("i"); p.style.color = "var(--hairline)"; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; })()')
    hr = t.style(pg.locator('hr.tray-rule'), 'height', 'background-color')
    t.eq('a rule is a 1px line in hairline', (hr['height'], hr['background-color']), ('1px', hair))
    t.eq('the vertical rule is 1px wide and as tall as its row', pg.evaluate('(() => { const r = document.querySelector(".tray-rule--v").getBoundingClientRect(), row = document.querySelector(".tray-rule--v").parentElement.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height) === Math.round(row.height)]; })()'), [1, True])


def test_forced(t):
    pg = t.open(forced=True)
    text = t.system_colors(pg)['CanvasText']
    got = pg.evaluate('''[getComputedStyle(document.querySelector("hr.tray-rule")).backgroundColor, getComputedStyle(document.querySelector(".tray-rule--v")).backgroundColor,
        getComputedStyle(document.querySelector(".tray-rule--label"), "::before").backgroundColor, getComputedStyle(document.querySelector(".tray-rule--label"), "::after").backgroundColor]''')
    t.eq('with forced colours every line is drawn in the text colour', got, [text] * 4)


def test_parity_markup(t):
    r = t.open_react()
    t.match_tree('React: a horizontal separator', t.cell(r, 'Horizontal'), '- separator')
    v = t.cell(r, 'Vertical').locator('.tray-rule--v').first
    t.eq('React: a vertical one is a span with role and orientation, as in HTML', v.evaluate('e => [e.tagName, e.className, e.getAttribute("role"), e.getAttribute("aria-orientation")]'),
         ['SPAN', 'tray-rule tray-rule--v', 'separator', 'vertical'])
    lab = t.cell(r, 'WithLabel').locator('.tray-rule--label')
    t.eq('React: a labelled rule is a <p> without a role', lab.evaluate('e => [e.tagName, e.getAttribute("role"), e.textContent]'), ['P', None, 'or'])
