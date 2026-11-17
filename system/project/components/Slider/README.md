# Slider

A slider picks a number from a range by dragging, when the feel of the value matters more than its digits.

## Markup
```html
<div class="tray-slider-field">
  <div class="tray-slider-field__head">
    <label class="tray-label tray-label--inline" for="qty">Jars per month</label>
    <output for="qty"></output>
  </div>
  <input class="tray-slider" id="qty" type="range" min="1" max="12" value="4" data-tray="slider">
  <div class="tray-slider-field__scale"><span>1</span><span>12</span></div>
</div>
```
A real range input: an 8px pill track in `track`, filled in `ink` up to a 28px solid knob. The behaviour paints the fill and writes the value, with an optional `data-unit`, into the field's `<output>`.

## You provide
`min`, `max`, `step`, and a visible value: a slider with no number beside it is a guess.

## Accessibility
It is the browser's own `<input type="range">`, named by its `<label for>`. The arrow keys move it by one `step`, and `Home` and `End` jump to `min` and `max`. The `<output>` beside the label shows the value with its unit. With `data-unit` the behaviour also sets `aria-valuetext` to the value and its unit, so a screen reader says "30 km" and not "30". Focus draws the 3px ink ring round the knob. A `disabled` slider is left out of the `Tab` order, and with forced colours the track, the fill and the knob take the system's colours.

## Do and don't
- Do use it for coarse values: volume, a budget, a radius.
- Do print the two ends of the scale in `tick` type.
- Don't use it when the exact number matters (a quantity of 3); use the stepper.
- Don't use a slider for more than about twenty steps without a field beside it.
