"""Bubble: README.md. A plain block with no role; a clamped bubble keeps all its text for a screen reader, its Show more
button carries aria-controls and gets aria-expanded and "Show less"; a reaction is a toggle button with aria-pressed named
by its contents ("Thumbs up, 2"), with no aria-label, 32px to the eye and 44px to a finger, and data-tray="reaction"
toggles it and its count; your own bubble names you in words for a screen reader ("You:", as the Message README
shows), since only its fill and corner say whose it is; a link in your own bubble draws its ring in the colour of the text; corners are 20px and the one
beside the speaker 4px."""


def test_tree(t):
    pg = t.open()
    t.match_tree('bubbles are plain text, reactions are toggle buttons named by their contents, the assistant an image', pg.locator('.tray-thread'), '''
- text: Is the autumn batch still open? I would like two jars before the season ends.
- button "Thumbs up, 2" [pressed]
- button "Heart, 1"
- text: "You: Yes, 132 jars are left. You can"
- link "order here"
- text: /and choose the day\\. Thank you\\. One more thing about delivery/
- button "Show more"
- img "Assistant"
- paragraph: Noted. The courier will call first and, after four, try number 14.
''')
    t.eq('a bubble has no role', pg.evaluate('[...document.querySelectorAll(".tray-bubble")].filter(b => b.hasAttribute("role")).length'), 0)
    t.eq('a reaction has no aria-label, which would hide its count', pg.locator('.tray-reaction[aria-label]').count(), 0)


def test_toggles(t):  # not test_reactions: the harness counts test_react* as checks of React
    pg = t.open()
    up, heart = pg.locator('.tray-reaction').nth(0), pg.locator('.tray-reaction').nth(1)
    up.click()
    a = t.ax(up)
    t.eq('a press on your own reaction takes it back and lowers the count', (a['name'], a.get('pressed')), ('Thumbs up, 1', 'false'))
    heart.focus()
    pg.keyboard.press('Space')
    a = t.ax(heart)
    t.eq('Space adds a reaction and raises the count', (a['name'], a.get('pressed')), ('Heart, 2', 'true'))
    t.settle(pg)  # its fill eases from one to the other
    t.eq('your own reaction is solid ink', t.style(heart, 'background-color'),
         pg.evaluate('() => { const p = document.createElement("i"); p.style.color = "var(--ink)"; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; }'))
    pg.keyboard.press('Enter')
    t.eq('Enter takes it back', (t.ax(heart)['name'], t.ax(heart).get('pressed')), ('Heart, 1', 'false'))
    box = up.bounding_box()
    w, h = t.hit(up)
    t.check('a reaction is 32px to the eye', abs(box['height'] - 32) < 0.5, box)
    t.check('and 44px to a finger', h >= 44, (w, h))


def test_more(t):
    pg = t.open()
    btn, bubble = pg.locator('[data-tray="more"]'), pg.locator('#bb-long')
    t.eq('Show more names the bubble it opens and says it is shut', (btn.get_attribute('aria-controls'), btn.get_attribute('aria-expanded')), ('bb-long', 'false'))
    line = float(t.style(bubble.locator('.tray-bubble__text'), 'line-height').rstrip('px'))
    shut = bubble.locator('.tray-bubble__text').bounding_box()['height']
    t.check('a clamped bubble shows three lines', abs(shut - 3 * line) < 2, (shut, line))
    t.check('and keeps all its text for a screen reader', 'until the evening' in t.tree(bubble))
    btn.focus()
    pg.keyboard.press('Enter')
    a = t.ax(btn)
    t.eq('Enter opens it: Show less, expanded', (a['name'], a.get('expanded')), ('Show less', True))
    t.check('the whole text shows', bubble.locator('.tray-bubble__text').bounding_box()['height'] > shut + line, bubble.locator('.tray-bubble__text').bounding_box())
    t.check('focus stays on the button', t.is_focused(btn))
    pg.keyboard.press('Space')
    t.eq('Space shuts it again', (t.ax(btn)['name'], t.ax(btn).get('expanded')), ('Show more', False))


def test_look(t):
    pg = t.open()
    first, last = pg.locator('.tray-bubble-group > .tray-bubble').first, pg.locator('.tray-bubble-group > .tray-bubble').last
    radius = lambda loc, corner: t.style(loc, f'border-{corner}-radius')
    t.eq('corners are 20px', radius(first, 'start-start'), '20px')
    t.eq('in a group from someone else only the last bubble keeps the small corner beside the speaker',
         (radius(first, 'end-start'), radius(last, 'end-start')), ('20px', '4px'))
    own = pg.locator('.tray-bubble--own')
    t.eq('your own bubble has its small corner at the end', (radius(own, 'end-end'), radius(own, 'end-start')), ('4px', '20px'))
    link = own.locator('a')
    pg.keyboard.press('Tab')  # focus by the keyboard, so the ring is the one :focus-visible draws
    link.focus()
    t.eq('a link in your own bubble draws its ring in the colour of the text', t.style(link, 'outline-color'), t.style(own, 'color'))
    t.check('bubbles hug their text, never the full width', own.bounding_box()['width'] < pg.locator('.tray-thread').bounding_box()['width'] * 0.75)


def test_parity_reactions(t):
    """The same presses on the React reactions and on the HTML ones end in the same names and states."""
    out = []
    for react in (False, True):
        pg = t.open(react=react)
        root = t.cell(pg, 'Thread') if react else pg
        btns = root.locator('.tray-reaction')
        btns.nth(0).click()
        btns.nth(1).focus()
        pg.keyboard.press('Space')
        out.append([(t.ax(btns.nth(i))['name'], t.ax(btns.nth(i)).get('pressed')) for i in range(2)])
        more = root.locator('.tray-btn--link').first
        more.click()
        out[-1].append((t.ax(more)['name'], t.ax(more).get('expanded')))
    t.eq('React reactions and Show more answer presses as the HTML ones do', out[1], out[0])


PARITY = [('.tray-thread', 'Thread', '.tray-thread')]
