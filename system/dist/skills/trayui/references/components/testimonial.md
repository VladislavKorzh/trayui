# Testimonial

A testimonial is a customer's own sentence about the product, set large, with who said it underneath. Also called a customer quote or a review.

## Markup
```html
<figure class="tray-card tray-testimonial">
  <blockquote>&ldquo;We stopped losing orders the week we started. Friday is quiet now.&rdquo;</blockquote>
  <figcaption class="tray-person">
    <span class="tray-avatar" aria-hidden="true">OF</span>
    <span class="tray-person__text"><b>Oksana Franko</b><small>Perly Farm, Kyiv region</small></span>
  </figcaption>
</figure>
```
The quote is in `subtitle` size, the person in the `tray-person` cell with an Avatar: a photograph when you have one, initials otherwise. `tray-testimonial--sm` sets the quote in body size for a row of three. One testimonial on a page may sit on an ink card.

## Accessibility
It is a `<figure>`: the `<blockquote>` holds the words, and the `<figcaption>` says who said them and names the figure. The initials are `aria-hidden`, since the name is written beside them, and a photograph in their place takes `alt=""` for the same reason. Nothing in it moves or takes focus.

## Do and don't
- Do quote a real person, with their name, their business, and their leave to be quoted.
- Do cut the quote to its one strong sentence.
- Don't write the quote yourself, and don't use a stock portrait.
- Don't put star ratings beside it unless they come from a named, public source.
