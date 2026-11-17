# Notification Preferences

Notification preferences is a grid of checkboxes: what can happen down the side, the ways to be told across the top.

## Markup
```html
<div class="tray-table-wrap">
  <table class="tray-matrix">
    <thead><tr><th scope="col">Tell me when</th><th scope="col">Email</th><th scope="col">Push</th><th scope="col">Text</th></tr></thead>
    <tbody>
      <tr class="tray-matrix__group"><th scope="colgroup" colspan="4">Orders</th></tr>
      <tr>
        <th scope="row"><b>A new order arrives</b><small>Once per order.</small></th>
        <td><label class="tray-check"><input type="checkbox" aria-label="A new order arrives, by email" checked>
          <span class="tray-check__box">…</span></label></td>
        <td>…</td><td>…</td>
      </tr>
    </tbody>
  </table>
</div>
```
Every checkbox has an `aria-label` that joins its row and its column: "A new order arrives, by email". A notification the person cannot turn off (a failed payment, a security alert) is checked and `disabled`, and the line under its name says why.

Group the rows with `tray-matrix__group`. Three or four channels fit; with more, give each event its own row of Switches in a Settings Section.

## Do and don't
- Do save each change at once and confirm with a quiet Toast.
- Do word the rows as events: "A new order arrives".
- Don't offer a channel the person has not set up: show "Add a phone number" in that column's head instead.
- Don't pre-check marketing email.
