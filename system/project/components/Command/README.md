# Command

Command is a search field over a list of destinations and actions: type a few letters, press Enter.

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
It is a `raised` panel with the float shadow, usually opened inside a Dialog by a shortcut (Ctrl K) and by a visible search button. Typing filters the options; a group with nothing left disappears; the first match is highlighted. The panel fires `tray:select` with `detail.value`.

## Keyboard
Focus stays in the field. Up and down move the highlight, Enter runs it, Escape closes the dialog around it.

## You provide
The list (pages, recent items, actions), one icon per option, shortcuts where they exist, and the sentence for no results.

## Do and don't
- Do put what people do most at the top, before they type.
- Do name actions with a verb ("Create an order") and places with their title ("Orders").
- Don't make the palette the only way to reach anything.
- Don't run a destructive action straight from the list; open an Alert Dialog first.
