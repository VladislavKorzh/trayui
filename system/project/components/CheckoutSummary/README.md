# Checkout Summary

The checkout summary is the card beside a payment form: what is being bought, line by line, a place for a promo code, the total in the largest type, and the button that pays.

## Markup
```html
<aside class="tray-card tray-summary" aria-labelledby="sum-title">
  <h2 class="subtitle" id="sum-title">Your plan</h2>
  <ul class="tray-summary__lines" role="list">
    <li class="tray-summary__line"><span>Shop plan<small>Billed yearly</small></span><span>$288.00</span></li>
    <li class="tray-summary__line"><span>Promo code AUTUMN</span><span>&minus;$28.80</span></li>
  </ul>
  <div class="tray-field">
    <label class="tray-label" for="promo">Promo code</label>
    <div class="tray-input-group tray-input-group--sm">
      <input class="tray-input" id="promo" autocomplete="off">
      <button class="tray-input-group__btn" type="button">Apply</button>
    </div>
  </div>
  <p class="tray-summary__total"><span>Total today</span><span>$259.20</span></p>
  <button class="tray-btn tray-btn--block" type="submit">Pay $259.20</button>
  <p class="tray-summary__note">… Payments are encrypted. Cancel any time.</p>
</aside>
```
Each line is a name at the start edge and an amount at the end edge; a `<small>` under the name explains it. The total sits over a hairline in `subtitle` size. The pay button repeats the amount.

## Accessibility
It is an `<aside>` named by its heading through `aria-labelledby`, so a screen reader lists it as a landmark called "Your plan". The lines are a list with `role="list"`, since Safari stops calling a list without markers a list, and each line reads as its name, the note in `<small>`, then the amount. Write a discount with the minus sign `&minus;`, as the example does, so it is read as minus. The promo code field has a visible `<label>`, which names it for everyone and stays once a code fills the field, where a placeholder would vanish. The summary has no live region, so when a code is applied or refused, say so in a status line or a field error.

## Do and don't
- Do show tax and discounts as their own lines, so the total can be checked by adding.
- Do say when the next charge comes and how much it is.
- Don't put a second yellow button on the page with the summary.
- Don't hide the promo code field behind a link if most people have a code; do hide it if few do.
