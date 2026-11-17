---
category: Overlays
keywords: [sheet, side panel, side sheet, slide-over, offcanvas, filters panel, panel]
---
# Sheet

A sheet is a panel that slides in from the side and keeps the page in view beside it.

## Use
```tsx
<Sheet
  title="Filters"
  trigger={<Button variant="quiet" size="sm" icon="filter">Filters</Button>}
  footer={<>
    <Button variant="ghost" size="md" onClick={clear}>Clear</Button>
    <Button variant="dark" size="md" data-close>Show 8 orders</Button>   {/* data-close: closes after the click */}
  </>}
>
  …checkboxes, a segmented control, a switch…
</Sheet>

<Sheet side="start" title="Perly Farm" open={menuOpen} onOpenChange={setMenuOpen}>…</Sheet>   {/* navigation on a phone */}
```

## Sides
It sits on the end side by default, full height, 26rem wide at most, with 40px corners on its inner edge. Use the end side for everything about the current page: filters, the details of a row, a cart. `side="start"` is for navigation, such as the sidebar on a phone.

## Parts and behaviour
The same parts as a Dialog: `title`, `description`, the body (`children`, a grid with 16px gaps) and `footer`, with a close button in the corner. It is a real modal dialog: focus stays inside, Escape and the veil close it, and focus returns to the trigger. Any button with `data-close` closes it; `closeOnVeil={false}` keeps it open on a click on the veil.

## Pictures
`modal={false}` with `defaultOpen` shows it in place. Put it in a scrim stage tall enough to hold it:
```tsx
<div className="tray-stage tray-stage--scrim" style={{ minBlockSize: '34rem' }}>
  <Sheet modal={false} defaultOpen title="Filters">…</Sheet>
</div>
```

## Do and don't
- Do keep the title and the close button pinned while the body scrolls.
- Do apply filters as they change when that is cheap, and drop the Apply button.
- Don't use a sheet for a yes or no question; that is an AlertDialog.
- Don't open a sheet wider than half the screen on a desktop; that is a page.
