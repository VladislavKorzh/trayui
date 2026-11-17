# Button Group

A button group is a tray that holds related buttons 4px apart, so they read as one control.

## Use
- Several actions on the same object: reply, forward, archive.
- A quantity stepper: minus, the value, plus.
- A main action with a second button that opens more choices.

For a choice between options (one stays selected) use Toggle Group instead.

## Markup
`<div class="tray-btn-group" role="group" aria-label="…">` holds `<button class="tray-btn-group__item">`. Add `tray-btn-group__item--icon` for an icon-only button (give it an `aria-label`), `tray-btn-group--sm` for 44px items, `tray-btn-group--vertical` to stack, and `<span class="tray-btn-group__rule">` for a hairline between two clusters.

The stepper is the same tray with `data-tray="stepper"`, two buttons carrying `data-step="-1"` and `data-step="1"`, and an `<output class="tray-btn-group__value">`. Set `data-min` and `data-max`; it fires `tray:change` with `detail.value`.

## Do and don't
- Do keep the tray: buttons are never fused edge to edge, nothing in the system has a hard corner.
- Don't mix sizes inside one group.
- Don't put the primary yellow button in a group; set it beside the group.

## Accessibility
The group needs `role="group"` and a label. The stepper's `<output>` is announced when the value changes; its buttons need `aria-label`s ("One fewer", "One more").
