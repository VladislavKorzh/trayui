"""Alert: README.md. role="alert" for the error that follows an action and role="status" for the rest; the icon is
decoration (its <svg> aria-hidden), the title says what happened; the alert never takes focus, and the buttons in
tray-alert__actions wait in the normal tab order."""


def test_tree(t):
    pg = t.open()
    t.match_tree('a status, an alert with its two buttons, a status and the accent status with its button', pg.locator('.tray-demo'), '''
- status:
  - paragraph: The farm shop is closed on Mondays
  - paragraph: Pickup orders placed today are ready from Tuesday at ten.
- alert:
  - paragraph: The card was declined
  - paragraph: Nothing was charged. Try another card, or pay on delivery.
  - button "Try another card"
  - button "Pay on delivery"
- status:
  - paragraph: Order PL-20418 is paid
- status:
  - paragraph: 132 jars of the autumn batch are left
  - button "Order a jar"
''')
    t.eq('the danger alert is the only role="alert"', pg.evaluate('[...document.querySelectorAll(".tray-alert")].map(a => a.getAttribute("role")).join()'), 'status,alert,status,status')
    t.check('every icon is aria-hidden', pg.evaluate('[...document.querySelectorAll(".tray-alert__icon svg")].every(s => s.getAttribute("aria-hidden") === "true")'))
    t.eq('the icon tile says nothing to a screen reader', t.ax(pg.locator('.tray-alert__icon')).get('name'), '')


def test_focus(t):
    pg = t.open()
    t.check('no alert takes focus', pg.evaluate('[...document.querySelectorAll(".tray-alert")].every(a => a.tabIndex < 0 && !a.hasAttribute("tabindex"))'))
    order = [f['text'] for f in t.tab_through(pg, 3)]
    t.eq('Tab reaches the buttons of the alerts in reading order', order, ['Try another card', 'Pay on delivery', 'Order a jar'])


def test_colour(t):
    pg = t.open()
    ink = t.style(pg.locator('.tray-alert').first, 'color')
    danger = t.style(pg.locator('.tray-alert--danger .tray-alert__title'), 'color')
    success = t.style(pg.locator('.tray-alert--success .tray-alert__title'), 'color')
    t.check('the danger and success titles take their colours (repeating the words)', danger != ink and success != ink and danger != success, f'{ink} {danger} {success}')


PARITY = [('.tray-demo', 'Tones', '.tray-stack')]
