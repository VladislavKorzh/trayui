import * as React from 'react';
import {
  AppShell,
  Badge,
  Button,
  Icon,
  NotificationCenter,
  PageHeader,
  Progress,
  Table,
  TopBar,
  UserMenu,
  WorkspaceSwitcher,
  type SidebarGroup,
  type TableColumn,
} from 'trayui-react';

const groups: SidebarGroup[] = [
  {
    items: [
      { label: 'Home', icon: 'house', href: '#' },
      { label: 'Orders', icon: 'inbox', href: '#', count: 12 },
      { label: 'Customers', icon: 'users', href: '#' },
      { label: 'Reports', icon: 'chart-column', href: '#' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Team', icon: 'user-plus', href: '#' },
      { label: 'Settings', icon: 'settings', href: '#' },
    ],
  },
];

const switcher = (
  <WorkspaceSwitcher
    defaultValue="perly"
    workspaces={[
      { value: 'perly', name: 'Perly Farm', detail: 'Shop plan' },
      { value: 'meadow', name: 'Meadow Bakery', detail: 'You are a packer here' },
      { value: 'hill', name: 'Hill Cheese', detail: 'Free plan' },
    ]}
  />
);

/* The usage meter belongs to the application set's UsageMeter; here it is its markup, with a Progress inside. */
const usage = (
  <div className="tray-usage tray-usage--sm" style={{ flex: 1 }}>
    <Progress label="Orders this month" value={842} max={1000} valueText="842 of 1,000" meter />
    <a className="tray-btn tray-btn--link" href="#" style={{ minBlockSize: 0, fontSize: '.9375rem' }}>
      Upgrade the plan
    </a>
  </div>
);

const topbarEnd = (
  <>
    <NotificationCenter
      items={[
        { id: 'n1', actor: 'Dana Kovalenko', text: 'placed order PL-20431.', time: '4 minutes ago', initials: 'DK', href: '#', unread: true },
        { id: 'n2', actor: 'The courier', text: 'could not reach the address for PL-20418.', time: '32 minutes ago', icon: 'truck', href: '#', unread: true },
      ]}
    />
    <UserMenu
      name="Oksana Franko"
      email="oksana@perly.example"
      items={[
        { label: 'Profile', icon: 'user', href: '#' },
        { type: 'separator' },
        { label: 'Sign out', icon: 'log-out' },
      ]}
    />
  </>
);

const columns: TableColumn[] = [
  { key: 'order', header: 'Order', rowHeader: true },
  { key: 'customer', header: 'Customer' },
  {
    key: 'status',
    header: 'Status',
    render: (row) =>
      row.status === 'Delivered' ? (
        <Badge tone="success" icon="check">Delivered</Badge>
      ) : (
        <Badge tone={row.status === 'With the courier' ? 'ink' : 'neutral'}>{row.status}</Badge>
      ),
  },
  { key: 'total', header: 'Total', numeric: true },
];

const rows = [
  { order: 'PL-20431', customer: 'Dana Kovalenko', status: 'To pack', total: '$118.00' },
  { order: 'PL-20418', customer: 'Ivan Petrenko', status: 'With the courier', total: '$177.00' },
];

/* The Stat Card belongs to the application set too: its markup. */
function Stat({ label, value, foot, trend }: { label: string; value: string; foot: string; trend?: string }) {
  return (
    <div className="tray-stat">
      <p className="tray-stat__label">{label}</p>
      <p className="tray-stat__value">{value}</p>
      <p className="tray-stat__foot">
        {trend ? (
          <span className="tray-trend" data-tone="good">
            <Icon name="trending-up" size="sm" />
            {trend}
          </span>
        ) : null}
        {foot}
      </p>
    </div>
  );
}

const frame = { boxShadow: '0 0 0 1px var(--hairline)' };

export function Product() {
  return (
    <AppShell
      contained
      height="38rem"
      style={frame}
      sidebar={{ groups, defaultValue: 'Orders', head: switcher, flushHead: true, foot: usage }}
      topbar={
        <TopBar
          breadcrumb={[{ label: 'Perly Farm', href: '#' }, { label: 'Orders' }]}
          search="Search orders"
          end={topbarEnd}
        />
      }
    >
      <PageHeader
        title="Orders"
        description="Twelve orders are waiting to be packed."
        actions={
          <>
            <Button variant="quiet" size="sm" icon="download">Export</Button>
            <Button size="sm" icon="plus">New order</Button>
          </>
        }
      />
      <div className="tray-stats">
        <Stat label="Orders today" value="38" trend="+12%" foot="than last Friday" />
        <Stat label="To pack" value="12" foot="The courier comes at 14:00" />
        <Stat label="Revenue today" value="$2,470" trend="+8%" foot="than last Friday" />
      </div>
      <Table aria-label="Orders" columns={columns} rows={rows} rowKey="order" />
    </AppShell>
  );
}

export function CollapsedSidebar() {
  const [collapsed, setCollapsed] = React.useState(true);
  return (
    <AppShell
      contained
      height="30rem"
      style={frame}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      sidebar={{ groups, defaultValue: 'Customers', head: switcher, flushHead: true, foot: usage }}
      topbar={<TopBar breadcrumb={[{ label: 'Perly Farm', href: '#' }, { label: 'Customers' }]} search="Search customers" user={{ name: 'Oksana Franko' }} />}
    >
      <PageHeader
        title="Customers"
        description="The button at the start of the top bar collapses the sidebar to a rail of icons and back."
        actions={<Button size="sm" icon="plus">Add a customer</Button>}
      />
      <p className="tray-soft">{collapsed ? 'The sidebar is a rail: each item keeps its icon and its name for screen readers.' : 'The sidebar is open.'}</p>
    </AppShell>
  );
}

export function WithAWordmark() {
  return (
    <AppShell
      contained
      height="30rem"
      style={frame}
      sidebar={{
        groups: groups.slice(0, 1),
        defaultValue: 'Reports',
        head: (
          <a className="tray-wordmark" href="#" style={{ fontSize: '1.375rem' }}>
            Counter
          </a>
        ),
        user: { name: 'Dana Kovalenko', role: 'Packer', initials: 'DK' },
      }}
      topbar={<TopBar title="Reports" actions={[{ icon: 'circle-help', label: 'Help' }]} />}
    >
      <PageHeader title="October" description="Orders, revenue and returns for the month." />
      <div className="tray-stats">
        <Stat label="Orders" value="914" trend="+6%" foot="than September" />
        <Stat label="Revenue" value="$53,180" trend="+9%" foot="than September" />
      </div>
    </AppShell>
  );
}
