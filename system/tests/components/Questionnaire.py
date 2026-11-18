"""Questionnaire: README.md. A <form> whose questions are fieldsets named by their legends; one question shown at a time,
the others hidden; "Question 2 of 3" is plain text (no live region) and the step pills are aria-hidden; Next is disabled
until a required question is answered, and pressing it moves focus to the next question's chosen answer or first field;
no button takes focus with it as it turns off or goes (Back on the first question hands focus to the question, Finish to
the data-done block, which takes tabindex="-1", "Change the answers" to the first question); the last Next reads Finish;
the form fires tray:complete with detail.answers; "Something else" opens its text field and its text is the answer."""


def drive(t, pg, root):
    """Answer the three questions with the keyboard, finish, then change the answers. Returns what was seen at each step."""
    seen = []
    nxt, back = root.locator('[data-next]'), root.locator('[data-back]')
    progress = lambda: root.locator('[data-progress]').inner_text().strip()
    f = lambda: (lambda a: f"{a['role']} {a['name']}")(t.ax(pg.locator(':focus')))  # what a screen reader says of the focused control
    seen.append(('start', progress(), back.is_disabled(), nxt.is_disabled()))
    nxt.focus()
    pg.keyboard.press('Enter')
    seen.append(('next', progress(), f(), nxt.is_disabled()))
    pg.keyboard.press('Space')  # the first box of the second question
    seen.append(('answered', nxt.is_disabled()))
    nxt.focus()
    pg.keyboard.press('Enter')
    seen.append(('last', progress(), f(), nxt.inner_text().strip()))
    pg.keyboard.type('Ring twice')
    nxt.focus()
    pg.keyboard.press('Enter')
    done = root.locator('[data-done]:not(.tray-steps *)')
    seen.append(('finish', done.is_visible(), t.focused(pg)['body'], done.evaluate('d => d === document.activeElement || d.contains(document.activeElement)'),
                 done.get_attribute('tabindex'), nxt.is_visible(), done.locator('dl').inner_text().replace('\n', ' | ')))
    root.locator('[data-restart]').focus()
    pg.keyboard.press('Enter')
    seen.append(('restart', progress(), f()))
    nxt.focus()
    pg.keyboard.press('Enter')
    back.focus()
    pg.keyboard.press('Enter')
    seen.append(('back to the first', progress(), f(), back.is_disabled()))
    return seen


def test_tree(t):
    pg = t.open()
    form = pg.locator('form.tray-questionnaire')
    t.match_tree('the first question is a group named by its legend; Back is off, Next on', form, '''
- text: Question 1 of 3
- group "When should it arrive?":
  - radio "Today Between 14:00 and 18:00" [checked]
  - radio "Tomorrow morning Between 10:00 and 14:00"
  - radio "Another day Tell us which"
- button "Back" [disabled]
- button "Next"
''')
    t.eq('the questions not shown are hidden', pg.evaluate('[...document.querySelectorAll(".tray-questionnaire__step")].map(s => s.hidden)'), [False, True, True])
    t.eq('the progress is plain text, not a live region', (pg.get_attribute('[data-progress]', 'aria-live'), pg.get_attribute('[data-progress]', 'role')), (None, None))
    t.eq('the step pills are hidden from screen readers', pg.get_attribute('.tray-steps', 'aria-hidden'), 'true')
    t.eq('the first pill is filled', pg.evaluate('[...document.querySelectorAll(".tray-steps span")].map(p => p.hasAttribute("data-done"))'), [True, False, False])


