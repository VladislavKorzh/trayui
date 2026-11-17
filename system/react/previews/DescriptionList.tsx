import { Badge, Card, DescriptionList } from 'trayui-react';

export function OrderDetails() {
  return (
    <div className="tray-row" style={{ alignItems: 'flex-start' }}>
      <DescriptionList
        style={{ flex: '1 1 14rem', minInlineSize: '24rem' }}
        items={[
          { term: 'Customer', value: <a href="#">Dana Kovalenko</a> },
          { term: 'Status', value: <Badge>To pack</Badge> },
          { term: 'Delivery', value: 'Courier, chilled box, 16 November' },
          { term: 'Tracking number', value: 'PL20431UA', numeric: true, copy: 'Copy the tracking number' },
          { term: 'Gift note' },
          { term: 'Total', value: '$118.00', numeric: true },
        ]}
      />
      <Card style={{ flex: '0 1 17rem', padding: 'var(--space-6)', borderRadius: 'var(--radius-panel)' }}>
        <h3 className="nav" style={{ marginBlockEnd: 'var(--space-3)', fontWeight: 600 }}>
          Plan
        </h3>
        <DescriptionList
          plain
          stack
          items={[
            { term: 'Current plan', value: 'Shop, monthly' },
            { term: 'Next invoice', value: '$29.00 on 1 December', numeric: true },
            { term: 'Paid with', value: 'Card ending 4242' },
          ]}
        />
      </Card>
    </div>
  );
}

export function Stacked() {
  return (
    <div style={{ maxInlineSize: '22rem' }}>
      <DescriptionList
        stack
        items={[
          { term: 'Delivery address', value: '12 Orchard Row, Kyiv, 01001' },
          { term: 'Phone', value: '+380 00 123 45 67', numeric: true },
          { term: 'Delivery note', value: 'Leave the box with the neighbour at number 14.' },
        ]}
      />
    </div>
  );
}
