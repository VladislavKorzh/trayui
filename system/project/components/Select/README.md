# Select

A select picks one option from a short list that opens under its trigger.

## Markup
```html
<div class="tray-field">
  <span class="tray-label" id="jar-label">Jar size</span>
  <div class="tray-anchor tray-anchor--block" data-tray="select">
    <button class="tray-select-trigger" type="button" aria-labelledby="jar-label" data-placeholder>
      <span class="tray-select-trigger__value">Choose a jar</span>
      <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chevrons-up-down"/></svg>
    </button>
    <div class="tray-pop">
      <div class="tray-list">
        <button type="button" class="tray-option" role="option" data-value="30">
          <span class="tray-option__text">30 g</span>
          <svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg>
        </button>
        <button type="button" class="tray-option" role="option" data-value="50">
          <span class="tray-option__text">50 g</span>
          <svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg>
        </button>
        <button type="button" class="tray-option" role="option" data-value="100" aria-disabled="true">
          <span class="tray-option__text">100 g</span>
          <svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg>
        </button>
      </div>
    </div>
    <input type="hidden" name="jar">
  </div>
</div>
```
This is all the markup there is: the behaviour (`data-tray="select"`, in `bundle.js`) adds the rest. It gives the `.tray-pop` `role="listbox"` and an `id`, and names it as the trigger is; it gives the trigger `aria-haspopup="listbox"`, `aria-controls` and `aria-expanded`, and adds the `tray-select-trigger__value` to its `aria-labelledby`; it gives every option `tabindex="-1"` and `aria-selected="false"`, and hides the list until it opens. Write `role="option"` on each option yourself, and `aria-selected="true"` on the one chosen at load, with its words in `tray-select-trigger__value` and no `data-placeholder`. `data-label` on an option sets the words the trigger shows, when they differ from its text.

The trigger looks like an input. The list is a `raised` panel with the float shadow; options are 44px rows, the chosen one is semibold with a check. `tray-option--two` gives an option a second line. The hidden input carries the chosen `data-value` in a form; the anchor fires `tray:change` with `detail.value`.

A group of options is a `role="group"` named by its `tray-list__label`, and `tray-list__rule` divides groups:
```html
<div role="group" aria-labelledby="to-door">
  <div class="tray-list__label" id="to-door">To your door</div>
  <button type="button" class="tray-option" role="option" data-value="courier">
    <span class="tray-option__text">Courier, chilled box</span>
    <svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg>
  </button>
</div>
<hr class="tray-list__rule" aria-hidden="true">
```

## Accessibility
- The trigger is a button with `aria-haspopup="listbox"`, `aria-controls` and `aria-expanded`. The list is a `listbox` of `option` items, and `aria-selected` marks the chosen one.
- A label names a button in place of its content, so the behaviour names the trigger by its label and by the value it shows ("Jar size 50 g"): it adds the `tray-select-trigger__value` to the trigger's `aria-labelledby`, given an `id`. Name the trigger with a `<label for>`, `aria-labelledby` or `aria-label`; the list takes the same name.
- Each group is read with its name as focus enters it; the rule between groups is hidden from screen readers.
- `Enter`, `Space`, `ArrowDown` or `ArrowUp` opens the list on the chosen option, or on the first.
- In the list the arrow keys move, `Home` and `End` jump, a letter jumps to the next option that starts with it (press it again for the one after), `Enter` or `Space` chooses, and `Escape` closes. `Tab` closes the list and goes on; `Shift+Tab` closes it and returns to the trigger. A choice and `Escape` return focus to the trigger too.
- The chosen option is semibold with a check, so it does not rest on colour, and focus draws its ring inside the option.
- An option with `aria-disabled="true"` is passed over by the arrow keys and the letters, and cannot be chosen.

## Do and don't
- Do prefer Native Select on phones and in plain forms.
- Do keep the list under about ten options; beyond that use Combobox.
- Don't put actions ("Add new…") in the list of options.
