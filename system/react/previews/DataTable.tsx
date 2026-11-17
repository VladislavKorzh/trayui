import * as React from 'react';
import { Badge, Button, DataTable, type DataTableColumn, type DataTableRow } from 'trayui-react';

const status = (row: DataTableRow) =>
  row.status === 'paid' ? (
    <Badge tone="success" icon="circle-check">Paid</Badge>
  ) : row.status === 'failed' ? (
    <Badge tone="danger" icon="circle-alert">Payment failed</Badge>
  ) : (
    <Badge>Pay on delivery</Badge>
  );

const columns: DataTableColumn[] = [
  { key: 'id', header: 'Order', rowHeader: true, sortable: true },
  { key: 'customer', header: 'Customer', sortable: true },
  { key: 'status', header: 'Status', render: status },
  { key: 'placed', header: 'Placed', sortable: true, sortValue: (row) => String(row.date) },
  { key: 'total', header: 'Total', numeric: true, sortable: true },
];

const orders: DataTableRow[] = [
  { id: 'PL-20418', customer: 'Dana Kovalenko', status: 'paid', placed: '14 Nov', date: '2026-11-14', total: '$127' },
  { id: 'PL-20417', customer: 'Anna Melnyk', status: 'paid', placed: '14 Nov', date: '2026-11-14', total: '$68' },
  { id: 'PL-20416', customer: 'Bohdan Shevchuk', status: 'cod', placed: '13 Nov', date: '2026-11-13', total: '$236' },
  { id: 'PL-20415', customer: 'Oksana Franko', status: 'failed', placed: '13 Nov', date: '2026-11-13', total: '$59' },
  { id: 'PL-20414', customer: 'Taras Bondar', status: 'paid', placed: '12 Nov', date: '2026-11-12', total: '$118' },
  { id: 'PL-20413', customer: 'Iryna Lysenko', status: 'cod', placed: '11 Nov', date: '2026-11-11', total: '$48' },
  { id: 'PL-20412', customer: 'Marko Petrenko', status: 'paid', placed: '10 Nov', date: '2026-11-10', total: '$177' },
  { id: 'PL-20411', customer: 'Sofia Hrytsenko', status: 'paid', placed: '9 Nov', date: '2026-11-09', total: '$39' },
];

const more = (row: DataTableRow) => <Button variant="ghost" size="xs" icon="ellipsis" aria-label={`Actions for order ${row.id}`} />;

export function Orders() {
  return (
    <DataTable
      label="Orders"
      columns={columns}
      rows={orders}
      filter="Filter orders"
      actions={<Button variant="quiet" size="sm" icon="download">Export</Button>}
      selectable
      defaultSelected={['PL-20418', 'PL-20416']}
      defaultSort={{ key: 'placed', direction: 'descending' }}
      pageSize={5}
      rowActions={more}
    />
  );
}

export function BulkActions() {
  const [selected, setSelected] = React.useState<string[]>([]);
  return (
    <DataTable
      label="Orders to ship"
      columns={columns.filter((c) => c.key !== 'status')}
      rows={orders.slice(0, 4)}
      filter="Filter orders"
      actions={
        <Button variant="dark" size="sm" icon="truck" disabled={!selected.length}>
          {selected.length ? `Ship ${selected.length} ${selected.length === 1 ? 'order' : 'orders'}` : 'Ship orders'}
        </Button>
      }
      selectable
      defaultSelected={['PL-20417']}
      onChange={(state) => setSelected(state.selected)}
    />
  );
}
