"""Alert Dialog: README.md. A <dialog role="alertdialog"> named by its title (aria-labelledby) and described by its sentence
(aria-describedby); no close button in the corner; a click on the veil does not close it; focus starts on the safe button
(autofocus, or, opened with data-tray="open" and no autofocus in the markup, the data-close button that is not danger);
Tab moves between the buttons; Escape closes it and focus returns to the opener; with data-static the first two presses of
Escape do nothing and the third closes it, with an empty returnValue (Chrome 157, the browser of these tests). Under
reduced motion it only fades, in 0.1s."""

SETUP = '''(st) => { const d = document.querySelector('[role=alertdialog]'); d.close(); d.id = 'ad'; if (st) d.setAttribute('data-static', '');
  document.body.append(d);
  const b = document.createElement('button'); b.type = 'button'; b.className = 'tray-btn tray-btn--danger'; b.id = 'opener';
  b.textContent = 'Delete order'; b.dataset.tray = 'open'; b.dataset.target = '#ad';
  document.querySelector('.tray-demo').prepend(b); TrayUI.init(b); }'''


def open_modal(t, static=False):
    pg = t.open()
    pg.evaluate(SETUP, static)
    pg.click('#opener')
    return pg, pg.locator('#ad')


def test_tree(t):
    pg = t.open()
    d = pg.locator('[role=alertdialog]')
    a = t.ax(d)
    t.eq('an alertdialog named by its title', (a['role'], a['name']), ('alertdialog', 'Delete order PL-20418?'))
    t.eq('described by its sentence', a['description'], 'The order and its messages are removed for good. The customer is not told.')
    t.match_tree('no close button in the corner: two buttons that say their outcome', d, '''
- alertdialog "Delete order PL-20418?":
  - heading "Delete order PL-20418?" [level=2]
  - paragraph: The order and its messages are removed for good. The customer is not told.
  - button "Keep the order"
  - button "Delete order"
''')
    t.eq('no button named Close', d.get_by_role('button', name='Close').count(), 0)


def test_keys(t):
    pg, d = open_modal(t)
    t.check('opened with data-tray="open" it is modal', d.evaluate('d => d.matches(":modal")'))
    t.eq('focus starts on the safe button, though the markup has no autofocus', t.focused(pg)['text'], 'Keep the order')
    t.check('the page behind it is inert', t.ax(pg.locator('#opener'))['ignored'])
    t.scan(pg, 'Light, opened over the page')
    pg.keyboard.press('Tab')
    t.eq('Tab moves to the other button', t.focused(pg)['text'], 'Delete order')
    pg.mouse.click(4, 4)
    pg.wait_for_timeout(60)
    t.check('a click on the veil does not close it', d.evaluate('d => d.open'))
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('Escape closes it', not d.evaluate('d => d.open'))
    t.check('and focus returns to the opener', pg.locator('#opener').evaluate('b => b === document.activeElement'), t.focused(pg))
    pg.click('#opener')
    pg.click('#ad [value="delete"]')
    t.settle(pg)
    t.eq('the danger button closes it with its value', d.evaluate('d => d.returnValue'), 'delete')


def test_autofocus(t):
    pg = t.open()
    pg.evaluate(SETUP, False)
    pg.evaluate('() => document.querySelector("#ad .tray-btn--danger").setAttribute("autofocus", "")')
    pg.click('#opener')
    t.eq('autofocus in the markup decides where focus starts', t.focused(pg)['text'], 'Delete order')


def test_static(t):
    pg, d = open_modal(t, static=True)
    states = []
    for _ in range(3):
        pg.keyboard.press('Escape')
        pg.wait_for_timeout(60)
        states.append(d.evaluate('d => d.open'))
    t.eq('with data-static the first two presses of Escape do nothing and the third closes it', states, [True, True, False])
    t.eq('then it closes with an empty returnValue', d.evaluate('d => d.returnValue'), '')


def test_motion(t):
    pg, d = open_modal(t)
    anims = [a for a in t.running_animations(pg) if 'tray-dialog' in str(a['target'])]
    names = {a['name'] for a in anims}
    t.check('reduced motion: it only fades', 'opacity' in names and not names & {'translate', 'scale'}, names)
    t.check('in a tenth of a second', max([a['duration'] for a in anims] or [0]) <= 100, anims)


PARITY = [('.tray-stage', 'Delete', '.tray-stage')]


def test_parity_modal(t):
    r = t.open_react()
    cell = t.cell(r, 'NothingDestroyed')
    opener = cell.get_by_role('button', name='Send the receipts')
    d = cell.locator('dialog[role=alertdialog]').first
    opener.click()
    t.check('react: the trigger opens a modal alert dialog', d.evaluate('d => d.matches(":modal")'))
    a = t.ax(d)
    t.eq('react: named by its title and described by its sentence', (a['role'], a['name'], a['description']),
         ('alertdialog', 'Send 214 receipts?', 'Every customer of the autumn batch gets an email now. It cannot be called back.'))
    t.eq('react: focus starts on the safe button', t.focused(r)['text'], 'Not now')
    r.mouse.click(4, 4)
    r.wait_for_timeout(60)
    t.check('react: a click on the veil does not close it', d.evaluate('d => d.open'))
    r.keyboard.press('Escape')
    t.settle(r)
    t.check('react: Escape closes it', not d.evaluate('d => d.open'))
    t.check('react: focus returns to the trigger', opener.evaluate('b => b === document.activeElement'), t.focused(r))
