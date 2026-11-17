import { ActivityFeed, Card } from 'trayui-react';

export function Workspace() {
  return (
    <ActivityFeed
      style={{ maxWidth: 520 }}
      items={[
        {
          day: 'Today',
          initials: 'OF',
          text: <><b>Oksana Franko</b> changed the delivery day of <a href="#">PL-20418</a> to Tuesday.</>,
          time: '10:42',
          dateTime: '2026-11-15T10:42',
          detail: '“The customer is away until Monday evening.”',
        },
        { icon: 'credit-card', text: <><b>Invoice CN-0042</b> was paid.</>, time: '09:12', dateTime: '2026-11-15T09:12', detail: '$29.00, card ending 4242' },
        { initials: 'BS', text: <><b>Bohdan Savchuk</b> packed 9 orders.</>, time: '08:30', dateTime: '2026-11-15T08:30' },
        { day: 'Yesterday', icon: 'user-plus', text: <><b>Andriy Tkachuk</b> was invited as a packer by Oksana Franko.</>, time: '17:05', dateTime: '2026-11-14T17:05' },
        { icon: 'key', text: <>The API key <b>Storefront</b> was created.</>, time: '11:20', dateTime: '2026-11-14T11:20' },
      ]}
    />
  );
}

export function OnAnOrder() {
  return (
    <Card style={{ maxWidth: 460, padding: 'var(--space-6)', borderRadius: 'var(--radius-panel)' }}>
      <h3 className="nav" style={{ marginBlockEnd: 'var(--space-4)', fontWeight: 600 }}>On order PL-20418</h3>
      <ActivityFeed
        items={[
          { icon: 'truck', text: 'Handed to the courier.', time: 'Today, 14:02' },
          { icon: 'package', text: <>Packed by <b>Bohdan Savchuk</b>.</>, time: 'Today, 08:30' },
          { icon: 'inbox', text: <>Placed by <b>Ivan Petrenko</b>.</>, time: '13 November, 19:47' },
        ]}
      />
    </Card>
  );
}
