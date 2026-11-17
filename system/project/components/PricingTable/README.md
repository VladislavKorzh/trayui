# Pricing Table

The pricing table sets the plans side by side: a card each with the name, the price as the largest thing on it, who it is for, one button, and what is included. One plan is yellow.

## Markup
```html
<div data-tray="pricing">
  <div class="tray-plans__bar">
    <div class="tray-seg" role="radiogroup" aria-label="Billing period">
      <label class="tray-seg__item"><input type="radio" name="period" value="monthly" checked><span>Monthly</span></label>
      <label class="tray-seg__item"><input type="radio" name="period" value="yearly"><span>Yearly</span></label>
    </div>
    <span class="tray-badge">Two months free on yearly</span>
  </div>
  <div class="tray-plans">
    <article class="tray-card tray-card--accent tray-plan">
      <div class="tray-plan__head">
        <h3 class="tray-plan__name">Shop <span class="tray-badge tray-badge--ink">Most chosen</span></h3>
        <p class="tray-plan__price"><span data-monthly="$29" data-yearly="$24">$29</span><small>a month</small></p>
        <p class="tray-plan__text">For a farm that ships every day.</p>
      </div>
      <a class="tray-btn tray-btn--dark tray-btn--md" href="/signup?plan=shop">Start with Shop</a>
      <ul class="tray-ticks">
        <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>1,000 orders a month</li>
      </ul>
    </article>
  </div>
</div>
```
## Behaviour
`data-tray="pricing"` on the wrapper: when the radios named `period` change, every element inside with `data-monthly` and `data-yearly` takes the text of the chosen period. It fires `tray:change` with `{ period }`. Render the monthly text in the markup so the prices are there without scripting.

The yellow plan is the one you recommend; its button is `tray-btn--dark`, the others are `tray-btn--quiet`. `tray-ticks` is the list of what is included: a check per line, and `data-off` on a line the plan lacks.

## Do and don't
- Do keep to two, three or four plans, cheapest first.
- Do say what the price is per: "a month", "a month, billed yearly".
- Don't make every plan yellow, and don't make the dearest one yellow by habit.
- Don't hide a limit in a footnote: put the number in the list.
