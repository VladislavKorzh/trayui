import * as React from 'react';
import { DropdownMenu, type MenuItem } from 'trayui-react';

const orderActions: MenuItem[] = [
  { label: 'Open', icon: 'external-link', shortcut: 'Enter' },
  { label: 'Duplicate', icon: 'copy', shortcut: 'Ctrl D' },
  { label: 'Copy the link', icon: 'link' },
  { type: 'separator' },
  { type: 'checkbox', label: 'Notify the customer', icon: 'bell', defaultChecked: true },
  { type: 'submenu', label: 'Move to', icon: 'folder', items: [{ label: 'Packed' }, { label: 'On hold' }] },
  { type: 'separator' },
  { label: 'Delete order', icon: 'trash-2', danger: true },
];

export function Actions() {
  return (
    <div className="tray-stage tray-stage--page tray-stage--start" style={{ minHeight: 430 }}>
      <div className="tray-row" style={{ width: '100%' }}>
        <DropdownMenu label="Actions" items={orderActions} defaultOpen />
        <DropdownMenu
          aria-label="More actions"
          align="end"
          style={{ marginInlineStart: 'auto' }}
          items={[
            { label: 'Edit', icon: 'pencil' },
            { label: 'Archive', icon: 'inbox' },
          ]}
        />
      </div>
    </div>
  );
}

export function ChoicesAtTheEnd() {
  return (
    <div className="tray-stage tray-stage--page tray-stage--start" style={{ minHeight: 400 }}>
      <div className="tray-row" style={{ width: '100%', justifyContent: 'flex-end' }}>
        <DropdownMenu
          icon="ellipsis-vertical"
          aria-label="Order PL-20431"
          align="end"
          defaultOpen
          items={[
            { type: 'label', label: 'Sort by' },
            { type: 'radio', group: 'sort', label: 'Newest first', defaultChecked: true },
            { type: 'radio', group: 'sort', label: 'Oldest first' },
            { type: 'radio', group: 'sort', label: 'Largest total' },
            { type: 'separator' },
            { type: 'checkbox', label: 'Show cancelled orders' },
            { label: 'Export orders', href: '#' },
          ]}
        />
      </div>
    </div>
  );
}

export function Controlled() {
  const [notify, setNotify] = React.useState(false);
  const [last, setLast] = React.useState('nothing yet');
  return (
    <div className="tray-stage tray-stage--page tray-stage--start" style={{ minHeight: 330 }}>
      <div className="tray-row">
        <DropdownMenu
          label="Order PL-20431"
          defaultOpen
          onSelect={(value) => setLast(value)}
          items={[
            { label: 'Print the label', icon: 'receipt-text', value: 'print', shortcut: 'Ctrl P' },
            { label: 'Send a reminder', icon: 'mail', value: 'remind' },
            { type: 'checkbox', label: 'Notify Dana Kovalenko', icon: 'bell', checked: notify, onCheckedChange: setNotify },
            { label: 'Refund', icon: 'dollar-sign', disabled: true },
          ]}
        />
        <p className="tray-soft">
          Notify: {notify ? 'on' : 'off'}. Last action: {last}.
        </p>
      </div>
    </div>
  );
}
