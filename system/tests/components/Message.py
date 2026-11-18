"""Message: README.md. Messages are plain text read in order: name and time, the bubble, the foot; your own message carries
a name a screen reader reads ("You:" in a tray-vh span); an avatar of initials beside the name is aria-hidden, an icon
avatar is role="img" with an aria-label; every icon button in the actions has an aria-label; the delivery state is a word
beside its icon. Rows from others start at the start edge, yours at the end; the content is at most 34rem wide."""


def test_tree(t):
    pg = t.open()
    t.match_tree('name and time, then the bubble, then the foot; your own message is named; the assistant is an image', pg.locator('.tray-thread'), '''
- text: "Oksana 14:02 The courier has the box. He will call from the gate. You: Thank you. Can he leave it with the neighbour if I miss the call? Delivered"
- img "Assistant"
- text: Assistant 14:03
- paragraph: Yes. Chilled boxes keep for six hours, so a neighbour is fine today.
- paragraph: /I have added a note for the courier/
- button "Copy the answer"
- button "Good answer"
- button "Try again"
''')
    t.eq('an avatar of initials beside the name is hidden', pg.evaluate('[...document.querySelectorAll(".tray-avatar")].filter(a => !a.querySelector("svg, img")).every(a => a.getAttribute("aria-hidden") === "true")'), True)
    t.eq('every icon button in the actions has a name', pg.evaluate('[...document.querySelectorAll(".tray-message__actions button")].every(b => (b.getAttribute("aria-label") || "").length > 3)'), True)
    foot = pg.locator('.tray-message__foot')
    t.check('the delivery state is a word beside its icon', foot.inner_text().strip() == 'Delivered' and foot.locator('svg[aria-hidden="true"]').count() == 1)


def test_layout(t):
    pg = t.open()
    rows = pg.locator('.tray-message')
    thread = pg.locator('.tray-thread').bounding_box()
    theirs, mine = rows.nth(0).locator('.tray-message__content').bounding_box(), rows.nth(1).locator('.tray-message__content').bounding_box()
    t.check('a row from someone else starts at the start edge', theirs['x'] < thread['x'] + 60, (theirs, thread))
    t.check('your own row ends at the end edge', abs(mine['x'] + mine['width'] - (thread['x'] + thread['width'])) < 1, (mine, thread))
    t.check('the content is at most 34rem wide', max(pg.evaluate('[...document.querySelectorAll(".tray-message__content")].map(c => c.getBoundingClientRect().width)')) <= 544.5)
    pg.close()
    pg = t.open(rtl=True)
    thread = pg.locator('.tray-thread').bounding_box()
    mine = pg.locator('.tray-message').nth(1).locator('.tray-message__content').bounding_box()
    t.check('right to left, your own row ends at the left', abs(mine['x'] - thread['x']) < 1, (mine, thread))


PARITY = [('.tray-thread', 'Conversation', '.tray-thread')]
