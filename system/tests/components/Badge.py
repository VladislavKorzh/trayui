"""Badge: README.md. A badge is plain text with no role that Tab passes by; the word carries the state and the icon beside
it is aria-hidden; a count says what it counts (here in a tray-vh span); a chip's remove button names the chip it removes and
reaches 44px past its edge (guides/3-accessibility.md, Targets). Badges are 32px, chips 40px, counts 24px."""


def test_tree(t):
    pg = t.open()
    roles = pg.evaluate('[...document.querySelectorAll(".tray-badge, .tray-chip")].map(e => e.getAttribute("role")).filter(Boolean)')
    t.eq('no badge or chip has a role', roles, [])
    a = t.ax(pg.locator('.tray-badge--success'))
    t.check('a badge is read as its word', a['ignored'] or a['role'] in ('generic', 'none', 'StaticText'), a)
    t.check('the word, not the colour, says the state', pg.inner_text('.tray-badge--danger').strip() == 'Payment failed')
    icons = pg.evaluate('[...document.querySelectorAll(".tray-badge svg, .tray-chip > svg")].map(s => s.getAttribute("aria-hidden"))')
    t.check('every icon in a badge or chip is aria-hidden', icons and all(i == 'true' for i in icons), icons)
    t.eq('a count says what it counts', [pg.locator('.tray-badge--count').nth(i).text_content() for i in range(2)], ['12 orders to pack', '3 unread messages'])
    t.match_tree('the remove button names the chip it removes', pg.locator('.tray-demo'), '- button "Remove the filter Kyiv"')


def test_keys(t):
    pg = t.open()
    pg.locator('body').press('Tab')
    t.eq('Tab passes the badges by and stops on the one control, the remove button', t.focused(pg)['label'], 'Remove the filter Kyiv')
    pg.keyboard.press('Tab')
    t.check('and nothing else takes focus', t.focused(pg)['body'], t.focused(pg))


def test_targets(t):
    pg = t.open()
    x = pg.locator('.tray-chip__x')
    w, h = t.hit(x)
    t.check('the remove button looks small and reaches 44px past its edge', w >= 44 and h >= 44, (w, h, x.bounding_box()))
    sizes = pg.evaluate('''[".tray-badge:not(.tray-badge--count)", ".tray-chip", ".tray-badge--count"].map(s => Math.round(document.querySelector(s).getBoundingClientRect().height))''')
    t.eq('a badge is 32px, a chip 40px, a count 24px', sizes, [32, 40, 24])


def test_parity_markup(t):
    """The React Badge renders the classes the README names, and its icon is hidden too."""
    r = t.open_react()
    got = r.evaluate('''[...document.querySelectorAll("[data-cell] .tray-badge")].map(e => [e.className, e.textContent.trim(), [...e.querySelectorAll("svg")].map(s => s.getAttribute("aria-hidden")).join()])''')
    want = {'To pack': 'tray-badge', 'On shift': 'tray-badge tray-badge--accent', 'With the courier': 'tray-badge tray-badge--ink',
            'Invited': 'tray-badge tray-badge--off', 'Paid': 'tray-badge tray-badge--success', 'Failed': 'tray-badge tray-badge--danger'}
    have = {txt: cls for cls, txt, _ in got}
    t.eq('React: each tone is the class of the HTML badge', {k: have.get(k) for k in want}, want)
    t.check('React: an icon in a badge is aria-hidden', all(h in ('', 'true') for _, _, h in got) and any(h == 'true' for _, _, h in got), got)
    counts = [c for c, _, _ in got if 'tray-badge--count' in c]
    t.eq('React: a count is tray-badge--count', len(counts), 2)
