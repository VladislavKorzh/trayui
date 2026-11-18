"""Settings Section: README.md. The <section> takes its name from its heading (aria-labelledby), so it is a region; each
row's control is named by the bold name (aria-labelledby) and described by the line under it (aria-describedby); a button
in a row holds the setting in its name ("Change the courier days"); the section that deletes says so in words; two columns
from 56rem up, one below; rows are ruled."""


def test_tree(t):
    pg = t.open()
    t.match_tree('three regions named by their headings', pg.locator('form'), '''
- region "Workspace":
  - heading "Workspace" [level=2]
- region "Orders":
  - heading "Orders" [level=2]
  - switch "Print a label for every order" [checked]
  - combobox "Hold orders placed after"
  - switch "Ask before refunding over $100"
  - button "Change the courier days"
- region "Delete the workspace":
  - heading "Delete the workspace" [level=2]
  - button "Export"
  - button "Delete the workspace"
''')
    want = {'input[aria-labelledby="st-1"]': ('Print a label for every order', 'On the printer by the packing table.'),
            'select[aria-labelledby="st-2"]': ('Hold orders placed after', 'Later orders go to the next courier day.'),
            'input[aria-labelledby="st-3"]': ('Ask before refunding over $100', 'The owner gets a notification to approve.'),
            'button[aria-label="Change the courier days"]': ('Change the courier days', 'Tuesday, Thursday and Saturday.')}
    for sel, (name, desc) in want.items():
        a = t.ax(pg.locator(sel))
        t.eq(f'{name}: named by the row, described by the line under it', (a['name'], a['description']), (name, desc))
    t.eq('the delete button says what it does in words, described by its row', (t.ax(pg.locator('.tray-btn--danger'))['name'], t.ax(pg.locator('.tray-btn--danger'))['description']),
         ('Delete the workspace', 'You will be asked to type the workspace name.'))


def test_switch(t):
    pg = t.open()
    sw = pg.locator('input[aria-labelledby="st-3"]')
    sw.focus()
    pg.keyboard.press('Space')
    t.eq('Space turns a setting on', t.ax(sw).get('checked'), 'true')


def test_layout(t):
    pg = t.open(width=1440)
    intro, body = pg.locator('.tray-settings__intro').first.bounding_box(), pg.locator('.tray-settings__body').first.bounding_box()
    t.check('from 56rem up the intro sits beside the controls', intro['x'] + intro['width'] <= body['x'] and abs(intro['y'] - body['y']) < 2, (intro, body))
    rules = pg.evaluate('[...document.querySelectorAll(".tray-settings")[1].querySelectorAll(".tray-setting")].map(r => getComputedStyle(r).borderBottomWidth)')
    t.eq('rows are ruled, all but the last', rules, ['1px', '1px', '1px', '0px'])
    pg.close()
    pg = t.open(width=390)
    intro, body = pg.locator('.tray-settings__intro').first.bounding_box(), pg.locator('.tray-settings__body').first.bounding_box()
    t.check('below, the intro comes first, over the controls', intro['y'] + intro['height'] <= body['y'] and abs(intro['x'] - body['x']) < 1, (intro, body))


PARITY = [('section >> nth=0', 'FormWithSave', 'section'), ('section >> nth=1', 'SwitchesThatSave', 'section'), ('section >> nth=2', 'DangerLast', 'section')]
