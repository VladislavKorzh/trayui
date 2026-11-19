"""Navigation Menu: README.md. A <header> holding a <nav> named by its aria-label (both landmarks); the current section
carries aria-current="page" and its ink fill is drawn from it; a link with children is a Popover trigger that reports
aria-expanded, moves focus to the panel's first link on opening, and Escape closes it and puts focus back on the button;
the panel is a disclosure, not a menu: Tab moves through its links. Links draw their focus ring inside their edge; the theme
switch is an icon button with an aria-label and aria-pressed. From 76rem the header is one row; below, the strip takes a
second row of its own and scrolls sideways when its links do not fit. A strip of links alone may be tray-tabs with
data-tray="strip": it scrolls its current link into view, clear of the fade at its end, and a link that takes focus the
same way, so its ring is never under the fade; only the strip moves."""

HEAD = 'header.tray-nav:has(.tray-pop)'  # the header with a panel; the preview also holds a strip of links alone
STRIP = 'header.tray-nav:has([data-tray~="strip"])'
FADE = 56


def test_tree(t):
    pg = t.open()
    t.match_tree('a banner holding a named navigation of links, a button that opens a panel, and the actions', pg.locator(HEAD), '''
- banner:
  - link "Perly"
  - navigation "Main":
    - list:
      - listitem:
        - button "Shop" [expanded]
        - link /White caviar/
        - link /Jars/
        - link /Gift boxes/
        - link /Delivery and pickup/
      - listitem:
        - link "The farm"
      - listitem:
        - link "Field notes"
      - listitem:
        - link "Questions"
  - button "Dark theme"
  - link "Order a jar"
''')
    cur = pg.locator(f'{HEAD} [aria-current]')
    t.eq('the current section is marked aria-current="page"', (cur.inner_text(), cur.get_attribute('aria-current')), ('Field notes', 'page'))
    ink = pg.evaluate('() => { const i = document.createElement("i"); i.style.color = "var(--ink)"; document.body.append(i); const v = getComputedStyle(i).color; i.remove(); return v; }')
    t.eq('and its ink fill is drawn from it', t.style(cur, 'background-color'), ink)
    theme = t.ax(pg.get_by_role('button', name='Dark theme'))
    t.eq('the theme switch is a named toggle button', (theme['role'], theme.get('pressed')), ('button', 'false'))
    t.check('the panel is a disclosure, not a menu', pg.locator(f'{HEAD} [role="menu"], {HEAD} [role="menuitem"]').count() == 0)


def drive(t, pg, scope, who=''):
    shop = scope.get_by_role('button', name='Shop')
    pg.mouse.click(5, 5)  # close the panel the preview holds open
    t.settle(pg)
    t.eq(who + 'a closed panel is reported by aria-expanded', shop.get_attribute('aria-expanded'), 'false')
    shop.focus()
    pg.keyboard.press('Enter')
    t.check(who + 'Enter opens the panel and moves focus to its first link', shop.get_attribute('aria-expanded') == 'true' and 'White caviar' in t.focused(pg)['text'], t.focused(pg))
    pg.keyboard.press('Tab')
    t.check(who + 'Tab moves through its links', 'Jars' in t.focused(pg)['text'], t.focused(pg))
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check(who + 'Escape closes it and puts focus back on the button', shop.get_attribute('aria-expanded') == 'false' and t.focused(pg)['text'].startswith('Shop'), t.focused(pg))
    pg.keyboard.press('Space')
    t.check(who + 'Space opens it too', shop.get_attribute('aria-expanded') == 'true')
    pg.keyboard.press('Escape')
    t.settle(pg)


def test_keys(t):
    pg = t.open()
    drive(t, pg, pg.locator(HEAD))
    pg.keyboard.press('Shift+Tab')
    pg.keyboard.press('Tab')
    ring = t.style(pg.locator(f'{HEAD} .tray-tab').first, 'outline-width', 'outline-offset')
    t.eq('links and tabs draw their focus ring inside their edge', (ring['outline-width'], ring['outline-offset']), ('3px', '-3px'))


