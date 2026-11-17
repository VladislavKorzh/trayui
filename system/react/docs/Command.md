---
category: Navigation
keywords: [command, command palette, command menu, quick search, spotlight, ctrl k, launcher]
---
# Command

Command is a search field over a list of destinations and actions: type a few letters, press Enter.

## Use
```tsx
<Command onSelect={(value) => go(value)} groups={[
  { label: 'Go to', items: [
    { label: 'Orders', icon: 'inbox', shortcut: ['G', 'O'] },
    { label: 'Batches', icon: 'shopping-bag', shortcut: ['G', 'B'] },
  ] },
  { label: 'Actions', items: [
    { label: 'Create an order', icon: 'plus', shortcut: ['Ctrl', 'N'], onSelect: createOrder },
  ] },
]} />
```

## Parts
A raised panel with the float shadow: the search field, the list in named groups, and a foot of key hints (`hints={false}` drops it). Typing filters the items; a group with nothing left disappears; the first match is highlighted, and the `emptyText` sentence shows when nothing matches. A chosen item runs its own `onSelect` and is reported with `onSelect(value)`.

It usually opens inside a Dialog, from a shortcut (Ctrl K) and from a visible search button; close the dialog when an item runs.

## Keyboard
Focus stays in the field. Up and down move the highlight, Enter runs it, Escape closes the dialog around it.

## You provide
The list (pages, recent items, actions), one icon per item, shortcuts where they exist, and the sentence for no results.

## Do and don't
- Do put what people do most at the top, before they type.
- Do name actions with a verb ("Create an order") and places with their title ("Orders").
- Don't make the palette the only way to reach anything.
- Don't run a destructive action straight from the list; open an Alert Dialog first.
