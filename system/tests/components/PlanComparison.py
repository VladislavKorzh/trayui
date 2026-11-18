"""Plan Comparison: README.md. A real <table> with a <caption> (hidden with tray-vh); scope="col" plan heads with their
prices, a hidden "Feature" head over the first column; each group a <tbody> of its own whose heading cell is
scope="rowgroup" (with an empty cell under each plan); scope="row" features; a check or a dash aria-hidden with its hidden
word, "Included" or "Not included"; a dash (data-off) in hint ink, never a red cross; the featured column a tray behind
every one of its cells. It scrolls sideways inside tray-table-wrap on a phone, and a keyboard must be able to scroll it
there too (WCAG 2.1.1; the table holds nothing that takes focus, so the wrapper does, as Table's does)."""


def test_tree(t):
    pg = t.open()
    table = pg.locator('table.tray-compare')
    a = t.ax(table)
    t.eq('the table is named by its caption', (a['role'], a['name']), ('table', 'The plans compared'))
    t.check('the caption is hidden from view, as tray-vh', pg.locator('caption').evaluate('c => c.classList.contains("tray-vh") && c.getBoundingClientRect().width <= 1'))
    t.match_tree('plan heads with prices, a hidden Feature head, groups with their rows, icons read as words', table, '''
- rowgroup:
  - row:
    - columnheader "Feature"
    - columnheader "Stall $0"
    - columnheader "Shop $29 a month"
    - columnheader "Market $79 a month"
- rowgroup:
  - row "Orders":
    - rowheader "Orders"
  - row:
    - rowheader "Orders a month"
    - cell "50"
    - cell "1,000"
    - cell "Unlimited"
  - row:
    - rowheader "Printable labels"
    - cell "Included"
  - row:
    - rowheader "Courier tracking"
    - cell "Not included"
    - cell "Included"
- rowgroup:
  - row "Team":
    - rowheader "Team"
- rowgroup:
  - row "Data":
    - rowheader "Data"
''')
    groups = pg.evaluate('''() => [...document.querySelectorAll('.tray-compare tbody')].map(b => { const g = b.rows[0]; return [g.classList.contains('tray-compare__group'), g.cells[0].tagName, g.cells[0].getAttribute('scope'), [...g.cells].slice(1).every(c => c.tagName === 'TD' && !c.textContent.trim())]; })''')
    t.check('each group is a tbody of its own, headed by a rowgroup cell with an empty cell under each plan', groups and all(g == [True, 'TH', 'rowgroup', True] for g in groups), groups)
    t.eq('every feature is a row head', pg.evaluate('() => [...document.querySelectorAll(".tray-compare tbody tr:not(.tray-compare__group) th")].every(h => h.getAttribute("scope") === "row")'), True)
    icons = pg.evaluate('''() => [...document.querySelectorAll('.tray-compare td svg')].map(s => [s.getAttribute('aria-hidden'), (s.parentElement.querySelector('.tray-vh') || {}).textContent, s.parentElement.hasAttribute('data-off'), s.querySelector('use').getAttribute('href')])''')
    t.check('every check and dash is hidden and comes with its word', icons and all(h == 'true' and (w == ('Not included' if off else 'Included')) for h, w, off, _ in icons), icons)
    t.check('a missing feature is a dash, not a cross', all(href.endswith('minus') for _, _, off, href in icons if off), icons)


def test_marks(t):
    pg = t.open()
    off = pg.evaluate('''() => { const p = document.createElement('i'); p.style.color = 'var(--ink-hint)'; document.querySelector('.tray-compare').appendChild(p); const want = getComputedStyle(p).color; p.remove();
        return [...document.querySelectorAll('.tray-compare td[data-off]')].map(c => getComputedStyle(c).color === want); }''')
    t.check('a dash is in hint ink', off and all(off), off)
    trays = pg.evaluate('''() => { const cols = [...document.querySelectorAll('.tray-compare tr')].map(r => [...r.cells].map(c => [c.hasAttribute('data-featured'), getComputedStyle(c).backgroundColor]));
        return cols.map(r => r.map(([f, bg]) => f === !/rgba\\(0, 0, 0, 0\\)|transparent/.test(bg))); }''')
    t.check('every cell of the featured column, and only those, lays the tray', all(all(r) for r in trays), trays)
    radius = pg.evaluate('''() => [document.querySelector('.tray-compare thead [data-featured]'), [...document.querySelectorAll('.tray-compare tbody:last-of-type tr:last-child [data-featured]')].pop()].map(c => getComputedStyle(c).borderTopLeftRadius + ' ' + getComputedStyle(c).borderBottomRightRadius)''')
    t.check('the tray is rounded at the head and at the foot', radius[0].split()[0] != '0px' and radius[1].split()[1] != '0px', radius)


def test_phone(t):
    pg = t.open(width=390)
    wrap = pg.locator('.tray-table-wrap')
    m = wrap.evaluate('w => [w.scrollWidth, w.clientWidth, getComputedStyle(w).overflowX]')
    t.check('at 390px the table scrolls sideways inside its wrapper', m[0] > m[1] and m[2] == 'auto', m)
    # the scroll box holds no link or button, so it must take focus itself to be scrolled from the keyboard
    a = t.ax(wrap)
    t.check('the wrapper is a named region in the Tab order, as Table\'s is', pg.get_attribute('.tray-table-wrap', 'tabindex') == '0' and a['role'] == 'region' and a['name'], a)
    wrap.focus()
    pg.keyboard.press('ArrowRight')
    pg.wait_for_timeout(100)
    t.check('focused, the arrow keys scroll it', wrap.evaluate('w => w.scrollLeft') > 0)
    t.scan(pg, '390px')


PARITY = [('.tray-compare thead', 'Comparison', 'thead'), ('.tray-compare tbody:nth-of-type(1)', 'Comparison', 'tbody:nth-of-type(1)'),
          ('.tray-compare tbody:nth-of-type(2)', 'Comparison', 'tbody:nth-of-type(2)')]


def test_parity_phone(t):
    pg = t.open_react(width=390)
    wrap = t.cell(pg, 'Comparison').locator('.tray-table-wrap')
    a = t.ax(wrap)
    t.check('React: the wrapper is a named region in the Tab order, as in the HTML', wrap.get_attribute('tabindex') == '0' and a['role'] == 'region' and a['name'], a)
    t.check('React: the table has a caption, as the README asks', t.cell(pg, 'Comparison').locator('caption').count() == 1)


