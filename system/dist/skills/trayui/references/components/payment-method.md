# Payment Method

Payment method lists the cards on file as choices, marks the one that is charged, and takes a new card in three fields. Also called a credit card form or saved cards.

## Markup
```html
<fieldset>
  <legend class="tray-label">Pay with</legend>
  <div class="tray-choices">
    <label class="tray-choice">
      <input type="radio" name="card" checked>
      <span class="tray-radio__ring"></span>
      <span class="tray-choice__text"><b>Card ending 4242</b><span>Expires 08/27</span></span>
      <span class="tray-choice__end"><span class="tray-badge">Default</span></span>
    </label>
  </div>
</fieldset>

<div class="tray-fields">
  <div class="tray-field tray-field--full">
    <label class="tray-label" for="card-number">Card number</label>
    <input class="tray-input" id="card-number" inputmode="numeric" autocomplete="cc-number" data-tray="mask" data-mask="card">
  </div>
  <div class="tray-field"><label class="tray-label" for="card-exp">Expires</label>
    <input class="tray-input" id="card-exp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" data-tray="mask" data-mask="expiry"></div>
  <div class="tray-field"><label class="tray-label" for="card-cvc">Security code</label>
    <input class="tray-input" id="card-cvc" inputmode="numeric" autocomplete="cc-csc"></div>
</div>
```
## Behaviour
`data-tray="mask"` formats while the person types: `data-mask="card"` groups the digits in fours, `data-mask="expiry"` writes MM/YY. It formats and nothing more: check the number on the server.

The saved cards are Radio Group choices. Name a card by its last four digits; the card network may be named in words ("Visa ending 4242") but is never drawn as a logo you do not hold.

## Accessibility
The saved cards are native radios in a `<fieldset>`: the `<legend>` names the group, the whole row is each radio's label, and the arrow keys move the choice. The focus ring goes round the whole row. A card that cannot be used is `disabled`: it is announced as unavailable, the arrow keys skip it, and its second line says why in words, so `danger` is not the only sign. Each new-card field has its own `<label>` and the `autocomplete` value that lets the browser fill it, and the hint of the security code is tied on with `aria-describedby`. The `mask` behaviour groups the digits as they are typed and puts the caret back after the digit it followed, so a number corrected in the middle keeps its place.

## Do and don't
- Do set `autocomplete` on every card field so the browser can fill them.
- Do say what is wrong with a card in its second line: "Expired in 03/26".
- Don't ask for the name on the card or a billing address unless your payment provider needs them.
- Don't store or show a full card number or a security code anywhere.
