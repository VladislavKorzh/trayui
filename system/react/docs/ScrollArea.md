---
category: Layout
keywords: [scroll area, scroll, overflow, scrollbar, scrollable list, horizontal scroll, chip row]
---
# Scroll Area

A scroll area keeps a long list or a wide row inside a fixed box, with a thin scrollbar in the system's rule colour.

## Use
```tsx
<ScrollArea label="Pickup points" maxHeight="13rem">       {/* vertical: at most 13rem, then it scrolls */}
  <ul className="tray-items tray-items--ruled">…</ul>
</ScrollArea>

<ScrollArea label="Filters" orientation="horizontal">      {/* sideways: its child stays on one line */}
  <div className="tray-row tray-row--sm" style={{ flexWrap: 'nowrap' }}>…chips…</div>
</ScrollArea>
```

## Behaviour
It is the browser's own scrolling with a styled bar, so touch, wheel, keyboard and find-in-page all work. The area is a focusable region named by `label`, so a keyboard can reach and scroll it. `maxHeight` defaults to 16rem. `orientation="horizontal"` lays its one child out at its full width on a single line: a row of chips, a tab strip, a wide table.

## Do and don't
- Do use it inside floating panels and sidebars, where the outer page must not grow.
- Do leave the last item partly visible, so it is clear there is more.
- Don't nest a scroll area in another that scrolls the same way.
- Don't put the page's main content in one; let the page scroll.
