# Item

An item is one row of a list: a media tile, a title with a line of detail, and something at the end.

## Markup
```html
<ul class="tray-items">
  <li class="tray-item">
    <span class="tray-item__media">…icon or avatar…</span>
    <span class="tray-item__body">
      <span class="tray-item__title">Courier</span>
      <span class="tray-item__text">Chilled box, the same day</span>
    </span>
    <span class="tray-item__end">$9</span>
  </li>
</ul>
```
Each item is a grey row with 16px corners, 8px apart. `tray-items--ruled` drops the fills and separates rows with hairlines, for long lists on the page. `tray-item--sm` is the compact size. Make the whole row a link or a button with `<a class="tray-item">` or `<button class="tray-item">`; it darkens slightly on hover.

The end slot takes a value, a Badge, a Switch, a button, or a chevron when the row goes somewhere.

## Accessibility
When the whole row is an `<a class="tray-item">` or a `<button class="tray-item">`, all its text is its name: keep the end short, and the chevron is `aria-hidden`. Such a row holds no other control, since a link or a button cannot contain one. A control in the end slot of a plain row needs a name that says which row it belongs to ("Download the receipt of 14 November"): the same words in every row cannot be told apart. An avatar of initials is read as letters before the title, so mark it `aria-hidden="true"` when the title names the person.

## Do and don't
- Do keep the title to one line and the detail to one line.
- Do put one thing at the end.
- Don't put a row of buttons in an item; open a menu from a single "more" button.
- Don't mix filled and ruled items in one list.
