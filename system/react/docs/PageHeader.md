---
category: App shell
keywords: [page header, page title, heading, title bar, header actions, page tabs, hero header]
---
# Page Header

The page header names the page: its title in `title` type, one line about it, the page's actions at the end edge, and tabs for its sections underneath.

## Use
```tsx
<PageHeader
  title="Customers"
  description="Everyone who has ordered from the farm, newest first."
  actions={<><Button variant="quiet" size="sm" icon="upload">Import</Button><Button size="sm" icon="plus">Add a customer</Button></>}
/>

<PageHeader
  back={{ label: 'Customers', href: '/customers' }}            // or breadcrumb={[…]}, never both
  title="Dana Kovalenko" badge={<Badge>Regular</Badge>}
  description="Orders every second week, mostly 50 g jars."
  meta={[{ icon: 'calendar', label: 'Customer since March 2025' }, { icon: 'inbox', label: '14 orders' }]}
  tabsLabel="Customer" tab={section} onTabChange={setSection}
  tabs={[{ value: 'overview', label: 'Overview', href: '/c/dk' }, { value: 'orders', label: 'Orders', href: '/c/dk/orders', count: 14 }]}
/>
```

## Parts
Every part but the title is optional.
- **Above the row**: a `back` link with a left arrow, or a `breadcrumb`, never both.
- **Title** (`title`, an `h1` by default) with an optional `badge` beside it, and one line of `description` under it.
- **Actions** (`actions`): small buttons at the end edge, the one yellow button last. More than three go into a DropdownMenu.
- **Meta** (`meta`): one line of facts in muted caption type, each with an optional small icon.
- **Tabs** (`tabs`): the page's sections as links, the current one marked `aria-current="page"`. Control it with `tab` and `onTabChange`.

## Do and don't
- Do write the title as the name of the thing: "Orders", "Dana Kovalenko". Not "Manage your orders".
- Do keep one yellow button, at the end of the actions.
- Don't repeat the title in the breadcrumb's last item and in the top bar: one of them is enough.
- Don't centre the header.
