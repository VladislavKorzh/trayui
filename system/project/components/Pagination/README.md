# Pagination

Pagination moves through a long list one page at a time.

## Markup
```html
<nav aria-label="Pages">
  <ul class="tray-pages">
    <li><a class="tray-page tray-page--step" href="?page=1">…chevron… Previous</a></li>
    <li><a class="tray-page" href="?page=1">1</a></li>
    <li><a class="tray-page" href="?page=2" aria-current="page">2</a></li>
    <li><span class="tray-page tray-page--gap">…</span></li>
    <li><a class="tray-page tray-page--step" href="?page=3">Next …chevron…</a></li>
  </ul>
</nav>
```
Pages are 44px targets with 14px corners; the current page is solid ink; the Previous and Next steps carry the resting fill. A step that cannot be used takes `aria-disabled="true"` and loses its `href`.

Show the first page, the last, the current one and one neighbour on each side; replace the rest with `tray-page--gap`. When there is no room, or the total is unknown, use the compact form: Previous, `tray-pages__status` ("Page 2 of 12"), Next.

## Accessibility
It is a `<nav>` named by its `aria-label`, around a list of links. The current page carries `aria-current="page"`: it is announced as the current page, and its ink fill is drawn from that attribute. Each page takes the 3px ink focus ring. Hide the gap with `aria-hidden="true"`, as in the example. In the compact form the steps are icons, so each needs an `aria-label` ("Next page"). If the list changes without a new page load, make `tray-pages__status` a `role="status"` region so the new page is read.

## Do and don't
- Do keep the list's position and filters when the page changes.
- Do say how many items there are near the control ("1–20 of 236").
- Don't paginate fewer than about twenty items.
- Don't use "Load more" and page numbers together.
