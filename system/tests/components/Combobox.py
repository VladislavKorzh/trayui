"""Combobox: README.md, Markup and Accessibility. Focus stays in the input; Down and Up move the highlight, Enter takes it,
Escape closes the list; Down opens a closed list, and typing opens it with the first match highlighted. The input gets
role="combobox", aria-autocomplete="list", aria-controls naming the list and an aria-expanded that follows it; the list is
a listbox named as the input; the highlight is aria-activedescendant; the option taken gets aria-selected="true"; the anchor
fires tray:change with detail.value. With nothing to match, a hidden status line says the no-match sentence once, and not
again at each key; the filter looks in every line of an option, the lines kept apart ("kp" does not match "Anna Melnyk"
over "Packing"). Guide, forced colours: the option under the keyboard is Highlight."""

C1, C2 = '#c1', '#c2'
A1 = '[data-tray="combobox"] >> nth=0'
A2 = '[data-tray="combobox"] >> nth=1'


def active(pg, sel):
    i = pg.get_attribute(sel, 'aria-activedescendant')
    return pg.locator(f'#{i}').inner_text().strip().split('\n')[0] if i else None


def shown(pg, anchor):
    return pg.locator(anchor).locator('[role=option]:visible').evaluate_all('os => os.map(o => o.innerText.trim().split("\\n")[0])')


def test_tree(t):
    pg = t.open()
    a = t.ax(pg.locator(C1))
    panel = pg.locator(A1).locator('.tray-pop')
    t.eq('the input is a combobox with a list of suggestions', (a['role'], a['name'], pg.get_attribute(C1, 'aria-autocomplete'), a.get('expanded')), ('combobox', 'City', 'list', False))
    t.eq('it controls the list', pg.get_attribute(C1, 'aria-controls'), panel.get_attribute('id'))
    t.match_tree('the open list is a listbox named as its input', pg.locator(A2), '''
- combobox "Assign to" [expanded]: an
- listbox "Assign to":
  - option "Anna Melnyk Packing"
  - option "Bohdan Shevchuk Courier"
  - option "Oksana Franko Farm manager"
''')
    t.eq('the first match is highlighted', active(pg, C2), 'Anna Melnyk')


def test_keys(t):
    pg = t.open()
    pg.focus(C1)
    pg.keyboard.press('ArrowDown')
    t.eq('Down opens a closed list on the first option', (pg.get_attribute(C1, 'aria-expanded'), active(pg, C1)), ('true', 'Dnipro'))
    pg.keyboard.press('ArrowDown')
    t.eq('Down moves the highlight', active(pg, C1), 'Kharkiv')
    pg.keyboard.press('ArrowUp'); pg.keyboard.press('ArrowUp')
    t.eq('Up moves it back, round to the last', active(pg, C1), 'Uzhhorod')
    t.eq('focus stays in the input', t.focused(pg)['id'], 'c1')
    pg.keyboard.press('Escape'); t.settle(pg)
    t.eq('Escape closes the list, focus stays in the input', (pg.get_attribute(C1, 'aria-expanded'), t.focused(pg)['id']), ('false', 'c1'))
    t.clear_events(pg)
    pg.keyboard.type('l')
    t.eq('typing opens the list with the first match highlighted', (pg.get_attribute(C1, 'aria-expanded'), active(pg, C1), shown(pg, A1)), ('true', 'Lviv', ['Lviv', 'Ternopil']))
    pg.keyboard.type('v')
    t.eq('the list narrows as you type', (shown(pg, A1), active(pg, C1)), (['Lviv'], 'Lviv'))
    pg.keyboard.press('Enter'); t.settle(pg)
    t.eq('Enter takes the highlighted option and closes the list', (pg.input_value(C1), pg.get_attribute(C1, 'aria-expanded')), ('Lviv', 'false'))
    t.eq('the option taken is selected', pg.locator(A1).locator('[aria-selected="true"]').inner_text().strip(), 'Lviv')
    t.eq('it fires tray:change with the value', [e['detail'] for e in t.events(pg, 'tray:change')], [{'value': 'lviv'}])
    t.eq('focus is still in the input', t.focused(pg)['id'], 'c1')


