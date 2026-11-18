# Modal dialogs in plain HTML: focus and Escape

The dialog element and showModal(): the top layer, an inert page, Escape, focus on open and on close, a name, the backdrop, scroll lock and alert dialogs.

A modal dialog asks for one decision or one small task, and holds the page still until it is done. HTML has an element for it, `<dialog>`, and one method, `showModal()`, does most of what the WAI-ARIA Authoring Practices Guide (APG) asks of a [modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Below is what the browser gives and what is left to your script, with Tray UI's [Dialog](#c-dialog) as the worked example.

## What showModal() does

Open a `<dialog>` with `showModal()` and the browser:

- puts it in the top layer, above every `z-index` of the page, wherever the element sits in the markup;
- draws a `::backdrop` behind it, the size of the window;
- makes the rest of the page inert: MDN's page on `inert` says such content cannot be clicked or focused, is not found by find-in-page, and is "excluded from the accessibility tree";
- exposes the element as a dialog with `aria-modal="true"` implied;
- moves focus into it;
- closes it on Escape, after a `cancel` event;
- and, when it closes, returns focus to the element that had it before.

In a dialog built from a `div`, each of these is code you write and maintain. `show()` and the `open` attribute make a non-modal dialog instead: the page stays usable, there is no backdrop, and Escape does nothing.

## The markup

```html
<button type="button" id="open-note">Leave a note</button>

<dialog id="note" aria-labelledby="note-title" aria-describedby="note-text">
  <h2 id="note-title">Leave a note</h2>
  <p id="note-text">The courier sees it on the delivery slip.</p>
  <form method="dialog">
    <label for="note-body">For the courier</label>
    <textarea id="note-body" name="body" rows="3" autofocus></textarea>
    <button value="cancel">Cancel</button>
    <button value="save">Save the note</button>
  </form>
</dialog>
```

```js
const dialog = document.getElementById('note');
document.getElementById('open-note').addEventListener('click', () => dialog.showModal());

dialog.addEventListener('close', () => {
  if (dialog.returnValue === 'save') saveNote(dialog.querySelector('textarea').value);
  dialog.returnValue = '';
});
```

- **A name.** `aria-labelledby` points at the heading, so the dialog is called "Leave a note". `aria-describedby` adds the sentence under it; keep it for a short sentence, never a whole form.
- **No extra roles.** The element is already a dialog. Leave out `role="dialog"` and `aria-modal`, and never put `tabindex` on the `<dialog>`: MDN says it "must not be used" there.
- **Buttons that close it.** A button in a `<form method="dialog">` closes the dialog and puts its `value` in `dialog.returnValue`, which a `close` listener reads. Escape brings no value of its own (Chrome 157 empties it), and `close()` without an argument keeps the last one, so reset it after reading.

A button can open the dialog with no script: `<button type="button" commandfor="note" command="show-modal">`. MDN lists these invoker commands from Chrome 135, Firefox 144 and Safari 26.2. Keep the click handler for older browsers.

## Focus when it opens

The HTML standard decides where focus lands: on the dialog if it has `autofocus`, otherwise on the first element inside with `autofocus`, otherwise on the first element inside that can take focus, and failing those, on the dialog itself.

The first focusable element is often the close button in the corner. That is safe, and rarely useful. Choose the place with `autofocus`, following MDN and the APG:

- **A form:** the first field, as above.
- **A long text:** its start. The APG suggests a static element at the top with `tabindex="-1"`; MDN suggests `autofocus` on the `<dialog>` itself.
- **A step that is hard to undo:** the least destructive button, as in the alert dialog below.

Inside, Tab and Shift+Tab move between the dialog's controls, and focus never lands on the inert page, so no focus trap of your own is needed.

## Focus when it closes

When `showModal()` runs, the browser records the element that has focus: the standard calls it the dialog's "previously focused element". When a modal dialog closes, by Escape, by a form button or by `close()`, the browser focuses that element again. The APG asks for the same thing: focus goes back to the control that opened the dialog.

Its exception is the case left to you: the opener is gone. A dialog that deletes the row whose button opened it hands focus to an element that no longer exists, and focus falls to the body. The `close` event fires after the browser has tried, so a listener can put focus somewhere that makes sense, such as the next row:

```js
let opener = null;
function openDialog() {
  opener = document.activeElement;
  dialog.showModal();
}

dialog.addEventListener('close', () => {
  if (opener && !opener.isConnected) document.querySelector('#orders button')?.focus();
});
```

## Escape and the cancel event

Escape is a close request. The dialog fires `cancel`, then closes unless a listener calls `preventDefault()`. That listener is the place to ask "Discard the note?" when the field is not empty.

- **Escape inside the dialog.** A control that uses Escape itself, such as a menu or a combobox, calls `preventDefault()` on that `keydown`. That cancels the close request: the menu closes and the dialog stays. Tray UI's menus do this, as [How to build an accessible dropdown menu](#a-accessible-dropdown-menu) describes, and so does a tooltip that Escape hides.
- **No trap.** The standard makes `cancel` cancelable only while the page has a fresh user activation, "for abuse prevention purposes", so that a person who presses Escape again and again gets out. In Chrome 157, a dialog opened with one click and kept open by its `cancel` listener closed on the third press of Escape, whatever was clicked or pressed between the presses: the third `cancel` could not be cancelled. Treat Escape as a way out that always works in the end.

## Closing on the backdrop

A click on the backdrop is not a close request, and by default it does nothing. The `closedby` attribute changes that: `closedby="any"` closes a modal dialog on a click outside it as well as on Escape. MDN lists it in Chrome 134 and Firefox 141, and in Safari from 27.3, still a beta in November 2026.

Elsewhere it takes a script. A click on the backdrop reaches the `<dialog>` as its target, and so does a click on the dialog's own padding, so test where the pointer is:

```js
function outside(e) {
  const r = dialog.getBoundingClientRect();
  return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
}

let pressedOutside = false;
dialog.addEventListener('pointerdown', (e) => {
  pressedOutside = e.target === dialog && outside(e);
});
dialog.addEventListener('click', (e) => {
  if (e.target === dialog && pressedOutside && outside(e)) dialog.close();
  pressedOutside = false;
});
```

The press has to start on the backdrop as well. A person who selects text in a field and lets go of the button past the dialog's edge produces a click on the `<dialog>`, and should not lose what they typed. This is the rule of Tray UI's dialog behaviour, and the code above is a shorter form of it.

Closing on the backdrop suits a dialog that is easy to open again, such as a note or a sheet of filters. Leave it off a form that holds work, and off every alert dialog. Keep a visible close button either way.

## Keeping the page still

Inert stops clicks and focus, and leaves scrolling alone. With the pointer over the backdrop, the wheel scrolls the page behind; a scroll inside the dialog that reaches its end carries on into the page. Two rules stop both:

```css
dialog:modal { overscroll-behavior: contain; }
dialog::backdrop { overflow: hidden; overscroll-behavior: contain; }
```

`overscroll-behavior: contain` keeps a scroll from passing on to the page. The backdrop needs `overflow: hidden` to become a scroll container, without which the property does nothing there. A container with nothing to scroll honours `overscroll-behavior` from Chrome 144 and Firefox 150. In Safari, MDN notes, the property "has no effect on scroll containers that have no scrollable overflow", so the page can still move behind a short dialog.

The older lock is `overflow: hidden` on the root while a modal is open, `:root:has(dialog:modal) { overflow: hidden; }`, which works wherever `:has()` does. It takes the page's scrollbar away: in Chrome with classic scrollbars, the page grew 15 pixels wider as the dialog opened, which moves centred content sideways, until `scrollbar-gutter: stable` on the root kept the space.

## An alert dialog

An alert dialog stops a person before something that cannot be undone, and makes them choose. It is the same element with `role="alertdialog"`, the one other role MDN allows on a `<dialog>`. The APG asks for a name from the title and a description, by `aria-describedby`, from the message.

```html
<dialog role="alertdialog" aria-labelledby="del-title" aria-describedby="del-text">
  <h2 id="del-title">Delete order PL-20418?</h2>
  <p id="del-text">The order and its messages are removed for good.</p>
  <form method="dialog">
    <button value="keep" autofocus>Keep the order</button>
    <button value="delete">Delete order</button>
  </form>
</dialog>
```

- **Focus on the safe button.** For "the final step in a process that is not easily reversible", the APG says "it may be advisable to set focus on the least destructive action".
- **No closing on the backdrop.** A stray click should not decide.
- **Escape closes it.** That is the same outcome as the safe button.
- **Buttons that say their outcome.** "Keep the order" and "Delete order", never "Yes" and "No".

Chrome's accessibility tree shows this dialog as an `alertdialog` named "Delete order PL-20418?", described by its sentence and marked modal; while it is open, its two buttons are the only buttons left in the tree.

## Dialogs in Tray UI

Tray UI's [Dialog](#c-dialog), [Alert Dialog](#c-alert-dialog), [Sheet](#c-sheet) and [Drawer](#c-drawer) are `<dialog>` elements with `data-tray="dialog"`, opened by a button with `data-tray="open"`:

```html
<button class="tray-btn tray-btn--quiet" type="button" data-tray="open" data-target="#day">Change the day</button>

<dialog class="tray-dialog" id="day" data-tray="dialog" aria-labelledby="day-title">
  <div class="tray-dialog__head">
    <div><h2 class="title" id="day-title">Change the delivery day</h2></div>
    <button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-close aria-label="Close">…</button>
  </div>
  <div class="tray-dialog__body">…fields…</div>
  <div class="tray-dialog__foot">
    <button class="tray-btn tray-btn--ghost tray-btn--md" type="button" data-close>Cancel</button>
    <button class="tray-btn tray-btn--md" type="button" data-close value="save">Save the day</button>
  </div>
</dialog>
```

- The open button calls `showModal()`. With `data-modal="false"` it calls `show()`, and the dialog stays in the page, with nothing inert.
- A `data-close` button closes the dialog and gives its `value` as `returnValue`, for your `close` listener.
- A press and a release both on the veil close it, unless the dialog has `data-static` or is an alert dialog.
- The stylesheet holds the two scroll rules above for the dialog, the sheet and the drawer.
- Focus starts on the first control, the close button in the head, so put `autofocus` on the field the person came to fill. An alert dialog opened by `data-tray="open"` without `autofocus` in its markup starts on its first `data-close` button that is not a danger button.
- `data-static` on an alert dialog makes Escape slower, not impossible: in Chrome 157 the first two presses do nothing and the third closes it, with an empty `returnValue`, so treat that as the safe choice.

A dialog rises in and sinks out, and a sheet or a drawer slides from its edge. Where a browser cannot keep the dialog in the top layer while it leaves, the behaviour waits for the exit transition and closes the dialog afterwards. Under `prefers-reduced-motion: reduce` they only fade, in a tenth of a second.

Link the three files from [Installation](#d-installation), and call `TrayUI.init(root)` for markup added after the page has loaded. The [Accessibility](#g-accessibility) guide has the rules every overlay follows.
