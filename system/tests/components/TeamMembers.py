"""Team Members: README.md. A Table named by the heading above it; the person's cell is the row head, its avatar
aria-hidden beside the name; every control in a row names the person ("Role of Bohdan Savchuk", "Remove Bohdan Savchuk",
"Send again to Andriy Tkachuk", its last words a tray-vh span); the head over the remove buttons holds "Remove" in a
tray-vh span; a status is a word in a badge; the signed-in person is marked "(you)" and the owner's role is text."""


def test_tree(t):
    pg = t.open()
    t.match_tree('a table named Team, the people as row heads, every control naming its person', pg.locator('.tray-table-wrap'), '''
- table "Team":
  - rowgroup:
    - row:
      - columnheader "Person"
      - columnheader "Role"
      - columnheader "Status"
      - columnheader "Last seen"
      - columnheader "Remove"
  - rowgroup:
    - row:
      - rowheader "Oksana Franko (you) oksana@perly.example"
      - cell "Owner"
      - cell "Active"
    - row:
      - rowheader "Bohdan Savchuk bohdan@perly.example"
      - cell:
        - combobox "Role of Bohdan Savchuk"
      - cell "Active"
      - cell "Today, 08:30"
      - cell:
        - button "Remove Bohdan Savchuk"
    - row:
      - rowheader "Daryna Koval daryna@perly.example"
    - row:
      - rowheader "Andriy Tkachuk andriy@perly.example"
      - cell:
        - combobox "Role of Andriy Tkachuk"
      - cell "Invited"
      - cell:
        - button "Send again to Andriy Tkachuk"
      - cell:
        - button "Remove Andriy Tkachuk"
''')
    t.eq('every avatar is hidden: the name is beside it', pg.evaluate('[...document.querySelectorAll(".tray-person .tray-avatar")].every(a => a.getAttribute("aria-hidden") === "true")'), True)
    t.eq('the remove column is named by a hidden word', pg.locator('thead th').last.locator('.tray-vh').inner_text(), 'Remove')
    t.eq('the owner\'s role is text, not a control', pg.locator('tbody tr').first.locator('select, button').count(), 0)
    t.eq('the statuses are words in badges', pg.locator('tbody .tray-badge').all_inner_texts(), ['Active', 'Active', 'Active', 'Invited'])


def test_keys(t):
    pg = t.open()
    sel = pg.locator('select[aria-label="Role of Bohdan Savchuk"]')
    sel.focus()  # the role is the browser's own select: how its keys work is the platform's (on a Mac, ArrowDown opens it)
    seq = [f['label'] or f['text'] for f in t.tab_through(pg, 2)]
    t.eq('Tab goes along the row: the role, then Remove, then the next role', seq, ['Remove Bohdan Savchuk', 'Role of Daryna Koval'])


PARITY = [('.tray-table-wrap', 'Team', '.tray-table-wrap')]
