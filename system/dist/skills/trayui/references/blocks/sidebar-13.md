# Sidebar under a site header

A sidebar under a header that spans the whole product and holds the wordmark, the breadcrumb, a search, notifications and the account.

With one header across the whole product, the sidebar under it keeps only navigation: no wordmark at its head, no account at its foot. It suits products where search and notifications matter as much as the menu, such as a store admin or an internal tool used all day. The header is sticky and takes the colour of its ground, and the sidebar starts under it and stays in view as the page scrolls.

Choose it over [the base sidebar](https://trayui.com/blocks/sidebar-01.md) when the account and the search belong in one bar on every page rather than at the foot of the tray. On a narrow screen the header folds part by part: below 56rem the menu button appears before the wordmark, and below 48rem the breadcrumb drops out and the search keeps only its icon, named by its `aria-label`. The notifications button says its count in its name, "Notifications, 2 unread", and the yellow pip is hidden from screen readers, so the number is not read twice.

It is made of these components: [App Shell](https://trayui.com/components/app-shell.md), [Top Bar](https://trayui.com/components/top-bar.md), [Button](https://trayui.com/components/button.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md), [Kbd](https://trayui.com/components/kbd.md), [Avatar](https://trayui.com/components/avatar.md), [Sidebar](https://trayui.com/components/sidebar.md), [Badge](https://trayui.com/components/badge.md).

Behaviours it uses: `sidebar-sheet`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sidebar under a site header</title>
<meta name="description" content="A sidebar under a header that spans the whole product and holds the wordmark, the breadcrumb, a search, notifications and the account.">
<meta name="tray-category" content="Sidebar">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-app tray-app--header">
  <header class="tray-topbar tray-app__header">
    <div class="tray-topbar__start" style="gap: var(--space-5)">
      <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon tray-app__menu" type="button" data-tray="sidebar-sheet" aria-controls="nav" aria-label="Open the navigation"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-menu"/></svg></button>
      <a class="tray-wordmark" href="#">Counter</a>
      <nav class="tray-topbar__wide" aria-label="Breadcrumb"><ol class="tray-crumbs"><li><a href="#">Perly Farm</a></li><li><span aria-current="page">Orders</span></li></ol></nav>
    </div>
    <div class="tray-topbar__end">
      <button class="tray-topbar__search tray-topbar__search--fold" type="button" aria-label="Search orders"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg><span>Search orders</span><kbd class="tray-kbd">/</kbd></button>
      <span class="tray-anchor"><button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" aria-label="Notifications, 2 unread"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-bell"/></svg></button><span class="tray-pip">2</span></span>
      <button class="tray-avatar" type="button" aria-label="Account: Oksana Franko, OF">OF</button>
    </div>
  </header>
  <div class="tray-app__side">
    <nav class="tray-sidebar" id="nav" aria-label="Main">
      <div class="tray-sidebar__group">
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-house"/></svg><span>Home</span></a>
        <a class="tray-sidebar__item" href="#" aria-current="page"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-inbox"/></svg><span>Orders</span><span class="tray-badge tray-badge--count">12</span></a>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-users"/></svg><span>Customers</span></a>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-package"/></svg><span>Batches</span></a>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chart-column"/></svg><span>Reports</span></a>
      </div>
      <div class="tray-sidebar__group">
        <p class="tray-sidebar__label">Shop</p>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-tag"/></svg><span>Products</span></a>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-truck"/></svg><span>Delivery</span></a>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-percent"/></svg><span>Discounts</span></a>
      </div>
      <div class="tray-sidebar__group">
        <p class="tray-sidebar__label">Workspace</p>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-user-plus"/></svg><span>Team</span></a>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-credit-card"/></svg><span>Billing</span></a>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-settings"/></svg><span>Settings</span></a>
      </div>
    </nav>
  </div>
  <div class="tray-app__main">
    <main class="tray-app__content">
      <h1 class="tray-vh">Orders</h1>
      <div class="tray-slots">
        <div class="tray-slot tray-slot--video"></div>
        <div class="tray-slot tray-slot--video"></div>
        <div class="tray-slot tray-slot--video"></div>
      </div>
      <div class="tray-slot tray-slot--tall"></div>
      <div class="tray-slot tray-slot--tall"></div>
      <div class="tray-slot tray-slot--tall"></div>
    </main>
  </div>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
