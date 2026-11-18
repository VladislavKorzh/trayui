import { Badge, Card, Table, type TableColumn } from 'trayui-react';

const columns: TableColumn[] = [
  { key: 'month', header: 'Month', rowHeader: true },
  { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'In season' ? 'accent' : 'off'}>{row.status}</Badge> },
  { key: 'collected', header: 'Collected', numeric: true },
  {
    key: 'delta',
    header: 'Against 2025',
    numeric: true,
    render: (row) => {
      const d = String(row.delta);
      return <span className={d.startsWith('+') ? 'tray-success' : d.startsWith('−') ? 'tray-danger' : undefined}>{d}</span>;
    },
  },
];

const rows = [
  { month: 'April', status: 'Closed', collected: '14 kg', delta: '+2 kg' },
  { month: 'May', status: 'Closed', collected: '22 kg', delta: '+5 kg' },
  { month: 'September', status: 'Closed', collected: '15 kg', delta: '−1 kg' },
  { month: 'November', status: 'In season', collected: '2 kg', delta: '0 kg' },
];

export function SeasonRecord() {
  return <Table wide caption="Season record" columns={columns} rows={rows} rowKey="month" footer={{ month: 'Season so far', collected: '104 kg', delta: '+11 kg' }} />;
}

export function CompactInACard() {
  return (
    <Card title="Delivery prices" description="Chilled box, by zone." style={{ maxWidth: 560 }}>
      <Table compact aria-label="Delivery prices">
        <thead>
          <tr>
            <th scope="col">Zone</th>
            <th scope="col">Arrives</th>
            <th scope="col" data-num>Price</th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row">Kyiv</th><td>The same day</td><td data-num>$9</td></tr>
          <tr><th scope="row">Kyiv region</th><td>Next morning</td><td data-num>$12</td></tr>
          <tr><th scope="row">Rest of Ukraine</th><td>Two to three days</td><td data-num>$5</td></tr>
        </tbody>
      </Table>
    </Card>
  );
}
