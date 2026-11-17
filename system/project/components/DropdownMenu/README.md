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
| On or off | `role="menuitemcheckbox"` with `aria-checked`; a check shows at the end and the menu stays open. The anchor fires `tray:change` with `detail.value` and `detail.checked`. |
| One of several | `role="menuitemradio"` with `aria-checked` and a shared `data-group`. The anchor fires `tray:change` with `detail.value` and `detail.checked: true`. |
| Submenu | Wrap the item (with `aria-haspopup="menu"`) and a `tray-pop tray-pop--side` in `tray-submenu`. One level only. It opens while the pointer rests on the item, or from the keyboard. |
| Destructive | `tray-option--danger`, always last, after a rule. |

`tray-pop--end` aligns the panel to the end edge, for a "more" button at the end of a row.

## Accessibility
- `Enter`, `Space` or `ArrowDown` opens the menu on its first item. `ArrowUp` and `ArrowDown` move and wrap at the ends, `Home` and `End` jump to the first and last item, and `Escape` closes the menu and returns focus to the button. `Tab` leaves the menu and closes it.
- A submenu is a `menu` of its own, named by its item, and the item reports `aria-expanded`. `ArrowRight`, `Enter` or `Space` on the item opens it on its first item. Inside it, `ArrowUp` and `ArrowDown` stay in the submenu, and `ArrowLeft` or `Escape` closes it and returns focus to its item. Under `dir="rtl"` the submenu opens to the left, and the two arrows swap. Up and down in the menu step over the submenu's items.
- `Enter` or `Space` runs an item. On a check or radio item it sets `aria-checked` instead, which also draws the tick, and the menu stays open.
- The behaviour gives the panel `role="menu"` and the button `aria-haspopup="menu"` and `aria-expanded`. An icon-only trigger needs an `aria-label` ("More actions").
- The item under focus draws the 3px ink ring inside its edge. Write what a destructive item does in words ("Delete order"): its `danger` colour is not a warning on its own.
- Under `prefers-reduced-motion: reduce` the panel only fades, in a tenth of a second.

## Do and don't
- Do order items by how often they are used, and group them with a rule.
- Do keep labels to a verb and a noun.
- Don't put more than about eight items in a menu.
- Don't use a menu to choose a value for a form; that is a Select.
