# Sidebar with a level that folds

A sidebar whose items fold open to show their second level, Orders open and the rest closed; for when the second level is too long to keep open.

Deep sections suit this collapsible sidebar menu, where an item hides a list of pages until it is opened. Such an item is the summary of a `<details>`, so it folds without script, a screen reader hears it as expanded or collapsed, and its small chevron points down while it is open. It only folds and is not a link, so the first entry of its list is the overview, "All orders" here. Items with nothing beneath them, like Home and Batches, stay plain links in the same column.

Choose it over [the always-open second level](https://trayui.com/blocks/sidebar-03.md) once the open lists would push the column past the window, and over [menus beside the items](https://trayui.com/blocks/sidebar-05.md) when people browse a section rather than jump to one page. Write `open` on the item that holds the current page, as Orders has it. The groups scroll between the wordmark and the account, and below 56rem the whole sidebar moves into a sheet behind the menu button.

It is made of these components: [App Shell](https://trayui.com/components/app-shell.md), [Sidebar](https://trayui.com/components/sidebar.md), [Badge](https://trayui.com/components/badge.md), [Avatar](https://trayui.com/components/avatar.md), [Top Bar](https://trayui.com/components/top-bar.md), [Button](https://trayui.com/components/button.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md).

Behaviours it uses: `sidebar-sheet`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sidebar with a level that folds</title>
<meta name="description" content="A sidebar whose items fold open to show their second level, Orders open and the rest closed; for when the second level is too long to keep open.">
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
          <details class="tray-sidebar__more" open>
            <summary class="tray-sidebar__item"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-inbox"/></svg><span>Orders</span><span class="tray-badge tray-badge--count">12</span><svg class="tray-icon tray-icon--sm tray-sidebar__caret" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg></summary>
            <ul class="tray-sidebar__sub">
              <li><a class="tray-sidebar__item" href="#">All orders</a></li>
              <li><a class="tray-sidebar__item" href="#" aria-current="page">To pack</a></li>
              <li><a class="tray-sidebar__item" href="#">With the courier</a></li>
              <li><a class="tray-sidebar__item" href="#">Delivered</a></li>
              <li><a class="tray-sidebar__item" href="#">Returns</a></li>
            </ul>
          </details>
          <details class="tray-sidebar__more">
            <summary class="tray-sidebar__item"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-users"/></svg><span>Customers</span><svg class="tray-icon tray-icon--sm tray-sidebar__caret" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg></summary>
            <ul class="tray-sidebar__sub">
              <li><a class="tray-sidebar__item" href="#">All customers</a></li>
              <li><a class="tray-sidebar__item" href="#">Restaurants</a></li>
              <li><a class="tray-sidebar__item" href="#">Subscriptions</a></li>
            </ul>
          </details>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-package"/></svg><span>Batches</span></a>
          <details class="tray-sidebar__more">
            <summary class="tray-sidebar__item"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chart-column"/></svg><span>Reports</span><svg class="tray-icon tray-icon--sm tray-sidebar__caret" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg></summary>
            <ul class="tray-sidebar__sub">
              <li><a class="tray-sidebar__item" href="#">Sales</a></li>
              <li><a class="tray-sidebar__item" href="#">Stock</a></li>
              <li><a class="tray-sidebar__item" href="#">Delivery times</a></li>
            </ul>
          </details>
        </div>
        <div class="tray-sidebar__group">
          <p class="tray-sidebar__label">Shop</p>
          <details class="tray-sidebar__more">
            <summary class="tray-sidebar__item"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-tag"/></svg><span>Products</span><svg class="tray-icon tray-icon--sm tray-sidebar__caret" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg></summary>
            <ul class="tray-sidebar__sub">
              <li><a class="tray-sidebar__item" href="#">Jars</a></li>
              <li><a class="tray-sidebar__item" href="#">Gift boxes</a></li>
            </ul>
          </details>
          <details class="tray-sidebar__more">
            <summary class="tray-sidebar__item"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-truck"/></svg><span>Delivery</span><svg class="tray-icon tray-icon--sm tray-sidebar__caret" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg></summary>
            <ul class="tray-sidebar__sub">
              <li><a class="tray-sidebar__item" href="#">Couriers</a></li>
              <li><a class="tray-sidebar__item" href="#">Zones</a></li>
              <li><a class="tray-sidebar__item" href="#">Pickup points</a></li>
            </ul>
          </details>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-percent"/></svg><span>Discounts</span></a>
        </div>
        <div class="tray-sidebar__group">
          <p class="tray-sidebar__label">Workspace</p>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-user-plus"/></svg><span>Team</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-credit-card"/></svg><span>Billing</span></a>
          <details class="tray-sidebar__more">
            <summary class="tray-sidebar__item"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-settings"/></svg><span>Settings</span><svg class="tray-icon tray-icon--sm tray-sidebar__caret" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg></summary>
            <ul class="tray-sidebar__sub">
              <li><a class="tray-sidebar__item" href="#">General</a></li>
              <li><a class="tray-sidebar__item" href="#">Notifications</a></li>
              <li><a class="tray-sidebar__item" href="#">Integrations</a></li>
            </ul>
          </details>
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
