"""Toast: README.md. TrayUI.toast({ title, text, tone, action, duration }) adds a toast to a live region the script makes: a
role="region" named "Notifications" with aria-live="polite", at the end of the page; a danger toast is a role="alert"; the
first toast in a region just made has its words put in again a moment later. Focus stays where it was. A danger toast and a
toast with an action stay until dismissed; any other leaves after `duration` (5000ms by default) and waits while the pointer
or focus is on it. Dismissing a toast, or running its action, moves focus that was in it to the next toast, or back to the
control it came from. The close button is named "Dismiss"; a tone comes with its icon. Toasts stack at the bottom end
corner. Under reduced motion a toast appears and goes at once; otherwise it rises in and sinks out, then is taken away."""

HTML = {'archive': '#ts-a', 'receipt': '#ts-b', 'fail': '#ts-c'}
REACT = {'archive': 'Archive an order', 'receipt': 'Send a receipt', 'fail': 'Fail an export'}


def maker(pg, react):
    if react:
        cell = pg.locator('[data-cell="Tones"]')
        return lambda k: cell.get_by_role('button', name=REACT[k]).click()
    return lambda k: pg.click(HTML[k])


def toasts(pg):
    return pg.locator('.tray-toasts .tray-toast')


def drive_region(t, pg, react, p=''):
    make = maker(pg, react)
    make('receipt')
    region = pg.locator('.tray-toasts')
    t.check(p + 'the first toast makes the region, at the end of the page', region.count() == 1 and pg.evaluate('document.body.lastElementChild.classList.contains("tray-toasts")'))
    a = t.ax(region)
    t.eq(p + 'the region is named "Notifications" and polite', (a['role'], a['name'], region.get_attribute('aria-live')), ('region', 'Notifications', 'polite'))
    t.match_tree(p + 'the toast says what happened, with its Dismiss button', region, '''
- region "Notifications":
  - paragraph: Receipt sent
  - paragraph: To dana@example.com
  - button "Dismiss"
''')
    st = t.style(toasts(pg).first, 'border-top-left-radius', 'box-shadow')
    t.check(p + 'a raised row with 16px corners and the float shadow', st['border-top-left-radius'] == '16px' and st['box-shadow'] != 'none', st)
    t.check(p + 'a success toast has its icon, aria-hidden', toasts(pg).first.evaluate('e => !!e.querySelector(":scope > svg.tray-icon[aria-hidden=true]")'))
    t.eq(p + 'focus stays where it was', t.focused(pg)['text'], 'Send a receipt')
    make('fail')
    t.eq(p + 'a danger toast is an alert, read at once', toasts(pg).nth(1).get_attribute('role'), 'alert')
    t.check(p + 'with its icon beside the words', toasts(pg).nth(1).evaluate('e => !!e.querySelector(":scope > svg.tray-icon[aria-hidden=true]")'))
    t.eq(p + 'the region holds no more than one of each', toasts(pg).count(), 2)
    box = region.bounding_box(); vp = pg.viewport_size
    t.check(p + 'toasts stack at the bottom end corner', vp['width'] - (box['x'] + box['width']) < 24 and vp['height'] - (box['y'] + box['height']) < 24, (box, vp))


def test_region(t):
    pg = t.open()
    drive_region(t, pg, False)


def test_reinsert(t):
    pg = t.open()
    pg.clock.install()
    pg.evaluate('''() => { window.__moves = []; new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('tray-toast__body')) window.__moves.push(n.textContent); })
                    .observe(document.body, { childList: true, subtree: true }); }''')
    pg.click('#ts-b')
    pg.clock.run_for(300)
    t.eq('the first toast in a new region has its words put in again a moment later', pg.evaluate('window.__moves'), ['Receipt sentTo dana@example.com'])
    pg.click('#ts-a')
    pg.clock.run_for(300)
    t.eq('the next one does not need it', len(pg.evaluate('window.__moves')), 1)


