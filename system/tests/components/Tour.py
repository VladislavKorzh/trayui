"""Tour: README.md. Each step is a non-modal role="dialog" named by its heading, the steps not shown hidden; the count ("1 of
3") is written for you; the current target gets a dashed ring (data-tour-on) further out than the focus ring, which shows
instead while the target has focus; the panel sits under its target, or over it with no room; Next and Back move focus to
the Next button of the new step; Back on the first step does nothing; every step has a Skip; Escape anywhere in the area
closes the tour as Skip does, also from the part a step covers; when the tour ends focus moves to the part the last step
pointed at, or to the first control inside it; it fires tray:change with { step } and tray:complete with { finished }."""


def shown(root):
    return root.evaluate('r => [...r.querySelectorAll(".tray-tour")].map((s, i) => s.hidden ? null : i).filter(i => i !== null)')


def ringed(root):
    return root.evaluate('r => [...r.querySelectorAll("[data-tour-on]")].map(e => e.id.replace(/^.*-/, ""))')


def test_tree(t):
    pg = t.open()
    root = pg.locator('[data-tray="tour"]')
    t.match_tree('the first step is a dialog named by its heading, with its count and buttons', root.locator('.tray-tour').first, '''
- dialog "Orders move left to right":
  - paragraph: 1 of 3
  - heading "Orders move left to right" [level=2]
  - paragraph: /^Everything new lands/
  - button "Skip the tour"
  - button "Next"
''')
    a = t.ax(root.locator('.tray-tour').first)
    t.check('it is not modal', not a.get('modal') and root.locator('.tray-tour').first.get_attribute('aria-modal') is None, a)
    t.eq('only the first step is shown', shown(root), [0])
    t.check('every step has a Skip', root.evaluate('r => [...r.querySelectorAll(".tray-tour")].every(s => s.querySelector("[data-tour=skip]"))'))
    t.check('the steps come after the screen in the markup', root.evaluate('r => [...r.children].findIndex(c => c.matches(".tray-tour")) > [...r.children].findIndex(c => c.matches(".tray-pagehead"))'))


def test_ring(t):
    pg = t.open()
    root = pg.locator('[data-tray="tour"]')
    t.eq('the target of the step wears the ring', ringed(root), ['tabs'])
    o = t.style(pg.locator('#tr-tabs'), 'outline-style', 'outline-width', 'outline-offset')
    t.eq('a 2px dashed ring, 6px out: further out than the 3px focus ring', (o['outline-style'], o['outline-width'], o['outline-offset']), ('dashed', '2px', '6px'))
    step, target = root.locator('.tray-tour').first.bounding_box(), pg.locator('#tr-tabs').bounding_box()
    t.check('the step sits under its target', step['y'] >= target['y'] + target['height'], (step, target))
    root.locator('.tray-tour').first.get_by_role('button', name='Next').click()
    pg.locator('#tr-new').focus()
    pg.keyboard.press('Shift+Tab')  # the keyboard onto the Export button, the target of step 2
    o = t.style(pg.locator('#tr-export'), 'outline-style', 'outline-width')
    t.eq('while the target has focus, the focus ring shows instead', (t.focused(pg)['id'], o['outline-style'], o['outline-width']), ('tr-export', 'solid', '3px'))


def drive(t, pg, root, ids, p=''):
    t.clear_events(pg)
    steps = root.locator('.tray-tour')
    steps.nth(0).get_by_role('button', name='Next').focus()
    pg.keyboard.press('Enter')
    t.eq(p + 'Next shows the second step', shown(root), [1])
    t.eq(p + 'and writes its count', steps.nth(1).locator('.tray-tour__count').inner_text().strip(), '2 of 3')
    t.check(p + 'focus moves to the Next button of the new step', steps.nth(1).locator('[data-tour="next"]').evaluate('e => e === document.activeElement'), t.focused(pg))
    t.eq(p + 'the ring moves to its target', ringed(root), [ids[1]])
    steps.nth(1).get_by_role('button', name='Back').click()
    t.eq(p + 'Back shows the first step again', shown(root), [0])
    t.check(p + 'with focus on its Next', steps.nth(0).locator('[data-tour="next"]').evaluate('e => e === document.activeElement'), t.focused(pg))
    t.eq(p + 'each move fires tray:change with the step', [e['detail'] for e in t.events(pg, 'tray:change')], [{'step': 2}, {'step': 1}])
    pg.keyboard.press('Enter'); pg.keyboard.press('Enter'); pg.keyboard.press('Enter')
    t.eq(p + 'the last Next ends the tour', (shown(root), ringed(root)), ([], []))
    t.eq(p + 'as finished', [e['detail'] for e in t.events(pg, 'tray:complete')], [{'finished': True}])
    t.eq(p + 'focus moves to the part the last step pointed at', t.focused(pg)['text'], 'New order')


