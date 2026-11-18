"""Command: README.md, Accessibility. The field gets role="combobox", aria-expanded="true" and aria-controls naming the
list, which becomes a listbox; each data-group is a group named by its label; the highlight is aria-activedescendant and
focus stays in the field. Up and down move the highlight and wrap, Enter runs it (tray:select with detail.value: the
option's data-value, or else its name), Escape closes the dialog around it. Typing filters by the option's name, not its
shortcut keys; a group with nothing left disappears; the first match is highlighted; a hidden status line says how many
are left ("3 matches", or data-found's words), or the no-match sentence, only when those words change. An option's name is
all its text, shortcut keys included, its icon aria-hidden. The search row draws the 2px ink ring of a field inside its
edge while the field has focus. Options are 44px (guides/3-accessibility.md, Targets); the one under the keyboard is
Highlight with forced colours."""

CMD = '[data-tray="command"]'

# The harness measures a target by what answers a press inside the window, and the list scrolls (20rem high): its last
# option is half out of view at load, so it measures 31px. Its box is 44px, as test_targets checks below.
NO44 = {'.tray-command__list': 'the list scrolls; its last option is partly scrolled out of view, and its box is checked in test_targets'}


def active(pg, scope):
    inp = scope.locator('input')
    i = inp.get_attribute('aria-activedescendant')
    return pg.locator(f'[id="{i}"] .tray-option__text').inner_text() if i else None


def test_tree(t):
    pg = t.open()
    t.match_tree('a combobox over a listbox of named groups of options, shortcut keys in the names', pg.locator(CMD), '''
- combobox "Command" [expanded]
- listbox:
  - group "Go to":
    - option "Orders G O"
    - option "Batches G B"
    - option "Field notes"
  - group "Actions":
    - option "Create an order Ctrl N"
    - option "Export orders"
    - option "Switch to the dark theme"
- status
''')
    a = t.ax(pg.locator(f'{CMD} input'))
    lst = pg.locator(f'{CMD} .tray-command__list')
    t.eq('the field is a combobox, expanded, controlling the list', (a['role'], a['name'], a.get('expanded'), a.get('controls')), ('combobox', 'Command', True, lst.get_attribute('id')))
    t.eq('the list is a listbox', t.ax(lst)['role'], 'listbox')
    t.check('no icon is in the accessibility tree', 'img' not in t.tree(pg.locator(CMD)))
    t.eq('the first option is highlighted at first', active(pg, pg.locator(CMD)), 'Orders')


def drive(t, pg, scope, who='', events=True):
    inp = scope.locator('input')
    inp.focus()
    t.clear_events(pg)
    pg.keyboard.press('ArrowUp')
    t.eq(who + 'ArrowUp from the first option wraps to the last', active(pg, scope), 'Switch to the dark theme')
    pg.keyboard.press('ArrowDown')
    t.eq(who + 'ArrowDown from the last wraps to the first', active(pg, scope), 'Orders')
    pg.keyboard.press('ArrowDown')
    t.eq(who + 'ArrowDown moves the highlight', active(pg, scope), 'Batches')
    t.check(who + 'focus stays in the field', inp.evaluate('e => e === document.activeElement'))
    pg.keyboard.press('Enter')
    if events:
        t.eq(who + 'Enter runs it: tray:select with its name', [e['detail'] for e in t.events(pg, 'tray:select')], [{'value': 'Batches'}])
    inp.fill('gb')
    t.eq(who + 'typing filters by the name, not by the shortcut keys', scope.locator('[role="option"]:visible').count(), 0)
    inp.fill('order')
    vis = scope.locator('[role="option"]:visible .tray-option__text').all_inner_texts()
    t.eq(who + 'typing filters the options by their names', vis, ['Orders', 'Create an order', 'Export orders'])
    t.eq(who + 'the first match is highlighted', active(pg, scope), 'Orders')
    t.eq(who + 'a status line says how many are left', scope.locator('[role="status"]').inner_text(), '3 matches')
    inp.fill('export')
    t.check(who + 'a group with nothing left disappears', scope.get_by_role('group', name='Go to').count() == 0 and scope.get_by_role('group', name='Actions').count() == 1)
    t.eq(who + 'one match is said in the singular', scope.locator('[role="status"]').inner_text(), '1 match')
    t.clear_events(pg)
    pg.keyboard.press('Enter')
    if events:
        t.eq(who + 'Enter runs the match', [e['detail'] for e in t.events(pg, 'tray:select')], [{'value': 'Export orders'}])
    inp.fill('zzz')
    status = scope.locator('[role="status"]').inner_text()
    t.check(who + 'with nothing left the no-match sentence shows and the status says it', scope.locator('.tray-list__empty').is_visible() and 'Nothing matches' in status, status)
    return inp


