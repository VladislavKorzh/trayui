# Workspace Switcher

The workspace switcher is the button at the top of the sidebar that says which workspace you are in and opens the list of the others. Also called a team switcher or an account switcher.

## Markup
```html
<div class="tray-anchor tray-anchor--block" data-tray="menu">
  <button class="tray-switcher" type="button">
    <span class="tray-avatar tray-avatar--sm tray-avatar--ink" aria-hidden="true">PF</span>
    <span class="tray-person__text"><b>Perly Farm</b><small>Shop plan</small></span>
    <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chevrons-up-down"/></svg>
  </button>
  <div class="tray-pop">
    <div class="tray-list">
      <p class="tray-list__label">Workspaces</p>
      <button type="button" class="tray-option" role="menuitemradio" data-group="ws" aria-checked="true">… Perly Farm …</button>
      <button type="button" class="tray-option" role="menuitemradio" data-group="ws" aria-checked="false">… Meadow Bakery …</button>
      <hr class="tray-list__rule">
      <button type="button" class="tray-option" role="menuitem">… New workspace</button>
    </div>
  </div>
</div>
```
It is a Dropdown Menu: `data-tray="menu"` opens it, the workspaces are `menuitemradio` items that share a `data-group`, and the current one carries `aria-checked="true"` and shows the check. The second line under the name is the plan, or the person's role.

In a collapsed sidebar the switcher shrinks to its avatar. Its name and plan are then only hidden from sight, so the button keeps its name with no `aria-label`.

## Accessibility
- It is a Dropdown Menu: the switcher button gets `aria-haspopup="menu"` and `aria-expanded`. It is named by its text, the workspace and its plan, since the avatar and the icon are `aria-hidden`.
- `Enter`, `Space` or `ArrowDown` opens the menu with focus on the first item, `ArrowUp` and `ArrowDown` move round the items, and `Escape` closes it and returns focus to the switcher.
- The workspaces are `menuitemradio` items. The current one carries `aria-checked="true"`, which is announced, and shows a check and a semibold name, not a colour. Choosing a workspace checks it and leaves the menu open.
- In a collapsed sidebar only the `aria-hidden` avatar is left in sight, and the words are hidden from sight alone, so the button is still named "Perly Farm Shop plan". An `aria-label` of your own must hold those words too, as the visible label is part of the name (WCAG 2.5.3).

## Do and don't
- Do give each workspace its own initials tile; the current one is solid ink.
- Do end the list with "New workspace", after a rule.
- Don't put account actions (profile, sign out) here. They belong to the User Menu.
- Don't show the switcher to someone who has one workspace and cannot create another: show the name as text.
