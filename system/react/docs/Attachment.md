---
category: Conversation
keywords: [attachment, file, upload, image, document, file chip, paperclip]
---
# Attachment

An attachment is a file or an image that travels with a message: a small tray with a tile, a name and one line about it.

## Use
```tsx
<div className="tray-attachments">                        {/* several in a wrapping row */}
  <Attachment name="receipt-20418.pdf" meta="PDF, 84 KB" href="/files/receipt.pdf" action="download" />
  <Attachment name="gate-photo.jpg" icon="image" progress={42} onAction={cancel} />          {/* uploading */}
  <Attachment name="batch-autumn.xlsx" error="Too large. The limit is 10 MB." onAction={retry} />
  <Attachment variant="image" name="bed-a-night.jpg" meta="JPEG, 1.2 MB" src={thumb} href={full} />
</div>
```

The link covers the whole tray, so the card opens the file anywhere it is pressed, while the button inside it stays separately clickable. `variant="image"` stacks a 4 to 3 thumbnail over the name.

## States
- Uploading: `progress` (0 to 100) draws a thin bar under the meta line and writes "Uploading, 42%". The button is Cancel.
- Failed: `error` turns the meta line danger and says why. The button is Retry.
- Sent: name and size; `action="download"` in a thread, `action="remove"` in a composer.

The button's label names the file for screen readers ("Remove receipt-20418.pdf"); `onAction` is called when it is pressed.

## In a message
Put the `tray-attachments` row in the Message's children, after the text. It sits in the message's column, beside the bubble, never inside it.

## Do and don't
- Do show the real file name, shortened in the middle if it is long, and its type and size.
- Don't show a spinner alone for an upload; show how far it is.
- Don't open a file in place of the conversation; open it in a new view the person can leave.
