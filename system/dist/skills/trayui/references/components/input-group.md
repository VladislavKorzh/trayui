# Input Group

An input group is one field that also holds an icon, a unit, a prefix or a small button. Also called an input with an icon, an addon or a button.

## Markup
```html
<div class="tray-input-group">
  <span class="tray-input-group__addon">…icon or text…</span>
  <input class="tray-input" aria-label="Search">
  <button class="tray-input-group__btn" type="button">Apply</button>
</div>
```
The group carries the fill, the 16px corners and the focus ring; the input inside is transparent. Add-ons are `ink-muted` text or a 20px icon. The inner button is 44px with 12px corners and takes the colour of the ground behind the group; `tray-input-group__btn--accent` makes it the yellow action of the field. `tray-input-group--sm` is the 48px size.

`data-tray="reveal"` on the inner button shows and hides a password.

## Use
- Search: a leading search icon.
- Units and prefixes that are not part of the value: "kg", "$", "https://".
- One action that only makes sense with this field: apply a code, copy a link, show a password.

## Accessibility
The group is a plain `<div>`: the field inside is named on its own, and an icon add-on is `aria-hidden`. A text add-on such as "kg" or "https://" is not read with the field, so put it in the field's name too ("Weight in kg"). An icon-only inner button needs an `aria-label` ("Copy the address"). `data-tray="reveal"` switches the field between `type="password"` and `type="text"`; the button keeps its name, "Show password", and `aria-pressed="true"` says the password is shown, so it is read as "Show password, pressed". The field turns back to `type="password"` when its form is sent and when the page comes back from the browser's back-forward cache, so a password is never kept or shown as text. Give it `spellcheck="false"` and `autocapitalize="none"`, which matter once it is text. The group draws its focus ring when the field has focus, and a field with `aria-invalid="true"` keeps its `danger` edge inside that ring.

## Do and don't
- Do give the input its own label or `aria-label`; an icon is not a label.
- Don't put more than one button in a group.
- Don't use it to join two separate fields.
