// Helpers shared by Table and DataTable. Not exported from the package.
import * as React from 'react';
import type { TableColumn } from '../components/Table';

/** A cell of the head row for one column. */
export function headCell(col: TableColumn, content: React.ReactNode = col.header, extra?: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th key={col.key} scope="col" data-num={col.numeric ? '' : undefined} {...extra}>
      {content}
    </th>
  );
}

type CellExtra = React.TdHTMLAttributes<HTMLTableCellElement> & { [data: `data-${string}`]: string | undefined };

/** A cell of a body or footer row for one column: a row head or a data cell. */
export function bodyCell(col: TableColumn, content: React.ReactNode, extra?: CellExtra) {
  const num = col.numeric ? '' : undefined;
  return col.rowHeader ? (
    <th key={col.key} scope="row" data-num={num} {...extra}>
      {content}
    </th>
  ) : (
    <td key={col.key} data-num={num} {...extra}>
      {content}
    </td>
  );
}

/** The plain text of a value, when it has one. */
export function textOf(v: React.ReactNode): string | undefined {
  return typeof v === 'string' || typeof v === 'number' ? String(v) : undefined;
}

/** The value a cell sorts by: a number when it reads as one, otherwise lower-case text. The same rule as the datatable behaviour. */
export function sortKey(v: string): number | string {
  const n = parseFloat(v.replace(/[^0-9.-]/g, ''));
  return /^[^a-z]*[0-9]/i.test(v) && !isNaN(n) ? n : v.toLowerCase();
}

/** The wrap of a table that may be wider than the screen: a region the keyboard reaches, named as the table is. */
export function wideRegion(captionId: string | undefined, table: React.AriaAttributes): React.HTMLAttributes<HTMLDivElement> {
  const labelledBy = captionId ?? table['aria-labelledby'];
  return { role: 'region', tabIndex: 0, 'aria-labelledby': labelledBy, 'aria-label': labelledBy ? undefined : table['aria-label'] };
}
