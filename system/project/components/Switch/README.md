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

## Do and don't
- Do name the setting, not the action: "Order updates", not "Turn on order updates".
- Don't ask for confirmation after a switch; if the change is risky it is not a switch.
- Don't use yellow for the on state.
