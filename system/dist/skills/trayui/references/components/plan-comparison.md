# Plan Comparison

The plan comparison is the full table under the pricing cards: every feature as a row, every plan as a column, a check, a dash or a number in each cell. Also called a feature comparison table or a pricing comparison.

## Markup
```html
<div class="tray-table-wrap" tabindex="0" role="region" aria-labelledby="compare-caption">
  <table class="tray-compare">
    <caption class="tray-vh" id="compare-caption">The plans compared</caption>
    <thead><tr>
      <th scope="col"><span class="tray-vh">Feature</span></th>
      <th scope="col">Stall<small>$0</small></th>
      <th scope="col" data-featured>Shop<small>$29 a month</small></th>
      <th scope="col">Market<small>$79 a month</small></th>
    </tr></thead>
    <tbody>
      <tr class="tray-compare__group"><th scope="rowgroup">Orders</th><td></td><td data-featured></td><td></td></tr>
      <tr><th scope="row">Orders a month</th><td>50</td><td data-featured>1,000</td><td>Unlimited</td></tr>
      <tr><th scope="row">Courier tracking</th>
        <td data-off><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-minus"/></svg><span class="tray-vh">Not included</span></td>
        <td data-featured><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-check"/></svg><span class="tray-vh">Included</span></td>
        <td>…</td></tr>
    </tbody>
    <tbody>
      <tr class="tray-compare__group"><th scope="rowgroup">Team</th><td></td><td data-featured></td><td></td></tr>
      …
    </tbody>
  </table>
</div>
```
`data-featured` on every cell of one column lays a tray behind it, rounded at the head and the foot: the plan you recommend, or the one the person is on. A cell holds a check, a dash (`data-off`), or the limit as text. Each icon needs its hidden word: "Included", "Not included".

Group the rows: each group is a `<tbody>` of its own, headed by a `tray-compare__group` row with its heading in the first cell and an empty cell under each plan, so the tray of the featured column runs through. Wrap the table in `tray-table-wrap` so it scrolls sideways on a phone. The table holds nothing that takes focus, so the wrapper takes it, as a Table's does: `tabindex="0"`, `role="region"` and the caption's name through `aria-labelledby`.

## Accessibility
It is a real `<table>`: `scope="col"` ties each cell to its plan and `scope="row"` to its feature, and the first head cell holds a hidden "Feature", so that column is named too. Each group is a `<tbody>` of its own whose first cell is `scope="rowgroup"`, so a group's heading is read with its own rows and not with every row after it. A check or a dash is `aria-hidden` and comes with a hidden word, "Included" or "Not included", so the icon is never the only sign. The featured column is marked by its tray alone: if it matters, say it in words in its head too. Give the table a `<caption>`, hidden with `tray-vh` if the heading above it says the same. On a phone the table scrolls sideways inside its wrapper, and with nothing in it to focus, a keyboard reaches the hidden plans only through the wrapper: `Tab` stops on it, it is read as a region with the caption's name, and the arrow keys scroll it.

## Do and don't
- Do keep the plan names and prices in the head, in the order of the pricing cards.
- Do write the limit rather than a check where there is one: "Five people".
- Don't use a red cross for a missing feature. A dash in hint ink is enough.
- Don't list features every plan has in the same amount: say them once above the table.
