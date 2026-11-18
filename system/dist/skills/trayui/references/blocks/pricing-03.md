# Pricing by usage

One plan priced by the order: a slider that works out the month's price, what farms like yours pay, and questions that fold.

A usage-based pricing page with a pricing calculator: one plan, priced per order, and a slider for the orders in a month. As it moves, the panel under it breaks the sum down, and past the monthly cap a line appears that takes off the rest, from 3,100 orders in the example. The yellow card beside it shows the month's price, the one button and what the plan includes. Below, a table of what example customers pay links back to the slider, and four questions sit in an accordion that keeps at most one open.

Choose it when the price follows use, not a tier; for tiers, see [the comparison table](https://trayui.com/blocks/pricing-02.md). The slider runs from 0 to 5,000 in steps of 50, and `data-unit` adds the unit to its spoken value. The price is a polite live region, so a screen reader reads each new figure. The block's own short script works out the sum, with the free orders, the rate and the cap as three numbers at its top.

It is made of these components: [Button](https://trayui.com/components/button.md), [Card](https://trayui.com/components/card.md), [Label](https://trayui.com/components/label.md), [Slider](https://trayui.com/components/slider.md), [Checkout Summary](https://trayui.com/components/checkout-summary.md), [Table](https://trayui.com/components/table.md), [Accordion](https://trayui.com/components/accordion.md).

Behaviours it uses: `slider`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pricing by usage</title>
<meta name="description" content="One plan priced by the order: a slider that works out the month's price, what farms like yours pay, and questions that fold.">
<meta name="tray-category" content="Pricing">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-screen">
  <header class="tray-screen__bar">
    <a class="tray-wordmark" href="/">Counter</a>
    <a class="tray-btn tray-btn--link" href="/signin">Sign in</a>
  </header>
  <main class="tray-screen__body">
    <div class="tray-bento">
      <section class="tray-card tray-span-7 tray-stack tray-stack--lg" aria-labelledby="price-title" style="align-content: space-between">
        <div class="tray-stack">
          <h1 class="headline" id="price-title">Pay 3&nbsp;cents an&nbsp;order</h1>
          <p class="lead tray-soft">One plan with everything in it. The first 100 orders each month are free, and no month costs more than $89.</p>
        </div>
        <div class="tray-panel tray-stack tray-stack--lg">
          <div class="tray-slider-field" id="orders-field">
            <div class="tray-slider-field__head">
              <label class="tray-label tray-label--inline" for="orders">Orders a month</label>
              <output for="orders">1,000 orders</output>
            </div>
            <input class="tray-slider" id="orders" type="range" min="0" max="5000" step="50" value="1000" data-unit=" orders" data-tray="slider">
            <div class="tray-slider-field__scale" aria-hidden="true"><span>0</span><span>2,500</span><span>5,000</span></div>
          </div>
          <ul class="tray-summary__lines" role="list">
            <li class="tray-summary__line"><span>First 100 orders<small>Free in every month</small></span><span>Free</span></li>
            <li class="tray-summary__line"><span id="paid-name">900 orders at 3 cents</span><span id="paid-sum">$27.00</span></li>
            <li class="tray-summary__line" id="cap-line" hidden><span>Above the cap<small>No month costs more than $89</small></span><span id="cap-sum">&minus;$0.00</span></li>
          </ul>
          <p class="tray-summary__total"><span>The month</span><span id="total">$27.00</span></p>
        </div>
      </section>
      <section class="tray-card tray-card--accent tray-span-5 tray-stack tray-stack--lg" aria-labelledby="plan-title">
        <div class="tray-stack">
          <h2 class="subtitle" id="plan-title">Your price</h2>
          <p class="tray-figure" aria-live="polite"><span id="price">$27</span><small>a month</small></p>
          <p id="price-note">For 1,000 orders, with everything below in it.</p>
        </div>
        <a class="tray-btn tray-btn--dark tray-btn--md" href="/signup">Start the free trial</a>
        <ul class="tray-ticks" role="list">
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>As many people and shops as you have</li>
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>Labels with no monthly limit</li>
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>Courier tracking and booked pickups</li>
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>Exports, the API and webhooks</li>
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>Order history kept for good</li>
        </ul>
        <p class="caption">Free for 14 days. No card needed to start.</p>
      </section>

      <section class="tray-card tray-span-5" aria-labelledby="examples-title">
        <div class="tray-card__head">
          <div>
            <h2 class="subtitle" id="examples-title">What farms like yours pay</h2>
            <p class="tray-soft">Orders in October, demo data.</p>
          </div>
        </div>
        <div class="tray-table-wrap">
          <table class="tray-table" aria-labelledby="examples-title">
            <thead>
              <tr>
                <th scope="col">Who</th>
                <th scope="col" data-num>Orders</th>
                <th scope="col" data-num>A month</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">A stall at the Saturday market</th>
                <td data-num>80</td>
                <td data-num>Free</td>
              </tr>
              <tr>
                <th scope="row">Perly Farm</th>
                <td data-num>1,000</td>
                <td data-num>$27.00</td>
              </tr>
              <tr>
                <th scope="row">A farm shop with a caf&eacute;</th>
                <td data-num>2,200</td>
                <td data-num>$63.00</td>
              </tr>
              <tr>
                <th scope="row">A co-op of five farms</th>
                <td data-num>4,800</td>
                <td data-num>$89.00</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="tray-card__foot">
          <a class="tray-btn tray-btn--quiet tray-btn--sm" href="#orders">Try your own count</a>
        </div>
      </section>
      <section class="tray-span-7 tray-stack" aria-labelledby="faq-title" style="padding-block-start: var(--card-pad)">
        <h2 class="title" id="faq-title">Questions about the price</h2>
        <div class="tray-accordion">
          <details name="price" open>
            <summary>What counts as an order?<span class="tray-tile" aria-hidden="true"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg></span></summary>
            <p class="tray-accordion__body">Every order that comes in: from the order page, a connected shop, the phone or the market stall. An order cancelled on the day it came in does not count.</p>
          </details>
          <details name="price">
            <summary>What if a month is busier than I thought?<span class="tray-tile" aria-hidden="true"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg></span></summary>
            <p class="tray-accordion__body">Orders keep coming in and none is held back. You pay for what came in, and never more than $89 for the month.</p>
          </details>
          <details name="price">
            <summary>When do I pay?<span class="tray-tile" aria-hidden="true"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg></span></summary>
            <p class="tray-accordion__body">On the first day of each month, for the month before. The invoice lists the orders by day, so you can check it against your own count.</p>
          </details>
          <details name="price">
            <summary>How does the free trial work?<span class="tray-tile" aria-hidden="true"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg></span></summary>
            <p class="tray-accordion__body">For 14 days every order is free. On the 15th day the count starts at zero, and the first 100 orders of each month stay free after that.</p>
          </details>
        </div>
      </section>
    </div>
  </main>
  <footer class="tray-screen__foot">
    <p>Prices are in US dollars, before tax. Questions? Write to <a href="mailto:billing@counter.example">billing@counter.example</a>.</p>
  </footer>
</div>
<script>
/* Works out the month's price as the slider moves: the first 100 orders are free, then 3 cents an order, never more than $89.
   It listens on the field, so it runs after the slider's own behaviour, and once more when the page is ready. */
(function () {
  var FREE = 100, CENTS = 3, CAP = 8900;  /* amounts in cents */
  var slider = document.getElementById('orders'), field = document.getElementById('orders-field');
  var money = function (c) { return '$' + (c / 100).toFixed(2); };
  var count = function (n) { return n.toLocaleString('en-US'); };
  function work() {
    var orders = +slider.value, paid = Math.max(0, orders - FREE), cost = paid * CENTS, total = Math.min(cost, CAP);
    field.querySelector('output').textContent = count(orders) + ' orders';
    slider.setAttribute('aria-valuetext', count(orders) + ' orders');  /* heard as it is shown, "1,000 orders" */
    document.getElementById('paid-name').textContent = paid ? count(paid) + ' orders at 3 cents' : 'No orders past the first 100';
    document.getElementById('paid-sum').textContent = money(cost);
    document.getElementById('cap-line').hidden = cost <= CAP;
    document.getElementById('cap-sum').textContent = '−' + money(Math.max(0, cost - CAP));
    document.getElementById('total').textContent = money(total);
    document.getElementById('price').textContent = total % 100 ? money(total) : '$' + total / 100;
    document.getElementById('price-note').textContent = (paid ? 'For ' : 'Free, for ') + count(orders) + ' orders, with everything below in it.';
  }
  field.addEventListener('input', work);
  document.addEventListener('DOMContentLoaded', function () { setTimeout(work); });
})();
</script>
<script src="../components/bundle.js"></script>
</body>
</html>
```
