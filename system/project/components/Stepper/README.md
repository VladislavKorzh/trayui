# Stepper

A stepper shows where a person is in a short, fixed sequence: the steps as numbered marks over a bar that fills as they go.

## Markup
```html
<ol class="tray-stepper" aria-label="Checkout" role="list">
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

## Accessibility
The steps are an `<ol>` named by its `aria-label`, with `role="list"`, so each one is read with its place in the list (Safari stops calling a list without markers a list). The current step carries `aria-current="step"` and is solid ink and semibold. A finished one shows a check and says ", done" in a `tray-vh` span, so neither state rests on colour. A finished step that is a link takes focus and the usual ring, and a step ahead is plain text that takes no focus. Below 34rem a row of steps shows the words of the current step only: the others are hidden from the eye, not from a screen reader, so a link to a done step keeps its name. With forced colours the current mark takes the system's colours for a chosen item.

## Do and don't
- Do use it for three to five steps that always come in the same order.
- Do name each step with a noun: "Delivery", "Payment".
- Don't use it for progress whose steps the person does not take: that is Progress.
- Don't let a step be skipped by clicking ahead.

## On a phone
Four names do not fit one row at 390px. With `tray-stepper--fold` the steps that are not current fold to their marks below 34rem and the current one keeps its name.
