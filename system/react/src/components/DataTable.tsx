'use client';
import * as React from 'react';
import { cx, runtime } from '../lib/util';
import { bodyCell, headCell, sortKey, textOf } from '../lib/data';
import { Empty } from './Empty';
import { Icon } from './Icon';
import { Input } from './Input';
import { Table, type TableColumn, type TableRow } from './Table';

/** One row of a Data Table: its values by column key, and a unique key in the `rowKey` field ('id' unless you say otherwise). */
export type DataTableRow = TableRow;

export type DataTableSortDirection = 'ascending' | 'descending';

export interface DataTableColumn extends TableColumn {
  /** Puts a sort button in the column head: the first click sorts ascending, the next descending. */
  sortable?: boolean;
  /** The value the column sorts by when the cell's text does not sort as written: an ISO date for "14 Nov", a rank for a status. */
  sortValue?: (row: DataTableRow) => string | number;
}

export interface DataTableState {
  /** The keys (`rowKey`) of the selected rows. */
  selected: string[];
  /** The page in view, counted from 0. */
  page: number;
}

export interface DataTableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  /** Names the table for screen readers, as a plural noun: "Orders". It also words the checkboxes: "Select all orders". */
  label: string;
  /** One row, as a noun: "order". It words each row's checkbox: "Select order PL-20418". Default: `label` made singular ("Orders" gives "order"). */
  itemLabel?: string;
  /** The columns, in order. The first one is usually the row's name with `rowHeader`; numbers take `numeric`. */
  columns: DataTableColumn[];
  /** The rows, one object per row with a value for each column key and a unique `rowKey`. When the set of rows changes, the table starts over: filter, sort and selection reset. */
  rows: DataTableRow[];
  /** The field that identifies a row, used for selection and React keys. Default 'id'. */
  rowKey?: string;
  /** Shows a filter field above the table with this placeholder, which is also its label: "Filter orders". Rows that do not contain the text are hidden. */
  filter?: string;
  /** Buttons at the end of the bar above the table, such as a quiet small "Export". Bulk actions stay disabled until something is selected. Wrap several in `<div className="tray-row tray-row--sm">`. */
  actions?: React.ReactNode;
  /** Adds a checkbox to every row and one in the head that selects every row the filter shows. Selected rows take the resting fill. */
  selectable?: boolean;
  /** The keys of the rows selected at first. The checkboxes then belong to the table; follow them with `onChange`. */
  defaultSelected?: string[];
  /** The column the rows are sorted by at first, and its direction. The rows are sorted to match, and the head says so with `aria-sort`. */
  defaultSort?: { key: string; direction: DataTableSortDirection };
  /** Rows per page; adds "1–5 of 8" and previous and next buttons at the foot. Leave it out for fewer than about twenty rows. */
  pageSize?: number;
  /** One control at the end of each row, usually a ghost 'xs' Button with the 'ellipsis' icon that opens a menu: never a row of buttons. */
  rowActions?: (row: DataTableRow, index: number) => React.ReactNode;
  /** What the table shows when the filter matches nothing. Default: a small Empty, "Nothing matches that filter". */
  empty?: React.ReactNode;
  /** Called on load and after every filter, sort, selection or page change, with the selected keys and the page. */
  onChange?: (state: DataTableState) => void;
}

const tick = 'M4 10.5l4 4 8-9';
const dash = 'M5 10h10';

/** The system's checkbox, as the datatable behaviour expects it. */
function Check(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="tray-check">
      <input type="checkbox" {...props} />
      <span className="tray-check__box">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path className="tray-check__tick" d={tick} />
          <path className="tray-check__dash" d={dash} />
        </svg>
      </span>
    </label>
  );
}

/**
 * The sort icon. The behaviour swaps its `<use>` between 'arrow-up-down', 'arrow-up' and 'arrow-down' when a column is sorted,
 * so it stays a reference to the system's icon sprite, which the runtime adds to the page.
 */
function SortIcon({ dir }: { dir?: DataTableSortDirection }) {
  const name = dir === 'ascending' ? 'arrow-up' : dir === 'descending' ? 'arrow-down' : 'arrow-up-down';
  return (
    <svg className="tray-icon tray-icon--sm" aria-hidden="true" focusable="false">
      <use href={`#tray-i-${name}`} />
    </svg>
  );
}

function compare(x: number | string, y: number | string): number {
  return (x as number) > (y as number) ? 1 : (x as number) < (y as number) ? -1 : 0;
}

/** "orders" gives "order", "batches" "batch", "deliveries" "delivery": the name of one row, for its checkbox. */
function singular(plural: string): string {
  if (/ies$/.test(plural)) return plural.slice(0, -3) + 'y';
  if (/(ch|sh|x|ss)es$/.test(plural)) return plural.slice(0, -2);
  return plural.replace(/s$/, '');
}

/**
 * A data table is a Table that can be searched, sorted, selected and paged.
 * A filter bar above, checkboxes at the start of each row, sort buttons in the heads, the selection count and pager at the foot: every part is optional.
 * The system's own behaviour runs it in the page; for data that lives on a server, filter, sort and page there and use Table.
 */
