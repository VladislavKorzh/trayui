# A paginated data table that keeps focus

A sortable, paged data table in plain HTML that keeps focus where the person is, says each new sort and page aloud, and stays a real table throughout.

## Where focus goes missing

A data table changes under the person using it: a column head sorts it, Next turns the page, a filter hides rows. Each change can throw focus away in one of three ways.

1. **The table is drawn again.** A script that rebuilds the rows and the head, with `innerHTML` or a render that makes new elements, replaces the sort button that was pressed. When the focused element leaves the page, `document.activeElement` becomes `body`.
2. **A button turns off under the finger.** Next is disabled on the last page. Chrome takes focus off a disabled element at its next rendering, and focus goes to `body` again.
3. **The focused row is hidden.** A row hidden by a page change or a filter takes the focus inside it away too.

Until the next Tab, nothing has focus, and the person has to find their place again. Tray UI's [Data Table](#c-data-table) avoids all three; the sections below show how, and the script at the end does the same in under 50 lines.

## Keep it a real table

Everything here works on a plain `<table>`: a `<caption>` or an `aria-label` to name it, `<th scope="col">` for the column heads and `<th scope="row">` for the cell that names each row. With `scope`, each cell is tied to its column and its row, so assistive technology can read a cell with its heads.

```html
<table id="orders">
  <caption>Orders</caption>
  <thead>
    <tr>
      <th scope="col"><button type="button">Order</button></th>
      <th scope="col" aria-sort="descending"><button type="button">Placed</button></th>
      <th scope="col"><button type="button">Total</button></th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">PL-20418</th><td data-value="2026-11-14">14 Nov</td><td data-value="127">$127</td></tr>
    <tr><th scope="row">PL-20417</th><td data-value="2026-11-13">13 Nov</td><td data-value="68">$68</td></tr>
    <!-- …five more rows… -->
  </tbody>
</table>
<p id="orders-status" role="status" tabindex="-1"></p>
<button type="button" id="prev">Previous page</button>
<button type="button" id="next">Next page</button>
```

Sorting and paging do not make it a grid. `role="grid"` is the APG's pattern for an interactive widget where the arrow keys move from cell to cell; the APG's own [sortable table example](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/) stays a `table` with a button in each sortable column head. Keep the CSS from changing it as well. MDN's page on `display` warns that in some browsers a `<table>` set to `display: block`, `grid` or `flex` changes in the accessibility tree and is "no longer announced properly by screen reading technology".

A wide table goes in a box that scrolls sideways. Tray UI's blocks give that box `tabindex="0"`, `role="region"` and a name, so a keyboard can reach it and scroll it.

## Sorting without losing focus

The sort control is a `<button>` inside the column head. The head carries the state: `aria-sort="ascending"` or `"descending"` on the one sorted column. MDN: "The `aria-sort` attribute should only be added to a single table or grid header at a time." When another column is sorted, the attribute moves to its head.

The rows change order, and nothing else does. Tray UI sorts its own list of the row elements and puts each back into the body, so the head, the button and every row are the same elements as before:

```js
var th = btn.closest('th'), i = [].indexOf.call(th.parentNode.children, th);
var dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
$$('th', table.tHead).forEach(function (h) { h.removeAttribute('aria-sort'); });
th.setAttribute('aria-sort', dir);
rows.sort(function (a, b) { var x = key(a.children[i]), y = key(b.children[i]); return (x > y ? 1 : x < y ? -1 : 0) * (dir === 'ascending' ? 1 : -1); });
rows.forEach(function (r) { body.insertBefore(r, empty || null); });
page = 0; paint();
```

`insertBefore` moves an element that is already in the page. The button keeps focus, and a ticked checkbox in a row stays ticked. After a sort, the table goes back to its first page.

A cell whose text does not sort as written carries the value to sort by: "14 Nov" has `data-value="2026-11-14"`. Tray UI's `key()` reads a date written as `2026-11-27` as a date, text with no letter before its first figure as a number, so "$127" sorts as 127, and anything else as lower-case text.

