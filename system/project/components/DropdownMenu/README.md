# Dropdown Menu

A dropdown menu is a short list of actions that opens from a button.

## Markup
```html
<span class="tray-anchor" data-tray="menu">
  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">Actions …chevron…</button>
  <div class="tray-pop">
    <div class="tray-list">
      <button class="tray-option" role="menuitem">…icon… <span class="tray-option__text">Duplicate</span>
        <span class="tray-option__meta">Ctrl D</span></button>
      <hr class="tray-list__rule">
      <button class="tray-option tray-option--danger" role="menuitem">…</button>
    </div>
  </div>
</span>
```
| Item | Markup |
| --- | --- |
| Action | `role="menuitem"`. The anchor fires `tray:select` with `detail.value` and the menu closes. |
| On or off | `role="menuitemcheckbox"` with `aria-checked`; a check shows at the end and the menu stays open. |
| One of several | `role="menuitemradio"` with `aria-checked` and a shared `data-group`. |
| Submenu | Wrap the item (with `aria-haspopup="menu"`) and a `tray-pop tray-pop--side` in `tray-submenu`. One level only. |
| Destructive | `tray-option--danger`, always last, after a rule. |

`tray-pop--end` aligns the panel to the end edge, for a "more" button at the end of a row.

## Keyboard
Enter, Space or the down arrow opens the menu on its first item; up and down move; right opens a submenu and left leaves it; Enter runs the item; Escape closes and returns focus to the button.

## Do and don't
- Do order items by how often they are used, and group them with a rule.
- Do keep labels to a verb and a noun.
- Don't put more than about eight items in a menu.
- Don't use a menu to choose a value for a form; that is a Select.
