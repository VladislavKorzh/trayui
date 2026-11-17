# Popover

A popover is a small panel that opens beside the button that asked for it, for a few controls or a short explanation.

## Markup
```html
<span class="tray-anchor" data-tray="popover">
  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">Share</button>
  <div class="tray-pop tray-pop--card">
    <p class="tray-pop__title">Share this note</p>
    <p class="tray-pop__text">Anyone with the link can read it.</p>
    …
  </div>
</span>
```
The panel is `raised` with the float shadow. `tray-pop` alone is a tight list panel (20px corners, used by menus); add `tray-pop--card` for a 22rem panel with 28px corners and room for text, or `tray-pop--roomy` to keep the natural width. Placement: under the trigger from its start edge; `tray-pop--end` aligns it to the end edge, `tray-pop--top` opens it upward.

It opens on click, moves focus to the first control inside, and closes on Escape, on a click outside, or on a `data-close` button; focus returns to the trigger.

## Popover, Tooltip or Dialog
A Tooltip is one line that names a control and cannot be interacted with. A popover holds controls or a paragraph and does not block the page. A Dialog blocks the page until answered.

## Do and don't
- Do keep it to one small job: share, pick a colour, explain a term.
- Do give it a title when it has more than two controls.
- Don't open one on hover; for hover, see Hover Card.
- Don't put a form with validation in a popover.