The arrow beside the column name is hidden from assistive technology. In Tray UI it turns from a two-way arrow to an up or a down arrow, and the sorted head turns from grey to ink. The APG example adds one more thing: an off-screen description of the sort buttons, appended to the caption, so a person learns that the column heads sort the table.

## Paging that keeps its buttons

A page is a set of rows shown, the others hidden with the `hidden` attribute. Hidden rows leave the accessibility tree: in Chrome, the table then holds the rows of one page only. A line beside the buttons says where the person is: "1–5 of 8" in Tray UI, or "Nothing to show" when a filter leaves no row.

Previous and Next stay where they are, so focus stays on the button that was pressed, and a second press turns one more page. Only at the ends does a button turn off, and Tray UI moves focus before it does:

```js
var first = page === 0, last = page >= pages - 1;
if (prev && !first) prev.disabled = false;
if (next && !last) next.disabled = false;
if (prev && first) { rescue(prev, !last && next || status); prev.disabled = true; }
if (next && last) { rescue(next, !first && prev || status); next.disabled = true; }
```

The order matters. A disabled button cannot take focus, so the button that will be used is turned on first, focus moves to it, and only then is the other turned off. `rescue(el, to)` does nothing unless focus is inside `el`: a page turned by a script, while the person is elsewhere, leaves their focus alone. With a single page both buttons are off, and focus goes to the status line, which `rescue()` gives `tabindex="-1"` so it can take it.

Pressing Next on the last but one page in Tray UI's preview puts focus on Previous, with the status reading "6–8 of 8".

## Saying what changed

The person who pressed a button is still on it, and the rows that changed are somewhere else on the screen. WCAG 2.2 success criterion 4.1.3 (level AA) asks that such news, a status message, can be presented by assistive technologies "without receiving focus". Its Understanding document gives "18 results returned" as an example of one.

- **The page.** Put `role="status"` on the line with the count. Each new page writes new text into it.
- **The sort.** `aria-sort` is a state of the column head; MDN says it is there "to inform assistive technology users which column or row is sorted". Nothing in ARIA asks for a change to it to be announced while focus stays on the button. Write the sort into the status as well: "Sorted by Total, ascending. Rows 1 to 5 of 7". It also makes the status change when a sort leaves the page number as it was.
- **The selection.** A count such as "2 of 8 selected" in its own status says what a click on a checkbox did to the whole.

Tray UI's behaviour writes the counts into `data-page-status` and `data-selected-count` and announces nothing by itself. Its README says to give them `role="status"`. The dashboard block gives it to both, the table of batches to its selection count, and the changelog lists this under the coming version: "The dashboard and the batches table read their selection and page counts aloud as they change."

## Selecting rows

Each row starts with a checkbox named by its row: "Select order PL-20418". The checkbox carries the state; as a comment in Tray UI's script puts it, `aria-selected` "means nothing on the row of a plain table". The checkbox in the head selects every row and goes to `indeterminate` while only some are chosen, which Chrome exposes as checked "mixed".

In Tray UI the head checkbox acts on every row the filter matches, on every page. Name it for what it does. The batches table, whose pages are links that each load one page of rows, names its own "Select all batches on this page".

## Pages from the server

When the server sends one page of rows at a time, the pages are links, and each is a new page load. Focus starts at the top of the new page, so there is no focus to keep, and Tray UI's [Pagination](#c-pagination) is a `<nav aria-label="Pages">` of links with `aria-current="page"` on the current one. A step that cannot be used takes `aria-disabled="true"` and loses its `href`, so it is no longer a link that can be focused. The [table with filters and bulk actions](#b-table-01) pages this way, under a line that reads "1–10 of 24 batches".

## A script from scratch

This runs the markup above: buttons in the heads sort it, Previous and Next page it, focus stays on the control in use or moves to its neighbour, and the status says what changed.

