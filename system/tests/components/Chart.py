"""Chart: README.md (Accessibility, Interaction, Colour) and guides/3-accessibility.md (forced colours, reading direction).
The figure is named by its figcaption through aria-labelledby; the drawing is role="img" named by the summary; the plot of a
bar, line or area chart takes focus, ArrowLeft and ArrowRight walk the points (mirrored right to left), Home and End jump,
Escape clears, the tooltip shows the values, and a polite live region beside the drawing (never inside the role="img") says
them; on a donut and a radar the arrow keys walk the segments or spokes; a radial chart and horizontal bars take focus so
their summary is read; several series come with a legend, a donut with a key table, and "Show the figures" opens a real table
with scoped heads whose first column is named by labelHead; pointing shows the tooltip, a tap keeps it until a tap elsewhere;
one series is ink, and under forced colours the text colour; the labels under the plot are never cut."""

# The React twin (react/src/charts/Chart.tsx) draws with Recharts: the drawing differs by design, so parity compares the
# figure: its name, its summary, the legend and the table of figures.


IDS = ['c-bar', 'c-area', 'c-line', 'c-stack', 'c-donut', 'c-radial', 'c-rank', 'c-radar']


def said(pg, fig):
    return pg.locator(f'#{fig} > [aria-live]').inner_text()


def test_tree(t):
    pg = t.open()
    for fig in IDS:
        a = t.ax(pg.locator('#' + fig))
        cap = pg.locator(f'#{fig} > figcaption').inner_text()
        t.eq(f'{fig}: the figure is named by its caption', (a['role'], a['name']), ('figure', cap))
    drawings = pg.locator('.tray-chart [role="img"]')
    t.eq('every chart has one drawing, a focusable role="img" named by its summary', drawings.evaluate_all('ds => ds.map(d => [d.closest("figure").id, d.tabIndex, d.getAttribute("aria-label").slice(0, 12)])'),
         [[f, 0, s] for f, s in zip(IDS, ['Bar chart of', 'Area chart o', 'Line chart c', 'Stacked bar ', 'Donut chart ', 'Radial chart', 'Ranked bars ', 'Radar chart '])])
    t.check('the drawing is named by the summary the page wrote', t.ax(pg.locator('#c-bar [role="img"]'))['name'].startswith('Bar chart of caviar collected by month in 2026.'))
    t.eq('no live region sits inside a role="img", where it would never be heard', pg.locator('[role="img"] [aria-live]').count(), 0)
    t.eq('the charts that walk have a polite live region in the figure', pg.evaluate('[...document.querySelectorAll(".tray-chart")].filter(f => f.querySelector(":scope > [aria-live=polite]")).map(f => f.id)'),
         ['c-bar', 'c-area', 'c-line', 'c-stack', 'c-donut', 'c-radar'])
    t.eq('the axes are aria-hidden', pg.evaluate('[...document.querySelectorAll(".tray-chart__axis, .tray-chart__x")].every(a => a.getAttribute("aria-hidden") === "true")'), True)
    t.eq('several series come with a legend', pg.evaluate('[...document.querySelectorAll(".tray-chart__legend")].map(l => l.closest("figure").id)'), ['c-line', 'c-stack', 'c-radar'])
    t.eq('a donut comes with a key table', pg.locator('#c-donut table.tray-chart__key th[scope="row"]').count(), 4)
    table(t, pg)
    colour(t, pg)


def table(t, pg):
    d = pg.locator('#c-bar details')
    t.eq('"Show the figures" is a disclosure, shut at first', (d.locator('summary').inner_text().strip(), d.evaluate('d => d.open')), ('Show the figures', False))
    d.locator('summary').focus(); pg.keyboard.press('Enter')
    t.check('Enter opens it', d.evaluate('d => d.open'))
    t.match_tree('a real table, its first column named by labelHead, every head scoped', d.locator('table'), '''
- table:
  - rowgroup:
    - row "Month Collected":
      - columnheader "Month"
      - columnheader "Collected"
  - rowgroup:
    - row "Jan 0 kg":
      - rowheader "Jan"
      - cell "0 kg"
''')
    t.check('every head carries a scope', d.locator('th').evaluate_all('hs => hs.every(h => h.getAttribute("scope"))'))
    t.eq('the line chart\'s table has a column per series', pg.locator('#c-line table thead th').evaluate_all('hs => hs.map(h => h.textContent)'), ['Month', '2026', '2025'])


