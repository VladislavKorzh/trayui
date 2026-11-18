# Textarea

A textarea takes several lines of text, in the same fill and corners as an input. Also called a multi-line text input.

## Markup
`<textarea class="tray-textarea" rows="4">` inside a Field. It grows by the handle in the corner, vertically only. For a limit, set `maxlength`, add `data-tray="count"`, and put `<span class="tray-field__count">` in the field's `tray-field__foot`: it shows "42 / 280" as the person types.

## You provide
A label that says what to write, and `rows` matched to the expected answer: two for a courier note, six for a review.

## Accessibility
It is the browser's own `<textarea>`, named by the Field's `<label for>`. Tie the hint, the error and the count to it with `aria-describedby`, and set `aria-invalid="true"` while the error shows, which also draws a 2px `danger` edge. Tied that way, the count is read when the field takes focus, as the preview shows with `aria-describedby="t1h t1c"`. It is not a live region, so it is not read as each letter is typed. Focus draws the 2px ink field ring on the edge, and an invalid textarea keeps its `danger` edge inside that ring.

## Do and don't
- Do keep the hint to one line under the field.
- Don't stop typing at the limit without showing the count.
- Don't use a textarea where one line is enough.
