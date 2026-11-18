"""Lightbox: README.md. The gallery is a list of thumbnail links named by their alt; a thumbnail opens the browser's own
modal <dialog>, named by its aria-label, on its picture; the track is a list of slides, each a group with the role
description "slide", named "2 of 6", with the alt and its caption; the count is aria-hidden and a status line says
"2 of 6: caption" once the scroll settles; the arrow keys, Home and End work from anywhere inside, mirrored under
dir="rtl"; a step button that turns off at an end hands focus to the other; Escape and Close shut it and focus goes back to
the thumbnail; a press with Shift (or Ctrl, Cmd) leaves the picture to the browser; the track takes Tab, its ring inside its
edge; under reduced motion pictures change without a smooth scroll and the lightbox fades in a tenth of a second; on a phone
the two buttons sit in a row at the foot."""

STILL = '''e => new Promise((done) => { let last = null, same = 0; const step = () => { const now = e.scrollLeft; same = now === last ? same + 1 : 0; last = now;
  if (same >= 3) done(); else requestAnimationFrame(step); }; requestAnimationFrame(step); setTimeout(done, 2000); })'''


def status(pg, dialog, text, timeout=1500):
    try:
        pg.wait_for_function('([d, t]) => d.querySelector("[role=status]").textContent.startsWith(t)', arg=[dialog.element_handle(), text], timeout=timeout)
    except Exception:
        pass
    return dialog.locator('[role="status"]').text_content()


def drive(t, pg, gallery, dialog, n, label):
    """Open the second picture from the keyboard, walk it, close it: the same on the HTML preview and in React."""
    link = gallery.locator('a').nth(1)
    link.focus(); pg.keyboard.press('Enter')
    t.check(f'{label}: a thumbnail opens the lightbox as a modal dialog', dialog.evaluate('d => d.open && d.matches(":modal")'))
    track = dialog.locator('.tray-lightbox__track')
    track.evaluate(STILL)
    t.eq(f'{label}: it opens on that picture', dialog.locator('.tray-lightbox__count').inner_text(), f'2 / {n}')
    t.check(f'{label}: focus is inside', dialog.evaluate('d => d.contains(document.activeElement)'))
    pg.keyboard.press('ArrowRight'); track.evaluate(STILL)
    t.eq(f'{label}: ArrowRight, from anywhere inside, goes to the next picture', dialog.locator('.tray-lightbox__count').inner_text(), f'3 / {n}')
    cap = gallery.locator('a').nth(2).get_attribute('data-caption') or ''
    t.eq(f'{label}: the status says where you are once the scroll settles', status(pg, dialog, f'3 of {n}'), f'3 of {n}' + (f': {cap}' if cap else ''))
    pg.keyboard.press('Home'); track.evaluate(STILL)
    t.eq(f'{label}: Home goes to the first', dialog.locator('.tray-lightbox__count').inner_text(), f'1 / {n}')
    t.check(f'{label}: there Previous is off', dialog.locator('[data-prev]').is_disabled())
    nxt = dialog.locator('[data-next]')
    nxt.focus()
    for _ in range(n + 1):
        if nxt.is_disabled():
            break
        pg.keyboard.press('Enter'); track.evaluate(STILL)
    t.check(f'{label}: Next turned off at the last picture handed focus to Previous', t.is_focused(dialog.locator('[data-prev]')), t.focused(pg))
    pg.keyboard.press('Escape'); t.settle(pg)
    t.check(f'{label}: Escape shuts it', not dialog.evaluate('d => d.open'))
    t.check(f'{label}: and focus goes back to the thumbnail that opened it', t.is_focused(link), t.focused(pg))


def test_tree(t):
    pg = t.open()
    t.match_tree('the gallery is a named list of links named by their pictures', pg.locator('.tray-gallery'), '''
- list "The farm in pictures":
  - listitem:
    - link "Rows of leafy green snail beds on a hillside, each fenced with black net, a metal fence in front":
      - img
''')
    pg.locator('.tray-gallery a').nth(1).click()
    d = pg.locator('dialog')
    a = t.ax(d)
    t.eq('the lightbox is a modal dialog named by its aria-label', (a['role'], a['name'], a.get('modal')), ('dialog', 'The farm in pictures', True))
    fig = d.locator('figure').nth(1)
    f = t.ax(fig)
    t.eq('each slide is a group named "2 of 6", announced as a slide', (f['role'], f['name'], fig.get_attribute('aria-roledescription')), ('group', '2 of 6', 'slide'))
    t.match_tree('the track is a list of pictures with their alt and caption', d.locator('.tray-lightbox__track'), '''
- list "Pictures":
  - listitem:
    - group "1 of 6":
      - img "Rows of leafy green snail beds on a hillside, each fenced with black net, a metal fence in front"
      - text: Open-air snail beds on a hillside. Each bed is fenced with fine net, so the snails stay in.
''')
    t.eq('the count is hidden from screen readers', d.locator('.tray-lightbox__count').get_attribute('aria-hidden'), 'true')
    t.eq('the pictures after the first load lazily', d.evaluate('d => [...d.querySelectorAll(".tray-lightbox__track img")].map(i => i.loading)'), ['auto'] + ['lazy'] * 5)
    t.eq('the track takes Tab', d.locator('.tray-lightbox__track').get_attribute('tabindex'), '0')


