# Skeleton

A skeleton holds the place of content that is loading, in the shape of what will arrive.

## Markup
`<span class="tray-skeleton">` sized with inline `inline-size` and `block-size`, in `track` grey with a slow pulse. Shapes: `tray-skeleton--text` (a line of text, 4px corners), `tray-skeleton--avatar` (48px tile), `tray-skeleton--card` (40px corners). Build the skeleton from the same layout as the loaded content so nothing jumps when it arrives.

Wrap the group in an element with `aria-busy="true"` and a `tray-vh` label such as "Loading orders"; the grey shapes themselves are hidden from assistive technology with `aria-hidden="true"`.

## Skeleton or Spinner
A skeleton is for content with a known shape that takes more than a moment: a list, a card, a table. A Spinner is for an action in progress or a wait of unknown shape.

## Accessibility
The shapes are `aria-hidden` and mean nothing to a screen reader: the `tray-vh` line in the `aria-busy` wrapper is what it reads. Set `aria-busy` to `false`, or take it away, when the content arrives. That line is not a live region, so nothing is announced while the wait goes on: when the wait matters, say it in a `role="status"`. The pulse stops under `prefers-reduced-motion: reduce`, and with forced colours each shape is drawn as an outline.

## Do and don't
- Do show it only after about 300 ms, so fast loads never flash grey.
- Do vary the line widths; identical bars read as a broken layout.
- Don't use it for longer than a few seconds without saying what is happening.
