"""Marker: README.md. A marker is plain text, its icon aria-hidden, so the sentence carries the event; a separator is read
as its words alone (the hairlines are CSS); a running marker is role="status" with aria-busy="true", its text pulses and
its Spinner turns; written over with its result and aria-busy taken away, the result is in the same live region and the
pulse stops; under reduced motion the pulse stops and the Spinner turns slowly instead."""


def test_tree(t):
    pg = t.open()
    t.match_tree('plain sentences, the running one a status region', pg.locator('.tray-demo'), '''
- text: Today The courier picked up order PL-20418
- status: Checking the address
- text: Looked through 4 earlier orders Order PL-20418 was paid 14:10 Conversation shortened
''')
    t.eq('no marker has a role but the running one', pg.evaluate('[...document.querySelectorAll(".tray-marker[role]")].map(m => m.getAttribute("role"))'), ['status'])
    t.eq('every icon in a marker is hidden', pg.evaluate('[...document.querySelectorAll(".tray-marker__icon > *")].every(i => i.getAttribute("aria-hidden") === "true")'), True)
    busy = t.ax(pg.locator('.tray-marker[aria-busy]'))
    t.eq('the running marker is a busy, polite status', (busy['role'], busy.get('busy'), busy.get('live')), ('status', True, 'polite'))
    sep = pg.locator('.tray-marker--separator').first
    t.eq('a separator draws its hairlines in CSS', (t.style(sep, 'content', pseudo='::before'), t.style(sep, 'content', pseudo='::after')), ('""', '""'))


def test_motion(t):
    pg = t.open(motion='no-preference')
    busy = pg.locator('.tray-marker[aria-busy] .tray-marker__text')
    t.eq('the running marker pulses', t.style(busy, 'animation-name'), 'tray-pulse')
    fast = float(t.style(pg.locator('.tray-marker .tray-spinner'), 'animation-duration').rstrip('s'))
    # the work ends: the result is written into the same element and aria-busy goes
    pg.evaluate('''() => { const m = document.querySelector('.tray-marker[aria-busy]'); m.querySelector('.tray-marker__text').textContent = 'The address is right';
        m.querySelector('.tray-marker__icon').innerHTML = TrayUI.icon('circle-check'); m.removeAttribute('aria-busy'); }''')
    done = pg.locator('.tray-marker[role="status"]')
    t.eq('written over, the result is in the same status region and the pulse stops', (done.inner_text(), t.style(done.locator('.tray-marker__text'), 'animation-name')),
         ('The address is right', 'none'))
    pg.close()
    pg = t.open(motion='reduce')
    t.eq('under reduced motion the pulse stops', t.style(pg.locator('.tray-marker[aria-busy] .tray-marker__text'), 'animation-name'), 'none')
    sp = pg.locator('.tray-marker .tray-spinner')
    slow = float(t.style(sp, 'animation-duration').rstrip('s'))
    t.check('and the Spinner turns slowly instead of stopping', t.style(sp, 'animation-name') != 'none' and slow > fast, (t.style(sp, 'animation-name'), slow, fast))


PARITY = [('.tray-demo', 'Kinds', '.tray-stack')]
