"""Top Bar: README.md. A <header> (a banner): the breadcrumb is a nav named "Breadcrumb" whose last item carries
aria-current="page"; the search is a button named by its words, and with tray-topbar__search--fold by its aria-label; every
icon button has an aria-label; a button with a pip says the count in its name and the pip is aria-hidden (the script sets
it on every tray-pip); the avatar button names the account and ends with the initials it shows (the Avatar README, WCAG 2.5.3); the back link hides its
arrow and says where it goes in a tray-vh span. Below 48rem the bar folds: tray-crumbs--fold keeps the current page only,
tray-topbar__search--fold keeps the search's icon only."""



def test_tree(t):
    pg = t.open()
    bar = pg.locator('header.tray-topbar').first
    t.match_tree('the bar is a banner with the breadcrumb, the search, the icon buttons and the avatar', bar, '''
- banner:
  - navigation "Breadcrumb":
    - list:
      - listitem:
        - link "Perly Farm"
      - listitem:
        - link "Orders"
      - listitem: PL-20431
  - button "Search orders"
  - button "Help"
  - button "Notifications, 2 unread"
  - 'button "Account: Oksana Franko, OF"'
''')
    t.eq('the last item of the breadcrumb is the current page', pg.locator('.tray-crumbs [aria-current]').get_attribute('aria-current'), 'page')
    t.check('every pip is aria-hidden, so the count is not read twice', pg.evaluate('[...document.querySelectorAll(".tray-pip")].every(p => p.getAttribute("aria-hidden") === "true")'))
    t.eq('the avatar button shows the initials its name ends with', pg.locator('button.tray-avatar').first.inner_text().strip(), 'OF')
    card = pg.locator('.tray-card header.tray-topbar')
    t.match_tree('on a card: the back link names where it goes, then the title as a heading', card, '''
- banner:
  - link "Back to orders"
  - heading "Order PL-20431" [level=2]
  - text: To pack
  - button "Share"
  - button "More actions"
''')
    t.eq('the back link\'s arrow is aria-hidden', pg.locator('.tray-back > svg').get_attribute('aria-hidden'), 'true')


def test_script_hides_pips(t):
    pg = t.open()
    pg.evaluate('''() => { const s = document.createElement('span'); s.className = 'tray-anchor'; s.innerHTML = '<button class="tray-btn tray-btn--icon" aria-label="Messages, 3 unread">M</button><span class="tray-pip" id="late">3</span>';
                           document.querySelector('.tray-topbar__end').appendChild(s); TrayUI.init(s); }''')
    t.eq('a pip added later is made aria-hidden by TrayUI.init', pg.get_attribute('#late', 'aria-hidden'), 'true')


def test_fold(t):
    pg = t.open(width=390)
    crumbs = pg.locator('.tray-topbar').first.locator('.tray-crumbs li')
    t.eq('below 48rem the breadcrumb keeps only the current page', [crumbs.nth(i).is_visible() for i in range(crumbs.count())], [False, False, True])
    search = pg.locator('.tray-topbar__search')
    t.check('the folded search shows its icon alone', not search.locator('span').is_visible() and search.locator('svg').is_visible())
    t.eq('and keeps its name from its aria-label', t.ax(search)['name'], 'Search orders')
    w, h = t.hit(search)
    t.check('the folded search is still a 44px target', w >= 44 and h >= 44, (w, h))
    pg = t.open(width=1180)
    t.eq('on a wide window the search shows its words', pg.locator('.tray-topbar__search > span').inner_text(), 'Search orders')


def test_react(t):
    pg = t.open_react()
    cell = t.cell(pg, 'OverThePage')
    a = t.ax(cell.locator('button.tray-avatar'))
    t.eq('react: the avatar button names the account', a['name'], 'Account: Oksana Franko, OF')
    t.eq('react: the bell says the count in its name', t.ax(cell.locator('button[aria-label^="Notifications"]'))['name'], 'Notifications, 2 unread')
    t.check('react: every pip is aria-hidden', pg.evaluate('[...document.querySelectorAll(".tray-pip")].every(p => p.getAttribute("aria-hidden") === "true")'))


# The whole bar over the page (a banner: the React cells are drawn in <div>s), the parts of the bar on a card.
PARITY = [('.tray-demo > header.tray-topbar', 'OverThePage', 'header.tray-topbar'),
          ('.tray-card .tray-topbar__start', 'OnACard', '.tray-topbar__start'),
          ('.tray-card .tray-topbar__end', 'OnACard', '.tray-topbar__end'),
          ('.tray-topbar nav[aria-label="Breadcrumb"]', 'OverThePage', 'nav[aria-label="Breadcrumb"]')]
