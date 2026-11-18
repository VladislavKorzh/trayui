"""Video Player: README.md. The behaviour takes the browser's controls off and runs the bar; the <video> then takes no
focus and every part of the bar is a named button or range; the large play button starts the film and goes, handing its
focus to the bar's play button, and comes back when the film ends; a press on the film plays and pauses; Play and Mute
change their names with the state ("Pause", "Turn the sound on"); Captions is a toggle with one name, pressed while they
show; on the seek slider an arrow moves five seconds (mirrored under dir="rtl"), Page Up and Page Down a tenth, Home and End
the ends, and its value reads "0:07 of 0:13"; the figure is named by its caption; on a narrow screen the total time goes;
the large button's ring is 4px out."""
import re

from harness import SYSTEM

FILM = (SYSTEM / 'project' / 'assets' / 'Media' / 'farm.mp4').read_bytes()


def ranged(route):
    """The film with byte ranges, as a real server sends it, so the video can seek (the harness answers whole files)."""
    m = re.match(r'bytes=(\d+)-(\d*)', route.request.headers.get('range') or '')
    if m:
        a = int(m.group(1)); z = int(m.group(2)) if m.group(2) else len(FILM) - 1
        route.fulfill(status=206, headers={'Content-Range': f'bytes {a}-{z}/{len(FILM)}', 'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4'}, body=FILM[a:z + 1])
    else:
        route.fulfill(status=200, headers={'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4'}, body=FILM)


def named(pg, loc, name):
    """The names follow the video's own events, which come a moment after the press."""
    try:
        pg.wait_for_function('([b, n]) => b.getAttribute("aria-label") === n', arg=[loc.element_handle(), name], timeout=1500)
    except Exception:
        pass
    return loc.get_attribute('aria-label')


def ready(pg, root):
    root.locator('video').evaluate('v => v.readyState >= 1 || new Promise(r => v.addEventListener("loadedmetadata", r, { once: true }))')


def opened(t, react=False, **kw):
    pg = t.open(react=react, wait=0, **kw)
    pg.route('**/*.mp4', ranged)
    pg.reload(wait_until='load')
    if react:
        pg.wait_for_function('() => window.__drawn === true')
    return pg


def drive(t, pg, root, label):
    """The keys and presses of the README, on the HTML preview or on the React cell."""
    ready(pg, root)
    seek, play, big, mute, cc = root.locator('[data-seek]'), root.locator('.tray-player__bar [data-play]'), root.locator('.tray-player__big'), root.locator('[data-mute]'), root.locator('[data-captions]')
    v = root.locator('video')
    t.eq(f'{label}: the behaviour takes the browser\'s controls off, and the film takes no focus', v.evaluate('v => [v.controls, v.matches(":focus") || (v.focus(), document.activeElement === v)]'), [False, False])
    t.eq(f'{label}: the seek slider reads "0:00 of 0:13"', seek.get_attribute('aria-valuetext'), '0:00 of 0:13')
    seek.focus()
    pg.keyboard.press('ArrowRight')
    t.eq(f'{label}: ArrowRight on the slider moves five seconds', seek.get_attribute('aria-valuetext'), '0:05 of 0:13')
    pg.keyboard.press('PageUp')
    t.check(f'{label}: Page Up a tenth of the film', abs(v.evaluate('v => v.currentTime') - 6.32) < .05, v.evaluate('v => v.currentTime'))
    pg.keyboard.press('ArrowLeft'); pg.keyboard.press('PageDown')
    t.check(f'{label}: ArrowLeft and Page Down go back', abs(v.evaluate('v => v.currentTime')) < .05, v.evaluate('v => v.currentTime'))
    pg.keyboard.press('End')
    pg.wait_for_function('s => s.getAttribute("aria-valuetext").startsWith("0:13")', arg=seek.element_handle(), timeout=1500)
    t.eq(f'{label}: End goes to the end', seek.get_attribute('aria-valuetext'), '0:13 of 0:13')
    pg.keyboard.press('Home')
    pg.wait_for_function('s => s.getAttribute("aria-valuetext").startsWith("0:00")', arg=seek.element_handle(), timeout=1500)
    t.eq(f'{label}: Home goes back to the start', seek.get_attribute('aria-valuetext'), '0:00 of 0:13')
    cc.focus(); pg.keyboard.press('Enter')
    t.eq(f'{label}: Captions is a toggle with one name, pressed while they show', (cc.get_attribute('aria-label'), cc.get_attribute('aria-pressed'), v.evaluate('v => v.textTracks[0].mode')), ('Captions', 'true', 'showing'))
    pg.keyboard.press('Space')
    t.eq(f'{label}: pressed again, they hide', (cc.get_attribute('aria-pressed'), v.evaluate('v => v.textTracks[0].mode')), ('false', 'hidden'))
    mute.focus(); pg.keyboard.press('Enter')
    t.eq(f'{label}: Mute turns the sound off and is called "Turn the sound on"', (v.evaluate('v => v.muted'), named(pg, mute, 'Turn the sound on')), (True, 'Turn the sound on'))
    pg.keyboard.press('Enter')
    t.eq(f'{label}: and back to "Mute"', named(pg, mute, 'Mute'), 'Mute')
    big.focus(); pg.keyboard.press('Enter')
    root.evaluate('f => f.hasAttribute("data-started") || new Promise(r => { new MutationObserver((_, o) => { if (f.hasAttribute("data-started")) { o.disconnect(); r(); } }).observe(f, { attributes: true }); setTimeout(r, 2000); })')
    t.check(f'{label}: the large button starts the film', not v.evaluate('v => v.paused'))
    t.check(f'{label}: and goes away', not big.is_visible())
    t.check(f'{label}: its focus moves to the play button in the bar', t.is_focused(play), t.focused(pg))
    t.eq(f'{label}: which is now called "Pause"', named(pg, play, 'Pause'), 'Pause')
    pg.keyboard.press('Enter')
    t.check(f'{label}: Enter on it pauses the film', v.evaluate('v => v.paused'))
    t.eq(f'{label}: and it is called "Play" again', named(pg, play, 'Play'), 'Play')
    v.click()
    t.check(f'{label}: a press on the film plays it', not v.evaluate('v => v.paused'))
    v.evaluate('v => { v.currentTime = v.duration; }')
    v.evaluate('v => v.ended || new Promise(r => v.addEventListener("ended", r, { once: true }))')
    pg.wait_for_function('b => getComputedStyle(b).display !== "none"', arg=big.element_handle(), timeout=1500)
    t.check(f'{label}: the large button comes back when the film ends', big.is_visible())


