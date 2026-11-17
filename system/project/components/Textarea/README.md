# Textarea

A textarea takes several lines of text, in the same fill and corners as an input.

## Markup
`<textarea class="tray-textarea" rows="4">` inside a Field. It grows by the handle in the corner, vertically only. For a limit, set `maxlength`, add `data-tray="count"`, and put `<span class="tray-field__count">` in the field's `tray-field__foot`: it shows "42 / 280" as the person types.

## You provide
A label that says what to write, and `rows` matched to the expected answer: two for a courier note, six for a review.

## Do and don't
- Do keep the hint to one line under the field.
- Don't stop typing at the limit without showing the count.
- Don't use a textarea where one line is enough.
