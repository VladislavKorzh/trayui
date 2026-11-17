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

## Accessibility
The trail is a `<nav>` named by `aria-label="Breadcrumb"`, so a screen reader lists it with the page's landmarks; give a second trail on the same page a name of its own. The last level is a `<span>` with `aria-current="page"`: it is announced as the current page and is not a link. The chevrons are drawn by CSS with no text, so they are not read. Each link takes the 3px `ink` focus ring. The "more" button is an icon button and needs an `aria-label`, such as "Show the levels between".

## Do and don't
- Do use the page titles as the labels, shortened if needed.
- Do start at the first level that is useful, not always at "Home".
- Don't use a breadcrumb for steps of a flow or for history; it shows hierarchy.
- Don't put it on a top-level page.
