# Dialog

A dialog asks for one decision or one small task in a panel over the page, and holds the page still until it is done.

## Markup
```html
<button class="tray-btn tray-btn--quiet" data-tray="open" data-target="#day">Change the day</button>

<dialog class="tray-dialog" id="day" data-tray="dialog" aria-labelledby="day-title">
  <div class="tray-dialog__head">
    <div><h2 class="title" id="day-title">Change the delivery day</h2></div>
    <button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" data-close aria-label="Close">…</button>
  </div>
  <div class="tray-dialog__body">…fields…</div>
  <div class="tray-dialog__foot">…Cancel, then the action…</div>
</dialog>
```
It is the browser's own `<dialog>`: opened with `showModal()` it traps focus, closes on Escape and returns focus to the button that opened it. The behaviour adds `data-close` buttons and closing on a click on the veil (`data-static` turns that off), and gives the `data-tray="open"` button `aria-haspopup="dialog"`. To have it open over the page as the page loads, with no button pressed, put `data-open` on the `<dialog>` (not `open`, which shows it in place, with no veil and no trap); the attribute goes when the dialog closes.

## Look
A `raised` panel with 40px corners, card padding and the float shadow, over the `scrim`. Widths: 32rem, `tray-dialog--sm` 26rem, `tray-dialog--lg` 44rem. The title is `title` type. Buttons sit at the end, the action last; on a phone they stack, the action on top.

## Accessibility
The title named by `aria-labelledby` is the dialog's name; tie the sentence under it with `aria-describedby` when it explains the task. Focus starts on the first control inside, which is the close button in the head, so put `autofocus` on the field the person came to fill. The close button is an icon button with `aria-label="Close"`, and the buttons in the foot say what they do. A dialog opened with `data-modal="false"` stays in the page: nothing behind it is inert, and `Escape` does not close it. Under `prefers-reduced-motion: reduce` it only fades, in a tenth of a second.

## Do and don't
- Do keep one task per dialog and one primary button.
- Do label the action with what it does ("Save the day"), never "OK".
- Don't open a dialog from a dialog.
- Don't use a dialog for something that could be a section of the page, or for a message that needs no answer (use a Toast).
- For a choice that destroys something, use Alert Dialog.
