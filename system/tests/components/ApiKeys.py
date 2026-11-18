"""API Keys: README.md. The list is a Table named by its heading: the key's name is the row head, the last column has a
tray-vh head "Revoke", and each Revoke names its key; data-tray="secret": the show button swaps the masked and the real
value and is renamed "Hide the key" (or data-label-on), with no aria-pressed; the copy button copies the real value
whichever is shown, shows a check for a moment, a hidden role="status" says "Copied", and the wrapper fires tray:change
{copied: true}; a refused copy shows a warning, says "Copy failed" and reports copied: false; both buttons are 40px to the
eye and 44px to a finger; the new key opens in a Dialog that takes focus and gives it back."""

SECRET = 'tbody .tray-secret[data-tray="secret"]'


def test_tree(t):
    pg = t.open()
    t.match_tree('a table named by its heading, the key names as row heads, a hidden head over Revoke', pg.locator('.tray-table-wrap'), '''
- table "API keys":
  - rowgroup:
    - row:
      - columnheader "Name"
      - columnheader "Key"
      - columnheader "Access"
      - columnheader "Last used"
      - columnheader "Revoke"
  - rowgroup:
    - row:
      - rowheader "Storefront"
      - cell:
        - code: ck_live_••••4f2a
        - button "Show the key"
        - button "Copy the key"
        - status
      - cell "Read and write"
      - cell "2 minutes ago"
      - cell:
        - button "Revoke Storefront"
    - row:
      - rowheader "Accounting export"
      - cell "ck_live_••••c81e"
    - row:
      - rowheader "Old label printer"
''')
    show = t.ax(pg.locator(f'{SECRET} [data-secret="show"]'))
    t.eq('the show button carries no pressed state', show.get('pressed'), None)
    for sel in ('show', 'copy'):
        b = pg.locator(f'{SECRET} [data-secret="{sel}"]')
        box, hit = b.bounding_box(), t.hit(b)
        t.check(f'the {sel} button is 40px to the eye and 44px to a finger', abs(box['width'] - 40) < 0.5 and abs(box['height'] - 40) < 0.5 and min(hit) >= 44, (box, hit))


def test_show(t):
    pg = t.open()
    root, show = pg.locator(SECRET), pg.locator(f'{SECRET} [data-secret="show"]')
    show.focus()
    pg.keyboard.press('Enter')
    a = t.ax(show)
    t.eq('pressed, it shows the key and is renamed Hide the key, with no pressed state', (root.locator('code').inner_text(), a['name'], a.get('pressed')),
         ('ck_live_9f2c41d87ab04f2a', 'Hide the key', None))
    t.check('focus stays on it', t.is_focused(show))
    pg.keyboard.press('Space')
    t.eq('pressed again, it masks the key and is Show the key again', (root.locator('code').inner_text(), t.ax(show)['name']), ('ck_live_••••4f2a', 'Show the key'))
    pg.evaluate('''() => { const s = document.querySelector("tbody .tray-secret[data-tray=secret]").cloneNode(true); s.id = "own"; s.querySelector("[data-secret=show]").setAttribute("data-label-on", "Hide the Storefront key");
        document.querySelector(".tray-demo").appendChild(s); TrayUI.init(s); }''')
    pg.click('#own [data-secret="show"]')
    t.eq('data-label-on renames it', t.ax(pg.locator('#own [data-secret="show"]'))['name'], 'Hide the Storefront key')


def test_copy(t):
    pg = t.open()
    copy = pg.locator(f'{SECRET} [data-secret="copy"]')
    copy.click()
    pg.wait_for_function('() => document.querySelector("tbody .tray-secret [role=status]").textContent.startsWith("Copied")')
    t.eq('the real value is copied, though the masked one is shown', pg.evaluate('navigator.clipboard.readText()'), 'ck_live_9f2c41d87ab04f2a')
    t.eq('the button shows a check', copy.locator('use').get_attribute('href'), '#tray-i-check')
    t.eq('the wrapper fires tray:change with copied: true', [(e['target'], e['detail']) for e in t.events(pg, 'tray:change')], [('span[data-tray="secret"]', {'copied': True})])
    t.eq('the button keeps its name', t.ax(copy)['name'], 'Copy the key')
    pg.evaluate('() => { navigator.clipboard.writeText = () => Promise.reject(new Error("refused")); }')
    t.clear_events(pg)
    copy.click()
    pg.wait_for_function('() => document.querySelector("tbody .tray-secret [role=status]").textContent.startsWith("Copy failed")')
    danger = pg.evaluate('() => { const p = document.createElement("i"); p.style.color = "var(--danger)"; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; }')
    t.eq('a refused copy shows a warning in danger and says Copy failed', (copy.locator('use').get_attribute('href'), t.style(copy, 'color')), ('#tray-i-circle-alert', danger))
    t.eq('and reports copied: false', [e['detail'] for e in t.events(pg, 'tray:change')], [{'copied': False}])


def test_new_key_dialog(t):
    pg = t.open()
    opener = pg.locator('[data-target="#ak-new"]')
    opener.click()
    d = pg.locator('#ak-new')
    t.check('New key opens its dialog over the page', d.evaluate('d => d.matches(":modal")'))
    t.check('focus moves into it', d.evaluate('d => d.contains(document.activeElement)'))
    t.eq('the dialog is named by its title', t.ax(d)['name'], 'New key')
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check('Escape closes it and focus returns to New key', not d.evaluate('d => d.open') and t.is_focused(opener))


def test_parity_secret(t):
    """The React secret shows, renames, copies and reports as the HTML one does."""
    out = []
    for react in (False, True):
        pg = t.open(react=react)
        root = (t.cell(pg, 'Keys') if react else pg).locator('tbody .tray-secret').first
        show, copy = root.locator('[data-secret="show"]'), root.locator('[data-secret="copy"]')
        show.click()
        got = [root.locator('code').inner_text(), t.ax(show)['name'], t.ax(show).get('pressed')]
        copy.click()
        pg.wait_for_function('() => [...document.querySelectorAll(".tray-secret [role=status]")].some(s => s.textContent.startsWith("Copied"))')
        got += [pg.evaluate('navigator.clipboard.readText()'), [e['detail'] for e in t.events(pg, 'tray:change')]]
        out.append(got)
    t.eq('React: the same key, names, clipboard and event', out[1], out[0])


PARITY = [('.tray-table-wrap', 'Keys', '.tray-table-wrap'), ('.tray-stage dialog', 'NewKey', 'dialog')]
