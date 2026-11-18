# Sidebar with a calendar

A wide sidebar for a calendar: a month to pick the day, your own and the shared calendars as checkboxes in groups that fold, and a button to add one.

The side panel of a calendar or booking app: the month picks the day the page shows, and the lists below choose whose events appear. It is an `<aside>` named "Calendars" rather than navigation, since nothing in it is a link. The month is a [Calendar](https://trayui.com/components/calendar.md) with one stop for Tab: the arrow keys move by a day or a week, each day is a button named by its full date, and the chosen day reports `aria-pressed`. Each folding group of checkboxes has `role="group"` and the name of its heading.

Choose it for a tool whose sidebar filters one view rather than moving between pages, such as a schedule of deliveries, rooms or shifts. It is 21rem wide, like the message column of [two sidebars](https://trayui.com/blocks/sidebar-08.md). Below 56rem the menu button, "Open the calendars", opens it in a sheet like any sidebar, and the month stretches to fill the sheet's width.

It is made of these components: [App Shell](https://trayui.com/components/app-shell.md), [Sidebar](https://trayui.com/components/sidebar.md), [Avatar](https://trayui.com/components/avatar.md), [Calendar](https://trayui.com/components/calendar.md), [Checkbox](https://trayui.com/components/checkbox.md), [Button](https://trayui.com/components/button.md), [Top Bar](https://trayui.com/components/top-bar.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md).

Behaviours it uses: `calendar`, `sidebar-sheet`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sidebar with a calendar</title>
<meta name="description" content="A wide sidebar for a calendar: a month to pick the day, your own and the shared calendars as checkboxes in groups that fold, and a button to add one.">
<meta name="tray-category" content="Sidebar">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-app">
  <div class="tray-app__side">
    <aside class="tray-sidebar tray-sidebar--wide" id="calendars" aria-label="Calendars">
      <div class="tray-sidebar__head" style="padding-inline: 0">
        <div class="tray-sidebar__user">
          <span class="tray-avatar tray-avatar--sm" aria-hidden="true">OF</span>
          <span class="tray-person__text"><b>Oksana Franko</b><small>Perly Farm</small></span>
        </div>
      </div>
      <div class="tray-cal tray-cal--fluid" data-tray="calendar" data-today="2026-11-15" data-value="2026-11-16"></div>
      <details class="tray-sidebar__group" open>
        <summary class="tray-sidebar__label">My calendars<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg></summary>
        <div class="tray-sidebar__body" role="group" aria-label="My calendars">
          <label class="tray-check"><input type="checkbox" checked><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>Deliveries</span></label>
          <label class="tray-check"><input type="checkbox" checked><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>Courier pick-ups</span></label>
          <label class="tray-check"><input type="checkbox"><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>Farm work</span></label>
        </div>
      </details>
      <details class="tray-sidebar__group">
        <summary class="tray-sidebar__label">Shared<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg></summary>
        <div class="tray-sidebar__body" role="group" aria-label="Shared">
          <label class="tray-check"><input type="checkbox" checked><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>Holidays</span></label>
          <label class="tray-check"><input type="checkbox"><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>Markets</span></label>
        </div>
      </details>
      <div class="tray-sidebar__foot">
        <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--block" type="button"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg>Add a calendar</button>
      </div>
    </aside>
  </div>
  <div class="tray-app__main">
    <header class="tray-topbar">
      <div class="tray-topbar__start">
        <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon tray-app__menu" type="button" data-tray="sidebar-sheet" aria-controls="calendars" aria-label="Open the calendars"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-menu"/></svg></button>
        <nav aria-label="Breadcrumb"><ol class="tray-crumbs"><li><a href="#">Perly Farm</a></li><li><span aria-current="page">Calendar</span></li></ol></nav>
      </div>
    </header>
    <main class="tray-app__content">
      <h1 class="tray-vh">Calendar</h1>
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
