# Scroll Area

A scroll area keeps a long list or a wide row inside a fixed box, with a thin scrollbar in the system's rule colour. Also called a custom scrollbar.

## Markup
`<div class="tray-scroll" tabindex="0" role="region" aria-label="…">`. Set its height with `style="--tray-scroll: 16rem"` (the default). `tray-scroll--x` scrolls sideways and lays its child out on one line: for a row of chips, a tab strip, a wide table.

It is the browser's own scrolling with a styled bar, so touch, wheel, keyboard and find-in-page all work. The area needs `tabindex="0"` and a label so a keyboard can reach and scroll it.

## Accessibility
With `tabindex="0"`, `role="region"` and an `aria-label`, the area is a named region that `Tab` can reach and a screen reader can list. Once it has focus, the arrow keys, `PageUp`, `PageDown`, `Home` and `End` scroll it, as in any scrolling box of the browser, and focus draws the 3px ink ring round it. Name it after what it holds ("Pickup points"), not "Scroll area".

## Do and don't
- Do use it inside floating panels and sidebars, where the outer page must not grow.
- Do leave the last item partly visible, so it is clear there is more.
- Don't nest a scroll area in another that scrolls the same way.
- Don't put the page's main content in one; let the page scroll.
