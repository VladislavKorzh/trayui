---
category: Data
keywords: [data table, datatable, grid, sortable table, filter, selection, pagination, orders list, admin table]
---
# Data Table

A data table is a Table that can be searched, sorted, selected and paged.

## Use
```tsx
<DataTable
  label="Orders"                                   // names the table; words the checkboxes
  columns={[
    { key: 'id', header: 'Order', rowHeader: true, sortable: true },
    { key: 'status', header: 'Status', render: (row) => <Badge tone="success" icon="circle-check">Paid</Badge> },
    { key: 'placed', header: 'Placed', sortable: true, sortValue: (row) => String(row.date) }, // "14 Nov" sorts by its ISO date
    { key: 'total', header: 'Total', numeric: true, sortable: true },
  ]}
  rows={orders}                                    // each row has a unique `id`
  filter="Filter orders"                           // a filter field in the bar
  actions={<Button variant="quiet" size="sm" icon="download">Export</Button>}
  selectable defaultSelected={['PL-20418']}
  defaultSort={{ key: 'placed', direction: 'descending' }}
  pageSize={20}
  rowActions={(row) => <Button variant="ghost" size="xs" icon="ellipsis" aria-label={`Actions for order ${row.id}`} />}
  onChange={({ selected, page }) => setSelected(selected)}
/>
```

## Parts
Every part is optional.

| Part | Prop |
| --- | --- |
| Filter field at the start of the bar | `filter`: its placeholder and label. Rows that do not contain the text are hidden. |
| Buttons at the end of the bar | `actions` |
| Sort buttons in the heads | `sortable` on a column; `sortValue` when the cell text does not sort as written |
| Checkboxes, selection count at the foot | `selectable`, `defaultSelected` |
| Pager at the foot, "1–5 of 8" | `pageSize` |
| One control at the end of each row | `rowActions` |
| What shows when the filter matches nothing | `empty` (default: a small Empty) |

## Behaviour
The system's own datatable behaviour runs the table in the page: it filters, sorts, selects and pages the rows it was given. The checkboxes belong to it, named from `label` and `itemLabel` ("Select all orders", "Select order PL-20418"), so selection is set with `defaultSelected` and followed with `onChange`, which is called on load and after every change with the selected row keys and the page. When the set of rows (or the columns, or the parts) changes, the table starts over: the filter, sort and selection reset.

The selection count and the page status at the foot are `role="status"`, so a screen reader reads them as they change ("2 of 8 selected", "6–8 of 8"). The table's wrapper is a region named by `label`, which the keyboard reaches with Tab and scrolls sideways with the arrow keys on a phone.

Sorting is by text, or by number when the value reads as one ("$127", "22 kg"). The first click sorts ascending; the head gets `aria-sort` and its icon turns into an arrow.

For data that lives on a server, do the filtering, sorting and paging there and render the rows in a Table.

## Do and don't
- Do sort by the column people look for first, and say so with `defaultSort`.
- Do keep bulk actions disabled until something is selected.
- Do hide row actions behind one "more" button per row.
- Don't page a table of fewer than about twenty rows.
