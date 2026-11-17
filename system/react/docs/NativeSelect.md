---
category: Forms
keywords: [native select, select, dropdown, picker, options, optgroup]
---
# Native Select

A native select is the browser's own menu in the system's field: the right choice on phones and in long forms.

## Use
```tsx
<Field label="Delivery window">
  <NativeSelect options={['10:00 to 14:00', '14:00 to 18:00', '18:00 to 22:00']} defaultValue="14:00 to 18:00" />
</Field>

<Field label="Pickup point" error="Choose where to collect the order.">
  {/* placeholder: a disabled first option, never a real choice; { label, options } is a group */}
  <NativeSelect placeholder="Choose a point"
    options={[{ label: 'City', options: ['Market square', 'Station'] }, { label: 'Farm', options: ['Farm shop'] }]} />
</Field>

<NativeSelect size="sm" aria-label="Rows per page" options={['10', '25', '50']} />
<NativeSelect value={size} onChange={(e) => setSize(e.target.value)}
  options={[{ value: '30', label: '30 g' }, { value: '50', label: '50 g' }]} />
```

## Options
A string is both the value and the label. `{ value, label, disabled }` sets them apart. `{ label, options }` is a group with a heading. You can also pass `<option>` elements as children. `size="sm"` is the 48px size for toolbars and table footers.

`ref`, `value`, `onChange` and the other native props go to the `<select>`; `className` and `style` go to the wrapper that draws the chevron, for width and layout.

## Native Select or Select
Use this one by default: it is accessible everywhere and opens the platform's picker on a phone. Use Select when options need a second line, an icon or grouping the native menu cannot show, and Combobox when the list is long enough to search.

## Do and don't
- Do preselect the most likely option.
- Don't use "Choose…" as a real option; pass it as `placeholder`.
