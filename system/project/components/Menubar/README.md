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

## Keyboard
Left and right move along the bar; down opens a menu; inside, up and down move, right opens a submenu, left closes it, Enter runs an item, Escape closes the menu and returns to the bar. With one menu open, pointing at another opens that one.

## Do and don't
- Do use it only in dense working tools, where the same commands are used all day.
- Do show the shortcut beside every item that has one.
- Don't use a menubar for site navigation; that is Navigation Menu.
- Don't hide the only way to do something in a menubar on a phone; it does not fit there.
