# App Shell

The app shell is the frame of a product: the sidebar on a tray at the start edge, the top bar over the content, and one centred column for the page.

## Markup
```html
<div class="tray-app">
  <div class="tray-app__side">
    <nav class="tray-sidebar" id="nav" aria-label="Main">…</nav>
  </div>
  <div class="tray-app__main">
    <header class="tray-topbar">…</header>
    <main class="tray-app__content">
      <div class="tray-pagehead">…</div>
      …
    </main>
  </div>
</div>
```
| Part | Use |
| --- | --- |
| `tray-app` | The page itself: full height, 16px from every edge, white. One per document. |
| `tray-app__side` | Holds the Sidebar and keeps it in view while the content scrolls. |
| `tray-app__main` | The top bar, then the content. |
| `tray-app__content` | One column, at most 72rem wide, sections 32px apart. |
| `tray-app__menu` | A button that shows only below 56rem, where the sidebar is hidden. With `data-tray="sidebar-sheet"` and `aria-controls` it opens that same sidebar in a Sheet. |
| `tray-app__collapse` | The button that collapses the sidebar to a rail; hidden below 56rem. |

## Variants
| Class | What it does |
| --- | --- |
| `tray-app--inset` | The page is a tray, the sidebar sits straight on it, the content is one white panel. |
| `tray-app--header` | A header across the whole product (`<header class="tray-topbar tray-app__header">` as the first child), over the sidebar and the content. |
| `tray-app--end` | The sidebar at the end: `tray-app__side` comes after `tray-app__main`. |
| `tray-app--both` | A sidebar on each side: navigation at the start, details at the end. |
| `tray-app__side--double` | Two sidebars in one `tray-app__side`: a rail and the list of the chosen section. |

`tray-app--contained` gives the shell a fixed height (`--tray-app-height`) and scrolls the content inside it. Use it for an embedded tool or a preview, never for the product page.

## Accessibility
The shell gives the page its landmarks: the sidebar is a `<nav>` with an `aria-label`, the top bar a `<header>`, and the content the page's one `<main>`. The collapse button carries `aria-controls` naming the sidebar, and `data-tray="sidebar-toggle"` keeps its `aria-expanded` in step. In the rail the item text is hidden, so give each Sidebar item an `aria-label` with its name. Below 56rem the `tray-app__menu` button opens the same sidebar in a modal Sheet named after it: focus moves in, `Escape` or the close button shuts it, and focus returns to the button. Following a link in the sheet closes it too.

## Do and don't
- Do put the Workspace Switcher at the top of the sidebar and the Usage Meter at its foot.
- Do keep one primary button in the page header, not in the top bar.
- Don't give a product two menus. A section with its own pages takes Tabs under the page header; a second sidebar holds a list or details, never more navigation.
- Don't give the content column a card of its own: the page is the ground.
