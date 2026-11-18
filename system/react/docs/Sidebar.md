---
category: Navigation
keywords: [sidebar, side nav, side navigation, app navigation, nav rail, drawer menu, vertical nav]
---
# Sidebar

A sidebar is the navigation of an application: a tray down the side with groups of links, and the person's account at its foot.

## Use
```tsx
<div className="tray-shell">
  <Sidebar
    head={<a className="tray-wordmark" href="/">Perly</a>}
    collapsible                                             /* a button in the head collapses it to a rail */
    value={section} onChange={setSection}                   /* the current item, by value (its label by default) */
    groups={[
      { label: 'Shop', items: [
        { label: 'Orders', icon: 'inbox', href: '/orders', count: 12 },
        { label: 'Customers', icon: 'users', href: '/customers' },
      ] },
      { label: 'Farm', items: [
        { label: 'Beds', icon: 'layout-grid', href: '/beds', items: [{ label: 'Bed A', href: '/beds/a' }] },
      ] },
    ]}
    user={{ name: 'Oksana Franko', role: 'Farm manager', initials: 'OF' }}
  />
  <main className="tray-shell__main">…</main>
</div>
```

## Parts
- **Head** (`head`): the wordmark (`<a className="tray-wordmark">`) or a workspace switcher, with the collapse button at its end when `collapsible` is set. `flushHead` lets a switcher reach the edges of the tray.
- **Groups** (`groups`): each with an optional label in small muted type and its items. Items are 44px rows with 14px corners: an icon, a label, an optional `count`. Hover turns the row white; the current item is solid ink.
- **Second level** (`items` of an item): indented under it, without icons, in soft ink; the current one turns white and semibold.
- **Foot** (`user`, `foot`): the person signed in, then anything else you pass, such as a usage meter.

## Collapsing
`collapsible` adds a button to the head that collapses the sidebar to a rail of icons: labels, group names, the second level, the wordmark and the user hide, and each item keeps its name from its label and count ("Orders 12"), which are only hidden from sight. To collapse it from elsewhere, such as a button in a top bar, control `collapsed` and `onCollapsedChange`, give the sidebar an `id`, and point the button's `aria-controls` at it. On a phone the sidebar leaves the page and opens in a Sheet from the start side.

## Do and don't
- Do keep two levels at most.
- Do put the most used destinations first, not the alphabet.
- Do give every top-level item an icon, so the collapsed rail still works.
- Don't mix navigation and actions; "New order" is a button in the page, not a sidebar item.
- Don't use a sidebar on a site with five pages; use a header navigation.
