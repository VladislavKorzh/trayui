import * as React from 'react';
import { FilterBar, type FilterMenu, type ToggleGroupItem } from 'trayui-react';

const filters: FilterMenu[] = [
  {
    label: 'Status',
    options: [
      { value: 'status:to-pack', label: 'To pack', count: 12 },
      { value: 'status:courier', label: 'With the courier', count: 7 },
      { value: 'status:delivered', label: 'Delivered', count: 214 },
      { value: 'status:refunded', label: 'Refunded', count: 3 },
    ],
  },
  {
    label: 'Delivery',
    options: [
      { value: 'delivery:courier', label: 'Courier' },
      { value: 'delivery:pickup', label: 'Pickup' },
    ],
  },
];

const views: ToggleGroupItem[] = [
  { value: 'list', label: 'List', icon: 'list' },
  { value: 'grid', label: 'Grid', icon: 'layout-grid' },
];

const sorts = ['Newest first', 'Oldest first', 'Largest total'];

export function OverTheOrders() {
  return (
    <div className="tray-stack">
      <FilterBar
        search="Search orders"
        filters={filters}
        defaultValue={['status:to-pack', 'delivery:courier']}
        sortOptions={sorts}
        views={views}
      />
      <p className="tray-soft">12 orders match. Open "Status" to add a filter, or remove a chip.</p>
    </div>
  );
}

export function StatusOpen() {
  return (
    <div style={{ minBlockSize: 280 }}>
      <FilterBar
        search="Search orders"
        filters={[{ ...filters[0], defaultOpen: true }, filters[1]]}
        defaultValue={['status:to-pack']}
        sortOptions={sorts}
      />
    </div>
  );
}

const counts: Record<string, number> = { 'status:to-pack': 12, 'status:courier': 7, 'status:delivered': 214, 'status:refunded': 3 };

export function Controlled() {
  const [on, setOn] = React.useState<string[]>(['status:courier']);
  const [query, setQuery] = React.useState('');
  const [view, setView] = React.useState('list');
  const matching = on.filter((v) => v.startsWith('status:')).reduce((n, v) => n + (counts[v] ?? 0), 0) || 236;
  return (
    <div className="tray-stack">
      <FilterBar
        search="Search orders"
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        value={on}
        onChange={setOn}
        views={views}
        view={view}
        onViewChange={setView}
      />
      <p className="tray-soft">
        {matching} orders match{query ? ` "${query}"` : ''}, shown as a {view}. Filters on: {on.length ? on.join(', ') : 'none'}.
      </p>
    </div>
  );
}
