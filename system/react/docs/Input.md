---
category: Forms
keywords: [input, text field, textbox]
---
# Input

An input takes one line of text: a grey fill, 16px corners, 56px tall, no stroke. The fill follows the ground: white on a grey card.

## Use
```tsx
<Field label="Email"><Input type="email" autoComplete="email" placeholder="you@example.com" /></Field>
<Field label="Postcode" error="A postcode has five digits."><Input inputMode="numeric" /></Field>
<Input size="sm" type="search" aria-label="Search orders" />   {/* 48px, for toolbars and table filters */}
<Input readOnly defaultValue="PL-20431" />
```

For an icon, a unit or a button inside the field, use InputGroup. For several lines, Textarea.

## Do and don't
- Do set the right `type`, `autoComplete` and `inputMode` so phones show the right keyboard.
- Do give it a sensible width: a five-digit code should not span the page.
- Don't use the placeholder as the label.
- Don't add borders or shadows; fill alone separates it.
