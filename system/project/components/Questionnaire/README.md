# Questionnaire

A questionnaire asks a few questions one at a time, when an assistant or a flow needs answers before it can go on.

## Markup
```html
<form class="tray-card tray-questionnaire" data-tray="questionnaire">
  <div class="tray-questionnaire__head">
    <span data-progress></span>
    <div class="tray-steps" aria-hidden="true"><span></span><span></span><span></span></div>
  </div>
  <fieldset class="tray-questionnaire__step">
    <legend class="subtitle">When should it arrive?</legend>
    <div class="tray-choices">…choice cards…</div>
  </fieldset>
  …more steps…
  <div class="tray-questionnaire__foot">
    <button class="tray-btn tray-btn--ghost tray-btn--md" type="button" data-back>Back</button>
    <button class="tray-btn tray-btn--md" type="button" data-next>Next</button>
  </div>
  <div data-done hidden>…<dl class="tray-questionnaire__answers"></dl>…</div>
</form>
```
Each `tray-questionnaire__step` is one question. The behaviour shows one at a time, writes "Question 2 of 3", fills the step pills, and keeps Next disabled until the question is answered (add `data-optional` to a step that may be skipped). The last Next reads "Finish": the `data-done` block appears with the answers listed, and the form fires `tray:complete` with `detail.answers`.

## Answers
- One of several: choice cards with radios. A radio with `data-other` and a text field with `data-other-text` add "Something else".
- Several: Checkboxes.
- Free text: a Textarea, usually on an optional last step.

## Do and don't
- Do ask only what changes what happens next, and three to five questions at most.
- Do offer the likely answers as choices and keep typing for the exception.
- Do let people go back and change an answer.
- Don't ask what you could have inferred from what they already said.
- Don't hide how many questions there are.
