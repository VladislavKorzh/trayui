# Context Menu

A context menu opens where something is right-clicked and offers the actions for that thing. Also called a right-click menu.

## Markup
```html
<div class="tray-context" data-tray="contextmenu" role="group" tabindex="0" aria-label="Order PL-20418">
  …the content…
  <div class="tray-pop"><div class="tray-list">…menu items, as in Dropdown Menu…</div></div>
</div>
```
`data-tray="contextmenu"` goes on any positioned element that holds a `tray-pop`; `tray-context` is only the plain grey area used in this preview. The menu opens at the pointer on right-click, on a long press on touch screens that send the same event, and from the keyboard with the Menu key or Shift F10. It stays inside its region, closes on Escape or a click elsewhere, and fires `tray:select` with `detail.value`.

## Rules
- A context menu is a shortcut. Every action in it is also reachable another way: a "more" button on the row, a toolbar, a page.
- Use the same items, in the same order, as the row's Dropdown Menu.
- Leave the browser's own menu alone on text, links and form fields.

## Accessibility
Give the region `tabindex="0"` so a keyboard can reach it; there the Menu key or `Shift+F10` opens the menu, as a right-click does. Name the region with an `aria-label` after the thing it holds, and give it `role="group"`: a name on a plain `div` is not read without a role (the behaviour adds the role to a named `div` that has none). The panel becomes a `menu` and focus moves to its first item: `ArrowUp` and `ArrowDown` move between items and wrap, `Home` and `End` jump to the ends, and `Enter` or `Space` runs one. Running an item or pressing `Escape` closes the menu and returns focus to the region; `Tab` out of the menu closes it too. Items are `role="menuitem"` buttons with `aria-hidden` icons, and the focus ring is drawn inside each one. A destructive item is in `danger` and says what it destroys in words. Under `prefers-reduced-motion: reduce` the menu only fades, in a tenth of a second.

## Do and don't
- Do use it in dense working tools: tables, file lists, canvases.
- Don't use it on a marketing page or a phone-first product.
- Don't hide the only delete in it.