def test_keys(t):
    pg = t.open()
    scope = pg.locator(CMD)
    inp = drive(t, pg, scope)
    t.scan(pg, 'with nothing left, Light')
    # the status is written only when its words change: count the writes while the same words stay
    scope.locator('[role="status"]').evaluate('s => { window.__writes = 0; new MutationObserver(() => window.__writes++).observe(s, { childList: true, characterData: true, subtree: true }); }')
    inp.fill('zzzz')
    inp.fill('zzzzz')
    t.eq('the status is not written again while its words stay the same', pg.evaluate('window.__writes'), 0)
    scope.evaluate('e => e.dataset.found = "{n} знайдено"')
    inp.fill('or')
    t.eq('data-found words the count in the page\'s language', scope.locator('[role="status"]').inner_text(), '3 знайдено')
    inp.fill('')
    t.eq('an empty field says nothing', scope.locator('[role="status"]').inner_text(), '')
    pg.locator('[role="option"]', has_text='Field notes').hover()
    t.eq('the pointer moves the highlight', active(pg, scope), 'Field notes')
    t.clear_events(pg)
    pg.locator('[role="option"]', has_text='Field notes').click()
    ran = [e['detail'] for e in t.events(pg, 'tray:select')]
    t.check('a click runs the option and keeps focus in the field', ran == [{'value': 'Field notes'}] and inp.evaluate('e => e === document.activeElement'), (ran, t.focused(pg)))
    scope.locator('[role="option"]').nth(3).evaluate('o => o.dataset.value = "new-order"')
    inp.fill('create')
    t.clear_events(pg)
    pg.keyboard.press('Enter')
    t.eq('an option with data-value reports it', [e['detail'] for e in t.events(pg, 'tray:select')], [{'value': 'new-order'}])


def test_ring(t):
    pg = t.open()
    pg.locator(f'{CMD} input').focus()
    ring = t.style(pg.locator('.tray-command__search'), 'outline-style', 'outline-width', 'outline-offset')
    t.eq('with focus in the field the search row draws a 2px ring inside its edge', (ring['outline-style'], ring['outline-width'], ring['outline-offset']), ('solid', '2px', '-2px'))


def test_in_dialog(t):
    pg = t.open()
    pg.evaluate('''() => { const d = document.createElement('dialog'); d.className = 'tray-dialog'; d.setAttribute('data-tray', 'dialog'); d.setAttribute('aria-label', 'Command');
        d.appendChild(document.querySelector('[data-tray="command"]')); document.body.appendChild(d); TrayUI.init(d); d.showModal(); d.querySelector('input').focus(); }''')
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('Escape closes the dialog around it', not pg.evaluate('document.querySelector("dialog").open'))


def test_targets(t):
    pg = t.open()
    hs = pg.locator(f'{CMD} [role="option"]').evaluate_all('os => os.map(o => Math.round(o.getBoundingClientRect().height))')
    t.check('every option is 44px tall', all(h >= 44 for h in hs), hs)


def test_forced(t):
    pg = t.open(forced=True)
    sc = t.system_colors(pg)
    c = t.style(pg.locator(f'{CMD} [role="option"][data-active]'), 'background-color', 'color')
    t.eq('with forced colours the highlighted option is Highlight', (c['background-color'], c['color']), (sc['Highlight'], sc['HighlightText']))


def test_parity_keys(t):
    pg = t.open_react()
    drive(t, pg, t.cell(pg, 'Palette'), 'react: ', events=False)


PARITY = [(CMD, 'Palette', '.tray-command')]
