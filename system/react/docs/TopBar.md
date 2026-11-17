---
category: App shell
keywords: [top bar, topbar, app bar, header bar, toolbar, navbar, search bar, account bar]
---
# Top Bar

The top bar is the row above the content: where you are at the start edge; search, notifications and the account at the end edge.

## Use
```tsx
<TopBar
  breadcrumb={[{ label: 'Perly Farm', href: '/' }, { label: 'Orders', href: '/orders' }, { label: 'PL-20431' }]}
  search="Search orders" onSearch={() => setCommandOpen(true)}    // "/" opens it too
  actions={[{ icon: 'circle-help', label: 'Help' }, { icon: 'bell', label: 'Notifications', count: 2 }]}
  user={{ name: 'Oksana Franko' }}                                 // a plain avatar button
/>

<TopBar title="Customers" end={<><NotificationCenter items={notices} /><UserMenu name="Oksana Franko" items={account} /></>} />

<Card style={{ padding: 'var(--space-4) var(--space-5)' }}>                {/* on a card, for a page of its own */}
  <TopBar back={{ label: 'Back to orders', href: '/orders' }} title="Order PL-20431" end={<Button variant="quiet" size="sm" icon="share">Share</Button>}>
    <Badge>To pack</Badge>
  </TopBar>
</Card>
```

## Parts
- **Start**: a Breadcrumb (`breadcrumb`), or the page's `title` when it has no parent, with an optional `back` arrow before it and `children` after it, such as a status badge.
- **Search** (`search`): looks like a field and is a button; `onSearch` opens the Command panel, in a Dialog. Its key, `searchKey` (default `/`), shows in a Kbd and opens the search from anywhere on the page but a field.
- **Icon buttons** (`actions`): square quiet buttons, at most three. A `count` shows in the yellow pip on the corner and in the button's name ("Notifications, 2 unread"); 0 hides the pip.
- **End** (`end`): a NotificationCenter, a UserMenu, or the page's own small buttons.
- **Account** (`user`): the avatar as a plain button. For the account's menu, put a UserMenu in `end` instead.

The bar has no fill of its own: it sits on the page. `sticky` keeps it at the top and gives it the colour of its ground. Inside an AppShell it starts with the button that collapses the sidebar; `sidebarToggle={false}` leaves it out.

## Do and don't
- Do keep the bar to one row: at most three icon buttons and the avatar at the end.
- Do show the page's place with a Breadcrumb, or its title when there is no parent.
- Don't put the page's primary action here. It belongs to the Page Header.
- Don't use the pip for anything but a count of things to read.