```js
const table = document.getElementById('orders');
const body = table.tBodies[0];
const rows = [...body.rows];
const status = document.getElementById('orders-status');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const SIZE = 5;
let page = 0;

const value = (row, i) => row.cells[i].dataset.value ?? row.cells[i].textContent.trim();

function show(news) {
  const pages = Math.ceil(rows.length / SIZE);
  page = Math.min(Math.max(page, 0), pages - 1);
  rows.forEach((row, i) => { row.hidden = Math.floor(i / SIZE) !== page; });
  const first = page * SIZE + 1, last = Math.min(rows.length, first + SIZE - 1);
  status.textContent = (news ? news + '. ' : '') + `Rows ${first} to ${last} of ${rows.length}`;

  // Turn a button on before it may take focus, move focus off a button before it turns off
  const atStart = page === 0, atEnd = page === pages - 1;
  if (!atStart) prev.disabled = false;
  if (!atEnd) next.disabled = false;
  if (atStart && document.activeElement === prev) (atEnd ? status : next).focus();
  if (atEnd && document.activeElement === next) (atStart ? status : prev).focus();
  prev.disabled = atStart;
  next.disabled = atEnd;
}

table.tHead.addEventListener('click', (e) => {
  const button = e.target.closest('button');
  if (!button) return;
  const th = button.closest('th'), i = th.cellIndex;
  const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
  for (const cell of th.parentElement.cells) cell.removeAttribute('aria-sort');
  th.setAttribute('aria-sort', dir);
  const sign = dir === 'ascending' ? 1 : -1;
  rows.sort((a, b) => sign * value(a, i).localeCompare(value(b, i), 'en', { numeric: true }));
  body.append(...rows); // the same rows, in a new order: the button keeps its focus
  page = 0;
  show(`Sorted by ${button.textContent}, ${dir}`);
});

prev.addEventListener('click', () => { page -= 1; show(); });
next.addEventListener('click', () => { page += 1; show(); });
show();
```

`localeCompare` with `numeric: true` sorts "68" before "127" and keeps dates written as `2026-11-14` in order. `body.append(...rows)` moves the rows as `insertBefore` does in Tray UI. Paging by the position in `rows` means a sort and a page share one list, so page 1 after a sort holds the first five rows of the new order.

## The data table in Tray UI

Write the table inside a wrapper with `data-tray="datatable"`, and add the parts you need. Each one is found by its attribute:

```html
<div class="tray-datatable" data-tray="datatable" data-page-size="5">
  <div class="tray-datatable__bar">…an input with data-filter, then actions…</div>
  <div class="tray-table-wrap"><table class="tray-table tray-table--hover tray-table--pad" aria-label="Orders">…</table></div>
  <div class="tray-datatable__foot">
    <span data-selected-count role="status"></span>
    <span data-page-status role="status"></span>
    <button class="tray-btn tray-btn--quiet tray-btn--xs tray-btn--icon" type="button" data-page-prev aria-label="Previous page">…</button>
    <button class="tray-btn tray-btn--quiet tray-btn--xs tray-btn--icon" type="button" data-page-next aria-label="Next page">…</button>
  </div>
</div>
```

| Part | Markup |
| --- | --- |
| Sorting | A `<button class="tray-sort">` with the label, and optionally the `arrow-up-down` icon, inside a column head. |
| Sort value | `data-value` on a cell whose text does not sort as written. |
| Filter | `<input data-filter>`, with an `aria-label`: rows that do not contain its text are hidden. |
| Selection | A checkbox with `data-select` in each row, one with `data-select-all` in the head. |
| Paging | `data-page-size` on the wrapper, `data-page-status`, `data-page-prev` and `data-page-next`. |
| Empty | A `<tr data-empty hidden>` holding an [Empty](#c-empty) state, shown when the filter matches nothing. |

The wrapper fires `tray:change` with `detail.selected` and `detail.page` after each change, which the dashboard uses to turn on "Print the labels" once a row is chosen. For data that lives on a server, do the filtering, sorting and paging there and render the rows: the classes work without the script. The [Data Table](#c-data-table) page has the live example, and the [dashboard](#b-dashboard-01) and [table with sortable columns and row menus](#b-table-02) blocks show it in a screen. Nothing here was tested in a screen reader; the focus and the attributes were checked in Chrome.
