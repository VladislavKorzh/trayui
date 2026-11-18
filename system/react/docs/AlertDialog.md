---
category: Overlays
keywords: [alert dialog, confirm, confirmation, are you sure, destructive, delete dialog]
---
# Alert Dialog

An alert dialog stops a person before something that cannot be undone, and makes them choose.

## Use
```tsx
<AlertDialog
  trigger={<Button variant="danger" size="sm">Delete order</Button>}
  title="Delete order PL-20418?"                                  {/* the question, with the thing's name */}
  description="The order and its messages are removed for good."  {/* what will happen, in one sentence */}
  cancelLabel="Keep the order"
  confirmLabel="Delete order"
  onConfirm={() => deleteOrder('PL-20418')}
/>

<AlertDialog confirmVariant="dark" title="Send 214 receipts?" cancelLabel="Not now" confirmLabel="Send 214 receipts" … />  {/* nothing destroyed */}
<AlertDialog open={asking} onOpenChange={setAsking} … />                                                                {/* controlled */}
```

## How it differs from a Dialog
- There is no close button in the corner, and a click on the veil never closes it.
- Focus starts on the safe button, which comes first.
- It carries `role="alertdialog"`, and the description is read out with the title.
- `closeOnEscape={false}` makes Escape slower as well, when even leaving needs a choice: the first presses of Escape do nothing. A browser lets a page refuse a close request only a few times, so Escape is not stopped for ever: in Chrome the third press closes the dialog, whatever was clicked or pressed between, and that close counts as the safe choice (`onCancel` runs).

Both buttons close it. `onConfirm` runs on the action button; `onCancel` runs on the safe button and on Escape.

## Writing it
- The title is the question, with the name of the thing: "Delete order PL-20418?".
- The text says what will happen, in one sentence.
- Each button repeats its own outcome: "Keep the order", "Delete order". Never "Yes" and "No".

## Pictures
`modal={false}` with `defaultOpen` shows it in place: put it in `<div className="tray-stage tray-stage--scrim">` for a preview or a documentation page.

## Do and don't
- Do use it only for what cannot be undone: delete, cancel a paid order, send to many people.
- Do prefer undo: if the action can be reversed, do it and offer "Undo" in a toast instead.
- Don't use the danger button when nothing is destroyed; pass `confirmVariant="dark"` or `"primary"`.
