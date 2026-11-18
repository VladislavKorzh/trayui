# A pricing page in HTML and CSS

A pricing page in plain HTML and CSS: plan cards, a monthly and yearly switch whose new prices are spoken, a comparison table in groups, and the questions.

A pricing page answers one question per part: what each plan costs, what it includes, how the plans differ line by line, and what happens at the edges. Tray UI has three pricing blocks, each one HTML file over `tokens.css`, `components/bundle.css` and `components/bundle.js`: [Plans at the end of a trial](#b-pricing-01) with three cards, [Plans compared feature by feature](#b-pricing-02) with a comparison table, and [Pricing by usage](#b-pricing-03) with a calculator and the questions. This article takes their parts one at a time.

## Plan cards

Each plan is an `<article>` titled by its heading. The price is the largest thing on the card, followed by who the plan is for, one button and what it includes.

```html
<article class="tray-card tray-card--accent tray-plan" aria-labelledby="plan-shop">
  <div class="tray-plan__head">
    <h2 class="tray-plan__name" id="plan-shop">Shop <span class="tray-badge tray-badge--ink">Your trial</span></h2>
    <p class="tray-plan__price">
      <span data-monthly="$29" data-yearly="$24">$29</span>
      <small data-monthly="a month" data-yearly="a month, $288 a year">a month</small>
    </p>
    <p class="tray-plan__text">For a farm that ships every day.</p>
  </div>
  <a class="tray-btn tray-btn--dark tray-btn--md" href="/billing/plan?to=shop">Keep Shop</a>
  <ul class="tray-ticks">
    <li><svg class="tray-icon" aria-hidden="true">…check…</svg>1,000 orders a month</li>
    <li data-off><svg class="tray-icon" aria-hidden="true">…minus…</svg>No courier tracking</li>
  </ul>
</article>
```

- **One recommended plan.** It is the yellow card, and its button is the only dark one; the others are quiet. The yellow alone says nothing to a person who cannot see it, so the badge, "Your trial" or "Most chosen", sits inside the heading and becomes part of the plan's name.
- **Buttons that name their plan.** "Move to Stall", "Keep Shop" and "Move to Market" can be told apart in a list of links; three buttons that all say "Choose" cannot.
- **Words for what is missing.** The checks and dashes are hidden from assistive technologies. `data-off` only greys a line, so the line itself must say it: "No courier tracking".
- **A unit on every price.** "a month", "a month, billed yearly", "for good".

The cards sit in a twelve-column grid, `tray-bento`, four columns each from 56rem; below that each card takes the full width and they stack. Under the cards, the first block sets what the trial used against the plan's limits as meters, each with `role="meter"`, a name and its value, and a second card says what happens if the person chooses nothing.

## The monthly and yearly switch

The period is a choice of two values, so it is two radio buttons. A radio group gives the keyboard behaviour for free: Tab reaches the chosen period, the arrow keys move to the other one and choose it, and a form can send it.

```html
<div data-tray="pricing">
  <div class="tray-seg" role="radiogroup" aria-label="Billing period">
    <label class="tray-seg__item"><input type="radio" name="period" value="monthly" checked><span>Monthly</span></label>
    <label class="tray-seg__item"><input type="radio" name="period" value="yearly"><span>Yearly</span></label>
  </div>
  <span class="tray-badge">Two months free on yearly</span>
  …the plans…
</div>
```

The inputs are real, transparent and laid over their segments, and the chosen one paints its segment ink. A `<fieldset>` with a `<legend>` would group them natively; Tray UI shows no legend over the pill, so the group is a `role="radiogroup"` named by `aria-label`.

Each price that changes carries both texts, `data-monthly` and `data-yearly`, and the markup holds the monthly one, so the prices are there before any script runs. When the radios change, `data-tray="pricing"` writes the chosen text into every element that has it.

### Saying the new prices

Focus stays on the radio while the prices change somewhere else on the page, and nothing at the radio says what they became. Tray UI writes them into a hidden `role="status"`, a polite live region, which assistive technologies can present without focus moving:

"Yearly prices: Shop, $24 a month, $288 a year; Market, $66 a month, $792 a year"

Only the plans whose price changes are listed; Stall costs $0 in both. The name of each plan is the first words of its heading, before the badge. A version of your own, with the region in the page from the start:

```html
<fieldset id="period">
  <legend>Billing period</legend>
  <label><input type="radio" name="period" value="monthly" checked> Monthly</label>
  <label><input type="radio" name="period" value="yearly"> Yearly</label>
</fieldset>
<p class="visually-hidden" role="status" id="prices-said"></p>

<article aria-labelledby="plan-shop">
  <h2 id="plan-shop">Shop</h2>
  <p data-plan="Shop">
    <span data-monthly="$29" data-yearly="$24">$29</span>
    <small data-monthly="a month" data-yearly="a month, billed yearly">a month</small>
  </p>
</article>
```

```js
const said = document.getElementById('prices-said');

document.getElementById('period').addEventListener('change', (event) => {
  const period = event.target.value;
  for (const el of document.querySelectorAll(`[data-${period}]`)) {
    el.textContent = el.dataset[period];
  }
  const prices = [...document.querySelectorAll('[data-plan]')].map(
    (p) => `${p.dataset.plan}, ${p.textContent.replace(/\s+/g, ' ').trim()}`);
  said.textContent = `${event.target.labels[0].textContent.trim()} prices: ${prices.join('; ')}`;
});
```

In Chromium, ArrowDown on Monthly chooses Yearly, keeps focus on it, and leaves "Yearly prices: Shop, $24 a month, billed yearly" in the status. MDN's guide to live regions says "The most reliable way to ensure that live regions are registered is to include them in the initial markup", which is why the paragraph is written into the page empty. Tray UI makes its status inside the wrapper on the first change, empties it, and writes the words a frame later; when the same words come twice in a row, it adds a no-break space so the region's text still changes.

The sliding pill is motion, so under `prefers-reduced-motion: reduce` it moves to the chosen period at once.

## The comparison table

[Plans compared feature by feature](#b-pricing-02) sets 16 features in five groups against three plans. It is a real `<table>`, and the groups are what make it readable aloud.

```html
<table class="tray-compare">
  <caption class="tray-vh">Stall, Shop and Market compared</caption>
  <thead>
    <tr>
      <th scope="col"><span class="tray-vh">Feature</span></th>
      <th scope="col">Stall<small>$0, for good</small></th>
      <th scope="col" data-featured>Shop<small data-monthly="$29 a month" data-yearly="$24 a month, billed yearly">$29 a month</small></th>
      <th scope="col">Market<small data-monthly="$79 a month" data-yearly="$66 a month, billed yearly">$79 a month</small></th>
    </tr>
  </thead>
  <tbody>
    <tr class="tray-compare__group">
      <th scope="rowgroup">Delivery</th><td></td><td data-featured></td><td></td>
    </tr>
    <tr>
      <th scope="row">Courier tracking</th>
      <td data-off><svg class="tray-icon" aria-hidden="true">…minus…</svg><span class="tray-vh">Not included</span></td>
      <td data-featured><svg class="tray-icon" aria-hidden="true">…check…</svg><span class="tray-vh">Included</span></td>
      <td><svg class="tray-icon" aria-hidden="true">…check…</svg><span class="tray-vh">Included</span></td>
    </tr>
  </tbody>
  <tbody>…the next group…</tbody>
</table>
```

- **Each group is a `<tbody>` of its own.** A table may have several, and the group's heading is a `<th scope="rowgroup">`. MDN describes that value as a header that "belongs to a rowgroup and relates to all of its cells". In one long `<tbody>`, "Delivery" would be the heading of every row after it; in its own, it heads its five rows and stops.
- **Every head has a scope.** `scope="col"` ties each cell to its plan and `scope="row"` to its feature. The first head cell holds a hidden "Feature", so that column has a name too.
- **Words behind every icon.** A check or a dash is `aria-hidden`, followed by a hidden "Included" or "Not included". Where there is a limit, the cell says it: "Five people", "In one working day".
- **The featured column.** `data-featured` on every cell of one column lays a tray behind it, rounded at the head and at the foot. The empty cell under Shop in each group row keeps that tray unbroken. The tray is only seen: if the recommendation matters, say it in words in the head too, as the cards do with their badge. The block marks Shop by its tray and its yellow button alone.
- **Say the common features once.** A row of chips above the table, a list named "In every plan", holds what all plans include, so those rows are not ticked three times.

The switch rewrites the prices in the column heads and the cost of each extra person. With no cards on the page, Tray UI builds its spoken status from the column heads: "Yearly prices: Shop, $24 a month, billed yearly; Market, $66 a month, billed yearly".

## Questions

[Pricing by usage](#b-pricing-03) ends with four questions about the price in an accordion. Each is a `<details>` that shares a `name` with the others:

```html
<div class="tray-accordion">
  <details name="price" open>
    <summary>What counts as an order?<span class="tray-tile" aria-hidden="true">…plus…</span></summary>
    <p class="tray-accordion__body">Every order that comes in …</p>
  </details>
  <details name="price">
    <summary>When do I pay?<span class="tray-tile" aria-hidden="true">…plus…</span></summary>
    <p class="tray-accordion__body">On the first day of each month …</p>
  </details>
</div>
```

MDN on the `name` attribute: "Only one of the grouped `<details>` elements can be open at a time". Opening one closes the one that was open. No script is involved, Enter or Space opens a question, and the plus icon is hidden from assistive technologies. Write questions people ask about money: what counts, what happens in a busy month, when they pay, how the trial ends.

The same block shows pricing by usage. A [Slider](#c-slider) from 0 to 5,000 orders in steps of 50 sets the month; `data-unit=" orders"` gives it an `aria-valuetext` such as "1000 orders", so the number is read with its unit. The price is a polite live region already in the markup, and the block's short script works the sum out from three numbers: 100 free orders, 3 cents each after them, and a cap of $89. From 3,100 orders a line appears that takes off the rest.

## On a phone

At 390 pixels wide the plan cards of the first block stack in one column, each 358 pixels wide, and the switch and its badge wrap under the heading. The comparison table keeps its 40rem: it scrolls sideways inside its card, 641 pixels of table in a 302-pixel frame. That frame has `tabindex="0"`, `role="region"` and the name "Plan comparison, scrolls sideways", so a keyboard can reach and scroll it and a screen reader says what it is. The usage page puts the yellow price card under the calculator.

## Which block to start from

| Block | Start from it when |
| --- | --- |
| [Plans at the end of a trial](#b-pricing-01) | The page is inside the product, for a person whose trial ends and who has usage to show. |
| [Plans compared feature by feature](#b-pricing-02) | A public page where people compare plans line by line before they sign up. |
| [Pricing by usage](#b-pricing-03) | One plan priced per unit, with a calculator, examples and questions. |

## Pricing in Tray UI

[Pricing Table](#c-pricing-table) has the cards and the `data-tray="pricing"` switch, which fires `tray:change` with `{ period }` on the wrapper. [Plan Comparison](#c-plan-comparison) has the table, [Toggle Group](#c-toggle-group) the segmented control, [Accordion](#c-accordion) the questions, and [Usage Meter](#c-usage-meter) the meters. Copy a block from [Blocks](#blocks); it needs the three files from [Installation](#d-installation).
