---
category: Layout
keywords: [resizable, split, split view, panes, splitter, divider, drag handle, panels]
---
# Resizable

Resizable splits a box into two panes with a handle between them that can be dragged, or moved with the arrow keys.

## Use
```tsx
<Resizable
  defaultSize={34} min={22} max={60}                       /* the first pane's share, in percent */
  handleLabel="Resize the order list"
  onSizeChange={saveSize}                                  /* remember the size the person chose */
  start={<OrderList />}
  end={<OrderDetail />}
/>

<Resizable orientation="vertical" style={{ blockSize: '22rem' }} start={<Note />} end={<Draft />} />
```

## Details
- Each pane is a grey tray with 32px corners that scrolls on its own. The handle is a 16px strip with a short pill in `rule-strong` that turns `ink` on hover and focus.
- `defaultSize` is the first pane's share in percent; `min` and `max` limit it so neither pane can be dragged to nothing.
- `orientation="vertical"` stacks the panes and drags up and down; give the split a height.
- The handle is a focusable separator: the arrow keys move it by two percent, Home and End jump to the limits, and it reports its size to screen readers.

## Do and don't
- Do set limits so neither pane can be dragged to nothing.
- Do remember the size the person chose, and pass it back as `defaultSize`.
- Don't use it on a phone; stack the panes there.
- Don't nest more than two levels of splits.
