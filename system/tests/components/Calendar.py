"""Calendar: README.md, Markup and Accessibility. Each day a <button> named with its full date; a picked day, or each end of
a range, aria-pressed="true"; the days one stop for Tab; days before min or after max disabled; the arrows move by a day or a
week and turn the page at the edge of a month (the left arrow moves on in a right-to-left page); Home and End go to the start
and end of the week; Page Up and Page Down by a month (the last day of a shorter month), with Shift by a year; past min or
max an arrow stays put and the other keys stop at the limit; Enter or Space picks; the month buttons are named "Previous
month" and "Next month" (or prev-label and next-label); turning the page with one keeps focus on it and a polite line says
the month now shown; the weekday letters are hidden; tray:change with detail.value and detail.complete; the focus ring is
drawn inside the day. Guide, forced colours: a picked day is SelectedItem."""
import re

ONE = '[data-tray="calendar"] >> nth=0'    # single, November 2026, min 2026-11-15, value 2026-11-19, today 2026-11-15
RANGE = '[data-tray="calendar"] >> nth=1'  # range, December 2026, 2026-12-08/2026-12-13


def date(pg):
    return pg.evaluate('document.activeElement.dataset.date || document.activeElement.getAttribute("aria-label")')


def test_tree(t):
    pg = t.open()
    cal = pg.locator(ONE)
    day = cal.locator('[data-date="2026-11-19"]')
    a = t.ax(day)
    t.check('a day is a button named with its full date', a['role'] == 'button' and re.fullmatch(r'Thursday,? 19 November 2026', a['name']), a)
    t.eq('the picked day is pressed', a.get('pressed'), 'true')
    t.eq('other days are not', t.ax(cal.locator('[data-date="2026-11-20"]')).get('pressed'), 'false')
    t.eq('the days are one stop for Tab, on the picked day', cal.locator('[tabindex="0"]').evaluate_all('ds => ds.map(d => d.dataset.date || d.getAttribute("aria-label"))'), ['2026-11-19'])
    t.check('days before min are disabled', cal.locator('[data-date="2026-11-14"]').is_disabled() and not cal.locator('[data-date="2026-11-15"]').is_disabled())
    t.check('the weekday letters are hidden', cal.locator('.tray-cal__dow').evaluate_all('ds => ds.length === 7 && ds.every(d => d.getAttribute("aria-hidden") === "true")'))
    t.eq('the month buttons are named', cal.locator('.tray-cal__nav').evaluate_all('bs => bs.map(b => b.getAttribute("aria-label"))'), ['Previous month', 'Next month'])
    live = cal.locator('[aria-live]')
    t.eq('a polite line waits to say the month', (live.count(), live.get_attribute('aria-live')), (1, 'polite'))
    rng = pg.locator(RANGE)
    t.eq('each end of a range is pressed', rng.locator('[aria-pressed="true"]').evaluate_all('ds => ds.map(d => d.dataset.date)'), ['2026-12-08', '2026-12-13'])
    t.check('today\'s dot is not announced (it is drawn by CSS)', not re.search(r'today', t.ax(cal.locator('[data-date="2026-11-15"]'))['name'], re.I))


def test_keys(t):
    pg = t.open()
    cal = pg.locator(ONE)
    cal.locator('[data-date="2026-11-19"]').focus()
    seq = [('ArrowRight', '2026-11-20'), ('ArrowDown', '2026-11-27'), ('ArrowDown', '2026-12-04'), ('ArrowUp', '2026-11-27'), ('ArrowLeft', '2026-11-26'),
           ('Home', '2026-11-23'), ('End', '2026-11-29'), ('PageDown', '2026-12-29'), ('PageUp', '2026-11-29'), ('Shift+PageDown', '2027-11-29'), ('Shift+PageUp', '2026-11-29')]
    got, titles = [], []
    for key, want in seq:
        pg.keyboard.press(key)
        got.append((key, date(pg)))
        titles.append(cal.locator('.tray-cal__title').inner_text())
    t.eq('the arrows by a day and a week, Home and End to the week\'s ends, Page Up and Down by a month, with Shift by a year', got, [(k, w) for k, w in seq])
    t.eq('an arrow past the end of the month turns the page', titles[2], 'December 2026')
    cal.locator('[data-date="2026-11-16"]').focus()
    pg.keyboard.press('ArrowUp')
    t.eq('past min an arrow stays put', date(pg), '2026-11-16')
    pg.keyboard.press('PageUp')
    t.eq('Page Up stops at min', date(pg), '2026-11-15')
    t.clear_events(pg)
    pg.keyboard.press('ArrowRight'); pg.keyboard.press('Enter')
    t.eq('Enter picks the day', (cal.locator('[aria-pressed="true"]').get_attribute('data-date'), date(pg)), ('2026-11-16', '2026-11-16'))
    t.eq('tray:change says the value, complete', [e['detail'] for e in t.events(pg, 'tray:change')], [{'value': '2026-11-16', 'complete': True}])
    pg.keyboard.press('ArrowRight'); pg.keyboard.press('Space')
    t.eq('Space picks too', cal.locator('[aria-pressed="true"]').get_attribute('data-date'), '2026-11-17')
    # 31 January, a month on, is the last day of February
    pg.evaluate('''() => { const d = document.createElement('div'); d.id = 'jan'; document.querySelector('.tray-demo').append(d); TrayUI.calendar(d, { value: '2027-01-31', today: '2027-01-10' }); }''')
    pg.locator('#jan [data-date="2027-01-31"]').focus(); pg.keyboard.press('PageDown')
    t.eq('Page Down from 31 January goes to the last day of February', date(pg), '2027-02-28')
    t.eq('the days stay one Tab stop after the page turns', pg.locator('#jan [tabindex="0"]').count(), 1)


