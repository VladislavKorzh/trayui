"""Select: README.md, Markup and Accessibility. The behaviour gives the panel role="listbox", an id and the trigger's name;
the trigger aria-haspopup="listbox", aria-controls and aria-expanded, and the value in its aria-labelledby ("Jar size 50 g");
every option tabindex="-1" and aria-selected. Enter, Space, ArrowDown or ArrowUp open the list on the chosen option, or on
the first; in the list the arrows move, Home and End jump, a letter goes to the next option that starts with it (again for
the one after), Enter or Space choose, Escape closes; Tab closes and goes on, Shift+Tab closes and returns to the trigger; a
choice and Escape return focus to the trigger; an aria-disabled option is passed over and cannot be chosen; each group is
named by its label and the rule is hidden; the chosen option is semibold with a check; the hidden input carries the value
and the anchor fires tray:change with detail.value. Guide, forced colours: the option under the keyboard is Highlight."""

S1 = '[data-tray="select"] >> nth=0'
S2 = '[data-tray="select"] >> nth=1'


def focused_option(pg):
    return pg.evaluate('document.activeElement.getAttribute("role") === "option" ? document.activeElement.textContent.trim() : document.activeElement.className')


def test_tree(t):
    pg = t.open()
    trig = pg.locator(S1).locator('.tray-select-trigger')
    a = t.ax(trig)
    t.eq('the trigger is a button that opens a listbox, named by its label and its value', (a['role'], a['name'], a.get('hasPopup'), a.get('expanded')), ('button', 'Jar size Choose a jar', 'listbox', False))
    panel = pg.locator(S1).locator('.tray-pop')
    t.eq('it controls the list', trig.get_attribute('aria-controls'), panel.get_attribute('id'))
    t.eq('every option is out of the Tab order and not selected', pg.locator(S1).locator('[role=option]').evaluate_all('os => os.map(o => o.tabIndex + ":" + o.getAttribute("aria-selected"))'), ['-1:false'] * 3)
    t.match_tree('the open list: a listbox named as its trigger, groups named by their labels', pg.locator(S2), '''
- button "Delivery Courier, chilled box" [expanded]
- listbox "Delivery":
  - group "To your door":
    - option "Courier, chilled box" [selected]
    - option "Express, two hours"
  - group "Collect it yourself":
    - option "Farm shop"
    - option "Parcel locker" [disabled]
''')
    t.eq('the rule between groups is hidden', pg.locator(S2).locator('.tray-list__rule').get_attribute('aria-hidden'), 'true')
    chosen = pg.locator(S2).locator('[aria-selected="true"]')
    t.eq('the chosen option is semibold', t.style(chosen.locator('.tray-option__text'), 'font-weight'), '600')
    t.check('with a check', chosen.locator('.tray-option__check').is_visible() and not pg.locator(S2).locator('[aria-selected="false"] .tray-option__check').first.is_visible())


def test_open_keys(t):
    for key in ('Enter', 'Space', 'ArrowDown', 'ArrowUp'):
        pg = t.open()
        pg.mouse.click(5, 5)  # close the list the preview holds open
        t.settle(pg)
        trig = pg.locator(S1).locator('.tray-select-trigger')
        trig.focus()
        pg.keyboard.press(key)
        t.eq(f'{key} opens the list on the first option when none is chosen', (trig.get_attribute('aria-expanded'), focused_option(pg)), ('true', '30 g'))
        pg.close()
    pg = t.open()
    pg.mouse.click(5, 5); t.settle(pg)
    trig2 = pg.locator(S2).locator('.tray-select-trigger')
    trig2.focus(); pg.keyboard.press('ArrowDown')
    t.eq('the list opens on the chosen option', focused_option(pg), 'Courier, chilled box')


def test_list_keys(t):
    pg = t.open()
    pg.mouse.click(5, 5); t.settle(pg)
    trig = pg.locator(S2).locator('.tray-select-trigger')
    trig.focus(); pg.keyboard.press('Enter')
    pg.keyboard.press('ArrowDown')
    t.eq('ArrowDown moves to the next option', focused_option(pg), 'Express, two hours')
    pg.keyboard.press('End')
    t.eq('End jumps to the last option that can be chosen', focused_option(pg), 'Farm shop')
    pg.keyboard.press('ArrowDown')
    t.eq('the arrows pass over a disabled option', focused_option(pg), 'Courier, chilled box')
    pg.keyboard.press('Home')
    t.eq('Home jumps to the first', focused_option(pg), 'Courier, chilled box')
    pg.keyboard.press('ArrowUp')
    t.eq('ArrowUp from the first goes round to the last', focused_option(pg), 'Farm shop')
    pg.keyboard.press('p')
    t.eq('a letter of a disabled option goes nowhere', focused_option(pg), 'Farm shop')
    pg.keyboard.press('e')
    t.eq('a letter goes to the next option that starts with it', focused_option(pg), 'Express, two hours')
    t.clear_events(pg)
    pg.keyboard.press('Space')
    t.settle(pg)
    t.eq('Space chooses, closes the list and returns focus to the trigger', (trig.get_attribute('aria-expanded'), t.focused(pg)['cls'].startswith('tray-select-trigger')), ('false', True))
    t.eq('it fires tray:change with the value', [e['detail'] for e in t.events(pg, 'tray:change')], [{'value': 'express'}])
    t.eq('the trigger is named by its label and the new value', t.ax(trig)['name'], 'Delivery Express, two hours')
    t.eq('the chosen option is marked', pg.locator(S2).locator('[aria-selected="true"]').inner_text().strip(), 'Express, two hours')


