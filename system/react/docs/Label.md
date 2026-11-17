---
category: Forms
keywords: [label, form label]
---
# Label

A label names a control in plain words, above it, in `label` type. A Field draws its own label; use Label for a control outside a Field.

## Use
```tsx
<Label htmlFor="address">Delivery address</Label>
<Input id="address" />

<Label htmlFor="note" optional>Gift note</Label>   {/* writes "(optional)" */}
<Label htmlFor="jars" inline>Jars</Label>          {/* beside its control, no space under it */}
```

## Do and don't
- Do write two or three words in sentence case, with no colon: "Phone", not "Enter your phone number:".
- Do mark optional fields; unmarked fields read as required, so no asterisks are needed.
- Don't set labels in capitals or with letter spacing.
