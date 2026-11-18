"""Carousel: README.md. The track is a list named by its aria-label, one Tab stop where ArrowLeft and ArrowRight move one
slide (mirrored under dir="rtl"); Tab also reaches every link in the slides; the previous and next buttons are named icon
buttons that turn disabled at the ends, and the one with focus hands it to the other first; the count ("2 / 5") is the first
slide in view, "5 / 5" once the track can go no further, plain text that is not announced; under reduced motion the buttons
and keys jump instead of scrolling smoothly. Nothing moves on its own."""

STILL = '''e => new Promise((done) => { let last = null, same = 0; const step = () => { const now = e.scrollLeft; same = now === last ? same + 1 : 0; last = now;
  if (same >= 3) done(); else requestAnimationFrame(step); }; requestAnimationFrame(step); setTimeout(done, 2000); })'''


def still(track):
    track.evaluate(STILL)


def drive(t, pg, root, label):
    """The same keys on the HTML preview and on the React cell."""
    track, prev, nxt, count = root.locator('.tray-carousel__track'), root.locator('[data-prev]'), root.locator('[data-next]'), root.locator('.tray-carousel__count')
    t.eq(f'{label}: at the start the count is "1 / 5" and Previous is off', (count.inner_text(), prev.is_disabled(), nxt.is_disabled()), ('1 / 5', True, False))
    track.focus()
    pg.keyboard.press('ArrowRight'); still(track)
    t.eq(f'{label}: ArrowRight on the track moves one slide', count.inner_text(), '2 / 5')
    t.check(f'{label}: and Previous turns on', not prev.is_disabled())
    pg.keyboard.press('ArrowLeft'); still(track)
    t.eq(f'{label}: ArrowLeft moves back', count.inner_text(), '1 / 5')
    nxt.focus()
    for _ in range(6):
        if nxt.is_disabled():
            break
        pg.keyboard.press('Enter'); still(track)
    t.eq(f'{label}: at the end the count says the last slide and Next is off', (count.inner_text(), nxt.is_disabled()), ('5 / 5', True))
    t.check(f'{label}: Next, turned off with focus on it, handed focus to Previous', t.is_focused(prev), t.focused(pg))
    for _ in range(6):
        if prev.is_disabled():
            break
        pg.keyboard.press('Enter'); still(track)
    t.eq(f'{label}: back at the start', count.inner_text(), '1 / 5')
    t.check(f'{label}: Previous, turned off with focus, handed it to Next', t.is_focused(nxt), t.focused(pg))


def test_tree(t):
    pg = t.open()
    t.match_tree('a list of slides named "Field notes", the count, two named buttons, Previous off', pg.locator('.tray-carousel'), '''
- list "Field notes":
  - listitem:
    - link /The May peak/
- text: 1 / 5
- button "Previous note" [disabled]
- button "Next note"
''')
    t.eq('the track is one Tab stop', pg.get_attribute('.tray-carousel__track', 'tabindex'), '0')
    t.eq('the count is plain text, not a live region', pg.evaluate('(() => { const c = document.querySelector(".tray-carousel__count"); return [c.getAttribute("role"), c.getAttribute("aria-live"), c.closest("[aria-live]")]; })()'), [None, None, None])
    pg.wait_for_timeout(400)
    t.eq('nothing moves on its own', pg.evaluate('document.querySelector(".tray-carousel__track").scrollLeft'), 0)


def test_keys(t):
    pg = t.open()
    drive(t, pg, pg.locator('.tray-carousel'), 'HTML')


def test_keys_wide(t):
    """At 1440px most slides are in view, so one step crosses the whole track: the button that takes focus is itself off
    until that step (a bug this found: focus fell to the page)."""
    pg = t.open(width=1440)
    drive(t, pg, pg.locator('.tray-carousel'), 'HTML at 1440px')


def test_tab(t):
    pg = t.open()
    track = pg.locator('.tray-carousel__track')
    track.focus()
    seen = [f['text'][:20] for f in t.tab_through(pg, 5)]
    t.eq('Tab goes from the track through every link in the slides', seen, ['The May peak The las', 'Closing the beds for', 'Why we salt by hand ', 'Three ways to serve ', 'A night on the farm '])
    still(track)
    t.check('the browser scrolls the last link into view', track.evaluate('e => e.scrollLeft > 0'), track.evaluate('e => e.scrollLeft'))


def test_rtl(t):
    pg = t.open(rtl=True)
    root = pg.locator('.tray-carousel')
    track, count = root.locator('.tray-carousel__track'), root.locator('.tray-carousel__count')
    track.focus(); pg.keyboard.press('ArrowLeft'); still(track)
    t.eq('right to left, ArrowLeft moves to the next slide', count.inner_text(), '2 / 5')
    pg.keyboard.press('ArrowRight'); still(track)
    t.eq('and ArrowRight back', count.inner_text(), '1 / 5')
    t.eq('the arrows of the buttons are marked to mirror', pg.evaluate('[...document.querySelectorAll(".tray-carousel [data-prev] svg, .tray-carousel [data-next] svg")].map(s => s.classList.contains("tray-icon--flip"))'), [True, True])


def test_motion(t):
    for motion, smooth in (('reduce', False), ('no-preference', True)):
        pg = t.open(motion=motion)
        track = pg.locator('.tray-carousel__track')
        pg.click('[data-next]')
        at = track.evaluate('e => e.scrollLeft')
        still(track)
        end = track.evaluate('e => e.scrollLeft')
        if smooth:
            t.check('Next scrolls smoothly when no one asked for less motion', at < end, (at, end))
        else:
            t.check('under reduced motion Next jumps to the slide at once', at == end and end > 0, (at, end))
        pg.close()


PARITY = [('.tray-carousel', 'FieldNotes', '.tray-carousel')]


def test_parity_keys(t):
    r = t.open_react()
    drive(t, r, t.cell(r, 'FieldNotes').locator('.tray-carousel'), 'React')
