# Input

An input takes one line of text: a grey fill, 16px corners, 56px tall, no stroke.

## Markup
`<input class="tray-input">` inside a Field. The fill follows the ground: grey on the page or a white panel, white on a grey tray. Add `tray-input--sm` (48px) in toolbars and table filters. Set the right `type`, `autocomplete` and `inputmode` so phones show the right keyboard.

## States
- Focus: a 2px `ink` outline on the edge of the field.
- Invalid: `aria-invalid="true"` draws a 2px `danger` ring inside the field; put the reason in `tray-field__error`.
- Disabled keeps the fill at `opacity-disabled`. Read-only sets the value in `ink-soft`.
- The placeholder is `ink-hint`, the lightest text allowed; use it for an example of the format only.

## You provide
A label (see Label), and a sensible width: a field that takes five digits should not span the page.

## Do and don't
- Do set typed values at weight 400 in `control` size.
- Don't add borders or shadows to mark the field; fill alone separates it (the No-Outline Rule).
- Don't use an input for long answers; that is Textarea.
