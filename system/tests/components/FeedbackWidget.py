"""Feedback Widget: README.md. The scale is a <fieldset> of native radios: the legend asks the question, each number names
its radio, Tab enters the group and the arrow keys move the choice; the first and last radios are described by the named
ends; choosing a number shows the reason box and leaves focus where it is; sending hides the question, shows the thanks and
moves focus to it; it fires tray:complete with { rating, comment }; the tile under focus shows the 3px ink ring."""


def test_tree(t):
    pg = t.open()
    form = pg.locator('form').first
    t.match_tree('a group asked by its legend, of radios named 0 to 10', form, '''
- group "How likely are you to recommend Counter to another farm?":
  - radio "0"
  - radio "1"
  - radio "5"
  - radio "10"
''')
    t.eq('0 is read with "Not at all"', t.ax(form.locator('input[value="0"]'))['description'], 'Not at all')
    t.eq('and 10 with "Very"', t.ax(form.locator('input[value="10"]'))['description'], 'Very')
    t.check('the reason and the thanks wait hidden', not form.locator('[data-feedback="more"]').is_visible() and not form.locator('[data-feedback="thanks"]').is_visible())


def drive(t, pg, form, p=''):
    t.clear_events(pg)
    form.locator('input[name="rating"]').first.focus()
    pg.keyboard.press('Shift+Tab'); pg.keyboard.press('Tab')  # into the group from the keyboard
    first = t.focused(pg)
    t.eq(p + 'Tab enters the group on its first radio', (first['tag'], first['type']), ('input', 'radio'))
    pg.keyboard.press('ArrowRight')
    pg.keyboard.press('ArrowRight')
    t.eq(p + 'the arrow keys move the choice', form.locator('input[name="rating"]:checked').get_attribute('value'), '2')
    t.check(p + 'choosing shows the reason box', form.locator('[data-feedback="more"]').is_visible())
    f = t.focused(pg)
    t.eq(p + 'and leaves focus where it is', (f['tag'], f['type']), ('input', 'radio'))
    o = t.style(form.locator('input[name="rating"]:checked + span'), 'outline-style', 'outline-width')
    t.eq(p + 'the tile under focus shows the 3px ring', (o['outline-style'], o['outline-width']), ('solid', '3px'))
    form.locator('textarea').fill('Labels print in one go.')
    form.get_by_role('button', name='Send').click()
    t.check(p + 'sending hides the question and shows the thanks', not form.locator('[data-feedback="ask"]').is_visible() and form.locator('[data-feedback="thanks"]').is_visible())
    t.check(p + 'focus moves to the thanks, so it is read', form.locator('[data-feedback="thanks"]').evaluate('e => e === document.activeElement'), t.focused(pg))
    ev = t.events(pg, 'tray:complete')
    t.eq(p + 'it fires tray:complete with the rating and the comment', [e['detail'] for e in ev], [{'rating': '2', 'comment': 'Labels print in one go.'}])


def test_answer(t):
    pg = t.open()
    drive(t, pg, pg.locator('form').first)
    second = pg.locator('form').nth(1)
    second.get_by_role('button', name='Send').click()
    t.eq('a rating chosen beforehand is sent as it is', t.events(pg, 'tray:complete')[-1]['detail'], {'rating': '4', 'comment': 'The label printer went offline twice.'})


def test_parity_answer(t):
    pg = t.open_react()
    cell = t.cell(pg, 'Scales')
    form = cell.locator('form').first
    t.eq('react: 0 is read with "Not at all"', t.ax(form.locator('input[value="0"]'))['description'], 'Not at all')
    t.eq('react: and 10 with "Very"', t.ax(form.locator('input[value="10"]'))['description'], 'Very')
    drive(t, pg, form, 'react: ')


PARITY = [('form:nth-of-type(1) fieldset', 'Scales', 'form:nth-of-type(1) fieldset'),
          ('form:nth-of-type(2)', 'Scales', 'form:nth-of-type(2)')]
