"""Dialog: README.md. The browser's own <dialog>, named by its title (aria-labelledby); opened with showModal() it makes the
page behind inert, focus starts on its first control (the Close button, aria-label "Close"), Tab stays inside, Escape
closes it and focus returns to the button that opened it. data-close buttons close it with their value; a press and a
release both on the veil close it (a selection dragged out does not), data-static turns that off. data-modal="false"
shows it in the page: nothing is inert and Escape does not close it. Under reduced motion it only fades, in 0.1s. The
foot's buttons stack on a phone with the action on top."""

OPEN = '[data-target="#dlg-real"]'
REAL = '#dlg-real'


def modal_drive(t, pg, opener, dialog, where):
    """The keys of a modal dialog, the same for the HTML and the React preview. `where` prefixes the check names."""
    opener.click()
    t.check(f'{where}it opens over the page (:modal)', dialog.evaluate('d => d.matches(":modal")'))
    f = t.focused(pg)
    t.eq(f'{where}focus starts on the first control, the Close button', f['label'], 'Close')
    # Tab past the last control leaves the page for the browser's own controls (here: the body), then comes back to the
    # first: it never reaches the page behind
    out = []
    for _ in range(8):
        pg.keyboard.press('Tab')
        if not dialog.evaluate('d => document.activeElement === document.body || d.contains(document.activeElement)'):
            out.append(t.focused(pg))
    t.check(f'{where}Tab stays inside the dialog', not out, out)
    t.check(f'{where}the page behind is inert while it is open', t.ax(opener)['ignored'])
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check(f'{where}Escape closes it', not dialog.evaluate('d => d.open'))
    t.check(f'{where}focus returns to the button that opened it', opener.evaluate('b => b === document.activeElement'), t.focused(pg))


def test_tree(t):
    pg = t.open()
    t.match_tree('the dialog shown in place is a dialog named by its title, with a Close button', pg.locator('.tray-stage'), '''
- dialog "Move the delivery":
  - heading "Move the delivery" [level=2]
  - paragraph: Order PL-20418 is not packed yet, so the day can still move.
  - button "Close"
  - combobox "New day"
  - button "Cancel"
  - button "Save the day"
''')
    pg.click(OPEN)
    a = t.ax(pg.locator(REAL))
    t.eq('opened with showModal(): a modal dialog named "Leave a note"', (a['role'], a['name'], a.get('modal')), ('dialog', 'Leave a note', True))
    t.match_tree('its field and its buttons say what they do', pg.locator(REAL), '''
- dialog "Leave a note":
  - heading "Leave a note" [level=2]
  - button "Close"
  - textbox "For the courier"
  - button "Cancel"
  - button "Save the note"
''')
    t.scan(pg, 'Light, opened over the page')


def test_keys(t):
    pg = t.open()
    t.eq('the opener says it opens a dialog (aria-haspopup="dialog")', t.ax(pg.locator(OPEN)).get('hasPopup'), 'dialog')
    modal_drive(t, pg, pg.locator(OPEN), pg.locator(REAL), '')
    t.eq('Escape leaves an empty returnValue', pg.evaluate('document.getElementById("dlg-real").returnValue'), '')


def test_close_buttons_and_veil(t):
    pg = t.open()
    d = pg.locator(REAL)
    pg.click(OPEN)
    pg.click(f'{REAL} [data-close][value="save"]')
    t.settle(pg)
    t.check('a data-close button closes it', not d.evaluate('d => d.open'))
    t.eq('with its value as the returnValue', d.evaluate('d => d.returnValue'), 'save')
    t.check('and focus returns to the opener', pg.locator(OPEN).evaluate('b => b === document.activeElement'), t.focused(pg))
    pg.click(OPEN)
    pg.click(f'{REAL} .tray-dialog__head [data-close]')
    t.settle(pg)
    t.check('the Close button closes it', not d.evaluate('d => d.open'))
    # a selection dragged from inside the dialog out onto the veil: the press is inside, so it stays open
    pg.click(OPEN)
    box = d.bounding_box()
    pg.mouse.move(box['x'] + 30, box['y'] + 30); pg.mouse.down(); pg.mouse.move(4, 4, steps=4); pg.mouse.up()
    pg.wait_for_timeout(50)
    t.check('a press inside and a release on the veil leave it open', d.evaluate('d => d.open'))
    pg.mouse.click(4, 4)
    t.settle(pg)
    t.check('a press and a release on the veil close it', not d.evaluate('d => d.open'))
    # data-static: the veil no longer closes it, Escape still does
    d.evaluate('d => d.setAttribute("data-static", "")')
    pg.click(OPEN)
    pg.mouse.click(4, 4)
    pg.wait_for_timeout(50)
    t.check('with data-static a click on the veil leaves it open', d.evaluate('d => d.open'))
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('with data-static Escape still closes it', not d.evaluate('d => d.open'))


