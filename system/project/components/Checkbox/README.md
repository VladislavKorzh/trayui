# Checkbox

A checkbox turns one option on or off; a group of them lets several be on at once.

## Markup
```html
<label class="tray-check">
  <input type="checkbox">
  <span class="tray-check__box">…the drawn tick…</span>
  <span>Gift box</span>
</label>
```
The box is 26px with 4px corners: a `control-off` edge when empty, solid `ink` with a drawn tick when checked. Wrap two lines in `tray-check__text` with the second in `<small>`. Set `input.indeterminate = true` from script for a parent whose children are partly checked; the box then shows a dash.

## States
Keyboard focus draws the 3px ring around the box. `aria-invalid="true"` on the input turns the edge to 2px `danger` (a consent that was not given). A disabled checkbox dims with its text.

## Do and don't
- Do phrase the label as the thing that becomes true: "Send me the receipt".
- Do let the whole row be the target; it is at least 44px tall.
- Don't use a checkbox for a setting that applies at once; that is Switch.
- Don't use negative labels ("Don't send me email").
