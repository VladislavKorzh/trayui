"""Cookie Consent: README.md. A <section> named by its heading (a region called "Cookies"); it does not hold focus or block
the page; each kind is an <input type="checkbox" role="switch"> in its label, the necessary one disabled and on; the three
answers are buttons: "all" checks every box, "necessary" clears every box that is not disabled, "save" keeps them as set;
each closes the panel and fires tray:complete with { choice } (each checkbox's name and whether it is on); focus moves on
to the next control after the panel in the page, or to <main> when nothing follows."""

AFTER = """h => h.insertAdjacentHTML('beforeend', '<p><button type="button" id="after">After the panel</button></p>')"""


def test_tree(t):
    pg = t.open()
    t.match_tree('a region called Cookies, with its switches and its three answers', pg.locator('.tray-consent'), '''
- region "Cookies":
  - heading "Cookies" [level=2]
  - paragraph: /^We keep you signed in/
  - group:
    - switch /^Necessary/ [checked] [disabled]
    - switch /^Statistics/
  - button "Only necessary"
  - button "Accept all"
  - button "Save my choice"
''')
    t.check('it is not modal: nothing says so and the page is not inert', pg.evaluate('!document.querySelector(".tray-consent").closest("[aria-modal], dialog") && !document.querySelector("[inert]")'))


def answer(t, pg, root, label, setup=None):
    if setup:
        setup()
    t.clear_events(pg)
    root.get_by_role('button', name=label).focus()
    pg.keyboard.press('Enter')
    ev = t.events(pg, 'tray:complete')
    return ev[-1]['detail'] if ev else None


def drive(t, pg, root, host, p=''):
    host.evaluate(AFTER)  # a control after the panel, where focus should go
    stats = root.get_by_role('switch', name='Statistics')
    root.get_by_role('switch', name='Statistics').focus()
    pg.keyboard.press('Space')
    t.check(p + 'Space turns a switch on', stats.is_checked())
    d = answer(t, pg, root, 'Only necessary')
    t.eq(p + '"Only necessary" clears every box but the necessary one, and reports it', d, {'choice': {'necessary': True, 'statistics': False}})
    t.check(p + 'the answer closes the panel', not root.locator('.tray-consent').first.is_visible() if root.locator('.tray-consent').count() else not root.is_visible())
    f = t.focused(pg)
    t.eq(p + 'focus moves on to the next control after the panel', f['id'], 'after')


def test_answers(t):
    pg = t.open()
    drive(t, pg, pg.locator('.tray-consent'), pg.locator('.tray-demo'))
    pg = t.open()
    t.eq('"Accept all" checks every box', answer(t, pg, pg.locator('.tray-consent'), 'Accept all'), {'choice': {'necessary': True, 'statistics': True}})
    pg = t.open()
    root = pg.locator('.tray-consent')
    d = answer(t, pg, root, 'Save my choice', lambda: root.get_by_role('switch', name='Statistics').check())
    t.eq('"Save my choice" keeps them as set', d, {'choice': {'necessary': True, 'statistics': True}})
    t.eq('the event fires on the panel', t.events(pg, 'tray:complete')[-1]['target'], 'section[data-tray="consent"]')


def test_rescue_main(t):
    pg = t.open()
    # nothing follows the panel, but the page has a <main>: focus goes there, so it is not dropped to the top of the page
    pg.evaluate("document.querySelector('.tray-demo').insertAdjacentHTML('beforeend', '<main id=\"m\"><p>The shop</p></main>')")
    answer(t, pg, pg.locator('.tray-consent'), 'Accept all')
    f = t.focused(pg)
    t.eq('with nothing after it, focus moves to <main>', (f['tag'], f['id']), ('main', 'm'))


def test_parity_answer(t):
    pg = t.open_react()
    cell = t.cell(pg, 'FirstVisit')
    cell.get_by_role('button', name='Accept all').click()
    try:
        pg.wait_for_function('() => document.querySelector(\'[data-cell="FirstVisit"]\').innerText.includes("Saved")', timeout=1500)
    except Exception:
        pass
    t.eq('react: the answer reaches onComplete', cell.inner_text().strip(), 'Saved: necessary on, statistics on.')
    pg = t.open_react()
    cell = t.cell(pg, 'ChooseWhich')
    drive(t, pg, cell, cell, 'react: ')


def test_fixed(t):
    for rtl in (False, True):
        pg = t.open(width=1440, rtl=rtl)
        box = pg.evaluate("""() => { const c = document.querySelector('.tray-consent'); c.classList.add('tray-consent--fixed'); const r = c.getBoundingClientRect();
            return { pos: getComputedStyle(c).position, left: r.left, right: innerWidth - r.right, bottom: innerHeight - r.bottom }; }""")
        corner = box['right'] if rtl else box['left']
        t.check(f'tray-consent--fixed pins the panel to the bottom start corner{" (right to left)" if rtl else ""}', box['pos'] == 'fixed' and corner <= 24 and box['bottom'] <= 24, box)
        pg.close()


PARITY = [('.tray-consent', 'ChooseWhich', '.tray-consent')]
