"""Button: README.md. The browser's own <button>: Tab reaches it, Enter and Space press it, its text is its name and its
icons are aria-hidden; an icon-only button is named by aria-label; disabled leaves the Tab order and keeps its fill at
opacity-disabled; a busy one has aria-busy and an aria-hidden spinner that turns slowly (not stops) under reduced motion;
keyboard focus is a 3px ink ring 3px out; a press scales to 0.97 (and not under reduced motion); the sizes are 64, 56,
48 and 40px, the 40px one reaching 44px past its edge (guides/3-accessibility.md, Targets)."""

SIZES = {'Large': 64, 'Medium': 56, 'Small': 48, 'Extra small': 40}


def test_tree(t):
    pg = t.open()
    t.match_tree('every button is a button named by its text', pg.locator('.tray-demo'), '''
- button "Order a jar"
- button "See the farm"
- button "Details"
- button "Cancel"
- button "Delete order"
- paragraph: "Sizes: 64, 56, 48 and 40px"
- button "Large"
- button "Medium"
- button "Small"
- button "Extra small"
- button "Read the terms"
- paragraph: With an icon, icon only, with a value, disabled, busy
- button "Add to order"
- button "Next"
- button "Search"
- button "Order a jar $59"
- button "Order a jar" [disabled]
- button "Sending"
''')
    t.check('no icon inside a button is in the accessibility tree', 'img' not in t.tree(pg.locator('.tray-demo')), t.tree(pg.locator('.tray-demo')))
    busy = t.ax(pg.locator('[aria-busy="true"]'))
    t.eq('a busy button says so (aria-busy) and keeps its label', (busy['name'], busy.get('busy')), ('Sending', True))
    t.eq('the spinner of a busy button is aria-hidden', pg.get_attribute('[aria-busy="true"] .tray-spinner', 'aria-hidden'), 'true')
    t.eq('an icon-only button is named by its aria-label', t.ax(pg.locator('.tray-btn--icon'))['name'], 'Search')


def test_keys(t):
    pg = t.open()
    pg.evaluate('''() => { window.__pressed = []; document.querySelectorAll('.tray-btn').forEach(b => b.addEventListener('click', () => window.__pressed.push(b.textContent.trim()))); }''')
    first = pg.locator('.tray-btn').first
    first.focus()
    pg.keyboard.press('Enter')
    pg.keyboard.press('Space')
    t.eq('Enter and Space press a button', pg.evaluate('window.__pressed'), ['Order a jar', 'Order a jar'])
    pg.locator('.tray-btn--split').focus()
    seq = [f['text'] for f in t.tab_through(pg, 2)]
    t.eq('Tab passes over the disabled button to the next', seq, ['Sending', ''])
    pg.locator('.tray-btn--split').focus()
    pg.keyboard.press('Tab')
    ring = t.style(pg.locator('[aria-busy="true"]'), 'outline-style', 'outline-width', 'outline-offset', 'outline-color')
    ink = pg.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--ink").trim()')
    t.eq('keyboard focus draws a 3px solid ring 3px out', (ring['outline-style'], ring['outline-width'], ring['outline-offset']), ('solid', '3px', '3px'))
    probe = pg.evaluate('(c) => { const i = document.createElement("i"); i.style.color = c; document.body.append(i); const v = getComputedStyle(i).color; i.remove(); return v; }', ink)
    t.eq('in ink', ring['outline-color'], probe)


def test_sizes(t):
    pg = t.open()
    for label, px in SIZES.items():
        h = pg.get_by_role('button', name=label, exact=True).evaluate('e => e.getBoundingClientRect().height')
        t.eq(f'the {label.lower()} button is {px}px tall', round(h), px)
    w, h = t.hit(pg.locator('.tray-btn--xs'))
    t.check('the 40px button reaches 44px past its edge', h >= 44 and w >= 44, f'{w}x{h}')
    t.eq('the link button is at least 44px tall', round(pg.locator('.tray-btn--link').evaluate('e => e.getBoundingClientRect().height')) >= 44, True)
    dis = t.style(pg.locator('.tray-btn:disabled'), 'opacity')
    tok = pg.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--opacity-disabled").trim()')
    t.eq('a disabled button keeps its fill at opacity-disabled', float(dis), float(tok))


def press_scale(pg, loc):
    box = loc.bounding_box()
    pg.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
    pg.mouse.down()
    pg.wait_for_timeout(260)
    m = loc.evaluate('e => getComputedStyle(e).transform')
    pg.mouse.up()
    return m


def test_motion(t):
    pg = t.open(motion='no-preference')
    m = press_scale(pg, pg.locator('.tray-btn').first)
    t.check('a press scales the button to 0.97', m.startswith('matrix(0.97,'), m)
    sp = t.motion(pg.locator('[aria-busy="true"] .tray-spinner'))
    t.check('the spinner of a busy button turns', 'tray-spin' in sp['animation-name'], sp)
    pg = t.open()  # prefers-reduced-motion: reduce
    m = press_scale(pg, pg.locator('.tray-btn').first)
    t.eq('under reduced motion a press does not scale it', m, 'none')
    sp = t.motion(pg.locator('[aria-busy="true"] .tray-spinner'))
    t.check('under reduced motion the spinner turns slowly instead of stopping', 'tray-spin' in sp['animation-name'] and sp['animation-duration'].startswith('2.4') and sp['animation-iteration-count'] == 'infinite', sp)


def test_react_parity(t):
    """The React preview draws the same buttons, named and disabled the same way."""
    h = t.open()
    r = t.open_react()
    read = '''els => els.map(e => [e.tagName.toLowerCase(), (e.getAttribute('aria-label') || e.innerText).trim().replace(/\\s+/g, ' '), e.className.split(' ').filter(c => c.startsWith('tray-btn') && !/--(md|sm|xs)$/.test(c)).sort().join(' '), e.disabled || false, e.getAttribute('aria-busy')])'''
    html = h.locator('.tray-btn').evaluate_all(read)
    react = r.locator('.tray-btn').evaluate_all(read)
    missing = [b for b in html if b not in react]
    t.check('every HTML button has a React twin with the same element, name, variant and state (the examples choose their own sizes)', not missing, f'not in React: {missing}; React has {react}')
    t.eq('the busy React button carries a spinner that is aria-hidden', r.locator('[aria-busy="true"] .tray-spinner').get_attribute('aria-hidden'), 'true')
