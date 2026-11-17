import * as React from 'react';
import { ContextMenu, type ContextMenuItem } from 'trayui-react';

const orderActions: ContextMenuItem[] = [
  { label: 'Open', icon: 'external-link' },
  { label: 'Duplicate', icon: 'copy' },
  { label: 'Copy the link', icon: 'link' },
  { type: 'separator' },
  { label: 'Delete order', icon: 'trash-2', danger: true },
];

export function Open() {
  return (
    <ContextMenu aria-label="Order PL-20418" items={orderActions} defaultOpen>
      <span>Right-click anywhere in this area</span>
    </ContextMenu>
  );
}

export function WithShortcuts() {
  const [last, setLast] = React.useState('');
  return (
    <div className="tray-stack">
      <ContextMenu
        aria-label="Batch of 12 November"
        defaultOpen
        onSelect={setLast}
        items={[
          { type: 'label', label: 'Batch of 12 November' },
          { label: 'Reserve jars', icon: 'shopping-bag', shortcut: 'R' },
          { label: 'Print labels', icon: 'receipt-text', shortcut: 'Ctrl P' },
          { type: 'separator' },
          { label: 'Write off the batch', icon: 'trash-2', danger: true },
        ]}
      >
        <span>412 jars, packed 12 November</span>
      </ContextMenu>
      <p className="tray-soft">{last ? `Chosen: ${last}` : 'Right-click the batch, or focus it and press Shift F10.'}</p>
    </div>
  );
}
