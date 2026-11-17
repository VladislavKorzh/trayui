# Sheet

A sheet is a panel that slides in from the side and keeps the page in view beside it.

## Markup
```html
<dialog class="tray-sheet" id="filters" data-tray="dialog" aria-labelledby="filters-title">
  <div class="tray-dialog__head">
    <div><h2 class="title" id="filters-title">Filters</h2></div>
    <button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" data-close aria-label="Close">…</button>
  </div>
  <div class="tray-dialog__body">…</div>
  <div class="tray-dialog__foot">…</div>
</dialog>
```
It sits on the end side, full height, 26rem wide at most, with 40px corners on its inner edge. `tray-sheet--start` puts it on the start side: use that for navigation (the Sidebar on a phone) and the end side for everything about the current page: filters, details of a row, a cart.

Open it with a `data-tray="open"` button. It is a real modal dialog: focus stays inside, Escape and the veil close it.

## Accessibility
It is the browser's own modal `<dialog>`, named by its title through `aria-labelledby`. `showModal()` moves focus into it and makes the page behind inert, `Escape` closes it, and on close the browser returns focus to the control that opened it. A press on the veil closes it too, unless it has `data-static`. The close button shows only an icon, so it needs its `aria-label`. Under `prefers-reduced-motion: reduce` it fades in, in a tenth of a second, instead of sliding in from its edge.

## Do and don't
- Do keep the title and the close button pinned while the body scrolls.
- Do apply filters as they change when that is cheap, and drop the Apply button.
- Don't use a sheet for a yes or no question; that is an Alert Dialog.
- Don't open a sheet wider than half the screen on a desktop; that is a page.
