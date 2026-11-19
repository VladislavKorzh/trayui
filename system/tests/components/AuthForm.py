"""Auth Form: README.md. Every field has a visible label tied by for, and autocomplete; a field in error is aria-invalid
and tied by aria-describedby to what explains it (the email to the title of the form's error, the password to its hint);
the error for the whole form is an Alert with role="alert" and tabindex="-1", so a page can move focus to it; the reveal
button keeps its name "Show password" and aria-pressed says the password shows; a password shown turns back into a
password field as the form is sent; the card is at most 27rem wide."""


def test_tree(t):
    pg = t.open()
    t.match_tree('sign in: the wordmark, the heading, the passkey, the fields with their labels, reveal, the button', pg.locator('form').first, '''
- link "Counter"
- heading "Sign in" [level=1]
- paragraph: Welcome back to Perly Farm.
- button "Continue with a passkey"
- textbox "Email"
- link "Forgot it?"
- textbox "Password"
- button "Show password"
- button "Sign in"
- paragraph:
  - link "Create an account"
''')
    t.match_tree('create an account: the error first, an alert', pg.locator('form').nth(1), '''
- heading "Create an account" [level=2]
- alert:
  - paragraph: That email already has an account
- textbox "Farm or shop name"
- textbox "Work email" [invalid]
- textbox "Password"
- button "Create the account"
''')
    t.eq('every field says what it holds to the browser (autocomplete)', pg.evaluate('[...document.querySelectorAll("form input")].map(i => i.getAttribute("autocomplete"))'),
         ['username', 'current-password', 'organization', 'username', 'new-password'])
    t.eq('every field has a visible label tied by for', pg.evaluate('[...document.querySelectorAll("form input")].every(i => i.labels.length === 1 && i.labels[0].offsetParent !== null)'), True)
    email = t.ax(pg.locator('#au-email2'))
    t.eq('the email in error is described by the title of the form\'s error', (email.get('invalid'), email['description']), ('true', 'That email already has an account'))
    t.eq('the password is described by its hint', t.ax(pg.locator('#au-pass2'))['description'], 'At least 12 characters.')
    alert = pg.locator('.tray-alert[role="alert"]')
    alert.focus()
    t.check('the error can take focus as a page with it loads', t.is_focused(alert) and alert.get_attribute('tabindex') == '-1')


def test_reveal(t):
    pg = t.open()
    btn, field = pg.locator('[data-tray="reveal"]'), pg.locator('#au-pass')
    t.eq('the reveal button starts not pressed', t.ax(btn).get('pressed'), 'false')
    btn.focus()
    pg.keyboard.press('Space')
    a = t.ax(btn)
    t.eq('pressed, the password shows; the name stays Show password and aria-pressed says it', (field.get_attribute('type'), a['name'], a.get('pressed')), ('text', 'Show password', 'true'))
    pg.keyboard.press('Enter')
    t.eq('pressed again, it hides', (field.get_attribute('type'), t.ax(btn).get('pressed')), ('password', 'false'))
    pg.keyboard.press('Space')
    pg.evaluate('document.querySelector("form").requestSubmit()')
    t.eq('a password shown turns back into a password field as the form is sent', (field.get_attribute('type'), t.ax(btn).get('pressed')), ('password', 'false'))


def test_layout(t):
    pg = t.open(width=1440)
    widths = pg.evaluate('[...document.querySelectorAll(".tray-auth")].map(f => f.getBoundingClientRect().width)')
    t.check('the card is at most 27rem wide', all(w <= 432.5 for w in widths), widths)
    btn = pg.locator('form').first.locator('button[type="submit"]')
    t.check('the sign-in button spans the card', abs(btn.bounding_box()['width'] - pg.locator('form .tray-stack').first.bounding_box()['width']) < 1)


def test_parity_reveal(t):
    out = []
    for react in (False, True):
        pg = t.open(react=react)
        root = t.cell(pg, 'SignIn') if react else pg.locator('form').first
        btn, field = root.locator('.tray-input-group__btn'), root.locator('input[autocomplete="current-password"]')  # React draws its own button, with no data-tray
        btn.click()
        got = [field.get_attribute('type'), t.ax(btn)['name'], t.ax(btn).get('pressed')]
        btn.click()
        out.append(got + [field.get_attribute('type'), t.ax(btn).get('pressed')])
    t.eq('React: the reveal button answers as the HTML one does', out[1], out[0])


PARITY = [('form >> nth=0', 'SignIn', 'form'), ('form >> nth=1 >> .tray-alert', 'CreateAccount', '.tray-alert')]


# Static parity (trayui-react/static): the reveal button carries data-tray="reveal" there, and bundle.js shows the password.
STATIC = True
STATIC_SKIP = {'SignIn: button "Sign in"': "the form calls onSubmit in React; a static form is sent as a form is, which the page's own script must stop (K3)"}
