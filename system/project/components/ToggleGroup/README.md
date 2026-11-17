# Toggle Group

A toggle group is the segmented control: a tray of segments where the selected one is solid ink.

## Use
A choice among two to five short options that are all worth seeing at once: jar size, list or grid view, a time range. More options, or long labels, belong in a Select or a Radio Group.

## Markup
```html
<div class="tray-seg" role="radiogroup" aria-label="Jar size">
  <label class="tray-seg__item"><input type="radio" name="jar" checked><span>30 g</span></label>
  <label class="tray-seg__item"><input type="radio" name="jar"><span>50 g</span></label>
</div>
```
The inputs are real radios, so the arrow keys and form submission work without script. With the script the ink pill of the chosen segment slides to the next one chosen; after setting a radio from script, dispatch a `change` event on the `.tray-seg` so the pill follows. Use `type="checkbox"` inputs (and `role="group"`) when several segments may be on at once.

Modifiers: `tray-seg--fill` (equal columns across the full width), `tray-seg--sm` (44px segments, `nav` type), `tray-seg--icon` (square, icon-only segments; each input needs an `aria-label`).

## Do and don't
- Do keep every label to one or two words.
- Do put a second line (a price, a count) inside the segment in weight 400 when it helps the choice.
- Don't use it for navigation between pages; that is Tabs.
- Don't leave a single-choice group with nothing selected.
