# Resizable

Resizable splits a box into two panes with a handle between them that can be dragged.

## Markup
```html
<div class="tray-split" data-tray="split" data-size="35" data-min="20" data-max="60">
  <div class="tray-split__pane">…</div>
  <button class="tray-split__handle" type="button" aria-label="Resize the list"></button>
  <div class="tray-split__pane">…</div>
</div>
```
`data-size` is the first pane's share in percent; `data-min` and `data-max` limit it. `tray-split--v` stacks the panes and drags up and down. The handle is a 12px strip in the colour of the ground with a short pill in `rule-strong` that turns `ink` on hover and focus. It fires `tray:change` with `detail.size`.

## Keyboard
The handle is a focusable separator: the arrow keys move it by two percent, Home and End jump to the limits. Its `aria-valuenow` follows the size.

## Do and don't
- Do set limits so neither pane can be dragged to nothing.
- Do remember the size the person chose.
- Don't use it on a phone; stack the panes there.
- Don't nest more than two levels of splits.
