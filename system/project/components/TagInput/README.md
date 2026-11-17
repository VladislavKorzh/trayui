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
| `data-pattern="email"` | A value that is not an email address becomes a `danger` chip and the field takes `aria-invalid`. |
| `data-max="5"` | No more than five values are taken. |

It fires `tray:change` with `{ values, valid }`. Additions and removals are announced to screen readers.

## Do and don't
- Do say under the field how a value is added.
- Do keep wrong values as chips so they can be seen and removed.
- Don't use it to choose from a known list: that is a Combobox or checkboxes.
- Don't use it for long text. A chip holds a word or an address.
