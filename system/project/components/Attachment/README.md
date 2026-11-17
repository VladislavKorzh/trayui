# Attachment

An attachment is a file or an image that travels with a message: a small tray with a tile, a name and one line about it.

## Markup
```html
<div class="tray-attachment">
  <span class="tray-attachment__media">…file icon, or an <img>…</span>
  <span class="tray-attachment__body">
    <a class="tray-attachment__link tray-attachment__name" href="/files/receipt.pdf">receipt-20418.pdf</a>
    <span class="tray-attachment__meta">PDF, 84 KB</span>
  </span>
  <button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" aria-label="Remove receipt-20418.pdf">…</button>
</div>
```
The link covers the whole tray, so the card opens the file anywhere it is pressed, while a button inside it stays separately clickable. `tray-attachment--image` stacks a 4 to 3 thumbnail over the name. `tray-attachments` lays several out in a wrapping row.

## States
| State | Markup |
| --- | --- |
| Uploading | A `tray-progress__bar` under the meta line, with its percentage in the meta ("Uploading, 42%"). |
| Failed | `data-state="error"` on the attachment: the meta line turns `danger` and says why; the button becomes Retry. |
| Sent | Name and size; the button is Download in a thread, Remove in a composer. |

## Accessibility
The file name is a link that covers the tray, so the name is what a screen reader hears for it, and the type and size in the meta line follow in reading order. The tile is decoration: keep its icon `aria-hidden`, and give an `<img>` in it `alt=""`, since the name is written beside it. While a file uploads, its `tray-progress__bar` takes `role="progressbar"`, an `aria-label` and an `aria-valuenow` kept up to date. A failed file says why in words in the meta line, and the `danger` colour only repeats it.

## Do and don't
- Do show the real file name, shortened in the middle if it is long, and its type and size.
- Do give the remove and retry buttons labels that name the file.
- Don't show a spinner alone for an upload; show how far it is.
- Don't open a file in place of the conversation; open it in a new view the person can leave.
