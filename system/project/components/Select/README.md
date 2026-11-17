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

## Keyboard
Enter, Space or the down arrow opens the list on the chosen option; arrows move, Home and End jump, a letter jumps to the first match, Enter chooses, Escape closes and returns focus.

## Do and don't
- Do prefer Native Select on phones and in plain forms.
- Do keep the list under about ten options; beyond that use Combobox.
- Don't put actions ("Add new…") in the list of options.
