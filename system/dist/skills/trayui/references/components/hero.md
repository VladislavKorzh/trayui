# Hero

The hero is the first screen of a product's public page: what it is in one headline, one sentence, one yellow button, and something real to look at beside them. Also called a hero banner or the header of a landing page.

## Markup
```html
<section class="tray-hero">
  <div class="tray-card tray-hero__text">
    <div class="tray-hero__copy">
      <h1 class="headline">Every order, packed on time</h1>
      <p>Counter is the order desk for small farms: orders in, labels out, the courier told.</p>
    </div>
    <div class="tray-stack tray-stack--sm">
      <div class="tray-hero__actions">
        <a class="tray-btn" href="/signup">Start free</a>
        <a class="tray-btn tray-btn--quiet" href="/tour">See how it works</a>
      </div>
      <p class="tray-hero__note">Free for 14 days. No card needed.</p>
    </div>
  </div>
  <div class="tray-card tray-card--accent tray-hero__media">…a figure, a screenshot, a photograph…</div>
</section>
```
Two cards on the 12-column grid: the text takes seven columns, the media five; below 56rem they stack. The text card pushes its headline to the top and its buttons to the bottom. The media card is the yellow one on this screen: a real number in `figure`, a screenshot of the product, or a photograph that fills it (`tray-card--flush` and an image).

Use `display` for a headline of four words or fewer, `headline` for a longer one.

## Accessibility
The headline is the page's one `<h1>`. The two buttons are links (`<a class="tray-btn">`) and are announced as links. The `<section>` has no name, so it is not listed as a region. What fills the media card needs words of its own: `alt` on a screenshot or a photograph, and `role="img"` with an `aria-label` on a drawn figure such as the row of `tray-steps` ("26 of 38 orders packed"). The yellow card keeps the light palette in every theme, so its text and focus ring stay dark on yellow.

## Do and don't
- Do keep the headline under eight words and the sentence under twenty.
- Do show the product or its result. A real screen beats an illustration.
- Don't add a third button, a badge row or a list of features to the hero. They have their own sections.
- Don't put a number in the media card that you cannot back.
