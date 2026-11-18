# Tabs

Tabs switch between views of the same thing: a tray strip of 44px tabs, the current one in solid ink.

## Two uses
**Panels in place.** The tabs show and hide panels on the same page.
```html
<div data-tray="tabs">
  <div class="tray-tabs" role="tablist" aria-label="Order">
    <button class="tray-tab" type="button" role="tab" aria-selected="true" aria-controls="p-items" id="t-items">Items</button>
    <button class="tray-tab" type="button" role="tab" aria-controls="p-delivery" id="t-delivery">Delivery</button>
  </div>
  <div class="tray-tabpanel" role="tabpanel" id="p-items" aria-labelledby="t-items">…</div>
  <div class="tray-tabpanel" role="tabpanel" id="p-delivery" aria-labelledby="t-delivery" hidden>…</div>
</div>
```
The wrapper fires `tray:change` with `detail.tab` (the chosen tab's `id`) when a tab is chosen; the tab shown at load fires nothing. Keep `type="button"` on the tabs, so one inside a form does not send it.

**Navigation.** The tabs are links to pages or to sections of a long page: `<nav class="tray-tabs">` holding `<a class="tray-tab">`, the current one marked `aria-current="page"` (or `"true"` for a section that follows the scroll; `"false"`, or no attribute, on the others). No script needed.

## Details
- Hover turns a tab the colour of the ground behind the strip.
- `tray-tabs--fill` spreads the tabs across the full width.
- A tab may carry a `tray-badge tray-badge--count`.
- A strip that may not fit takes `data-tray="strip"`: it scrolls sideways, and fades over its last 56px while tabs run past the end.

- The ink pill of the chosen tab slides to the next one chosen, and a panel chosen by a press fades in; a strip of links follows its `aria-current` the same way.

## Accessibility
- Panels in place are a `tablist` of `tab` buttons, each tied to its `tabpanel` by `aria-controls` and `aria-labelledby`.
- The chosen tab carries `aria-selected="true"` and is the only one in the `Tab` order, so `Tab` goes from it into its panel. Give a panel `tabindex="0"` when it holds no control.
- `ArrowLeft` and `ArrowRight` move to the next tab and show its panel at once (the other way round on a right-to-left page), `Home` and `End` jump to the ends, and a `disabled` tab is passed over.
- Navigation tabs are links in a `<nav>` with an `aria-label`, the current one marked by `aria-current`, and `Tab` moves through them.
- Focus draws the ring inside the tab. The chosen tab is solid ink, and with forced colours it takes the system's colours for a chosen item. Under `prefers-reduced-motion: reduce` the pill moves at once and the panel appears without fading.

## Do and don't
- Do keep labels to one or two words, and two to seven tabs.
- Do keep the same strip in the same place on every view it leads to.
- Don't use tabs for steps that must be done in order; use the steps bar of Progress.
- Don't nest a strip inside a panel of another strip.
