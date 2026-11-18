"""Onboarding Checklist: README.md. A <section> named by its heading; the tasks are an <ol>; the first task without
data-done is the current one (aria-current="step") and shows its text and button, the others their title only; a done task
says ", done" in a hidden span; the bar is a progressbar with an aria-label whose aria-valuenow, -max and -valuetext ("2 of 5")
the behaviour keeps up to date; a data-task-done button finishes its task, focus moves to the next task's button, and after
the last one to the data-checklist-done line; it fires tray:change with { done, total } and tray:complete after the last."""


def bar(root):
    return root.locator('.tray-progress__bar').evaluate('b => [b.getAttribute("aria-valuenow"), b.getAttribute("aria-valuemax"), b.getAttribute("aria-valuetext"), getComputedStyle(b).getPropertyValue("--tray-v").trim()]')


def test_tree(t):
    pg = t.open()
    root = pg.locator('.tray-checklist')
    t.match_tree('a region named by its heading, a progress bar and the list of tasks', root, '''
- region "Get ready for the first order":
  - heading "Get ready for the first order" [level=2]
  - progressbar "Setup"
  - list:
    - listitem: Create the workspace , done
    - listitem: Add your products , done
    - listitem:
      - text: Choose the courier days
      - button "Choose the days"
    - listitem: Print a test label
    - listitem: Invite the people who pack
''')
    t.eq('the behaviour keeps the bar up to date', bar(root), ['2', '5', '2 of 5', '40'])
    t.eq('the first open task is the current step', pg.evaluate('[...document.querySelectorAll(".tray-task")].map(t => t.getAttribute("aria-current"))'), [None, None, 'step', None, None])
    t.eq('only the current task shows its button', pg.locator('.tray-task button:visible').count(), 1)


def drive(t, pg, root, p=''):
    t.clear_events(pg)
    root.get_by_role('button', name='Choose the days').focus()
    pg.keyboard.press('Enter')
    t.eq(p + 'the task is done and the next one is current', root.evaluate('r => [...r.querySelectorAll(".tray-task")].map(t => (t.hasAttribute("data-done") ? "d" : "") + (t.getAttribute("aria-current") === "step" ? "c" : "")).join()'), 'd,d,d,c,')
    t.eq(p + 'focus moves to the next task\'s button', t.focused(pg)['text'], 'Print a label')
    t.eq(p + 'the bar follows', bar(root)[:3], ['3', '5', '3 of 5'])
    t.eq(p + 'the count beside it too', root.locator('.tray-progress__value').inner_text().strip(), '3 of 5')
    t.eq(p + 'it fires tray:change with done and total', [e['detail'] for e in t.events(pg, 'tray:change')], [{'done': 3, 'total': 5}])
    pg.keyboard.press('Enter')
    pg.keyboard.press('Enter')
    t.eq(p + 'after the last task it fires tray:complete', [e['detail'] for e in t.events(pg, 'tray:complete')], [{'done': 5, 'total': 5}])
    done = root.locator('[data-checklist-done], .tray-checklist p:last-child').first
    t.check(p + 'the closing line appears', done.is_visible())
    t.check(p + 'and focus moves to it, so it is read', done.evaluate('e => e === document.activeElement'), t.focused(pg))


def test_finish(t):
    pg = t.open()
    drive(t, pg, pg.locator('.tray-checklist'))


def test_without_line(t):
    pg = t.open()
    pg.evaluate('document.querySelector("[data-checklist-done]").remove()')
    for _ in range(3):
        pg.locator('.tray-task[aria-current] button').click()
    t.check('with no closing line, focus moves to the section', pg.evaluate('document.activeElement === document.querySelector(".tray-checklist")'), t.focused(pg))


def test_parity_finish(t):
    pg = t.open_react()
    drive(t, pg, t.cell(pg, 'NextTask'), 'react: ')



PARITY = [('.tray-checklist', 'NextTask', '.tray-checklist')]
