"""Notification Preferences: README.md. A real <table> named by its caption: column heads for the channels, a row head
for each event, a rowgroup head at the top of each <tbody>; every checkbox has an aria-label that joins its row and its
column; Space checks a box and the 3px ink ring shows on it; the label around the box is 44px each way; a box that cannot
be turned off is disabled, announced as unavailable, skipped by Tab, and the line under the event says why."""


def test_tree(t):
    pg = t.open()
    t.match_tree('a table named by its caption, channels across, events down, groups heading their rows', pg.locator('table'), '''
- table "Notifications":
  - rowgroup:
    - row:
      - columnheader "Tell me when"
      - columnheader "Email"
      - columnheader "Push"
      - columnheader "Text"
  - rowgroup:
    - row "Orders":
      - rowheader "Orders"
    - row:
      - rowheader "A new order arrives Once per order."
      - cell:
        - checkbox "A new order arrives, by email"
      - cell:
        - checkbox "A new order arrives, by push" [checked]
      - cell:
        - checkbox "A new order arrives, by text message"
  - rowgroup:
    - row "Account":
      - rowheader "Account"
    - row:
      - rowheader /A payment fails Always on by email/
      - cell:
        - checkbox "A payment fails, by email" [checked] [disabled]
''')
    t.eq('the group heads are rowgroup heads, one at the top of each body', pg.evaluate('[...document.querySelectorAll("tbody")].map(b => b.rows[0].cells[0].getAttribute("scope"))'), ['rowgroup', 'rowgroup'])
    names = pg.evaluate('''[...document.querySelectorAll("tbody tr:not(.tray-matrix__group)")].flatMap(r => { const ev = r.querySelector("th b").textContent;
        return [...r.querySelectorAll("input")].map((i, k) => i.getAttribute("aria-label") === ev + ", by " + ["email", "push", "text message"][k]); })''')
    t.check('every box is named by its event and its channel', names and all(names), names)


def test_keys(t):
    pg = t.open()
    box = pg.locator('input[aria-label="A new order arrives, by email"]')
    box.focus()
    pg.keyboard.press('Space')
    t.eq('Space checks a box', t.ax(box).get('checked'), 'true')
    ring = t.style(box.locator('xpath=following-sibling::span[1]'), 'outline-style', 'outline-width', 'outline-color')
    ink = pg.evaluate('() => { const p = document.createElement("i"); p.style.color = "var(--ink)"; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; }')
    t.eq('the 3px ink ring shows on the box', ring, {'outline-style': 'solid', 'outline-width': '3px', 'outline-color': ink})
    w, h = t.hit(box)
    t.check('the label around the box is 44px each way', w >= 44 and h >= 44, (w, h))
    # Tab from the last box of the Orders group: the next stop is the push box of "A payment fails", past its disabled email box
    pg.locator('input[aria-label="A batch is nearly sold out, by text message"]').focus()
    pg.keyboard.press('Tab')
    t.eq('a box that cannot be turned off is skipped by Tab', t.focused(pg)['label'], 'A payment fails, by push')
    t.eq('and is announced as unavailable', t.ax(pg.locator('input[aria-label="A payment fails, by email"]')).get('disabled'), True)
    t.check('the line under its event says why', 'Always on by email' in pg.locator('tr', has=pg.locator('input[aria-label="A payment fails, by email"]')).locator('th small').inner_text())


def test_parity_grid(t):
    out = []
    for react in (False, True):
        pg = t.open(react=react)
        root = t.cell(pg, 'Grid') if react else pg
        box = root.locator('input[aria-label="A new order arrives, by email"]')
        box.focus()
        pg.keyboard.press('Space')
        root.locator('input[aria-label="A batch is nearly sold out, by text message"]').focus()
        pg.keyboard.press('Tab')
        out.append((t.ax(box).get('checked'), t.focused(pg)['label'], root.locator('input:disabled').evaluate_all('is => is.map(i => i.getAttribute("aria-label"))')))
    t.eq('React: the same box checks, Tab skips the same boxes', out[1], out[0])


PARITY = [('table', 'Grid', 'table')]
