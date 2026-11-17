import * as React from 'react';
import { Menubar, type MenubarMenu } from 'trayui-react';

const menus: MenubarMenu[] = [
  {
    label: 'File',
    items: [
      { label: 'New order', shortcut: 'Ctrl N' },
      { label: 'Duplicate', shortcut: 'Ctrl D' },
      { type: 'separator' },
      { type: 'submenu', label: 'Export', items: [{ label: 'As a spreadsheet' }, { label: 'As a PDF' }] },
      { type: 'separator' },
      { label: 'Print', shortcut: 'Ctrl P' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: 'Ctrl Z' },
      { label: 'Redo', shortcut: 'Ctrl Y' },
      { type: 'separator' },
      { label: 'Find', shortcut: 'Ctrl F' },
      { label: 'Delete order', danger: true },
    ],
  },
  {
    label: 'View',
    items: [
      { type: 'checkbox', label: 'Show the totals', defaultChecked: true },
      { type: 'checkbox', label: 'Show cancelled orders' },
      { type: 'separator' },
      { type: 'label', label: 'Density' },
      { type: 'radio', group: 'density', label: 'Comfortable', defaultChecked: true },
      { type: 'radio', group: 'density', label: 'Compact' },
    ],
  },
];

export function ViewOpen() {
  return (
    <div className="tray-stage tray-stage--page tray-stage--start" style={{ minHeight: 350 }}>
      <Menubar aria-label="Orders" menus={menus} defaultOpen="View" />
    </div>
  );
}

export function FileOpen() {
  return (
    <div className="tray-stage tray-stage--page tray-stage--start" style={{ minHeight: 360 }}>
      <Menubar aria-label="Orders" menus={menus} defaultOpen="File" />
    </div>
  );
}

export function Controlled() {
  const [density, setDensity] = React.useState('Comfortable');
  const [totals, setTotals] = React.useState(true);
  return (
    <div className="tray-stage tray-stage--page tray-stage--start" style={{ minHeight: 330 }}>
      <div className="tray-row" style={{ alignItems: 'flex-start' }}>
        <Menubar
          aria-label="Field notes"
          defaultOpen="View"
          menus={[
            { label: 'File', items: [{ label: 'New note', shortcut: 'Ctrl N' }, { label: 'Print', shortcut: 'Ctrl P' }] },
            {
              label: 'View',
              items: [
                { type: 'checkbox', label: 'Show the totals', checked: totals, onCheckedChange: setTotals },
                { type: 'separator' },
                { type: 'label', label: 'Density' },
                { type: 'radio', group: 'density', label: 'Comfortable', checked: density === 'Comfortable', onSelect: () => setDensity('Comfortable') },
                { type: 'radio', group: 'density', label: 'Compact', checked: density === 'Compact', onSelect: () => setDensity('Compact') },
              ],
            },
          ]}
        />
        <p className="tray-soft" style={{ paddingBlockStart: 12 }}>
          Totals {totals ? 'shown' : 'hidden'}, {density.toLowerCase()} rows.
        </p>
      </div>
    </div>
  );
}