def drive_timers(t, pg, react, p=''):
    pg.clock.install()
    make = maker(pg, react)
    make('receipt'); make('fail'); make('archive')
    pg.clock.run_for(5200)
    left = [x.strip() for x in toasts(pg).locator('.tray-toast__title').all_inner_texts()]
    t.eq(p + 'after 5 seconds the plain toast has left; the danger one and the one with an action stay', left, ['The export failed', 'Order archived'])
    make('receipt')
    toasts(pg).last.hover()
    pg.clock.run_for(6000)
    t.eq(p + 'the timer waits while the pointer is on the toast', toasts(pg).count(), 3)
    pg.mouse.move(5, 5)
    pg.clock.run_for(5200)
    t.eq(p + 'and starts again when it leaves', toasts(pg).count(), 2)
    make('receipt')
    toasts(pg).last.locator('[data-dismiss], button[aria-label="Dismiss"]').last.focus()
    pg.clock.run_for(6000)
    t.eq(p + 'the timer waits while focus is in the toast', toasts(pg).count(), 3)


def test_timers(t):
    drive_timers(t, t.open(), False)


def drive_focus(t, pg, react, p=''):
    make = maker(pg, react)
    make('archive')
    make('receipt')
    came = t.focused(pg)['text']
    toasts(pg).nth(1).get_by_role('button', name='Dismiss').focus()
    pg.keyboard.press('Enter')
    f = t.focused(pg)
    t.eq(p + 'dismissing the last toast moves focus to the other toast', (f['text'], toasts(pg).count()), ('Undo', 1))
    pg.keyboard.press('Enter')
    titles = [x.strip() for x in toasts(pg).locator('.tray-toast__title').all_inner_texts()]
    t.eq(p + 'its action runs and the toast goes: "Order restored" takes its place', titles, ['Order restored'])
    t.eq(p + 'focus moves on to the next toast', t.focused(pg)['label'], 'Dismiss')
    pg.keyboard.press('Enter')
    f = t.focused(pg)
    t.eq(p + 'with no toast left, focus goes back to the control it came from', (f['text'], toasts(pg).count()), (came, 0))
    t.check(p + 'focus is never dropped to the page', not f['body'])


def test_focus(t):
    drive_focus(t, t.open(), False)


def test_motion(t):
    pg = t.open(motion='no-preference')
    pg.click('#ts-b')
    t.eq('a toast rises in', t.style(toasts(pg).first, 'animation-name'), 'tray-rise')
    t.settle(pg)
    toasts(pg).first.get_by_role('button', name='Dismiss').click()
    t.eq('it sinks out when dismissed', t.style(toasts(pg).first, 'animation-name'), 'tray-sink')
    t.settle(pg)
    pg.wait_for_timeout(50)
    t.eq('then it is taken away', toasts(pg).count(), 0)
    pg.close()
    pg = t.open(motion='reduce')
    pg.click('#ts-b')
    t.eq('under reduced motion it appears at once', t.style(toasts(pg).first, 'animation-name'), 'none')
    toasts(pg).first.get_by_role('button', name='Dismiss').click()
    t.eq('and goes at once', toasts(pg).count(), 0)


def test_tree(t):
    pg = t.open()
    t.match_tree('the toasts drawn in the preview: two statuses and an alert, each with Dismiss', pg.locator('.tray-stage'), '''
- status:
  - paragraph: Order archived
  - button "Undo"
  - button "Dismiss"
- status:
  - paragraph: Receipt sent
  - paragraph: To dana@example.com
  - button "Dismiss"
- alert:
  - paragraph: The export failed
  - paragraph: Check the connection and try again.
  - button "Retry"
  - button "Dismiss"
''')


def test_rtl(t):
    pg = t.open(rtl=True)
    pg.click('#ts-b')
    box = pg.locator('.tray-toasts').bounding_box()
    t.check('right to left, toasts stack at the bottom left', box['x'] < 24, box)


def test_parity_region(t):
    drive_region(t, t.open_react(), True, 'react: ')


def test_parity_timers(t):
    drive_timers(t, t.open_react(), True, 'react: ')


def test_parity_focus(t):
    drive_focus(t, t.open_react(), True, 'react: ')


def test_react_managed(t):
    pg = t.open_react()
    cell = t.cell(pg, 'ManagedHere')
    cell.get_by_role('button', name='Dismiss').first.click()
    try:
        pg.wait_for_function('() => document.querySelectorAll(\'[data-cell="ManagedHere"] .tray-toast\').length === 1', timeout=1500)
    except Exception:
        pass
    t.eq('react: a toast managed by the page goes through onDismiss', cell.locator('.tray-toast').count(), 1)


PARITY = [('.tray-stage .tray-toast:nth-child(2)', 'Tones', '.tray-stage .tray-toast:nth-child(2)')]
