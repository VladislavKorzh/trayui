"""Data Table: README.md. A real <table> named by its aria-label, heads scoped; a sort button inside its column head, the
head taking aria-sort="ascending" or "descending" (and the arrow following); the filter field named by aria-label and hiding
rows that do not contain the text, the empty row shown when nothing matches; each row's checkbox named after the row, the
head checkbox announced as mixed while only some are chosen; paging by data-page-size with the status "1–5 of 8"; the counts
written into role="status" regions; the previous and next buttons turn off on the first and last page, and when the one in
focus turns off focus moves to the other, or to the count when there is a single page; tray:change with detail.selected and
detail.page; each row's action button names its row."""



def first_cells(pg, root=None):
    return (root or pg).locator('tbody tr:visible th[scope="row"]').evaluate_all('hs => hs.map(h => h.textContent)')


def test_tree(t):
    pg = t.open()
    t.eq('the table is named, inside a named, focusable region', (t.ax(pg.locator('table'))['name'], t.ax(pg.locator('.tray-table-wrap'))['role'], t.ax(pg.locator('.tray-table-wrap'))['name'], pg.locator('.tray-table-wrap').get_attribute('tabindex')), ('Orders', 'region', 'Orders', '0'))
    t.check('every column head is scoped', pg.locator('thead th[scope="col"]').count() == 5)
    t.check('every row head is scoped', pg.locator('tbody th').evaluate_all('hs => hs.every(h => h.getAttribute("scope") === "row")'))
    t.eq('the sort buttons sit in their heads', pg.locator('th .tray-sort').evaluate_all('bs => bs.map(b => b.textContent.trim())'), ['Order', 'Customer', 'Placed', 'Total'])
    t.eq('the head sorted at load says so', pg.locator('th[aria-sort]').evaluate_all('hs => hs.map(h => [h.textContent.trim(), h.getAttribute("aria-sort")])'), [['Placed', 'descending']])
    t.eq('the filter field is named', t.ax(pg.locator('[data-filter]'))['name'], 'Filter orders')
    t.eq('each row checkbox names its row', t.ax(pg.locator('[data-select]').first)['name'], 'Select order PL-20418')
    t.eq('the head checkbox is mixed while some rows are chosen', t.ax(pg.locator('[data-select-all]')).get('checked'), 'mixed')
    t.eq('each row\'s action button names its row', t.ax(pg.locator('.tray-table__act button').first)['name'], 'Actions for order PL-20418')
    t.eq('the counts are status regions', pg.locator('[data-selected-count], [data-page-status]').evaluate_all('ss => ss.map(s => s.getAttribute("role"))'), ['status', 'status'])
    t.eq('the first page and the count', (pg.inner_text('[data-page-status]'), pg.inner_text('[data-selected-count]'), pg.locator('tbody tr:visible').count()), ('1–5 of 8', '2 of 8 selected', 5))
    t.check('selected rows take the resting fill', t.style(pg.locator('tbody tr').first, 'background-color') != t.style(pg.locator('tbody tr').nth(1), 'background-color'))


def test_sort(t):
    pg = t.open()
    t.clear_events(pg)
    total = pg.locator('.tray-sort', has_text='Total')
    total.focus(); pg.keyboard.press('Enter')
    th = pg.locator('th', has=pg.locator('.tray-sort', has_text='Total'))
    t.eq('Enter on a sort button sorts the column up', (th.get_attribute('aria-sort'), first_cells(pg)[0]), ('ascending', 'PL-20411'))
    t.eq('only one head says how the table is sorted', pg.locator('th[aria-sort]').count(), 1)
    t.eq('its arrow points up', th.locator('use').get_attribute('href'), '#tray-i-arrow-up')
    t.eq('the other heads show the two-way arrow again', pg.locator('th', has=pg.locator('.tray-sort', has_text='Placed')).locator('use').get_attribute('href'), '#tray-i-arrow-up-down')
    pg.keyboard.press('Space')
    t.eq('Space sorts it the other way', (th.get_attribute('aria-sort'), first_cells(pg)[0]), ('descending', 'PL-20416'))
    t.eq('sorting fires tray:change, back on the first page', [e['detail'] for e in t.events(pg, 'tray:change')][-1], {'selected': 2, 'page': 0})
    pg.locator('.tray-sort', has_text='Placed').click()
    t.eq('a date sorts by its data-value, oldest first', first_cells(pg)[0], 'PL-20411')
    pg.locator('.tray-sort', has_text='Customer').click()
    t.eq('text sorts by its words', first_cells(pg)[0], 'PL-20417')


def test_filter(t):
    pg = t.open()
    pg.fill('[data-filter]', 'franko')
    t.eq('the filter hides the rows that do not contain the text', first_cells(pg), ['PL-20415'])
    t.eq('the status counts what matches', pg.inner_text('[data-page-status]'), '1–1 of 1')
    pg.fill('[data-filter]', 'nobody')
    t.check('nothing matching shows the empty row', pg.is_visible('[data-empty]') and pg.inner_text('[data-page-status]') == 'Nothing to show')
    pg.fill('[data-filter]', '')
    t.check('clearing it brings the first page back', not pg.is_visible('[data-empty]') and pg.inner_text('[data-page-status]') == '1–5 of 8')


