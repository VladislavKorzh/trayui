"""File Upload: README.md, Behaviour and Accessibility. The tray holds the browser's own <input type="file">, stretched over it
and named through aria-labelledby by the visible label, the line of types and sizes tied with aria-describedby; Tab reaches
it, Space or Enter opens the picker, and the whole tray draws the 3px ink focus ring; files chosen or dropped are listed in
data-list as rows with the name, the size and a remove button named after the file; a file over data-max-mb says "Too
large" in words as well as in danger; tray:change with { files }, the real File objects; while files are held over it the
edge turns solid ink (data-over); when a row is removed focus moves to the next file's remove button, or the one before, or
back to the tray once the list is empty."""

import atexit, os, shutil, tempfile

DROP = '[data-tray="dropzone"] >> nth=0'
INPUT = '[data-tray="dropzone"] >> nth=0 >> input[type="file"]'
LIST = '#fu-list'


def files(*specs):
    """The files as paths on disk, each of its size but holding nothing (sparse), so Playwright hands Chrome the path instead
    of sending the bytes: 11 MB sent took more than the 3 s a step may take on a busy CI runner. The type comes from the
    extension, as it does for a file a person picks."""
    folder = tempfile.mkdtemp(prefix='fileupload-')
    atexit.register(shutil.rmtree, folder, True)
    out = []
    for name, _type, size in specs:
        path = os.path.join(folder, name)
        with open(path, 'wb') as f:
            f.truncate(size)
        out.append(path)
    return out


def rows(pg):
    return pg.locator(f'{LIST} .tray-attachment').evaluate_all('rs => rs.map(r => r.querySelector(".tray-attachment__name").textContent + " | " + r.querySelector(".tray-attachment__meta").textContent)')


def test_tree(t):
    pg = t.open()
    a = t.ax(pg.locator(INPUT))
    t.eq('the file input is named by the visible label and described by the line of types', (a['name'], a['description']), ('Product photos', 'PNG or JPG, up to 10 MB each'))
    t.match_tree('the rows: a remove button named after its file, a named progress bar', pg.locator(LIST), '''
- button "Remove jar-50g-front.jpg"
- progressbar "Uploading jar-50g-open.jpg"
- button "Cancel the upload of jar-50g-open.jpg"
''')
    bar = t.ax(pg.locator('[role=progressbar]'))
    t.eq('the progress bar says how far, out of 100', (bar['value'], bar.get('valuemin'), bar.get('valuemax')), (64, 0, 100))
    box = pg.locator(DROP).bounding_box()
    w, h = pg.locator(INPUT).bounding_box()['width'], pg.locator(INPUT).bounding_box()['height']
    t.check('the input is stretched over the whole tray', abs(w - box['width']) < 6 and abs(h - box['height']) < 6, (w, h, box))


def test_keys(t):
    pg = t.open()
    pg.keyboard.press('Tab')
    t.check('Tab reaches the file input', t.is_focused(pg.locator(INPUT)))
    s = t.style(pg.locator(DROP), 'outline-style', 'outline-width', 'outline-offset')
    t.eq('the whole tray draws the 3px ring', s, {'outline-style': 'solid', 'outline-width': '3px', 'outline-offset': '3px'})
    # Each key on a page of its own, reached with Tab as a person would (focus given by a script opens no picker in
    # Chrome on Linux). Chrome keeps one picker at a time: a picker the test catches stays open until it is answered,
    # and one left open made the next key's picker never come, now and then, on CI. So each picker is answered (no
    # file) and its page closed before the next key; a key whose picker still does not come gets one more fresh page,
    # so only a key that never opens it fails.
    # Playwright turns on its catching of pickers when the first listener is added, and does not wait for Chrome to say it
    # is on. Enter opens the picker on keydown, so on a slow machine the key could come first and the picker open for
    # nobody; Space opens it on keyup, a round trip later, which is why only Enter failed. So the page listens first, and
    # a round trip to the page passes before the key.
    def opens(key):
        kp = t.open()
        try:
            kp.on('filechooser', lambda chooser: None)
            kp.evaluate('0')
            kp.keyboard.press('Tab')
            with kp.expect_file_chooser(timeout=5000) as fc:
                kp.keyboard.press(key)
            fc.value.set_files([])
            return True
        except Exception:
            return False
        finally:
            kp.close()
    for key in ('Space', 'Enter'):
        t.check(f'{key} opens the picker', opens(key) or opens(key))


def test_choose(t):
    pg = t.open()
    t.clear_events(pg)
    pg.set_input_files(INPUT, files(('beds.jpg', 'image/jpeg', 2048), ('huge.png', 'image/png', 11 * 1048576)))
    r = rows(pg)
    t.eq('chosen files are listed with their name and size; one too large says so', r[-2:], ['beds.jpg | 2 KB', 'huge.png | Too large. The limit is 10 MB.'])
    big = pg.locator(f'{LIST} .tray-attachment').last
    t.eq('the row of a file too large is marked as an error', big.get_attribute('data-state'), 'error')
    t.check('and its words are in danger', t.style(big.locator('.tray-attachment__meta'), 'color') != t.style(pg.locator(f'{LIST} .tray-attachment__meta').first, 'color'))
    ev = t.events(pg, 'tray:change')
    t.eq('tray:change carries the File objects', [f['file'] for f in ev[-1]['detail']['files']], ['beds.jpg', 'huge.png'])
    t.eq('each row has a remove button named after its file', pg.locator(f'{LIST} .tray-attachment').nth(2).locator('button').get_attribute('aria-label'), 'Remove beds.jpg')


