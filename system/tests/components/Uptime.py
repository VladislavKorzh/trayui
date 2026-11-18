"""Uptime: README.md. data-tray="uptime" draws one bar per day, oldest first; data-incidents keys count days back from today,
"degraded" or "down"; the behaviour sets aria-hidden="true" on the bars, so a screen reader reads only the head, the foot and
the list of incidents; nothing takes focus; a normal day is a quiet grey bar, a slow day a short ink bar, an outage a full
ink bar (shape and lightness, not hue); with forced colours the bars keep their own fills."""


def bars(pg, i=0):
    return pg.evaluate('''(i) => { const b = document.querySelectorAll('[data-tray="uptime"]')[i];
        return { n: b.children.length, hidden: b.getAttribute('aria-hidden'), s: [...b.children].map((c, k) => c.dataset.s ? [k, c.dataset.s] : null).filter(Boolean),
                 h: [...b.children].map(c => Math.round(c.getBoundingClientRect().height)), bg: [...b.children].map(c => getComputedStyle(c).backgroundColor) }; }''', i)


def test_bars(t):
    pg = t.open()
    b = bars(pg)
    t.eq('one bar per day, 90 of them', b['n'], 90)
    t.eq('the bars are hidden from assistive technology', b['hidden'], 'true')
    # keys count days back from today, and the bars run oldest first: day k back is bar 89 - k (47 down is bar 42, 48 slow bar 41)
    t.eq('the incidents fall on their days, counted back from today', b['s'], [[41, 'degraded'], [42, 'down'], [77, 'degraded']])
    t.eq('day 0 is the last bar', [x for x in bars(pg, 1)['s'] if x[0] == 89], [[89, 'degraded']])
    normal, slow, down = b['h'][0], b['h'][77], b['h'][42]
    t.check('a slow day is a short bar, an outage a full one', slow < normal and down == normal, (normal, slow, down))
    t.check('an outage is ink and a normal day a quiet grey: lightness, not hue', b['bg'][42] != b['bg'][0] and b['bg'][77] == b['bg'][42], (b['bg'][0], b['bg'][42]))


def test_tree(t):
    pg = t.open()
    t.match_tree('a screen reader reads the head, the foot, the key and the incidents', pg.locator('.tray-demo'), '''
- text: Order API Working 90 days ago 99.94% up Today Courier tracking Slow since 09:40 90 days ago 99.71% up Today
- list:
  - listitem: A normal day
  - listitem: Slow for part of the day
  - listitem: Down for part of the day
- list:
  - listitem: /Order API was down for 18 minutes/
  - listitem: /Courier tracking was slow for 2 hours/
''')
    t.check('the state has an icon, aria-hidden, and a word', pg.evaluate('[...document.querySelectorAll(".tray-uptime__state")].every(s => s.querySelector("svg[aria-hidden=true]") && s.textContent.trim())'))
    t.eq('nothing in it takes focus', pg.evaluate('document.querySelectorAll(".tray-uptime a, .tray-uptime button, .tray-uptime [tabindex]").length'), 0)


def test_forced(t):
    pg = t.open(forced=True)
    b = bars(pg)
    sc = t.system_colors(pg)
    t.check('with forced colours the bars keep their own fills, so the days can still be told apart', b['bg'][0] != b['bg'][42] and b['bg'][0] not in sc.values(), (b['bg'][0], b['bg'][42]))


def test_react_bars(t):
    pg = t.open_react()
    cell = t.cell(pg, 'StatusPage')
    b = cell.locator('.tray-uptime__bars').first.evaluate('b => ({ n: b.children.length, hidden: b.getAttribute("aria-hidden"), s: [...b.children].map((c, k) => c.dataset.s ? [k, c.dataset.s] : null).filter(Boolean) })')
    t.eq('react: the same 90 bars, the incidents on the same days, hidden', (b['n'], b['hidden'], b['s']), (90, 'true', [[41, 'degraded'], [42, 'down'], [77, 'degraded']]))


PARITY = [('.tray-uptime:nth-of-type(1)', 'StatusPage', '.tray-uptime:nth-of-type(1)'),
          ('.tray-items', 'StatusPage', '.tray-items')]
