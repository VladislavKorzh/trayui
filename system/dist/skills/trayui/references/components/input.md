# Input

An input takes one line of text: a grey fill, 16px corners, 56px tall, no stroke. Also called a text field or a text box.

## Markup
`<input class="tray-input">` inside a Field. The fill follows the ground: grey on the page or a white panel, white on a grey tray. Add `tray-input--sm` (48px) in toolbars and table filters. Set the right `type`, `autocomplete` and `inputmode` so phones show the right keyboard.

## States
- Focus: a 2px `ink` outline on the edge of the field.
- Invalid: `aria-invalid="true"` draws a 2px `danger` ring inside the field; put the reason in `tray-field__error`. With focus it keeps that ring inside and draws the focus outline on the edge as well.
- Disabled keeps the fill at `opacity-disabled`. Read-only sets the value in `ink-soft`.
- The placeholder is `ink-hint`, the lightest text allowed; use it for an example of the format only.

## You provide
A label (see Label), and a sensible width: a field that takes five digits should not span the page.

## Accessibility
It is the browser's own `<input>`, so its role and keys come with the `type` you set. Its name comes from the `<label for>` of its Field, never from the placeholder. `aria-invalid="true"` is announced as invalid, and `aria-describedby` on the error has the reason read with it; an invalid field with focus still shows the focus ring. `disabled` takes the field out of the `Tab` order, while `readonly` keeps it focusable and is announced as read-only. The right `autocomplete` lets the browser fill the field for the person.

## Do and don't
- Do set typed values at weight 400 in `control` size.
- Don't add borders or shadows to mark the field; fill alone separates it (the No-Outline Rule).
- Don't use an input for long answers; that is Textarea.
