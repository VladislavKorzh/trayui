"""Button Group: README.md. A role="group" named by aria-label; Tab reaches each button; icon buttons have aria-labels.
The stepper (data-tray="stepper"): its <output> is a live status, its buttons are named, it counts between data-min and
data-max, the button that would pass a limit becomes disabled and, if it had focus, focus moves to the group (rescue);
tray:change carries detail.value; the number bumps, and not under reduced motion. --sm items are 44px."""

STEP = '[data-tray="stepper"]'


def test_tree(t):
    pg = t.open()
    t.match_tree('a named group of named buttons', pg.locator('[aria-label="Message actions"]'), '''
- group "Message actions":
  - button "Reply"
  - button "Forward"
  - button "Archive"
''')
    t.match_tree('the stepper: a group, two named buttons and a status', pg.locator(STEP), '''
- group "Quantity":
  - button "One fewer"
  - status: "2"
  - button "One more"
''')
    t.match_tree('icon-only buttons are named by their aria-label', pg.locator('[aria-label="File actions"]'), '''
- group "File actions":
  - button "Copy"
  - button "Download"
  - button "Share"
  - button "Delete"
''')
    out = t.ax(pg.locator(f'{STEP} output'))
    t.eq('the output is a live status', (out['role'], out.get('live')), ('status', 'polite'))
    for label in ('Message actions', 'Quantity', 'File actions', 'Save', 'Zoom'):
        t.eq(f'the group "{label}" has role group', t.ax(pg.locator(f'[aria-label="{label}"]'))['role'], 'group')


def drive(t, pg, root, out, who=''):
    """Drive a stepper that starts at 2, between 1 and 9; returns nothing, checks as it goes."""
    t.clear_events(pg)
    minus, plus = root.locator('[data-step="-1"]'), root.locator('[data-step="1"]')
    plus.focus()
    pg.keyboard.press('Enter')
    t.eq(who + 'Enter on "One more" counts up', out.inner_text(), '3')
    ev = [e['detail'] for e in t.events(pg, 'tray:change')]
    t.eq(who + 'it fires tray:change with detail.value', ev[-1:] if ev else ev, [{'value': 3}])
    for _ in range(6):
        pg.keyboard.press('Space')
    t.eq(who + 'it stops at data-max', out.inner_text(), '9')
    t.check(who + 'at data-max "One more" is disabled', plus.is_disabled())
    t.check(who + 'and focus, which was on it, moves to the group, not to the page', not t.lost_focus(pg) and root.evaluate('e => e === document.activeElement'), t.focused(pg))
    pg.keyboard.press('Tab')
    t.check(who + 'Tab goes on from the group', t.focused(pg)['label'] != 'One more' and not t.lost_focus(pg), t.focused(pg))
    minus.click()
    t.check(who + 'below the max "One more" works again', not plus.is_disabled() and out.inner_text() == '8', out.inner_text())
    minus.focus()
    for _ in range(9):
        if minus.is_disabled():
            break
        pg.keyboard.press('Enter')
    t.eq(who + 'it stops at data-min', out.inner_text(), '1')
    t.check(who + 'at data-min focus moves from "One fewer" to the group', minus.is_disabled() and not t.lost_focus(pg) and root.evaluate('e => e === document.activeElement'), t.focused(pg))


def test_stepper(t):
    pg = t.open()
    root = pg.locator(STEP)
    drive(t, pg, root, root.locator('output'))
    t.eq('Tab reaches each button of a group in turn', [f['label'] or f['text'] for f in (pg.locator('[aria-label="Message actions"] button').first.focus(), t.tab_through(pg, 2))[1]], ['Forward', 'Archive'])


def test_targets(t):
    pg = t.open()
    for b in pg.locator('.tray-btn-group--sm .tray-btn-group__item').all():
        h = b.evaluate('e => e.getBoundingClientRect().height')
        t.check(f'the small item "{b.get_attribute("aria-label") or b.inner_text()}" is 44px', round(h) >= 44, h)


def test_motion(t):
    pg = t.open(motion='no-preference')
    root = pg.locator(STEP)
    root.locator('[data-step="1"]').click()
    t.check('the number bumps when it changes', 'tray-bump' in t.style(root.locator('output'), 'animation-name'), t.motion(root.locator('output')))
    pg = t.open()
    root = pg.locator(STEP)
    root.locator('[data-step="1"]').click()
    t.eq('under reduced motion the number changes without its bump', t.style(root.locator('output'), 'animation-name'), 'none')


def test_parity_stepper(t):
    """The React stepper counts, stops, disables and rescues focus as the HTML one does."""
    pg = t.open_react()
    root = t.cell(pg, 'Groups').locator('[aria-label="Quantity"]')
    t.match_tree('react: the stepper is a group, two named buttons and a status', root, '''
- group "Quantity":
  - button "One fewer"
  - status: "2"
  - button "One more"
''')
    drive(t, pg, root, root.locator('output'), 'react: ')


PARITY = [
    ('[aria-label="Message actions"]', 'Groups', '[aria-label="Message actions"]'),
    ('[aria-label="File actions"]', 'Groups', '[aria-label="File actions"]'),
    ('[aria-label="Save"]', 'Groups', '[aria-label="Save"]'),
    ('[aria-label="Zoom"]', 'Groups', '[aria-label="Zoom"]'),
    ('[aria-label="Quantity"]', 'Groups', '[aria-label="Quantity"]'),
]
