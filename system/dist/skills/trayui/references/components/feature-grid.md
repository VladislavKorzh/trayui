# Feature Grid

The feature grid tells what the product does in a few cards of unequal size: each one a small icon tile, a title, and two lines. Also called a features section.

## Markup
```html
<section class="tray-bento" aria-labelledby="features-title">
  <article class="tray-card tray-feature tray-span-7">
    <span class="tray-feature__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-inbox"/></svg></span>
    <h3 class="subtitle">One list for every order</h3>
    <p>From the shop, the phone and the market stall, in the order they must leave.</p>
    <div class="tray-feature__end">…a small piece of the product…</div>
  </article>
  <article class="tray-card tray-card--inverse tray-feature tray-span-5">…</article>
  <article class="tray-card tray-feature tray-span-4">…</article>
</section>
```
It is the Bento grid with Cards: spans of 4, 5, 6, 7 and 8 columns that add up to 12 in a row, one column below 56rem. The largest card holds the feature that matters most and may show a piece of the product in `tray-feature__end`, which sits at the bottom of the card. One card may be ink for rhythm; yellow stays with the page's call to action.

## Accessibility
The grid is a `<section>` named through `aria-labelledby` by a visible heading you provide, and each card is an `<article>` titled by its `h3`. The icon tiles are `aria-hidden`. Cards are read in source order, whatever their span. What sits in `tray-feature__end` is read as it stands: make it real text, or give a picture an `alt` that says what it shows. On the ink card the text takes its on-dark colours, which hold 4.5:1.

## Do and don't
- Do give the cards different sizes: the important feature gets the room.
- Do write the title as what the person can do.
- Don't make a row of three equal cards with an icon each. That is the layout every template has.
- Don't use more than six cards. The rest belong to a features page.
