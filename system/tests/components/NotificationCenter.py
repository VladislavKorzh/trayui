"""Notification Center: README.md. The bell is an icon button whose name the behaviour keeps in step with the count
("Notifications, 2 unread"); the pip repeats it and is aria-hidden; as a Popover trigger it reports aria-expanded and Escape
closes the panel and returns focus to it; opening the panel puts focus on "Mark all as read", which is never disabled: with
nothing unread it is aria-disabled="true" and keeps focus once pressed; opening a notification removes data-unread and the
hidden word "Unread"; the All and Unread switch (a radio group named by its aria-label) filters the list, and in the Unread
view a notification that is read leaves the list and focus on it moves to the next one left, or to "Nothing unread."; it fires
tray:change with { unread }."""


BELL = '[data-tray="popover"] > button'


def test_tree(t):
    pg = t.open()
    bell = t.ax(pg.locator(BELL))
    t.eq('the behaviour adds the count to the bell\'s name', bell['name'], 'Notifications, 2 unread')
    t.eq('the open panel shows on the bell as aria-expanded', bell.get('expanded'), True)
    t.eq('the pip shows the count and is aria-hidden', (pg.inner_text('[data-notices-count]'), pg.get_attribute('[data-notices-count]', 'aria-hidden')), ('2', 'true'))
    t.match_tree('a heading, Mark all as read, the radio group, one link a notification, the unread ones ending in "Unread"', pg.locator('.tray-notices'), '''
- heading "Notifications" [level=2]
- button "Mark all as read"
- radiogroup "Show":
  - radio "All" [checked]
  - radio "Unread"
- list:
  - listitem:
    - link "Dana Kovalenko placed order PL-20431, two jars of 50 g. 4 minutes ago Unread"
  - listitem:
    - link "The courier could not reach the address for PL-20418. 32 minutes ago Unread"
  - listitem:
    - link "Invoice CN-0042 was paid, $29.00. Yesterday, 09:12"
  - listitem:
    - link "Bohdan Savchuk joined the workspace as a packer. 12 November"
''')
    t.check('every avatar is aria-hidden: the sentence names the actor', pg.evaluate('[...document.querySelectorAll(".tray-notice .tray-avatar")].every(a => a.getAttribute("aria-hidden") === "true")'))
    t.eq('the unread ones are told apart in full ink, with the mark and the hidden word', pg.evaluate('''(() => { const u = document.querySelector('.tray-notice[data-unread]'), r = document.querySelector('.tray-notice:not([data-unread])');
        return [getComputedStyle(u).color !== getComputedStyle(r.querySelector('.tray-notice__body > span')).color || getComputedStyle(u.querySelector('.tray-notice__body > span')).color !== getComputedStyle(r.querySelector('.tray-notice__body > span')).color,
                getComputedStyle(u.querySelector('.tray-notice__mark')).backgroundColor !== getComputedStyle(r.querySelector('.tray-notice__mark')).backgroundColor, !!u.querySelector('.tray-vh')]; })()'''), [True, True, True])


def test_keys(t):
    pg = t.open()
    bell = pg.locator(BELL)
    bell.focus(); pg.keyboard.press('Escape'); t.settle(pg)
    t.check('Escape closes the panel the preview holds open', not pg.locator('.tray-notices').is_visible())
    t.eq('and aria-expanded follows', bell.get_attribute('aria-expanded'), 'false')
    pg.keyboard.press('Enter')
    t.eq('opening the panel puts focus on Mark all as read', t.focused(pg)['text'], 'Mark all as read')
    pg.keyboard.press('Escape'); t.settle(pg)
    t.check('Escape returns focus to the bell', t.focused(pg)['label'].startswith('Notifications') and not pg.locator('.tray-notices').is_visible(), t.focused(pg))


