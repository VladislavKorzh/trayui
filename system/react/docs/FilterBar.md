---
category: App shell
keywords: [filter bar, filters, toolbar, search and filter, facets, filter chips, sort, view switch, list controls]
---
# Filter Bar

The filter bar sits over a list or a table: search at the start, filters as menus, sorting and the view at the end, and a chip for every filter that is on.

## Use
```tsx
<FilterBar
  search="Search orders" query={query} onQueryChange={setQuery}
  filters={[
    { label: 'Status', options: [{ value: 'status:to-pack', label: 'To pack', count: 12 }, { value: 'status:courier', label: 'With the courier', count: 7 }] },
    { label: 'Delivery', options: [{ value: 'delivery:courier', label: 'Courier' }, { value: 'delivery:pickup', label: 'Pickup' }] },
  ]}
  value={filters} onChange={setFilters}               // the values that are on: filter the list here
  sortOptions={['Newest first', 'Oldest first', 'Largest total']} sort={sort} onSortChange={setSort}
  views={[{ value: 'list', label: 'List', icon: 'list' }, { value: 'grid', label: 'Grid', icon: 'layout-grid' }]} view={view} onViewChange={setView}
/>
<p className="tray-soft">12 orders match.</p>
```

## Parts
- **Search** (`search`): a small input group with a search icon. `search={false}` leaves it out.
- **Filter menus** (`filters`): a quiet button per menu that opens a Dropdown Menu of check items, each with an optional muted `count`. Several can be on at once, and the menu stays open while they are checked.
- **More** (`children`): after the menus, such as a "Filters" button that opens a Popover with the rest.
- **End**: `end` content, the sort (`sortOptions`, a small native select) and the view (`views`, icon segments).
- **Chips**: one per filter that is on, named in full ("Status: To pack", or the option's `chip`), with a button that removes it, and "Clear all". The row hides while it is empty.

## Behaviour
Checking an item adds its chip, removing a chip unchecks the item, and "Clear all" turns every filter off. Each change reports every value that is on through `onChange`, in the order they were turned on. Pass `value` to control the filters (from the address, say), or `defaultValue` to start with some on.

## Do and don't
- Do name the chip in full: "Status: To pack", not "To pack".
- Do keep at most four filter menus in the row.
- Don't apply filters behind an "Apply" button. The list follows each change.
- Don't hide the count of results: say "12 orders" near the list.
