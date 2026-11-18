# Sidebar in a dialog

A settings dialog open over the app, with a sidebar of its own: six sections down the side and the notification switches of the chosen one.

A settings modal that opens over the page instead of replacing it: the product stays behind the dialog, and the dialog's own sidebar moves between its sections without leaving it. That sidebar is a second `<nav>`, named "Sections of the settings", inside a modal named "Settings", and the section shown carries `aria-current="page"`. Each switch in the pane is a checkbox with `role="switch"`, its title and a line of help inside the label.

Pick it when settings are visited briefly and people should land back where they were; for a settings area with pages of its own, see [profile settings](https://trayui.com/blocks/settings-01.md). The block opens the dialog on load only to show it: in a product the "Open settings" button does that through the [Dialog](https://trayui.com/components/dialog.md) script. Escape, either close button or a click on the veil closes it. Below 48rem the list of sections turns into one row above the switches that scrolls sideways, with its label hidden.

It is made of these components: [App Shell](https://trayui.com/components/app-shell.md), [Sidebar](https://trayui.com/components/sidebar.md), [Badge](https://trayui.com/components/badge.md), [Avatar](https://trayui.com/components/avatar.md), [Top Bar](https://trayui.com/components/top-bar.md), [Button](https://trayui.com/components/button.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md), [Dialog](https://trayui.com/components/dialog.md), [Switch](https://trayui.com/components/switch.md).

Behaviours it uses: `dialog`, `open`, `sidebar-sheet`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sidebar in a dialog</title>
<meta name="description" content="A settings dialog open over the app, with a sidebar of its own: six sections down the side and the notification switches of the chosen one.">
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
        <nav aria-label="Breadcrumb"><ol class="tray-crumbs"><li><a href="#">Perly Farm</a></li><li><span aria-current="page">Orders</span></li></ol></nav>
      </div>
    </header>
    <main class="tray-app__content">
      <h1 class="tray-vh">Orders</h1>
      <div>
        <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-tray="open" data-target="#settings"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-settings"/></svg>Open settings</button>
      </div>
      <div class="tray-slot tray-slot--tall"></div>
    </main>
  </div>
</div>
<dialog class="tray-dialog tray-dialog--split" id="settings" data-tray="dialog" aria-label="Settings">
  <div class="tray-dialog__split">
    <nav class="tray-sidebar" aria-label="Sections of the settings">
      <div class="tray-sidebar__group">
        <p class="tray-sidebar__label">Settings</p>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-user"/></svg><span>Profile</span></a>
        <a class="tray-sidebar__item" href="#" aria-current="page"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-bell"/></svg><span>Notifications</span></a>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-sun"/></svg><span>Appearance</span></a>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-globe"/></svg><span>Language</span></a>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-lock"/></svg><span>Privacy</span></a>
        <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-terminal"/></svg><span>Advanced</span></a>
      </div>
    </nav>
    <div class="tray-dialog__pane">
      <div class="tray-dialog__head">
        <div>
          <h2 class="title">Notifications</h2>
          <p class="tray-dialog__text">What Counter tells you, and when. A switch saves as you move it.</p>
        </div>
        <button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-close aria-label="Close"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-x"/></svg></button>
      </div>
      <div class="tray-stack tray-stack--sm">
        <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>New orders</b><small>The moment an order reaches the desk</small></span><input type="checkbox" role="switch" checked><span class="tray-switch__track"></span></label>
        <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>Courier pick-up</b><small>One hour before the courier comes at 14:00</small></span><input type="checkbox" role="switch" checked><span class="tray-switch__track"></span></label>
        <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>Low stock</b><small>When fewer than 20 jars of a size are left</small></span><input type="checkbox" role="switch" checked><span class="tray-switch__track"></span></label>
        <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>Weekly report</b><small>By email, every Monday at 9:00</small></span><input type="checkbox" role="switch"><span class="tray-switch__track"></span></label>
      </div>
      <div class="tray-dialog__foot">
        <button class="tray-btn tray-btn--quiet tray-btn--md" type="button">Send a test notification</button>
        <button class="tray-btn tray-btn--md" type="button" data-close>Close settings</button>
      </div>
    </div>
  </div>
</dialog>
<script src="../components/bundle.js"></script>
<script>
/* Here only so the block shows the dialog open, with no focus ring. In a product the "Open settings" button opens it. */
window.addEventListener('load', function () { document.getElementById('settings').showModal(); document.activeElement.blur(); });
</script>
</body>
</html>
```
