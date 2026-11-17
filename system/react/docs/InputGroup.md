---
category: Forms
keywords: [input group, input addon, prefix, suffix, unit, search field, password field, show password, input button]
---
# Input Group

An input group is one field that also holds an icon, a unit, a prefix or one small button.

## Use
```tsx
<InputGroup icon="search" type="search" placeholder="Search orders" aria-label="Search orders" suffix={<Kbd>/</Kbd>} />
<InputGroup inputMode="decimal" defaultValue="2.5" aria-label="Weight" suffix="kg" />
<InputGroup prefix="https://" defaultValue="perly.example/notes" aria-label="Page address"
            action={{ label: 'Copy the address', icon: 'copy', onClick: copy }} />  {/* icon only: label is its aria-label */}

<Field label="Promo code" error="AUTUMN ended on 31 October.">
  <InputGroup action={{ label: 'Apply', accent: true, onClick: apply }} />    {/* the yellow action of the field */}
</Field>

<Field label="Password"><InputGroup icon="lock" reveal autoComplete="current-password" /></Field>
<InputGroup size="sm" icon="filter" placeholder="Filter" aria-label="Filter" />
```

## Parts
- `icon` and `prefix` sit at the start, `suffix` at the end, in muted type: they are never part of the value.
- `action` is one small button at the end, 44px with 12px corners, in the colour of the ground behind the group; `accent` makes it yellow.
- `reveal` turns the field into a password with a button that shows and hides it; it takes the place of `action`.

The group carries the fill, the corners and the focus ring; the input inside is transparent. `ref` and the native input props go to the `<input>`; `className` and `style` go to the group. Inside a Field it picks up the label, the hint and the error by itself.

## Do and don't
- Do give the input its own label or `aria-label`; an icon is not a label.
- Don't put more than one button in a group.
- Don't use it to join two separate fields.
