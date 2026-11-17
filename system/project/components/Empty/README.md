# Empty

An empty state fills the place where content will be: an icon tile, a title, one sentence, and the action that makes the first item.

## Markup
```html
<div class="tray-empty">
  <span class="tray-empty__icon">…icon…</span>
  <div class="tray-empty__text">
    <h3 class="subtitle">No orders yet</h3>
    <p>When someone orders a jar it shows up here.</p>
  </div>
  <div class="tray-empty__actions">…one or two buttons…</div>
</div>
```
It is centred, with text at most 36 characters wide, and usually sits inside the card or table it replaces.

## Three kinds
- **First use**: nothing has been made yet. Explain what will appear and offer the action.
- **No results**: a search or filter matched nothing. Say so and offer to clear it.
- **All done**: the list is empty because the work is finished. No action needed.

## Accessibility
An empty state is read in order: its heading, its sentence, then its buttons. The icon tile is `aria-hidden` and says nothing. Choose the heading level that fits where the empty state sits in the page. When it takes the place of results after a search or a filter, nothing announces it: say so in a `role="status"` region of your own, such as the line with the count of results.

## Do and don't
- Do keep the same container as the full state, so the page does not jump.
- Do offer one primary action at most.
- Don't blame the person ("You have no orders").
- Don't use an illustration that needs explaining; the icon tile is enough.
