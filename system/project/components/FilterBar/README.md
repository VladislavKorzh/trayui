# Filter Bar

The filter bar sits over a list or a table: search at the start, filters as menus, sorting and the view at the end, and a chip for every filter that is on.

## Markup
```html
<div class="tray-filterbar" data-tray="filterbar">
  <div class="tray-filterbar__row">
    <div class="tray-input-group tray-input-group--sm">… <input class="tray-input" type="search" aria-label="Search orders"> …</div>
    <span class="tray-anchor" data-tray="menu">
      <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">Status …</button>
      <div class="tray-pop"><div class="tray-list">
        <button type="button" class="tray-option" role="menuitemcheckbox" aria-checked="true" data-value="status:to-pack" data-label="Status: To pack">…</button>
      </div></div>
    </span>
    <div class="tray-filterbar__end">…sort, view…</div>
  </div>
  <div class="tray-filterbar__chips">
    <span class="tray-chip" data-value="status:to-pack">Status: To pack<button type="button" class="tray-chip__x" aria-label="Remove Status: To pack">…</button></span>
    <button class="tray-btn tray-btn--link" type="button" data-filter="clear">Clear all</button>
  </div>
</div>
```
## Behaviour
`data-tray="filterbar"`: checking a `menuitemcheckbox` that has a `data-value` adds a chip (its text is `data-label`); the chip's button unchecks the item; `data-filter="clear"` removes them all. The chip row hides while it is empty. It fires `tray:change` with `{ filters }`, the list of values that are on: filter your data there.

Render the chips for filters that are already on, and mark their menu items `aria-checked="true"`.

## Accessibility
The search field has no visible label, so it takes an `aria-label` ("Search orders"). Each filter is a Dropdown Menu of `menuitemcheckbox` items: `aria-checked` says which are on, and `Enter` or `Space` flips one while the menu stays open. Each chip's button is named with the whole filter ("Remove Status: To pack"), and each radio of an icon-only view switch needs an `aria-label`. When a chip goes, focus moves to the next chip's button, or the one before, or back to the menu the filter came from; "Clear all" sends it back to the menu of the first filter. The remove button is 28px to the eye and 44px to a finger. The list changing is not announced: put the count of results ("12 orders match") in a `role="status"` region so it is read after each change.

## Do and don't
- Do name the chip in full: "Status: To pack", not "To pack".
- Do keep at most four filter menus in the row; the rest go behind a "Filters" button that opens a Popover.
- Don't apply filters behind an "Apply" button. The list follows each change.
- Don't hide the count of results: say "12 orders" near the list.
