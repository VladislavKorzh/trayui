# Breadcrumb

A breadcrumb shows where a page sits and leads back up, one level per link.

## Markup
```html
<nav aria-label="Breadcrumb">
  <ol class="tray-crumbs">
    <li><a href="/orders">Orders</a></li>
    <li><a href="/orders/november">November</a></li>
    <li><span aria-current="page">PL-20418</span></li>
  </ol>
</nav>
```
Links are `nav` type in `ink-soft`; the current page is `ink`, semibold, and not a link. The chevron between levels is drawn by the list and mirrors in right-to-left pages.

When the trail is long, keep the first level and the last two, and put the levels between them behind one "more" button that opens a Dropdown Menu. On a phone, show only the parent as a back link: `<a class="tray-back">` with a left arrow.

## Do and don't
- Do use the page titles as the labels, shortened if needed.
- Do start at the first level that is useful, not always at "Home".
- Don't use a breadcrumb for steps of a flow or for history; it shows hierarchy.
- Don't put it on a top-level page.
