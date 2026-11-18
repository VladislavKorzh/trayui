"""Message Scroller: README.md. The behaviour makes the viewport a role="log" region with tabindex="0" (Tab reaches it, the
arrows and Page Up/Down scroll it), named by its aria-label; it opens at the newest message (data-start="top" at the first);
at the end, new messages and streaming text keep it at the end; scrolled up, nothing moves and new messages are counted on
"Latest", whose count is part of its name; Latest goes once the newest message is in view, and focus on it moves to the
conversation; older messages loaded above keep the reader's place; under reduced motion Latest jumps instead of scrolling."""

VIEW = '.tray-scroller__viewport'
GAP = '(() => { const v = document.querySelector(".tray-scroller__viewport"); return Math.round(v.scrollHeight - v.scrollTop - v.clientHeight); })()'


def send(pg, text):
    pg.fill('#ms-form textarea', text)
    pg.evaluate('document.getElementById("ms-form").requestSubmit()')
    pg.wait_for_timeout(60)


def test_tree(t):
    pg = t.open()
    v = t.ax(pg.locator(VIEW))
    t.eq('the viewport is a named log', (v['role'], v['name'], v.get('live')), ('log', 'Conversation with the farm', 'polite'))
    t.eq('it is in the Tab order', pg.get_attribute(VIEW, 'tabindex'), '0')
    t.eq('its focus ring is drawn inside its edge', t.style(pg.locator(VIEW), 'outline-offset'), '-3px') if pg.focus(VIEW) is None else None
    t.eq('it opens at the newest message', pg.evaluate(GAP) < 24, True)
    t.check('Latest is not there while the newest message is in view', not pg.is_visible('.tray-scroller__jump'))
    t.eq('the composer is named', (t.ax(pg.locator('#ms-form textarea'))['name'], t.ax(pg.locator('#ms-form button'))['name']), ('Message', 'Send'))
    t.check('own messages and avatars read as the README says', 'You: Great.' in t.tree(pg.locator(VIEW)) and 'OF' not in t.tree(pg.locator(VIEW)), t.tree(pg.locator(VIEW)))


def still(pg):
    """Wait until the conversation has not scrolled for five frames in a row (a key scrolls it with an animation)."""
    try:
        pg.wait_for_function('''() => { const v = document.querySelector(".tray-scroller__viewport"), w = window.__still || (window.__still = { top: -1, same: 0 });
            if (v.scrollTop === w.top) w.same++; else { w.top = v.scrollTop; w.same = 0; } return w.same >= 5; }''', polling='raf', timeout=3000)
    finally:
        pg.evaluate('() => { delete window.__still; }')


def test_keys(t):
    pg = t.open()
    pg.keyboard.press('Tab')
    t.eq('Tab reaches the conversation', t.focused(pg)['role'], 'log')
    end = pg.evaluate('document.querySelector(".tray-scroller__viewport").scrollTop')
    pg.keyboard.press('PageUp')
    still(pg)
    t.check('Page Up scrolls it back', pg.evaluate('document.querySelector(".tray-scroller__viewport").scrollTop') < end - 50)
    pg.keyboard.press('ArrowDown')
    still(pg)
    # each press waits for the browser's own scrolling animation to end: a press during it starts from where it is
    pg.keyboard.press('PageDown')
    still(pg)
    pg.keyboard.press('PageDown')
    still(pg)
    t.eq('Page Down scrolls it to the end again', pg.evaluate(GAP) < 24, True)


def test_reading_back(t):
    pg = t.open()
    pg.evaluate('document.querySelector(".tray-scroller__viewport").scrollTop = 0')
    pg.wait_for_timeout(80)
    t.check('scrolled up, Latest appears', pg.is_visible('.tray-scroller__jump'))
    t.eq('with no count yet', pg.locator('.tray-scroller__jump [data-count]').is_hidden(), True)
    send(pg, 'Is the gate open?')
    t.eq('a new message moves nothing under the reader', pg.evaluate('document.querySelector(".tray-scroller__viewport").scrollTop'), 0)
    t.eq('it is counted on Latest, and the count is part of its name', t.ax(pg.locator('.tray-scroller__jump'))['name'], 'Latest 1')
    jump = pg.locator('.tray-scroller__jump')
    jump.focus()
    pg.keyboard.press('Enter')
    pg.wait_for_function('() => { const v = document.querySelector(".tray-scroller__viewport"); return v.scrollHeight - v.scrollTop - v.clientHeight < 24; }', timeout=2000)
    pg.wait_for_timeout(60)
    t.check('Latest scrolls to the end and goes', not jump.is_visible())
    f = t.focused(pg)
    t.eq('focus on it moves to the conversation it scrolled', (f['role'], f['body']), ('log', False))


