# Drawer

A drawer is a panel that rises from the bottom edge: the dialog of a phone.

## Markup
```html
<dialog class="tray-drawer" id="add" data-tray="dialog" aria-labelledby="add-title">
  <span class="tray-drawer__grip" aria-hidden="true"></span>
  <h2 class="title" id="add-title">Add to the order</h2>
  …content…
  <div class="tray-dialog__foot">…buttons…</div>
</dialog>
```
Open it with a `data-tray="open"` button, like a Dialog. It is pinned to the bottom, at most 40rem wide and 85% of the screen tall, with 40px corners on its top edge and a short grip that hints it can be dismissed. It scrolls inside when its content is long.

## Drawer, Sheet or Dialog
- Drawer: a short task on a phone, where the thumb is. On a desktop the same task is usually a Dialog; switch at 40rem.
- Sheet: a panel from the side that keeps the page visible beside it, on wider screens.
- Dialog: a decision in the middle of the screen.

## Do and don't
- Do keep the action at the bottom of the drawer, full width.
- Do let Escape, the veil and a Cancel button all close it.
- Don't put a long form in a drawer; give it a page.
- Don't stack drawers.
