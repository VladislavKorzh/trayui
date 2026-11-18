"""Kbd: README.md. A <kbd> is read as its text; a combination is one cap per key in tray-keys with no plus signs; inside a
button the caps are read as part of its name; a cap is not focusable. Caps are 26px tall with 4px corners, in the mono face."""


def test_tree(t):
    pg = t.open()
    t.match_tree('caps read as their words, the button named with its shortcut', pg.locator('.tray-demo'), '''
- text: K Ctrl K Shift Enter
- paragraph: Press Esc to close
- button "Search Ctrl K"
- paragraph: Next field Tab
''')
    t.eq('a combination is one cap per key, with no plus signs', pg.evaluate('[...document.querySelectorAll(".tray-keys")].map(k => [...k.children].map(c => c.tagName + ":" + c.textContent).join(" ") + "|" + k.textContent.includes("+"))'),
         ['KBD:Ctrl KBD:K|false', 'KBD:Shift KBD:Enter|false', 'KBD:Ctrl KBD:K|false'])


def test_keys(t):
    pg = t.open()
    pg.locator('body').press('Tab')
    t.eq('Tab passes the caps by: the button is the only stop', t.focused(pg)['text'].replace('\n', ' '), 'Search Ctrl K')
    pg.keyboard.press('Tab')
    t.check('nothing after it takes focus', t.focused(pg)['body'])
    t.eq('no cap is focusable', pg.evaluate('[...document.querySelectorAll("kbd")].filter(k => k.tabIndex >= 0).length'), 0)


def test_look(t):
    pg = t.open()
    k = pg.locator('kbd').first
    st = t.style(k, 'height', 'border-top-left-radius', 'font-family')
    t.eq('a cap is 26px tall with 4px corners', (st['height'], st['border-top-left-radius']), ('26px', '4px'))
    t.check('in the mono face', 'mono' in st['font-family'].lower() or 'Mono' in st['font-family'], st['font-family'])


def test_parity_markup(t):
    r = t.open_react()
    keys = t.cell(r, 'Keys')
    t.check('React: a cap is <kbd class="tray-kbd">', keys.locator('kbd.tray-kbd').count() >= 4, keys.inner_html()[:300])
    t.eq('React: a combination is tray-keys of caps without plus signs', keys.evaluate('c => [...c.querySelectorAll(".tray-keys")].map(k => [...k.children].map(x => x.tagName).join() + "|" + k.textContent.includes("+"))'),
         ['KBD,KBD|false', 'KBD,KBD|false'])
