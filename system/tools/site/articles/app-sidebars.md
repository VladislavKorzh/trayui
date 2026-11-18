# Fifteen app sidebars and when to use each

App sidebars in plain HTML and CSS, and which to choose: one level or two, sections that fold, a rail of icons, a file tree, a calendar, a sidebar on each side.

A sidebar is the navigation of an application: a `<nav>` down one side, with groups of links and the current page marked. Tray UI has fifteen sidebar blocks, `sidebar-01.html` to `sidebar-15.html`, each a whole page with the sidebar in place. They are gathered on [Sidebars](#b-sidebar). This article shows how they are built and when each one fits.

## The fifteen at a glance

| Block | Use it when |
| --- | --- |
| [Grouped by section](#b-sidebar-01) | Every page sits one level deep, as in an admin panel. |
| [Sections that fold](#b-sidebar-02) | The product has many areas and each person works in a few. |
| [A second level](#b-sidebar-03) | Short lists of sub-pages are used every day. |
| [A level that folds](#b-sidebar-04) | Open lists would push the column past the window. |
| [Menus](#b-sidebar-05) | People go straight to one page of a section. |
| [Collapses to icons](#b-sidebar-06) | Wide tables and boards need the width. |
| [Inset](#b-sidebar-07) | One main area of work, with a short list of recent things. |
| [Two sidebars](#b-sidebar-08) | A section is a list to pick from, such as an inbox. |
| [A file tree](#b-sidebar-09) | The hierarchy is deeper than two levels. |
| [A calendar](#b-sidebar-10) | The side panel filters one view instead of moving between pages. |
| [At the end](#b-sidebar-11) | It is the table of contents of one long page. |
| [On each side](#b-sidebar-12) | The details of the chosen record sit beside the list. |
| [Under a site header](#b-sidebar-13) | Search and the account belong in one bar on every page. |
| [In a dialog](#b-sidebar-14) | Settings are visited briefly, over the page. |
| [In a popover](#b-sidebar-15) | The menu is opened now and then, and the screen needs its whole width. |

## The base sidebar

```html
<nav class="tray-sidebar" id="nav" aria-label="Main">
  <div class="tray-sidebar__head"><a class="tray-wordmark" href="/">Counter</a></div>
  <div class="tray-sidebar__group">
    <a class="tray-sidebar__item" href="/">…house icon…<span>Home</span></a>
    <a class="tray-sidebar__item" href="/orders" aria-current="page">
      …inbox icon…<span>Orders</span><span class="tray-badge tray-badge--count">12</span>
    </a>
  </div>
  <div class="tray-sidebar__group">
    <p class="tray-sidebar__label">Workspace</p>
    <a class="tray-sidebar__item" href="/team">…user-plus icon…<span>Team</span></a>
  </div>
  <div class="tray-sidebar__foot">…the account…</div>
</nav>
```

The tray is 17rem wide. Each item is a link in a 44px row: an icon, a label, an optional count. The first group has no label and holds the pages people open every day; a group label is a plain paragraph, not a heading and not a control. Put the most used destinations first, and keep actions such as "New order" out of the sidebar: they are buttons in the page.

The current page is drawn from the same attribute that exposes it to assistive technologies:

```css
.tray-sidebar__item[aria-current] { background: var(--ink); color: var(--tray-on-ink); }
.tray-sidebar__item:focus-visible { outline-offset: -3px; }
```

A class such as `.active` can drift away from the ARIA state; a selector on `[aria-current]` cannot. The focus ring is drawn inside the row, and with forced colours the current item takes the system's colours for a chosen item.

## Marking where the person is

`aria-current` says which item in a set is the current one. MDN lists its values, among them `page`, "the current page within a set of pages", `location`, and `true`, "the current item within a set", and adds: "Only mark one element in a set of elements as current". The blocks use three:

| Where | Value | Block |
| --- | --- | --- |
| The link to the open page, at any level, in a tree too | `page` | All but the calendar and the contents |
| A section button whose menu holds the open page | `true` | [Menus](#b-sidebar-05) |
| The current heading of a table of contents | `true` | [At the end](#b-sidebar-11) |
| The current sub-heading under it | `location` | [At the end](#b-sidebar-11) |

The server writes it into the page. In a single-page app, move it when the route changes. In the table of contents nothing watches the scroll: your script moves both marks as the reader goes down the page.

## Sections that fold

A section that folds is a `<details>` whose `<summary>` is the group label. It needs no script: Enter or Space opens and closes it, and in Chrome's accessibility tree the summary is a disclosure triangle with an expanded state.

```html
<details class="tray-sidebar__group" open>
  <summary class="tray-sidebar__label">Shop <svg class="tray-icon tray-icon--sm" aria-hidden="true">…chevron-right…</svg></summary>
  <a class="tray-sidebar__item" href="/products">…<span>Products</span></a>
  <a class="tray-sidebar__item" href="/delivery">…<span>Delivery</span></a>
</details>
```

```css
summary.tray-sidebar__label { list-style: none; cursor: pointer; }
summary.tray-sidebar__label::-webkit-details-marker { display: none; }
details[open] > summary.tray-sidebar__label > .tray-icon { transform: rotate(90deg); }
```

The first two rules remove the browser's own triangle, and the third turns the chevron a quarter as the section opens. Write `open` on the section that holds the current page, or its marked row is hidden on load. Nothing remembers which sections were open from one page to the next. If that matters, the `toggle` event of `<details>` is where to store it; this script, which is not part of Tray UI, never closes the section that holds the current page:

```js
for (const section of document.querySelectorAll('#nav details')) {
  const key = 'nav:' + section.querySelector('summary').textContent.trim();
  const saved = localStorage.getItem(key);
  if (saved) section.open = saved === 'open' || section.querySelector('[aria-current]') !== null;
  section.addEventListener('toggle', () => localStorage.setItem(key, section.open ? 'open' : 'closed'));
}
```

## A second level

Three blocks put pages under pages, and each shows the second level differently. Keep to two levels: a third belongs in a tree or in the page.

- **Always open.** In [A second level](#b-sidebar-03) the parent stays a link to its own page, and a `<ul class="tray-sidebar__sub">` under it holds the sub-pages in 36px rows without icons, stepped in under the label. The current sub-page is white and semibold, so the column keeps one strong mark. The groups sit in `tray-sidebar__scroll`, which scrolls between the wordmark and the account.
- **Folding.** In [A level that folds](#b-sidebar-04) the item is the `<summary>` of a `<details class="tray-sidebar__more">`. A summary opens and closes and goes nowhere, so the first entry of the list is the overview, "All orders".
- **A menu beside the item.** In [Menus](#b-sidebar-05) the item is the button of a [Dropdown Menu](#c-dropdown-menu) whose panel opens beside the sidebar. Its entries are links with `role="menuitem"`, as in the WAI-ARIA Authoring Practices' [Navigation Menu Button example](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-links/). The script gives the button `aria-haspopup="menu"` and `aria-expanded`; Enter or ArrowDown opens the menu on its first page, and Escape closes it and returns focus to the item. `tray-sidebar--flyout` lets the menus out past the tray's edge, so that tray cannot scroll: keep it shorter than the smallest window.

## A rail of icons

[Collapses to icons](#b-sidebar-06) adds a button that folds the tray to a rail 76px wide. The labels are hidden from sight only, so every link keeps its name, and each item shows its label in a [Tooltip](#c-tooltip) beside the icon. The Orders link takes its name from its words, with " to pack" hidden after the count, so it is read "Orders 12 to pack" and the bare count means something. The button keeps `aria-expanded` in step and changes its name from "Collapse the sidebar" to "Expand the sidebar", and the sidebar fires `tray:change` as it folds, so you can store the choice. [An admin dashboard in plain HTML and CSS](#a-admin-dashboard-html-css) has the script and the CSS.

Give every item an icon, since the rail shows nothing else. [Two sidebars](#b-sidebar-08) starts its section list as a rail, with `data-collapsed` in the markup and no button to widen it.

## Sidebars that hold something else

Not every side column is the main navigation. Use `<nav>` when it holds links, `<aside>` when it holds tools or details, and name every one: a page with two of them needs the names to tell them apart.

- **[Two sidebars](#b-sidebar-08)**: `tray-app__side--double` holds a rail of sections and a 21rem `<nav>` named "Inbox" with the list of messages. An unread message has a dot and the hidden word "Unread".
- **[A file tree](#b-sidebar-09)**: a `<nav>` named "Files" with a `tray-tree` of nested lists in 36px rows. Every folder is a `<details>`, and each file a link. A change badge, M, A or D, has `role="img"` and the whole word as its name, such as "Modified".
- **[A calendar](#b-sidebar-10)**: an `<aside>` named "Calendars", since nothing in it is a link. The month is a [Calendar](#c-calendar) with one stop for Tab, and each folding group of checkboxes has `role="group"` with a name, such as "My calendars".
- **[At the end](#b-sidebar-11)**: `tray-app--end` puts the side after the content. The `<nav>` is named "On this page" and lists the headings of this page.
- **[On each side](#b-sidebar-12)**: `tray-app--both` adds an `<aside>` at the end named "Details of order PL-20431". With `tray-app__side--late` it waits until the window is 80rem wide.
- **[Inset](#b-sidebar-07)** and **[Under a site header](#b-sidebar-13)**: `tray-app--inset` makes the whole window a tray with the page as one white panel; `tray-app--header` puts one sticky header over both columns.
- **[In a dialog](#b-sidebar-14)**: a second `<nav>`, "Sections of the settings", inside a modal [Dialog](#c-dialog) named "Settings". Below 48rem it turns into one row that scrolls sideways.
- **[In a popover](#b-sidebar-15)**: no shell at all. A Menu button opens a [Popover](#c-popover) holding a `tray-sidebar--plain`, which has no tray of its own. Focus moves to the first link, and Escape returns it to the button.

## On a phone

Below 56rem, every sidebar of the shell leaves the page. A menu button in the top bar moves that same `<nav>` into a modal `<dialog>`, and puts it back when the dialog closes. Moving the element keeps one copy of the links to write and to mark with `aria-current`. A version of your own:

```js
const menu = document.getElementById('menu'); // aria-controls="nav" aria-haspopup="dialog" aria-expanded="false"
const nav = document.getElementById(menu.getAttribute('aria-controls'));
const home = nav.parentElement;
const sheet = document.createElement('dialog');
sheet.setAttribute('aria-label', nav.getAttribute('aria-label'));
document.body.append(sheet);

menu.addEventListener('click', () => {
  sheet.append(nav);
  sheet.showModal();
  menu.setAttribute('aria-expanded', 'true');
});
sheet.addEventListener('close', () => {
  home.append(nav);
  menu.setAttribute('aria-expanded', 'false');
});
sheet.addEventListener('click', (event) => {
  if (event.target.closest('a[href]')) sheet.close();
});
```

`showModal()` moves focus into the dialog, Escape closes it, and in Chromium focus returns to the menu button without a line of script. Following a link closes the sheet too.

In Tray UI the button is `data-tray="sidebar-sheet"` with `aria-controls`. The sheet comes from the side the sidebar is on: from the end for the contents of [At the end](#b-sidebar-11) and the details of [On each side](#b-sidebar-12). It takes the sidebar's name, so the file tree's sheet is "Files". A rail shows its labels in the sheet and folds back into a rail when the sheet closes. A page with two sidebars has two buttons, one for each, so nothing is out of reach on a phone.

## Sidebars in Tray UI

The [Sidebar](#c-sidebar) page has the parts and the rules for writing items, and [App Shell](#c-app-shell) the frame around them. [Page layouts](#g-layouts) lists every variant of both: the inset page, the header across the product, the sidebar at the end or on each side. Each block on [Sidebars](#b-sidebar) can be opened at desktop, tablet and phone width and copied whole; it needs the three files from [Installation](#d-installation), and its folding parts work before any script runs.
