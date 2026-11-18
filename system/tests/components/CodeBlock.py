"""Code Block: README.md. The <pre tabindex="0"> takes focus and draws its ring inside the block's edge; long lines scroll
sideways inside it and never wrap; data-tray="copy" copies the target's text, the button's data-label reads "Copied" for two
seconds (or "Copy failed" when the browser refuses) and a hidden role="status" beside it says the same; numbered lines are
drawn by CSS; a dir="ltr" block keeps its direction in a right-to-left page; under reduced motion the new word appears
without its pop. A code block inside a message stays inside it (a long line scrolls in the block)."""

FAKE_REFUSAL = '() => { navigator.clipboard.writeText = () => Promise.reject(new Error("refused")); }'


def test_tree(t):
    pg = t.open()
    t.match_tree('the head names the file, then the Copy button, a status and the code', pg.locator('.tray-code').first, '''
- text: stock.js
- button "Copy"
- status
- code: /The jars left in a batch/
''')
    pre = t.ax(pg.locator('.tray-code pre').first)
    t.eq('the <pre> takes focus, so a keyboard can scroll it', pre.get('focusable'), True)
    t.eq('the status is hidden to the eye', pg.locator('.tray-code [role="status"]').first.evaluate('e => e.classList.contains("tray-vh")'), True)


def test_copy(t):
    pg = t.open()
    btn = pg.locator('.tray-code [data-tray="copy"]').first
    pg.clock.install()
    btn.click()
    pg.wait_for_function('() => document.querySelector(".tray-code [role=status]").textContent.startsWith("Copied")')
    t.eq('the button reads Copied', btn.locator('[data-label]').inner_text(), 'Copied')
    t.eq('and a status beside it says it aloud', pg.locator('.tray-code [role="status"]').first.inner_text().strip(), 'Copied')
    t.eq('the code is on the clipboard', pg.evaluate('navigator.clipboard.readText()'), pg.locator('#cb-code').evaluate('e => e.textContent'))
    t.eq('the button keeps its name in data-label', t.ax(btn)['name'], 'Copied')
    pg.clock.run_for(2100)
    t.eq('two seconds later it reads Copy again and the status is empty', (btn.locator('[data-label]').inner_text(), pg.locator('.tray-code [role="status"]').first.inner_text()), ('Copy', ''))
    pg.evaluate(FAKE_REFUSAL)
    btn.click()
    pg.wait_for_function('() => document.querySelector(".tray-code [role=status]").textContent.startsWith("Copy failed")')
    t.eq('a copy the browser refuses says Copy failed, on the button and aloud', (btn.locator('[data-label]').inner_text(), btn.get_attribute('data-failed') is not None, btn.get_attribute('data-copied')),
         ('Copy failed', True, None))


def test_scrolls(t):
    pg = t.open(width=390)
    pre = pg.locator('.tray-code pre').first
    t.eq('lines never wrap', t.style(pre, 'white-space'), 'pre')
    t.check('a long line scrolls sideways inside the block', pre.evaluate('e => e.scrollWidth > e.clientWidth'), pre.evaluate('e => [e.scrollWidth, e.clientWidth]'))
    pre.focus()
    pg.keyboard.press('ArrowRight')
    pg.wait_for_timeout(50)
    t.check('the arrow keys scroll it once it has focus', pre.evaluate('e => e.scrollLeft') > 0)
    t.eq('its ring is drawn inside the edge', t.style(pre, 'outline-offset'), '-3px')
    # A code block in an answer, as the React preview places one: the long line scrolls in the block, the page does not
    pg.evaluate('''() => { const m = document.createElement('div'); m.className = 'tray-thread'; m.id = 'probe';
        m.innerHTML = '<div class="tray-message"><div class="tray-message__content"><div class="tray-bubble tray-bubble--plain"><p>The answer.</p></div>' +
          '<div class="tray-code" dir="ltr"><pre tabindex="0"><code>print(counter.batches.get("autumn").packed - counter.batches.get("autumn").reserved)</code></pre></div></div></div>';
        document.querySelector('.tray-demo').appendChild(m); }''')
    t.eq('a code block inside a message does not widen it past the window', pg.evaluate('() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), True)


def test_numbers_and_marks(t):
    pg = t.open()
    lines = pg.locator('.tray-code--numbered .tray-code__line')
    t.eq('numbered lines are counted by CSS', [t.style(lines.nth(i), 'content', pseudo='::before') for i in (0, 2)], ['counter(tray-line)', 'counter(tray-line)'])
    t.check('a marked line is tinted', t.style(pg.locator('.tray-code__line[data-mark]'), 'background-color') not in ('rgba(0, 0, 0, 0)', 'transparent'))


def test_rtl(t):
    pg = t.open(rtl=True)
    t.eq('in a right-to-left page the block keeps its direction', t.style(pg.locator('.tray-code pre').first, 'direction'), 'ltr')


def test_motion(t):
    for motion, want in (('no-preference', 'tray-pop-in'), ('reduce', 'none')):
        pg = t.open(motion=motion)
        btn = pg.locator('.tray-code [data-tray="copy"]').first
        btn.click()
        pg.wait_for_function('() => document.querySelector(".tray-code [data-tray=copy]").hasAttribute("data-copied")')
        t.eq(f'with motion {motion} the new word {"pops in" if want != "none" else "appears at once"}', t.style(btn.locator('[data-label]'), 'animation-name'), want)
        pg.close()


def test_parity_copy(t):
    """The React copy button says what happened as the HTML one does."""
    out = []
    for react in (False, True):
        pg = t.open(react=react)
        root = t.cell(pg, 'Numbered') if react else pg
        btn = root.locator('[data-tray="copy"]').first
        btn.click()
        pg.wait_for_function('() => [...document.querySelectorAll("[role=status]")].some(s => s.textContent.startsWith("Copied"))')
        out.append((btn.locator('[data-label]').inner_text(), pg.evaluate('navigator.clipboard.readText()').strip()))
    t.eq('the React code block copies the same text and says Copied', out[1], out[0])


PARITY = [('.tray-code--numbered', 'Numbered', '.tray-code'), ('.tray-code--sm', 'InlineAndOutput', '.tray-code')]
