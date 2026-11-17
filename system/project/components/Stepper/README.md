# Stepper

A stepper shows where a person is in a short, fixed sequence: the steps as numbered marks over a bar that fills as they go.

## Markup
```html
<ol class="tray-stepper" aria-label="Checkout">
  <li data-done><a class="tray-step" href="/cart">
    <span class="tray-step__mark"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-check"/></svg></span>
    <span class="tray-step__text">Cart<span class="tray-vh">, done</span></span>
  </a></li>
  <li aria-current="step"><span class="tray-step">
    <span class="tray-step__mark"></span>
    <span class="tray-step__text">Delivery</span>
  </span></li>
  <li><span class="tray-step"><span class="tray-step__mark"></span><span class="tray-step__text">Payment</span></span></li>
</ol>
```
An empty `tray-step__mark` shows the step's number by itself. A finished step carries `data-done` and a check in its mark; the current one carries `aria-current="step"` and turns solid ink. A finished step may be a link back; a step ahead never is.

`tray-stepper--v` stacks the steps with a line between the marks, for a side column. A `<small>` inside `tray-step__text` adds a second line there.

Below 34rem a horizontal stepper keeps the marks and shows the label of the current step only.

## Do and don't
- Do use it for three to five steps that always come in the same order.
- Do name each step with a noun: "Delivery", "Payment".
- Don't use it for progress whose steps the person does not take: that is Progress.
- Don't let a step be skipped by clicking ahead.

## On a phone
Four names do not fit one row at 390px. With `tray-stepper--fold` the steps that are not current fold to their marks below 34rem and the current one keeps its name.