def test_flow(t):
    pg = t.open()
    seen = drive(t, pg, pg)
    t.eq('at the start: Question 1 of 3, Back off, Next on', seen[0], ('start', 'Question 1 of 3', True, False))
    t.eq('Next shows the second question, focus on its first box, Next off until it is answered', seen[1], ('next', 'Question 2 of 3', 'checkbox A gift box', True))
    t.eq('an answer turns Next on', seen[2], ('answered', False))
    t.eq('the last question: focus in its field, Next reads Finish', seen[3], ('last', 'Question 3 of 3', 'textbox Note for the courier', 'Finish'))
    t.eq('Finish shows the answers and hands focus to them', seen[4],
         ('finish', True, False, True, '-1', False, 'When should it arrive? | Today, 14:00 to 18:00 | What should go in the box? | A gift box | Anything the courier should know? | Ring twice'))
    t.eq('Change the answers returns to the first question, focus on its chosen answer', seen[5], ('restart', 'Question 1 of 3', 'radio Today Between 14:00 and 18:00'))
    t.eq('Back on the second question returns to the first and hands focus to it as Back turns off', seen[6], ('back to the first', 'Question 1 of 3', 'radio Today Between 14:00 and 18:00', True))
    done = t.events(pg, 'tray:complete')
    t.eq('Finish fires tray:complete with the answers', [e['detail'] for e in done], [{'answers': [
        {'question': 'When should it arrive?', 'answer': ['Today, 14:00 to 18:00']},
        {'question': 'What should go in the box?', 'answer': ['A gift box']},
        {'question': 'Anything the courier should know?', 'answer': ['Ring twice']}]}])
    t.eq('on the form', done[0]['target'] if done else None, 'form[data-tray="questionnaire"]')


def test_other_and_required(t):
    pg = t.open()
    other = pg.locator('input[data-other]')
    text = pg.locator('[data-other-text]')
    t.check('the text of "Something else" waits hidden', text.is_hidden())
    other.focus()
    pg.keyboard.press('Space')
    t.check('choosing it opens its text field', text.is_visible())
    t.eq('which is named', t.ax(text)['name'], 'Which day')
    text.fill('Friday after six')
    pg.click('[data-next]')
    box = pg.locator('input[name="q2"]').first
    box.check()
    box.uncheck()
    t.check('with every box cleared again, Next turns off', pg.is_disabled('[data-next]'))
    t.check('and focus stays on the box', not t.lost_focus(pg))
    box.check()
    pg.click('[data-next]')
    pg.click('[data-next]')
    t.eq('the typed day is the answer', t.events(pg, 'tray:complete')[-1]['detail']['answers'][0]['answer'], ['Friday after six'])
    t.eq('an optional question left empty says Skipped', pg.locator('.tray-questionnaire__answers dd').last.inner_text(), 'Skipped')


def test_parity_flow(t):
    """The React Questionnaire, driven by the same keys, shows, says and focuses what the HTML one does."""
    html = t.open()
    a = drive(t, html, html.locator('form.tray-questionnaire'))
    pg = t.open_react()
    b = drive(t, pg, t.cell(pg, 'Delivery'))
    for x, y in zip(a, b):
        t.eq(f'React, {x[0]}', y, x)


PARITY = [('form.tray-questionnaire', 'Delivery', 'form')]


def test_pills_marked_before_start(t):
    """The pills and the block of answers both carry data-done: markup drawn with its pills already filled (a page that
    renders them, a framework) must still find the block of answers, not a pill."""
    pg = t.open()
    pg.evaluate('''() => { const f = document.querySelector("form.tray-questionnaire").cloneNode(true); f.id = "again";
        f.querySelectorAll(".tray-steps span").forEach(p => p.setAttribute("data-done", "")); document.querySelector(".tray-demo").appendChild(f); TrayUI.init(f); }''')
    f = pg.locator('#again')
    f.locator('[data-next]').click()
    f.locator('input[name="q2"]').first.check()
    f.locator('[data-next]').click()
    f.locator('[data-next]').click()
    t.check('Finish still shows the answers', f.locator('[data-done]:not(.tray-steps *)').is_visible())
    t.eq('and the pills stay pills', f.locator('.tray-steps span').evaluate_all('ps => ps.map(p => p.hidden)'), [False, False, False])