def test_steps(t):
    pg = t.open()
    drive(t, pg, pg.locator('[data-tray="tour"]'), ['tabs', 'export', 'new'])


def test_skip_escape(t):
    pg = t.open()
    root = pg.locator('[data-tray="tour"]')
    root.locator('.tray-tour').first.get_by_role('button', name='Next').click()
    t.clear_events(pg)
    root.locator('.tray-tour').nth(1).get_by_role('button', name='Skip the tour').click()
    t.eq('Skip ends the tour unfinished', [e['detail'] for e in t.events(pg, 'tray:complete')], [{'finished': False}])
    t.eq('focus moves to the part it pointed at', t.focused(pg)['id'], 'tr-export')
    pg = t.open()
    root = pg.locator('[data-tray="tour"]')
    root.locator('.tray-tour').first.get_by_role('button', name='Next').focus()
    pg.keyboard.press('Escape')
    t.eq('Escape in a step closes the tour as Skip does', (shown(root), [e['detail'] for e in t.events(pg, 'tray:complete')]), ([], [{'finished': False}]))
    t.eq('focus moves to the first control inside the part the step pointed at', t.focused(pg)['text'], 'To pack 12')
    pg = t.open()
    root = pg.locator('[data-tray="tour"]')
    pg.locator('#tr-new').focus()
    pg.keyboard.press('Escape')
    t.eq('Escape on the part a step covers closes it too', shown(root), [])
    pg = t.open()
    root = pg.locator('[data-tray="tour"]')
    t.clear_events(pg)
    pg.evaluate('document.querySelector(".tray-tour [data-tour=next]").closest(".tray-tour").querySelector("[data-tour=next]").insertAdjacentHTML("beforebegin", "<button type=button data-tour=back id=b0>Back</button>")')
    pg.click('#b0')
    t.eq('Back on the first step does nothing', (shown(root), t.events(pg)), ([0], []))


def test_above(t):
    pg = t.open()
    root = pg.locator('[data-tray="tour"]')
    # point the second step at the last row of the table: there is no room under it, so the step goes over it
    pg.evaluate('document.querySelector(".tray-table tbody tr:last-child").id = "tr-last"; document.querySelectorAll(".tray-tour")[1].dataset.for = "#tr-last"')
    root.locator('.tray-tour').first.get_by_role('button', name='Next').click()
    step, row, area = root.locator('.tray-tour').nth(1).bounding_box(), pg.locator('#tr-last').bounding_box(), root.bounding_box()
    t.check('with no room under its target, the step sits over it', step['y'] + step['height'] <= row['y'] + 0.5 and step['y'] >= area['y'], (step, row))


def test_phone(t):
    pg = t.open(width=390)
    root = pg.locator('[data-tray="tour"]')
    area, step = root.bounding_box(), root.locator('.tray-tour').first.bounding_box()
    t.check('on a phone the step stays inside the area', step['x'] >= area['x'] and step['x'] + step['width'] <= area['x'] + area['width'] + 0.5, (area, step))


def test_parity_steps(t):
    pg = t.open_react()
    drive(t, pg, t.cell(pg, 'FirstStep'), ['tabs', 'export', 'new'], 'react: ')


def test_react_skip(t):
    pg = t.open_react()
    t.check('react: every step has a Skip', t.cell(pg, 'FirstStep').evaluate('r => [...r.querySelectorAll(".tray-tour")].every(s => s.querySelector("[data-tour=skip]"))'))



PARITY = [('.tray-tour >> nth=0', 'FirstStep', '.tray-tour >> nth=0'),
          ('.tray-pagehead nav', 'FirstStep', '.tray-pagehead nav')]