def test_rows(t):
    pg = t.open(width=1440)
    tops = pg.evaluate('''(h) => ['.tray-wordmark', '.tray-nav__strip', '.tray-nav__actions'].map(s => Math.round(document.querySelector(h + ' ' + s).getBoundingClientRect().top))''', HEAD)
    t.check('from 76rem the header is one row', max(tops) - min(tops) < 20, tops)
    pg = t.open(width=390)
    strip = pg.locator(f'{HEAD} .tray-nav__links')
    r = pg.evaluate('''(h) => { const w = document.querySelector(h + ' .tray-wordmark').getBoundingClientRect(), s = document.querySelector(h + ' .tray-nav__strip').getBoundingClientRect(); return [w.bottom, s.top]; }''', HEAD)
    t.check('below 76rem the strip takes a second row of its own', r[1] >= r[0], r)
    t.check('and scrolls sideways when its links do not fit', strip.evaluate('e => e.scrollWidth > e.clientWidth && getComputedStyle(e).overflowX === "auto"'), strip.evaluate('e => [e.scrollWidth, e.clientWidth, getComputedStyle(e).overflowX]'))
    box = pg.locator(f'{HEAD} .tray-pop').bounding_box()
    t.check('the open panel stays inside a 390px window', box['x'] >= 0 and box['x'] + box['width'] <= 390, box)
    t.check('and hangs under the strip', box['y'] >= pg.locator(f'{HEAD} .tray-nav__strip').bounding_box()['y'] + 40, box)
    drive(t, pg, pg.locator(HEAD), '390px: ')


# Where an item of the strip is against the strip's visible box: [left gap, right gap, clipped, scrollLeft, page scrollY].
SEEN = """(e) => { const s = e.closest('[data-tray~="strip"]'), b = s.getBoundingClientRect(), r = e.getBoundingClientRect(), l = b.left + s.clientLeft;
  return [Math.round(r.left - l), Math.round(l + s.clientWidth - r.right), s.classList.contains('is-clipped'), Math.round(s.scrollLeft), scrollY]; }"""


def clear(seen, rtl=False):
    """The item is wholly inside the strip and, while the strip fades at its end, out of the fade."""
    start, end = (seen[1], seen[0]) if rtl else (seen[0], seen[1])
    return start >= 0 and end >= (FADE if seen[2] else 0)


def test_strip_current(t):
    pg = t.open(width=1440)
    t.eq('a strip whose links fit is not scrolled', pg.locator(f'{STRIP} [aria-current]').evaluate(SEEN)[3], 0)
    for rtl in (False, True):
        who = 'right to left: ' if rtl else ''
        pg = t.open(width=390, rtl=rtl)
        cur = pg.locator(f'{STRIP} [aria-current="page"]')
        seen = cur.evaluate(SEEN)
        t.check(who + 'at 390px the strip scrolls its current link (the fifth of six) into view, clear of the fade at its end', seen[3] != 0 and clear(seen, rtl), seen)
        t.eq(who + 'and only the strip moves, not the page', seen[4], 0)
    pg = t.open(width=390)
    last = pg.locator(f'{STRIP} .tray-tab').last
    pg.evaluate('(h) => { const s = document.querySelector(h + " [data-tray~=strip]"); s.scrollLeft = 0; s.querySelector("[aria-current]").removeAttribute("aria-current"); }', STRIP)
    last.evaluate('e => e.setAttribute("aria-current", "page")')
    pg.wait_for_timeout(50)
    seen = last.evaluate(SEEN)
    t.check('a link made current by a script is scrolled into view too', clear(seen) and seen[3] > 0, seen)
    for rtl in (False, True):
        who = 'right to left: ' if rtl else ''
        pg = t.open(width=390, rtl=rtl)
        cur = pg.locator(f'{STRIP} .tray-tab').nth(4)  # Stockists, the current one
        cur.evaluate('e => { e.textContent = "Stockists, farm shops and weekend markets"; e.removeAttribute("aria-current"); }')
        cur.evaluate('e => e.setAttribute("aria-current", "page")')
        pg.wait_for_timeout(50)
        seen = cur.evaluate(SEEN)
        t.check(who + 'a current link wider than the room left by the fade shows its start', seen[0] + seen[1] < FADE and (seen[1] if rtl else seen[0]) >= 0, seen)


