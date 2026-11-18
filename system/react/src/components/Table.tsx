import * as React from 'react';
import { cx, useUid } from '../lib/util';
import { bodyCell, headCell, wideRegion } from '../lib/data';

/** One row of a Table or Data Table: its values by column key. */
export type TableRow = Record<string, React.ReactNode>;

export interface TableColumn {
  /** The field of each row this column shows, and the column's identity. */
  key: string;
  /** The column head, in `label` type: "Month", "Collected, kg". Put the unit here when every row shares it. */
  header: React.ReactNode;
  /** Right-aligns the column and sets tabular figures, for amounts, weights and counts. */
  numeric?: boolean;
  /** Makes the cells row heads (`<th scope="row">`, semibold): the first column, the one that names the row. */
  rowHeader?: boolean;
  /** Draws the cell from the whole row instead of showing `row[key]` as it is: a Badge for a status, a coloured difference. */
  render?: (row: TableRow, index: number) => React.ReactNode;
}

export interface TableProps extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'children'> {
  /** The table's title above it, in `subtitle` type: "Season record". Give every table a caption or an `aria-label`. */
  caption?: React.ReactNode;
  /** The columns, in order. With `columns` and `rows` the table draws its own head and body; leave both out and write `<thead>` and `<tbody>` as children instead. */
  columns?: TableColumn[];
  /** The rows, one object per row with a value for each column key. */
  rows?: TableRow[];
  /** The field of a row that tells it apart, for React keys. Default: the row's position. */
  rowKey?: string;
  /** A totals row at the foot, semibold and without a rule under it, with a value for each column key: `{ month: 'Season so far', collected: '104 kg' }`. */
  footer?: TableRow;
  /** Tightens the rows (8px instead of 14px), for dense data in a side panel or a chart's figures. */
  compact?: boolean;
  /** Tints the row under the pointer, for rows that open or can be selected. */
  hover?: boolean;
  /** Insets the first and last cells, so text does not touch the edge of a tinted row. Use it with `hover`. */
  pad?: boolean;
  /** Free table content: `<thead>`, `<tbody>`, `<tfoot>`. Used when `columns` is left out. Mark numeric cells with `data-num` and give heads a `scope`. */
  children?: React.ReactNode;
  /**
   * The table may be wider than the screen. Its wrap, which scrolls it sideways, then becomes a region named as the table is
   * (by its caption, or its `aria-label`), which the keyboard can reach with Tab and scroll with the arrow keys.
   */
  wide?: boolean;
}

/**
 * A table sets figures in rows and columns: hairline rows, quiet heads, numbers aligned on the right.
 * Pass `columns` and `rows`, or write the `<thead>` and `<tbody>` yourself. Use Data Table to search, sort, select and page.
 * It sits in a wrapper that scrolls sideways on a phone; `className`, `aria-label` and the ref go to the `<table>`.
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  { caption, columns, rows = [], rowKey, footer, compact, hover, pad, wide, className, children, ...rest },
  ref,
) {
  const captionId = useUid('table-caption');
  return (
    <div className="tray-table-wrap" {...(wide ? wideRegion(caption != null ? captionId : undefined, rest) : null)}>
      <table ref={ref} className={cx('tray-table', compact && 'tray-table--compact', hover && 'tray-table--hover', pad && 'tray-table--pad', className)} {...rest}>
        {caption != null ? <caption id={wide ? captionId : undefined}>{caption}</caption> : null}
        {columns ? (
          <>
            <thead>
              <tr>{columns.map((col) => headCell(col))}</tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={rowKey ? String(row[rowKey]) : i}>{columns.map((col) => bodyCell(col, col.render ? col.render(row, i) : row[col.key]))}</tr>
              ))}
            </tbody>
            {footer ? (
              <tfoot>
                <tr>{columns.map((col) => bodyCell(col, footer[col.key]))}</tr>
              </tfoot>
            ) : null}
          </>
        ) : (
          children
        )}
      </table>
    </div>
  );
});
Table.displayName = 'Table';
