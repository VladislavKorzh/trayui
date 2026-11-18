# Plans at the end of a trial

Three plans side by side with a monthly or yearly switch, and what the trial used against the plan it fits.

An in-product pricing page for the day a free trial ends: a back link to the app in the bar, a lead that gives the trial's end date, and three plan cards. The plan on trial is the yellow card, with a badge in its heading, and its button keeps the plan while the other two move to theirs. Under the cards, three meters set what the trial used against that plan's limits, and a second card says what happens if the person chooses nothing.

Use it inside the product, for a person who already has usage to show; [the comparison table](https://trayui.com/blocks/pricing-02.md) suits a public pricing page, and [pricing by usage](https://trayui.com/blocks/pricing-03.md) a single plan priced per order. Below 56rem the cards stack in one column. When the period changes, focus stays on the switch and a hidden status reads the new prices of the plans that change, such as "Yearly prices: Shop, $24 a month, $288 a year".

It is made of these components: [Toggle Group](https://trayui.com/components/toggle-group.md), [Badge](https://trayui.com/components/badge.md), [Card](https://trayui.com/components/card.md), [Button](https://trayui.com/components/button.md), [Usage Meter](https://trayui.com/components/usage-meter.md), [Progress](https://trayui.com/components/progress.md).

Behaviours it uses: `pricing`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Plans at the end of a trial</title>
<meta name="description" content="Three plans side by side with a monthly or yearly switch, and what the trial used against the plan it fits.">
<meta name="tray-category" content="Pricing">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-screen">
  <header class="tray-screen__bar">
    <a class="tray-wordmark" href="/">Counter</a>
    <a class="tray-back" href="/orders"><svg class="tray-icon tray-icon--flip" aria-hidden="true"><use href="#tray-i-arrow-left"/></svg>Back to the orders</a>
  </header>
  <main class="tray-screen__body" data-tray="pricing">
    <div class="tray-row tray-row--between" style="align-items: flex-end; row-gap: var(--space-6)">
      <div class="tray-stack" style="max-inline-size: 44rem">
        <h1 class="headline">Choose a plan for Perly&nbsp;Farm</h1>
        <p class="lead tray-soft">The trial of Shop ends on 21 November. Your orders and customers stay, whatever you choose.</p>
      </div>
      <div class="tray-row tray-row--sm">
        <div class="tray-seg" role="radiogroup" aria-label="Billing period">
          <label class="tray-seg__item"><input type="radio" name="period" value="monthly" checked><span>Monthly</span></label>
          <label class="tray-seg__item"><input type="radio" name="period" value="yearly"><span>Yearly</span></label>
        </div>
        <span class="tray-badge">About two months free on yearly</span>
      </div>
    </div>

    <div class="tray-bento">
      <article class="tray-card tray-plan tray-span-4" aria-labelledby="plan-stall">
        <div class="tray-plan__head">
          <h2 class="tray-plan__name" id="plan-stall">Stall</h2>
          <p class="tray-plan__price"><span>$0</span><small>for good</small></p>
          <p class="tray-plan__text">For a first season at the market, with one person at the desk.</p>
        </div>
        <a class="tray-btn tray-btn--quiet tray-btn--md" href="/billing/plan?to=stall">Move to Stall</a>
        <ul class="tray-ticks" role="list">
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>50 orders a month</li>
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>One person</li>
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>One shop connected</li>
          <li data-off><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-minus"/></svg>No courier tracking</li>
        </ul>
      </article>
      <article class="tray-card tray-card--accent tray-plan tray-span-4" aria-labelledby="plan-shop">
        <div class="tray-plan__head">
          <h2 class="tray-plan__name" id="plan-shop">Shop <span class="tray-badge tray-badge--ink">Your trial</span></h2>
          <p class="tray-plan__price"><span data-monthly="$29" data-yearly="$24">$29</span><small data-monthly="a month" data-yearly="a month, $288 a year">a month</small></p>
          <p class="tray-plan__text">For a farm that ships every day. Everything you used in the trial is in it.</p>
        </div>
        <a class="tray-btn tray-btn--dark tray-btn--md" href="/billing/plan?to=shop">Keep Shop</a>
        <ul class="tray-ticks" role="list">
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>1,000 orders a month</li>
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>Five people</li>
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>Three shops connected</li>
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>Courier tracking and booked pickups</li>
        </ul>
      </article>
      <article class="tray-card tray-plan tray-span-4" aria-labelledby="plan-market">
        <div class="tray-plan__head">
          <h2 class="tray-plan__name" id="plan-market">Market</h2>
          <p class="tray-plan__price"><span data-monthly="$79" data-yearly="$66">$79</span><small data-monthly="a month" data-yearly="a month, $792 a year">a month</small></p>
          <p class="tray-plan__text">For several farms that pack and ship under one roof.</p>
        </div>
        <a class="tray-btn tray-btn--quiet tray-btn--md" href="/billing/plan?to=market">Move to Market</a>
        <ul class="tray-ticks" role="list">
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>Unlimited orders</li>
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>Twenty people, with roles</li>
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>Several workspaces</li>
          <li><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg>The API and webhooks</li>
        </ul>
      </article>

      <section class="tray-card tray-span-8" aria-labelledby="trial-title">
        <div class="tray-card__head">
          <div>
            <h2 class="subtitle" id="trial-title">What the trial used</h2>
            <p class="tray-soft">Since 7 November, against the limits of Shop. All of it fits.</p>
          </div>
        </div>
        <div class="tray-usage">
          <div class="tray-progress">
            <span class="tray-progress__name">Orders</span>
            <span class="tray-progress__value">842 of 1,000</span>
            <span class="tray-progress__bar" role="meter" aria-label="Orders in the trial, of the 1,000 in Shop" aria-valuemin="0" aria-valuemax="1000" aria-valuenow="842" style="--tray-v: 84"></span>
          </div>
          <div class="tray-progress">
            <span class="tray-progress__name">People</span>
            <span class="tray-progress__value">4 of 5</span>
            <span class="tray-progress__bar" role="meter" aria-label="People in the trial, of the 5 in Shop" aria-valuemin="0" aria-valuemax="5" aria-valuenow="4" style="--tray-v: 80"></span>
          </div>
          <div class="tray-progress">
            <span class="tray-progress__name">Shops connected</span>
            <span class="tray-progress__value">2 of 3</span>
            <span class="tray-progress__bar" role="meter" aria-label="Shops connected in the trial, of the 3 in Shop" aria-valuemin="0" aria-valuemax="3" aria-valuenow="2" style="--tray-v: 67"></span>
          </div>
        </div>
      </section>
      <section class="tray-card tray-span-4 tray-stack" aria-labelledby="nothing-title">
        <h2 class="subtitle" id="nothing-title">If you choose nothing</h2>
        <p class="tray-soft">On 21 November the workspace moves to Stall. Orders past the first 50 wait until 1 December, and only the owner can sign in.</p>
        <p class="tray-soft">Nothing is deleted, and we never charge a card you did not give us.</p>
      </section>
    </div>
  </main>
  <footer class="tray-screen__foot">
    <p>Prices are in US dollars, before tax. A change starts the day you make it. Figures are demo data.</p>
  </footer>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
