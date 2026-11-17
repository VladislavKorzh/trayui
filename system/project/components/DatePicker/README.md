# Date Picker

A date picker is a field that opens a calendar and shows the chosen date in words.

## Markup
```html
<div class="tray-anchor tray-anchor--block" data-tray="datepicker">
  <button class="tray-select-trigger" type="button" data-placeholder>
    …calendar icon… <span class="tray-select-trigger__value">Pick a day</span>
  </button>
  <div class="tray-pop tray-pop--roomy">
    <div data-tray="calendar" data-min="2026-11-15"></div>
  </div>
  <input type="hidden" name="day">
</div>
```
The trigger is the system's field; the panel is `raised` with the float shadow. A single date closes the panel as soon as it is picked. For a range, set `data-mode="range" data-months="2"` on the calendar: two months sit side by side, in the manner of travel booking pickers, and the trigger reads "18 – 24 Nov 2026".

Optional parts inside the panel:
- `tray-datepicker__presets` with buttons carrying `data-preset="7"`: the last seven days, ending today.
- `tray-pop__foot` with a `data-clear` button and a `data-apply` button; with Apply present the panel stays open until it is pressed.

The hidden input holds `YYYY-MM-DD` or `start/end`.

## Do and don't
- Do write the placeholder as an instruction: "Pick a day".
- Do offer presets when a few ranges cover most needs (reports).
- Don't open the picker on focus; open it on click, Enter or the down arrow.
- Don't use it for dates far from today; pair it with a typed field or use selects.
