# Checkout Summary

The checkout summary is the card beside a payment form: what is being bought, line by line, a place for a promo code, the total in the largest type, and the button that pays.

## Markup
```html
<aside class="tray-card tray-summary" aria-labelledby="sum-title">
  <h2 class="subtitle" id="sum-title">Your plan</h2>
  <ul class="tray-summary__lines">
    <li class="tray-summary__line"><span>Shop plan<small>Billed yearly</small></span><span>$288.00</span></li>
    <li class="tray-summary__line"><span>Promo code AUTUMN</span><span>&minus;$28.80</span></li>
  </ul>
  <div class="tray-input-group tray-input-group--sm">
    <input class="tray-input" placeholder="Promo code" aria-label="Promo code">
    <button class="tray-input-group__btn" type="button">Apply</button>
  </div>
  <p class="tray-summary__total"><span>Total today</span><span>$259.20</span></p>
  <button class="tray-btn tray-btn--block" type="submit">Pay $259.20</button>
  <p class="tray-summary__note">… Payments are encrypted. Cancel any time.</p>
</aside>
```
Each line is a name at the start edge and an amount at the end edge; a `<small>` under the name explains it. The total sits over a hairline in `subtitle` size. The pay button repeats the amount.

## Do and don't
- Do show tax and discounts as their own lines, so the total can be checked by adding.
- Do say when the next charge comes and how much it is.
- Don't put a second yellow button on the page with the summary.
- Don't hide the promo code field behind a link if most people have a code; do hide it if few do.
