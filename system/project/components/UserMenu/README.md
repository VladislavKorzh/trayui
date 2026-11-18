# User Menu

The user menu opens from the avatar at the end of the top bar: who is signed in, then the account's pages, the theme, help and signing out.

## Markup
```html
<span class="tray-anchor" data-tray="menu">
  <button class="tray-avatar" type="button" aria-label="Account: Oksana Franko, OF">OF</button>
  <div class="tray-pop tray-pop--end">
    <div class="tray-pop__head">
      <span class="tray-avatar" aria-hidden="true">OF</span>
      <span class="tray-person__text"><b>Oksana Franko</b><small>oksana@perly.example</small></span>
    </div>
    <div class="tray-list">
      <hr class="tray-list__rule">
      <a class="tray-option" role="menuitem" href="/profile">… Profile</a>
      <button type="button" class="tray-option" role="menuitemcheckbox" aria-checked="false">… Dark theme …</button>
      <hr class="tray-list__rule">
      <button type="button" class="tray-option" role="menuitem">… Sign out</button>
    </div>
  </div>
</span>
```
`tray-person` is the pair used in the head: a name in bold over a quieter line, both cut with an ellipsis. It is the same cell the Team Members table uses.

Listen for `tray:select` on the anchor to act on an item. The theme item is a `menuitemcheckbox`: it fires `tray:change` instead, with `detail.checked`; set `data-theme` on `<html>` from it.

## Accessibility
- It is a Dropdown Menu: the avatar button gets `aria-haspopup="menu"` and `aria-expanded`, and since it shows only initials its `aria-label` names the person and ends with those initials ("Account: Oksana Franko, OF"), as the Avatar says, so a person who speaks to the computer can say what they see. The panel is a `menu` of `menuitem` and `menuitemcheckbox` items.
- The head is not an item, so a screen reader inside the menu would never reach it: the behaviour names the menu by its `tray-person__text` instead, and the name and email are read as the menu opens ("Oksana Franko oksana@perly.example, menu").
- `Enter`, `Space` or `ArrowDown` opens the menu with focus on the first item. `ArrowUp` and `ArrowDown` move round the items, `Home` and `End` jump, and `Escape` closes the menu and returns focus to the avatar.
- Choosing a `menuitem` closes the menu and returns focus too. The theme item flips its `aria-checked` instead, which is announced, and the menu stays open. A check and a semibold label show its state, not a colour.
- Focus draws the ring inside the item. Under `prefers-reduced-motion: reduce` the menu only fades in.

## Do and don't
- Do order the menu: the person, their pages, preferences, help, sign out last.
- Do show the email, so a person with two accounts can tell them apart.
- Don't colour "Sign out" red. It destroys nothing.
- Don't put workspace settings here: they sit in the sidebar.
