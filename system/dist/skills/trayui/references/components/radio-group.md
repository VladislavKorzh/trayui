# Radio Group

A radio group picks exactly one option from a few that are all shown. Also called radio buttons.

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

## Accessibility
They are the browser's own radios. Put them in a `<fieldset>` whose `<legend>` names the group, or give the wrapper `role="radiogroup"` and an `aria-label` when there is no visible legend. `Tab` reaches the group at its checked radio, the arrow keys move the choice and pass over a disabled one, and `Space` checks the radio in focus. Each radio is named by its `<label>`: on a choice card that is the title, the line of detail and the value at the end. The input covers its whole label, so the row is the target, and focus draws the 3px ink ring round the ring of a plain radio or round the whole card. The chosen radio shows a filled ring, so the choice does not rest on colour, and with forced colours it takes the system's colours for a chosen item.

## Do and don't
- Do preselect the safest or most common option.
- Do keep two to five options; more is a Select.
- Don't use radios for an on/off choice; that is one Checkbox or a Switch.
- Don't mix plain radios and choice cards in one group.
