---
category: Display
keywords: [collapsible, disclosure, show more, expand, details, toggle content]
---
# Collapsible

A collapsible shows and hides one block of detail under a short trigger, with a 44px plus tile that turns into a cross while open.

## Use
```tsx
<Collapsible summary="Show the figures">
  <table className="tray-table tray-table--compact">…</table>
</Collapsible>

<Collapsible summary="3 more recipients" defaultOpen>
  <p className="tray-soft">Anna Melnyk, Bohdan Shevchuk, Oksana Franko</p>
</Collapsible>

<Collapsible summary="Delivery log" open={open} onOpenChange={setOpen}>…</Collapsible>
```

## Details
- It is the browser's own `<details>`: the content is searchable with find-in-page, and appears at once with no animated height.
- The trigger is set in `nav` type with the tile beside it.
- Use it for the table behind a chart, the full list behind "3 more", the technical details of an error.

## Collapsible or Accordion
One block of optional detail is a collapsible. A set of sibling questions is an Accordion.

## Do and don't
- Do keep the same trigger text open and closed; the tile shows the state.
- Do make sure what is hidden is optional.
- Don't animate the height; content appears at once.