def test_remove(t):
    pg = t.open()
    pg.evaluate('document.getElementById("fu-list").innerHTML = ""')
    pg.set_input_files(INPUT, files(('a.jpg', 'image/jpeg', 10), ('b.jpg', 'image/jpeg', 10), ('c.jpg', 'image/jpeg', 10)))
    btn = lambda n: pg.locator(f'{LIST} button[aria-label="Remove {n}"]')
    t.clear_events(pg)
    btn('a.jpg').focus(); pg.keyboard.press('Enter')
    t.eq('a removed row moves focus to the next file\'s remove button', t.focused(pg)['label'], 'Remove b.jpg')
    t.eq('tray:change says which file went', t.events(pg, 'tray:change')[-1]['detail'], {'removed': 'a.jpg'})
    btn('c.jpg').focus(); pg.keyboard.press('Enter')
    t.eq('the last row moves it to the one before', t.focused(pg)['label'], 'Remove b.jpg')
    pg.keyboard.press('Enter')
    t.check('the last file gone, focus is back on the tray', t.is_focused(pg.locator(INPUT)), t.focused(pg))


def test_drag(t):
    pg = t.open()
    d = pg.locator(DROP)
    d.dispatch_event('dragenter', {'dataTransfer': pg.evaluate_handle('new DataTransfer()')})
    t.eq('files held over it turn the edge solid ink', (d.get_attribute('data-over'), t.style(d, 'border-top-style')), ('', 'solid'))
    d.dispatch_event('dragleave')
    t.eq('and back when they leave', d.get_attribute('data-over'), None)
    t.clear_events(pg)
    pg.evaluate('''() => { const dt = new DataTransfer(); dt.items.add(new File(['x'], 'dropped.jpg', { type: 'image/jpeg' }));
        document.querySelector('[data-tray="dropzone"]').dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true })); }''')
    t.eq('a dropped file is listed', rows(pg)[-1], 'dropped.jpg | 1 KB')


PARITY = [('.tray-field:has(#fu-l)', 'Photos', '.tray-field'), ('.tray-card .tray-field', 'Photos', '.tray-card .tray-field')]


def test_parity_remove(t):
    h, r = t.open(), t.open_react()
    for label, pg, root in (('HTML', h, h.locator(DROP)), ('React', r, t.cell(r, 'Photos').locator('.tray-drop').first)):
        inp = root.locator('input[type="file"]')
        inp.set_input_files(files(('a.jpg', 'image/jpeg', 10), ('b.jpg', 'image/jpeg', 10)))
        lst = pg.locator(f'{LIST}') if label == 'HTML' else t.cell(r, 'Photos').locator('.tray-attachments').first
        lst.locator('button[aria-label="Remove a.jpg"]').focus(); pg.keyboard.press('Enter')
        t.eq(f'{label}: removing a file moves focus to the next one\'s remove button', t.focused(pg)['label'], 'Remove b.jpg')
        names = lst.locator('.tray-attachment__name').evaluate_all('ns => ns.map(n => n.textContent)')
        t.check(f'{label}: the chosen file is listed by its name', 'b.jpg' in names and 'a.jpg' not in names, names)


def test_parity_static_pick(t):
    # static parity for what the step cannot do, choose files: in the React preview rendered in static mode the dropzone
    # carries data-list and data-max-mb, so bundle.js lists the files chosen and marks one too large as React does
    from harness import normalise
    got = {}
    for v in ('react', 'static', 'bare'):
        pg = t.open(react=v == 'react', static=v != 'react', bare=v == 'bare')
        cell = pg.locator('[data-cell="Photos"]')
        cell.locator('.tray-drop input[type="file"]').first.set_input_files(files(('beds.jpg', 'image/jpeg', 2048), ('huge.png', 'image/png', 11 * 1048576)))
        pg.wait_for_timeout(250)
        got[v] = {'rows': cell.locator('.tray-attachments').first.locator('.tray-attachment').evaluate_all(
            'rs => rs.map(r => [r.querySelector(".tray-attachment__name").textContent, (r.querySelector(".tray-attachment__meta") || {}).textContent || "", r.getAttribute("data-state") || ""])'),
            'tree': normalise(t.tree(cell.locator('.tray-attachments').first))}
        pg.close()
    r, s = got['react'], got['static']
    t.check('static: chosen files are listed after the ones already there, as in React', len(r['rows']) == 4 and s['rows'] == r['rows'], got)
    t.eq('static: the list reads as it does in React', s['tree'], r['tree'])
    t.check('static: the file too large is marked as an error, as in React', s['rows'][-1][2] == 'error' and 'Too large' in s['rows'][-1][1], s['rows'])
    t.check('static: without bundle.js nothing is listed (bundle.js does it)', len(got['bare']['rows']) == 2, got['bare']['rows'])


# Static parity (trayui-react/static): the dropzone carries data-list and data-max-mb there, and the list is always written;
# choosing files is checked by test_parity_static_pick. The rows the page starts with are drawn by React; in static their
# buttons have no behaviour, in the HTML system's own preview as here (K3).
STATIC = True
STATIC_SKIP = {
    'Photos: button "Remove jar-50g-front.jpg"': "a row the page starts with: the dropzone behaviour wires only the rows it adds (K3)",
    'Photos: button "Cancel the upload of jar-50g-open.jpg"': "a row the page starts with (K3)",
    'UploadWithProgress': "its rows are the preview's own React state (items, and an upload it plays), which a static page's own script keeps",
}
STATIC_PROVEN_BY = 'test_parity_static_pick'