def test_tree(t):
    pg = opened(t)
    t.match_tree('a figure named by its caption, the bar of named controls', pg.locator('.tray-demo'), '''
- figure "From the snail beds to a shop counter in 13 seconds, with captions and the sound of the wind.":
  - button "Play the film"
  - button "Play"
  - slider "Position in the film"
  - button "Captions"
  - button "Mute"
  - button "Full screen"
''')
    t.eq('Captions starts not pressed (the track has no default)', pg.get_attribute('[data-captions]', 'aria-pressed'), 'false')
    pg.locator('body').press('Tab')
    seq = [t.focused(pg)['label']] + [f['label'] for f in t.tab_through(pg, 5)]
    t.eq('Tab goes through the large play button and the bar, never the film', seq, ['Play the film', 'Play', 'Position in the film', 'Captions', 'Mute', 'Full screen'])


def test_keys(t):
    pg = opened(t)
    drive(t, pg, pg.locator('.tray-player'), 'HTML')


def test_rtl(t):
    pg = opened(t, rtl=True)
    root = pg.locator('.tray-player'); ready(pg, root)
    seek = root.locator('[data-seek]'); seek.focus()
    pg.keyboard.press('ArrowLeft')
    t.eq('right to left, ArrowLeft moves the film on five seconds', seek.get_attribute('aria-valuetext'), '0:05 of 0:13')
    pg.keyboard.press('ArrowRight')
    t.eq('and ArrowRight back', seek.get_attribute('aria-valuetext'), '0:00 of 0:13')


def test_look(t):
    pg = opened(t)
    big = pg.locator('.tray-player__big')
    big.focus(); pg.keyboard.press('Shift+Tab'); pg.keyboard.press('Tab')
    t.eq('the large play button has its own ring, 4px out', t.style(big, 'outline-style', 'outline-width', 'outline-offset'), {'outline-style': 'solid', 'outline-width': '3px', 'outline-offset': '4px'})
    pg.keyboard.press('Tab')
    t.eq('the bar\'s controls draw the 3px ring', t.style(pg.locator('.tray-player__bar [data-play]'), 'outline-style', 'outline-width'), {'outline-style': 'solid', 'outline-width': '3px'})
    pg.close()
    pg = opened(t, width=390)
    t.eq('on a narrow screen the total time gives its room to the slider', pg.evaluate('[getComputedStyle(document.querySelector("[data-total]")).display, getComputedStyle(document.querySelector("[data-now]")).display]'), ['none', 'inline'])


def test_without_track(t):
    pg = opened(t)
    pg.evaluate('''() => { const f = document.querySelector('.tray-player').cloneNode(true); f.removeAttribute('data-ready'); f.querySelector('track').remove(); f.id = 'bare';
        document.querySelector('.tray-demo').appendChild(f); TrayUI.init(f); }''')
    t.check('a video without a <track> hides Captions', pg.locator('#bare [data-captions]').is_hidden())
    pg.evaluate('''() => { const f = document.querySelector('.tray-player').cloneNode(true); f.removeAttribute('data-ready'); f.querySelector('track').setAttribute('default', ''); f.id = 'cc';
        document.querySelector('.tray-demo').appendChild(f); TrayUI.init(f); }''')
    t.eq('a track with default starts shown, its toggle pressed', (pg.get_attribute('#cc [data-captions]', 'aria-pressed'), pg.evaluate('document.querySelector("#cc video").textTracks[0].mode')), ('true', 'showing'))


def test_full_screen(t):
    # Headless Chrome refuses full screen, so what happens there is left to a person: here, the button is offered where the
    # browser can do it, and a press that the browser refuses changes nothing and throws nothing.
    pg = opened(t)
    full = pg.locator('[data-full]')
    t.check('Full screen is offered where the browser has it', full.is_visible() and pg.evaluate('!!document.querySelector(".tray-player").requestFullscreen'))
    full.click(); pg.wait_for_timeout(100)
    t.check('a press the browser refuses leaves the name and throws nothing', full.get_attribute('aria-label') in ('Full screen', 'Leave full screen') and not t.page_errors(pg), t.page_errors(pg))


PARITY = [('.tray-player__bar', 'WithCaptions', '.tray-player__bar')]


def test_parity_keys(t):
    r = opened(t, react=True)
    drive(t, r, t.cell(r, 'WithCaptions').locator('.tray-player'), 'React')
    t.check('React: a film without captions has no Captions button', t.cell(r, 'Lazy').locator('[data-captions]').count() == 0 or t.cell(r, 'Lazy').locator('[data-captions]').is_hidden())
