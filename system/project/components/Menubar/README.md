# Menubar

A menubar is the row of menus at the top of a working tool: File, Edit, View.

## Markup
```html
<div class="tray-menubar" data-tray="menubar" aria-label="Orders">
  <div class="tray-anchor" data-tray="menu">
    <button class="tray-tab" type="button">File</button>
    <div class="tray-pop"><div class="tray-list">…menu items…</div></div>
  </div>
</div>
```
Each menu is a Dropdown Menu whose trigger is a tab in the strip. Items are `tray-option` buttons with `role="menuitem"`, `menuitemcheckbox` (with `aria-checked`) or `menuitemradio` (with `aria-checked` and a shared `data-group`). `tray-option__meta` holds the shortcut; `tray-list__rule` and `tray-list__label` group the items; `tray-submenu` holds an item that opens a second panel to the side.

## Accessibility
- `ArrowLeft` and `ArrowRight` move along the bar and wrap, and with a menu open they open the next one. `ArrowDown`, `Enter` or `Space` opens a menu on its first item.
- Inside, `ArrowUp` and `ArrowDown` move, `ArrowRight` opens a submenu and `ArrowLeft` leaves it, `Enter` runs an item, and `Escape` closes the menu and returns focus to its tab in the bar. With one menu open, pointing at another opens that one.
- The behaviour gives the strip `role="menubar"`, named by its `aria-label`, and each tab `aria-haspopup="menu"` and `aria-expanded`. The open tab's fill is drawn from `aria-expanded`, and check and radio items announce `aria-checked` as in a Dropdown Menu.
- Tabs and items draw the 3px ink focus ring inside their edge. Under `prefers-reduced-motion: reduce` a menu only fades, in a tenth of a second.

## Do and don't
- Do use it only in dense working tools, where the same commands are used all day.
- Do show the shortcut beside every item that has one.
- Don't use a menubar for site navigation; that is Navigation Menu.
- Don't hide the only way to do something in a menubar on a phone; it does not fit there.