def test_strip_focus(t):
    for rtl in (False, True):
        who = 'right to left: ' if rtl else ''
        pg = t.open(width=390, rtl=rtl)
        pg.evaluate('(h) => { const s = document.querySelector(h + " [data-tray~=strip]"); s.scrollLeft = 0; s.dispatchEvent(new Event("scroll")); }', STRIP)
        links = pg.locator(f'{STRIP} .tray-tab')
        seen = [links.nth(i).evaluate(SEEN) for i in range(links.count())]
        # the first link that is partly in sight: its end side reaches into the fade but not wholly past the edge
        part = next((i for i, s in enumerate(seen) if -100 < (s[0] if rtl else s[1]) < FADE), None)
        if part is None:
            t.check(who + 'at 390px with the strip at its start, a link sits partly under the fade', False, seen)
            continue
        pg.locator(f'{STRIP} .tray-wordmark').focus()
        for _ in range(part + 1):
            pg.keyboard.press('Tab')
        name = pg.evaluate('document.activeElement.textContent.trim()')
        now = links.nth(part).evaluate(SEEN)
        t.check(who + f'Tab to "{name}", partly under the fade, scrolls the strip until all of it is clear of the fade', clear(now, rtl), {'before': seen[part], 'after': now})
        t.eq(who + 'and the page does not move', now[4], 0)


PARTLY = '''(sel) => { const s = document.querySelector(sel); s.scrollLeft = 0; s.dispatchEvent(new Event('scroll')); const b = s.getBoundingClientRect();
  const it = [...s.querySelectorAll('.tray-tab')].find(t => { const r = t.getBoundingClientRect(); return r.left < b.right - 24 && r.right > b.right; });
  if (!it) return null; const r = it.getBoundingClientRect(); return { name: it.textContent.trim(), x: (r.left + b.right) / 2, y: r.top + r.height / 2 }; }'''


def press(pg, at):
    """A mouse press and release at one point, as a finger or a pointer makes it (locator.click() would scroll first)."""
    pg.mouse.move(at['x'], at['y']); pg.mouse.down(); pg.wait_for_timeout(60); pg.mouse.up(); pg.wait_for_timeout(60)


def test_strip_press(t):
    """Only keyboard focus scrolls the strip: a press on an item that runs past the end lands on that item."""
    pg = t.open(width=390)
    pg.evaluate('() => { window.__hit = []; document.addEventListener("click", (e) => { const a = e.target.closest(".tray-tab"); __hit.push(a ? a.textContent.trim() : e.target.tagName); e.preventDefault(); }); }')
    at = pg.evaluate(PARTLY, f'{STRIP} [data-tray~="strip"]')
    if not at:
        t.check('at 390px with the strip at its start, a link runs past its end', False)
        return
    press(pg, at)
    t.eq(f'a press on "{at["name"]}", which runs past the end, clicks that link', pg.evaluate('window.__hit'), [at['name']])
    pg.evaluate('''() => { const d = document.createElement('div'); d.setAttribute('data-tray', 'tabs'); d.style.maxInlineSize = '20rem';
        const names = ['Identify', 'Marks', 'Serve', 'Habitat', 'Season', 'Order'];
        d.innerHTML = '<div class="tray-tabs" data-tray="strip" role="tablist" aria-label="Guide" id="press-tabs">' + names.map((n, i) => '<button class="tray-tab" role="tab" type="button" id="pt' + i + '" aria-controls="pp' + i + '"' + (i ? '' : ' aria-selected="true"') + '>' + n + '</button>').join('') + '</div>'
          + names.map((n, i) => '<div class="tray-tabpanel" role="tabpanel" id="pp' + i + '" aria-labelledby="pt' + i + '"' + (i ? ' hidden' : '') + '>' + n + '</div>').join('');
        document.querySelector('.tray-demo').prepend(d); TrayUI.init(d); }''')
    at = pg.evaluate(PARTLY, '#press-tabs')
    if at:
        press(pg, at)
        t.eq(f'a press on the tab "{at["name"]}", which runs past the end, chooses it', pg.evaluate('document.querySelector("#press-tabs [aria-selected=true]").textContent'), at['name'])
    else:
        t.check('a tab of a 20rem strip runs past its end', False)


