# Native Select

A native select is the browser's own menu in the system's field: the right choice on phones and in long forms. Also called a select dropdown or a select box.

## Markup
```html
<label class="tray-label" for="window">Delivery window</label>
<span class="tray-select"><select id="window">…</select></span>
```
The wrapper draws the chevron; the `<select>` carries the fill, the corners and the focus ring. `tray-select--sm` is the 48px size. Group long lists with `<optgroup>`.

## Native Select or Select
Use this one by default: it is accessible everywhere and opens the platform's picker on a phone. Use Select when options need a second line, an icon or grouping that the native menu cannot show, and Combobox when the list is long enough to search.

## Accessibility
It is the browser's own `<select>`: the `<label for>` names it, the platform's own keys and picker work, and `<optgroup>` labels are read with their options. The chevron is drawn in CSS and is not read. A disabled first option such as "Choose a point" is read as unavailable and cannot be chosen. `aria-invalid="true"` is announced as invalid and draws the `danger` edge, which stays inside the focus ring when the select has focus: point `aria-describedby` at an error that says what to do, as the preview's "Pickup point" does.

## Do and don't
- Do preselect the most likely option.
- Don't use "Choose…" as a real option; make it a disabled first option.
