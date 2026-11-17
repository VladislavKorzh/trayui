---
category: Feedback
keywords: [toast, snackbar, notification, flash message, undo, confirmation message]
---
# Toast

A toast confirms that something just happened, in a small panel at the corner of the screen that leaves by itself.

## Use
```tsx
import { toast, Toast } from 'trayui-react';

toast({ title: 'Order archived', action: { label: 'Undo', onClick: restore } });
toast({ tone: 'success', title: 'Receipt sent', text: 'To dana@example.com' });
toast({ tone: 'danger', title: 'The export failed', text: 'Check the connection and try again.' });
const shown = toast({ title: 'Saving the order', duration: 0 });   // stays; shown.dismiss() takes it away

<Toast tone="success" title="Receipt sent" text="To dana@example.com" onDismiss={hide} />   {/* the same panel, in place */}
```

## toast() or Toast
`toast(options)` is the usual way: it calls the system's own toast, which stacks toasts at the bottom end corner in a `tray-toasts` region, leaves after 5 seconds (a danger toast stays until dismissed), and pauses its timer while the pointer or focus is on it. It returns `{ dismiss() }`. Its `title` and `text` are plain strings.

The `Toast` component draws the same panel in place: for a picture in a preview or a documentation page, or for a region whose toasts you keep in your own state. It does not leave by itself; `onDismiss` runs on its x button.

## Options
- `title`: what happened, in three or four words.
- `text`: one more line, when needed.
- `tone`: `'success'` or `'danger'` add an icon in that colour; `'neutral'` (the default) has none. A danger toast is announced at once, the others politely.
- `action`: one button, `{ label, onClick }`. "Undo" is the best action a toast can have.
- `duration` (toast() only): milliseconds on screen; 0 keeps it until dismissed.

## Toast or Alert
A toast is for what already happened and needs no decision. Something the person must read or act on goes in an Alert in the page, or in a Dialog.

## Do and don't
- Do offer Undo instead of asking "Are you sure?" beforehand.
- Do keep one toast per event, and no more than three on screen.
- Don't put an error about a form field in a toast; put it under the field.
- Don't use a toast for something that takes longer than a glance to read.
