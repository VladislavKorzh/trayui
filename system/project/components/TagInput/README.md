# Tag Input

A tag input takes several short values in one field: each becomes a chip that can be removed, and the caret waits after the last one.

## Markup
```html
<div class="tray-field">
  <label class="tray-label" for="tags">Tags</label>
  <div class="tray-tags" data-tray="taginput">
    <span class="tray-chip" data-value="gift">gift<button type="button" class="tray-chip__x" aria-label="Remove gift">…</button></span>
    <input id="tags" placeholder="Add a tag">
    <input type="hidden" name="tags">
  </div>
  <p class="tray-field__hint">Press Enter or a comma after each one.</p>
</div>
```
## Behaviour
`data-tray="taginput"`: Enter or a comma turns what was typed into a chip; so does leaving the field. Backspace in the empty field removes the last chip; each chip's button removes that one. A pasted list is split on commas, semicolons and spaces. Repeats are ignored. The hidden input holds the values joined by commas, for the form.

| Attribute | Use |
| --- | --- |
| `data-pattern="email"` | A value that is not an email address becomes a `danger` chip, and the text field takes `aria-invalid`. |
| `data-invalid-text` | What a wrong chip says to a screen reader after its value. Default "not an email address" with `data-pattern="email"`, else "not valid". |
| `data-max="5"` | No more than five values are taken: past the limit, what was typed stays in the field and the limit is said. |

It fires `tray:change` with `{ values, valid }`. Additions and removals are announced to screen readers.

## Accessibility
The text field is named by the `<label>`, and the hint or the error joins it through `aria-describedby`. `Enter` or a comma adds what was typed, and `Backspace` in the empty field removes the last chip. Each chip's button is named "Remove" and the value, is 28px to the eye and 44px to a finger, and after a press focus goes back to the field. A polite live region, hidden from view, says "gift added" or "gift removed" after each change, "gift is already in the list" for a repeat, and "Kharkiv not added: the limit is 4" at `data-max`, where the typed text stays in the field. A wrong value keeps its chip with a `danger` edge, and a hidden ", not an email address" after its value says so to a screen reader; the behaviour sets `aria-invalid="true"` on the text field (not on the tray), also for wrong chips already in the markup, takes it away once no wrong chip is left, and leaves alone an `aria-invalid` you put on the field yourself, such as a server's error. The tray then draws a `danger` edge inside itself, so its focus ring still shows. Say what is wrong in words too, in a `tray-field__error`.

## Do and don't
- Do say under the field how a value is added.
- Do keep wrong values as chips so they can be seen and removed.
- Don't use it to choose from a known list: that is a Combobox or checkboxes.
- Don't use it for long text. A chip holds a word or an address.
