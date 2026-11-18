# Progress

A progress bar shows how much of a known whole is done: an 8px pill in `track`, filled in `ink`. Also called a progress indicator.

## Markup
```html
<div class="tray-progress">
  <span class="tray-progress__name">Autumn batch reserved</span>
  <span class="tray-progress__value">68%</span>
  <span class="tray-progress__bar" role="progressbar" aria-label="Autumn batch reserved"
        aria-valuemin="0" aria-valuemax="100" aria-valuenow="68" style="--tray-v: 68"></span>
</div>
```
Set the fill with `--tray-v` (0 to 100) and keep `aria-valuenow` in step. The name and the value sit above the bar; a bar without a number beside it is decoration.

Variants: `tray-progress--accent` fills in yellow, for the single bar on an ink card. `tray-progress--busy` slides a segment when the length is not known yet (leave out `aria-valuenow`). `tray-steps` is a row of short pills for "step 2 of 4": mark the finished ones with `data-done`.

Use `role="meter"` instead of `progressbar` for a level that is not a task: stock left, a rating, a share.

## Accessibility
- The bar is a `role="progressbar"` for a task or a `role="meter"` for a level, named by an `aria-label` that repeats the visible name.
- `aria-valuemin`, `aria-valuemax` and `aria-valuenow` carry the amount. When the words beside the bar are not a percentage, add `aria-valuetext` with those words ("68%: 132 of 412 jars left"), as the example does.
- A busy bar has no `aria-valuenow`, so it is read as a progress bar of unknown length. Its sliding segment stops under `prefers-reduced-motion: reduce`.
- A `tray-steps` row on its own takes `role="progressbar"` and an `aria-valuetext` such as "Step 2 of 4: Delivery". Beside a written count, as in Questionnaire, it is `aria-hidden="true"`.
- The fill is ink on grey, not a hue, and with forced colours the track and the fill are drawn in the system's colours.

## Do and don't
- Do print the value in words when it is not a percentage: "132 of 412 jars left".
- Do use ink for the fill. Yellow only on an ink card.
- Don't use a data colour for a progress bar.
- Don't let the bar go backwards.
