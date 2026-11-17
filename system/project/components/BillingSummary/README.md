# Billing Summary

The billing summary opens the billing page: the plan the workspace is on, what it costs and when it renews on an ink card, with the facts of the next invoice beside it.

## Markup
```html
<div class="tray-billing">
  <section class="tray-card tray-card--inverse">
    <div class="tray-card__head">
      <div><p class="tray-soft">Current plan</p><h2 class="title">Shop</h2></div>
      <span class="tray-badge tray-badge--accent">Active</span>
    </div>
    <p class="tray-plan__price">$29<small>a month</small></p>
    <p class="tray-soft">Renews on 1 December 2026.</p>
    <div class="tray-card__foot">
      <a class="tray-btn tray-btn--md" href="/billing/plans">Change plan</a>
      <button class="tray-btn tray-btn--ghost tray-btn--md" type="button">Cancel plan</button>
    </div>
  </section>
  <section class="tray-card">
    <h2 class="subtitle">Next invoice</h2>
    <dl class="tray-dl tray-dl--plain">…</dl>
  </section>
</div>
```
It is built from Card, the price of the Pricing Table (`tray-plan__price`), Badge and Description List. `tray-billing` lays the cards side by side from 20rem each and stacks them below that.

The badge says the state of the subscription in a word: "Active", "Trial, 5 days left", "Payment failed", "Cancels on 1 December".

## Accessibility
Each card opens with a heading, so a screen reader can reach it from the page's list of headings. The badge is read as its word, and its yellow adds nothing a screen reader hears. The next invoice is a Description List, so each fact keeps its term. On the ink card every colour takes its on-dark step, the focus ring too, so the ring shows on the dark ground. Name each button for its outcome, as "Change plan" and "Cancel plan" do.

## Do and don't
- Do print the renewal date in full, with the year.
- Do keep "Cancel plan" a ghost button beside the main one: easy to find, hard to hit by accident.
- Don't show the card number here beyond its last four digits.
- Don't put usage bars on the ink card. They go in a Usage Meter beside it.