def test_keys(t):
    pg = t.open()
    drive(t, pg, pg.locator('.tray-gallery'), pg.locator('dialog'), 6, 'HTML')


def test_close(t):
    pg = t.open()
    d = pg.locator('dialog')
    link = pg.locator('.tray-gallery a').first
    link.focus(); pg.keyboard.press('Enter')
    d.locator('[data-close]').click(); t.settle(pg)
    t.check('Close shuts it', not d.evaluate('d => d.open'))
    t.check('focus goes back to the thumbnail', t.is_focused(link), t.focused(pg))
    with pg.context.expect_page(timeout=3000) as other:
        link.click(modifiers=['Shift'])
    other.value.close()
    t.check('a press with Shift leaves the picture to the browser (a new window), and the lightbox stays shut', not d.evaluate('d => d.open'))


def test_rtl(t):
    pg = t.open(rtl=True)
    d = pg.locator('dialog')
    pg.locator('.tray-gallery a').nth(1).click()
    track = d.locator('.tray-lightbox__track'); track.evaluate(STILL)
    pg.keyboard.press('ArrowLeft'); track.evaluate(STILL)
    t.eq('right to left, ArrowLeft goes to the next picture', d.locator('.tray-lightbox__count').inner_text(), '3 / 6')
    pg.keyboard.press('ArrowRight'); track.evaluate(STILL)
    t.eq('and ArrowRight back', d.locator('.tray-lightbox__count').inner_text(), '2 / 6')


def test_look(t):
    pg = t.open()
    pg.locator('.tray-gallery a').first.click()
    tr = pg.locator('.tray-lightbox__track')
    tr.focus(); pg.keyboard.press('Tab'); pg.keyboard.press('Shift+Tab')
    ring = t.style(tr, 'outline-style', 'outline-width', 'outline-offset')
    t.check('the track draws the 3px ring inside its edge', ring['outline-style'] == 'solid' and ring['outline-width'] == '3px' and float(ring['outline-offset'][:-2]) < 0, ring)
    pg.close()
    pg = t.open(width=390)
    pg.locator('.tray-gallery a').first.click()
    nav = pg.evaluate('(() => { const n = document.querySelector(".tray-lightbox__nav"), tr = document.querySelector(".tray-lightbox__track"); return [getComputedStyle(n).position, n.getBoundingClientRect().top >= tr.getBoundingClientRect().bottom - 1]; })()')
    t.eq('on a phone the two buttons sit in a row at the foot, clear of the picture', nav, ['static', True])


def test_motion(t):
    for motion, smooth, fade in (('reduce', 'auto', '0.1s'), ('no-preference', 'smooth', None)):
        pg = t.open(motion=motion)
        pg.locator('.tray-gallery a').first.click()
        t.eq(f'the pictures {"scroll smoothly" if smooth == "smooth" else "change without a smooth scroll"} ({motion})', t.style(pg.locator('.tray-lightbox__track'), 'scroll-behavior'), smooth)
        if fade:
            st = t.style(pg.locator('dialog'), 'transition-duration', 'translate', 'scale')
            t.check('under reduced motion it only fades, in a tenth of a second', '0.1s' in st['transition-duration'] and st['translate'] in ('none', '0px') and st['scale'] in ('none', '1'), st)
        pg.close()




def test_parity_keys(t):
    r = t.open_react()
    cell = t.cell(r, 'Gallery')
    # the addresses of the pictures differ (the site serves them at /media/), so the trees are compared without them
    t.match_tree('React: the gallery is the same named list of links named by their pictures', cell.locator('.tray-gallery'), '''
- list "The farm in pictures":
  - listitem:
    - link "A brown-striped garden snail crawling along a wet green leaf":
      - img "A brown-striped garden snail crawling along a wet green leaf"
''')
    drive(t, r, cell.locator('.tray-gallery'), cell.locator('dialog'), 3, 'React')
    r.keyboard.press('Escape')
    cell.locator('.tray-gallery a').first.click()
    d = cell.locator('dialog')
    t.eq('React: the slides are groups announced as slides and named "1 of 3"', d.locator('figure').first.evaluate('f => [f.getAttribute("role"), f.getAttribute("aria-roledescription"), f.getAttribute("aria-label")]'), ['group', 'slide', '1 of 3'])
    t.eq('React: the track is a list named "Pictures", as in the README', d.locator('.tray-lightbox__track').get_attribute('aria-label'), 'Pictures')
