import * as React from 'react';
import { Button, Sidebar, type SidebarGroup } from 'trayui-react';

const groups: SidebarGroup[] = [
  {
    label: 'Shop',
    items: [
      { label: 'Orders', icon: 'inbox', href: '#', count: 12 },
      { label: 'Batches', icon: 'shopping-bag', href: '#' },
      { label: 'Customers', icon: 'users', href: '#' },
    ],
  },
  {
    label: 'Farm',
    items: [
      { label: 'Beds', icon: 'layout-grid', href: '#', items: [{ label: 'Bed A', href: '#' }, { label: 'Bed B', href: '#' }] },
      { label: 'Field notes', icon: 'pencil', href: '#' },
      { label: 'Settings', icon: 'settings', href: '#' },
    ],
  },
];

const wordmark = (
  <a className="tray-wordmark" href="#" style={{ fontSize: '1.375rem' }}>
    Perly
  </a>
);

export function InAShell() {
  return (
    <div className="tray-shell">
      <Sidebar
        groups={groups}
        defaultValue="Orders"
        head={wordmark}
        collapsible
        user={{ name: 'Oksana Franko', role: 'Farm manager', initials: 'OF' }}
      />
      <main className="tray-shell__main tray-stack" style={{ padding: 'var(--space-4)' }}>
        <h2 className="title">Orders</h2>
        <p className="tray-soft">Twelve orders are waiting to be packed. Use the button at the top of the sidebar to collapse it to a rail.</p>
      </main>
    </div>
  );
}

export function SecondLevel() {
  return (
    <Sidebar
      label="Farm"
      defaultValue="Bed A"
      groups={[
        {
          label: 'Farm',
          items: [
            { label: 'Beds', icon: 'layout-grid', href: '#', items: [{ label: 'Bed A', href: '#' }, { label: 'Bed B', href: '#' }, { label: 'Bed C', href: '#' }] },
            { label: 'Field notes', icon: 'pencil', href: '#' },
          ],
        },
      ]}
    />
  );
}

export function CollapsedRail() {
  const [collapsed, setCollapsed] = React.useState(true);
  return (
    <div className="tray-shell">
      <Sidebar groups={groups} defaultValue="Orders" head={wordmark} collapsible collapsed={collapsed} onCollapsedChange={setCollapsed} user={{ name: 'Oksana Franko', role: 'Farm manager', initials: 'OF' }} />
      <main className="tray-shell__main tray-stack" style={{ padding: 'var(--space-4)' }}>
        <h2 className="title">Orders</h2>
        <p className="tray-soft">Collapsed to a rail, the sidebar keeps one icon per item and gives the page the room.</p>
        <div>
          <Button variant="quiet" size="sm" icon="panel-left" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? 'Expand the sidebar' : 'Collapse the sidebar'}
          </Button>
        </div>
      </main>
    </div>
  );
}
