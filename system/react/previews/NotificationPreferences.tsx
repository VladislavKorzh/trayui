import * as React from 'react';
import { NotificationPreferences, type NotificationChannel, type NotificationGroup } from 'trayui-react';

const channels: NotificationChannel[] = [
  { key: 'email', label: 'Email', spoken: 'by email' },
  { key: 'push', label: 'Push', spoken: 'by push' },
  { key: 'sms', label: 'Text', spoken: 'by text message' },
];

const groups: NotificationGroup[] = [
  {
    label: 'Orders',
    events: [
      { key: 'order-new', title: 'A new order arrives', description: 'Once per order.' },
      { key: 'courier-failed', title: 'The courier cannot deliver', description: 'So you can call the customer.' },
      { key: 'batch-low', title: 'A batch is nearly sold out', description: 'When fewer than 50 jars are left.' },
    ],
  },
  {
    label: 'Account',
    events: [
      { key: 'payment-failed', title: 'A payment fails', description: 'Always on by email: the plan depends on it.', locked: ['email'] },
      { key: 'member-joined', title: 'Someone joins the workspace', description: 'When an invitation is accepted.' },
      { key: 'news', title: 'News from Counter', description: 'New features, a few times a year.', unavailable: ['sms'] },
    ],
  },
];

export function Grid() {
  return (
    <NotificationPreferences
      channels={channels}
      groups={groups}
      defaultValue={{
        'order-new': ['push'],
        'courier-failed': ['email', 'push', 'sms'],
        'batch-low': ['email'],
        'payment-failed': ['push'],
        'member-joined': ['email'],
      }}
    />
  );
}

const titles: Record<string, string> = Object.fromEntries(groups.flatMap((g) => g.events.map((e) => [e.key, e.title])));
const spoken: Record<string, string> = { email: 'by email', push: 'by push' };

export function SavesEachChange() {
  const [said, setSaid] = React.useState('Each change saves at once.');
  return (
    <div className="tray-stack">
      <NotificationPreferences
        channels={[channels[0]!, channels[1]!, { key: 'sms', label: <a href="#">Add a phone number</a>, disabled: true }]}
        groups={[{ events: groups[0]!.events }]}
        defaultValue={{ 'order-new': ['email'], 'courier-failed': ['email', 'push'] }}
        onChange={(_, c) => setSaid(`Saved. ${titles[c.event]}, ${spoken[c.channel]}: ${c.checked ? 'on' : 'off'}.`)}
      />
      <p className="tray-demo-note" role="status">{said}</p>
    </div>
  );
}
