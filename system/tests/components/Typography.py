"""Typography: README.md. The styles change only the look: a heading is known by its element, whatever class it wears; the
five heading styles are clamp()s of rem and vw, so the browser's text size moves their ends and their rem part, page zoom
grows a heading inside its range by its rem part alone (about 4px at 200%), and every other style is in rem and grows in
full with zoom and text size (WCAG 1.4.4). No italics anywhere."""

SIZE = 'sel => parseFloat(getComputedStyle(document.querySelector(sel)).fontSize)'
FLUID = {'display': (2.75, .25, 6.2, 6), 'headline': (2.125, .25, 4.2, 4), 'title': (1.75, .25, 2.6, 2.5), 'subtitle': (1.375, .5, 1.4, 1.75), 'figure': (4, .25, 7.2, 7)}


def clamp(name, vw, rem=16):
    lo, mid, v, hi = FLUID[name]
    return min(hi * rem, max(lo * rem, mid * rem + v * vw / 100))


def test_tree(t):
    pg = t.open()
    t.eq('a class does not make a heading: p.display is a paragraph', t.ax(pg.locator('p.display'))['role'], 'paragraph')
    a = t.ax(pg.locator('.tray-prose h2'))
    t.eq('the element does: h2.subtitle is a heading of level 2', (a['role'], a.get('level'), a['name']), ('heading', 2, 'Why we collect in the morning'))
    t.match_tree('the prose reads as a heading, paragraphs, a list and a quotation', pg.locator('.tray-prose'), '''
- heading "Why we collect in the morning" [level=2]
- paragraph
- list:
  - listitem: "Out and feeding: the bed is healthy."
  - listitem: "Clustered on the boards: too dry, so we water before dawn."
- paragraph: It is slow work. One snail gives roughly 4 g of caviar in a year. Field notes, 12 June 2026
''')
    italic = pg.evaluate('[...document.querySelectorAll(".tray-demo *")].filter(e => getComputedStyle(e).fontStyle !== "normal").map(e => e.tagName + "." + e.className)')
    t.eq('no italics anywhere, the cite of the quotation included', italic, [])


def test_fluid(t):
    for w in (390, 720, 1440):
        pg = t.open(width=w)
        vw = pg.evaluate('innerWidth')  # a vw is a hundredth of the window
        got = {n: round(pg.evaluate(SIZE, '.' + n if n != 'figure' else '.tray-figure'), 2) for n in FLUID}
        want = {n: round(clamp(n, vw), 2) for n in FLUID}
        t.check(f'at {w}px the heading styles take their clamp() of rem and vw', all(abs(got[n] - want[n]) < .6 for n in FLUID), f'got {got}, want {want}')
        pg.close()
    one, two = t.open(width=1440), t.open(width=720)  # 200% zoom of a 1440px window counts 720 CSS pixels
    d1, d2 = one.evaluate(SIZE, '.display'), two.evaluate(SIZE, '.display')
    t.check('page zoom to 200% grows a display heading in its range by its rem part alone, about 4px on screen', abs(d2 * 2 - d1 - 4) < .6, f'{d1}px at 100%, {d2 * 2}px on screen at 200%')
    b1, b2 = one.evaluate(SIZE, '.body'), two.evaluate(SIZE, '.body')
    t.eq('body text keeps its CSS size, so it doubles on screen with zoom', b2, b1)


def test_text_size(t):
    pg = t.open(width=1440)
    before = {n: pg.evaluate(SIZE, s) for n, s in (('body', '.body'), ('label', '.label'), ('caption', '.caption'), ('display', '.display'), ('code', '.code'))}
    pg.evaluate('document.documentElement.style.fontSize = "32px"')  # the browser's text size at 200%
    after = {n: pg.evaluate(SIZE, s) for n, s in (('body', '.body'), ('label', '.label'), ('caption', '.caption'), ('display', '.display'), ('code', '.code'))}
    t.check('body, label, caption and code grow in full with the text size', all(abs(after[n] - 2 * before[n]) < .5 for n in ('body', 'label', 'caption', 'code')), f'{before} -> {after}')
    want = clamp('display', pg.evaluate('innerWidth'), 32)
    t.check('a heading in its range grows by its rem part with the text size', abs(after['display'] - want) < .6, f'{after["display"]}px, want {want}px')


PARITY = [('.tray-prose', 'Prose', '.tray-prose')]


def test_parity_markup(t):
    r = t.open_react()
    got = r.evaluate('[...document.querySelectorAll(".tray-type-row > :last-child")].map(e => e.tagName.toLowerCase() + "." + [...e.classList].join("."))')
    for want in ('p.display', 'p.headline', 'p.title', 'p.subtitle', 'p.code', 'p.body'):
        t.check(f'React: <Typography> writes {want}', any(g == want or g.startswith(want + '.') for g in got), got)
