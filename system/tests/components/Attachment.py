"""Attachment: README.md. The file name is a link that covers the tray (a press anywhere on it opens the file, the button
inside stays its own target); the type and size follow in reading order; the tile is decoration; an upload is a progressbar
with a name and a value; a failed file says why in words, and danger only repeats it; the buttons name the file;
tray-attachment--image stacks a 4 to 3 thumbnail over the name."""


def test_tree(t):
    pg = t.open()
    t.match_tree('the name is a link, then the type and size, then a button that names the file', pg.locator('.tray-attachments'), '''
- link "receipt-20418.pdf"
- text: PDF, 84 KB
- button "Download receipt-20418.pdf"
- text: gate-photo.jpg Uploading, 42%
- progressbar "Uploading gate-photo.jpg"
- button "Cancel the upload of gate-photo.jpg"
- text: batch-autumn.xlsx Too large. The limit is 10 MB.
- button "Try batch-autumn.xlsx again"
- link "bed-a-night.jpg"
- text: JPEG, 1.2 MB
''')
    bar = t.ax(pg.locator('.tray-attachment .tray-progress__bar'))
    t.eq('the upload is a progressbar with its name and how far it is', (bar['role'], bar['name'], bar['value'], bar.get('valuemin'), bar.get('valuemax')),
         ('progressbar', 'Uploading gate-photo.jpg', 42, 0, 100))
    t.eq('the tile is decoration: nothing in it is in the tree', pg.evaluate('''[...document.querySelectorAll(".tray-attachment__media")].every(m =>
        [...m.querySelectorAll("svg, img")].every(i => i.getAttribute("aria-hidden") === "true" || i.getAttribute("alt") === ""))'''), True)


def test_link_covers_the_tray(t):
    pg = t.open()
    card = pg.locator('.tray-attachment').first
    # a press on the tile, on the meta line and on the empty space at the end of the name all land on the link
    spots = pg.evaluate('''() => { const a = document.querySelector('.tray-attachment'); const out = [];
        for (const sel of ['.tray-attachment__media', '.tray-attachment__meta']) { const r = a.querySelector(sel).getBoundingClientRect();
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); out.push(hit && hit.closest('a') ? 'link' : (hit ? hit.className : 'none')); }
        const b = a.querySelector('.tray-btn').getBoundingClientRect(); const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        out.push(hit && hit.closest('.tray-btn') ? 'button' : 'other'); return out; }''')
    t.eq('the tile and the meta line open the file; the button is its own target', spots, ['link', 'link', 'button'])
    box = card.bounding_box()
    t.check('the attachment is a tray: a fill with round corners', t.style(card, 'background-color') not in ('rgba(0, 0, 0, 0)', 'transparent') and t.style(card, 'border-radius') != '0px')
    t.check('it is at most 20rem wide', box['width'] <= 320.5, box)


def test_failed(t):
    pg = t.open()
    bad = pg.locator('.tray-attachment[data-state="error"]')
    meta = bad.locator('.tray-attachment__meta')
    danger = pg.evaluate('() => { const p = document.createElement("i"); p.style.color = "var(--danger)"; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; }')
    t.eq('a failed file says why in danger', t.style(meta, 'color'), danger)
    t.check('and in words', 'Too large' in meta.inner_text(), meta.inner_text())


def test_image(t):
    pg = t.open()
    media = pg.locator('.tray-attachment--image .tray-attachment__media')
    b = media.bounding_box()
    t.check('the image variant has a 4 to 3 thumbnail', abs(b['width'] / b['height'] - 4 / 3) < 0.02, b)
    name = pg.locator('.tray-attachment--image .tray-attachment__name').bounding_box()
    t.check('stacked over the name', name['y'] >= b['y'] + b['height'] - 1, (b, name))


PARITY = [('.tray-attachments', 'States', '.tray-attachments')]
