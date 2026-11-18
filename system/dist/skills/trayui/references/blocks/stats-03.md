# Breakdown by channel

A breakdown of the month: orders by channel beside the best sellers with their share, then orders by city and the share of repeat customers.

A breakdown of one month, for the question of where the orders came from and what they bought. A donut splits the orders by channel, a table of best sellers shows each product's share of sales as a meter in its row, horizontal bars rank the cities, and one large figure gives the share of repeat customers. A select picks the month, and the header runs across the top of the shell, over the sidebar. Pick it for parts of a whole; for figures over time, see the [stat cards with a period switch](https://trayui.com/blocks/stats-01.md) or the [season chart](https://trayui.com/blocks/stats-02.md).

The donut and the bars are stops for Tab, read by their written summary, and the table is named by its card's heading through `aria-labelledby`, with `scope` on every head. Below 48rem the breadcrumb leaves the header, and the table, at least 30rem wide, scrolls sideways inside its card.

It is made of these components: [App Shell](https://trayui.com/components/app-shell.md), [Top Bar](https://trayui.com/components/top-bar.md), [Button](https://trayui.com/components/button.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md), [Kbd](https://trayui.com/components/kbd.md), [Avatar](https://trayui.com/components/avatar.md), [Sidebar](https://trayui.com/components/sidebar.md), [Badge](https://trayui.com/components/badge.md), [Page Header](https://trayui.com/components/page-header.md), [Native Select](https://trayui.com/components/native-select.md), [Card](https://trayui.com/components/card.md), [Chart](https://trayui.com/components/chart.md), [Table](https://trayui.com/components/table.md), [Progress](https://trayui.com/components/progress.md).

Behaviours it uses: `chart`, `sidebar-sheet`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Breakdown by channel</title>
<meta name="description" content="A breakdown of the month: orders by channel beside the best sellers with their share, then orders by city and the share of repeat customers.">
<meta name="tray-category" content="Stats">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-app tray-app--header">
  <header class="tray-topbar tray-app__header">
    <div class="tray-topbar__start" style="gap: var(--space-5)">
      <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon tray-app__menu" type="button" data-tray="sidebar-sheet" aria-controls="nav" aria-label="Open the navigation"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-menu"/></svg></button>
      <a class="tray-wordmark" href="#">Counter</a>
      <nav class="tray-topbar__wide" aria-label="Breadcrumb"><ol class="tray-crumbs"><li><a href="#">Reports</a></li><li><span aria-current="page">Channels</span></li></ol></nav>
    </div>
    <div class="tray-topbar__end">
      <button class="tray-topbar__search tray-topbar__search--fold" type="button" aria-label="Search orders"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg><span>Search orders</span><kbd class="tray-kbd">/</kbd></button>
      <span class="tray-anchor"><button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" aria-label="Notifications, 2 unread"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-bell"/></svg></button><span class="tray-pip">2</span></span>
      <button class="tray-avatar" type="button" aria-label="Account: Oksana Franko, OF">OF</button>
    </div>
  </header>
  <div class="tray-app__side">
    <nav class="tray-sidebar" id="nav" aria-label="Main">
      <div class="tray-sidebar__scroll">
        <div class="tray-sidebar__group">
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-house"/></svg><span>Home</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-inbox"/></svg><span>Orders</span><span class="tray-badge tray-badge--count">12</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-truck"/></svg><span>Deliveries</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-users"/></svg><span>Customers</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-package"/></svg><span>Batches</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chart-column"/></svg><span>Reports</span></a>
          <ul class="tray-sidebar__sub">
            <li><a class="tray-sidebar__item" href="#">Overview</a></li>
            <li><a class="tray-sidebar__item" href="#">Season</a></li>
            <li><a class="tray-sidebar__item" href="#" aria-current="page">Channels</a></li>
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
    <main class="tray-app__content">
      <div class="tray-pagehead">
        <div class="tray-pagehead__row">
          <div class="tray-pagehead__text">
            <h1 class="title">Channels</h1>
            <p>Where the orders of the month came from, and what they bought. Demo data.</p>
          </div>
          <div class="tray-pagehead__actions">
            <span class="tray-select tray-select--sm"><select aria-label="Month"><option>November 2026</option><option>October 2026</option><option>September 2026</option></select></span>
            <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-download"/></svg>Export</button>
          </div>
        </div>
        <p class="tray-pagehead__meta"><span><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-calendar"/></svg>1 to 27 November</span><span><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-inbox"/></svg>842 orders</span><span><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-dollar-sign"/></svg>$81,622 in sales</span></p>
      </div>
      <div class="tray-bento">
        <section class="tray-card tray-span-4" aria-labelledby="channel-title">
          <div class="tray-card__head">
            <div>
              <h2 class="subtitle" id="channel-title">Orders by channel</h2>
              <p class="tray-chart__caption">Restaurants place one order in six and bring 31% of the sales.</p>
            </div>
          </div>
          <figure class="tray-chart" data-tray="chart" data-chart='{"type": "donut", "totalLabel": "orders", "labelHead": "Channel", "table": false, "labels": ["Online shop", "Farm shop", "Restaurants", "Markets"], "series": [{"name": "Orders", "values": [466, 192, 131, 53]}], "summary": "Donut chart of the 842 orders placed from 1 to 27 November, by channel: the online shop 466, the farm shop 192, restaurants 131 and markets 53. Demo data."}'></figure>
        </section>
        <section class="tray-card tray-span-8" aria-labelledby="best-title">
          <div class="tray-card__head">
            <div>
              <h2 class="subtitle" id="best-title">Best sellers</h2>
              <p class="tray-chart__caption">By sales, with each one&rsquo;s share of the month</p>
            </div>
            <a class="tray-btn tray-btn--quiet tray-btn--xs" href="#">All products</a>
          </div>
          <div class="tray-table-wrap" tabindex="0" role="region" aria-labelledby="best-title">
            <table class="tray-table" aria-labelledby="best-title" style="min-inline-size: 30rem">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col" data-num>Sold</th>
                  <th scope="col" style="inline-size: 32%">Share of sales</th>
                  <th scope="col" data-num>Sales</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><span class="tray-person__text"><span>Jar of 50 g</span><small>$64 a jar</small></span></th>
                  <td data-num>472 jars</td>
                  <td>
                    <div class="tray-progress">
                      <span class="tray-progress__value">37%</span>
                      <span class="tray-progress__bar" role="meter" aria-label="Share of revenue, jar of 50 g" aria-valuemin="0" aria-valuemax="100" aria-valuenow="37" style="--tray-v: 37"></span>
                    </div>
                  </td>
                  <td data-num>$30,208</td>
                </tr>
                <tr>
                  <th scope="row"><span class="tray-person__text"><span>Jar of 100 g</span><small>$112 a jar</small></span></th>
                  <td data-num>189 jars</td>
                  <td>
                    <div class="tray-progress">
                      <span class="tray-progress__value">26%</span>
                      <span class="tray-progress__bar" role="meter" aria-label="Share of revenue, jar of 100 g" aria-valuemin="0" aria-valuemax="100" aria-valuenow="26" style="--tray-v: 26"></span>
                    </div>
                  </td>
                  <td data-num>$21,168</td>
                </tr>
                <tr>
                  <th scope="row"><span class="tray-person__text"><span>Restaurant tin, 250 g</span><small>$250 a tin</small></span></th>
                  <td data-num>62 tins</td>
                  <td>
                    <div class="tray-progress">
                      <span class="tray-progress__value">19%</span>
                      <span class="tray-progress__bar" role="meter" aria-label="Share of revenue, Restaurant tin, 250 g" aria-valuemin="0" aria-valuemax="100" aria-valuenow="19" style="--tray-v: 19"></span>
                    </div>
                  </td>
                  <td data-num>$15,500</td>
                </tr>
                <tr>
                  <th scope="row"><span class="tray-person__text"><span>Jar of 30 g</span><small>$42 a jar</small></span></th>
                  <td data-num>253 jars</td>
                  <td>
                    <div class="tray-progress">
                      <span class="tray-progress__value">13%</span>
                      <span class="tray-progress__bar" role="meter" aria-label="Share of revenue, jar of 30 g" aria-valuemin="0" aria-valuemax="100" aria-valuenow="13" style="--tray-v: 13"></span>
                    </div>
                  </td>
                  <td data-num>$10,626</td>
                </tr>
                <tr>
                  <th scope="row"><span class="tray-person__text"><span>Tasting set, 3 × 30 g</span><small>$110 a set</small></span></th>
                  <td data-num>22 sets</td>
                  <td>
                    <div class="tray-progress">
                      <span class="tray-progress__value">3%</span>
                      <span class="tray-progress__bar" role="meter" aria-label="Share of revenue, Tasting set, 3 × 30 g" aria-valuemin="0" aria-valuemax="100" aria-valuenow="3" style="--tray-v: 3"></span>
                    </div>
                  </td>
                  <td data-num>$2,420</td>
                </tr>
                <tr>
                  <th scope="row"><span class="tray-person__text"><span>Gift box</span><small>$85 a box</small></span></th>
                  <td data-num>20 boxes</td>
                  <td>
                    <div class="tray-progress">
                      <span class="tray-progress__value">2%</span>
                      <span class="tray-progress__bar" role="meter" aria-label="Share of revenue, Gift box" aria-valuemin="0" aria-valuemax="100" aria-valuenow="2" style="--tray-v: 2"></span>
                    </div>
                  </td>
                  <td data-num>$1,700</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section class="tray-card tray-span-8" aria-labelledby="city-title">
          <div class="tray-card__head">
            <div>
              <h2 class="subtitle" id="city-title">Orders by city</h2>
              <p class="tray-chart__caption">All 842 orders went to five cities.</p>
            </div>
          </div>
          <figure class="tray-chart" data-tray="chart" data-chart='{"type": "bar", "horizontal": true, "labelHead": "City", "table": false, "labels": ["Kyiv", "Lviv", "Odesa", "Dnipro", "Kharkiv"], "series": [{"name": "Orders", "values": [388, 162, 131, 94, 67]}], "summary": "Ranked bars of orders by city from 1 to 27 November: Kyiv 388, Lviv 162, Odesa 131, Dnipro 94, Kharkiv 67. Demo data."}'></figure>
        </section>
        <section class="tray-card tray-span-4" aria-labelledby="back-title">
          <div class="tray-card__head">
            <div>
              <h2 class="subtitle" id="back-title">Repeat customers</h2>
              <p class="tray-chart__caption">Had ordered before November</p>
            </div>
          </div>
          <div class="tray-stack tray-stack--lg">
            <p class="tray-figure">61<small>%</small></p>
            <div class="tray-progress">
              <span class="tray-progress__name">Came back</span>
              <span class="tray-progress__value">318 of 521</span>
              <span class="tray-progress__bar" role="meter" aria-label="Customers who came back" aria-valuemin="0" aria-valuemax="521" aria-valuenow="318" style="--tray-v: 61"></span>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</div>
<script src="../components/bundle.js"></script>
</body>
</html>
```
