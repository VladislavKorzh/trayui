"""Footer: README.md. A <footer> outside <main>, so it is the page's content information (contentinfo); the wordmark a
link named by the product; each column a <nav> whose aria-label repeats its heading; the legal links in a list. Links take
the 3px ink focus ring in reading order: the brand, the columns, then the legal row. Each link in a column is a 44px row.
Up to four columns beside the brand from 56rem up; below that two columns of links, with the brand above them."""

ORDER = ['Counter', 'Features', 'Pricing', 'What is new', 'Status', 'Getting started', 'Guides', 'Contact us', 'About', 'Field notes',
         'Work with us', 'API reference', 'Webhooks', 'Privacy', 'Terms', 'Cookies']


def test_tree(t):
    pg = t.open()
    t.eq('the footer is the content information of the page', t.ax(pg.locator('footer'))['role'], 'contentinfo')
    t.match_tree('the brand, four named columns of links, the legal list', pg.locator('footer'), '''
- contentinfo:
  - link "Counter"
  - paragraph: The order desk for small farms and food makers.
  - navigation "Product":
    - heading "Product" [level=3]
    - link "Features"
    - link "Pricing"
    - link "What is new"
    - link "Status"
  - navigation "Help":
    - heading "Help" [level=3]
  - navigation "Company":
    - heading "Company" [level=3]
  - navigation "Developers":
    - heading "Developers" [level=3]
  - paragraph: © 2026 Counter. An invented product for these examples.
  - list:
    - listitem:
      - link "Privacy"
    - listitem:
      - link "Terms"
    - listitem:
      - link "Cookies"
''')
    navs = pg.evaluate('() => [...document.querySelectorAll(".tray-footer__col")].map(n => [n.getAttribute("aria-label"), n.querySelector("h1, h2, h3, h4, h5, h6").textContent.trim()])')
    t.check('each column\'s label repeats its heading', navs and all(a == b for a, b in navs), navs)


HEADS = '''(sel) => [...document.querySelectorAll(sel)].map(h => { const s = getComputedStyle(h);
    return [h.tagName.toLowerCase(), s.fontSize, s.fontWeight, s.color, s.marginBlockEnd]; })'''


def test_heading_levels(t):
    """The README: choose the heading level that fits the page. A column headed by an h2 (or an h4) looks as an h3 does."""
    pg = t.open()
    pg.evaluate('''() => { const top = document.querySelector('.tray-footer__top');
        for (const level of [2, 4]) { const n = document.createElement('nav'); n.className = 'tray-footer__col'; n.setAttribute('aria-label', 'Level ' + level);
          n.innerHTML = '<h' + level + '>Level ' + level + '</h' + level + '><a href="#">A link</a>'; top.append(n); } }''')
    heads = pg.evaluate(HEADS, '.tray-footer__col :is(h2, h3, h4)')
    h3 = next(h for h in heads if h[0] == 'h3')
    for level in ('h2', 'h4'):
        got = next(h for h in heads if h[0] == level)
        t.eq(f'a column headed by an {level} looks as one headed by an h3 (size, weight, muted ink, space under it)', got[1:], h3[1:])


def test_react_heading_level(t):
    pg = t.open_react()
    four = pg.evaluate(HEADS, '[data-cell="FourColumns"] .tray-footer__col :is(h2, h3, h4)')
    two = pg.evaluate(HEADS, '[data-cell="TwoColumns"] .tray-footer__col :is(h2, h3, h4)')
    t.eq('React: the column headings are h3 by default', {h[0] for h in four}, {'h3'})
    t.eq('headingLevel={2} makes them h2', {h[0] for h in two}, {'h2'})
    t.eq('and they look the same', {tuple(h[1:]) for h in two}, {tuple(h[1:]) for h in four})


def test_keys(t):
    pg = t.open()
    seen = []
    for f in t.tab_through(pg, len(ORDER)):
        seen.append(f['text'])
    t.eq('Tab goes through the brand, the columns, then the legal row', seen, ORDER)
    ring = pg.evaluate('''() => { const a = document.activeElement, s = getComputedStyle(a), p = document.createElement('i'); p.style.color = 'var(--ink)'; document.body.appendChild(p); const ink = getComputedStyle(p).color; p.remove();
        return [a.matches(':focus-visible'), s.outlineStyle, s.outlineWidth, s.outlineColor === ink]; }''')
    t.eq('a focused link takes the 3px ink ring', ring, [True, 'solid', '3px', True])


def test_targets(t):
    pg = t.open()
    sizes = [t.hit(pg.locator('.tray-footer__col a').nth(i))[1] for i in range(pg.locator('.tray-footer__col a').count())]
    t.check('each link in a column is a 44px row', sizes and min(sizes) >= 44, sizes)


COLS = r"""() => { const top = (e) => Math.round(e.getBoundingClientRect().top), left = (e) => Math.round(e.getBoundingClientRect().left);
  const brand = document.querySelector('.tray-footer__brand'), cols = [...document.querySelectorAll('.tray-footer__col')];
  return { brand: [top(brand), left(brand), Math.round(brand.getBoundingClientRect().bottom)], cols: cols.map(c => [top(c), left(c)]) }; }"""


def test_layout(t):
    pg = t.open(width=1440)
    m = pg.evaluate(COLS)
    t.check('from 56rem the four columns sit beside the brand, on one row', all(c[0] == m['brand'][0] for c in m['cols']) and all(c[1] > m['brand'][1] for c in m['cols']), m)
    pg.close()
    for w in (880, 390):
        pg = t.open(width=w)
        m = pg.evaluate(COLS)
        tops = sorted({c[0] for c in m['cols']})
        lefts = sorted({c[1] for c in m['cols']})
        t.check(f'at {w}px the brand is above, the links in two columns', all(c[0] >= m['brand'][2] for c in m['cols']) and len(lefts) == 2 and len(tops) == 2, m)
        pg.close()
    pg = t.open(width=390)
    t.scan(pg, '390px')


# The React preview draws its cells inside a <main>, where a <footer> is no landmark: compare what is inside it.
PARITY = [('.tray-footer__top', 'FourColumns', '.tray-footer__top'), ('.tray-footer__bottom', 'FourColumns', '.tray-footer__bottom')]


def test_parity_footer(t):
    pg = t.open_react()
    t.eq('React: the footer is a <footer>, which outside <main> is the content information', t.cell(pg, 'FourColumns').locator('footer.tray-footer').count(), 1)
