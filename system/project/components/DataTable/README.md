# Data Table

A data table is a Table that can be searched, sorted, selected and paged.

## Markup
```html
<div class="tray-datatable" data-tray="datatable" data-page-size="5">
  <div class="tray-datatable__bar">…a filter field with data-filter, then actions…</div>
  <div class="tray-table-wrap"><table class="tray-table tray-table--hover tray-table--pad">…</table></div>
  <div class="tray-datatable__foot">
    <span data-selected-count></span>
    …<span data-page-status></span> and two buttons with data-page-prev and data-page-next…
  </div>
</div>
```
Every part is optional and found by its attribute:

| Part | Markup |
| --- | --- |
| Sorting | A `<button class="tray-sort">` with the label and the `sort` icon inside a column head. The head gets `aria-sort`; the icon turns into an arrow. |
| Sort value | `data-value` on a cell when its text does not sort as written (a date, a status). |
| Filter | `<input data-filter>`: rows that do not contain the text are hidden. |
| Selection | A checkbox with `data-select` in each row and one with `data-select-all` in the head. Selected rows take the resting fill and `aria-selected`. |
| Paging | `data-page-size` on the wrapper; the status reads "1–5 of 8". |
| Empty | A `<tr data-empty hidden>` holding an Empty state, shown when the filter matches nothing. |

The wrapper fires `tray:change` with `detail.selected` and `detail.page`.

## Layout
The bar is one row above the table: the filter first, bulk actions at the end. Row actions hide behind one "more" button per row. Numbers align right; the first column is the row's name and is a row head.

## Accessibility
It is a real `<table>`: name it with a `<caption>` or an `aria-label`, and keep `scope` on the column and row heads. A sort button sits inside its column head, and the head gets `aria-sort="ascending"` or `"descending"`, so a screen reader says how the column is sorted. Give the filter field an `aria-label`, and each row's checkbox one that names the row, such as "Select order PL-20418"; the head checkbox is announced as mixed while only some rows are chosen. The behaviour writes the counts into `data-page-status` and `data-selected-count` but announces nothing, so give those `role="status"` to have the changes read. Each row's action button is an icon button that names its row, such as "Actions for order PL-20418".

## Do and don't
- Do sort by the column people look for first, and say so with `aria-sort` on load.
- Do keep bulk actions disabled until something is selected.
- Don't page a table of fewer than about twenty rows; this preview pages eight only to show the control.
- For data that lives on a server, do the filtering, sorting and paging there and render the rows; the classes work without the behaviour.
