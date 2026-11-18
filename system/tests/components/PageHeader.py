"""Page Header: README.md. The title is the page's <h1>, a Badge beside it read after it as plain text; the tabs under it are
links in a <nav> named by its aria-label, the current one aria-current="page" and drawn in ink; a count Badge in a tab is part
of the tab's name; an icon-only action has an aria-label; the icons of the meta line are aria-hidden, so the words carry the
facts; a tray-back link or a Breadcrumb above the row, never both."""


def test_tree(t):
    pg = t.open()
    heads = pg.locator('.tray-pagehead')
    t.eq('each page header holds one h1, its title', [heads.nth(i).locator('h1').count() for i in range(heads.count())], [1, 1])
    t.match_tree('the list header: the title, the line about it, the actions', heads.nth(0), '''
- heading "Customers" [level=1]
- paragraph: Everyone who has ordered from the farm, newest first.
- button "Import"
- button "Add a customer"
''')
    t.match_tree('the header of one thing: the back link, the title and its badge, the actions, the meta line, the tabs', heads.nth(1), '''
- link "Customers"
- heading "Dana Kovalenko" [level=1]
- text: Regular
- paragraph: Orders every second week, mostly 50 g jars.
- button "More actions"
- button "Edit"
- button "New order"
- paragraph: Customer since March 2025 14 orders Kyiv
- navigation "Customer":
  - link "Overview"
  - link "Orders 14"
  - link "Notes"
  - link "Invoices"
''')
    t.eq('the badge is read after the title, as plain text', pg.locator('.tray-pagehead__title').evaluate('e => [...e.children].map(c => c.tagName + (c.getAttribute("role") || "")).join()'), 'H1,SPAN')
    t.check('the icons of the meta line and the actions are aria-hidden', pg.evaluate('[...document.querySelectorAll(".tray-pagehead svg")].every(s => s.getAttribute("aria-hidden") === "true")'))
    cur = pg.locator('nav[aria-label="Customer"] [aria-current]')
    t.eq('one tab is current, as a page', (cur.count(), cur.get_attribute('aria-current'), cur.inner_text()), (1, 'page', 'Overview'))
    t.eq('the current tab is drawn in ink: its sliding pill sits under it', pg.evaluate('''(() => { const n = document.querySelector('nav[aria-label="Customer"]'), g = n.querySelector('.tray-glide'), c = n.querySelector('[aria-current]');
        if (!g) return 'no pill'; const a = g.getBoundingClientRect(), b = c.getBoundingClientRect(); return Math.abs(a.left - b.left) < 2 && Math.abs(a.width - b.width) < 2 ? 'under it' : [a.left, b.left]; })()'''), 'under it')
    t.check('a tray-back link or a Breadcrumb, never both', all(heads.nth(i).locator('.tray-back').count() + heads.nth(i).locator('nav[aria-label="Breadcrumb"]').count() <= 1 for i in range(heads.count())))


def test_keys(t):
    pg = t.open()
    pg.locator('.tray-back').focus()
    seq = [f['text'] or f['label'] for f in t.tab_through(pg, 7)]
    t.eq('Tab follows the reading order: the actions, then the tabs', seq, ['More actions', 'Edit', 'New order', 'Overview', 'Orders 14', 'Notes', 'Invoices'])


def test_wrap(t):
    pg = t.open(width=390)
    row = pg.locator('.tray-pagehead__row').nth(1)
    tops = row.evaluate('r => [...r.children].map(c => Math.round(c.getBoundingClientRect().top))')
    t.check('on a phone the actions wrap under the title', tops[1] > tops[0], tops)
    # a strip of tabs that does not fit, in a wrapper of its own (as a page may put it), scrolls inside the header
    pg.evaluate('''() => { const h = document.querySelectorAll('.tray-pagehead')[1], d = document.createElement('div');
      d.innerHTML = '<nav class="tray-tabs" data-tray="strip" aria-label="More">' + ['Overview', 'Orders', 'Notes', 'Invoices', 'Deliveries', 'Returns', 'Messages'].map(s => '<a class="tray-tab" href="#">' + s + '</a>').join('') + '</nav>';
      h.appendChild(d); TrayUI.init(d); }''')
    pg.wait_for_timeout(60)
    m = pg.evaluate('() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]')
    t.check('a strip of tabs too wide for a phone scrolls inside the header, not the page', m[0] <= m[1] + 1, m)


PARITY = [('.tray-pagehead:nth-of-type(1)', 'List', '.tray-pagehead'),
          ('.tray-pagehead:nth-of-type(2)', 'OneThing', '.tray-pagehead')]
