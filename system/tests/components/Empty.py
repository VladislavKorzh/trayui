"""Empty: README.md. Read in order: its heading, its sentence, then its buttons; the icon in the tile is aria-hidden (the
<svg>, not the tile), so the tile says nothing; the heading level fits the page; text at most 36 characters wide, centred."""


def test_tree(t):
    pg = t.open()
    t.match_tree('the first-use state in a card: heading, sentence, button', pg.locator('.tray-card .tray-empty'), '''
- heading "No orders yet" [level=3]
- paragraph: When someone orders a jar it shows up here.
- button "Create an order"
''')
    t.match_tree('the no-results state: heading, sentence, button', pg.locator('.tray-demo > .tray-empty'), '''
- heading "Nothing matches \\"truffle\\"" [level=3]
- paragraph: Check the spelling, or look through all the notes.
- button "Clear the search"
''')
    t.check('the icon is aria-hidden and the tile around it is not', pg.evaluate('[...document.querySelectorAll(".tray-empty__icon")].every(i => i.querySelector("svg").getAttribute("aria-hidden") === "true" && !i.hasAttribute("aria-hidden"))'))
    t.eq('the tile says nothing', t.ax(pg.locator('.tray-empty__icon')).get('name'), '')


def test_measure(t):
    pg = t.open(width=1440)
    m = pg.evaluate('''() => { const box = document.querySelector('.tray-empty__text'), p = box.querySelector('p');
        const x = document.createElement('span'); x.textContent = '0'.repeat(36); x.style.font = getComputedStyle(box).font; x.style.whiteSpace = 'pre'; box.appendChild(x);
        const ch36 = x.getBoundingClientRect().width; x.remove();
        return { max: parseFloat(getComputedStyle(box).maxInlineSize), ch36, align: getComputedStyle(p).textAlign }; }''')
    t.check('the text is at most 36 characters wide', abs(m['max'] - m['ch36']) < 1, m)
    t.eq('and centred', m['align'], 'center')


PARITY = [('.tray-card .tray-empty', 'FirstUseAndNoResults', '.tray-card .tray-empty'),
          ('.tray-demo > .tray-empty', 'FirstUseAndNoResults', '.tray-bento > .tray-empty')]
