# Sidebar

A sidebar is the navigation of an application: a tray down the side with groups of links, and the person's account at its foot. Also called a side navigation or a nav sidebar.

## Markup
```html
<div class="tray-shell">
  <nav class="tray-sidebar" id="side" aria-label="Main">
    <div class="tray-sidebar__head">…wordmark, a collapse button…</div>
    <div class="tray-sidebar__group">
      <p class="tray-sidebar__label">Shop</p>
      <a class="tray-sidebar__item" href="/orders" aria-current="page">…icon… <span>Orders</span> <span class="tray-badge tray-badge--count">12</span></a>
    </div>
    <div class="tray-sidebar__foot">…the account…</div>
  </nav>
  <main class="tray-shell__main">…</main>
</div>
```
- Items are 44px rows with 14px corners: an icon, a label, an optional count. Hover turns the row white; the current page is solid ink.
- `tray-sidebar__label` names a group in `caption` type. `tray-sidebar__sub` is a second level under an item, indented, without icons.
- A button with `data-tray="sidebar-toggle"` and `aria-controls` collapses the sidebar to a rail of icons (`data-collapsed`). Its name follows what a press will do: its `aria-label` while the sidebar is open ("Collapse the sidebar"), and `data-label-expand` (by default "Expand the sidebar") while it is a rail; `data-label-collapse` sets the first. In the rail every item needs a Tooltip with its label, for the eye.
- On a phone the sidebar leaves the page and opens as a Sheet from the start side: a button with `data-tray="sidebar-sheet"` and `aria-controls` moves this same sidebar into the sheet and back.

## Variants
| Markup | What it is |
| --- | --- |
| `<details class="tray-sidebar__group" open>` with `<summary class="tray-sidebar__label">` | A group that folds. The summary ends with a small `chevron-right` icon. |
| `<details class="tray-sidebar__more">` with `<summary class="tray-sidebar__item">` | An item whose second level folds. The summary ends with `<svg class="tray-icon tray-icon--sm tray-sidebar__caret">`. |
| `tray-sidebar--flyout` | Items open their second level as a Dropdown Menu beside them (`tray-pop--side`). |
| `tray-tree` | A file tree: nested lists of 36px rows, folders as `<details>`. |
| `tray-sidebar--wide` | 21rem, for a list of messages or files. |
| `tray-sidebar--plain` | No tray of its own, for navigation inside a popover or a dialog. |
| `tray-sidebar__scroll` | Around the groups: they scroll, and the head and the foot stay in view. |

The Sidebar blocks show each of these in a page.

## Accessibility
- The sidebar is a `<nav>` named by its `aria-label`. The link to the current page carries `aria-current="page"`, in the first level or in a second. An item that opens its second level as a menu beside it, where the current page is out of sight, carries `aria-current="true"` while its menu holds that page, as in the flyout sidebar block.
- The current item is solid ink, a current second-level item semibold, and with forced colours the current item takes the system's colours for a chosen item. Focus draws the ring inside the row.
- The collapse button keeps `aria-expanded` in step: `true` while the sidebar is open, `false` while it is a rail, and its name changes with it, from "Collapse the sidebar" to "Expand the sidebar".
- In the rail an item's label and count are only hidden from sight, so the link keeps its name ("Orders 12"); give it a Tooltip to show the name. Group names and second levels are `display: none` there, and are not read either.
- On a small screen the menu button gets `aria-haspopup="dialog"` and `aria-expanded`, and opens the sidebar in a modal sheet that takes the sidebar's name. Following a link closes the sheet.

## Do and don't
- Do keep two levels at most.
- Do put the most used destinations first, not the alphabet.
- Do give every item an icon, so the collapsed rail still works: in the rail the label is not shown.
- Do keep a `tray-sidebar--flyout` short enough for the smallest window: it cannot scroll.
- Don't mix navigation and actions; "New order" is a button in the page, not a sidebar item.
- Don't use a sidebar on a site with five pages; use Navigation Menu.
