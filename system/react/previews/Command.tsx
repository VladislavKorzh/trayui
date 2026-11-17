import * as React from 'react';
import { Command, type CommandGroup } from 'trayui-react';

const groups: CommandGroup[] = [
  {
    label: 'Go to',
    items: [
      { label: 'Orders', icon: 'inbox', shortcut: ['G', 'O'] },
      { label: 'Batches', icon: 'shopping-bag', shortcut: ['G', 'B'] },
      { label: 'Field notes', icon: 'pencil' },
    ],
  },
  {
    label: 'Actions',
    items: [
      { label: 'Create an order', icon: 'plus', shortcut: ['Ctrl', 'N'] },
      { label: 'Export orders', icon: 'download' },
      { label: 'Switch to the dark theme', icon: 'moon' },
    ],
  },
];

export function Palette() {
  return (
    <div className="tray-row" style={{ justifyContent: 'center' }}>
      <Command groups={groups} />
    </div>
  );
}

export function Filtered() {
  return (
    <div className="tray-row" style={{ justifyContent: 'center' }}>
      <Command groups={groups} defaultQuery="order" />
    </div>
  );
}

export function NothingMatches() {
  return (
    <div className="tray-row" style={{ justifyContent: 'center' }}>
      <Command groups={groups} defaultQuery="invoice" hints={false} />
    </div>
  );
}

export function RunningAnItem() {
  const [ran, setRan] = React.useState('');
  return (
    <div className="tray-stack" style={{ justifyItems: 'center' }}>
      <Command
        placeholder="Find an order or a customer"
        onSelect={setRan}
        groups={[
          {
            label: 'Recent orders',
            items: [
              { label: 'PL-20431, Dana Kovalenko', value: 'PL-20431', icon: 'receipt-text' },
              { label: 'PL-20418, Oksana Franko', value: 'PL-20418', icon: 'receipt-text' },
            ],
          },
          { label: 'Customers', items: [{ label: 'Dana Kovalenko', icon: 'user' }] },
        ]}
      />
      <p className="tray-soft">{ran ? `Opening ${ran}` : 'Choose an order with the mouse or with Enter.'}</p>
    </div>
  );
}