def test_read(t):
    pg = t.open()
    first = pg.locator('.tray-notice').first
    first.click()
    t.check('opening a notification takes away its data-unread and the hidden word', not first.get_attribute('data-unread') and first.locator('.tray-vh').count() == 0)
    t.eq('the bell\'s name follows the count', pg.get_attribute(BELL, 'aria-label'), 'Notifications, 1 unread')
    t.eq('and the pip', pg.inner_text('[data-notices-count]'), '1')
    t.eq('it fires tray:change with the unread count', [e['detail'] for e in t.events(pg, 'tray:change')], [{'unread': 1}])
    t.clear_events(pg)
    all_ = pg.locator('[data-notices="read-all"]')
    all_.focus(); pg.keyboard.press('Enter')
    t.eq('Mark all as read clears the rest', pg.locator('.tray-notice[data-unread]').count(), 0)
    t.eq('the bell loses its count', pg.get_attribute(BELL, 'aria-label'), 'Notifications')
    t.eq('the pip empties (and so hides)', (pg.inner_text('[data-notices-count]'), pg.locator('[data-notices-count]').is_visible()), ('', False))
    t.eq('Mark all as read is aria-disabled, not disabled', (all_.get_attribute('aria-disabled'), all_.evaluate('e => e.disabled')), ('true', False))
    t.check('and keeps focus', t.focused(pg)['text'] == 'Mark all as read', t.focused(pg))
    t.eq('it fired tray:change with no unread left', [e['detail'] for e in t.events(pg, 'tray:change')], [{'unread': 0}])
    t.clear_events(pg)
    pg.keyboard.press('Enter')
    t.eq('pressed again with nothing unread it does nothing', t.events(pg, 'tray:change'), [])
    t.eq('the AX node says it is unavailable', t.ax(all_).get('disabled'), True)


def test_unread_view(t):
    pg = t.open()
    pg.locator('input[value="unread"]').check()
    rows = pg.locator('.tray-notices__list > li')
    t.eq('the Unread view shows the unread ones only', [rows.nth(i).is_visible() for i in range(4)], [True, True, False, False])
    second = pg.locator('.tray-notice').nth(1)
    first = pg.locator('.tray-notice').first
    first.focus(); pg.keyboard.press('Enter')
    t.check('a notification read in the Unread view leaves the list', not rows.nth(0).is_visible())
    t.check('and focus on it moves to the next one left', second.evaluate('e => e === document.activeElement'), t.focused(pg))
    pg.keyboard.press('Enter')
    t.check('when the last one goes, "Nothing unread." shows', pg.locator('[data-notices="empty"]').is_visible())
    f = t.focused(pg)
    t.check('and takes the focus', f['text'] == 'Nothing unread.' and not f['body'], f)
    pg.locator('input[value="all"]').check()
    t.eq('the All view brings every notification back', [rows.nth(i).is_visible() for i in range(4)], [True, True, True, True])
    t.check('and hides "Nothing unread."', not pg.locator('[data-notices="empty"]').is_visible())


def test_forced_colours(t):
    pg = t.open(forced=True)
    sys = t.system_colors(pg)
    mark = pg.locator('.tray-notice[data-unread] .tray-notice__mark').first
    t.eq('with forced colours the unread mark is drawn in Highlight', t.style(mark, 'background-color'), sys['Highlight'])


def test_react(t):
    pg = t.open_react()
    cell = t.cell(pg, 'Open')
    bell = cell.locator('.tray-anchor > button').first
    t.eq('react: the bell says the count', t.ax(bell)['name'], 'Notifications, 2 unread')
    t.eq('react: the pip is aria-hidden', cell.locator('.tray-pip').first.get_attribute('aria-hidden'), 'true')
    cell.locator('.tray-notice').first.click()
    t.eq('react: opening a notification lowers the count', bell.get_attribute('aria-label'), 'Notifications, 1 unread')
    all_ = cell.locator('button', has_text='Mark all as read')
    all_.focus(); pg.keyboard.press('Enter')
    t.eq('react: Mark all as read is aria-disabled, not disabled, and keeps focus', (all_.get_attribute('aria-disabled'), all_.evaluate('e => e.disabled'), t.focused(pg)['text']), ('true', False, 'Mark all as read'))
    t.eq('react: the bell loses its count', bell.get_attribute('aria-label'), 'Notifications')


PARITY = [('.tray-notices', 'Open', '.tray-notices')]


# Static parity (trayui-react/static): the panel carries data-tray="notices" there, with the bell's count, "Mark all as
# read" and the view radios as the behaviour names them; bundle.js marks notifications read, counts them and filters the view.
STATIC = True
STATIC_SKIP = {'KeepingTheCount': "the sentence under the bell follows the preview's own React state (onRead), which a static page's own script keeps; Open checks the same panel"}
