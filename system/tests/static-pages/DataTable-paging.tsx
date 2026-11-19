// A test page for static parity (tests/components/DataTable.py, STATIC_PAGES): a paged table and nothing else, so the
// pager's buttons are among the first controls pressed. The preview pages its orders too, behind many other controls.
// Not a usage example.
import { DataTable, type DataTableColumn, type DataTableRow } from 'trayui-react';

const columns: DataTableColumn[] = [
  { key: 'id', header: 'Order', rowHeader: true },
  { key: 'customer', header: 'Customer' },
  { key: 'total', header: 'Total', numeric: true },
];

const rows: DataTableRow[] = [
  { id: 'PL-20418', customer: 'Dana Kovalenko', total: '$127' },
  { id: 'PL-20417', customer: 'Anna Melnyk', total: '$68' },
  { id: 'PL-20416', customer: 'Bohdan Shevchuk', total: '$236' },
  { id: 'PL-20415', customer: 'Oksana Franko', total: '$59' },
  { id: 'PL-20414', customer: 'Taras Bondar', total: '$118' },
  { id: 'PL-20413', customer: 'Iryna Lysenko', total: '$48' },
  { id: 'PL-20412', customer: 'Marko Petrenko', total: '$177' },
];

export function Paged() {
  return <DataTable label="Orders" itemLabel="orders" columns={columns} rows={rows} pageSize={3} />;
}
