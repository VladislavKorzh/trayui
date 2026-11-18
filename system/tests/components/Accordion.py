"""Accordion: README.md. The browser's own <details>: Tab reaches each question, Enter or Space opens and closes it, a
screen reader hears it expanded or collapsed; the question is its name and the plus tile is aria-hidden; details that share
a name open one at a time; the question takes the 3px ink ring; answers are ink-soft and at most 60 characters wide; under
reduced motion the answer opens at once instead of unfolding."""


def disclosure(t, pg, root):
    """The state of each question under root, as the browser exposes it: [(name, expanded)]."""
    out = []
    for i in range(root.locator('summary').count()):
        a = t.ax(root.locator('summary').nth(i))
        out.append((a['name'], a.get('expanded')))
    return out


def test_tree(t):
    pg = t.open()
    faq = pg.locator('.tray-accordion').first
    t.eq('each question is a disclosure named by its words, the first open',
         disclosure(t, pg, faq), [('What does it taste like?', True), ('How long does a jar keep?', False), ('How is it delivered?', False)])
    a = t.ax(faq.locator('summary').first)
    t.check('the browser exposes the summary as a disclosure button', a['role'] and a['role'].startswith('DisclosureTriangle') and a.get('focusable'), a)
    t.check('the plus tile is hidden from screen readers', t.ax(faq.locator('.tray-tile').first)['ignored'], t.ax(faq.locator('.tray-tile').first))
    t.eq('questions that share a name open one at a time', pg.evaluate('[...document.querySelectorAll(".tray-accordion")[0].querySelectorAll("details")].map(d => d.name).join()'), 'faq,faq,faq')


def test_keys(t):
    pg = t.open()
    faq = pg.locator('.tray-accordion').first
    pg.locator('body').press('Tab')
    seen = [t.focused(pg)['text']] + [f['text'] for f in t.tab_through(pg, 4)]
    t.eq('Tab reaches each question in turn and nothing else', seen,
         ['What does it taste like?', 'How long does a jar keep?', 'How is it delivered?', 'Delivery', 'Payment'])
    faq.locator('summary').nth(1).focus()
    pg.keyboard.press('Enter')
    t.eq('Enter opens a question and closes the open one of the same name', disclosure(t, pg, faq),
         [('What does it taste like?', False), ('How long does a jar keep?', True), ('How is it delivered?', False)])
    pg.keyboard.press('Space')
    t.eq('Space closes it again', disclosure(t, pg, faq)[1], ('How long does a jar keep?', False))
    small = pg.locator('.tray-accordion--sm')
    small.locator('summary').nth(0).focus(); pg.keyboard.press('Enter')
    small.locator('summary').nth(1).focus(); pg.keyboard.press('Enter')
    t.eq('details without a name stay open together', [e for _, e in disclosure(t, pg, small)], [True, True])


def test_look(t):
    pg = t.open(width=1440)
    faq = pg.locator('.tray-accordion').first
    faq.locator('summary').first.focus()
    pg.keyboard.press('Shift+Tab'); pg.keyboard.press('Tab')  # focus from the keyboard, so :focus-visible holds
    ring = t.style(faq.locator('summary').first, 'outline-style', 'outline-width', 'outline-color')
    ink = pg.evaluate('getComputedStyle(document.body).color')
    t.eq('the question takes the 3px ink ring', ring, {'outline-style': 'solid', 'outline-width': '3px', 'outline-color': ink})
    body = faq.locator('.tray-accordion__body').first
    ch = body.evaluate('e => { const s = document.createElement("span"); s.textContent = "0".repeat(60); s.style.cssText = "position:absolute;white-space:nowrap;visibility:hidden"; e.appendChild(s); const w = s.getBoundingClientRect().width; s.remove(); return w; }')
    w = body.evaluate('e => e.getBoundingClientRect().width')
    t.check('an answer is at most 60 characters wide', w <= ch + 1, f'{w}px for 60ch of {ch}px')
    soft = pg.evaluate('(() => { const p = document.createElement("p"); p.style.color = "var(--ink-soft)"; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; })()')
    t.eq('answers are ink-soft', t.style(body, 'color'), soft)
    t.eq('questions are bold (subtitle); the small size sets them in control', (t.style(faq.locator('summary').first, 'font-weight'), t.style(pg.locator('.tray-accordion--sm summary').first, 'font-weight')), ('700', '600'))


def test_motion(t):
    for motion, moves in (('no-preference', True), ('reduce', False)):
        pg = t.open(motion=motion)
        d = pg.locator('.tray-accordion details').nth(1)
        m = t.style(d, 'transition-property', 'transition-duration', pseudo='::details-content')
        unfolds = 'block-size' in m['transition-property'] and m['transition-duration'] != '0s'
        t.check(f'the answer {"unfolds to its height" if moves else "opens at once under reduced motion"}', unfolds == moves, m)
        tile = t.style(d.locator('.tray-tile .tray-icon'), 'transition-property')
        t.check(f'the plus {"turns" if moves else "becomes a cross at once"} ({motion})', ('transform' in tile) == moves, tile)
        pg.close()


PARITY = [('.tray-accordion >> nth=0', 'Questions', '.tray-accordion'),
          ('.tray-card .tray-accordion', 'SmallOnACard', '.tray-accordion')]


def test_parity_keys(t):
    """The React twin answers the same keys: one open at a time unless `multiple`."""
    h, r = t.open(), t.open_react()
    for label, pg, root in (('HTML', h, h.locator('.tray-accordion').first), ('React', r, t.cell(r, 'Questions').locator('.tray-accordion'))):
        root.locator('summary').nth(1).focus(); pg.keyboard.press('Enter')
        t.eq(f'{label}: Enter opens the second and closes the first', [e for _, e in disclosure(t, pg, root)], [False, True, False])
    small = t.cell(r, 'SmallOnACard').locator('.tray-accordion')
    small.locator('summary').nth(0).focus(); r.keyboard.press('Enter')
    small.locator('summary').nth(1).focus(); r.keyboard.press('Enter')
    t.eq('React: a `multiple` accordion lets both stay open, as details without a name do', [e for _, e in disclosure(t, r, small)], [True, True])
    t.eq('React: the plus tile is hidden too', t.cell(r, 'Questions').locator('.tray-tile').first.get_attribute('aria-hidden'), 'true')
