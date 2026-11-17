---
category: Forms
keywords: [slider, range, range input, budget, radius, volume, scale]
---
# Slider

A slider picks a number from a range by dragging, when the feel of the value matters more than its digits.

## Use
```tsx
<Slider label="Jars per month" min={1} max={12} defaultValue={4} scale />          {/* scale: the two ends */}
<Slider label="Delivery radius" min={0} max={50} step={10} defaultValue={30}
        unit=" km" scale={[0, 10, 20, 30, 40, 50]} />                               {/* every mark */}
<Slider label="Salt" value={salt} onValueChange={setSalt} unit="%" />

<Field label="Delivery radius" hint="The courier drives this far from the farm.">
  <Slider min={0} max={50} step={10} unit=" km" />                                   {/* the Field draws the label */}
</Field>
```

## Parts
A head with the label at the start and the value at the end, in bold, with its `unit`; a real range input with an 8px pill track filled in ink up to a 28px knob; and, with `scale`, the marks under the track in tick type. The value and the fill follow the knob as it moves, and follow a controlled `value` changed from code.

`onValueChange` gets the number; `onChange` still gets the native event. `ref` and the native props go to the `<input type="range">`; `className` and `style` go to the outer slider field.

## You provide
`min`, `max`, `step`, and a label. The value is always printed: a slider with no number beside it is a guess.

## Do and don't
- Do use it for coarse values: a budget, a radius, a share.
- Do print the two ends of the scale.
- Don't use it when the exact number matters (a quantity of 3); use a stepper or an input.
- Don't use a slider for more than about twenty steps without a field beside it.
