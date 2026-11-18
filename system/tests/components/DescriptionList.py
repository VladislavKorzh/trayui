"""Description List: README.md. A real <dl> keeps each term with its value (a <div> around each pair); ruled rows at least
56px tall, the term column 12rem, the value under its term below 34rem; a copy button in a value is an icon button named
for the fact, and with data-tray="copy" "Copied" (or "Copy failed") is said through a hidden status beside it."""


def test_tree(t):
    pg = t.open()
    t.match_tree('terms and their values, a badge read as its word, the copy button named for the fact', pg.locator('dl').first, '''
- term: Customer
- definition:
  - link "Dana Kovalenko"
- term: Status
- definition: To pack
- term: Delivery
- definition: Courier, chilled box, 16 November
- term: Tracking number
- definition:
  - text: PL20431UA
  - button "Copy the tracking number"
  - status
- term: Gift note
- definition: None
''')
    t.eq('each pair sits in a div of the dl', pg.evaluate('[...document.querySelectorAll("dl.tray-dl > *")].every(d => d.tagName === "DIV" && d.querySelector(":scope > dt") && d.querySelector(":scope > dd"))'), True)


def test_copy(t):
    pg = t.open()
    btn = pg.locator('[data-tray="copy"]')
    btn.click()
    status = pg.locator('dd [role="status"]')
    pg.wait_for_function('() => document.querySelector("dd [role=status]").textContent.trim() !== ""', timeout=2000)
    t.eq('the tracking number is on the clipboard', pg.evaluate('navigator.clipboard.readText()'), 'PL20431UA')
    t.eq('"Copied" is said through the status beside the button', status.text_content().strip(), 'Copied')
    t.check('the status is hidden from the eye', status.evaluate('e => e.getBoundingClientRect().width <= 1 || getComputedStyle(e).clipPath !== "none"'))
    t.check('focus stays on the button', t.is_focused(btn))


def test_copy_failed(t):
    pg = t.open()
    pg.evaluate('() => { navigator.clipboard.writeText = () => Promise.reject(new Error("denied")); }')
    pg.click('[data-tray="copy"]')
    pg.wait_for_function('() => document.querySelector("dd [role=status]").textContent.trim() !== ""', timeout=2000)
    t.eq('when the clipboard refuses, "Copy failed" is said instead', pg.locator('dd [role="status"]').text_content().strip(), 'Copy failed')
    pg.wait_for_function('() => document.querySelector("dd [role=status]").textContent.trim() === ""', timeout=3500)
    t.check('the status empties again after a moment, so the next copy is heard', not pg.get_attribute('[data-tray="copy"]', 'data-failed'))


def test_layout(t):
    pg = t.open(width=1440)
    rows = pg.evaluate('''[...document.querySelectorAll("dl.tray-dl:not(.tray-dl--plain) > div")].map(d => { const t = d.querySelector("dt").getBoundingClientRect(), v = d.querySelector("dd").getBoundingClientRect(); return { h: d.getBoundingClientRect().height, side: v.left >= t.right, tw: t.width }; })''')
    t.check('ruled rows are at least 56px tall', all(r['h'] >= 55.5 for r in rows), rows)
    t.check('wide, the value sits beside its term, in a column of 12rem at most', all(r['side'] and r['tw'] <= 192.5 for r in rows), rows)
    pg.close()
    pg = t.open(width=390)
    under = pg.evaluate('''[...document.querySelectorAll("dl.tray-dl > div")].map(d => d.querySelector("dd").getBoundingClientRect().top >= d.querySelector("dt").getBoundingClientRect().bottom - 1)''')
    t.check('below 34rem the value drops under its term', all(under), under)
    stack = pg.evaluate('''[...document.querySelectorAll("dl.tray-dl--stack > div")].map(d => d.querySelector("dd").getBoundingClientRect().top >= d.querySelector("dt").getBoundingClientRect().bottom - 1)''')
    t.check('tray-dl--stack sets the term over its value', all(stack), stack)


PARITY = [('.tray-demo', 'OrderDetails', '.tray-row')]



def test_parity_copy(t):
    r = t.open_react()
    cell = t.cell(r, 'OrderDetails')
    cell.get_by_role('button', name='Copy the tracking number').click()
    r.wait_for_function('() => [...document.querySelectorAll("[data-cell=OrderDetails] [role=status]")].some(s => s.textContent.trim())', timeout=2000)
    t.eq('React: the copy button copies the number', r.evaluate('navigator.clipboard.readText()'), 'PL20431UA')
    t.eq('React: and says "Copied" through its status', cell.locator('[role="status"]').first.text_content().strip(), 'Copied')