def test_select(t):
    pg = t.open()
    t.clear_events(pg)
    allbox = pg.locator('[data-select-all]')
    allbox.focus(); pg.keyboard.press('Space')
    t.eq('the head checkbox selects every row', (pg.inner_text('[data-selected-count]'), t.ax(allbox).get('checked')), ('8 of 8 selected', 'true'))
    t.eq('it fires tray:change with the count', [e['detail'] for e in t.events(pg, 'tray:change')][-1], {'selected': 8, 'page': 0})
    pg.keyboard.press('Space')
    t.eq('and none again', (pg.inner_text('[data-selected-count]'), t.ax(allbox).get('checked')), ('8 rows', 'false'))
    row = pg.locator('[data-select]').nth(1)
    row.focus(); pg.keyboard.press('Space')
    t.eq('a row checkbox makes the head mixed', (pg.inner_text('[data-selected-count]'), t.ax(allbox).get('checked')), ('1 of 8 selected', 'mixed'))


def test_paging(t):
    pg = t.open()
    nxt, prv = pg.locator('[data-page-next]'), pg.locator('[data-page-prev]')
    t.check('on the first page Previous is off', prv.is_disabled() and not nxt.is_disabled())
    t.clear_events(pg)
    nxt.focus(); pg.keyboard.press('Enter')
    t.eq('Next shows the second page', (pg.inner_text('[data-page-status]'), first_cells(pg)), ('6–8 of 8', ['PL-20413', 'PL-20412', 'PL-20411']))
    t.eq('it fires tray:change with the page', [e['detail'] for e in t.events(pg, 'tray:change')], [{'selected': 2, 'page': 1}])
    t.check('on the last page Next turns off', nxt.is_disabled())
    t.eq('and focus, which was on it, moves to Previous', t.focused(pg)['label'], 'Previous page')
    pg.keyboard.press('Enter')
    t.eq('Previous goes back, and focus moves to Next as Previous turns off', (pg.inner_text('[data-page-status]'), t.focused(pg)['label']), ('1–5 of 8', 'Next page'))
    nxt.focus()
    pg.fill('[data-filter]', 'kovalenko')
    pg.locator('[data-filter]').evaluate('e => e.blur()')
    nxt2 = pg.locator('[data-page-next]')
    t.check('with a single page both turn off', nxt2.is_disabled() and prv.is_disabled())


def test_single_page_rescue(t):
    pg = t.open()
    nxt = pg.locator('[data-page-next]')
    nxt.focus()
    # the filter narrows to one page while focus is on Next, as a script might do it
    pg.evaluate('''() => { const f = document.querySelector('[data-filter]'); f.value = 'kovalenko'; f.dispatchEvent(new Event('input')); }''')
    f = t.focused(pg)
    t.check('when the button in focus turns off and there is a single page, focus moves to the count', not f['body'] and pg.locator('[data-page-status]').evaluate('e => e === document.activeElement'), f)


def drive(t, pg, root, label):
    nxt = root.locator('[data-page-next]')
    nxt.focus(); pg.keyboard.press('Enter')
    t.eq(f'{label}Next shows the second page', root.locator('[data-page-status]').inner_text(), '6–8 of 8')
    t.eq(f'{label}and focus moves to Previous as Next turns off', t.focused(pg)['label'], 'Previous page')
    sort = root.locator('.tray-sort', has_text='Total')
    sort.click()
    th = root.locator('th', has=pg.locator('.tray-sort', has_text='Total'))
    t.eq(f'{label}a sort button sorts its column up and says so', (th.get_attribute('aria-sort'), first_cells(pg, root)[0]), ('ascending', 'PL-20411'))


def test_parity_keys(t):
    h = t.open()
    drive(t, h, h.locator('[data-tray="datatable"]'), '')
    r = t.open_react()
    cell = t.cell(r, 'Orders')
    drive(t, r, cell, 'react: ')
    w = cell.locator('.tray-table-wrap')
    t.check('react: the table sits in a named, focusable region', w.get_attribute('role') == 'region' and w.get_attribute('tabindex') == '0' and bool(t.ax(w)['name']), w.evaluate('w => w.outerHTML.slice(0, 80)'))


PARITY = [('table', 'Orders', 'table'),
          ('.tray-datatable__foot', 'Orders', '.tray-datatable__foot')]


# Static parity (trayui-react/static): the table already carries data-tray="datatable" and its parts in React; a test page
# checks its pager, which the preview reaches only behind many other controls.
STATIC = True
STATIC_PAGES = {'DataTable-paging': 1440}
STATIC_IGNORE = {'BulkActions': "the bulk button's words follow the preview's own React state, which it sets from the selection the table reports as it loads"}
