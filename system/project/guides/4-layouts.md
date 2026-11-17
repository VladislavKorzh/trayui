# Page layouts

Blocks are whole screens, so they need a frame as well as components. There are two frames: the app shell for a product, and the screen for everything outside it. Both are plain classes; neither adds a token.

## The app shell and its variants

`tray-app` is the frame of a product: a sidebar on a tray, a top bar, one centred column (see App Shell). These modifiers change the arrangement, not the parts.

| Class | What it does |
| --- | --- |
| `tray-app--inset` | The page is a tray, the sidebar sits straight on it, and `tray-app__main` is one white panel. Inside that panel a card is grey again. |
| `tray-app--header` with `tray-app__header` | A header across the whole product, over the sidebar and the content: `<header class="tray-topbar tray-app__header">` as the first child. It stays in place while the page scrolls. |
| `tray-app--end` | The sidebar at the end. Put `tray-app__side` after `tray-app__main` in the markup. |
| `tray-app--both` | A sidebar on each side: `tray-app__side`, `tray-app__main`, `tray-app__side`. |
| `tray-app__side--double` | Two sidebars side by side in one `tray-app__side`: a rail (`tray-sidebar` with `data-collapsed`) and the list of the chosen section. |
| `tray-app--fill` | The shell is as tall as the window and the page scrolls inside itself: a conversation whose Message Scroller takes the height that is left. |
| `tray-app__side--late` with `tray-app__menu--late` | In `tray-app--both` the end sidebar waits for 80rem; until then its sheet button stays in the top bar. |

Below 56rem the sidebars leave the page. A button with `class="tray-app__menu"`, `data-tray="sidebar-sheet"` and `aria-controls` naming a sidebar opens that same sidebar in a sheet, and puts it back when the sheet closes. The sheet comes from the side the sidebar is on, and takes the sidebar's `aria-label` as its name. A second such button opens the sidebar at the end; with two sidebars at the start, give each its own button so nothing is out of reach on a phone. A button that collapses the sidebar to a rail takes `tray-app__collapse`, which hides it where there is nothing to collapse.

```html
<button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon tray-app__menu" type="button"
        data-tray="sidebar-sheet" aria-controls="nav" aria-label="Open the navigation">…menu icon…</button>
```

## The sidebar and its variants

| Markup | What it is |
| --- | --- |
| `<details class="tray-sidebar__group" open>` with `<summary class="tray-sidebar__label">` | A group that folds. The summary ends with a small `chevron-right` icon, which turns when the group opens. |
| `<details class="tray-sidebar__more">` with `<summary class="tray-sidebar__item">` and a `tray-sidebar__sub` list | An item whose second level folds. The summary ends with `<svg class="tray-icon tray-icon--sm tray-sidebar__caret">`. |
| `tray-sidebar--flyout`, items inside `<div class="tray-anchor tray-anchor--block" data-tray="menu">` with a `tray-pop tray-pop--side` | Items that open their second level as a menu beside them. |
| `tray-tree` | A tree of 36px rows: nested lists; a folder is `<details>` whose summary starts with the caret, a file is a link. |
| `tray-sidebar--wide` | 21rem, for a list of messages or files. |
| `tray-sidebar--plain` | No tray of its own: navigation inside a popover, a dialog or a sheet. |
| `tray-sidebar__scroll` | The part that scrolls when the navigation is taller than the window: put the groups in it, and the head and the foot stay in view. |
| `tray-sidebar__body` | What a group holds when it is not rows of navigation: checkboxes, a description list. |
| `tray-sidebar__sub--text` | A second level under items without icons, as in a table of contents. |

In the rail every item keeps its name in an `aria-label` and shows it in a Tooltip beside the icon; the tooltip stays away while the label is in view. A sidebar with `tray-sidebar--flyout` cannot scroll, because its menus must be able to leave it: keep its navigation short enough for the smallest window you support (about 790px for eleven items), and in the phone sheet its menus open under their items.

`tray-dialog--split` is a dialog with its own navigation: `tray-dialog__split` holds a `tray-sidebar` and a `tray-dialog__pane`. Below 48rem the navigation becomes a strip above the pane.

## The screen

`tray-screen` is the frame of a page outside the shell: sign in, a wizard, a public page. It is as tall as the window.

| Class | What it does |
| --- | --- |
| `tray-screen__bar` | A row at the top: the wordmark at the start, one link or button at the end. |
| `tray-screen__body` | The content, in the container. `--narrow` keeps it to 42rem for a form or a wizard; `--center` centres it in the height; `--center-wide` does so only from 40rem, so a form under a bar starts at the top of a phone. |
| `tray-screen__foot` | One quiet line at the end: terms, a note. |
| `tray-screen--tray` | A grey ground. Fields on it turn white by themselves; a card on it is a `tray-panel`, not a `tray-card`. |
| `tray-screen--split` | Two halves (`tray-screen__half`) from 56rem: a form beside a cover. `tray-screen__half--wide` is shown only when there is room for both. |
| `tray-screen__cover` | On a yellow, ink or leaf card: it fills its half, a statement at one end and a proof at the other. |

`tray-auth-wide` is one tray that holds a form (`tray-auth-wide__form`) beside a picture (`tray-auth-wide__media`, painted with `tray-island` or `tray-inverse`).

## Content beside a column

`tray-with-aside` puts a narrow column beside the content from 64rem and keeps it in view while the page scrolls: an article and its contents, an order and its customer. `tray-with-aside--narrow` makes the column 15rem. Inside the app shell, where the sidebar has already taken its share, `tray-with-aside--late` waits until 76rem.

## The top bar on a small screen

A full top bar (breadcrumb, search, notifications, account) needs about 440px. Below 48rem it folds part by part, each by its own class: `tray-crumbs--fold` keeps only the current page of the breadcrumb, `tray-topbar__search--fold` keeps only the icon of the search (give that button an `aria-label`), and `tray-topbar__wide` marks anything else the bar may drop.

## Public pages

A public page sits in `tray-container` with its sections in `tray-section`. `tray-section__head` holds a section's headline and its one sentence (`--center` over a pricing table). In the site header, `<nav class="tray-nav__strip">` around the links gives them a row of their own below 76rem.

## Slots

`tray-slot` is a grey tray that stands in for content in a block (`--video` is 16 to 9, `--tall` a long panel, `--line` one row); `tray-slots` lays several out in columns. Slots are for blocks only: a page that ships has none.

## Do and don't
- Do pick the frame first: a product page is in the app shell, everything else is on a screen.
- Do keep one sidebar for navigation. A second one holds a list or details, never a second menu.
- Do give every phone a way to the navigation: the menu button and its sheet.
- Don't build a cover from a photograph you do not have. A statement in `headline` type and one small picture built from the components is the system's cover.
- Don't put a `tray-card` on a tray ground, or a `tray-panel` on the white page: each would vanish.
