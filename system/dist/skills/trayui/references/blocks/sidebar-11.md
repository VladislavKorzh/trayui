# Sidebar at the end

A sidebar at the end of the page with the contents of a long guide: headings, sub-headings, the current place marked and a link back to the top.

A table of contents for one long page, such as a help article, a policy or a documentation page: an "On this page" column that lists the headings of this page, not the pages of the product. It stands at the end edge, so the text starts at the start edge, and the wordmark and the breadcrumb sit in the top bar. Headings are links without icons, and sub-headings step in by one space rather than by an icon's width. The current heading carries `aria-current="true"` and the current sub-heading `aria-current="location"`; nothing watches the scroll, so your script moves both as the reader goes down the page.

For a set of guides people move between, a start sidebar such as [the base one](https://trayui.com/blocks/sidebar-01.md) fits better. Below 56rem the contents leave the side, and a button at the end of the top bar, "Open the contents of this page", opens them in a sheet from the end side. Following a heading closes the sheet.

It is made of these components: [App Shell](https://trayui.com/components/app-shell.md), [Top Bar](https://trayui.com/components/top-bar.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md), [Button](https://trayui.com/components/button.md), [Sidebar](https://trayui.com/components/sidebar.md).

Behaviours it uses: `sidebar-sheet`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sidebar at the end</title>
<meta name="description" content="A sidebar at the end of the page with the contents of a long guide: headings, sub-headings, the current place marked and a link back to the top.">
<meta name="tray-category" content="Sidebar">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-app tray-app--end">
  <div class="tray-app__main">
    <header class="tray-topbar">
      <div class="tray-topbar__start" style="gap: var(--space-5)">
        <a class="tray-wordmark" href="#">Counter</a>
        <nav aria-label="Breadcrumb"><ol class="tray-crumbs"><li><a href="#">Guides</a></li><li><span aria-current="page">Delivery</span></li></ol></nav>
      </div>
      <div class="tray-topbar__end">
        <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon tray-app__menu" type="button" data-tray="sidebar-sheet" aria-controls="contents" aria-label="Open the contents of this page"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-menu"/></svg></button>
      </div>
    </header>
    <main class="tray-app__content">
      <h1 class="tray-vh">Delivery</h1>
      <div class="tray-slots">
        <div class="tray-slot tray-slot--video"></div>
        <div class="tray-slot tray-slot--video"></div>
        <div class="tray-slot tray-slot--video"></div>
      </div>
      <div class="tray-slot tray-slot--tall"></div>
    </main>
  </div>
  <div class="tray-app__side">
    <nav class="tray-sidebar" id="contents" aria-label="On this page">
      <div class="tray-sidebar__group">
        <p class="tray-sidebar__label">On this page</p>
        <a class="tray-sidebar__item" href="#overview"><span>Overview</span></a>
        <a class="tray-sidebar__item" href="#days"><span>Delivery days</span></a>
        <ul class="tray-sidebar__sub tray-sidebar__sub--text">
          <li><a class="tray-sidebar__item" href="#cut-off">Cut-off time</a></li>
          <li><a class="tray-sidebar__item" href="#holidays">Holidays</a></li>
        </ul>
        <a class="tray-sidebar__item" href="#couriers" aria-current="true"><span>Couriers</span></a>
        <ul class="tray-sidebar__sub tray-sidebar__sub--text">
          <li><a class="tray-sidebar__item" href="#chilled-boxes" aria-current="location">Chilled boxes</a></li>
          <li><a class="tray-sidebar__item" href="#pick-up">Pick-up at 14:00</a></li>
          <li><a class="tray-sidebar__item" href="#tracking">Tracking</a></li>
        </ul>
        <a class="tray-sidebar__item" href="#prices"><span>Prices</span></a>
        <ul class="tray-sidebar__sub tray-sidebar__sub--text">
          <li><a class="tray-sidebar__item" href="#free-delivery">Free delivery</a></li>
        </ul>
        <a class="tray-sidebar__item" href="#returns"><span>Returns</span></a>
        <a class="tray-sidebar__item" href="#questions"><span>Questions</span></a>
      </div>
      <div class="tray-sidebar__foot">
        <a class="tray-sidebar__item" href="#" style="flex: 1"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-arrow-up"/></svg><span>Back to the top</span></a>
      </div>
    </nav>
  </div>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
