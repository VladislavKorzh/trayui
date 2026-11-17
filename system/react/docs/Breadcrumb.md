---
category: Navigation
keywords: [breadcrumb, breadcrumbs, crumbs, trail, path, back link, hierarchy]
---
# Breadcrumb

A breadcrumb shows where a page sits and leads back up, one level per link.

## Use
```tsx
{/* the last level is the current page, never a link */}
<Breadcrumb items={[
  { label: 'Orders', href: '/orders' },
  { label: 'November', href: '/orders/november' },
  { label: 'PL-20418' },
]} />

<Breadcrumb maxItems={3} items={trail} />                   {/* first level, a "more" menu, the last two */}
<Breadcrumb back items={trail} />                           {/* on a phone: only the parent, as a back link */}
```

## Parts
- Links are in `ink-soft`; the current page is `ink`, semibold, and not a link. The chevron between levels is drawn by the list and mirrors in right-to-left pages.
- With more levels than `maxItems`, the trail keeps the first level and the last two, and puts the levels between behind one "more" button that opens a menu of links.
- `back` shows only the parent level as a link with a left chevron: the phone form.
- Give an item `onClick` when a router handles the links.

## Do and don't
- Do use the page titles as the labels, shortened if needed.
- Do start at the first level that is useful, not always at "Home".
- Don't use a breadcrumb for steps of a flow or for history; it shows hierarchy.
- Don't put it on a top-level page.
