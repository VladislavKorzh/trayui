"""Pricing Table: README.md. The billing period is a radio group named by its aria-label: Tab reaches the chosen period,
the arrow keys change it, and the prices change in place without moving focus. data-tray="pricing" writes every
data-monthly / data-yearly text of the chosen period, fires tray:change with { period }, and a hidden role="status" there
from the start reads the new prices ("Yearly prices: Shop, $24 a month, billed yearly; Market, $66 a month, billed
yearly"), each plan named from the start of its tray-plan__name. Each plan is an <article> titled by its h3, the "Most
chosen" badge inside that heading; the ticks are aria-hidden and a missing feature is written in words; each button names
its plan. The monthly text is in the markup. Under reduced motion the pill moves to the chosen period at once."""

YEARLY = 'Yearly prices: Shop, $24 a month, billed yearly; Market, $66 a month, billed yearly'
MONTHLY = 'Monthly prices: Shop, $29 a month; Market, $79 a month'


def test_tree(t):
    pg = t.open()
    t.match_tree('the period, a radio group named by its label, Monthly chosen', pg.locator('.tray-plans__bar'), '''
- radiogroup "Billing period":
  - radio "Monthly" [checked]
  - radio "Yearly"
''')
    t.match_tree('three plans, each an article titled by its h3, the recommended one named in words', pg.locator('.tray-plans'), '''
- article:
  - heading "Stall" [level=3]
  - paragraph: $0 forever
  - link "Start free"
  - list:
    - listitem: 50 orders a month
    - listitem: No courier tracking
- article:
  - heading "Shop Most chosen" [level=3]
  - paragraph: $29 a month
  - link "Start with Shop"
- article:
  - heading "Market" [level=3]
  - paragraph: $79 a month
  - link "Start with Market"
''')
    t.check('every tick is hidden from screen readers', pg.evaluate('() => [...document.querySelectorAll(".tray-ticks svg")].every(s => s.getAttribute("aria-hidden") === "true")'))
    off = pg.evaluate('() => [...document.querySelectorAll(".tray-ticks [data-off]")].map(l => l.textContent.trim())')
    t.check('a line the plan lacks says so in words, not by its grey alone', off and all(w.startswith('No ') for w in off), off)
    st = pg.locator('[data-tray="pricing"] [role="status"]')
    t.check('the status region is there from the start, empty and hidden from view', st.count() == 1 and st.inner_text() == '' and st.evaluate('s => s.classList.contains("tray-vh")'))
    raw = (t.b.server.file('project/components/PricingTable/preview.html') or b'').decode()
    t.check('the monthly prices are in the markup, so they are there without scripting', '>$29</span>' in raw and '>$79</span>' in raw)


def period_checks(t, pg, scope, label=''):
    """The same keys on the HTML and on the React preview."""
    root = pg.locator(f'{scope} [data-tray="pricing"]').first
    monthly = root.locator('input[value="monthly"]')
    status = root.locator('[role="status"]')
    t.clear_events(pg)
    monthly.focus()  # where Tab lands: the chosen radio of the group
    pg.keyboard.press('ArrowRight')
    yearly = root.locator('input[value="yearly"]')
    t.check(f'{label}ArrowRight chooses Yearly and focus stays on it', yearly.evaluate('e => e.checked && e === document.activeElement'), t.focused(pg))
    prices = root.locator('.tray-plan__price').all_inner_texts()
    t.eq(f'{label}the prices change in place', [p.replace('\n', ' ') for p in prices][-2:], ['$24 a month, billed yearly', '$66 a month, billed yearly'])
    try:
        pg.wait_for_function('s => s.textContent.trim().length > 0', arg=status.element_handle(), timeout=1500)
    except Exception:
        pass
    t.eq(f'{label}the status reads the new prices, each with its plan', status.inner_text().strip(), YEARLY)
    t.eq(f'{label}it fires tray:change with the period', [e['detail'] for e in t.events(pg, 'tray:change') if 'pricing' in e['target']], [{'period': 'yearly'}])
    pg.keyboard.press('ArrowLeft')
    pg.wait_for_function('s => s.textContent.trim().startsWith("Monthly")', arg=status.element_handle(), timeout=1500)
    t.eq(f'{label}back to Monthly, the status reads the monthly prices', status.inner_text().strip(), MONTHLY)
    t.eq(f'{label}and the event says so', [e['detail']['period'] for e in t.events(pg, 'tray:change') if 'pricing' in e['target']], ['yearly', 'monthly'])
    return root


def test_keys(t):
    pg = t.open()
    pg.keyboard.press('Tab')
    t.check('Tab reaches the chosen period', pg.locator('input[value="monthly"]').evaluate('e => e === document.activeElement'), t.focused(pg))
    root = period_checks(t, pg, 'body')
    t.eq('the wrapper says which period it shows', root.get_attribute('data-period'), 'monthly')
    pg.keyboard.press('Tab')
    t.eq('Tab goes on from the group to the first plan', t.focused(pg)['text'], 'Start free')


def glide_moves(pg):
    """Whether the pill is still on its way right after the choice moves: a transition is running on it."""
    pg.locator('input[value="monthly"]').focus()
    pg.keyboard.press('ArrowRight')
    return pg.evaluate('() => { const g = document.querySelector(".tray-seg .tray-glide"); return g ? g.getAnimations().filter(a => a.playState === "running").map(a => a.transitionProperty || a.animationName) : null; }')


def test_motion(t):
    pg = t.open(motion='no-preference')
    moving = glide_moves(pg)
    t.check('with motion, the pill slides to the chosen period', moving and 'translate' in moving, moving)
    pg.close()
    pg = t.open()
    moving = glide_moves(pg)
    t.check('under reduced motion the pill moves to the chosen period at once', moving == [], moving)
    box = pg.evaluate('() => { const g = document.querySelector(".tray-seg .tray-glide").getBoundingClientRect(), s = document.querySelector(".tray-seg input:checked + span").getBoundingClientRect(); return [Math.round(g.left - s.left), Math.round(g.width - s.width)]; }')
    t.eq('and it already sits behind Yearly', box, [0, 0])


def test_phone(t):
    pg = t.open(width=390)
    cards = [pg.locator('.tray-plan').nth(i).bounding_box() for i in range(3)]
    t.check('at 390px the plans stack in one column', all(abs(c['x'] - cards[0]['x']) < 2 for c in cards) and cards[1]['y'] > cards[0]['y'] + cards[0]['height'] - 1, cards)
    t.scan(pg, '390px')


def test_parity_keys(t):
    pg = t.open_react()
    period_checks(t, pg, '[data-cell="Plans"]', 'React: ')


PARITY = [('.tray-plans', 'Plans', '.tray-plans'), ('.tray-seg', 'Plans', '.tray-seg')]


