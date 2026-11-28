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
The panel is `raised` with the float shadow. `tray-pop` alone is a tight list panel (20px corners, used by menus); add `tray-pop--card` for a 22rem panel with 28px corners and room for text, or `tray-pop--roomy` to keep the natural width. Placement: under the trigger from its start edge; `tray-pop--end` aligns it to the end edge, `tray-pop--top` opens it upward. A panel that does not fit in the window below its trigger, but does above it, opens upward by itself (it carries `data-up` while it does), and the next opening chooses again; one that fits on neither side stays below, where the page can scroll to it. This goes for every `tray-pop`: menus, selects, comboboxes, date pickers and hover cards too. The side is chosen as the panel opens, before focus moves into it, so the page does not jump.

## Popover, Tooltip or Dialog
A Tooltip is one line that names a control and cannot be interacted with. A popover holds controls or a paragraph and does not block the page. A Dialog blocks the page until answered.

## Accessibility
It opens on click and moves focus to the first control inside. A panel of text alone has no control to take focus, so it takes focus itself: the behaviour makes it a `dialog` named by its `tray-pop__title` (or by the trigger) and described by its `tray-pop__text`, so the explanation is read as it opens. `Escape` or a `data-close` button closes it and puts focus back on the trigger, and a click outside or `Tab` out closes it too. The trigger reports `aria-expanded` and points at the panel with `aria-controls`. A panel with controls has no role or name of its own, so its title is read only as text: give each control inside its own name, and an icon-only trigger an `aria-label` ("What is a batch?"). Under `prefers-reduced-motion: reduce` the panel only fades, in a tenth of a second.

## Do and don't
- Do keep it to one small job: share, pick a colour, explain a term.
- Do give it a title when it has more than two controls.
- Don't open one on hover; for hover, see Hover Card.
- Don't put a form with validation in a popover.
