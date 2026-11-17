# Combobox

A combobox is a field that filters a list as you type and takes one of its options.

## Markup
```html
<div class="tray-anchor tray-anchor--block" data-tray="combobox">
  <div class="tray-input-group">
    <span class="tray-input-group__addon">…search icon…</span>
    <input class="tray-input" placeholder="Find a city" aria-label="City">
  </div>
  <div class="tray-pop">
    <div class="tray-list">
      <button class="tray-option" role="option" data-value="lviv">…</button>
      <div class="tray-list__empty">No city by that name.</div>
    </div>
  </div>
</div>
```
Typing narrows the list; the first match is highlighted. The anchor fires `tray:change` with `detail.value` when an option is taken.

## You provide
The options, and the sentence shown when nothing matches (`tray-list__empty`). Say what to do next: "No city by that name. Check the spelling."

## Accessibility
Focus stays in the input. Down and up move the highlight, Enter takes it, Escape closes the list; down also opens a closed list, and typing opens it with the first match highlighted. The input gets `role="combobox"`, `aria-autocomplete="list"`, `aria-controls` naming the list and an `aria-expanded` that follows it, and the list becomes a `listbox` named as the input is. The highlight is `aria-activedescendant`, so a screen reader reads each option as it is reached, and the option taken gets `aria-selected="true"`. Give the input a visible `<label>`, as the preview does, since a placeholder is not a name. When nothing matches, the behaviour says the no-match sentence through a hidden status line beside the list, so it is announced while focus stays in the input; the number of matches is not announced.

## Do and don't
- Do use it when the list is longer than a screen: cities, countries, people.
- Do show a second line (`tray-option--two`) when names repeat.
- Don't use it for five options; a Select or a Radio Group is faster.
