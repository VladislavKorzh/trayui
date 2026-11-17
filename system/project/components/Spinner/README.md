# Spinner

A spinner says that something is in progress and its length is unknown.

## Markup
`<span class="tray-spinner" aria-hidden="true"></span>`: a 20px open ring in the text colour, 2px thick like the icons. Sizes: `tray-spinner--sm` 16px, `tray-spinner--lg` 32px. Always pair it with words: `tray-loading` sets a spinner and a short sentence in a row, with `role="status"` so it is announced.

Inside a Button, put the spinner before the label and set `aria-busy="true"` on the button.

## Do and don't
- Do say what is happening: "Sending the order", not "Loading".
- Do switch to a Progress bar once the length is known.
- Don't cover the whole page with a spinner; load the part that changes.
- Under reduced motion the ring turns slowly instead of stopping, so it still reads as activity.
