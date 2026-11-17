---
category: Actions
keywords: [button group, buttons, toolbar, split button, stepper, quantity, counter, plus minus]
---
# Button Group

A button group is a tray that holds related buttons 4px apart, so they read as one control.

## Use
```tsx
<ButtonGroup label="Message actions" items={[
  { label: 'Reply', icon: 'arrow-left', onClick: reply },
  { label: 'Forward' },
  { label: 'Archive' },
]} />

<ButtonGroup label="File actions" size="sm" items={[
  { label: 'Copy', icon: 'copy', iconOnly: true },              /* icon only: the label is read aloud */
  { label: 'Delete', icon: 'trash-2', iconOnly: true, separated: true }, /* a hairline before it */
]} />

<ButtonGroup label="Quantity" stepper defaultValue={2} min={1} max={9} onChange={setJars} />
```

## When to use it
- Several actions on the same object: reply, forward, archive.
- A quantity stepper: minus, the value, plus.
- A main action with a second button that opens more choices ("Save draft" and a chevron).

For a choice between options where one stays selected, use a toggle group instead.

## Forms
- `size="sm"` makes the buttons 44px, for toolbars and dense rows. `orientation="vertical"` stacks them.
- `separated` on an item draws a hairline before it, to split the group into two clusters.
- `stepper` turns the group into minus, the value and plus. It counts between `min` and `max`, disables minus and plus at the ends, and calls `onChange` with the new value. The value is announced when it changes. Give it `decrementLabel` and `incrementLabel` when "One fewer" and "One more" do not fit.

## Do and don't
- Do keep the tray: buttons are never fused edge to edge, nothing in the system has a hard corner.
- Don't mix sizes inside one group.
- Don't put the primary yellow button in a group; set it beside the group.
