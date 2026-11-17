# Tabs

Tabs switch between views of the same thing: a tray strip of 44px tabs, the current one in solid ink.

## Two uses
**Panels in place.** The tabs show and hide panels on the same page.
```html
<div data-tray="tabs">
  <div class="tray-tabs" role="tablist" aria-label="Order">
    <button class="tray-tab" role="tab" aria-selected="true" aria-controls="p-items" id="t-items">Items</button>
    <button class="tray-tab" role="tab" aria-controls="p-delivery" id="t-delivery">Delivery</button>
  </div>
  <div class="tray-tabpanel" role="tabpanel" id="p-items" aria-labelledby="t-items">…</div>
  <div class="tray-tabpanel" role="tabpanel" id="p-delivery" aria-labelledby="t-delivery" hidden>…</div>
</div>
```
The left and right arrows move between tabs, Home and End jump to the ends, and the panel follows. The wrapper fires `tray:change`.

**Navigation.** The tabs are links to pages or to sections of a long page: `<nav class="tray-tabs">` holding `<a class="tray-tab">`, the current one marked `aria-current="page"` (or `"true"` for a section that follows the scroll). No script needed.

## Details
- Hover turns a tab the colour of the ground behind the strip; focus draws the ring inside the tab.
- `tray-tabs--fill` spreads the tabs across the full width.
- A tab may carry a `tray-badge tray-badge--count`.
- A strip that may not fit takes `data-tray="strip"`: it scrolls sideways, and fades over its last 56px while tabs run past the end.

- The ink pill of the chosen tab slides to the next one chosen, and a panel chosen by a press fades in; a strip of links follows its `aria-current` the same way.

## Do and don't
- Do keep labels to one or two words, and two to seven tabs.
- Do keep the same strip in the same place on every view it leads to.
- Don't use tabs for steps that must be done in order; use the steps bar of Progress.
- Don't nest a strip inside a panel of another strip.
