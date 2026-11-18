# Inset sidebar

An inset sidebar on a grey ground, the page in one white panel: a workspace switcher, the main items, a list of recent batches and an account menu.

In this layout the whole window is a grey tray: the sidebar sits straight on it with no tray of its own, and the page is one white panel with round corners. It shares the [Workspace Switcher](https://trayui.com/components/workspace-switcher.md) at the top and the account menu at the foot with [the sidebar that collapses](https://trayui.com/blocks/sidebar-06.md), and adds a group of recent work under the main items, here four batches and a More link.

Choose it when the product has one main area of work and a short list of things people come back to, such as projects, boards or batches. It has no collapse button. The account menu opens upwards; its head, the name and the email, is not an item the arrow keys reach, so it names the menu and a screen reader hears it as the menu opens. Below 56rem the sidebar moves into a sheet, and under 34rem the white panel narrows its side padding to leave the content room.

It is made of these components: [App Shell](https://trayui.com/components/app-shell.md), [Sidebar](https://trayui.com/components/sidebar.md), [Dropdown Menu](https://trayui.com/components/dropdown-menu.md), [Workspace Switcher](https://trayui.com/components/workspace-switcher.md), [Avatar](https://trayui.com/components/avatar.md), [Badge](https://trayui.com/components/badge.md), [Top Bar](https://trayui.com/components/top-bar.md), [Button](https://trayui.com/components/button.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md).

Behaviours it uses: `menu`, `sidebar-sheet`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Inset sidebar</title>
<meta name="description" content="An inset sidebar on a grey ground, the page in one white panel: a workspace switcher, the main items, a list of recent batches and an account menu.">
<meta name="tray-category" content="Sidebar">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-app tray-app--inset">
  <div class="tray-app__side">
    <nav class="tray-sidebar tray-sidebar--flyout" id="nav" aria-label="Main">
      <div class="tray-anchor tray-anchor--block" data-tray="menu">
        <button class="tray-switcher" type="button">
          <span class="tray-avatar tray-avatar--sm tray-avatar--ink" aria-hidden="true">PF</span>
          <span class="tray-person__text"><b>Perly Farm</b><small>Shop plan</small></span>
          <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chevrons-up-down"/></svg>
        </button>
        <div class="tray-pop">
          <div class="tray-list">
            <p class="tray-list__label">Workspaces</p>
            <button type="button" class="tray-option" role="menuitemradio" data-group="workspace" aria-checked="true"><span class="tray-avatar tray-avatar--xs tray-avatar--ink" aria-hidden="true">PF</span><span class="tray-option__text">Perly Farm</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
            <button type="button" class="tray-option" role="menuitemradio" data-group="workspace" aria-checked="false"><span class="tray-avatar tray-avatar--xs" aria-hidden="true">MB</span><span class="tray-option__text">Meadow Bakery</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
            <button type="button" class="tray-option" role="menuitemradio" data-group="workspace" aria-checked="false"><span class="tray-avatar tray-avatar--xs" aria-hidden="true">HC</span><span class="tray-option__text">Hill Cheese</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
            <hr class="tray-list__rule">
            <button type="button" class="tray-option" role="menuitem"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg><span class="tray-option__text">New workspace</span></button>
          </div>
        </div>
      </div>
      <div class="tray-sidebar__scroll">
        <div class="tray-sidebar__group">
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-house"/></svg><span>Home</span></a>
          <a class="tray-sidebar__item" href="#" aria-current="page"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-inbox"/></svg><span>Orders</span><span class="tray-badge tray-badge--count">12</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-users"/></svg><span>Customers</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-package"/></svg><span>Batches</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chart-column"/></svg><span>Reports</span></a>
        </div>
        <div class="tray-sidebar__group">
          <p class="tray-sidebar__label">Batches</p>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-bookmark"/></svg><span>May, 100 g jars</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-bookmark"/></svg><span>May, 50 g jars</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-bookmark"/></svg><span>April, 100 g jars</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-bookmark"/></svg><span>April, 30 g jars</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-ellipsis"/></svg><span>More</span></a>
        </div>
      </div>
      <div class="tray-anchor tray-anchor--block" data-tray="menu">
        <button class="tray-switcher" type="button">
          <span class="tray-avatar tray-avatar--sm" aria-hidden="true">OF</span>
          <span class="tray-person__text"><b>Oksana Franko</b><small>Owner</small></span>
          <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chevrons-up-down"/></svg>
        </button>
        <div class="tray-pop tray-pop--top">
          <div class="tray-pop__head">
            <span class="tray-avatar" aria-hidden="true">OF</span>
            <span class="tray-person__text"><b>Oksana Franko</b><small>oksana@perly.example</small></span>
          </div>
          <div class="tray-list">
            <hr class="tray-list__rule">
            <a class="tray-option" role="menuitem" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-user"/></svg><span class="tray-option__text">Profile</span></a>
            <a class="tray-option" role="menuitem" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-credit-card"/></svg><span class="tray-option__text">Billing</span><span class="tray-option__meta">Shop plan</span></a>
            <a class="tray-option" role="menuitem" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-settings"/></svg><span class="tray-option__text">Settings</span></a>
            <hr class="tray-list__rule">
            <a class="tray-option" role="menuitem" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-life-buoy"/></svg><span class="tray-option__text">Help</span></a>
            <button type="button" class="tray-option" role="menuitem"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-log-out"/></svg><span class="tray-option__text">Sign out</span></button>
          </div>
        </div>
      </div>
    </nav>
  </div>
  <div class="tray-app__main">
    <header class="tray-topbar">
      <div class="tray-topbar__start">
        <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon tray-app__menu" type="button" data-tray="sidebar-sheet" aria-controls="nav" aria-label="Open the navigation"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-menu"/></svg></button>
        <nav aria-label="Breadcrumb"><ol class="tray-crumbs"><li><a href="#">Perly Farm</a></li><li><span aria-current="page">Orders</span></li></ol></nav>
      </div>
    </header>
    <main class="tray-app__content">
      <h1 class="tray-vh">Orders</h1>
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
