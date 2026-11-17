# Uptime

Uptime shows whether a service is working now and how it did over the last 90 days: its state in words, a bar per day, and the share of time it was up.

## Markup
```html
<div class="tray-uptime">
  <div class="tray-uptime__head">
    <span>Order API</span>
    <span class="tray-uptime__state tray-success">
      <svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-circle-check"/></svg>Working
    </span>
  </div>
  <div class="tray-uptime__bars" data-tray="uptime" data-days="90" data-incidents='{"12":"degraded","47":"down"}'></div>
  <div class="tray-uptime__foot"><span>90 days ago</span><span>99.94% up</span><span>Today</span></div>
</div>
```
## Behaviour
`data-tray="uptime"` draws one bar per day, oldest first. `data-incidents` is a JSON object: the key is how many days ago, the value `"degraded"` or `"down"`. The bars are hidden from assistive technology, so the state, the percentage and a list of incidents must be in the text.

A normal day is a quiet grey bar, a slow day a short ink bar, an outage a full ink bar: shape and lightness tell them apart, not hue. Give the row a key with `tray-uptime__key`.

The state takes an icon and a word: `circle-check` "Working", `circle-alert` "Slow", `circle-x` "Down".

## Accessibility
The behaviour sets `aria-hidden="true"` on the bars, so a screen reader reads only the head, the foot and the list of incidents. Nothing in it takes focus. With forced colours the bars keep their own fills, so the days can still be told apart.

## Do and don't
- Do list the incidents under the bars with their date and length.
- Do show the same 90 days for every service on the page.
- Don't colour the bars green and red: a wall of colour hides the two days that matter.
- Don't round 99.94% up to 100%.
