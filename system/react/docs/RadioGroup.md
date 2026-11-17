---
category: Forms
keywords: [radio group, radio button, radio, choice cards, option cards, single choice, delivery method, plan picker]
---
# Radio Group

A radio group picks exactly one option from a few that are all shown: plain radios for short lists, or choice cards for choices that need explaining.

## Use
```tsx
<RadioGroup label="Payment" defaultValue="delivery" options={[
  { value: 'delivery', label: 'Card, on delivery' },
  { value: 'online', label: 'Card, online now' },
  { value: 'cash', label: 'Cash, not for chilled orders', disabled: true },
]} />

<RadioGroup label="Delivery" variant="choice" layout="row" value={method} onChange={setMethod} options={[
  { value: 'courier', label: 'Courier', description: 'Chilled box, the same day', end: '$9' },
  { value: 'pickup', label: 'Pickup', description: 'Farm shop, from tomorrow', end: 'Free' },
]} />

<RadioGroup aria-label="Jar size" layout="row" options={sizes} />   {/* no legend: name it with aria-label */}
```

## Two forms
- `variant="radio"` (the default): a 22px ring and a label, for short lists inside a form. `layout="row"` sets them side by side.
- `variant="choice"`: each option is a grey card with a bold title, a line of `description` and an optional `end` value; the chosen card takes a 2px ink ring. For a delivery method, a plan, a payment type. `layout="row"` sets the cards in two columns from 40rem.

With `label` the group is a `<fieldset>` and the label its legend; without it, a `radiogroup` that needs an `aria-label`. The inputs are real radios: the arrow keys move the choice and forms submit the value under `name`.

## Do and don't
- Do preselect the safest or most common option.
- Do keep two to five options; more is a Select.
- Don't use radios for an on/off choice; that is one Checkbox or a Switch.
- Don't mix plain radios and choice cards in one group.
