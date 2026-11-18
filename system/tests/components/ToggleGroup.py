"""Toggle Group: README.md. One choice is a role="radiogroup" of real radios named by its aria-label: Tab reaches the
group at the chosen segment, the arrow keys move the choice and pass over a disabled one. Several choices are checkboxes in
a role="group": Tab moves between them, Space turns each on or off. Icon-only segments are named by the aria-label of
their input. The chosen one is solid ink (a pill that slides to it, at once under reduced motion), and with forced colours
it takes the system's colours for a chosen item. Focus draws a 3px ink ring round the segment."""


def test_tree(t):
    pg = t.open()
    t.match_tree('a radiogroup of radios, the chosen one checked', pg.locator('[aria-label="Jar size"]'), '''
- radiogroup "Jar size":
  - radio "30 g"
  - radio "50 g" [checked]
  - radio "100 g"
''')
    t.match_tree('several choices: a group of checkboxes named by their aria-label', pg.locator('[aria-label="Text style"]'), '''
- group "Text style":
  - checkbox "Bold" [checked]
  - checkbox "Italic"
  - checkbox "Underline" [checked]
''')
    t.match_tree('a disabled segment is disabled', pg.locator('[aria-label="Period"]'), '''
- radiogroup "Period":
  - radio "Day"
  - radio "Week" [checked]
  - radio "Month"
  - radio "Year" [disabled]
''')


def drive(t, pg, scope, who=''):
    jar = scope.locator('[aria-label="Jar size"]')
    period = scope.locator('[aria-label="Period"]')
    style = scope.locator('[aria-label="Text style"]')
    jar.get_by_role('radio', name='30 g').focus()
    pg.keyboard.press('Shift+Tab')
    pg.keyboard.press('Tab')
    t.eq(who + 'Tab reaches the group at the chosen segment', t.ax(pg.locator(':focus'))['name'], '50 g')
    pg.keyboard.press('ArrowRight')
    t.check(who + 'ArrowRight moves the choice', jar.get_by_role('radio', name='100 g', exact=True).is_checked())
    period.get_by_role('radio', name='Month').click()
    pg.keyboard.press('ArrowRight')
    t.check(who + 'the arrow keys pass over a disabled segment', period.get_by_role('radio', name='Day').is_checked(), t.focused(pg))
    style.get_by_role('checkbox', name='Bold').focus()
    pg.keyboard.press('Tab')
    t.eq(who + 'Tab moves between the checkboxes of a group', t.ax(pg.locator(':focus'))['name'], 'Italic')
    pg.keyboard.press('Space')
    t.check(who + 'Space turns a checkbox segment on', style.get_by_role('checkbox', name='Italic').is_checked())


def test_keys(t):
    pg = t.open()
    drive(t, pg, pg.locator('body'))
    span = pg.locator('.tray-seg input:focus-visible + span')
    t.check('the focused segment draws a 3px ring round it', span.count() == 1 and t.style(span, 'outline-width') == '3px', span.count())


def test_pill(t):
    pg = t.open(motion='no-preference')
    jar = pg.locator('[aria-label="Jar size"]')
    t.check('the chosen segment has the sliding ink pill', jar.evaluate('e => e.hasAttribute("data-glide") && !!e.querySelector(":scope > .tray-glide")'))
    jar.get_by_role('radio', name='100 g').check()
    pg.wait_for_timeout(30)
    t.check('the pill slides to the next one chosen', 'translate' in t.style(jar.locator('.tray-glide'), 'transition-property'), t.motion(jar.locator('.tray-glide')))
    x = lambda: jar.locator('.tray-glide').evaluate('e => e.style.getPropertyValue("--tray-glide-x")')
    t.settle(pg)
    target = jar.evaluate('e => { const s = e.querySelector("input:checked + span"); return (s.getBoundingClientRect().left - e.getBoundingClientRect().left - e.clientLeft + e.scrollLeft) + "px"; }')
    t.eq('and ends under the chosen segment', x(), target)
    pg = t.open()
    jar = pg.locator('[aria-label="Jar size"]')
    jar.get_by_role('radio', name='100 g').check()
    t.eq('under reduced motion the pill moves at once', t.style(jar.locator('.tray-glide'), 'transition-duration').split(',')[0].strip(), '0s')


def test_forced(t):
    pg = t.open(forced=True)
    sc = t.system_colors(pg)
    on = t.style(pg.locator('[aria-label="Jar size"] input:checked + span'), 'background-color', 'color')
    t.eq('with forced colours the chosen segment takes SelectedItem and SelectedItemText', (on['background-color'], on['color']), (sc['SelectedItem'], sc['SelectedItemText']))
    t.eq('and the strip keeps an edge', t.style(pg.locator('[aria-label="Jar size"]'), 'border-top-style'), 'solid')


def test_parity_keys(t):
    pg = t.open_react()
    drive(t, pg, pg.locator('#root'), 'react: ')


PARITY = [
    ('[aria-label="Jar size"]', 'Variants', '[aria-label="Jar size"]'),
    ('[aria-label="View"]', 'Variants', '[aria-label="View"]'),
    ('[aria-label="Text style"]', 'Variants', '[aria-label="Text style"]'),
    ('[aria-label="Period"]', 'FullWidth', '[aria-label="Period"]'),
]
