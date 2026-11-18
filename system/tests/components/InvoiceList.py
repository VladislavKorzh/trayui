"""Invoice List: README.md. A real <table> named by its <caption>; scope="col" heads (the last one hidden text, so the
column is named) and a scope="row" invoice number on each row; each download an icon link whose aria-label carries the
invoice number; a failed invoice gets "Pay now" in place of the download; the status an icon and a word (the icon hidden),
so colour is never the only sign; amounts right-aligned in tabular numerals (data-num). It scrolls inside its wrapper on
a phone."""


def test_tree(t):
    pg = t.open()
    table = pg.locator('table.tray-table')
    t.eq('the table is named by its caption', (t.ax(table)['role'], t.ax(table)['name']), ('table', 'Invoices'))
    t.match_tree('the heads, a row head per invoice, the downloads and Pay now', table, '''
- rowgroup:
  - row:
    - columnheader "Invoice"
    - columnheader "Date"
    - columnheader "Status"
    - columnheader "Amount"
    - columnheader "Action"
- rowgroup:
  - row:
    - rowheader "CN-0043"
    - cell "1 December 2026"
    - cell "Due"
    - cell "$39.00"
    - cell:
      - link "Download invoice CN-0043"
  - row:
    - rowheader "CN-0042"
    - cell "1 November 2026"
    - cell "Paid"
    - cell "$39.00"
    - cell:
      - link "Download invoice CN-0042"
  - row:
    - rowheader "CN-0041"
    - cell "1 October 2026"
    - cell "Failed"
    - cell "$29.00"
    - cell:
      - link "Pay now"
  - row:
    - rowheader "CN-0040"
''')
    t.eq('every head has its scope', pg.evaluate('() => [...document.querySelectorAll("th")].map(h => h.getAttribute("scope")).join()'), 'col,col,col,col,col,row,row,row,row')
    names = pg.evaluate('''() => [...document.querySelectorAll("tbody tr")].map(r => { const a = r.querySelector("td:last-child a"); return [r.querySelector("th").textContent.trim(), a.getAttribute("aria-label") || a.textContent.trim()]; })''')
    t.check('each download is named with its own invoice number', all(n[1] == f'Download invoice {n[0]}' for n in names if n[0] != 'CN-0041'), names)
    badges = pg.evaluate('''() => [...document.querySelectorAll(".tray-badge")].map(b => [b.textContent.trim(), (b.querySelector("svg") || {}).getAttribute ? b.querySelector("svg").getAttribute("aria-hidden") : null])''')
    t.check('each status is an icon and a word, the icon hidden', all(w and h == 'true' for w, h in badges), badges)
    icons = pg.evaluate('() => [...document.querySelectorAll("td a svg")].map(s => s.getAttribute("aria-hidden"))')
    t.check('the icons of the download links are hidden', icons and all(i == 'true' for i in icons), icons)


def test_numbers(t):
    pg = t.open()
    cells = pg.evaluate('''() => [...document.querySelectorAll("[data-num]")].filter(c => !c.querySelector("a")).map(c => { const s = getComputedStyle(c); return [c.textContent.trim(), s.textAlign, s.fontVariantNumeric]; })''')
    t.check('the amounts are right-aligned in tabular numerals', cells and all(a in ('right', 'end') and 'tabular-nums' in v for _, a, v in cells), cells)
    pg.close()
    pg = t.open(width=390)
    wrap = pg.evaluate('() => { const w = document.querySelector(".tray-table-wrap"); return [w.scrollWidth, w.clientWidth, getComputedStyle(w).overflowX]; }')
    t.check('at 390px the table scrolls inside its wrapper, not the page', wrap[2] == 'auto' and pg.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), wrap)
    # the wrapper holds a link on every row, so Tab scrolls it with the keyboard (axe: scrollable-region-focusable)
    t.scan(pg, '390px')


def test_keys(t):
    pg = t.open()
    order = [f['label'] or f['text'] for f in t.tab_through(pg, 4)]
    t.eq('Tab walks the actions of the rows in order', order, ['Download invoice CN-0043', 'Download invoice CN-0042', 'Pay now', 'Download invoice CN-0040'])


PARITY = [('table.tray-table thead', 'Invoices', 'table thead'), ('table.tray-table tbody', 'Invoices', 'table tbody'), ('table.tray-table caption', 'Invoices', 'table caption')]
