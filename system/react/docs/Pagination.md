---
category: Navigation
keywords: [pagination, pager, pages, page numbers, previous next]
---
# Pagination

Pagination moves through a long list one page at a time: 44px pages, the current one in solid ink, with Previous and Next on the resting fill.

## Use
```tsx
<Pagination pageCount={12} page={page} onPageChange={setPage} />   {/* buttons, for a list in the page */}
<Pagination pageCount={12} defaultPage={2} href={(p) => '?page=' + p} />  {/* links, for pages the server renders */}
<Pagination compact pageCount={12} page={page} onPageChange={setPage} /> {/* Previous, "Page 2 of 12", Next */}

<div className="tray-row tray-row--between">
  <p className="tray-soft">21–40 of 236 orders</p>
  <Pagination pageCount={12} page={page} onPageChange={setPage} />
</div>
```

## Forms
**Numbers** (the default). Shows the first page, the last, the current one and one neighbour on each side; the rest become a gap. Previous and Next carry the resting fill; the one that cannot be used is dimmed and disabled.

**Compact** (`compact`). Previous, a status ("Page 2 of 12"), Next, as icon buttons. Use it where there is no room for the numbers. Change the words with `status`.

With `href` every page is a link, and a step that cannot be used loses its `href` and takes `role="link"` and `aria-disabled="true"`, so it keeps its name and says it is off; without it the pages are buttons and `onPageChange` does the work.

## Do and don't
- Do keep the list's position and filters when the page changes.
- Do say how many items there are near the control ("1–20 of 236").
- Don't paginate fewer than about twenty items.
- Don't use "Load more" and page numbers together.
