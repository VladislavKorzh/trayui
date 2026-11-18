# A checkout page in HTML and CSS

A checkout page in plain HTML and CSS: the steps, an address the browser can fill, delivery as radios, card fields, and a total that is read aloud.

A checkout asks for a few things in a fixed order: what is in the cart, who it is for, where it goes and how it is paid. Tray UI has these screens as three blocks: the [Cart](#b-checkout-01), the [One-page checkout](#b-checkout-02) and [Order placed](#b-checkout-03). Each is one HTML file over `tokens.css`, `components/bundle.css` and `components/bundle.js`; the markup below comes from them.

## The frame

A checkout leaves the shop's header and footer behind. The blocks use `tray-screen`, the frame of a page outside an app: a bar with the wordmark and one link back, the content, and one quiet line at the foot. `tray-with-aside` puts the form beside the order summary.

```html
<div class="tray-screen">
  <header class="tray-screen__bar">
    <a class="tray-wordmark" href="/">Perly Farm</a>
    <a class="tray-back" href="/cart">Back to the cart</a>
  </header>
  <main class="tray-screen__body">
    <h1 class="title">Delivery and payment</h1>
    <div class="tray-with-aside">
      <form class="tray-form" id="checkout" action="/checkout" method="post">…</form>
      <aside class="tray-with-aside__aside" aria-label="Your order">…</aside>
    </div>
  </main>
  <footer class="tray-screen__foot">…</footer>
</div>
```

From 64rem the summary is a 20rem column beside the form, `position: sticky`, so the total stays in view. Below 64rem it falls under the form. Write it after the form in the source, so the order on a phone is the order of reading and Tab reaches the summary after the last field.

## The steps

A checkout in steps shows where the person is. The Cart opens with a [Stepper](#c-stepper): an ordered list named by its `aria-label`, the current step marked with `aria-current="step"`.

```html
<ol class="tray-stepper tray-stepper--fold" aria-label="Checkout">
  <li aria-current="step">
    <span class="tray-step"><span class="tray-step__mark"></span><span class="tray-step__text">Cart</span></span>
  </li>
  <li>
    <span class="tray-step"><span class="tray-step__mark"></span><span class="tray-step__text">Delivery and payment</span></span>
  </li>
  <li>
    <span class="tray-step"><span class="tray-step__mark"></span><span class="tray-step__text">Confirmation</span></span>
  </li>
</ol>
```

An empty `tray-step__mark` takes its number from a CSS counter. A finished step carries `data-done`, a check, and ", done" in visually hidden text, and may be a link back; a step ahead never is. Below 34rem `tray-stepper--fold` keeps the name of the current step and folds the others to their numbers. Their words stay in the page, clipped to one pixel, so a screen reader still reads every step.

## Contact and an address the browser fills

Group the questions in `<fieldset>` elements, each named by its `<legend>`: Contact, Delivery, Payment. Give every field a visible `<label>` and an `autocomplete` token, so the browser can fill in the person's own details.

[1.3.5 Identify Input Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html) (level AA) asks that the purpose of each field collecting information about the user can be programmatically determined, and `autocomplete` is how HTML does it. The purposes WCAG 2.2 lists come from the HTML autofill field names and include the address and the card. The One-page checkout uses these:

| Field | `autocomplete` |
| --- | --- |
| Email | `email`, on a `type="email"` field |
| Name | `name` |
| Phone | `tel`, on a `type="tel"` field |
| Street and house | `address-line1` |
| Flat or entrance | `address-line2` |
| City | `address-level2` |
| Card number | `cc-number` |
| Expires | `cc-exp` |
| Security code | `cc-csc` |

`address-level2` is the city. Add `postal-code` and `country-name` where your addresses need them. Before the field name, `shipping` or `billing` says which address a field belongs to, and a `section-` token keeps two addresses of one kind apart: `autocomplete="section-gift shipping address-line1"`.

When the billing address is usually the delivery address, ask once and offer a checkbox for the other case. [3.3.7 Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html) (level A) asks that information given earlier in the same process be filled in or offered to select, and its Understanding document gives that checkbox as an example.

## Delivery choices as radios

A delivery method is one choice among a few, each with a price and a line of detail: a group of radios. Tray UI draws them as choice cards from [Radio Group](#c-radio-group): the native input is stretched over its whole label and made transparent, so the whole card is the target.

```html
<div class="tray-choices tray-choices--two" role="radiogroup" aria-label="How the jars come to you">
  <label class="tray-choice">
    <input type="radio" name="method" value="courier" checked>
    <span class="tray-radio__ring"></span>
    <span class="tray-choice__text"><b>Courier</b><span>Chilled box, to your door</span></span>
    <span class="tray-choice__end">$9</span>
  </label>
  <label class="tray-choice">
    <input type="radio" name="method" value="pickup">
    <span class="tray-radio__ring"></span>
    <span class="tray-choice__text"><b>Farm shop</b><span>Farm road 4, from 10:00</span></span>
    <span class="tray-choice__end">Free</span>
  </label>
</div>
```

Because they are real radios, the browser does the rest: Tab reaches the group at the checked radio, and the arrow keys move the choice and pass over a `disabled` one. The One-page checkout disables a time slot that has gone by, and its second line says "Gone for today". Each radio is named by its whole label: title, detail and price. The group needs a name too: a `<legend>`, or `role="radiogroup"` with a label, as here. The day is a [Toggle Group](#c-toggle-group), the same radios drawn as a segmented control.

### Hidden fields are still sent

The form follows its own choices: the farm shop hides the address and the time slots and makes delivery free, and paying at the door hides the card fields. The `hidden` attribute only hides. In Chromium, after the farm shop is picked in the block, the form's `FormData` still holds the street, the flat, the city and the slot. A `required` field in a hidden group is worse: the form refuses to submit and shows nothing, and Chrome writes "An invalid form control with name='street' is not focusable." in the console.

Disable the group as you hide it: a disabled `<fieldset>` disables every control in it, and disabled controls are neither validated nor submitted. This example is plain HTML, not Tray UI:

```html
<form id="order" action="/order" method="post">
  <fieldset>
    <legend>Delivery</legend>
    <label><input type="radio" name="method" value="courier" data-cost="900" checked> Courier, $9</label>
    <label><input type="radio" name="method" value="pickup" data-cost="0"> Farm shop, free</label>
  </fieldset>
  <fieldset id="address">
    <legend>Address</legend>
    <label for="street">Street and house</label>
    <input id="street" name="street" autocomplete="shipping address-line1" required>
    <label for="postcode">Postcode</label>
    <input id="postcode" name="postcode" autocomplete="shipping postal-code" required>
    <label for="city">City</label>
    <input id="city" name="city" autocomplete="shipping address-level2" required>
  </fieldset>
  <p aria-live="polite" aria-atomic="true">Total <span id="total">$277.00</span></p>
  <button>Pay</button>
</form>
<script>
  const form = document.getElementById('order');
  const address = document.getElementById('address');
  const JARS = 26800; // in cents

  form.addEventListener('change', () => {
    const picked = form.querySelector('[name="method"]:checked');
    address.hidden = address.disabled = picked.value === 'pickup';
    const total = (JARS + Number(picked.dataset.cost)) / 100;
    document.getElementById('total').textContent = '$' + total.toFixed(2);
  });
</script>
```

With the farm shop picked, `method` is the only entry in the form data, and the form is valid with the address empty. The block's script sets `hidden` alone; its fields are not `required`, so it submits, and the server reads `method` to know what to ignore.

## Payment fields

```html
<fieldset>
  <legend class="tray-legend subtitle">Payment</legend>
  <div class="tray-fields" id="card">
    <div class="tray-field tray-field--full">
      <label class="tray-label" for="card-number">Card number</label>
      <input class="tray-input" id="card-number" name="card" inputmode="numeric"
             autocomplete="cc-number" data-tray="mask" data-mask="card">
    </div>
    <div class="tray-field">
      <label class="tray-label" for="card-exp">Expires</label>
      <input class="tray-input" id="card-exp" name="exp" inputmode="numeric"
             autocomplete="cc-exp" placeholder="MM/YY" data-tray="mask" data-mask="expiry">
    </div>
    <div class="tray-field">
      <label class="tray-label" for="card-cvc">Security code</label>
      <input class="tray-input" id="card-cvc" name="cvc" inputmode="numeric"
             autocomplete="cc-csc" aria-describedby="card-cvc-hint">
      <p class="tray-field__hint" id="card-cvc-hint">The three digits on the back of the card.</p>
    </div>
  </div>
</fieldset>
```

- **A text field for digits.** MDN calls `type="number"` "not appropriate for values that happen to only consist of numbers but aren't strictly speaking a number", and names credit card numbers. `inputmode="numeric"` on a text field brings the digit keyboard on a phone without the spin buttons.
- **Formatting while typing.** `data-tray="mask"` groups a card number in fours (`data-mask="card"`) and writes an expiry as MM/YY (`expiry`). It puts the caret back after the digit it followed, so a number corrected in the middle keeps its place. It checks nothing; the server does.
- **The hint.** The line under the security code is tied on with `aria-describedby`, so it is read when the field takes focus.
- **Nothing extra.** [Payment Method](#c-payment-method) adds saved cards, and says not to ask for the name on the card or a billing address unless your payment provider needs them.

## The summary and a total that is read

The summary is a [Checkout Summary](#c-checkout-summary) in the aside: the lines, the total, and the button that pays.

```html
<aside class="tray-with-aside__aside" aria-label="Your order">
  <div class="tray-card tray-summary">
    <h2 class="subtitle">Your order</h2>
    <ul class="tray-summary__lines">
      <li class="tray-summary__line"><span>Snail caviar, 50 g<small>2 &times; $59.00</small></span><span>$118.00</span></li>
      <li class="tray-summary__line"><span>Courier, chilled box<small>Today, 16:00 to 18:00</small></span><span>$9.00</span></li>
    </ul>
    <p class="tray-summary__total" aria-live="polite" aria-atomic="true">
      <span>Total</span><span id="total">$277.00</span>
    </p>
    <button class="tray-btn tray-btn--block" type="submit" form="checkout" id="pay">Pay $277.00</button>
  </div>
</aside>
```

The `<aside>` with a name is a landmark, "Your order". The Pay button sits outside the form and belongs to it through `form="checkout"`, which MDN says associates a button with a form "anywhere in the document". It repeats the amount, and reads "Place the order" when the person pays at the door.

The total is the one live region of the page. `aria-live="polite"` asks a screen reader to read a change when the person is idle, so a new delivery method, quantity or code is followed by the new total, and focus stays where it was. One region is enough: a region on every line would read them all. It has to be in the page before its text changes, so the script changes only the text of `#total`; [Toast notifications that screen readers announce](#a-toast-notifications-screen-readers) explains why.

`aria-atomic` decides how much is read. When no ancestor sets it, MDN says "only the node or nodes of live region content that have been updated are read": "$268.00" alone. With `aria-atomic="true"`, "the entire changed region as a whole will be presented": "Total $268.00". The blocks leave it out; add it, as the example does.

On the Cart, each quantity is the `<output>` of a [Button Group](#c-button-group) stepper. Its implicit role is `status`, and MDN notes that "many browsers implement this element as an aria-live region", so plus is followed by the new quantity, then the total. At zero the line stays and says how to put the jar back. The minus button is disabled there, and if it had focus, focus moves to the group.

### A refused promo code

The promo code is the one field in the Cart's summary. A wrong code gets `aria-invalid="true"` and an error under the field, tied on with `aria-describedby`: "We do not know this code. Check the spelling on the card." It is read when the field takes focus, but focus is on Apply, and the message is not in a live region; as [Field](#c-field) puts it, an error that appears is not announced by itself. Move focus back to the field after a refused code, or say the result in a status as well.

## Before and after Pay

[3.3.4 Error Prevention (Legal, Financial, Data)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html) (level AA) covers pages that make a financial transaction: the submission has to be reversible, checked for input errors with a chance to correct them, or confirmed by "a mechanism … for reviewing, confirming, and correcting information before finalizing the submission". On the One-page checkout every answer is on screen beside the lines and the total, a Change link leads back to the cart, and nothing is charged until Pay. Spread over several steps, a checkout can end with a review of every answer.

[Order placed](#b-checkout-03) follows, with the order number, the delivery window and what happens next. Its copy button says "Copied" or "Copy failed" through a hidden `role="status"`, since a button's own content is not announced as it changes. The offer to keep the details asks for a password with `autocomplete="new-password"`, so the browser can suggest one and save it.

## On a phone

| Width | What changes |
| --- | --- |
| Below 64rem | The summary and its Pay button move under the form, and stop being sticky. |
| Below 56rem | The six cards of Order placed stack in one column. |
| Below 40rem | Paired fields (`tray-fields`) and choice cards (`tray-choices--two`) stand one to a row. |
| Below 34rem | The stepper shows the name of the current step only. |

`type="email"`, `type="tel"` and `inputmode="numeric"` bring the right keyboard. Fields are 56px tall, a choice card is one target from edge to edge, and at 390px the four days still fit one row.

## The checkout in Tray UI

Start from the block for the step you need:

- [Cart](#b-checkout-01): the first step of a checkout in steps, with quantities, a `role="meter"` [Progress](#c-progress) bar towards free delivery, a gift box [Switch](#c-switch), a promo code and the summary.
- [One-page checkout](#b-checkout-02): contact, delivery with a day and a time slot, and payment on one screen beside the summary.
- [Order placed](#b-checkout-03): the confirmation.
- A cart that stays inside the shop's header and footer: [Cart page with product lines](#b-shop-02), or [Cart in a sheet](#b-shop-03).

The blocks' scripts work out the total in the browser for the demo. The amount you charge comes from your server: write it into `#total` and the Pay button.

[Page layouts](#g-layouts) describes `tray-screen` and `tray-with-aside`, and [Installation](#d-installation) has the lines that link the three files.
