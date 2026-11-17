import * as React from 'react';
import { Card, Tabs } from 'trayui-react';

export function Panels() {
  return (
    <Tabs
      label="Order PL-20418"
      items={[
        { value: 'items', label: 'Items', content: <p className="tray-soft">Two jars of 50 g and a gift box.</p> },
        { value: 'delivery', label: 'Delivery', content: <p className="tray-soft">Courier, chilled box, today between 14:00 and 18:00.</p> },
        { value: 'messages', label: 'Messages', count: 3, content: <p className="tray-soft">Three messages from the courier.</p> },
        { value: 'refunds', label: 'Refunds', disabled: true, content: null },
      ]}
    />
  );
}

export function NavigationFill() {
  return (
    <Card style={{ padding: 'var(--space-5)' }}>
      <Tabs
        mode="navigation"
        fill
        label="Sections"
        defaultValue="notes"
        items={[
          { value: 'guide', label: 'The guide', href: '#' },
          { value: 'notes', label: 'Field notes', href: '#' },
          { value: 'orders', label: 'Orders', href: '#' },
        ]}
      />
    </Card>
  );
}

export function ScrollingStrip() {
  return (
    <div style={{ maxInlineSize: '24rem' }}>
      <Tabs
        mode="navigation"
        current="section"
        scroll
        label="Sections of the guide"
        defaultValue="identify"
        items={['Identify', 'Marks', 'Serve', 'Habitat', 'Season', 'Order', 'Questions'].map((s) => ({ value: s.toLowerCase(), label: s, href: '#' }))}
      />
    </div>
  );
}

const totals: Record<string, string> = {
  week: '38 orders, $2,470',
  month: '164 orders, $10,980',
  year: '1,912 orders, $126,400',
};

export function Controlled() {
  const [period, setPeriod] = React.useState('month');
  return (
    <div className="tray-stack">
      <Tabs
        label="Period"
        value={period}
        onChange={setPeriod}
        items={[
          { value: 'week', label: 'This week' },
          { value: 'month', label: 'This month' },
          { value: 'year', label: 'This year' },
        ]}
      />
      <p className="subtitle">{totals[period]}</p>
    </div>
  );
}