def test_keys(t):
    pg = t.open()
    plot = pg.locator('#c-bar .tray-chart__plot')
    plot.focus()
    pg.keyboard.press('ArrowRight')
    # the first press starts at the labelled peak, where the eye already is; the next ones move on
    t.eq('the first arrow press says the labelled peak', said(pg, 'c-bar'), 'May: 22 kg')
    pg.keyboard.press('ArrowRight')
    t.eq('ArrowRight moves to the next point and says it', said(pg, 'c-bar'), 'Jun: 19 kg')
    t.eq('the tooltip shows the same', plot.locator('.tray-tip').inner_text(), 'Jun, 19 kg')
    pg.keyboard.press('Home')
    t.eq('Home jumps to the first point', said(pg, 'c-bar'), 'Jan: 0 kg')
    pg.keyboard.press('ArrowLeft')
    t.eq('ArrowLeft stops at the first', said(pg, 'c-bar'), 'Jan: 0 kg')
    pg.keyboard.press('End')
    t.eq('End jumps to the last', said(pg, 'c-bar'), 'Dec: 0 kg')
    t.eq('the column in focus is marked', pg.locator('#c-bar .tray-chart__col[data-active]').count(), 1)
    pg.keyboard.press('Escape')
    t.check('Escape clears the tooltip', not plot.locator('.tray-tip').is_visible() and pg.locator('#c-bar .tray-chart__col[data-active]').count() == 0)
    line = pg.locator('#c-line .tray-chart__plot')
    line.focus(); pg.keyboard.press('ArrowRight')
    t.eq('on a chart of two series each value is said with its series', said(pg, 'c-line'), 'Mar: 2026 6 kg, 2025 5 kg')
    t.check('and the crosshair shows', line.locator('.tray-chart__cross').is_visible())
    line.blur()
    t.check('leaving the plot clears it', not line.locator('.tray-tip').is_visible())
    donut = pg.locator('#c-donut [role="img"]')
    donut.focus(); pg.keyboard.press('ArrowRight')
    t.eq('on a donut ArrowRight walks to the first segment and says it', said(pg, 'c-donut'), 'Jars: 57 kg, 55%')
    t.eq('the centre shows the one in focus', pg.locator('#c-donut .tray-chart__center').inner_text().replace('\n', ' '), '57 kg Jars, 55%')
    pg.keyboard.press('ArrowLeft')
    t.eq('ArrowLeft goes round to the last segment', said(pg, 'c-donut'), 'Reserve: 6 kg, 6%')
    pg.keyboard.press('Escape')
    t.eq('Escape shows the total again', pg.locator('#c-donut .tray-chart__center').inner_text().replace('\n', ' '), '104 kg Season so far')
    radar = pg.locator('#c-radar [role="img"]')
    radar.focus(); pg.keyboard.press('ArrowDown')
    t.eq('on a radar the arrow keys walk the spokes', said(pg, 'c-radar'), 'Moisture: Bed A 8, Bed B 6')
    t.check('and the tooltip shows the spoke', radar.locator('.tray-tip').is_visible())
    tab_stops(t, pg)
    pointer(t, pg)
    touch(t, pg)


def tab_stops(t, pg):
    pg.locator('#c-bar .tray-chart__plot').focus()
    stops = []
    for _ in range(14):
        pg.keyboard.press('Tab')
        f = pg.evaluate('(() => { const a = document.activeElement; return [a.closest("figure") ? a.closest("figure").id : "", a.getAttribute("role") || a.tagName.toLowerCase()]; })()')
        stops.append(tuple(f))
    imgs = [f for f, r in stops if r == 'img'][:7]
    t.eq('every chart is a stop for Tab, the radial and the ranked bars too', imgs, ['c-area', 'c-line', 'c-stack', 'c-donut', 'c-radial', 'c-rank', 'c-radar'])


def pointer(t, pg):
    plot = pg.locator('#c-bar .tray-chart__plot')
    box = plot.bounding_box()
    pg.mouse.move(box['x'] + box['width'] * (4.5 / 12), box['y'] + 40)
    t.eq('pointing at a column shows its tooltip', plot.locator('.tray-tip').inner_text(), 'May, 22 kg')
    pg.mouse.move(5, 5)
    t.check('leaving the plot hides it', not plot.locator('.tray-tip').is_visible())


def touch(t, pg):
    plot = pg.locator('#c-bar .tray-chart__plot')
    box = plot.bounding_box()
    x, y = box['x'] + box['width'] * (2.5 / 12), box['y'] + 60
    pg.evaluate('''([x, y]) => { const el = document.elementFromPoint(x, y), o = { bubbles: true, clientX: x, clientY: y, pointerType: 'touch', pointerId: 7, isPrimary: true };
        el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new PointerEvent('pointerup', o)); el.dispatchEvent(new PointerEvent('pointerleave', { ...o, bubbles: false })); }''', [x, y])
    t.eq('a tap shows the values under it', plot.locator('.tray-tip').inner_text(), 'Mar, 6 kg')
    t.check('and they stay when the finger lifts', plot.locator('.tray-tip').is_visible())
    pg.evaluate('''() => document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', clientX: 2, clientY: 2 }))''')
    t.check('until the next tap elsewhere', not plot.locator('.tray-tip').is_visible())


def colour(t, pg):
    t.eq('one series is drawn in ink', t.style(pg.locator('#c-bar .tray-chart__bar').first, 'background-color'), t.style(pg.locator('body'), 'color'))
    t.check('several series take the data colours', len(set(pg.locator('#c-stack .tray-chart__col').first.locator('.tray-chart__bar').evaluate_all('bs => bs.map(b => getComputedStyle(b).backgroundColor)'))) == 4)
    t.eq('the peak label is text in ink, not in a series colour', t.style(pg.locator('#c-bar .tray-chart__peak'), 'color'), t.style(pg.locator('body'), 'color'))


