"""Table: README.md. A real <table>: the <caption> names it, scope on every head lets a cell be read with its column and row;
a figure in tray-success or tray-danger keeps its sign, so the colour only repeats it; a table wider than the screen sits in
tray-table-wrap with tabindex="0", role="region" and a name (aria-labelledby on the caption), so a keyboard reaches it and
scrolls it sideways; numbers right-aligned with tabular figures; the hover tint follows the pointer only."""



def test_tree(t):
    pg = t.open()
    t.match_tree('a region named by the caption, holding the table, the head row, the body and the foot', pg.locator('.tray-table-wrap'), '''
- region "Season record":
  - table "Season record":
    - caption: Season record
    - rowgroup:
      - row "Month Status Collected Against 2025":
        - columnheader "Month"
        - columnheader "Status"
        - columnheader "Collected"
        - columnheader "Against 2025"
    - rowgroup:
      - row "April Closed 14 kg +2 kg":
        - rowheader "April"
        - cell "Closed"
        - cell "14 kg"
        - cell "+2 kg"
    - rowgroup:
      - row "Season so far 104 kg +11 kg":
        - rowheader "Season so far"
''')
    t.check('every head carries a scope', pg.locator('th').evaluate_all('hs => hs.every(h => h.getAttribute("scope") === "col" || h.getAttribute("scope") === "row")'))
    t.eq('the region is a stop for Tab', pg.locator('.tray-table-wrap').get_attribute('tabindex'), '0')
    t.check('a coloured figure keeps its sign', pg.locator('td.tray-success, td.tray-danger').evaluate_all('cs => cs.every(c => /^[+−-]/.test(c.textContent.trim()))'))
    st = t.style(pg.locator('td[data-num]').first, 'text-align', 'font-variant-numeric')
    t.check('numbers align right in tabular figures', st['text-align'] in ('right', 'end') and 'tabular-nums' in st['font-variant-numeric'], st)


def scrolled(pg, wrap):
    """The keyboard scrolls smoothly: wait a moment for it to move."""
    try:
        pg.wait_for_function('w => w.scrollLeft > 0', arg=wrap.element_handle(), timeout=1500)
        return True
    except Exception:
        return False


def test_scroll(t):
    pg = t.open(width=390)
    wrap = pg.locator('.tray-table-wrap')
    wide = wrap.evaluate('w => w.scrollWidth > w.clientWidth')
    if wide:
        wrap.focus(); pg.keyboard.press('ArrowRight')
        t.check('on a phone the wrapper scrolls sideways from the keyboard', scrolled(pg, wrap))
    else:
        t.check('on a phone the table fits its wrapper or scrolls inside it', wrap.evaluate('w => w.getBoundingClientRect().right <= innerWidth + 1'))
    wrap.evaluate('w => { w.scrollLeft = 0; }')
    pg.evaluate('document.querySelector(".tray-table").style.minInlineSize = "40rem"')
    wrap.focus(); pg.keyboard.press('ArrowRight')
    t.check('a table wider than the screen scrolls inside its wrapper, from the keyboard', scrolled(pg, wrap) and pg.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'))


def test_react(t):
    pg = t.open_react()
    cell = t.cell(pg, 'SeasonRecord')
    wrap = cell.locator('table').locator('xpath=..')
    t.check('react: the table sits in a named, focusable region that scrolls', wrap.get_attribute('role') == 'region' and wrap.get_attribute('tabindex') == '0' and t.ax(wrap)['name'] == 'Season record',
            wrap.evaluate('w => w.outerHTML.slice(0, 160)'))


PARITY = [('table', 'SeasonRecord', 'table')]
