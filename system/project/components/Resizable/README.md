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
`data-size` is the first pane's share in percent; `data-min` and `data-max` limit it. `tray-split--v` stacks the panes and drags up and down. The handle is a 16px strip in the colour of the ground with a short pill in `rule-strong` that turns `ink` on hover and focus. It fires `tray:change` with `detail.size` each time the size changes; the size it starts at fires nothing.

## Accessibility
The handle is a focusable separator: the behaviour gives it `role="separator"`, `aria-orientation`, `aria-valuemin` and `aria-valuemax` from the limits, and an `aria-valuenow` that follows the size. `ArrowLeft` and `ArrowRight` (`ArrowUp` and `ArrowDown` in `tray-split--v`) move it by two percent, in the direction of the arrow, so under `dir="rtl"`, where the first pane is on the right, `ArrowLeft` widens it. `Home` and `End` jump to the limits. Focus draws the ring inside the handle and turns its pill `ink`. Name the handle after what it resizes with an `aria-label`. Without one it is called "Resize the panes".

With a pointer alone, dragging is the only way to resize (WCAG 2.5.7 asks for one without dragging): the keys need a keyboard. Where the size matters to the task, offer it another way too, such as buttons or a menu that set the split to fixed sizes.

## Do and don't
- Do set limits so neither pane can be dragged to nothing.
- Do remember the size the person chose.
- Don't use it on a phone; stack the panes there.
- Don't nest more than two levels of splits.