export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(function DataTable(
  { label, itemLabel, columns, rows, rowKey = 'id', filter, actions, selectable, defaultSelected, defaultSort, pageSize, rowActions, empty, onChange, className, ...rest },
  ref,
) {
  const noun = itemLabel ?? singular(label.toLowerCase());
  const own = React.useRef<HTMLDivElement | null>(null);
  const keyOf = (row: TableRow, i: number) => textOf(row[rowKey]) ?? String(i);

  const sortCol = defaultSort ? columns.find((c) => c.key === defaultSort.key) : undefined;
  const ordered = rows.map((row, i) => ({ row, i }));
  if (sortCol && defaultSort) {
    const by = (row: TableRow) => sortKey(String(sortCol.sortValue ? sortCol.sortValue(row) : textOf(row[sortCol.key]) ?? ''));
    const sign = defaultSort.direction === 'ascending' ? 1 : -1;
    ordered.sort((a, b) => compare(by(a.row), by(b.row)) * sign);
  }

  // The behaviour reads the rows once, when it starts: a new set of rows, columns or parts starts a fresh table.
  const sig = [pageSize ?? 0, selectable ? 1 : 0, filter ? 1 : 0, rowActions ? 1 : 0, columns.map((c) => c.key + (c.sortable ? '*' : '')).join(','), ordered.map((o) => keyOf(o.row, o.i)).join(',')].join('|');
  React.useImperativeHandle(ref, () => own.current as HTMLDivElement, [sig]);

  const saved = React.useRef(onChange);
  saved.current = onChange;
  React.useEffect(() => {
    const el = own.current;
    if (!el) return;
    let heard = false;
    const report = (page: number) => {
      const selected = Array.from(el.querySelectorAll<HTMLInputElement>('tbody [data-select]'))
        .filter((c) => c.checked)
        .map((c) => c.closest('tr')?.getAttribute('data-key') ?? '');
      saved.current?.({ selected, page });
    };
    const listen = (e: Event) => {
      e.stopPropagation();
      heard = true;
      report((e as CustomEvent<{ page: number }>).detail.page);
    };
    el.addEventListener('tray:change', listen);
    runtime.init(el);
    // The page's own start may have wired the table before this effect ran: report the state on load all the same.
    if (!heard) report(0);
    return () => el.removeEventListener('tray:change', listen);
  }, [sig]);

  const head = columns.find((c) => c.rowHeader);
  const span = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
  const picked = new Set(defaultSelected ?? []);

  return (
    <div key={sig} ref={own} className={cx('tray-datatable', className)} data-tray="datatable" data-page-size={pageSize} {...rest}>
      {filter != null || actions != null ? (
        <div className="tray-datatable__bar">
          {filter != null ? (
            <div className="tray-input-group tray-input-group--sm">
              <span className="tray-input-group__addon">
                <Icon name="search" />
              </span>
              <Input type="search" placeholder={filter} aria-label={filter} data-filter="" />
            </div>
          ) : null}
          {actions}
        </div>
      ) : null}
      <Table hover pad wide aria-label={label}>
        <thead>
          <tr>
            {selectable ? (
              <th className="tray-table__check">
                <Check data-select-all="" aria-label={`Select all ${label.toLowerCase()}`} />
              </th>
            ) : null}
            {columns.map((col) => {
              const dir = defaultSort?.key === col.key ? defaultSort.direction : undefined;
              const content = col.sortable ? (
                <button className="tray-sort" type="button">
                  {col.header}
                  <SortIcon dir={dir} />
                </button>
              ) : (
                col.header
              );
              return headCell(col, content, { 'aria-sort': dir });
            })}
            {rowActions ? (
              <th>
                <span className="tray-vh">Actions</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {ordered.map(({ row, i }) => {
            const k = keyOf(row, i);
            const name = (head && textOf(row[head.key])) ?? k;
            return (
              <tr key={k} data-key={k}>
                {selectable ? (
                  <td className="tray-table__check">
                    <Check data-select="" aria-label={`Select ${noun} ${name}`} defaultChecked={picked.has(k)} />
                  </td>
                ) : null}
                {columns.map((col) =>
                  bodyCell(col, col.render ? col.render(row, i) : row[col.key], col.sortValue ? { 'data-value': String(col.sortValue(row)) } : undefined),
                )}
                {rowActions ? <td className="tray-table__act">{rowActions(row, i)}</td> : null}
              </tr>
            );
          })}
          <tr data-empty="" hidden>
            <td colSpan={span}>
              {empty ??
                (rows.length ? (
                  <Empty size="sm" title="Nothing matches that filter" description="Check the spelling, or clear the filter." />
                ) : (
                  <Empty size="sm" title="Nothing to show yet" />
                ))}
            </td>
          </tr>
        </tbody>
      </Table>
      {selectable || pageSize ? (
        <div className="tray-datatable__foot">
          <span data-selected-count="" role="status" />
          {pageSize ? (
            <div className="tray-row tray-row--sm">
              <span data-page-status="" role="status" />
              <button className="tray-btn tray-btn--quiet tray-btn--xs tray-btn--icon" type="button" data-page-prev="" aria-label="Previous page">
                <Icon name="chevron-left" flip />
              </button>
              <button className="tray-btn tray-btn--quiet tray-btn--xs tray-btn--icon" type="button" data-page-next="" aria-label="Next page">
                <Icon name="chevron-right" flip />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
DataTable.displayName = 'DataTable';
