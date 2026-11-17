---
category: Marketing
keywords: [testimonial, quote, review, customer quote, social proof, endorsement, blockquote]
---
# Testimonial

A testimonial is a customer's own sentence about the product, set large, with who said it underneath.

## Use
```tsx
<div className="tray-bento">
  <Testimonial className="tray-span-7" tone="inverse"
    quote="We stopped losing orders the week we started. Friday is quiet now."   // no quotation marks: the card adds them
    name="Oksana Franko" detail="Perly Farm, Kyiv region" />
  <Testimonial className="tray-span-5" size="sm"
    quote="The packers learned it in a morning." name="Marko Bilyk" detail="Meadow Bakery"
    photo="/people/marko.jpg" />
</div>
```

## Parts
A Card holding a `blockquote` and, under it, the person: an Avatar (their photograph with `photo`, their initials otherwise, worked out from `name`), their name, and their business in muted type.

`size="sm"` sets the quote in body size, for a row of three `tray-span-4` cards. One testimonial on a page may sit on an ink card with `tone="inverse"`.

## Do and don't
- Do quote a real person, with their name, their business, and their leave to be quoted.
- Do cut the quote to its one strong sentence.
- Don't write the quote yourself, and don't use a stock portrait.
- Don't put star ratings beside it unless they come from a named, public source.