def test_escape_in_a_menu(t):
    """Escape in a menu inside the dialog closes the menu and nothing else (10-core.js, popup)."""
    pg = t.open()
    pg.evaluate('''() => { const s = document.createElement('span'); s.className = 'tray-anchor'; s.dataset.tray = 'menu'; s.id = 'dm';
        s.innerHTML = '<button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">More</button><div class="tray-pop"><div class="tray-list"><button type="button" class="tray-option" role="menuitem">Clear the note</button></div></div>';
        document.querySelector('#dlg-real .tray-dialog__body').append(s); TrayUI.init(s); }''')
    pg.click(OPEN)
    pg.click('#dm > button')
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('Escape in an open menu inside the dialog closes the menu', not pg.is_visible('#dm > .tray-pop'))
    t.check('and leaves the dialog open, focus on the menu button', pg.evaluate('document.getElementById("dlg-real").open') and t.focused(pg)['text'] == 'More', t.focused(pg))
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('the next Escape closes the dialog', not pg.evaluate('document.getElementById("dlg-real").open'))


def test_autofocus(t):
    pg = t.open()
    pg.evaluate('() => document.querySelector("#dlg-note").setAttribute("autofocus", "")')
    pg.click(OPEN)
    t.eq('autofocus on the field the person came to fill takes focus there', t.focused(pg)['id'], 'dlg-note')


def test_in_place(t):
    """data-modal="false": the dialog is shown in the page; nothing is inert and Escape does not close it."""
    pg = t.open()
    pg.evaluate('''() => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tray-btn'; b.id = 'inplace';
        b.textContent = 'In place'; b.dataset.tray = 'open'; b.dataset.target = '#dlg-real'; b.dataset.modal = 'false';
        document.querySelector('.tray-demo').prepend(b); TrayUI.init(b); }''')
    pg.click('#inplace')
    d = pg.locator(REAL)
    t.check('data-modal="false" opens it in the page, not as a modal', d.evaluate('d => d.open && !d.matches(":modal")'))
    t.check('nothing behind it is inert', not t.ax(pg.locator(OPEN))['ignored'])
    pg.locator(f'{REAL} textarea').focus()
    pg.keyboard.press('Escape')
    pg.wait_for_timeout(50)
    t.check('Escape does not close it', d.evaluate('d => d.open'))
    pg.click(f'{REAL} .tray-dialog__head [data-close]')
    t.settle(pg)
    t.check('its Close button still closes it', not d.evaluate('d => d.open'))


def test_motion(t):
    pg = t.open()
    pg.click(OPEN)
    names = {a['name'] for a in t.running_animations(pg) if 'tray-dialog' in str(a['target'])}
    longest = max([a['duration'] for a in t.running_animations(pg) if 'tray-dialog' in str(a['target'])] or [0])
    t.check('reduced motion: it only fades (no translate, no scale)', 'opacity' in names and not names & {'translate', 'scale'}, names)
    t.check('reduced motion: in a tenth of a second', longest <= 100, longest)
    pg = t.open(motion='no-preference')
    pg.click(OPEN)
    names = {a['name'] for a in t.running_animations(pg) if 'tray-dialog' in str(a['target'])}
    t.check('without the setting it rises and settles (translate and scale)', {'translate', 'scale', 'opacity'} <= names, names)


def test_widths_and_foot(t):
    pg = t.open(width=1280)
    pg.click(OPEN)
    t.eq('tray-dialog--sm is 26rem wide', round(pg.locator(REAL).bounding_box()['width']), 416)
    t.eq('the in-place dialog is 32rem wide', round(pg.locator('.tray-stage .tray-dialog').bounding_box()['width']), 512)
    foot = pg.locator(f'{REAL} .tray-dialog__foot .tray-btn')
    b0, b1 = foot.nth(0).bounding_box(), foot.nth(1).bounding_box()
    t.check('on a desktop the buttons sit on one line, the action last', abs(b0['y'] - b1['y']) < 1 and b1['x'] > b0['x'], (b0, b1))
    pg = t.open(width=390)
    pg.click(OPEN)
    foot = pg.locator(f'{REAL} .tray-dialog__foot .tray-btn')
    b0, b1 = foot.nth(0).bounding_box(), foot.nth(1).bounding_box()
    t.check('on a phone they stack, the action on top', b1['y'] < b0['y'] and abs(b0['width'] - b1['width']) < 1, (b0, b1))
    t.layout(pg, '390px, opened over the page')


