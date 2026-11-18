---
category: Data
keywords: [table, grid, rows, columns, figures, data, spreadsheet, tabular]
---
# Table

A table sets figures in rows and columns: hairline rows, quiet heads, numbers aligned on the right.

## Use
```tsx
<Table
  caption="Season record"
  columns={[
    { key: 'month', header: 'Month', rowHeader: true },            // the column that names the row
    { key: 'status', header: 'Status', render: (row) => <Badge tone="off">{row.status}</Badge> },
    { key: 'collected', header: 'Collected', numeric: true },      // right-aligned, tabular figures
  ]}
  rows={[{ month: 'May', status: 'Closed', collected: '22 kg' }]}
  footer={{ month: 'Season so far', collected: '104 kg' }}       // a semibold totals row
/>

<Table compact aria-label="Delivery prices">                      {/* or write the rows yourself */}
  <thead><tr><th scope="col">Zone</th><th scope="col" data-num>Price</th></tr></thead>
  <tbody><tr><th scope="row">Kyiv</th><td data-num>$9</td></tr></tbody>
</Table>
```

## Parts
- The caption is the table's title, in `subtitle` type. Without one, give the table an `aria-label`.
- Heads are `label` type in soft ink; cells are `nav` size; row heads and the footer are semibold.
- A numeric column (`numeric`, or `data-num` on hand-written cells) is right-aligned with tabular figures.
- The table sits in a wrapper that scrolls sideways on a phone instead of breaking the page. `className`, `aria-label` and the ref go to the `<table>`. When the table may be wider than the screen, pass `wide`: the wrapper becomes a region named as the table is (by its caption or its `aria-label`), which the keyboard reaches with Tab and scrolls with the arrow keys.

## Variants
`compact` tightens the rows, for dense data in a side panel. `hover` tints the row under the pointer, for rows that open something. `pad` insets the first and last cells when rows are tinted; use it with `hover`.

## Do and don't
- Do give every table a caption or an `aria-label`, and every head a `scope`.
- Do put the unit in the head ("Collected, kg") when every row shares it.
- Don't draw vertical rules or zebra stripes.
- Don't use a table for layout. For searching, sorting, selecting and paging, use Data Table.
