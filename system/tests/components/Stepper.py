"""Stepper: README.md. An <ol role="list"> named by its aria-label; the current step carries aria-current="step" and is
solid ink and semibold; a finished one shows a check and says ", done" in a tray-vh span; a finished step may be a link
that takes focus, a step ahead is plain text that takes none; below 34rem a row of steps shows the words of the current
step only, the others hidden from the eye and not from a screen reader; with forced colours the current mark takes the
system's colours for a chosen item."""


def test_tree(t):
    pg = t.open()
    t.match_tree('a named list of steps, the finished one a link that says it is done', pg.locator('.tray-stepper').first, '''
- list "Checkout":
  - listitem:
    - link /Cart ?, done/
  - listitem: Delivery
  - listitem: Payment
  - listitem: Review
''')
    t.eq('the current step carries aria-current="step"', pg.locator('.tray-stepper').first.locator('[aria-current]').get_attribute('aria-current'), 'step')
    t.match_tree('the vertical stepper', pg.locator('.tray-stepper--v'), '''
- list "Set up the workspace":
  - listitem:
    - link /Farm details ?, done/
  - listitem:
    - link /Products ?, done/
  - listitem: /Delivery/
  - listitem: Invite the team
''')
    ink = pg.evaluate('() => { const i = document.createElement("i"); i.style.color = "var(--ink)"; document.body.append(i); const v = getComputedStyle(i).color; i.remove(); return v; }')
    mark = pg.locator('.tray-stepper').first.locator('[aria-current="step"] .tray-step__mark')
    t.eq('the current mark is solid ink', t.style(mark, 'background-color'), ink)
    t.eq('the current step is semibold', t.style(pg.locator('.tray-stepper').first.locator('[aria-current="step"] .tray-step__text'), 'font-weight'), '600')
    t.check('a step ahead takes no focus', pg.locator('.tray-stepper li:not([data-done]) :is(a, button, [tabindex])').count() == 0)
    t.eq('a finished step is a link that takes focus', pg.locator('.tray-stepper').first.locator('li[data-done] a').evaluate('e => e.tabIndex'), 0)


def test_phone(t):
    pg = t.open(width=390)
    first = pg.locator('.tray-stepper').first
    shown = first.evaluate('''e => [...e.querySelectorAll('.tray-step__text')].map(s => { const r = s.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(s).clipPath === 'none'; })''')
    t.eq('below 34rem a row of steps shows the words of the current step only', shown, [False, True, False, False])
    t.match_tree('and the others are still read', first, '''
- list "Checkout":
  - listitem:
    - link /Cart ?, done/
  - listitem: Delivery
  - listitem: Payment
  - listitem: Review
''')


def test_forced(t):
    pg = t.open(forced=True)
    sc = t.system_colors(pg)
    c = t.style(pg.locator('.tray-stepper').first.locator('[aria-current="step"] .tray-step__mark'), 'background-color', 'color')
    t.eq('with forced colours the current mark takes SelectedItem', (c['background-color'], c['color']), (sc['SelectedItem'], sc['SelectedItemText']))


PARITY = [
    ('.tray-stepper:not(.tray-stepper--v)', 'Checkout', '.tray-stepper'),
    ('.tray-stepper--v', 'Vertical', '.tray-stepper'),
]
