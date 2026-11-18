"""Testimonial: README.md. A <figure>: the <blockquote> holds the words and the <figcaption> says who said them and
names the figure; the initials are aria-hidden, since the name is written beside them; nothing in it moves or takes
focus."""


def test_tree(t):
    pg = t.open()
    t.match_tree('each a figure named by who said it, the words in a blockquote, the initials not read', pg.locator('.tray-bento'), '''
- figure "Oksana Franko Perly Farm, Kyiv region":
  - blockquote: “We stopped losing orders the week we started. Friday is quiet now.”
  - text: Oksana Franko Perly Farm, Kyiv region
- figure "Marko Bilyk Meadow Bakery":
  - blockquote: “The packers learned it in a morning. Nobody asks me which box goes where any more.”
''')
    t.check('the initials are hidden from screen readers', pg.evaluate('() => [...document.querySelectorAll(".tray-testimonial .tray-avatar")].every(a => a.getAttribute("aria-hidden") === "true")'))
    snap = t.tree(pg.locator('.tray-bento'))
    t.check('so they are not read before the name', 'OF' not in snap and 'MB' not in snap, snap)
    t.eq('nothing in it takes focus', pg.evaluate('() => document.querySelectorAll(".tray-testimonial :is(a, button, input, [tabindex])").length'), 0)


def test_motion(t):
    pg = t.open(motion='no-preference')
    t.eq('nothing in it moves, even where motion is welcome', pg.evaluate('() => document.getAnimations().length'), 0)


def test_layout(t):
    pg = t.open(width=1440)
    a, b = pg.locator('.tray-testimonial').nth(0).bounding_box(), pg.locator('.tray-testimonial').nth(1).bounding_box()
    t.check('at 1440px the pair sits side by side, seven columns and five', abs(a['y'] - b['y']) < 1 and a['width'] > b['width'], (a, b))
    pg.close()
    pg = t.open(width=390)
    a, b = pg.locator('.tray-testimonial').nth(0).bounding_box(), pg.locator('.tray-testimonial').nth(1).bounding_box()
    t.check('at 390px they stack', b['y'] >= a['y'] + a['height'], (a, b))
    t.scan(pg, '390px')


PARITY = [('.tray-bento', 'Pair', '.tray-bento')]
