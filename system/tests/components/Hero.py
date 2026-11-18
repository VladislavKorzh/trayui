"""Hero: README.md. The headline is the page's one <h1>; the two buttons are links and are announced as links; the
<section> has no name, so it is not listed as a region; a drawn figure in the media card (the row of tray-steps) is
role="img" with an aria-label ("26 of 38 orders packed"). The yellow card keeps the light palette in every theme, so its
text and focus ring stay dark on yellow. Two cards on the 12-column grid, seven columns of text and five of media, stacked
below 56rem; the text card pushes its headline to the top and its buttons to the bottom."""


def test_tree(t):
    pg = t.open()
    t.match_tree('the headline, the sentence, two links and the note; the figure an image with its words', pg.locator('section.tray-hero'), '''
- heading "Every order, packed on time" [level=1]
- paragraph: "Counter is the order desk for small farms: orders in, labels out, the courier told."
- link "Start free"
- link "See how it works"
- paragraph: Free for 14 days. No card needed.
- paragraph: 38 orders
- img "26 of 38 orders packed"
''')
    t.eq('the headline is the page\'s one h1', pg.locator('h1').count(), 1)
    sec = t.ax(pg.locator('section.tray-hero'))
    t.check('the section has no name, so it is not a region', sec['role'] != 'region' and not sec['name'], sec)
    steps = pg.evaluate('() => { const s = document.querySelector(".tray-steps"); return [s.querySelectorAll("[data-done]").length, s.children.length]; }')
    t.check('the steps the image draws agree with its words (26 of 38 is about 7 of 10)', steps == [round(26 / 38 * 10), 10], steps)


def test_yellow(t):
    seen = {}
    for theme in ('light', 'dark'):
        pg = t.open(theme)
        seen[theme] = pg.evaluate('''() => { const m = document.querySelector('.tray-hero__media'), s = getComputedStyle(m); return [s.backgroundColor, s.color, getComputedStyle(m.querySelector('p')).color, s.colorScheme]; }''')
        pg.close()
    t.eq('the yellow media card keeps the light palette in Dark', seen['dark'], seen['light'])
    t.eq('it is drawn as a light ground', seen['dark'][3], 'light')


def test_layout(t):
    pg = t.open(width=1440)
    m = pg.evaluate('''() => { const g = document.querySelector('.tray-hero'), a = g.querySelector('.tray-hero__text').getBoundingClientRect(), b = g.querySelector('.tray-hero__media').getBoundingClientRect(), gap = parseFloat(getComputedStyle(g).columnGap);
        const col = (g.clientWidth - 11 * gap) / 12, span = (w) => Math.round((w + gap) / (col + gap));
        const t = g.querySelector('.tray-hero__text'), r = t.getBoundingClientRect(), cs = getComputedStyle(t), h = t.querySelector('h1').getBoundingClientRect(), act = t.querySelector('.tray-hero__actions').parentElement.getBoundingClientRect();
        return { spans: [span(a.width), span(b.width)], row: Math.round(a.top) === Math.round(b.top), head: Math.round(h.top - r.top - parseFloat(cs.paddingTop)), foot: Math.round(r.bottom - parseFloat(cs.paddingBottom) - act.bottom) }; }''')
    t.check('at 1440px the text takes seven columns and the media five, side by side', m['spans'] == [7, 5] and m['row'], m)
    t.check('the text card holds its headline at the top and its buttons at the bottom', abs(m['head']) <= 1 and abs(m['foot']) <= 1, m)
    pg.close()
    for w in (880, 390):
        pg = t.open(width=w)
        a, b = pg.locator('.tray-hero__text').bounding_box(), pg.locator('.tray-hero__media').bounding_box()
        t.check(f'at {w}px, below 56rem, the cards stack', b['y'] >= a['y'] + a['height'] and abs(a['width'] - b['width']) < 1, (a, b))
        if w == 390:
            t.scan(pg, '390px')
        pg.close()


def test_parity_figure(t):
    pg = t.open_react()
    cell = t.cell(pg, 'Figure')
    t.match_tree('React: the same figure as the HTML: an image named "26 of 38 orders packed"', cell, '''
- img "26 of 38 orders packed"
''')


PARITY = [('.tray-hero__text', 'Figure', '.tray-hero__text')]


