# User Menu

The user menu opens from the avatar at the end of the top bar: who is signed in, then the account's pages, the theme, help and signing out.

## Markup
```html
<span class="tray-anchor" data-tray="menu">
  <button class="tray-avatar" type="button" aria-label="Account: Oksana Franko">OF</button>
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

Listen for `tray:select` on the anchor to act on an item. The theme item is a `menuitemcheckbox`: read its `aria-checked` after the click and set `data-theme` on `<html>`.

## Do and don't
- Do order the menu: the person, their pages, preferences, help, sign out last.
- Do show the email, so a person with two accounts can tell them apart.
- Don't colour "Sign out" red. It destroys nothing.
- Don't put workspace settings here: they sit in the sidebar.
