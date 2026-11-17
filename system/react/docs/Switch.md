---
category: Forms
keywords: [switch, toggle switch, on off, setting, preference, notification setting]
---
# Switch

A switch turns one setting on or off, and the change applies at once.

## Use
```tsx
<Switch label="Order updates by text" checked={texts} onCheckedChange={saveTexts} />
<Switch label="Courier tracking, not in your area yet" disabled />

<div className="tray-stack tray-stack--sm">                     {/* a list of settings */}
  <Switch layout="row" label="Gift box" description="A card box with a note, $12" defaultChecked />
  <Switch layout="row" label="Leave at the door" description="The courier sends a photo" />
</div>
```

## Layouts
`inline` (the default) puts the 56 by 32px track before its label. `row` is a full-width grey row with the title and its line of detail first and the switch at the end, for settings pages and live order summaries. Off is the `control-off` grey, on is solid ink, with a knob in the page colour.

`onCheckedChange` gets `true` or `false` the moment it moves; `onChange` still gets the native event. `ref` and the native props go to the `<input role="switch">`; `className` and `style` go to the outer label, which is the whole target.

## Switch or Checkbox
A switch saves the moment it moves: notifications, the dark theme, a gift box in a live order summary. In a form that is sent with a button, use a Checkbox.

## Do and don't
- Do name the setting, not the action: "Order updates", not "Turn on order updates".
- Don't ask for confirmation after a switch; if the change is risky it is not a switch.
- Don't use yellow for the on state.
