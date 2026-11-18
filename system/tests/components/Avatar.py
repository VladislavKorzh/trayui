"""Avatar: README.md. A tile of initials is plain text; alone, it is role="img" named by aria-label; beside the name it is
aria-hidden; a group is role="group" named for who and how many, the avatars in it aria-hidden (the name says what they stand for); the current person's ink avatar says "you" in words; an
avatar that opens something is a <button class="tray-avatar"> whose aria-label holds the initials it shows (WCAG 2.5.3).
Sizes 32, 40, 48 and 64px; corners 12px, 16px on the large one, never round."""


def test_tree(t):
    pg = t.open()
    t.match_tree('lone avatars are pictures named for the person; the ink one says "you"', pg.locator('.tray-demo'), '''
- img "Dana Kovalenko": DK
- img "Anna Melnyk": AM
- img "Bohdan Shevchuk": BS
- img "Oksana Franko": OF
- img "Dana Kovalenko, you": DK
- img "Assistant"
- img "No photo"
- group "Packing team, 6 people"
- 'button "Account: Oksana Franko, OF"'
- paragraph: Oksana Franko
- paragraph: Farm manager
''')
    beside = pg.locator('.tray-row .tray-avatar')
    t.check('an avatar beside the written name is hidden, so the name is heard once', t.ax(beside)['ignored'], t.ax(beside))
    for sel in ('.tray-avatar--accent', '.tray-avatar[aria-label="No photo"]'):
        t.check(f'the icon in {sel} is hidden: the label speaks for it', t.ax(pg.locator(sel + ' svg'))['ignored'])


def test_button(t):
    pg = t.open()
    btn = pg.locator('button.tray-avatar')
    a = t.ax(btn)
    t.eq('an avatar that opens something is a button named for whose it is', (a['role'], a['name']), ('button', 'Account: Oksana Franko, OF'))
    t.check('its name holds the initials it shows (WCAG 2.5.3)', btn.inner_text().strip() in a['name'], a['name'])
    w, h = t.hit(btn)
    t.check('the button is a 44px target at least', w >= 44 and h >= 44, (w, h))
    pg.locator('body').press('Tab')
    t.eq('Tab reaches the button and nothing else in the preview', t.focused(pg)['label'], 'Account: Oksana Franko, OF')
    t.eq('it draws the 3px ink ring', t.style(btn, 'outline-style', 'outline-width'), {'outline-style': 'solid', 'outline-width': '3px'})
    pg.keyboard.press('Tab')
    t.check('nothing after it takes focus', t.focused(pg)['body'], t.focused(pg))


def test_shape(t):
    pg = t.open()
    got = pg.evaluate('''[".tray-avatar--xs", ".tray-avatar--sm", ".tray-demo > .tray-avatar:not([class*='--'])", ".tray-avatar--lg"].map(s => { const e = document.querySelector(s), r = e.getBoundingClientRect(), c = getComputedStyle(e); return [Math.round(r.width), Math.round(r.height), c.borderTopLeftRadius]; })''')
    t.eq('sizes 32, 40, 48 and 64px, softly squared: 12px corners, 16px on the large one', got,
         [[32, 32, '12px'], [40, 40, '12px'], [48, 48, '12px'], [64, 64, '16px']])


PARITY = [('[aria-label="Dana Kovalenko, you"]', 'Tones', '[aria-label="Dana Kovalenko, you"]'),
          ('.tray-avatar--accent', 'Tones', '.tray-avatar--accent'),
          ('.tray-avatar-group', 'GroupAndName', '.tray-avatar-group'),
          ('.tray-demo > .tray-row', 'GroupAndName', '.tray-row.tray-row--sm')]



def test_parity_markup(t):
    """The React Avatar renders the classes and states of the HTML one."""
    r = t.open_react()
    tones = t.cell(r, 'Tones')
    t.eq('React: label makes a role="img" avatar named by aria-label', [tones.locator('.tray-avatar').nth(i).evaluate('e => [e.className, e.getAttribute("role"), e.getAttribute("aria-label")]') for i in range(2)],
         [['tray-avatar tray-avatar--ink', 'img', 'Dana Kovalenko, you'], ['tray-avatar tray-avatar--accent', 'img', 'Assistant']])
    beside = t.cell(r, 'GroupAndName').locator('.tray-row--sm > .tray-avatar')
    t.eq('React: an avatar without a label is hidden, as one beside the name is', beside.get_attribute('aria-hidden'), 'true')
    sizes = t.cell(r, 'Sizes').locator('.tray-avatar')
    t.eq('React: the sizes are the same classes', [sizes.nth(i).get_attribute('class') for i in range(4)],
         ['tray-avatar tray-avatar--xs', 'tray-avatar tray-avatar--sm', 'tray-avatar', 'tray-avatar tray-avatar--lg'])
