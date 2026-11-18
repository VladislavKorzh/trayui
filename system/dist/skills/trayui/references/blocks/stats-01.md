# Stat cards with a period switch

Six stat cards in two groups under a switch between 7 days, 30 days and the season, each set against the period before, the season against last year.

An analytics dashboard of KPI cards, for a team that checks the same six figures every week. The cards fall into two groups, Sales and Packing and delivery, and tabs switch the period between 7 days, 30 days and the season; each panel says which dates it covers and what they are set against. Every card is one link to its report, with a trend and a spark line. Pick it when the figures matter more than their shape: the [season chart](https://trayui.com/blocks/stats-02.md) adds one large chart, and the [breakdown by channel](https://trayui.com/blocks/stats-03.md) splits a month into parts.

The colour of a trend follows `data-tone`, not its arrow: a pack time four minutes longer is marked bad, and the sign in the text, "+4 min", carries the direction for a screen reader, which skips the spark lines. Below 56rem the sidebar gives way to a menu button that opens it in a sheet.

It is made of these components: [App Shell](https://trayui.com/components/app-shell.md), [Sidebar](https://trayui.com/components/sidebar.md), [Dropdown Menu](https://trayui.com/components/dropdown-menu.md), [Workspace Switcher](https://trayui.com/components/workspace-switcher.md), [Avatar](https://trayui.com/components/avatar.md), [Badge](https://trayui.com/components/badge.md), [Top Bar](https://trayui.com/components/top-bar.md), [Button](https://trayui.com/components/button.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md), [Kbd](https://trayui.com/components/kbd.md), [Page Header](https://trayui.com/components/page-header.md), [Tabs](https://trayui.com/components/tabs.md), [Stat Card](https://trayui.com/components/stat-card.md).

Behaviours it uses: `menu`, `sidebar-sheet`, `sidebar-toggle`, `spark`, `tabs`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Stat cards with a period switch</title>
<meta name="description" content="Six stat cards in two groups under a switch between 7 days, 30 days and the season, each set against the period before, the season against last year.">
<meta name="tray-category" content="Stats">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-app">
  <div class="tray-app__side">
    <nav class="tray-sidebar" id="nav" aria-label="Main">
      <div class="tray-sidebar__head" style="padding-inline: 0">
        <div class="tray-anchor tray-anchor--block" data-tray="menu">
          <button class="tray-switcher" type="button"><span class="tray-avatar tray-avatar--sm tray-avatar--ink" aria-hidden="true">PF</span><span class="tray-person__text"><b>Perly Farm</b><small>Shop plan</small></span><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chevrons-up-down"/></svg></button>
          <div class="tray-pop">
            <div class="tray-list">
              <p class="tray-list__label">Workspaces</p>
              <button class="tray-option" type="button" role="menuitemradio" data-group="workspace" aria-checked="true"><span class="tray-avatar tray-avatar--xs tray-avatar--ink" aria-hidden="true">PF</span><span class="tray-option__text">Perly Farm</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
              <button class="tray-option" type="button" role="menuitemradio" data-group="workspace" aria-checked="false"><span class="tray-avatar tray-avatar--xs" aria-hidden="true">MB</span><span class="tray-option__text">Meadow Bakery</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
              <button class="tray-option" type="button" role="menuitemradio" data-group="workspace" aria-checked="false"><span class="tray-avatar tray-avatar--xs" aria-hidden="true">HC</span><span class="tray-option__text">Hill Cheese</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
              <hr class="tray-list__rule">
              <button class="tray-option" type="button" role="menuitem"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg><span class="tray-option__text">New workspace</span></button>
            </div>
          </div>
        </div>
      </div>
      <div class="tray-sidebar__scroll">
        <div class="tray-sidebar__group">
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-house"/></svg><span>Home</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-inbox"/></svg><span>Orders</span><span class="tray-badge tray-badge--count">12</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-truck"/></svg><span>Deliveries</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-users"/></svg><span>Customers</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-package"/></svg><span>Batches</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chart-column"/></svg><span>Reports</span></a>
          <ul class="tray-sidebar__sub">
            <li><a class="tray-sidebar__item" href="#" aria-current="page">Overview</a></li>
            <li><a class="tray-sidebar__item" href="#">Season</a></li>
            <li><a class="tray-sidebar__item" href="#">Channels</a></li>
          </ul>
        </div>
        <div class="tray-sidebar__group">
          <p class="tray-sidebar__label">Workspace</p>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-user-plus"/></svg><span>Team</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-credit-card"/></svg><span>Billing</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-settings"/></svg><span>Settings</span></a>
        </div>
      </div>
    </nav>
  </div>
  <div class="tray-app__main">
    <header class="tray-topbar">
      <div class="tray-topbar__start">
        <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon tray-app__menu" type="button" data-tray="sidebar-sheet" aria-controls="nav" aria-label="Open the navigation"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-menu"/></svg></button>
        <button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon tray-app__collapse" type="button" data-tray="sidebar-toggle" aria-controls="nav" aria-label="Collapse the sidebar"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-panel-left"/></svg></button>
        <nav aria-label="Breadcrumb"><ol class="tray-crumbs tray-crumbs--fold"><li><a href="#">Perly Farm</a></li><li><a href="#">Reports</a></li><li><span aria-current="page">Overview</span></li></ol></nav>
      </div>
      <div class="tray-topbar__end">
        <button class="tray-topbar__search tray-topbar__search--fold" type="button" aria-label="Search orders"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg><span>Search orders</span><kbd class="tray-kbd">/</kbd></button>
        <span class="tray-anchor"><button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" aria-label="Notifications, 2 unread"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-bell"/></svg></button><span class="tray-pip">2</span></span>
        <button class="tray-avatar" type="button" aria-label="Account: Oksana Franko, OF">OF</button>
      </div>
    </header>
    <main class="tray-app__content">
      <div class="tray-pagehead">
        <div class="tray-pagehead__row">
          <div class="tray-pagehead__text">
            <h1 class="title">Overview</h1>
            <p>Each figure against the period before it. A card opens its report. Demo data.</p>
          </div>
          <div class="tray-pagehead__actions">
            <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-share"/></svg>Share</button>
            <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-download"/></svg>Export</button>
          </div>
        </div>
      </div>
      <div data-tray="tabs">
        <div class="tray-tabs" role="tablist" aria-label="Period">
          <button class="tray-tab" role="tab" type="button" id="tab-week" aria-controls="panel-week">7 days</button>
          <button class="tray-tab" role="tab" type="button" id="tab-month" aria-controls="panel-month" aria-selected="true">30 days</button>
          <button class="tray-tab" role="tab" type="button" id="tab-season" aria-controls="panel-season">Season</button>
        </div>
        <div class="tray-tabpanel" role="tabpanel" id="panel-week" aria-labelledby="tab-week" tabindex="0" hidden>
          <div class="tray-stack tray-stack--lg">
            <p class="tray-soft">20 to 26 November, against the 7 days before.</p>
            <section class="tray-stack" aria-labelledby="sales-week">
              <h2 class="subtitle" id="sales-week">Sales</h2>
              <div class="tray-stats">
                <a class="tray-stat tray-island" href="#">
                  <p class="tray-stat__label">Revenue<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">$23,513</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+11%</span>than the 7 days before</p>
                  <div data-tray="spark" data-points="3120,2980,2410,3350,4010,3870,3773"></div>
                </a>
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Orders<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">243</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+10%</span>than the 7 days before</p>
                  <div data-tray="spark" data-points="37,30,24,35,43,36,38"></div>
                </a>
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Average order<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">$96.76</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+1%</span>than the 7 days before</p>
                  <div data-tray="spark" data-points="84,99,100,96,93,108,99"></div>
                </a>
              </div>
            </section>
            <section class="tray-stack" aria-labelledby="desk-week">
              <h2 class="subtitle" id="desk-week">Packing and delivery</h2>
              <div class="tray-stats">
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Time to pack<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">26<small>min</small></p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="bad"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+4 min</span>than the 7 days before</p>
                  <div data-tray="spark" data-points="22,23,25,24,27,29,26"></div>
                </a>
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Delivered on time<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">96%</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="bad"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-down"/></svg>&minus;1 point</span>than the 7 days before</p>
                  <div data-tray="spark" data-points="98,97,97,95,94,96,96"></div>
                </a>
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Returns<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">3</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-down"/></svg>&minus;2</span>than the 7 days before</p>
                  <div data-tray="spark" data-points="1,0,0,1,0,1,0"></div>
                </a>
              </div>
            </section>
          </div>
        </div>
        <div class="tray-tabpanel" role="tabpanel" id="panel-month" aria-labelledby="tab-month" tabindex="0">
          <div class="tray-stack tray-stack--lg">
            <p class="tray-soft">28 October to 26 November, against the 30 days before.</p>
            <section class="tray-stack" aria-labelledby="sales-month">
              <h2 class="subtitle" id="sales-month">Sales</h2>
              <div class="tray-stats">
                <a class="tray-stat tray-island" href="#">
                  <p class="tray-stat__label">Revenue<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">$90,860</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+8%</span>than the 30 days before</p>
                  <div data-tray="spark" data-points="10.2,11.0,11.6,10.9,11.8,12.4,11.3,11.6"></div>
                </a>
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Orders<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">936</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+6%</span>than the 30 days before</p>
                  <div data-tray="spark" data-points="112,118,121,113,122,127,118,105"></div>
                </a>
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Average order<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">$97.07</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+2%</span>than the 30 days before</p>
                  <div data-tray="spark" data-points="95,96,97,96,98,97,99,97"></div>
                </a>
              </div>
            </section>
            <section class="tray-stack" aria-labelledby="desk-month">
              <h2 class="subtitle" id="desk-month">Packing and delivery</h2>
              <div class="tray-stats">
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Time to pack<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">24<small>min</small></p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-down"/></svg>&minus;2 min</span>than the 30 days before</p>
                  <div data-tray="spark" data-points="27,26,26,25,24,23,24,24"></div>
                </a>
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Delivered on time<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">97%</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+1 point</span>than the 30 days before</p>
                  <div data-tray="spark" data-points="95,96,96,97,97,98,97,97"></div>
                </a>
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Returns<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">11</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-down"/></svg>&minus;4</span>than the 30 days before</p>
                  <div data-tray="spark" data-points="3,2,2,1,1,0,1,1"></div>
                </a>
              </div>
            </section>
          </div>
        </div>
        <div class="tray-tabpanel" role="tabpanel" id="panel-season" aria-labelledby="tab-season" tabindex="0" hidden>
          <div class="tray-stack tray-stack--lg">
            <p class="tray-soft">9 March to 26 November, against the same days of 2025.</p>
            <section class="tray-stack" aria-labelledby="sales-season">
              <h2 class="subtitle" id="sales-season">Sales</h2>
              <div class="tray-stats">
                <a class="tray-stat tray-island" href="#">
                  <p class="tray-stat__label">Revenue<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">$611,240</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+14%</span>than by this day in 2025</p>
                  <div data-tray="spark" data-points="38,52,71,80,66,58,74,69,64"></div>
                </a>
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Orders<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">6,318</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+12%</span>than by this day in 2025</p>
                  <div data-tray="spark" data-points="402,540,738,826,690,604,771,712,662"></div>
                </a>
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Average order<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">$96.75</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+2%</span>than by this day in 2025</p>
                  <div data-tray="spark" data-points="94,96,96,97,96,96,97,97,97"></div>
                </a>
              </div>
            </section>
            <section class="tray-stack" aria-labelledby="desk-season">
              <h2 class="subtitle" id="desk-season">Packing and delivery</h2>
              <div class="tray-stats">
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Time to pack<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">25<small>min</small></p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-down"/></svg>&minus;6 min</span>than by this day in 2025</p>
                  <div data-tray="spark" data-points="33,31,30,28,27,26,25,24,25"></div>
                </a>
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Delivered on time<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">97%</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="good"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+2 points</span>than by this day in 2025</p>
                  <div data-tray="spark" data-points="94,95,96,96,97,97,98,97,97"></div>
                </a>
                <a class="tray-stat" href="#">
                  <p class="tray-stat__label">Returns<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-arrow-up-right"/></svg></p>
                  <p class="tray-stat__value">64</p>
                  <p class="tray-stat__foot"><span class="tray-trend" data-tone="bad"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-trending-up"/></svg>+9</span>than by this day in 2025</p>
                  <div data-tray="spark" data-points="4,6,9,10,8,6,8,7,6"></div>
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
