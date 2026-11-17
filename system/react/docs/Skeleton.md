---
category: Feedback
keywords: [skeleton, placeholder, loading, shimmer, ghost, content loader]
---
# Skeleton

A skeleton holds the place of content that is loading, in the shape of what will arrive: a grey shape with a slow pulse.

## Use
```tsx
<div className="tray-stack" aria-busy="true">
  <span className="tray-vh">Loading orders</span>          {/* what screen readers hear */}
  <div className="tray-row">
    <Skeleton shape="avatar" />                           {/* a 48px tile */}
    <Skeleton shape="text" width="60%" height={16} />
  </div>
  <Skeleton shape="text" width="88%" height={14} />      {/* vary the widths */}
  <Skeleton height={56} radius="input" />                 {/* where an input will be */}
  <Skeleton width="9rem" height={48} radius="control" /> {/* where a small button will be */}
  <Skeleton shape="card" height={240} />                  {/* a whole card */}
</div>
```

## Shapes
`block` (the default) is a plain shape with 12px corners. `text` is a line of text with 4px corners. `avatar` is a 48px tile. `card` has a card's 40px corners. Give a size with `width` and `height`, and the corners of the control it stands in for with `radius`.

Each shape is hidden from screen readers. Wrap the group in an element with `aria-busy="true"` and a `tray-vh` label that says what is loading.

## Skeleton or Spinner
A skeleton is for content with a known shape that takes more than a moment: a list, a card, a table. A Spinner is for an action in progress, or a wait of unknown shape.

## Do and don't
- Do build the skeleton from the same layout as the loaded content, so nothing jumps when it arrives.
- Do show it only after about 300 ms, so fast loads never flash grey.
- Do vary the line widths; identical bars read as a broken layout.
- Don't keep it for longer than a few seconds without saying what is happening. The pulse stops under reduced motion.
