"""Usage Meter: README.md. Each row is a Progress with role="meter", named by its aria-label, with aria-valuemin, -max and
-now in the units of its words and an aria-valuetext with those words ("842 of 1,000"); data-level="high" turns the value to
danger and has a tray-progress__note with an icon and words; the bar stays ink; an unlimited allowance is a line of text;
with forced colours the bar is drawn in the system's colours."""


def meters(pg, root='body'):
    return pg.evaluate('''(root) => [...document.querySelector(root).querySelectorAll('[role="meter"]')].map(m => [m.getAttribute('aria-label'), m.getAttribute('aria-valuemin'),
        m.getAttribute('aria-valuemax'), m.getAttribute('aria-valuenow'), m.getAttribute('aria-valuetext'), m.closest('.tray-progress').querySelector('.tray-progress__value').textContent.trim()])''', root)


def test_tree(t):
    pg = t.open()
    t.match_tree('each limit is a meter named by its label; the unlimited one is text', pg.locator('.tray-usage').first, '''
- text: Orders this month 842 of 1,000
- meter "Orders this month"
- text: Team seats 5 of 5
- meter "Team seats"
- text: Every seat is taken. Add seats to invite more people. Label storage 1.2 of 5 GB
- meter "Label storage"
- text: API requests Unlimited on this plan
''')
    m = meters(pg)
    t.check('every meter counts in the units of its words', all(x[1] == '0' for x in m) and [x[2:4] for x in m[:3]] == [['1000', '842'], ['5', '5'], ['5', '1.2']], m)
    # Chrome's DevTools protocol reports aria-valuetext as empty, so the attribute is read
    t.check('and says those words in aria-valuetext', all(x[4] == x[5] for x in m), [(x[4], x[5]) for x in m])


def test_level(t):
    pg = t.open()
    hi = pg.locator('[data-level="high"]')
    plain = pg.locator('.tray-usage > .tray-progress').first
    t.check('a limit that is near turns its value to danger', t.style(hi.locator('.tray-progress__value'), 'color') != t.style(plain.locator('.tray-progress__value'), 'color'))
    t.check('and has a note with an icon and words', hi.locator('.tray-progress__note svg[aria-hidden="true"]').count() == 1 and 'Every seat is taken' in hi.locator('.tray-progress__note').inner_text())
    t.eq('the bar stays ink', t.style(hi.locator('.tray-progress__bar'), 'background-color', pseudo='::before'), t.style(plain.locator('.tray-progress__bar'), 'background-color', pseudo='::before'))


def test_forced(t):
    pg = t.open(forced=True)
    sc = t.system_colors(pg)
    bar = pg.locator('[role="meter"]').first
    t.eq('with forced colours the track is Canvas and the fill CanvasText', (t.style(bar, 'background-color'), t.style(bar, 'background-color', pseudo='::before')), (sc['Canvas'], sc['CanvasText']))


def test_react_values(t):
    pg = t.open_react()
    m = meters(pg, '[data-cell="OnACard"]')
    t.check('react: every meter says its words in aria-valuetext', m and all(x[4] == x[5] for x in m), [(x[0], x[4], x[5]) for x in m])



PARITY = [('.tray-usage', 'OnACard', '.tray-usage'),
          ('.tray-usage--sm', 'SidebarFoot', '.tray-usage--sm')]
