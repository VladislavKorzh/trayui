# Switch

A switch turns one setting on or off, and the change applies at once.

## Markup
```html
<label class="tray-switch">
  <input type="checkbox" role="switch">
  <span class="tray-switch__track"></span>
  <span>Email me the receipt</span>
</label>
```
The track is a 56 by 32px pill: `control-off` when off, solid `ink` when on, with a knob in the page colour. `tray-switch--row` makes a full-width grey row with the text first and the switch at the end; use `tray-switch__text` with `<b>` and `<small>` for a title and a line of detail.

## Switch or Checkbox
A switch saves the moment it moves: notifications, dark theme, "gift box" in a live order summary. In a form that is submitted with a button, use a Checkbox.

## Accessibility
It is a real checkbox with `role="switch"`, so a screen reader announces it as on or off, and the words inside its `<label>` are its name. `Space` turns it. The input covers the whole label, so the row is the target and at least 44px tall, and focus draws the 3px ink ring round the track. On is a solid ink track with the knob at the far end, so the state shows in position as well as in fill, and with forced colours the track takes the system's colours. When the name sits outside the label, as in a settings row, point `aria-labelledby` at it.

## Do and don't
- Do name the setting, not the action: "Order updates", not "Turn on order updates".
- Don't ask for confirmation after a switch; if the change is risky it is not a switch.
- Don't use yellow for the on state.
