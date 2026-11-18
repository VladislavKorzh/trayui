# Command

Command is a search field over a list of destinations and actions: type a few letters, press Enter. Also called a command menu or a search palette opened with a shortcut.

## Markup
```html
<div class="tray-command" data-tray="command">
  <label class="tray-command__search">…search icon… <input placeholder="Search or run a command" aria-label="Command"></label>
  <div class="tray-command__list">
    <div data-group>
      <div class="tray-list__label">Go to</div>
      <button class="tray-option" role="option">…icon… <span class="tray-option__text">Orders</span></button>
    </div>
    <div class="tray-list__empty" hidden>Nothing matches. Try another word.</div>
  </div>
  <div class="tray-command__foot">…key hints…</div>
</div>
```
It is a `raised` panel with the float shadow, usually opened inside a Dialog by a shortcut (Ctrl K) and by a visible search button. Typing filters the options by their names (the `tray-option__text`, not the shortcut keys beside it); a group with nothing left disappears; the first match is highlighted. The panel fires `tray:select` with `detail.value`: the option's `data-value`, or else its name.

## You provide
The list (pages, recent items, actions), one icon per option, shortcuts where they exist, and the sentence for no results.

## Accessibility
Focus stays in the field, and the search row draws the 2px ink ring of a field inside its edge while it does. Up and down move the highlight and wrap at the ends, Enter runs it, Escape closes the dialog around it. The field gets `role="combobox"`, `aria-expanded="true"` and `aria-controls` naming the list, which becomes a `listbox`, and the highlight is `aria-activedescendant`, so a screen reader reads each option as it is reached. Each `data-group` becomes a `group` of the listbox named by its `tray-list__label`, so the group's name is read on the way into it. As the list narrows, a hidden status line says how many options are left ("3 matches"), or the no-match sentence when none is, and only when those words change (the sentence in the list itself is hidden from screen readers, as a listbox holds only options and groups); `data-found="{n} found"` on the panel words the count in the page's language. There is no visible label, so keep the field's `aria-label`. An option's accessible name is all its text, shortcut keys included, and its icon is `aria-hidden`.

## Do and don't
- Do put what people do most at the top, before they type.
- Do name actions with a verb ("Create an order") and places with their title ("Orders").
- Don't make the palette the only way to reach anything.
- Don't run a destructive action straight from the list; open an Alert Dialog first.
