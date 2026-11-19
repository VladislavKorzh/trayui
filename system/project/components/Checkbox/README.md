# Checkbox

A checkbox turns one option on or off; a group of them lets several be on at once.

## Markup
```html
<label class="tray-check">
  <input type="checkbox">
  <span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span>
  <span>Gift box</span>
</label>
```
Copy the box as it is: the `<svg>` holds both marks, the tick (`tray-check__tick`) and the dash (`tray-check__dash`), and the stylesheet shows the one that fits. The box is 26px with 4px corners: a `control-off` edge when empty, solid `ink` with a drawn tick when checked. Wrap two lines in `tray-check__text` with the second in `<small>`. For a parent whose children are partly checked, put `data-indeterminate` on its input, or set `input.indeterminate = true` from script; the box then shows a dash. The attribute is read once, as the page loads (and by `TrayUI.init` on markup added later), and goes with the first press.

## States
Keyboard focus draws the 3px ring around the box. `aria-invalid="true"` on the input turns the edge to 2px `danger` (a consent that was not given). A disabled checkbox dims with its text.

## Accessibility
It is the browser's own `<input type="checkbox">` inside a `<label>`: the label's text is its name, `Space` turns it on and off, and screen readers announce it as checked, not checked, or mixed while `indeterminate` is set. The input lies unseen over the whole row, so it takes the focus and every press on the row, and the drawn tick is `aria-hidden`. Tie an error to the input with `aria-describedby`, as the consent example does, so the reason is read with it and not left to the `danger` edge. Put a group of checkboxes in a `<fieldset>` whose `<legend>` asks the question. Under `prefers-reduced-motion: reduce` the tick appears at once instead of drawing itself.

## Do and don't
- Do phrase the label as the thing that becomes true: "Send me the receipt".
- Do let the whole row be the target; it is at least 44px tall.
- Don't use a checkbox for a setting that applies at once; that is Switch.
- Don't use negative labels ("Don't send me email").
