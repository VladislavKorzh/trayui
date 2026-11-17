# Call to Action

The call to action closes a page: one yellow card with the offer in a headline and the button that takes it.

## Markup
```html
<section class="tray-card tray-card--accent tray-cta">
  <div class="tray-cta__text">
    <h2 class="headline">Pack tomorrow's orders with Counter</h2>
    <p>Free for 14 days. Your products and customers stay yours.</p>
  </div>
  <div class="tray-cta__actions">
    <a class="tray-btn tray-btn--dark" href="/signup">Start free</a>
    <a class="tray-btn tray-btn--quiet" href="/contact">Talk to us</a>
  </div>
</section>
```
The text sits at the start edge, the buttons at the end edge on the same baseline; when there is no room the buttons drop under the text. On yellow the main button is `tray-btn--dark` and the second is quiet.

To collect an email instead, replace the buttons with an Input Group whose button is the action.

## Accessibility
It is a `<section>` opened by a heading, so the offer is in the page's list of headings. Its buttons are links when they lead to another page, and their words, not the yellow, say what happens. On the yellow card every colour keeps the light palette and the focus ring takes the card's own ink, so it shows in every theme. When the card collects an email, the field needs a name, a visible `<label>` or at least an `aria-label`, since a placeholder is not one.

## Do and don't
- Do repeat the hero's offer in other words, with the same button label.
- Do keep it the only yellow card on its screen.
- Don't add a second call to action under it. The footer comes next.
- Don't ask a question in the headline.
