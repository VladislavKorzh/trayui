"""Upgrade Prompt: README.md. Plain content: a heading that says what is missing and which plan has it, its icon
aria-hidden, its actions links styled as buttons (read as links, Enter follows them). The alert form is the Alert (role
"status" for a notice that is not an error after an action, as Alert's README says). Over a preview (tray-locked) the
dimmed copy is inert and aria-hidden: out of the Tab order and out of what a screen reader reads, so only the prompt is
left, and a pointer cannot reach it either."""


def test_tree(t):
    pg = t.open()
    t.match_tree('the card: a heading, a sentence, and two links', pg.locator('.tray-demo > .tray-upsell'), '''
- heading "Courier tracking is part of Shop" [level=3]
- paragraph: See where every box is and tell the customer before they ask.
- link "Upgrade to Shop"
- link "Compare plans"
''')
    t.match_tree('the alert forms are Alerts with role="status"', pg.locator('.tray-stack'), '''
- status:
  - paragraph: You have used all 50 orders this month
  - link "Upgrade to Shop"
- status:
  - paragraph: Roles are part of Market
''')
    t.match_tree('over a locked preview, only the prompt is read', pg.locator('.tray-locked'), '''
- heading "Reports are part of Shop" [level=3]
- paragraph: Orders and revenue by product, city and courier.
- link "Upgrade to Shop"
''')
    snap = t.tree(pg.locator('.tray-locked'))
    t.check('the dimmed copy is not in the accessibility tree', 'table' not in snap and 'By product' not in snap, snap)
    content = pg.locator('.tray-locked__content')
    t.check('the dimmed copy is inert and aria-hidden', content.get_attribute('inert') is not None and content.get_attribute('aria-hidden') == 'true')
    t.check('every icon tile is hidden from screen readers', pg.evaluate('() => [...document.querySelectorAll(".tray-upsell__icon svg, .tray-alert__icon svg")].every(s => s.getAttribute("aria-hidden") === "true")'))
    kinds = pg.evaluate('() => [...document.querySelectorAll(".tray-upsell__actions > *, .tray-alert__actions > *")].map(a => a.tagName + (a.hasAttribute("href") ? "[href]" : ""))')
    t.check('the actions are links styled as buttons', kinds and all(k == 'A[href]' for k in kinds), kinds)


def test_keys(t):
    pg = t.open()
    order = [f['text'] for f in t.tab_through(pg, 5)]
    t.eq('Tab walks the four links and passes over the locked copy', order[:4], ['Upgrade to Shop', 'Compare plans', 'Upgrade to Shop', 'Upgrade to Shop'])
    t.check('nothing after the prompt takes focus', order[4] == '' or t.focused(pg)['body'], order)
    hit = pg.evaluate('''() => { const r = document.querySelector('.tray-locked__content tbody tr').getBoundingClientRect(); const n = document.elementFromPoint(r.left + 8, r.top + r.height / 2);
        return n ? !!n.closest('.tray-locked__content') : null; }''')
    t.eq('a pointer cannot reach the dimmed copy either', hit, False)
    link = pg.locator('.tray-demo > .tray-upsell a').first
    link.focus()
    pg.keyboard.press('Enter')
    pg.wait_for_timeout(100)
    t.check('Enter follows the link', pg.url.endswith('#'), pg.url)


def test_phone(t):
    pg = t.open(width=390)
    p = pg.locator('.tray-locked__prompt').bounding_box()
    c = pg.locator('.tray-locked').bounding_box()
    t.check('at 390px the prompt stays inside the locked preview', p['x'] >= c['x'] - 1 and p['x'] + p['width'] <= c['x'] + c['width'] + 1, (p, c))
    t.scan(pg, '390px')


PARITY = [('.tray-demo > .tray-upsell', 'CardAndAlerts', '.tray-upsell.tray-card'), ('.tray-alert--accent', 'CardAndAlerts', '.tray-alert--accent'),
          ('.tray-locked', 'Locked', '.tray-locked')]


def test_parity_locked(t):
    pg = t.open_react()
    content = t.cell(pg, 'Locked').locator('.tray-locked__content')
    t.check('React: the dimmed copy is inert and aria-hidden', content.get_attribute('inert') is not None and content.get_attribute('aria-hidden') == 'true')
