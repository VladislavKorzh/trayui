"""Feature Grid: README.md. The Bento grid with Cards: each card an <article> titled by its h3, its icon tile
aria-hidden, read in source order whatever its span; spans that add up to 12 in a row, one column below 56rem; what sits
in tray-feature__end is real text, read as it stands. On the ink card the text takes its on-dark colours (the scans hold
it to 4.5:1). The grid's own name is the visible heading the page gives it through aria-labelledby: the preview shows the
cards alone, so there is no heading to test here."""


def test_tree(t):
    pg = t.open()
    t.match_tree('five articles, each titled by its h3, the first with real text at its end', pg.locator('section.tray-bento'), '''
- article:
  - heading "One list for every order" [level=3]
  - paragraph: From the shop, the phone and the market stall, in the order they must leave.
  - list:
    - listitem: PL-20431, Dana Kovalenko To pack
    - listitem: PL-20418, Ivan Petrenko With the courier
- article:
  - heading "The courier knows before you call" [level=3]
- article:
  - heading "Labels that print themselves" [level=3]
- article:
  - heading "Stock by batch" [level=3]
- article:
  - heading "A screen for the people who pack" [level=3]
''')
    t.check('every icon tile is hidden from screen readers', pg.evaluate('() => [...document.querySelectorAll(".tray-feature__icon svg")].every(s => s.getAttribute("aria-hidden") === "true")'))
    t.check('each article opens with its icon and its h3, nothing focusable before the title', pg.evaluate('() => [...document.querySelectorAll(".tray-feature")].every(a => a.querySelector("h3") && !a.querySelector("a, button, input"))'))


ROWS = r"""() => [...document.querySelectorAll('.tray-bento > .tray-feature')].map(a => { const r = a.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.left), Math.round(r.width)]; })"""


def test_layout(t):
    pg = t.open(width=1440)
    boxes = pg.evaluate(ROWS)
    rows = {}
    for top, left, w in boxes:
        rows.setdefault(top, []).append((left, w))
    grid = pg.evaluate('() => { const g = document.querySelector(".tray-bento"), cs = getComputedStyle(g); return [g.clientWidth, parseFloat(cs.columnGap)]; }')
    col = (grid[0] - 11 * grid[1]) / 12
    spans = [[round((w + grid[1]) / (col + grid[1])) for _, w in sorted(r)] for _, r in sorted(rows.items())]
    t.eq('at 1440px the spans add up to 12 in a row: 7 and 5, then three of 4', spans, [[7, 5], [4, 4, 4]])
    order = [b for b in sorted(boxes, key=lambda b: (b[0], b[1]))]
    t.eq('the cards are laid out in source order', order, boxes)
    pg.close()
    for w in (880, 390):  # 56rem is 896px
        pg = t.open(width=w)
        boxes = pg.evaluate(ROWS)
        t.check(f'at {w}px, below 56rem, the cards stack in one column, in source order', all(b[1] == boxes[0][1] and b[2] == boxes[0][2] for b in boxes) and [b[0] for b in boxes] == sorted(b[0] for b in boxes), boxes)
    t.scan(pg, '390px')


PARITY = [('section.tray-bento', 'Bento', '.tray-bento')]
