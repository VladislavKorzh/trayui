"""Changelog: README.md. An ordered list (with role="list") of releases, newest first, each with a heading of its own and its
date in a <time datetime>; the tags are Badges, at most one yellow "New" on a screen; the date and version sit in an 11rem
column at the start edge and move above the entry below 40rem."""


def test_tree(t):
    pg = t.open()
    t.match_tree('a list of releases, each with its date, version, tags, heading and changes', pg.locator('.tray-changelog'), '''
- list:
  - listitem:
    - time: 12 November 2026
    - text: Version 3.4 New
    - heading "Courier labels in one click" [level=3]
    - paragraph: /^Open an order and press Print/
    - list:
      - listitem: Works with both label sizes.
      - listitem: Reprints are counted, not charged.
  - listitem:
    - time: 28 October 2026
    - text: Version 3.3 Improved Fixed
    - heading "A faster orders page" [level=3]
    - list:
      - listitem: /twice as fast/
      - listitem: /Filters stay on/
      - listitem: /^Fixed:/
''')
    t.eq('the list keeps its role without markers', pg.get_attribute('.tray-changelog', 'role'), 'list')
    t.eq('every date is a <time> with a datetime', pg.evaluate('[...document.querySelectorAll(".tray-release__meta time")].map(e => e.getAttribute("datetime"))'), ['2026-11-12', '2026-10-28'])
    t.check('newest first', pg.evaluate('(() => { const d = [...document.querySelectorAll(".tray-release__meta time")].map(e => e.getAttribute("datetime")); return d.join() === [...d].sort().reverse().join(); })()'))
    t.eq('one yellow tag at most', pg.locator('.tray-badge--accent').count(), 1)


def test_layout(t):
    pg = t.open(width=1440)
    m = pg.evaluate('(() => { const a = document.querySelector(".tray-release__meta").getBoundingClientRect(), b = document.querySelector(".tray-release__body").getBoundingClientRect(); return [a.right <= b.left, Math.round(a.width)]; })()')
    t.check('wide, the date sits in an 11rem column at the start edge', m[0] and m[1] <= 176, m)
    pg.close()
    pg = t.open(width=390)
    t.check('below 40rem it moves above the entry', pg.evaluate('(() => { const a = document.querySelector(".tray-release__meta").getBoundingClientRect(), b = document.querySelector(".tray-release__body").getBoundingClientRect(); return a.bottom <= b.top; })()'))
    pg.close()
    pg = t.open(width=1440, rtl=True)
    t.check('right to left, the date column is on the right', pg.evaluate('(() => { const a = document.querySelector(".tray-release__meta").getBoundingClientRect(), b = document.querySelector(".tray-release__body").getBoundingClientRect(); return a.left >= b.right; })()'))


PARITY = [('.tray-changelog', 'Releases', '.tray-changelog')]
