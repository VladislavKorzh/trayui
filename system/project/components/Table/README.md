# Table

A table sets figures in rows and columns: hairline rows, quiet heads, numbers aligned on the right.

## Markup
```html
<div class="tray-table-wrap">
  <table class="tray-table">
    <caption>Season record</caption>
    <thead><tr><th scope="col">Month</th><th scope="col" data-num>Collected</th></tr></thead>
    <tbody><tr><th scope="row">May</th><td data-num>22 kg</td></tr></tbody>
    <tfoot><tr><th scope="row">Total</th><td data-num>104 kg</td></tr></tfoot>
  </table>
</div>
```
- Heads are `label` type in `ink-soft`; cells are `nav` size; row heads and the footer are semibold.
- `data-num` (or `tray-num`) right-aligns a column and sets tabular figures.
- The caption is the table's title, in `subtitle`.
- `tray-table--compact` tightens the rows; `tray-table--hover` tints the row under the pointer; `tray-table--pad` insets the first and last cells when rows are tinted.
- `tray-table-wrap` lets a wide table scroll sideways on a phone instead of breaking the page.

## Do and don't
- Do give every table a caption or an `aria-label`, and every head a `scope`.
- Do put the unit in the head ("Collected, kg") when every row shares it.
- Don't draw vertical rules or zebra stripes.
- Don't use a table for layout. For sorting, selecting and paging, use Data Table.
