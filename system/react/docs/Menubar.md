---
category: Navigation
keywords: [menubar, menu bar, app menu, file menu, toolbar menus, desktop menu]
---
# Menubar

A menubar is the row of menus at the top of a working tool: File, Edit, View.

## Use
```tsx
<Menubar aria-label="Orders" onSelect={(value) => run(value)} menus={[
  { label: 'File', items: [
    { label: 'New order', shortcut: 'Ctrl N' },
    { type: 'submenu', label: 'Export', items: [{ label: 'As a spreadsheet' }, { label: 'As a PDF' }] },
  ] },
  { label: 'Edit', items: [{ label: 'Undo', shortcut: 'Ctrl Z' }, { label: 'Delete order', danger: true }] },
  { label: 'View', items: [{ type: 'checkbox', label: 'Show the totals', checked: totals, onCheckedChange: setTotals }] },
]} />
```

## Parts
Each menu is a Dropdown Menu whose trigger is a tab in the strip, and takes the same items: actions with a `shortcut`, check items, radio items with a shared `group`, separators, labels and one level of submenus. `onSelect` hears the actions of every menu; `onCheckedChange` hears the check and radio items.

## Keyboard
Left and right move along the bar; down opens a menu; inside, up and down move, right opens a submenu, left closes it, Enter runs an item, Escape closes the menu and returns to the bar. With one menu open, pointing at another opens that one.

## Do and don't
- Do use it only in dense working tools, where the same commands are used all day.
- Do show the shortcut beside every item that has one.
- Don't use a menubar for site navigation; that is Navigation Menu.
- Don't hide the only way to do something in a menubar on a phone; it does not fit there.
