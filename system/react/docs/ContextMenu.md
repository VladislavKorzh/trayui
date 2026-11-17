---
category: Overlays
keywords: [context menu, right-click menu, right click, secondary menu, shortcut menu]
---
# Context Menu

A context menu opens where something is right-clicked and offers the actions for that thing.

## Use
```tsx
<ContextMenu aria-label="Order PL-20418" onSelect={(value) => run(value)} items={[
  { label: 'Open', icon: 'external-link' },
  { label: 'Duplicate', icon: 'copy' },
  { label: 'Copy the link', icon: 'link' },
  { type: 'separator' },
  { label: 'Delete order', icon: 'trash-2', danger: true, onSelect: askFirst },
]}>
  <span>Right-click anywhere in this area</span>
</ContextMenu>
```

## Parts
The region is a grey area (`tray-context`) that holds your content and the menu. The menu opens at the pointer on right-click, on a long press on touch screens that send the same event, and from the keyboard with the Menu key or Shift F10. It stays inside its region, closes on Escape or a click elsewhere, and reports the chosen item through `onSelect(value)` and the item's own `onSelect`.

Items are actions, separators and labels, written as in Dropdown Menu. Check items, radio items and submenus belong in a Dropdown Menu.

## Rules
- A context menu is a shortcut. Every action in it is also reachable another way: a "more" button on the row, a toolbar, a page.
- Use the same items, in the same order, as the row's Dropdown Menu.
- Leave the browser's own menu alone on text, links and form fields.

## Do and don't
- Do use it in dense working tools: tables, file lists, canvases.
- Do name the region with `aria-label`, after the thing it holds.
- Don't use it on a marketing page or a phone-first product.
- Don't hide the only delete in it.