def test_strip_list(t):
    """tray-tabs straight on a <ul>, without tray-nav__links: no bullets, no list margins."""
    pg = t.open()
    got = pg.evaluate('''() => { const n = document.createElement('nav'); n.setAttribute('aria-label', 'Sections');
        n.innerHTML = '<ul class="tray-tabs"><li><a class="tray-tab" href="#" aria-current="page">Shop</a></li><li><a class="tray-tab" href="#">Recipes</a></li></ul>';
        document.querySelector('.tray-demo').append(n); const ul = n.firstChild, s = getComputedStyle(ul);
        const got = { type: getComputedStyle(ul.children[1]).listStyleType, margin: [s.marginBlockStart, s.marginBlockEnd] };
        n.remove(); return got; }''')
    t.eq('a <ul class="tray-tabs"> shows no bullets', got['type'], 'none')
    t.eq('and has no list margins', got['margin'], ['0px', '0px'])


def test_skip_link(t):
    """A skip link before the header (tray-skip): out of sight until focused, the first Tab stop, then a 44px ink button at
    the top start of the window; following it puts the next Tab inside the content."""
    for rtl in (False, True):
        who = 'right to left: ' if rtl else ''
        pg = t.open(width=390, rtl=rtl)
        pg.evaluate('''() => { const a = document.createElement('a'); a.className = 'tray-skip'; a.href = '#skip-to'; a.textContent = 'Skip to the content';
            document.body.prepend(a); const m = document.createElement('main'); m.id = 'skip-to'; m.innerHTML = '<a href="#">First in the content</a>'; document.body.append(m); }''')
        skip = pg.locator('.tray-skip')
        box = skip.bounding_box()
        t.check(who + 'a skip link is out of sight until it takes focus', box['width'] <= 1 and box['height'] <= 1, box)
        pg.keyboard.press('Tab')
        t.check(who + 'it is the first Tab stop', t.is_focused(skip), t.focused(pg))
        box = skip.bounding_box()
        w = pg.evaluate('document.documentElement.clientWidth')
        edge = (w - box['x'] - box['width']) if rtl else box['x']
        t.check(who + 'focused, it shows at the top start of the window, 44px tall', box['height'] >= 44 and box['y'] <= 16 and edge <= 16 and box['width'] > 100, box)
        if not rtl:
            ink = pg.evaluate('() => { const i = document.createElement("i"); i.style.color = "var(--ink)"; document.body.append(i); const v = getComputedStyle(i).color; i.remove(); return v; }')
            t.eq('in solid ink', t.style(skip, 'background-color'), ink)
            pg.keyboard.press('Enter')
            pg.keyboard.press('Tab')
            t.eq('following it, the next Tab goes into the content', t.focused(pg)['text'], 'First in the content')


def test_parity_keys(t):
    pg = t.open_react()
    drive(t, pg, t.cell(pg, 'ShopOpen').locator(HEAD), 'react: ')


def test_parity_strip(t):
    """React's `strip` gives a strip of links alone the markup of the HTML one: tray-tabs, data-tray="strip", the same tree."""
    h, r = t.open(), t.open_react()
    a = t.tree(h.locator(STRIP))
    b = t.tree(t.cell(r, 'Strip').locator(STRIP))
    t.check('parity: the strip of links alone = Strip', a == b, f'html:\n{a}\nreact:\n{b}')
    ul = t.cell(r, 'Strip').locator('.tray-nav__links')
    t.eq('react: strip makes the list tray-tabs with data-tray="strip"', ul.evaluate('e => [e.classList.contains("tray-tabs"), e.dataset.tray]'), [True, 'strip'])
    t.eq('react: without it the list stays plain', t.cell(r, 'Closed').locator('.tray-nav__links').evaluate('e => [e.classList.contains("tray-tabs"), e.dataset.tray || null]'), [False, None])
    r = t.open_react(width=390)
    seen = t.cell(r, 'Strip').locator('[aria-current="page"]').evaluate(SEEN)
    t.check('react: at 390px the strip scrolls its current link into view, clear of the fade', seen[3] != 0 and clear(seen), seen)


def test_parity_tree(t):
    h, r = t.open(), t.open_react()
    a = t.tree(h.locator(HEAD))
    b = t.tree(t.cell(r, 'ShopOpen').locator(HEAD))
    t.check('parity: the header = ShopOpen header', a == b, f'html:\n{a}\nreact:\n{b}')


