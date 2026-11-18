"""Activity Feed: README.md. An <ol> with role="list" (Safari drops the role of a list without markers), one <li> per event
and one per day label; the avatar and the icon of a tray-feed__mark are aria-hidden, so the sentence names the actor and
the object; a real <time> with datetime; no live region; events told apart by icon and words, never by colour."""


def test_tree(t):
    pg = t.open()
    feed = pg.locator('.tray-feed').first
    t.eq('the feed is an ol that keeps its list role', (feed.evaluate('e => e.tagName'), feed.get_attribute('role'), t.ax(feed)['role']), ('OL', 'list', 'list'))
    t.match_tree('a day label is an item of its own, then one item per event, newest first', feed, '''
- list:
  - listitem: Today
  - listitem:
    - paragraph:
      - text: Oksana Franko changed the delivery day of
      - link "PL-20418"
      - text: to Tuesday.
    - paragraph:
      - time: 10:42
    - paragraph: “The customer is away until Monday evening.”
  - listitem:
    - paragraph: Invoice CN-0042 was paid.
  - listitem:
    - paragraph: Bohdan Savchuk packed 9 orders.
  - listitem: Yesterday
  - listitem:
    - paragraph: Andriy Tkachuk was invited as a packer by Oksana Franko.
  - listitem:
    - paragraph: The API key Storefront was created.
''')
    t.check('avatars and marks are aria-hidden, so they say nothing', pg.evaluate('''[...document.querySelectorAll('.tray-feed .tray-avatar, .tray-feed__mark .tray-icon')].every(e => e.closest('[aria-hidden="true"]'))'''))
    t.check('every time in the first feed is a <time> with a datetime', pg.evaluate('[...document.querySelectorAll(".tray-feed")[0].querySelectorAll(".tray-feed__meta")].every(m => m.querySelector("time[datetime]"))'))
    t.check('the feed has no live region', pg.evaluate('!document.querySelector(".tray-feed [aria-live], .tray-feed [role=status], .tray-feed[aria-live]")'))
    t.check('the actor and the object are bold or linked', pg.evaluate('[...document.querySelectorAll(".tray-feed")[0].querySelectorAll("li:not(.tray-feed__day) .tray-feed__body > p:first-child")].every(p => p.querySelector("b, a"))'))


def test_colour(t):
    pg = t.open()
    # within a feed every mark has the same fill and ink (a feed on a card takes the card's fill, as every tray does)
    marks = pg.evaluate('[...document.querySelectorAll(".tray-feed")].map(f => new Set([...f.querySelectorAll(".tray-feed__mark")].map(m => getComputedStyle(m).backgroundColor + "/" + getComputedStyle(m).color)).size)')
    t.eq('the marks of a feed are all the same colour: events are told apart by icon and words', marks, [1, 1])


PARITY = [('.tray-feed', 'Workspace', '.tray-feed'),
          ('.tray-card', 'OnAnOrder', '.tray-card')]
