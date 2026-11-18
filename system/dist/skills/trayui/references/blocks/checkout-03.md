# Order placed

The page after paying: the order number, the delivery, what happens next, the summary, and where the jars come from.

An order confirmation page, for the moment after paying. It opens with a Paid badge, a thank-you headline and the order number with a button that copies it, beside the delivery window on the yellow card with a link to add it to a calendar. Under them come what happens next as a vertical stepper, the paid summary with the note to the courier, a card on where the product comes from, and an offer to keep the details by choosing a password. It ends the flow that the [cart](https://trayui.com/blocks/checkout-01.md) and the [one-page checkout](https://trayui.com/blocks/checkout-02.md) begin.

The copy button says "Copied", or "Copy failed", through a hidden status, so the result is heard as well as seen. Each finished step adds ", done" in hidden text, and the current one carries `aria-current="step"`. The password field asks the browser for a new password through its `autocomplete`. Below 56rem the six cards stack in one column.

It is made of these components: [Button](https://trayui.com/components/button.md), [Card](https://trayui.com/components/card.md), [Badge](https://trayui.com/components/badge.md), [Description List](https://trayui.com/components/description-list.md), [Stepper](https://trayui.com/components/stepper.md), [Checkout Summary](https://trayui.com/components/checkout-summary.md), [Field](https://trayui.com/components/field.md), [Label](https://trayui.com/components/label.md), [Input Group](https://trayui.com/components/input-group.md), [Input](https://trayui.com/components/input.md).

Behaviours it uses: `copy`, `reveal`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Order placed</title>
<meta name="description" content="The page after paying: the order number, the delivery, what happens next, the summary, and where the jars come from.">
<meta name="tray-category" content="Checkout">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-screen">
  <header class="tray-screen__bar">
    <a class="tray-wordmark" href="/">Perly Farm</a>
    <a class="tray-btn tray-btn--link" href="/shop">Back to the shop</a>
  </header>
  <main class="tray-screen__body">
    <div class="tray-bento">
      <section class="tray-card tray-span-8 tray-stack tray-stack--lg" aria-labelledby="done-title">
        <div class="tray-stack">
          <span class="tray-badge tray-badge--success" style="justify-self: start"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-circle-check"/></svg>Paid</span>
          <h1 class="headline" id="done-title">Thank you, Dana. The order is&nbsp;in.</h1>
          <p class="lead tray-soft">We pack the four jars by 14:00, and the courier brings them to you this afternoon.</p>
        </div>
        <dl class="tray-dl">
          <div><dt>Order</dt><dd><span id="order-id">PL-20431</span><button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-tray="copy" data-target="#order-id" aria-label="Copy the order number"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-copy"/></svg></button></dd></div>
          <div><dt>Paid</dt><dd>$277.00 by card ending 4242</dd></div>
          <div><dt>Receipt</dt><dd>Sent to dana@kovalenko.example</dd></div>
        </dl>
        <div class="tray-row tray-row--sm">
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/orders/PL-20431/receipt"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-download"/></svg>Download the receipt</a>
          <a class="tray-btn tray-btn--ghost tray-btn--sm" href="/contact?order=PL-20431"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-message-square"/></svg>Write to the farm</a>
        </div>
      </section>
      <section class="tray-card tray-card--accent tray-span-4 tray-stack tray-stack--lg" aria-labelledby="delivery-title" style="align-content: space-between">
        <div class="tray-stack">
          <h2 class="subtitle" id="delivery-title">Delivery</h2>
          <p class="title">Today, 16:00 to&nbsp;18:00</p>
          <p>Flat 12, 8 Fernleaf Street, Kyiv. The courier calls ten minutes before arriving.</p>
        </div>
        <div class="tray-stack tray-stack--sm">
          <a class="tray-btn tray-btn--dark tray-btn--md" href="/orders/PL-20431/calendar.ics"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-calendar"/></svg>Add to the calendar</a>
          <a class="tray-btn tray-btn--link" href="/orders/PL-20431/slot" style="justify-self: center">Change the time</a>
        </div>
      </section>

      <section class="tray-card tray-span-5" aria-labelledby="next-title">
        <div class="tray-card__head">
          <div>
            <h2 class="subtitle" id="next-title">What happens next</h2>
            <p class="tray-soft">We text you at each step.</p>
          </div>
        </div>
        <ol class="tray-stepper tray-stepper--v" aria-label="Progress of the order" role="list">
          <li data-done><span class="tray-step"><span class="tray-step__mark"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-check"/></svg></span><span class="tray-step__text">Paid<span class="tray-vh">, done</span><small>Today at 09:12</small></span></span></li>
          <li aria-current="step"><span class="tray-step"><span class="tray-step__mark"></span><span class="tray-step__text">Packed<small>By 14:00, in a chilled box</small></span></span></li>
          <li><span class="tray-step"><span class="tray-step__mark"></span><span class="tray-step__text">With the courier<small>From 14:00, with a link to follow the box</small></span></span></li>
          <li><span class="tray-step"><span class="tray-step__mark"></span><span class="tray-step__text">Delivered<small>Between 16:00 and 18:00</small></span></span></li>
        </ol>
      </section>
      <section class="tray-card tray-span-7 tray-summary" aria-labelledby="order-title">
        <h2 class="subtitle" id="order-title">Your order</h2>
        <ul class="tray-summary__lines" role="list">
          <li class="tray-summary__line"><span>Snail caviar, 30 g<small>1 &times; $38.00</small></span><span>$38.00</span></li>
          <li class="tray-summary__line"><span>Snail caviar, 50 g<small>2 &times; $59.00</small></span><span>$118.00</span></li>
          <li class="tray-summary__line"><span>Snail caviar, 100 g<small>1 &times; $112.00</small></span><span>$112.00</span></li>
          <li class="tray-summary__line"><span>Courier, chilled box<small>Today, 16:00 to 18:00</small></span><span>$9.00</span></li>
        </ul>
        <p class="tray-summary__total"><span>Paid</span><span>$277.00</span></p>
        <div class="tray-panel tray-stack tray-stack--sm" style="padding: var(--space-5)">
          <h3 class="label tray-soft">Your note to the courier</h3>
          <p class="nav">Call from the gate: the bell for flat 12 sticks.</p>
        </div>
      </section>

      <section class="tray-card tray-card--leaf tray-span-7 tray-stack tray-stack--lg" aria-labelledby="batch-title" style="align-content: space-between">
        <div class="tray-stack tray-stack--sm">
          <h2 class="subtitle" id="batch-title">Your jars come from batch 14</h2>
          <p class="tray-soft">Collected on 2 November from the snails in the north field, then salted and rested for twelve days.</p>
        </div>
        <div class="tray-row tray-row--sm">
          <span class="tray-chip">Keep at 2 to 6 &deg;C</span>
          <span class="tray-chip">Open within six weeks</span>
          <span class="tray-chip">Best with a spoon of bone or shell</span>
        </div>
      </section>
      <form class="tray-card tray-span-5 tray-stack tray-stack--lg" action="/account" method="post" aria-labelledby="account-title">
        <div class="tray-stack tray-stack--sm">
          <h2 class="subtitle" id="account-title">Keep your details</h2>
          <p class="tray-soft">Next time the address and the phone fill in by themselves.</p>
        </div>
        <div class="tray-field">
          <label class="tray-label" for="password">Choose a password</label>
          <div class="tray-input-group">
            <input class="tray-input" id="password" name="password" type="password" spellcheck="false" autocapitalize="none" autocomplete="new-password" minlength="12" aria-describedby="password-hint">
            <button class="tray-input-group__btn" type="button" data-tray="reveal" aria-label="Show password"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-eye"/></svg></button>
          </div>
          <p class="tray-field__hint" id="password-hint">At least 12 characters. The email is dana@kovalenko.example.</p>
        </div>
        <button class="tray-btn tray-btn--quiet tray-btn--md" type="submit" style="justify-self: start">Create the account</button>
      </form>
    </div>
  </main>
  <footer class="tray-screen__foot">
    <p>Perly Farm, Farm road 4, Kyiv region. The farm, the order and every figure on this page are demo data.</p>
  </footer>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