def test_pointer(t):
    pg = t.open()
    pg.click(C1)
    t.check('a click opens the list', pg.locator(A1).locator('.tray-pop').is_visible())
    pg.locator(A1).locator('[data-value="odesa"]').click(); t.settle(pg)
    t.eq('a click on an option takes it, focus stays in the input', (pg.input_value(C1), t.focused(pg)['id']), ('Odesa', 'c1'))


def test_filter(t):
    pg = t.open()
    pg.fill(C2, 'pack')
    t.eq('the filter looks in the second line too', shown(pg, A2), ['Anna Melnyk'])
    pg.fill(C2, 'kp')
    t.eq('the lines are kept apart: "kp" matches nothing', shown(pg, A2), [])


def test_no_match(t):
    pg = t.open()
    status = pg.locator(A1).locator('[role=status]')
    status.evaluate('s => { window.__writes = 0; new MutationObserver(m => { window.__writes += m.length; }).observe(s, { childList: true, characterData: true, subtree: true }); }')
    pg.focus(C1)
    pg.keyboard.type('zz')
    t.check('the no-match sentence shows', pg.locator(A1).locator('.tray-list__empty').is_visible())
    t.eq('and is said through the status line', status.inner_text(), 'No city by that name. Check the spelling.')
    writes = pg.evaluate('window.__writes')
    pg.keyboard.type('zz')
    t.eq('it is not said again at each key while nothing still matches', pg.evaluate('window.__writes'), writes)
    t.eq('the input has no highlight', pg.get_attribute(C1, 'aria-activedescendant'), None)
    # a listbox holds options (WAI-ARIA: required owned elements): one that holds only the sentence is hidden, and the
    # input says it is collapsed, while the status line says the sentence
    t.eq('the list holding no option is hidden from screen readers, the input collapsed', (pg.locator(A1).locator('.tray-pop').get_attribute('aria-hidden'), pg.get_attribute(C1, 'aria-expanded')), ('true', 'false'))
    t.scan(pg, 'the list with nothing to match')
    pg.keyboard.press('Backspace'); pg.keyboard.press('Backspace'); pg.keyboard.press('Backspace'); pg.keyboard.press('Backspace')
    pg.keyboard.type('o')
    t.eq('a match brings the list back', (pg.locator(A1).locator('.tray-pop').get_attribute('aria-hidden'), pg.get_attribute(C1, 'aria-expanded'), status.inner_text()), (None, 'true', ''))
    pg.keyboard.type('qq')
    pg.keyboard.press('Escape'); t.settle(pg)
    t.eq('closing the list empties the status line', status.inner_text(), '')


def test_forced_colours(t):
    pg = t.open(forced=True)
    c = t.system_colors(pg)
    t.eq('with forced colours the highlighted option is Highlight', t.style(pg.locator(A2).locator('[data-active]'), 'background-color'), c['Highlight'])


PARITY = [('.tray-field:nth-child(1)', 'Typing', '.tray-field:nth-child(1)'), ('.tray-field:nth-child(2)', 'Typing', '.tray-field:nth-child(2)')]


def drive(t, pg, anchor, field):
    field.focus()
    pg.keyboard.press('ArrowDown'); pg.keyboard.press('ArrowDown')
    i = field.get_attribute('aria-activedescendant')
    a = pg.locator(f'[id="{i}"]').inner_text().strip() if i else None
    pg.keyboard.press('Escape'); t.settle(pg)
    pg.keyboard.type('lv')
    t.clear_events(pg)
    pg.keyboard.press('Enter'); t.settle(pg)
    return a, field.input_value(), field.get_attribute('aria-expanded'), [e['detail'] for e in t.events(pg, 'tray:change')], t.ax(field)['role']


def test_parity_keys(t):
    h, r = t.open(), t.open_react()
    a = drive(t, h, h.locator(A1), h.locator(C1))
    cell = t.cell(r, 'Typing')
    b = drive(t, r, cell, cell.locator('input').first)
    t.eq('React: the keys move the highlight, filter and take the match as in HTML', b, a)
