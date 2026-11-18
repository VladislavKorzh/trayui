"""Date Picker: README.md, Markup and Accessibility. The trigger is a <button> with aria-haspopup="dialog", aria-controls and
an aria-expanded that follows the panel; the panel is a role="dialog" named as the field; the trigger is named by its label
and the date it shows ("Report period 26 Oct – 8 Nov 2026"); Enter, Space or the down arrow opens the panel and moves focus
to the picked day, or to today; Escape closes it, as does Apply, or without Apply the date or the end of the range, each
returning focus to the trigger; it does not open on focus; presets set the last N days ending today; Clear empties it; the
hidden input holds YYYY-MM-DD or start/end; under reduced motion the panel only fades, in a tenth of a second."""

RANGE = '[data-tray="datepicker"] >> nth=0'   # Report period: open, presets, Apply, value 2026-10-26/2026-11-08, today 2026-11-15
DAY = '[data-tray="datepicker"] >> nth=1'     # Delivery day: single, min and today 2026-11-15


def words(loc):
    """The words of a trigger, its thin and no-break spaces as plain ones (Intl writes a range "2 – 5 Nov 2026")."""
    import re
    return re.sub(r'\s', ' ', loc.inner_text())


def trig(pg, sel):
    return pg.locator(sel).locator('.tray-select-trigger')


def test_tree(t):
    pg = t.open()
    a = t.ax(trig(pg, DAY))
    t.eq('the trigger is a button opening a dialog, named by its label and the words it shows', (a['role'], a['name'], a.get('hasPopup'), a.get('expanded')), ('button', 'Delivery day Pick a day', 'dialog', False))
    t.eq('it controls the panel', trig(pg, DAY).get_attribute('aria-controls'), pg.locator(DAY).locator('.tray-pop').get_attribute('id'))
    t.match_tree('the open panel is a dialog named as the field', pg.locator(RANGE), '''
- button "Report period 26 Oct – 8 Nov 2026" [expanded]
- dialog "Report period":
  - button "Last 7 days"
  - button "Previous month"
  - button "Next month"
  - button "Clear"
  - button "Apply"
''')
    t.eq('the hidden input holds the range', pg.input_value('input[name="period"]'), '2026-10-26/2026-11-08')


def test_open_keys(t):
    for key in ('Enter', 'Space', 'ArrowDown'):
        pg = t.open()
        tr = trig(pg, DAY)
        pg.keyboard.press('Tab'); pg.keyboard.press('Tab')
        if not t.is_focused(tr):
            tr.focus()
        t.eq('focus alone does not open the panel' if key == 'Enter' else f'focus does not open it ({key})', tr.get_attribute('aria-expanded'), 'false')
        pg.keyboard.press(key)
        t.eq(f'{key} opens the panel on today, as no day is picked', (tr.get_attribute('aria-expanded'), pg.evaluate('document.activeElement.dataset.date')), ('true', '2026-11-15'))
        pg.close()


def test_single(t):
    pg = t.open()
    tr = trig(pg, DAY)
    tr.focus(); pg.keyboard.press('Enter')
    pg.keyboard.press('ArrowRight'); pg.keyboard.press('ArrowRight')
    pg.keyboard.press('Enter'); t.settle(pg)
    t.eq('picking a date closes the panel and returns focus to the trigger', (tr.get_attribute('aria-expanded'), t.is_focused(tr)), ('false', True))
    t.eq('the trigger shows the date in words, heard with the field\'s name', (pg.locator(DAY).locator('.tray-select-trigger__value').inner_text(), t.ax(tr)['name']), ('17 Nov 2026', 'Delivery day 17 Nov 2026'))
    t.eq('the placeholder look goes', tr.get_attribute('data-placeholder'), None)
    t.eq('the hidden input holds the day', pg.input_value('input[name="day"]'), '2026-11-17')
    pg.keyboard.press('ArrowDown')
    t.eq('the down arrow opens it again on the picked day', pg.evaluate('document.activeElement.dataset.date'), '2026-11-17')
    pg.keyboard.press('Escape'); t.settle(pg)
    t.eq('Escape closes it and returns focus to the trigger', (tr.get_attribute('aria-expanded'), t.is_focused(tr)), ('false', True))


def test_range_apply(t):
    pg = t.open()
    rng = pg.locator(RANGE)
    tr = trig(pg, RANGE)
    t.clear_events(pg)
    rng.locator('[data-date="2026-11-02"]').click()
    t.eq('the first day of a range shows "… – …"', rng.locator('.tray-select-trigger__value').inner_text(), '2 Nov 2026 – …')
    rng.locator('[data-date="2026-11-05"]').click()
    t.eq('with Apply the panel stays open after the end of the range', tr.get_attribute('aria-expanded'), 'true')
    t.eq('the trigger reads the range, as the README writes it', words(rng.locator('.tray-select-trigger__value')), '2 – 5 Nov 2026')
    t.eq('the calendar\'s tray:change bubbles from the picker', [e['detail']['complete'] for e in t.events(pg, 'tray:change')], [False, True])
    rng.locator('[data-preset="7"]').click()
    t.eq('a preset sets the last seven days, ending today', (pg.input_value('input[name="period"]'), words(rng.locator('.tray-select-trigger__value'))), ('2026-11-09/2026-11-15', '9 – 15 Nov 2026'))
    rng.locator('[data-clear]').click()
    t.eq('Clear empties it', (pg.input_value('input[name="period"]'), rng.locator('.tray-select-trigger__value').inner_text(), tr.get_attribute('data-placeholder')), ('', 'Pick a period', ''))
    rng.locator('[data-apply]').focus(); pg.keyboard.press('Enter'); t.settle(pg)
    t.eq('Apply closes the panel and returns focus to the trigger', (tr.get_attribute('aria-expanded'), t.is_focused(tr)), ('false', True))


def test_motion(t):
    pg = t.open(motion='reduce')
    p = pg.locator(RANGE).locator('.tray-pop')
    s = t.style(p, 'transition-duration', 'scale', 'translate')
    t.check('with reduced motion the panel only fades, in a tenth of a second', s['transition-duration'].split(',')[0].strip() == '0.1s' and s['scale'] in ('none', '1') and s['translate'] in ('none', '0px', '0px 0px'), s)
    pg = t.open(motion='no-preference')
    p = pg.locator(DAY).locator('.tray-pop')
    t.check('otherwise it also grows from its trigger', t.style(p, 'transition-property') not in ('opacity', 'all'), t.style(p, 'transition-property'))


PARITY = [('[role="dialog"]', 'ReportPeriod', '[role="dialog"]')]


def drive(t, pg, root):
    tr = root.locator('.tray-select-trigger')
    tr.focus(); pg.keyboard.press('ArrowDown')
    a = pg.evaluate('document.activeElement.dataset.date')
    pg.keyboard.press('ArrowRight'); pg.keyboard.press('Space'); t.settle(pg)
    return a, tr.get_attribute('aria-expanded'), t.is_focused(tr), t.ax(tr)['name'], t.ax(tr).get('hasPopup')


def test_parity_keys(t):
    h, r = t.open(), t.open_react()
    r.mouse.click(5, 5); t.settle(r)  # the React cell holds its panel open, as the HTML one holds the other
    a = drive(t, h, h.locator(DAY))
    b = drive(t, r, t.cell(r, 'DeliveryDay'))
    t.eq('React: the down arrow opens on today, a pick closes and returns focus, the trigger is renamed, as in HTML', b, a)
