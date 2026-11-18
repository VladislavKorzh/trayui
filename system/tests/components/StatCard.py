"""Stat Card: README.md. Plain text read in order (label, figure, foot); the trend's arrow is aria-hidden so the sign in its
text carries the direction; data-tone only colours it; the spark line is aria-hidden decoration drawn from data-points; a
card written as <a class="tray-stat"> is one link whose name is all its text, and focus draws the 3px ink ring round the
whole card."""


def test_tree(t):
    pg = t.open()
    t.match_tree('the first card reads label, figure, then the foot with the sign of the change', pg.locator('.tray-stat').first, '''
- paragraph: Revenue this month
- paragraph: $18,240
- paragraph: +14% than in October
''')
    t.check('every trend arrow is aria-hidden', pg.evaluate('[...document.querySelectorAll(".tray-trend .tray-icon")].every(i => i.getAttribute("aria-hidden") === "true")'))
    link = pg.locator('a.tray-stat')
    t.eq('a card that is a link is one link named by all its text', t.ax(link)['name'], 'Average order $21.66 No change since October')


def test_spark(t):
    pg = t.open()
    sp = pg.evaluate('''[...document.querySelectorAll('[data-tray="spark"]')].map(e => { const s = e.querySelector('svg'); const p = s && s.querySelector('path');
        return [e.getAttribute('data-points').split(',').length, s ? s.getAttribute('aria-hidden') : null, p ? (p.getAttribute('d').match(/[ML]/g) || []).length : 0]; })''')
    t.check('every spark is drawn, one point per value, and aria-hidden', sp and all(n == m and h == 'true' for n, h, m in sp), sp)
    t.check('the spark takes the width of its card', pg.evaluate('(() => { const s = document.querySelector(".tray-spark"); return Math.abs(s.getBoundingClientRect().width - s.closest(".tray-stat").clientWidth + 2 * parseFloat(getComputedStyle(s.closest(".tray-stat")).paddingLeft)) < 2; })()'))


def test_tone(t):
    pg = t.open()
    good, bad, plain = (t.style(pg.locator(s).first, 'color') for s in ('.tray-trend[data-tone="good"]', '.tray-trend[data-tone="bad"]', '.tray-inverse .tray-trend'))
    t.check('data-tone colours the trend: good and bad differ', good != bad, (good, bad))
    t.check('a falling count can be good: Refunds −2 takes the good tone', pg.evaluate('(() => { const r = [...document.querySelectorAll(".tray-stat")].find(s => s.textContent.startsWith("Refunds")); return r.querySelector(".tray-trend").dataset.tone === "good" && r.querySelector(".tray-trend").textContent.includes("−"); })()'))


def test_focus(t):
    pg = t.open()
    link = pg.locator('a.tray-stat')
    link.focus()
    pg.keyboard.press('Shift+Tab'); pg.keyboard.press('Tab')  # focus by the keyboard, so :focus-visible holds
    o = t.style(link, 'outline-style', 'outline-width', 'outline-color', 'outline-offset')
    ink = pg.evaluate('(() => { const i = document.createElement("i"); i.style.color = "var(--ink)"; document.body.appendChild(i); const c = getComputedStyle(i).color; i.remove(); return c; })()')
    t.eq('focus draws the 3px ink ring round the whole card', (t.focused(pg)['tag'], o['outline-style'], o['outline-width'], o['outline-color']), ('a', 'solid', '3px', ink))


PARITY = [('.tray-stats:nth-of-type(1) .tray-stat:nth-child(1)', 'Row', '.tray-stat:nth-child(1)'),
          ('.tray-stats:nth-of-type(1) .tray-stat:nth-child(4)', 'Row', '.tray-stat:nth-child(4)'),
          ('.tray-stats:nth-of-type(2)', 'TonesAndLink', '.tray-stats')]


def test_four(t):
    # tray-stats--four: four across where there is room, two by two below that, never three and one
    seen = {}
    pg = t.open(width=1440)
    pg.evaluate('document.querySelector(".tray-stats").classList.add("tray-stats--four")')
    for w in (1440, 1100, 1000, 920, 860, 800, 760, 700, 640, 560, 390):
        pg.set_viewport_size({'width': w, 'height': 900})
        seen[w] = pg.evaluate('''() => { const tops = [...document.querySelector('.tray-stats').children].map(c => Math.round(c.getBoundingClientRect().top));
            return [...new Set(tops)].map(y => tops.filter(x => x === y).length); }''')
    t.check('tray-stats--four is four across or two by two at every width, never three and one', all(r in ([4], [2, 2]) for r in seen.values()), seen)
    t.eq('four across on a wide page, two by two on a phone', (seen[1440], seen[390]), ([4], [2, 2]))
