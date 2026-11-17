# Radio Group

A radio group picks exactly one option from a few that are all shown.

## Two forms
- **Plain radios** (`tray-radio`): a 22px ring and a label. For short lists inside a form.
- **Choice cards** (`tray-choice`): each option is a grey card with a title, a line of detail and an optional value at the end; the chosen card takes a 2px `ink` ring. For choices that need explaining: delivery method, a plan, a payment type.

## Markup
```html
<fieldset>
  <legend class="tray-label">Delivery</legend>
  <div class="tray-choices tray-choices--two">
    <label class="tray-choice">
      <input type="radio" name="delivery" checked>
      <span class="tray-radio__ring"></span>
      <span class="tray-choice__text"><b>Courier</b><span>Chilled box, the same day</span></span>
      <span class="tray-choice__end">$9</span>
    </label>
  </div>
</fieldset>
```
Plain radios use `<label class="tray-radio">` with the same input and ring inside `tray-radio-group` (a column) or `tray-radio-group--row`.

## Do and don't
- Do preselect the safest or most common option.
- Do keep two to five options; more is a Select.
- Don't use radios for an on/off choice; that is one Checkbox or a Switch.
- Don't mix plain radios and choice cards in one group.
