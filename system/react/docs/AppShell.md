---
category: App shell
keywords: [app shell, application frame, layout, dashboard layout, admin layout, sidebar layout, page frame, scaffold]
---
# App Shell

The app shell is the frame of a product: the sidebar on a tray at the start edge, the top bar over the content, and one centred column for the page.

## Use
```tsx
<AppShell
  sidebar={{
    head: <WorkspaceSwitcher workspaces={workspaces} value={workspace} onChange={setWorkspace} />,
    flushHead: true,                                   // the switcher reaches the edges of the tray
    groups: [
      { items: [{ label: 'Orders', icon: 'inbox', href: '/orders', count: 12 }, { label: 'Customers', icon: 'users', href: '/customers' }] },
      { label: 'Workspace', items: [{ label: 'Settings', icon: 'settings', href: '/settings' }] },
    ],
    value: section, onChange: setSection,              // the current item
    foot: usageMeter,                                  // a usage meter at the foot
  }}
  topbar={<TopBar breadcrumb={[{ label: 'Perly Farm', href: '/' }, { label: 'Orders' }]} search="Search orders" onSearch={openCommand}
                  end={<><NotificationCenter items={notices} /><UserMenu name="Oksana Franko" items={account} /></>} />}
>
  <PageHeader title="Orders" actions={<Button size="sm" icon="plus">New order</Button>} />
  <Table columns={columns} rows={orders} />
</AppShell>

<AppShell contained height="38rem" sidebar={…} topbar={…}>…</AppShell>  {/* inside a page: an embedded tool, a preview */}
```

## Parts
- **Sidebar** (`sidebar`): every Sidebar prop. Put the Workspace Switcher in `head` with `flushHead`, and the usage meter in `foot`. It stays in view while the content scrolls.
- **Top bar** (`topbar`): a TopBar. Inside the shell it gets a button at its start that collapses the sidebar to a rail of icons and back.
- **Content** (`children`): one column, at most 72rem wide, 32px between sections. A PageHeader first, then the page. The page is the ground: give it no card of its own.

## Collapsing and phones
The shell holds the sidebar's collapsed state, so the top bar's button can drive it. Control it with `collapsed` and `onCollapsedChange`, or set `defaultCollapsed`. Below 56rem the sidebar leaves the page; the top bar shows a menu button instead, which opens the same navigation in a Sheet from the start side, and choosing an item closes it.

## Contained
`contained` gives the shell a fixed `height` (default 40rem) and rounded corners, and the content scrolls inside it. Use it for an embedded tool or a preview, never for the product itself, which fills the window.

## Do and don't
- Do use one shell per page, as its outermost element.
- Do keep the one primary button in the page header, not in the top bar.
- Don't nest a second sidebar. A section with its own pages takes Tabs under the page header.
- Don't give the content column a card of its own.
