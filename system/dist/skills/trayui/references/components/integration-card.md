# Integration Card

An integration card stands for one outside service the product can work with: its mark, its name, what connecting it does, and the control that connects it. Also called an app integration card.

## Markup
```html
<div class="tray-integrations">
  <article class="tray-integration">
    <div class="tray-integration__head">
      <span class="tray-integration__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-truck"/></svg></span>
      <label class="tray-switch"><input type="checkbox" role="switch" aria-label="Courier tracking" checked><span class="tray-switch__track"></span></label>
    </div>
    <div class="tray-integration__text">
      <b>Courier tracking</b>
      <p>Shows where each box is and tells the customer.</p>
    </div>
    <div class="tray-integration__foot"><span>On since 2 November</span><a href="/integrations/courier">Settings</a></div>
  </article>
</div>
```
`tray-integrations` is the grid: cards of at least 17rem that fill the row. The control at the end of the head is a Switch for a connection that turns on and off in place, or a small quiet button ("Connect") for one that opens the other service to sign in. The foot says the state in words and links to the integration's own settings.

The mark is the service's own logo when you may use it (an `<img>` in the 48px tile). Otherwise an icon for what the service does.

## Accessibility
Each card is an `<article>`. The switch is a checkbox with `role="switch"`: it is announced as on or off, `Space` flips it, and its `aria-label` is the service's name. "Connect", "Fix" and "Settings" read the same in every card, so their names hold the service too, after the visible word: `aria-label="Connect Chat alerts"` on the button and `aria-label="Settings for Courier tracking"` on the link, as in the example. The mark is decoration beside the name: an icon is `aria-hidden`, a logo `<img>` takes `alt=""`. A failed connection is said in words with an icon, never by the `danger` colour alone.

## Do and don't
- Do say what the person gets, not what the service is: "Sends each paid order to your books".
- Do show a failed connection in the foot in `danger` with a way to fix it.
- Don't draw another company's logo from memory.
- Don't connect on a switch when the service needs a sign-in: use the button.
