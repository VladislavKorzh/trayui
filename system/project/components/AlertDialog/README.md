# Alert Dialog

An alert dialog stops a person before something that cannot be undone, and makes them choose.

## Markup
The Dialog markup with `role="alertdialog"`, `aria-labelledby` and `aria-describedby`:
```html
<dialog class="tray-dialog tray-dialog--sm" role="alertdialog" data-tray="dialog"
        aria-labelledby="del-title" aria-describedby="del-text">
  <div class="tray-dialog__head"><div>
    <h2 class="subtitle" id="del-title">Delete order PL-20418?</h2>
    <p class="tray-dialog__text" id="del-text">The order and its messages are removed for good.</p>
  </div></div>
  <div class="tray-dialog__foot">
    <button class="tray-btn tray-btn--quiet tray-btn--md" type="button" data-close autofocus>Keep the order</button>
    <button class="tray-btn tray-btn--danger tray-btn--md" type="button" data-close value="delete">Delete order</button>
  </div>
</dialog>
```
It differs from a Dialog in three ways: there is no close button in the corner, a click on the veil does not close it, and focus starts on the safe button: give it `autofocus`, as above. (Opened with `data-tray="open"`, a dialog whose markup has none starts there anyway.) Add `data-static` to make Escape do nothing as well, when even leaving needs a choice.

## Writing it
- The title is the question, with the name of the thing: "Delete order PL-20418?".
- The text says what will happen, in one sentence.
- Each button repeats its own outcome: "Keep the order", "Delete order". Never "Yes" and "No".

## Accessibility
It is the browser's own `<dialog>` with `role="alertdialog"`: the title named by `aria-labelledby` is its name, and the sentence named by `aria-describedby` is read after it. Opened with `showModal()`, it makes the page behind it inert. Focus starts on the safe button, `Tab` moves between the buttons, and `Escape` closes the dialog unless it has `data-static`. When it closes, the browser returns focus to the control that opened it. Under `prefers-reduced-motion: reduce` it only fades, in a tenth of a second.

## Do and don't
- Do use it only for what cannot be undone: delete, cancel a paid order, send to many people.
- Do prefer undo: if the action can be reversed, do it and offer "Undo" in a Toast instead.
- Don't use the danger button when nothing is destroyed; use the dark or primary button.
