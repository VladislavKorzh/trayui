"""Input Group: README.md, Accessibility. The group is a plain <div>; the field inside is named on its own and an icon add-on
is aria-hidden; an icon-only inner button has an aria-label; the inner button is 44px; data-tray="reveal" switches the
field between password and text, keeps its name "Show password" and says the state with aria-pressed; the field turns
back to a password when its form is sent and when the page comes back from the back-forward cache; the group draws the
focus ring while the field has focus, and a field with aria-invalid keeps its danger edge inside that ring; --sm is 48px."""

REVEAL = '[data-tray="reveal"]'


def test_tree(t):
    pg = t.open()
    t.match_tree('fields named on their own, the icon button named', pg.locator('.tray-demo'), '''
- searchbox "Search orders"
- textbox "Page address": perly.example/notes
- button "Copy the address"
- textbox "Weight in kg"
- textbox "Password"
- button "Show password"
- textbox "Promo code"
- button "Apply"
- textbox "Filter"
''')
    hidden = pg.locator('.tray-input-group__addon svg').evaluate_all('s => s.every(x => x.getAttribute("aria-hidden") === "true")')
    t.check('icon add-ons are hidden from screen readers', hidden)
    # README: "A text add-on such as "kg" ... is not read with the field, so put it in the field's name too ("Weight in kg")."
    t.eq('a unit add-on is in the field\'s name too', t.ax(pg.locator('.tray-input-group:has(.tray-input-group__addon:text-is("kg")) input'))['name'], 'Weight in kg')
    t.eq('the group itself has no role', pg.locator('.tray-input-group').first.evaluate('e => e.getAttribute("role")'), None)
    pw = pg.locator('.tray-input-group:has([data-tray="reveal"]) input')
    t.eq('the password field has spellcheck and autocapitalisation off', pw.evaluate('e => [e.spellcheck, e.getAttribute("autocapitalize")]'), [False, 'none'])


def test_reveal(t):
    pg = t.open()
    btn = pg.locator(REVEAL).first
    pw = pg.locator('.tray-input-group:has([data-tray="reveal"]) input').first
    a = t.ax(btn)
    t.eq('the reveal button starts as "Show password", not pressed', (a['name'], a.get('pressed')), ('Show password', 'false'))
    btn.focus(); pg.keyboard.press('Enter')
    a = t.ax(btn)
    t.eq('pressed, it shows the password as text and says pressed, keeping its name', (pw.get_attribute('type'), a['name'], a.get('pressed')), ('text', 'Show password', 'true'))
    pg.keyboard.press('Space')
    t.eq('pressed again, it hides it', (pw.get_attribute('type'), t.ax(btn).get('pressed')), ('password', 'false'))
    # a form that is sent turns the field back to a password
    pg.evaluate('''() => { const f = document.createElement('form'); f.id = 'rf'; f.addEventListener('submit', e => e.preventDefault());
        f.innerHTML = '<div class="tray-input-group"><input class="tray-input" type="password" aria-label="New password" value="x"><button class="tray-input-group__btn" type="button" data-tray="reveal"></button></div><button type="submit">Save</button>';
        document.querySelector('.tray-demo').append(f); TrayUI.init(f); }''')
    pg.locator('#rf [data-tray="reveal"]').click()
    t.eq('the reveal button names itself when the markup does not', t.ax(pg.locator('#rf [data-tray="reveal"]'))['name'], 'Show password')
    shown = pg.locator('#rf input[aria-label]').get_attribute('type')
    pg.locator('#rf button[type="submit"]').click()
    t.eq('the field turns back to a password as its form is sent', (shown, pg.locator('#rf input[aria-label]').get_attribute('type')), ('text', 'password'))
    btn.click()
    pg.evaluate("() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))")
    t.eq('and when the page comes back from the back-forward cache', pw.get_attribute('type'), 'password')


def test_focus_and_size(t):
    pg = t.open()
    pg.keyboard.press('Tab')
    g = pg.locator('.tray-input-group').first
    t.eq('the group draws the focus ring while its field has focus', t.style(g, 'outline-style', 'outline-width'), {'outline-style': 'solid', 'outline-width': '2px'})
    t.eq('the inner button is 44px', [round(v) for v in (pg.locator('.tray-input-group__btn').first.bounding_box()['height'],)], [44])
    t.eq('tray-input-group--sm is 48px tall', round(pg.locator('.tray-input-group--sm').bounding_box()['height']), 48)
    pg.evaluate('''() => document.querySelectorAll('.tray-input-group input')[4].setAttribute('aria-invalid', 'true')''')
    bad = pg.locator('.tray-input-group').nth(4)
    t.eq('a group with an invalid field draws a danger edge inside', t.style(bad, 'outline-offset'), '-2px')
    bad.locator('input').focus()
    s = t.style(bad, 'outline-offset', 'box-shadow')
    t.check('with focus it keeps the danger edge inside the focus ring', s['outline-offset'] == '0px' and 'inset' in s['box-shadow'], s)


PARITY = [('.tray-demo', 'AddOns', '.tray-bento')]


def test_parity_reveal(t):
    for label in ('HTML', 'React'):
        pg = t.open() if label == 'HTML' else t.open_react()
        root = pg.locator('.tray-demo') if label == 'HTML' else t.cell(pg, 'AddOns')
        btn = root.locator('button[aria-label="Show password"]').first
        field = root.locator('input[aria-label="Password"]').first
        btn.click()
        t.eq(f'{label}: the reveal button shows the password and says pressed', (field.get_attribute('type'), t.ax(btn).get('pressed'), t.ax(btn)['name']), ('text', 'true', 'Show password'))
