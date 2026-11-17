import { Badge, Button, DropdownMenu, PageHeader } from 'trayui-react';

export function List() {
  return (
    <PageHeader
      title="Customers"
      description="Everyone who has ordered from the farm, newest first."
      actions={
        <>
          <Button variant="quiet" size="sm" icon="upload">Import</Button>
          <Button size="sm" icon="plus">Add a customer</Button>
        </>
      }
    />
  );
}

export function OneThing() {
  return (
    <PageHeader
      back={{ label: 'Customers', href: '#' }}
      title="Dana Kovalenko"
      badge={<Badge>Regular</Badge>}
      description="Orders every second week, mostly 50 g jars."
      actions={
        <>
          <DropdownMenu
            variant="quiet"
            aria-label="More actions"
            align="end"
            items={[
              { label: 'Merge with another customer', icon: 'users' },
              { label: 'Export the history', icon: 'download' },
            ]}
          />
          <Button variant="quiet" size="sm" icon="pencil">Edit</Button>
          <Button size="sm" icon="plus">New order</Button>
        </>
      }
      meta={[
        { icon: 'calendar', label: 'Customer since March 2025' },
        { icon: 'inbox', label: '14 orders' },
        { icon: 'map-pin', label: 'Kyiv' },
      ]}
      tabsLabel="Customer"
      defaultTab="overview"
      tabs={[
        { value: 'overview', label: 'Overview', href: '#' },
        { value: 'orders', label: 'Orders', href: '#', count: 14 },
        { value: 'notes', label: 'Notes', href: '#' },
        { value: 'invoices', label: 'Invoices', href: '#' },
      ]}
    />
  );
}

export function WithABreadcrumb() {
  return (
    <PageHeader
      breadcrumb={[{ label: 'Orders', href: '#' }, { label: 'PL-20431' }]}
      title="Order PL-20431"
      badge={<Badge>To pack</Badge>}
      description="Two jars of 50 g for Dana Kovalenko, by courier in a chilled box."
      actions={<Button size="sm" icon="check">Mark as packed</Button>}
      meta={[{ icon: 'clock', label: 'Placed today, 10:42' }, { icon: 'truck', label: 'Courier, 16 November' }]}
    />
  );
}