def test_forced_colours(t):
    pg = t.open(forced=True)
    sysc = t.system_colors(pg)
    t.eq('under forced colours one series takes the text colour', t.style(pg.locator('#c-bar .tray-chart__bar').first, 'background-color'), sysc['CanvasText'])
    t.check('several series keep the colours of their series, so the legend still tells them apart',
            len(set(pg.locator('#c-stack .tray-chart__col').first.locator('.tray-chart__bar').evaluate_all('bs => bs.map(b => getComputedStyle(b).backgroundColor)'))) == 4)
    t.eq('and their swatches keep them too', len(set(pg.locator('#c-stack .tray-chart__legend .tray-swatch').evaluate_all('ss => ss.map(s => getComputedStyle(s).backgroundColor)'))), 4)


def test_rtl(t):
    pg = t.open(rtl=True)
    plot = pg.locator('#c-bar .tray-chart__plot')
    plot.focus(); pg.keyboard.press('Home'); pg.keyboard.press('ArrowLeft')
    t.eq('right to left, ArrowLeft moves on to the next point', said(pg, 'c-bar'), 'Feb: 0 kg')
    cols = pg.locator('#c-bar .tray-chart__col')
    t.check('and the first label is on the right', cols.first.bounding_box()['x'] > cols.last.bounding_box()['x'])


def test_labels_fit(t):
    pg = t.open(width=390)
    for w in (390, 1440):
        if w != 390:
            pg.set_viewport_size({'width': w, 'height': 900}); pg.wait_for_timeout(120)
        shown = pg.locator('#c-bar .tray-chart__x span').evaluate_all('ss => ss.map(s => s.textContent)')
        cut = pg.evaluate('''() => [...document.querySelectorAll('.tray-chart__x')].flatMap(x => { const ss = [...x.children]; return ss.flatMap((s, i) => {
            if (!s.textContent) return []; const r = document.createRange(); r.selectNodeContents(s); const a = r.getBoundingClientRect();
            const next = ss.slice(i + 1).find(n => n.textContent); if (!next) return []; r.selectNodeContents(next); const b = r.getBoundingClientRect();
            return a.right > b.left - 2 ? [s.textContent + '/' + next.textContent] : []; }); })''')
        t.eq(f'at {w}px no two labels under a plot touch', cut, [])
        if w == 390:
            t.check('on a phone the bar chart labels every second month', shown[0] == 'Jan' and shown[1] == '' and shown[2] == 'Mar', shown)
        else:
            t.eq('widened, the chart labels every month again', shown, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])


def test_parity_figure(t):
    """The React Chart draws with Recharts: its figure is compared, not its drawing."""
    h = t.open()
    r = t.open_react()
    hb = h.locator('#c-bar')
    rb = t.cell(r, 'BarAndArea').locator('figure').first
    for label, fn in [
        ('the figure is named by its title, through aria-labelledby (the browser does not name a figure by its caption)', lambda pg, f: (t.ax(f)['name'], bool(f.get_attribute('aria-labelledby')))),
        ('the drawing is one role="img" named by the summary', lambda pg, f: f.locator('[role="img"]').evaluate_all('ds => ds.map(d => d.getAttribute("aria-label"))')),
        ('"Show the figures" is a disclosure with a real table', lambda pg, f: (f.locator('details summary').inner_text().strip(), f.locator('details th[scope="col"]').evaluate_all('hs => hs.map(h => h.textContent)'))),
        ('the drawing, and nothing inside it, is the stop for Tab', lambda pg, f: f.evaluate('f => [...f.querySelectorAll("[tabindex=\'0\']")].map(e => e.getAttribute("role"))')),
    ]:
        try:
            a, b = fn(h, hb), fn(r, rb)
            t.check(f'react: {label}', a == b, f'html {a!r}, react {b!r}')
        except Exception as e:
            t.note_error(f'react: {label}', e)
    rl = t.cell(r, 'LineAndStacked').locator('figure').first
    t.eq('react: several series come with a legend, as in the HTML', rl.locator('.tray-chart__legend li').evaluate_all('ls => ls.map(l => l.textContent.trim())'),
         h.locator('#c-line .tray-chart__legend li').evaluate_all('ls => ls.map(l => l.textContent.trim())'))
    plot = rb.locator('[tabindex="0"]').first
    plot.focus(); r.keyboard.press('Home')
    live = rb.locator('[aria-live]')
    t.check('react: the keys walk the points and a live region beside the drawing says them', live.count() >= 1 and 'Jan' in live.first.inner_text() and rb.locator('[role="img"] [aria-live]').count() == 0, live.first.inner_text() if live.count() else 'no live region')


# Static parity (trayui-react/static): each chart is a figure with data-tray="chart" and its data in data-chart there,
# which bundle.js draws with the system's own chart.
STATIC = True
STATIC_FLATTEN = ('img',)  # the drawing: Recharts in React, the system's own chart in static; compared by its name (the summary)
