import { Button, Table, Tabs, Tour } from 'trayui-react';

function OrdersScreen({ prefix }: { prefix: string }) {
  return (
    <>
      <div className="tray-pagehead">
        <div className="tray-pagehead__row">
          <div className="tray-pagehead__text">
            <h2 className="title">Orders</h2>
          </div>
          <div className="tray-pagehead__actions">
            <Button variant="quiet" size="sm" icon="download" id={`${prefix}-export`}>
              Export
            </Button>
            <Button size="sm" icon="plus" id={`${prefix}-new`}>
              New order
            </Button>
          </div>
        </div>
        <div className="tray-row tray-row--sm">
          <Tabs
            id={`${prefix}-tabs`}
            mode="navigation"
            label="Orders by status"
            items={[
              { value: 'pack', label: 'To pack', count: 12, href: '#' },
              { value: 'courier', label: 'With the courier', href: '#' },
              { value: 'delivered', label: 'Delivered', href: '#' },
            ]}
          />
        </div>
      </div>
      <div style={{ marginBlockStart: 'var(--space-5)' }}>
        <Table
          columns={[
            { key: 'order', header: 'Order', rowHeader: true },
            { key: 'customer', header: 'Customer' },
            { key: 'total', header: 'Total', numeric: true },
          ]}
          rows={[
            { order: 'PL-20431', customer: 'Dana Kovalenko', total: '$118.00' },
            { order: 'PL-20430', customer: 'Marta Hrytsenko', total: '$59.00' },
            { order: 'PL-20429', customer: 'Taras Shevchuk', total: '$236.00' },
          ]}
        />
      </div>
    </>
  );
}

const steps = (prefix: string) => [
  { target: `#${prefix}-tabs`, title: 'Orders move left to right', text: 'Everything new lands in “To pack”. Marking it packed sends it on.' },
  { target: `#${prefix}-export`, title: 'Take the list with you', text: 'Export what you see as a spreadsheet, filters included.' },
  { target: `#${prefix}-new`, title: 'Orders by phone go here', text: 'Add an order yourself when a customer calls the farm.' },
];

export function FirstStep() {
  return (
    <Tour steps={steps('tour-a')} style={{ minBlockSize: '26rem' }}>
      <OrdersScreen prefix="tour-a" />
    </Tour>
  );
}

export function LaterStep() {
  return (
    <Tour steps={steps('tour-b')} defaultStep={1} style={{ minBlockSize: '26rem' }}>
      <OrdersScreen prefix="tour-b" />
    </Tour>
  );
}