def test_pinned(t):
    pg = t.open()
    send(pg, 'Thank you.')
    t.eq('at the end, a new message keeps it at the end', pg.evaluate(GAP) < 24, True)
    t.check('and Latest stays away', not pg.is_visible('.tray-scroller__jump'))
    # an answer that streams in: more words added to the last bubble, as a new text node and as a text node that grows
    pg.evaluate('''() => { const b = [...document.querySelectorAll(".tray-scroller .tray-bubble")].pop(); for (let i = 0; i < 6; i++) b.append(" And more words for the courier, line " + i + ".");
        b.appendChild(document.createElement("br")); }''')
    pg.wait_for_timeout(80)
    t.eq('streaming text added to the last message is followed', pg.evaluate(GAP) < 24, True)
    pg.evaluate('''() => { const b = [...document.querySelectorAll(".tray-scroller .tray-bubble")].pop(); const n = [...b.childNodes].filter(c => c.nodeType === 3).pop();
        for (let i = 0; i < 12; i++) n.data += " Another sentence that streams into the same text, part " + i + "."; }''')
    pg.wait_for_timeout(120)
    t.eq('also when the text of the last message grows in place', pg.evaluate(GAP) < 24, True)
    t.eq('streamed words are not counted as new messages', pg.locator('.tray-scroller__jump [data-count]').inner_text(), '')


def test_older_above(t):
    pg = t.open()
    pg.evaluate('document.querySelector(".tray-scroller__viewport").scrollTop = 120')
    pg.wait_for_timeout(80)
    first_seen = pg.evaluate('''() => { const v = document.querySelector(".tray-scroller__viewport"), top = v.getBoundingClientRect().top;
        const rows = [...v.querySelectorAll(".tray-thread > *")]; const r = rows.find(r => r.getBoundingClientRect().bottom > top + 1); r.id = "seen"; return Math.round(r.getBoundingClientRect().top); }''')
    pg.evaluate('''() => { const th = document.getElementById("ms-thread"); for (let i = 0; i < 3; i++) { const m = document.createElement("div"); m.className = "tray-message";
        m.innerHTML = '<div class="tray-message__content"><div class="tray-bubble">An older message, ' + i + '.</div></div>'; th.insertBefore(m, th.firstChild); } }''')
    pg.wait_for_timeout(100)
    t.check('older messages loaded above keep the reader\'s place', abs(pg.evaluate('Math.round(document.getElementById("seen").getBoundingClientRect().top)') - first_seen) <= 2)
    t.eq('and are not counted as new', pg.locator('.tray-scroller__jump [data-count]').inner_text(), '')


def test_start_top(t):
    pg = t.open()
    pg.evaluate('''() => { const s = document.querySelector(".tray-scroller").cloneNode(true); s.dataset.start = "top"; s.querySelector(".tray-scroller__viewport").removeAttribute("role");
        s.id = "top"; document.querySelector(".tray-demo").appendChild(s); TrayUI.init(s); }''')
    pg.wait_for_timeout(80)
    t.eq('data-start="top" opens at the first message', pg.evaluate('document.querySelector("#top .tray-scroller__viewport").scrollTop'), 0)


def test_motion(t):
    for motion in ('reduce', 'no-preference'):
        pg = t.open(motion=motion)
        pg.evaluate('document.querySelector(".tray-scroller__viewport").scrollTop = 0')
        pg.wait_for_timeout(80)
        pg.click('.tray-scroller__jump')
        gap = pg.evaluate(GAP)
        if motion == 'reduce':
            t.check('under reduced motion Latest jumps to the newest message', gap < 24, gap)
        else:
            t.check('otherwise it scrolls there', gap >= 24, gap)
        pg.close()


PARITY = [(VIEW, 'Conversation', '.tray-scroller__viewport')]


def test_parity_reading_back(t):
    """Scrolled up, a message sent from the composer is counted on Latest; Latest takes the reader to it and focus to the log."""
    out = []
    for react in (False, True):
        pg = t.open(react=react)
        root = t.cell(pg, 'Conversation') if react else pg
        view = root.locator(VIEW)
        view.evaluate('v => { v.scrollTop = 0; }')
        pg.wait_for_timeout(80)
        root.locator('.tray-composer textarea').fill('Is the gate open?')
        root.locator('.tray-composer button').click()
        pg.wait_for_timeout(80)
        jump = root.locator('.tray-scroller__jump')
        got = [view.evaluate('v => v.scrollTop'), t.ax(jump)['name']]
        jump.focus()
        pg.keyboard.press('Enter')
        pg.wait_for_timeout(150)
        f = t.focused(pg)
        got += [jump.is_visible(), f['role'], view.evaluate('v => v.scrollHeight - v.scrollTop - v.clientHeight < 24')]
        out.append(got)
    t.eq('the React scroller counts, jumps and hands focus on as the HTML one does', out[1], out[0])