def test_forced(t):
    pg = t.open(forced=True)
    pg.click(OPEN)
    sys = t.system_colors(pg)
    t.eq('with forced colours the dialog gets an edge (1px CanvasText)', t.style(pg.locator(REAL), 'border-top-width', 'border-top-color'),
         {'border-top-width': '1px', 'border-top-color': sys['CanvasText']})


def test_parity_modal(t):
    """The React Dialog over the page: the same tree as the HTML one once opened, and the same keys."""
    h = t.open()
    hp = t.ax(h.locator(OPEN)).get('hasPopup')
    h.click(OPEN)
    a = t.tree(h.locator(REAL))
    r = t.open_react()
    cell = t.cell(r, 'OverThePage')
    opener = cell.get_by_role('button', name='Open it over the page')
    dialog = cell.locator('dialog.tray-dialog--sm')
    t.eq('react: the trigger says it opens a dialog, as the HTML opener does', t.ax(opener).get('hasPopup'), hp)
    opener.click()
    b = t.tree(dialog)
    from harness import diff
    t.check('react: the dialog over the page has the same tree as the HTML one', a == b, diff(a, b))
    r.keyboard.press('Escape')
    t.settle(r)
    modal_drive(t, r, opener, dialog, 'react: ')
    opener.click()
    dialog.locator('[data-close]').last.click()
    t.settle(r)
    t.check('react: a data-close button closes it', not dialog.evaluate('d => d.open'))
    opener.click()
    r.mouse.click(4, 4)
    t.settle(r)
    t.check('react: a click on the veil closes it', not dialog.evaluate('d => d.open'))


def test_data_open(t):
    # markup alone can open a dialog over the page as the page loads: data-open on the <dialog>, which the behaviour opens
    # with showModal (the open attribute alone shows it in place); the attribute goes when the dialog closes
    pg = t.open()
    pg.evaluate('''() => { const d = document.getElementById('dlg-real').cloneNode(true);
        d.id = 'dlg-load'; d.setAttribute('data-open', ''); d.querySelector('h2').id = 'dlg-load-t'; d.setAttribute('aria-labelledby', 'dlg-load-t');
        document.body.append(d); TrayUI.init(d); }''')
    d = pg.locator('#dlg-load')
    t.check('data-open opens the dialog over the page', d.evaluate('d => d.open && d.matches(":modal")'))
    t.check('and focus goes into it', d.evaluate('d => d.contains(document.activeElement)'), t.focused(pg))
    d.locator('[data-close]').first.click()
    t.settle(pg)
    t.check('a data-close button closes it', not d.evaluate('d => d.open'))
    t.check('and the attribute goes, so the markup no longer says open', d.get_attribute('data-open') is None)


# Static parity (trayui-react/static): the dialog carries data-tray="dialog" and an id there, its trigger data-tray="open"
# and data-target, and bundle.js opens, holds and closes it; a modal dialog open at first carries data-open.
STATIC = True
STATIC_PAGES = {'Dialog-open-at-load': 1440}
STATIC_SKIP = {'Controlled': "the button that opens it and the day under it follow the preview's own React state, which a static page's own script keeps"}


def test_in_an_ink_card(t):
    """A dialog written inside the ink card or the yellow one is a raised panel of the page: the theme's ink on the theme's
    raised fill, not the card's ink on it."""
    for theme in ('light', 'dark'):
        pg = t.open(theme=theme)
        for kind in ('inverse', 'accent'):
            got = pg.evaluate('''(kind) => { const card = document.createElement('section'); card.className = 'tray-card tray-card--' + kind;
                card.innerHTML = '<dialog class="tray-dialog" aria-label="Rename"><p class="tray-dialog__text">Give the batch a new name.</p></dialog>';
                document.body.append(card); const d = card.querySelector('dialog'); d.showModal();
                const probe = document.createElement('i'); probe.style.color = 'var(--ink)'; document.documentElement.append(probe);
                const r = [getComputedStyle(d).color, getComputedStyle(probe).color, getComputedStyle(d).backgroundColor, getComputedStyle(d.firstChild).color];
                probe.remove(); d.close(); card.remove(); return r; }''', kind)
            t.check(f'{theme}, inside the {kind} card: the theme\'s ink on the theme\'s raised fill', got[0] == got[1] and got[0] != got[2] and got[3] != got[2], got)