def test_range(t):
    pg = t.open()
    rng = pg.locator(RANGE)
    t.clear_events(pg)
    rng.locator('[data-date="2026-12-15"]').click()
    t.eq('the first day of a range is not complete', t.events(pg, 'tray:change')[-1]['detail'], {'value': '2026-12-15/', 'complete': False})
    rng.locator('[data-date="2026-12-18"]').click()
    t.eq('the second day completes it', t.events(pg, 'tray:change')[-1]['detail'], {'value': '2026-12-15/2026-12-18', 'complete': True})
    t.eq('both ends are pressed, the days between in the band', (rng.locator('[aria-pressed="true"]').count(), rng.locator('[data-in-range]').count()), (2, 2))
    t.check('the band is not announced: the days between are not pressed', all(t.ax(rng.locator('[data-in-range]').nth(i)).get('pressed') == 'false' for i in range(2)))


def test_month_buttons(t):
    pg = t.open()
    cal = pg.locator(ONE)
    nxt = cal.locator('[data-nav="1"]')
    nxt.focus(); pg.keyboard.press('Enter')
    t.eq('turning the page keeps focus on the month button', t.focused(pg)['label'], 'Next month')
    t.eq('the title shows the new month', cal.locator('.tray-cal__title').inner_text(), 'December 2026')
    t.eq('a polite line says the month now shown', cal.locator('[aria-live]').inner_text(), 'December 2026')
    pg.evaluate('''() => { const d = document.createElement('div'); d.id = 'uk'; document.querySelector('.tray-demo').append(d);
        TrayUI.calendar(d, { locale: 'uk-UA', prevLabel: 'Попередній місяць', nextLabel: 'Наступний місяць', value: '2026-11-19' }); }''')
    t.eq('the month buttons take the names given in the page\'s language', pg.locator('#uk .tray-cal__nav').evaluate_all('bs => bs.map(b => b.getAttribute("aria-label"))'), ['Попередній місяць', 'Наступний місяць'])
    t.check('and the days the locale\'s names', 'листопада' in t.ax(pg.locator('#uk [data-date="2026-11-19"]'))['name'], t.ax(pg.locator('#uk [data-date="2026-11-19"]'))['name'])


def test_rtl(t):
    pg = t.open(rtl=True)
    cal = pg.locator(ONE)
    cal.locator('[data-date="2026-11-19"]').focus()
    pg.keyboard.press('ArrowLeft')
    t.eq('in a right-to-left page the left arrow moves on to the next day', date(pg), '2026-11-20')
    a, b = cal.locator('[data-date="2026-11-19"]').bounding_box(), cal.locator('[data-date="2026-11-20"]').bounding_box()
    t.check('and the week runs from right to left', b['x'] < a['x'], (a['x'], b['x']))


def test_focus_ring(t):
    pg = t.open()
    cal = pg.locator(ONE)
    cal.locator('[data-date="2026-11-19"]').focus(); pg.keyboard.press('ArrowRight')
    num = cal.locator('[data-date="2026-11-20"] .tray-cal__num')
    s = t.style(num, 'outline-style', 'outline-width', 'outline-offset')
    t.eq('the focus ring is drawn inside the day', s, {'outline-style': 'solid', 'outline-width': '3px', 'outline-offset': '-3px'})
    pg.keyboard.press('ArrowLeft')
    picked = cal.locator('[data-date="2026-11-19"] .tray-cal__num')
    t.eq('in the page colour on a picked day', t.style(picked, 'outline-color'), t.style(picked, 'color'))
    t.eq('days are 44px cells', [round(v) for v in (cal.locator('.tray-cal__day').first.bounding_box()['width'], cal.locator('.tray-cal__day').first.bounding_box()['height'])], [44, 44])


def test_forced_colours(t):
    pg = t.open(forced=True)
    c = t.system_colors(pg)
    num = pg.locator(ONE).locator('[data-date="2026-11-19"] .tray-cal__num')
    t.eq('with forced colours a picked day takes SelectedItem', (t.style(num, 'background-color'), t.style(num, 'color')), (c['SelectedItem'], c['SelectedItemText']))


PARITY = [('.tray-card .tray-cal', 'SingleAndRange', '.tray-card .tray-cal'), ('.tray-demo > .tray-cal', 'SingleAndRange', '.tray-row > .tray-cal')]


def drive(t, pg, cal):
    cal.locator('[data-date="2026-11-19"]').focus()
    out = []
    for key in ('ArrowRight', 'ArrowDown', 'ArrowDown', 'PageUp', 'Home', 'End'):
        pg.keyboard.press(key); out.append(date(pg))
    t.clear_events(pg)
    pg.keyboard.press('Enter')
    out.append([e['detail'] for e in t.events(pg, 'tray:change')])
    nav = cal.locator('[data-nav="-1"]')
    nav.focus(); pg.keyboard.press('Enter')
    out.append((t.focused(pg)['label'], cal.locator('[aria-live]').inner_text()))
    return out


def test_parity_keys(t):
    h, r = t.open(), t.open_react()
    a = drive(t, h, h.locator(ONE))
    b = drive(t, r, t.cell(r, 'SingleAndRange').locator('.tray-card .tray-cal'))
    t.eq('React: the keys, the pick, tray:change and the month buttons work as in HTML', b, a)


# Static parity (trayui-react/static): the empty root carries data-tray="calendar" and its options as data-* there, and
# bundle.js draws the month grid and picks.
STATIC = True
STATIC_SKIP = {'Controlled': "the sentence under the calendar follows the preview's own React state (the day), which a static page's own script keeps"}
