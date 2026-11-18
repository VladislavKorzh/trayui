"""Progress: README.md. A role="progressbar" for a task or a role="meter" for a level, named by an aria-label that repeats
the visible name; aria-valuemin, -max and -now carry the amount, aria-valuetext the words when they are not a percentage; a
busy bar has no aria-valuenow and its sliding segment stops under reduced motion; a tray-steps row on its own is a
progressbar with an aria-valuetext ("Step 2 of 4: Delivery"); the fill is set by --tray-v; with forced colours the track and
the fill are drawn in the system's colours."""


def attrs(loc):
    return loc.evaluate('e => Object.fromEntries(["aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext"].map(a => [a, e.getAttribute(a)]))')


def test_tree(t):
    pg = t.open()
    t.match_tree('two bars, a meter, a busy bar, the steps and the accent meter, each named', pg.locator('.tray-demo'), '''
- progressbar "Uploading label.pdf"
- meter "Autumn batch reserved"
- progressbar "Checking the address"
- progressbar "Checkout"
- meter "Season so far"
''')
    a = t.ax(pg.locator('[aria-label="Uploading label.pdf"]'))
    t.eq('the upload bar carries its amount', (a['role'], a['value'], a.get('valuemin'), a.get('valuemax')), ('progressbar', 42, 0, 100))
    # Chrome's DevTools protocol reports aria-valuetext as an empty string, so the attribute is read instead
    t.eq('a meter whose words are not a percentage says them in aria-valuetext', attrs(pg.locator('[aria-label="Autumn batch reserved"]'))['aria-valuetext'], '68%: 132 of 412 jars left')
    busy = t.ax(pg.locator('.tray-progress--busy [role="progressbar"]'))
    t.check('the busy bar has no aria-valuenow, so it is read as of unknown length', busy['value'] is None and attrs(pg.locator('.tray-progress--busy [role="progressbar"]'))['aria-valuenow'] is None, busy)
    st = attrs(pg.locator('.tray-steps'))
    t.eq('the steps row is a progressbar of step 2 of 4', (st['aria-valuenow'], st['aria-valuemax'], st['aria-valuetext']), ('2', '4', 'Step 2 of 4: Delivery'))
    names = pg.evaluate('[...document.querySelectorAll(".tray-progress")].filter(p => p.querySelector(".tray-progress__bar")).map(p => [p.querySelector(".tray-progress__name").textContent, p.querySelector(".tray-progress__bar").getAttribute("aria-label")])')
    t.check('each aria-label repeats the visible name', all(label.startswith(name) for name, label in names), names)


def test_fill(t):
    pg = t.open()
    fills = pg.evaluate('''() => [...document.querySelectorAll('.tray-progress:not(.tray-progress--busy) .tray-progress__bar')].map(b => {
        const v = parseFloat(getComputedStyle(b).getPropertyValue('--tray-v')); const f = parseFloat(getComputedStyle(b, '::before').width);
        return [v, Math.round(f / b.clientWidth * 100), +b.getAttribute('aria-valuenow') / +b.getAttribute('aria-valuemax') * 100]; })''')
    t.check('the fill is --tray-v percent of the track, in step with aria-valuenow', all(abs(v - w) <= 1 and abs(v - n) <= 1 for v, w, n in fills), fills)
    steps = pg.evaluate('[...document.querySelectorAll(".tray-steps span")].map(s => getComputedStyle(s).backgroundColor)')
    t.check('the finished steps are filled, the others are track', steps[0] == steps[1] and steps[2] == steps[3] and steps[0] != steps[2], steps)
    ink = pg.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--ink")')
    t.check('the fill is ink, not a hue', t.style(pg.locator('.tray-progress__bar').first, 'background-color', pseudo='::before') == pg.evaluate('(() => { const i = document.createElement("i"); i.style.color = "var(--ink)"; document.body.appendChild(i); const c = getComputedStyle(i).color; i.remove(); return c; })()'), ink)


def test_motion(t):
    pg = t.open(motion='no-preference')
    t.eq('the busy segment slides', t.style(pg.locator('.tray-progress--busy .tray-progress__bar'), 'animation-name', pseudo='::before'), 'tray-slide')
    pg.close()
    pg = t.open(motion='reduce')
    t.eq('and stops under reduced motion', t.style(pg.locator('.tray-progress--busy .tray-progress__bar'), 'animation-name', pseudo='::before'), 'none')


def test_forced(t):
    pg = t.open(forced=True)
    sc = t.system_colors(pg)
    bar = pg.locator('.tray-progress__bar').first
    t.eq('with forced colours the track is Canvas', t.style(bar, 'background-color'), sc['Canvas'])
    t.check('with an edge in CanvasText', sc['CanvasText'].replace(' ', '') in t.style(bar, 'box-shadow').replace(' ', ''), t.style(bar, 'box-shadow'))
    t.eq('and the fill is CanvasText', t.style(bar, 'background-color', pseudo='::before'), sc['CanvasText'])
    t.eq('a finished step is CanvasText too', t.style(pg.locator('.tray-steps span[data-done]'), 'background-color'), sc['CanvasText'])


def test_react_values(t):
    pg = t.open_react()
    # The React Progress takes value and max in the units of its words: the HTML meter says 68 of 100, React 280 of 412; both
    # carry the words in aria-valuetext. What has to match is the role, the name and the words.
    for label in ('Uploading label.pdf', 'Autumn batch reserved', 'Checking the address', 'Checkout', 'Season so far'):
        loc = pg.locator(f'[aria-label="{label}"]')
        a = attrs(loc)
        t.check(f'react: "{label}" is there', loc.count() == 1, loc.count())
        if label == 'Autumn batch reserved':
            t.eq('react: the meter says its words', a['aria-valuetext'], '68%: 132 of 412 jars left')  # as the HTML preview and the README write it
        if label == 'Checking the address':
            t.eq('react: the busy bar has no aria-valuenow', a['aria-valuenow'], None)
        if label == 'Checkout':
            t.eq('react: the steps row says the step', a['aria-valuetext'], 'Step 2 of 4: Delivery')



PARITY = [('.tray-demo > .tray-progress:nth-child(1)', 'Bars', '.tray-progress:nth-child(1)'),
          ('.tray-demo > .tray-progress--busy', 'Bars', '.tray-progress:nth-child(3)')]
