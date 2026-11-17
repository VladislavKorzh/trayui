# Toast

A toast confirms that something just happened, in a small panel at the corner of the screen that leaves by itself.

## Use
```js
TrayUI.toast({ title: 'Order archived', action: { label: 'Undo', onClick: restore } });
TrayUI.toast({ tone: 'success', title: 'Receipt sent', text: 'To dana@example.com' });
TrayUI.toast({ tone: 'danger', title: 'The export failed', text: 'Check the connection and try again.' });
```
| Option | Meaning |
| --- | --- |
| `title` | What happened, in three or four words. |
| `text` | One more line, when needed. |
| `tone` | `'success'` or `'danger'` add an icon in that colour. Leave it out for a neutral toast. |
| `action` | One button: `{ label, onClick }`. "Undo" is the best action a toast can have. |
| `duration` | Milliseconds on screen; default 5000. A danger toast stays until dismissed. |

Toasts stack at the bottom end corner in a `tray-toasts` region; the timer pauses while the pointer or focus is on one. Each is a `raised` row with 16px corners and the float shadow, announced politely (errors at once).

The markup of one toast is a `tray-toast` with an optional icon, a `tray-toast__body` holding `tray-toast__title` and `tray-toast__text`, and `tray-toast__actions`.

A toast rises in and, when it is dismissed or its time is up, sinks out quicker than it came; then it is taken away.

## Toast or Alert
A toast is for what already happened and needs no decision. Something the person must read or act on goes in an Alert in the page, or in a Dialog.

## Do and don't
- Do offer Undo instead of asking "Are you sure?" beforehand.
- Do keep one toast per event, and no more than three on screen.
- Don't put an error about a form field in a toast; put it under the field.
- Don't use a toast for something that takes longer than a glance to read.
