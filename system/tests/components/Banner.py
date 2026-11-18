"""Banner: README.md. role="status" for news and role="alert" for a problem; the icon aria-hidden; the dismiss button is an
icon button with an aria-label; data-tray="dismiss" hides the block with data-dismissable and fires tray:close on it; once
pressed, focus moves on to the next control after the banner, as Tab would go; a dismissed banner fades out, in a tenth of
a second under prefers-reduced-motion: reduce."""


def test_tree(t):
    pg = t.open()
    t.match_tree('four status banners and one alert, each with its words and its action', pg.locator('.tray-demo'), '''
- status:
  - paragraph: /^The trial ends in 5 days\\. Choose a plan/
  - link "Choose a plan"
  - button "Dismiss"
- status:
  - paragraph: /^Courier labels print in one click now\\./
  - link "What changed"
  - button "Dismiss"
- status:
  - paragraph: /^Maintenance on Sunday/
- alert:
  - paragraph: /^The last payment did not go through\\./
  - link "Update the card"
- status:
  - paragraph: /^Two months free/
  - link "See the plans"
''')
    t.check('every icon of a banner is aria-hidden', pg.evaluate('[...document.querySelectorAll(".tray-banner .tray-icon")].every(s => s.closest("[aria-hidden=true]"))'))
    t.check('the problem says it in words as well as in danger', pg.evaluate('getComputedStyle(document.querySelector("[role=alert] b")).color') != t.style(pg.locator('.tray-banner').nth(1).locator('b'), 'color'))


def test_edge(t):
    pg = t.open()
    e = t.style(pg.locator('.tray-banner--edge'), 'border-top-left-radius', 'justify-content')
    t.eq('tray-banner--edge has square corners and centred text', (e['border-top-left-radius'], e['justify-content']), ('0px', 'center'))


def dismiss_first(t, pg, root):
    """Press the first banner's Dismiss from the keyboard: the banner goes, tray:close fires on it, focus moves on."""
    banner = root.locator('[data-dismissable]').first
    btn = banner.locator('[data-tray~="dismiss"]')
    t.clear_events(pg)
    btn.focus()
    pg.keyboard.press('Enter')
    t.settle(pg)
    gone = banner.evaluate('b => b.hidden && getComputedStyle(b).display === "none"')
    ev = [e for e in t.events(pg, 'tray:close')]
    return gone, ev, t.focused(pg)


def test_dismiss(t):
    pg = t.open()
    gone, ev, f = dismiss_first(t, pg, pg.locator('.tray-demo'))
    t.check('Dismiss hides the banner', gone)
    t.check('it fires tray:close on the banner that carries data-dismissable', len(ev) == 1 and ev[0]['target'].startswith('div.tray-banner'), ev)
    t.eq('focus moves on to the next control after it, as Tab would go', f['text'], 'What changed')
    # the second banner: the next control after it is in the fourth (the third has none)
    pg.locator('[data-dismissable]').nth(1).locator('[data-tray~="dismiss"]').click()
    t.settle(pg)
    t.eq('past a banner with no control, to the next control in the page', t.focused(pg)['text'], 'Update the card')


def test_motion(t):
    for motion, want in (('reduce', 100), ('no-preference', 140)):
        pg = t.open(motion=motion)
        banner = pg.locator('[data-dismissable]').first
        banner.locator('[data-tray~="dismiss"]').click()
        fade = pg.evaluate('''() => document.getAnimations().filter(a => a.transitionProperty === 'opacity' && a.effect.target.matches('[data-dismissable]'))
                              .map(a => a.effect.getComputedTiming().duration)''')
        t.check(f'a dismissed banner fades out ({motion}: {want}ms)', fade and abs(fade[0] - want) < 1, fade)
        pg.close()


def test_parity_dismiss(t):
    pg = t.open_react()
    gone, ev, f = dismiss_first(t, pg, t.cell(pg, 'Tones'))
    t.check('react: Dismiss hides the banner', gone)
    t.check('react: tray:close fires on the banner', len(ev) == 1 and ev[0]['target'].startswith('div.tray-banner'), ev)
    t.eq('react: focus moves on to the next control after it', f['text'], 'What changed')
    pg.close()
    pg = t.open_react()
    cell = t.cell(pg, 'Dismissing')
    cell.locator('[data-tray~="dismiss"]').click()
    try:
        pg.wait_for_function('() => document.querySelector(\'[data-cell="Dismissing"]\').innerText.includes("Dismissed once")', timeout=1500)
    except Exception:
        pass
    t.check('react: onDismiss reports it', 'Dismissed once' in cell.inner_text(), cell.inner_text())


PARITY = [('.tray-demo > .tray-banner:nth-child(1)', 'Tones', '.tray-stack > .tray-banner:nth-child(1)'),
          ('.tray-demo > .tray-banner:nth-child(2)', 'Tones', '.tray-stack > .tray-banner:nth-child(2)'),
          ('.tray-demo > .tray-banner:nth-child(3)', 'Tones', '.tray-stack > .tray-banner:nth-child(3)'),
          ('.tray-demo > .tray-banner:nth-child(4)', 'ProblemAndEdge', '.tray-stack > .tray-banner:nth-child(1)'),
          ('.tray-demo > .tray-banner:nth-child(5)', 'ProblemAndEdge', '.tray-stack > .tray-banner:nth-child(2)')]
