# Navigation in a popover

A page with no sidebar: a Menu button in the header opens the navigation in a popover; for small products or pages that need the full width.

Small products and full-width screens, such as a board or a map, can do without a sidebar. There is no app shell: the page is a plain screen with a bar along the top, and the Menu button at its end opens the links in a [Popover](https://trayui.com/components/popover.md), as a hamburger menu does. Inside it the sidebar is `tray-sidebar--plain`, with no tray, padding or width of its own, so it takes the popover's surface and keeps the rows of the other sidebars.

Pick it over [the base sidebar](https://trayui.com/blocks/sidebar-01.md) when the menu is opened now and then rather than kept in view; for a public site of a few pages, a [Navigation Menu](https://trayui.com/components/navigation-menu.md) suits better. As the popover opens, focus moves to its first link; Escape closes it and puts focus back on the Menu button, and a press outside closes it too. It is the same popover at every width, with no sheet. The preview opens it with `data-open`; without it the menu starts closed.

It is made of these components: [Popover](https://trayui.com/components/popover.md), [Button](https://trayui.com/components/button.md), [Sidebar](https://trayui.com/components/sidebar.md), [Badge](https://trayui.com/components/badge.md).

Behaviours it uses: `popover`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Navigation in a popover</title>
<meta name="description" content="A page with no sidebar: a Menu button in the header opens the navigation in a popover; for small products or pages that need the full width.">
<meta name="tray-category" content="Sidebar">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-screen">
  <header class="tray-screen__bar">
    <a class="tray-wordmark" href="#">Counter</a>
    <span class="tray-anchor" data-tray="popover">
      <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-menu"/></svg>Menu</button>
      <div class="tray-pop tray-pop--end" style="min-inline-size: 16rem" data-open>
        <nav class="tray-sidebar tray-sidebar--plain" aria-label="Main">
          <div class="tray-sidebar__group">
            <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-house"/></svg><span>Home</span></a>
            <a class="tray-sidebar__item" href="#" aria-current="page"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-inbox"/></svg><span>Orders</span><span class="tray-badge tray-badge--count">12</span></a>
            <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-users"/></svg><span>Customers</span></a>
            <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-package"/></svg><span>Batches</span></a>
            <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chart-column"/></svg><span>Reports</span></a>
          </div>
          <div class="tray-sidebar__group">
            <p class="tray-sidebar__label">Workspace</p>
            <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-user-plus"/></svg><span>Team</span></a>
            <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-credit-card"/></svg><span>Billing</span></a>
            <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-settings"/></svg><span>Settings</span></a>
          </div>
        </nav>
      </div>
    </span>
  </header>
  <main class="tray-screen__body">
    <h1 class="tray-vh">Orders</h1>
    <div class="tray-slots">
      <div class="tray-slot tray-slot--video"></div>
      <div class="tray-slot tray-slot--video"></div>
      <div class="tray-slot tray-slot--video"></div>
    </div>
    <div class="tray-slot tray-slot--tall"></div>
  </main>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
