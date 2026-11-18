# Sidebar with a second level

A sidebar with a second level always open under its items, such as the statuses under Orders; for a short second level used every day.

A multi-level sidebar that keeps the sub-pages in view: the statuses of orders, the kinds of customers, the parts of the settings. Each parent stays a link to its own page, and its second level is a plain list beneath it, indented under the label, in 36px rows without icons. The current sub-page turns white and semibold rather than solid ink, so a long column still has one clear mark. As the open lists make the column long, the groups sit in `tray-sidebar__scroll`: they scroll between the wordmark and the account, which stay in view.

Pick it when the second level is short and used every day, so a click to unfold it would be wasted. When the lists run longer, [items that fold](https://trayui.com/blocks/sidebar-04.md) hide them until asked; when people jump straight to one sub-page, [menus beside the items](https://trayui.com/blocks/sidebar-05.md) keep the column short. In the phone sheet the current sub-page takes the sheet's fill instead of white, so it still shows on that ground.

It is made of these components: [App Shell](https://trayui.com/components/app-shell.md), [Sidebar](https://trayui.com/components/sidebar.md), [Badge](https://trayui.com/components/badge.md), [Avatar](https://trayui.com/components/avatar.md), [Top Bar](https://trayui.com/components/top-bar.md), [Button](https://trayui.com/components/button.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md).

Behaviours it uses: `sidebar-sheet`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sidebar with a second level</title>
<meta name="description" content="A sidebar with a second level always open under its items, such as the statuses under Orders; for a short second level used every day.">
<meta name="tray-category" content="Sidebar">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-app">
  <div class="tray-app__side">
    <nav class="tray-sidebar" id="nav" aria-label="Main">
      <div class="tray-sidebar__head">
        <a class="tray-wordmark" href="#">Counter</a>
      </div>
      <div class="tray-sidebar__scroll">
        <div class="tray-sidebar__group">
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-house"/></svg><span>Home</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-inbox"/></svg><span>Orders</span><span class="tray-badge tray-badge--count">12</span></a>
          <ul class="tray-sidebar__sub">
            <li><a class="tray-sidebar__item" href="#" aria-current="page">To pack</a></li>
            <li><a class="tray-sidebar__item" href="#">With the courier</a></li>
            <li><a class="tray-sidebar__item" href="#">Delivered</a></li>
            <li><a class="tray-sidebar__item" href="#">Returns</a></li>
          </ul>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-users"/></svg><span>Customers</span></a>
          <ul class="tray-sidebar__sub">
            <li><a class="tray-sidebar__item" href="#">All customers</a></li>
            <li><a class="tray-sidebar__item" href="#">Restaurants</a></li>
            <li><a class="tray-sidebar__item" href="#">Subscriptions</a></li>
          </ul>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-package"/></svg><span>Batches</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chart-column"/></svg><span>Reports</span></a>
          <ul class="tray-sidebar__sub">
            <li><a class="tray-sidebar__item" href="#">Sales</a></li>
            <li><a class="tray-sidebar__item" href="#">Stock</a></li>
            <li><a class="tray-sidebar__item" href="#">Delivery times</a></li>
          </ul>
        </div>
        <div class="tray-sidebar__group">
          <p class="tray-sidebar__label">Shop</p>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-tag"/></svg><span>Products</span></a>
          <ul class="tray-sidebar__sub">
            <li><a class="tray-sidebar__item" href="#">Jars</a></li>
            <li><a class="tray-sidebar__item" href="#">Gift boxes</a></li>
          </ul>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-truck"/></svg><span>Delivery</span></a>
          <ul class="tray-sidebar__sub">
            <li><a class="tray-sidebar__item" href="#">Couriers</a></li>
            <li><a class="tray-sidebar__item" href="#">Zones</a></li>
            <li><a class="tray-sidebar__item" href="#">Pickup points</a></li>
          </ul>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-percent"/></svg><span>Discounts</span></a>
        </div>
        <div class="tray-sidebar__group">
          <p class="tray-sidebar__label">Workspace</p>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-user-plus"/></svg><span>Team</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-credit-card"/></svg><span>Billing</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-settings"/></svg><span>Settings</span></a>
          <ul class="tray-sidebar__sub">
            <li><a class="tray-sidebar__item" href="#">General</a></li>
            <li><a class="tray-sidebar__item" href="#">Notifications</a></li>
            <li><a class="tray-sidebar__item" href="#">Integrations</a></li>
          </ul>
        </div>
      </div>
      <div class="tray-sidebar__foot">
        <div class="tray-sidebar__user">
          <span class="tray-avatar tray-avatar--sm" aria-hidden="true">OF</span>
          <span class="tray-person__text"><b>Oksana Franko</b><small>Perly Farm</small></span>
        </div>
      </div>
    </nav>
  </div>
  <div class="tray-app__main">
    <header class="tray-topbar">
      <div class="tray-topbar__start">
        <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon tray-app__menu" type="button" data-tray="sidebar-sheet" aria-controls="nav" aria-label="Open the navigation"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-menu"/></svg></button>
        <nav aria-label="Breadcrumb"><ol class="tray-crumbs"><li><a href="#">Perly Farm</a></li><li><a href="#">Orders</a></li><li><span aria-current="page">To pack</span></li></ol></nav>
      </div>
    </header>
    <main class="tray-app__content">
      <h1 class="tray-vh">Orders to pack</h1>
      <div class="tray-slots">
        <div class="tray-slot tray-slot--video"></div>
        <div class="tray-slot tray-slot--video"></div>
        <div class="tray-slot tray-slot--video"></div>
      </div>
      <div class="tray-slot tray-slot--tall"></div>
    </main>
  </div>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
