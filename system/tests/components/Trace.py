"""Trace: README.md. The group is the browser's own <details>: Enter or Space on its summary opens and closes it and it is
announced expanded or collapsed; the steps are an <ol>, one item per step, so each line is read with its place (a step's
output sits inside its own item); icons and the spinner are aria-hidden; a failed step turns its tile and verb danger and
says what failed in words; the trace is not a live region; under reduced motion the group opens at once."""


def test_tree(t):
    pg = t.open()
    t.match_tree('a group, its summary, then a list of the five steps, the output inside its step', pg.locator('.tray-trace-group'), '''
- group:
  - text: Worked for 42 seconds, 5 steps
  - list:
    - listitem: Read orders-november.csv 0.4 s
    - listitem: /Searched for "chilled delivery" in the notes/
    - listitem:
      - text: Ran the stock check 8.0 s
      - code: "autumn batch: 412 packed, 280 reserved, 132 left"
    - listitem: Could not reach the courier's schedule 30 s
    - listitem: Writing the summary
''')
    t.eq('the list holds one item per step, as many as the summary says', pg.locator('.tray-trace > li').count(), 5)
    s = t.ax(pg.locator('.tray-trace-group > summary'))
    t.eq('the summary is announced expanded', s.get('expanded'), True)
    t.eq('every icon and spinner in a tile is hidden', pg.evaluate('[...document.querySelectorAll(".tray-trace__icon > *")].every(i => i.getAttribute("aria-hidden") === "true")'), True)
    t.eq('the trace is not a live region', pg.locator('.tray-trace-group [aria-live], .tray-trace-group [role="status"], .tray-trace-group [role="log"]').count(), 0)


def test_keys(t):
    pg = t.open()
    group, summary = pg.locator('.tray-trace-group'), pg.locator('.tray-trace-group > summary')
    summary.focus()
    pg.keyboard.press('Enter')
    t.eq('Enter on the summary closes the group', (group.evaluate('d => d.open'), t.ax(summary).get('expanded')), (False, False))
    t.check('its steps leave the reading order', not pg.locator('.tray-trace').is_visible())
    pg.keyboard.press('Space')
    t.eq('Space opens it again', (group.evaluate('d => d.open'), t.ax(summary).get('expanded')), (True, True))
    t.check('the summary is 44px tall', t.hit(summary)[1] >= 44, t.hit(summary))


def test_states(t):
    pg = t.open()
    danger = pg.evaluate('() => { const p = document.createElement("i"); p.style.color = "var(--danger)"; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; }')
    failed = pg.locator('.tray-trace__line[data-status="failed"]')
    t.eq('a failed step turns its tile and its verb danger', (t.style(failed.locator('.tray-trace__icon'), 'color'), t.style(failed.locator('b'), 'color')), (danger, danger))
    t.check('and says what failed in words', 'Could not reach' in failed.inner_text())
    running = pg.locator('.tray-trace__line[data-status="running"]')
    t.eq('a running step has a spinner in its tile', running.locator('.tray-trace__icon .tray-spinner').count(), 1)


def test_output_scrolls(t):
    pg = t.open(width=390)
    pre = pg.locator('.tray-trace__detail pre')
    t.check('at 390px the output scrolls inside its block', pre.evaluate('e => e.scrollWidth > e.clientWidth && e.getBoundingClientRect().right <= document.documentElement.clientWidth'),
            pre.evaluate('e => [e.scrollWidth, e.clientWidth, e.getBoundingClientRect().right]'))
    t.eq('and a keyboard reaches it to scroll it', t.ax(pre).get('focusable'), True)
    line, out = pg.locator('.tray-trace__detail').locator('xpath=..').locator('.tray-trace__title'), pg.locator('.tray-trace__detail')
    t.check('the output sits under its step, past the tile', out.bounding_box()['y'] >= line.bounding_box()['y'] + line.bounding_box()['height'] - 1 and out.bounding_box()['x'] >= line.bounding_box()['x'] - 1)


def test_motion(t):
    for motion in ('no-preference', 'reduce'):
        pg = t.open(motion=motion)
        d = t.style(pg.locator('.tray-trace-group'), 'transition-duration', 'transition-property', pseudo='::details-content')
        if motion == 'reduce':
            t.check('under reduced motion the group opens at once', all(float(x.rstrip('s')) == 0 for x in d['transition-duration'].split(',')), d)
        else:
            t.check('otherwise it unfolds to its height', 'block-size' in d['transition-property'] and any(float(x.rstrip('s')) > 0 for x in d['transition-duration'].split(',')), d)
        pg.close()


PARITY = [('.tray-trace-group', 'Working', 'details')]

