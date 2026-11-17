---
category: Forms
keywords: [checkbox, check box, tick, consent, agree, select all, indeterminate, multiple choice]
---
# Checkbox

A checkbox turns one option on or off; a group of them lets several be on at once.

## Use
```tsx
<Checkbox label="Gift box" name="gift" />
<Checkbox label="Chilled delivery" defaultChecked />
<Checkbox label="Remind me before the season ends" description="One email in November, nothing else." />
<Checkbox label="I agree to the terms of the order" error="Agree to the terms to place the order." />
<Checkbox label="All extras" checked={all} indeterminate={some && !all} onCheckedChange={toggleAll} />

<fieldset>                                          {/* a group of checkboxes */}
  <legend className="tray-label">Extras</legend>
  <div className="tray-stack" style={{ gap: 0 }}>…</div>
</fieldset>
```

## States
The box is 26px with 4px corners: an edge when empty, solid ink with a drawn tick when checked, a dash when `indeterminate`. `error` turns the edge to a 2px danger line and puts the message under the label in place of the `description`. Keyboard focus draws a 3px ring around the box; a disabled checkbox dims with its text.

`onCheckedChange` gets `true` or `false`; `onChange` still gets the native event. `ref` and the native props go to the `<input>`; `className` and `style` go to the outer label, so the whole row, at least 44px tall, is the target.

## Do and don't
- Do phrase the label as the thing that becomes true: "Send me the receipt".
- Don't use a checkbox for a setting that applies at once; that is Switch.
- Don't use negative labels ("Don't send me email").
