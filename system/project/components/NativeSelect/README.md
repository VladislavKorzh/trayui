# Native Select

A native select is the browser's own menu in the system's field: the right choice on phones and in long forms.

## Markup
```html
<label class="tray-label" for="window">Delivery window</label>
<span class="tray-select"><select id="window">…</select></span>
```
The wrapper draws the chevron; the `<select>` carries the fill, the corners and the focus ring. `tray-select--sm` is the 48px size. Group long lists with `<optgroup>`.

## Native Select or Select
Use this one by default: it is accessible everywhere and opens the platform's picker on a phone. Use Select when options need a second line, an icon or grouping that the native menu cannot show, and Combobox when the list is long enough to search.

## Do and don't
- Do preselect the most likely option.
- Don't use "Choose…" as a real option; make it a disabled first option.
