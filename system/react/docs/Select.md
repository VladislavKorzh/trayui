---
category: Forms
keywords: [select, dropdown, picker, listbox, choose, option list, custom select]
---
# Select

A select picks one option from a short list that opens under its trigger.

## Use
```tsx
<Field label="Jar size">
  <Select name="jar" placeholder="Choose a jar" value={jar} onChange={setJar} options={[
    { value: '30', label: '30 g' },
    { value: '50', label: '50 g' },
    { value: '100', label: '100 g' },
  ]} />
</Field>

<Select options={[{ label: 'To your door', options: doorOptions }, { label: 'Collect it yourself', options: pickupOptions }]} />
<Select size="sm" aria-label="Rows per page" options={rowOptions} defaultValue="25" />   {/* outside a Field */}
```

## Options
An option is `{ value, label }`; `description` adds a muted second line (the field still shows the label alone), `icon` an icon before it, `disabled` dims it. Pass `{ label, options }` groups for a small heading over each group, divided by hairlines.

## Parts and behaviour
The trigger looks like an input; the list is a raised panel with the float shadow, 44px rows, the chosen one semibold with a check. Inside a Field it takes the label, the hint and the error by itself; `name` puts the value in a hidden input for a form. Enter, Space or the down arrow opens the list on the chosen option; arrows move, Home and End jump, a letter jumps to the first match, Enter chooses, Escape closes and returns focus.

## Do and don't
- Do prefer Native Select on phones and in plain forms.
- Do keep the list under about ten options; beyond that use Combobox.
- Do write the placeholder as an instruction: "Choose a jar".
- Don't put actions ("Add new…") in the list of options.
