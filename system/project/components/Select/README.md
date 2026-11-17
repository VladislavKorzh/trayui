# Select

A select picks one option from a short list that opens under its trigger.

## Markup
```html
<div class="tray-anchor tray-anchor--block" data-tray="select">
  <button class="tray-select-trigger" type="button" data-placeholder>
    <span class="tray-select-trigger__value">Choose a jar</span> …chevrons-up-down icon…
  </button>
  <div class="tray-pop">
    <div class="tray-list">
      <button class="tray-option" role="option" data-value="50">…</button>
    </div>
  </div>
  <input type="hidden" name="jar">
</div>
```
The trigger looks like an input. The list is a `raised` panel with the float shadow; options are 44px rows, the chosen one is semibold with a check. `tray-list__label` names a group, `tray-list__rule` divides groups, `tray-option--two` gives an option a second line. The hidden input carries the value in a form; the anchor fires `tray:change` with `detail.value`.

## Accessibility
- The trigger is a button with `aria-haspopup="listbox"`, `aria-controls` and `aria-expanded`. The list is a `listbox` of `option` items, and `aria-selected` marks the chosen one.
- `Enter`, `Space`, `ArrowDown` or `ArrowUp` opens the list on the chosen option, or on the first.
- In the list the arrow keys move, `Home` and `End` jump, a letter jumps to the first option that starts with it, `Enter` or `Space` chooses, and `Escape` closes. Both a choice and `Escape` return focus to the trigger.
- The chosen option is semibold with a check, so it does not rest on colour, and focus draws its ring inside the option.
- An option with `aria-disabled="true"` is passed over by the arrow keys and cannot be chosen.

## Do and don't
- Do prefer Native Select on phones and in plain forms.
- Do keep the list under about ten options; beyond that use Combobox.
- Don't put actions ("Add new…") in the list of options.
