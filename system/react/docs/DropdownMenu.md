---
category: Overlays
keywords: [dropdown menu, menu, actions menu, more menu, kebab, overflow menu, context actions]
---
# Dropdown Menu

A dropdown menu is a short list of actions that opens from a button.

## Use
```tsx
<DropdownMenu label="Actions" items={[
  { label: 'Duplicate', icon: 'copy', shortcut: 'Ctrl D', onSelect: duplicate },
  { label: 'Copy the link', icon: 'link' },
  { type: 'separator' },
  { type: 'checkbox', label: 'Notify the customer', icon: 'bell', checked: notify, onCheckedChange: setNotify },
  { type: 'submenu', label: 'Move to', icon: 'folder', items: [{ label: 'Packed' }, { label: 'On hold' }] },
  { type: 'separator' },
  { label: 'Delete order', icon: 'trash-2', danger: true, onSelect: askFirst },
]} />

<DropdownMenu icon="ellipsis" aria-label="More actions" align="end" items={rowActions} />  {/* at the end of a row */}
```

## Items
| Item | Shape |
| --- | --- |
| Action | `{ label, icon?, shortcut?, danger?, disabled?, href?, onSelect? }`. The menu reports it with `onSelect(value)` and closes. |
| On or off | `{ type: 'checkbox', label, checked?, defaultChecked?, onCheckedChange? }`. A check shows at the end; the menu stays open. |
| One of several | `{ type: 'radio', group, label, checked?, defaultChecked?, onSelect? }`. Radios with the same `group` share one choice. |
| Separator | `{ type: 'separator' }`: a hairline between groups. |
| Label | `{ type: 'label', label }`: a small muted heading over a group, such as "Sort by". |
| Submenu | `{ type: 'submenu', label, items }`: a second panel to the side, opened on hover, focus or the right arrow. One level only. |

Every item reports its `value`, or its label when there is none. Give all items of one menu an icon, or none.

## Trigger
`label` gives a quiet small button with a chevron; `icon` alone gives a square ghost button, which needs an `aria-label`. Pass `trigger` for your own button (an avatar, a tab). `align="end"` lines the panel up with the trigger's end edge; `side="top"` opens it upward.

## Behaviour
Enter, Space or the down arrow opens the menu on its first item; up and down move; right opens a submenu and left leaves it; Enter runs the item; Escape closes and returns focus to the trigger. `open`, `defaultOpen` and `onOpenChange` hold or follow the open state.

## Do and don't
- Do order items by how often they are used, and group them with separators.
- Do keep labels to a verb and a noun.
- Do put a destructive action last, after a separator, and confirm it in an Alert Dialog.
- Don't put more than about eight items in a menu.
- Don't use a menu to choose a value for a form; that is a Select.
