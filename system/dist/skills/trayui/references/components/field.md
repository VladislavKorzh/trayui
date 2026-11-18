# Field

A field is one question in a form: a label, its control, and one line of help or error beneath. Also called a form field with a label, help text and an error message.

## Markup
```html
<div class="tray-field">
  <label class="tray-label" for="email">Email</label>
  <input class="tray-input" id="email" type="email" aria-describedby="email-hint">
  <p class="tray-field__hint" id="email-hint">We send the receipt here.</p>
</div>
```
- `tray-field__error` replaces the hint when the value is wrong; set `aria-invalid="true"` on the control and point `aria-describedby` at the error.
- `tray-fields` lays fields out one per row, two per row from 40rem; `tray-field--full` spans both.
- `tray-field--row` puts the label beside the control, for settings pages.
- Group related fields in a `<fieldset>` with `<legend class="tray-legend subtitle">`. `tray-form` spaces the groups; `tray-form__foot` holds consent and the submit button above a hairline.

## You provide
The label, the control, and help only when it prevents a mistake. Error text says what to do: "Enter the street and house number", not "Invalid value".

## Accessibility
The `<label for>` names the control, and `aria-describedby` adds the hint or the error, so both are read when the field takes focus. `aria-invalid="true"` is announced as invalid and draws the `danger` edge, and the error says the same in words, so colour is never the only sign. An invalid control with focus still draws the focus ring, with the `danger` edge inside it. An error that appears is not announced by itself: moving focus to the first invalid field after a failed submit is what makes it heard. A `<fieldset>` is read with the name of its `<legend>`. Under `prefers-reduced-motion: reduce` the error appears at once instead of sliding in.

## Do and don't
- Do validate when the person leaves the field or submits, never on every key.
- Do move focus to the first invalid field after a failed submit.
- Don't show a hint and an error together.
- Don't disable the submit button to signal errors; let it explain.