def test_letters(t):
    pg = t.open()
    pg.evaluate('''() => { const l = document.querySelector('[data-tray="select"] .tray-list');
        for (const [v, w] of [['200', '200 g'], ['250', '250 g']]) l.insertAdjacentHTML('beforeend', `<button type="button" class="tray-option" role="option" data-value="${v}"><span class="tray-option__text">${w}</span></button>`); }''')
    # the options added after the behaviour started are not tabindex=-1, but the letters still find them
    pg.mouse.click(5, 5); t.settle(pg)
    pg.locator(S1).locator('.tray-select-trigger').click()
    pg.keyboard.press('2')
    first = focused_option(pg)
    pg.keyboard.press('2')
    t.eq('the same letter pressed again walks through the options that start with it', (first, focused_option(pg)), ('200 g', '250 g'))
    pg.keyboard.press('2')
    t.eq('and round again', focused_option(pg), '200 g')


def test_choose_and_close(t):
    pg = t.open()
    pg.mouse.click(5, 5); t.settle(pg)
    trig = pg.locator(S1).locator('.tray-select-trigger')
    trig.click()
    t.clear_events(pg)
    pg.locator(S1).locator('[role=option]').nth(1).click()
    t.settle(pg)
    t.eq('a click chooses: the value shows, the list closes', (pg.locator(S1).locator('.tray-select-trigger__value').inner_text(), pg.locator(S1).locator('.tray-pop').is_visible()), ('50 g', False))
    t.eq('the placeholder look goes', trig.get_attribute('data-placeholder'), None)
    t.eq('the hidden input carries the value', pg.input_value('input[name="jar"]'), '50')
    t.eq('tray:change says so', [e['detail'] for e in t.events(pg, 'tray:change')], [{'value': '50'}])
    t.check('focus is back on the trigger', t.focused(pg)['cls'].startswith('tray-select-trigger'), t.focused(pg))
    trig.focus(); pg.keyboard.press('Enter')
    pg.keyboard.press('Escape'); t.settle(pg)
    t.eq('Escape closes the list and returns focus to the trigger', (trig.get_attribute('aria-expanded'), t.focused(pg)['cls'].startswith('tray-select-trigger')), ('false', True))
    pg.keyboard.press('Enter')
    pg.keyboard.press('Tab'); t.settle(pg)
    t.eq('Tab closes the list and goes on to what follows', (trig.get_attribute('aria-expanded'), t.focused(pg)['text']), ('false', 'Courier, chilled box'))
    pg.keyboard.press('Shift+Tab')
    trig.focus(); pg.keyboard.press('Enter'); pg.keyboard.press('ArrowDown')
    pg.keyboard.press('Shift+Tab'); t.settle(pg)
    t.eq('Shift+Tab closes it and returns to the trigger', (trig.get_attribute('aria-expanded'), t.focused(pg)['cls'].startswith('tray-select-trigger')), ('false', True))
    # a disabled option cannot be chosen, by a click or a key
    t2 = pg.locator(S2)
    t2.locator('.tray-select-trigger').click()
    t2.locator('[data-value="locker"]').click(force=True)
    t.eq('a disabled option cannot be chosen', t2.locator('[aria-selected="true"]').get_attribute('data-value'), 'courier')


def test_focus_ring(t):
    pg = t.open()
    pg.mouse.click(5, 5); t.settle(pg)
    pg.locator(S2).locator('.tray-select-trigger').focus(); pg.keyboard.press('ArrowDown')
    opt = pg.locator(':focus')
    s = t.style(opt, 'outline-style', 'outline-offset')
    t.check('focus draws its ring inside the option', s['outline-style'] == 'solid' and s['outline-offset'].startswith('-'), s)


def test_forced_colours(t):
    pg = t.open(forced=True)
    pg.mouse.click(5, 5); t.settle(pg)
    pg.locator(S2).locator('.tray-select-trigger').focus(); pg.keyboard.press('ArrowDown'); pg.keyboard.press('ArrowDown')
    c = t.system_colors(pg)
    t.eq('with forced colours the option under the keyboard is Highlight', t.style(pg.locator(':focus'), 'background-color'), c['Highlight'])
    t.eq('its words HighlightText, and its focus ring too', (t.style(pg.locator(':focus .tray-option__text'), 'color'), t.style(pg.locator(':focus'), 'outline-color')), (c['HighlightText'], c['HighlightText']))


PARITY = [('.tray-field:nth-child(1)', 'InAForm', '.tray-field:nth-child(1)'), ('.tray-field:nth-child(2)', 'InAForm', '.tray-field:nth-child(2)')]


def drive(t, pg, root):
    trig = root.locator('.tray-select-trigger')
    trig.focus(); pg.keyboard.press('ArrowDown')
    a = focused_option(pg)
    pg.keyboard.press('ArrowDown'); pg.keyboard.press('f')
    b = focused_option(pg)
    t.clear_events(pg)
    pg.keyboard.press('Enter'); t.settle(pg)
    ev = [e['detail'] for e in t.events(pg, 'tray:change')]
    return a, b, trig.get_attribute('aria-expanded'), t.focused(pg)['cls'].startswith('tray-select-trigger'), t.ax(trig)['name'], ev


def test_parity_keys(t):
    h, r = t.open(), t.open_react()
    h.mouse.click(5, 5); r.mouse.click(5, 5); t.settle(h); t.settle(r)
    a = drive(t, h, h.locator(S2))
    b = drive(t, r, t.cell(r, 'InAForm').locator('.tray-field').nth(1))
    t.eq('React: the keys open, move, jump by letter and choose as in HTML', b, a)
