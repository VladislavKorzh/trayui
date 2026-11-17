---
category: Overlays
keywords: [dialog, modal, popup window, lightbox, overlay, form dialog]
---
# Dialog

A dialog asks for one decision or one small task in a panel over the page, and holds the page still until it is done.

## Use
```tsx
<Dialog
  title="Change the delivery day"
  description="Order PL-20418 is not packed yet, so the day can still move."
  trigger={<Button variant="quiet">Change the day</Button>}       {/* opens it; focus comes back here */}
  footer={<>
    <Button variant="ghost" size="md" data-close>Cancel</Button>
    <Button size="md" data-close onClick={save}>Save the day</Button>   {/* data-close: closes after the click */}
  </>}
>
  <Field label="New day"><Input type="date" /></Field>
</Dialog>

<Dialog open={open} onOpenChange={setOpen} size="sm" title="Leave a note">…</Dialog>   {/* controlled */}
```

## Parts
- `title`: the task in a few words, in `title` type. It names the dialog for screen readers.
- `description`: one or two sentences in soft ink under the title.
- `children`: the body, a grid with 16px gaps for fields.
- `footer`: the buttons at the end, the action last. On a phone they stack, the action on top.
- The close button (an x) sits in the corner of the head; `closeButton={false}` removes it.

## Sizes
`md` 32rem (the default), `sm` 26rem for a short question, `lg` 44rem for a wider form. A small dialog keeps its padding in step with its own width, so two buttons still fit on one line.

## Behaviour
It is the browser's own `<dialog>`, opened with `showModal()`: focus stays inside, the page behind is inert, and focus returns to the trigger on close. Escape, a click on the veil, the close button and any button with `data-close` close it. A `data-close` button whose `onClick` calls `event.preventDefault()` keeps it open, for a value that still needs fixing. `closeOnVeil={false}` stops the veil from closing it when typed work could be lost.

## Pictures
`modal={false}` shows the dialog in place instead of over the page. Put it, open, in a scrim stage to picture it in a preview or a documentation page:
```tsx
<div className="tray-stage tray-stage--scrim">
  <Dialog modal={false} defaultOpen title="Change the delivery day" footer={…}>…</Dialog>
</div>
```

## Do and don't
- Do keep one task per dialog and one primary button.
- Do label the action with what it does ("Save the day"), never "OK".
- Don't open a dialog from a dialog.
- Don't use a dialog for something that could be a section of the page, or for a message that needs no answer; use a toast.
- For a choice that destroys something, use AlertDialog.
