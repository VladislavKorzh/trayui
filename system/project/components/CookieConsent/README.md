# Cookie Consent

Cookie consent is a raised panel in the corner of the first visit: what is stored and why, and three equal ways to answer.

## Markup
```html
<section class="tray-consent tray-consent--fixed tray-raised" data-tray="consent" aria-labelledby="consent-title">
  <h2 class="nav" id="consent-title">Cookies</h2>
  <p class="tray-consent__text">We keep you signed in with one cookie. With your leave, two more tell us which pages help.</p>
  <details class="tray-collapsible">
    <summary>Choose which</summary>
    <div class="tray-collapsible__body">
      <label class="tray-switch tray-switch--row">… <input type="checkbox" role="switch" name="necessary" checked disabled> …</label>
      <label class="tray-switch tray-switch--row">… <input type="checkbox" role="switch" name="statistics"> …</label>
    </div>
  </details>
  <div class="tray-consent__actions">
    <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-consent="necessary">Only necessary</button>
    <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-consent="all">Accept all</button>
    <button class="tray-btn tray-btn--link" type="button" data-consent="save">Save my choice</button>
  </div>
</section>
```
## Behaviour
`data-tray="consent"`: a button with `data-consent="all"` checks every box, `"necessary"` clears every box that is not disabled, `"save"` keeps them as set. Each closes the panel and fires `tray:complete` with `{ choice }`, an object of each checkbox `name` and whether it is on. Store the choice there and load nothing optional before it.

`tray-consent--fixed` pins the panel to the bottom start corner over the page. Without it the panel sits in the flow, for a settings page.

## Accessibility
It is a `<section>` named by its heading through `aria-labelledby`, so a screen reader lists it as a region called "Cookies". It does not hold focus or block the page, so put it early in the document, where `Tab` reaches it before the content it floats over. Each kind is an `<input type="checkbox" role="switch">` in its `<label>`, announced as on or off, and the necessary one is `disabled` and stays on. The three answers are buttons whose words say the outcome.

## Do and don't
- Do give "Only necessary" and "Accept all" the same weight: both quiet, the same size.
- Do say what each kind is for in one line.
- Don't use a yellow button here. Consent is not something to steer.
- Don't block the page behind the panel.
