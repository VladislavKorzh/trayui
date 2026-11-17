import * as React from 'react';
import { Button, NotificationCenter, type NotificationItem } from 'trayui-react';

const items: NotificationItem[] = [
  { id: 'n1', actor: 'Dana Kovalenko', text: 'placed order PL-20431, two jars of 50 g.', time: '4 minutes ago', initials: 'DK', href: '#', unread: true },
  { id: 'n2', actor: 'The courier', text: 'could not reach the address for PL-20418.', time: '32 minutes ago', icon: 'truck', href: '#', unread: true },
  { id: 'n3', actor: 'Invoice CN-0042', text: 'was paid, $29.00.', time: 'Yesterday, 09:12', icon: 'credit-card', href: '#' },
  { id: 'n4', actor: 'Bohdan Savchuk', text: 'joined the workspace as a packer.', time: '12 November', initials: 'BS', href: '#' },
];

export function Open() {
  return (
    <div className="tray-row" style={{ justifyContent: 'flex-end', alignItems: 'flex-start', minBlockSize: 590 }}>
      <NotificationCenter
        items={items}
        defaultOpen
        footer={<Button variant="link" href="#">Notification settings</Button>}
      />
    </div>
  );
}

export function KeepingTheCount() {
  const [saved, setSaved] = React.useState<string[]>([]);
  return (
    <div className="tray-row tray-row--between" style={{ alignItems: 'flex-start', minBlockSize: 470 }}>
      <p className="tray-soft" style={{ maxInlineSize: '30rem' }}>
        {saved.length
          ? `Marked read and saved: ${saved.join(', ')}. The count on the bell follows.`
          : 'Open a notification or "Mark all as read": the count on the bell follows, and the ids are saved.'}
      </p>
      <NotificationCenter
        items={items.map((n) => ({ ...n, href: undefined }))}
        filter={false}
        defaultOpen
        onRead={(ids) => setSaved((s) => [...s, ...ids])}
      />
    </div>
  );
}
