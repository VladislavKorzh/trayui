# No results

A customer list whose search and filters match nobody: the filters stay in view, and the empty table names the near matches and clears the filters.

A no results page inside a product: a customer list where a search and two filters leave nobody to show. The filter bar stays as it was, chips and all, so the cause is in view, and the table keeps its headers while one row explains. The message is worked out from the data: it names the other cities where the search does match and offers to search every city or to clear the filters, and both buttons put focus back in the search field.

Choose it when the data exists but the current query hides it; for a new account with nothing yet, use [First run](https://trayui.com/blocks/empty-01.md), and when the person may not see the data at all, [No access](https://trayui.com/blocks/empty-03.md). The count above the table, "0 of 312 customers match", is a `role="status"` region, so it is read after each change, which an [Empty](https://trayui.com/components/empty.md) state does not do by itself.

It is made of these components: [App Shell](https://trayui.com/components/app-shell.md), [Sidebar](https://trayui.com/components/sidebar.md), [Dropdown Menu](https://trayui.com/components/dropdown-menu.md), [Workspace Switcher](https://trayui.com/components/workspace-switcher.md), [Avatar](https://trayui.com/components/avatar.md), [Tooltip](https://trayui.com/components/tooltip.md), [Badge](https://trayui.com/components/badge.md), [Top Bar](https://trayui.com/components/top-bar.md), [Button](https://trayui.com/components/button.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md), [Kbd](https://trayui.com/components/kbd.md), [Page Header](https://trayui.com/components/page-header.md), [Filter Bar](https://trayui.com/components/filter-bar.md), [Input Group](https://trayui.com/components/input-group.md), [Input](https://trayui.com/components/input.md), [Native Select](https://trayui.com/components/native-select.md), [Table](https://trayui.com/components/table.md), [Empty](https://trayui.com/components/empty.md).

Behaviours it uses: `filterbar`, `menu`, `sidebar-sheet`, `sidebar-toggle`, `tooltip`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>No results</title>
<meta name="description" content="A customer list whose search and filters match nobody: the filters stay in view, and the empty table names the near matches and clears the filters.">
<meta name="tray-category" content="Empty states">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-app tray-app--inset">
  <div class="tray-app__side">
    <nav class="tray-sidebar tray-sidebar--flyout" id="nav" aria-label="Main" data-collapsed>
      <div class="tray-sidebar__head" style="padding-inline: 0">
        <div class="tray-anchor tray-anchor--block" data-tray="menu">
          <button class="tray-switcher" type="button"><span class="tray-avatar tray-avatar--sm tray-avatar--ink" aria-hidden="true">PF</span><span class="tray-person__text"><b>Perly Farm</b><small>Shop plan</small></span><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chevrons-up-down"/></svg></button>
          <div class="tray-pop">
            <div class="tray-list">
              <p class="tray-list__label">Workspaces</p>
              <button class="tray-option" type="button" role="menuitemradio" data-group="workspace" aria-checked="true"><span class="tray-avatar tray-avatar--xs tray-avatar--ink" aria-hidden="true">PF</span><span class="tray-option__text">Perly Farm</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
              <button class="tray-option" type="button" role="menuitemradio" data-group="workspace" aria-checked="false"><span class="tray-avatar tray-avatar--xs" aria-hidden="true">MB</span><span class="tray-option__text">Meadow Bakery</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
              <hr class="tray-list__rule">
              <button class="tray-option" type="button" role="menuitem"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg><span class="tray-option__text">New workspace</span></button>
            </div>
          </div>
        </div>
      </div>
      <div class="tray-sidebar__group">
        <span class="tray-anchor tray-anchor--block" data-tray="tooltip" data-tip="Home"><a class="tray-sidebar__item" href="#" aria-label="Home"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-house"/></svg><span>Home</span></a></span>
        <span class="tray-anchor tray-anchor--block" data-tray="tooltip" data-tip="Orders"><a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-inbox"/></svg><span>Orders</span><span class="tray-badge tray-badge--count">12<span class="tray-vh"> to pack</span></span></a></span>
        <span class="tray-anchor tray-anchor--block" data-tray="tooltip" data-tip="Customers"><a class="tray-sidebar__item" href="#" aria-label="Customers" aria-current="page"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-users"/></svg><span>Customers</span></a></span>
        <span class="tray-anchor tray-anchor--block" data-tray="tooltip" data-tip="Batches"><a class="tray-sidebar__item" href="#" aria-label="Batches"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-package"/></svg><span>Batches</span></a></span>
        <span class="tray-anchor tray-anchor--block" data-tray="tooltip" data-tip="Reports"><a class="tray-sidebar__item" href="#" aria-label="Reports"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chart-column"/></svg><span>Reports</span></a></span>
      </div>
      <div class="tray-sidebar__group">
        <p class="tray-sidebar__label">Workspace</p>
        <span class="tray-anchor tray-anchor--block" data-tray="tooltip" data-tip="Team"><a class="tray-sidebar__item" href="#" aria-label="Team"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-user-plus"/></svg><span>Team</span></a></span>
        <span class="tray-anchor tray-anchor--block" data-tray="tooltip" data-tip="Billing"><a class="tray-sidebar__item" href="#" aria-label="Billing"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-credit-card"/></svg><span>Billing</span></a></span>
        <span class="tray-anchor tray-anchor--block" data-tray="tooltip" data-tip="Settings"><a class="tray-sidebar__item" href="#" aria-label="Settings"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-settings"/></svg><span>Settings</span></a></span>
      </div>
    </nav>
  </div>
  <div class="tray-app__main">
    <header class="tray-topbar">
      <div class="tray-topbar__start">
        <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon tray-app__menu" type="button" data-tray="sidebar-sheet" aria-controls="nav" aria-label="Open the navigation"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-menu"/></svg></button>
        <span class="tray-anchor tray-app__collapse" data-tray="tooltip" data-tip="Show the labels" data-side="bottom"><button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-tray="sidebar-toggle" aria-controls="nav" aria-label="Show the labels of the sidebar"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-panel-left"/></svg></button></span>
        <nav aria-label="Breadcrumb"><ol class="tray-crumbs tray-crumbs--fold"><li><a href="#">Perly Farm</a></li><li><span aria-current="page">Customers</span></li></ol></nav>
      </div>
      <div class="tray-topbar__end">
        <button class="tray-topbar__search tray-topbar__search--fold" type="button" aria-label="Search everything"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg><span>Search everything</span><kbd class="tray-kbd">/</kbd></button>
        <span class="tray-anchor"><button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" aria-label="Notifications, 2 unread"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-bell"/></svg></button><span class="tray-pip">2</span></span>
        <button class="tray-avatar" type="button" aria-label="Account: Oksana Franko, OF">OF</button>
      </div>
    </header>
    <main class="tray-app__content">
      <div class="tray-pagehead">
        <div class="tray-pagehead__row">
          <div class="tray-pagehead__text">
            <h1 class="title">Customers</h1>
            <p>312 customers: 268 people, and 44 restaurants and shops.</p>
          </div>
          <div class="tray-pagehead__actions">
            <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-download"/></svg>Export</button>
            <button class="tray-btn tray-btn--sm" type="button"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg>Add a customer</button>
          </div>
        </div>
      </div>
      <div class="tray-stack">
        <div class="tray-filterbar" id="filters" data-tray="filterbar">
          <div class="tray-filterbar__row">
            <div class="tray-input-group tray-input-group--sm"><span class="tray-input-group__addon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg></span><input class="tray-input" id="search" type="search" value="Mriya" placeholder="Search customers" aria-label="Search customers"></div>
            <span class="tray-anchor" data-tray="menu">
              <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">City<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-chevron-down"/></svg></button>
              <div class="tray-pop">
                <div class="tray-list">
                  <button class="tray-option" type="button" role="menuitemcheckbox" aria-checked="false" data-value="city:Kyiv" data-label="City: Kyiv"><span class="tray-option__text">Kyiv</span><span class="tray-option__meta">128</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
                  <button class="tray-option" type="button" role="menuitemcheckbox" aria-checked="true" data-value="city:Lviv" data-label="City: Lviv"><span class="tray-option__text">Lviv</span><span class="tray-option__meta">61</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
                  <button class="tray-option" type="button" role="menuitemcheckbox" aria-checked="false" data-value="city:Odesa" data-label="City: Odesa"><span class="tray-option__text">Odesa</span><span class="tray-option__meta">47</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
                  <button class="tray-option" type="button" role="menuitemcheckbox" aria-checked="false" data-value="city:Dnipro" data-label="City: Dnipro"><span class="tray-option__text">Dnipro</span><span class="tray-option__meta">29</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
                  <button class="tray-option" type="button" role="menuitemcheckbox" aria-checked="false" data-value="city:Kharkiv" data-label="City: Kharkiv"><span class="tray-option__text">Kharkiv</span><span class="tray-option__meta">21</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
                </div>
              </div>
            </span>
            <span class="tray-anchor" data-tray="menu">
              <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">Type<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-chevron-down"/></svg></button>
              <div class="tray-pop">
                <div class="tray-list">
                  <button class="tray-option" type="button" role="menuitemcheckbox" aria-checked="false" data-value="type:person" data-label="Type: Person"><span class="tray-option__text">Person</span><span class="tray-option__meta">268</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
                  <button class="tray-option" type="button" role="menuitemcheckbox" aria-checked="false" data-value="type:restaurant" data-label="Type: Restaurant"><span class="tray-option__text">Restaurant</span><span class="tray-option__meta">31</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
                  <button class="tray-option" type="button" role="menuitemcheckbox" aria-checked="false" data-value="type:shop" data-label="Type: Shop"><span class="tray-option__text">Shop</span><span class="tray-option__meta">13</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
                </div>
              </div>
            </span>
            <span class="tray-anchor" data-tray="menu">
              <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">Last order<svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-chevron-down"/></svg></button>
              <div class="tray-pop">
                <div class="tray-list">
                  <button class="tray-option" type="button" role="menuitemcheckbox" aria-checked="true" data-value="last:month" data-label="Last order: This month"><span class="tray-option__text">This month</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
                  <button class="tray-option" type="button" role="menuitemcheckbox" aria-checked="false" data-value="last:quarter" data-label="Last order: 1 to 3 months ago"><span class="tray-option__text">1 to 3 months ago</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
                  <button class="tray-option" type="button" role="menuitemcheckbox" aria-checked="false" data-value="last:older" data-label="Last order: Earlier"><span class="tray-option__text">Earlier</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
                </div>
              </div>
            </span>
            <div class="tray-filterbar__end">
              <span class="tray-select tray-select--sm"><select aria-label="Sort by"><option>Most orders first</option><option>Newest first</option><option>A to Z</option></select></span>
            </div>
          </div>
          <div class="tray-filterbar__chips">
            <span class="tray-chip" data-value="city:Lviv">City: Lviv<button class="tray-chip__x" type="button" aria-label="Remove City: Lviv"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-x"/></svg></button></span>
            <span class="tray-chip" data-value="last:month">Last order: This month<button class="tray-chip__x" type="button" aria-label="Remove Last order: This month"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-x"/></svg></button></span>
            <button class="tray-btn tray-btn--link" type="button" data-filter="clear">Clear all</button>
          </div>
        </div>
        <p class="tray-soft" id="result-count" role="status">0 of 312 customers match</p>
        <div class="tray-table-wrap">
          <table class="tray-table tray-table--hover tray-table--pad" aria-label="Customers">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col" data-num>Orders</th>
                <th scope="col">Last order</th>
                <th scope="col" data-num>Spent</th>
              </tr>
            </thead>
            <tbody id="rows">
              <tr data-city="Kyiv" data-type="restaurant" data-last="month" hidden>
                <th scope="row"><span class="tray-person__text"><b>Mriya restaurant</b><small>Restaurant in Kyiv</small></span></th>
                <td data-num>38</td><td><time datetime="2026-11-12">12 Nov</time></td><td data-num>$6,840.00</td>
              </tr>
              <tr data-city="Odesa" data-type="shop" data-last="month" hidden>
                <th scope="row"><span class="tray-person__text"><b>Mriya bakery</b><small>Shop in Odesa</small></span></th>
                <td data-num>9</td><td><time datetime="2026-11-02">2 Nov</time></td><td data-num>$1,120.00</td>
              </tr>
              <tr data-city="Lviv" data-type="restaurant" data-last="month" hidden>
                <th scope="row"><span class="tray-person__text"><b>Lev restaurant</b><small>Restaurant in Lviv</small></span></th>
                <td data-num>21</td><td><time datetime="2026-11-14">14 Nov</time></td><td data-num>$3,980.00</td>
              </tr>
              <tr data-city="Kyiv" data-type="person" data-last="month" hidden>
                <th scope="row"><span class="tray-person__text"><b>Dana Kovalenko</b><small>Person in Kyiv</small></span></th>
                <td data-num>14</td><td><time datetime="2026-11-16">16 Nov</time></td><td data-num>$1,780.00</td>
              </tr>
              <tr data-city="Lviv" data-type="person" data-last="month" hidden>
                <th scope="row"><span class="tray-person__text"><b>Olena Bondar</b><small>Person in Lviv</small></span></th>
                <td data-num>3</td><td><time datetime="2026-11-15">15 Nov</time></td><td data-num>$236.00</td>
              </tr>
              <tr data-city="Lviv" data-type="restaurant" data-last="quarter" hidden>
                <th scope="row"><span class="tray-person__text"><b>Coffee and Roe</b><small>Restaurant in Lviv</small></span></th>
                <td data-num>6</td><td><time datetime="2026-10-28">28 Oct</time></td><td data-num>$870.00</td>
              </tr>
              <tr data-city="Dnipro" data-type="shop" data-last="quarter" hidden>
                <th scope="row"><span class="tray-person__text"><b>Hill Cheese shop</b><small>Shop in Dnipro</small></span></th>
                <td data-num>11</td><td><time datetime="2026-09-09">9 Sep</time></td><td data-num>$1,410.00</td>
              </tr>
              <tr data-city="Kharkiv" data-type="person" data-last="older" hidden>
                <th scope="row"><span class="tray-person__text"><b>Ivan Petrenko</b><small>Person in Kharkiv</small></span></th>
                <td data-num>5</td><td><time datetime="2026-06-03">3 Jun</time></td><td data-num>$412.00</td>
              </tr>
              <tr data-empty>
                <td colspan="4">
                  <div class="tray-empty">
                    <span class="tray-empty__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg></span>
                    <div class="tray-empty__text">
                      <h2 class="subtitle" id="empty-title">No customer matches “Mriya”</h2>
                      <p id="empty-text">It has 2 matches in other cities: Kyiv and Odesa.</p>
                    </div>
                    <div class="tray-empty__actions">
                      <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" id="every-city"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-map-pin"/></svg>Search every city</button>
                      <button class="tray-btn tray-btn--ghost tray-btn--sm" type="button" id="clear-filters">Clear the filters</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</div>
<script src="../components/bundle.js"></script>
<script>
/* The search and the filter chips decide which rows show. With none left, the empty row says so, names the cities
   where the search does match, and offers to lift the filter that is in the way. */
(function () {
  var bar = document.getElementById('filters'), search = document.getElementById('search');
  var rows = [].slice.call(document.querySelectorAll('#rows tr[data-city]'));
  var empty = document.querySelector('#rows tr[data-empty]');
  var title = document.getElementById('empty-title'), text = document.getElementById('empty-text');
  var count = document.getElementById('result-count'), everyCity = document.getElementById('every-city'), clearFilters = document.getElementById('clear-filters');
  var TOTAL = 312;
  function chips() { return [].map.call(bar.querySelectorAll('.tray-filterbar__chips .tray-chip'), function (c) { return c.getAttribute('data-value'); }); }
  function fits(row, on, skip) {
    var q = search.value.trim().toLowerCase();
    if (q && row.querySelector('b').textContent.toLowerCase().indexOf(q) < 0) return false;
    return ['city', 'type', 'last'].every(function (k) {
      if (k === skip) return true;
      var want = on.filter(function (v) { return v.indexOf(k + ':') === 0; }).map(function (v) { return v.slice(k.length + 1); });
      return !want.length || want.indexOf(row.getAttribute('data-' + k)) > -1;
    });
  }
  function list(words) { return words.length < 2 ? words.join('') : words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1]; }
  function paint() {
    var on = chips(), q = search.value.trim(), shown = 0;
    rows.forEach(function (row) { var ok = fits(row, on); row.hidden = !ok; if (ok) shown += 1; });
    empty.hidden = shown > 0;
    count.textContent = !q && !on.length ? 'All ' + TOTAL + ' customers' : shown + ' of ' + TOTAL + ' customers match';
    if (shown) return;
    var near = rows.filter(function (row) { return fits(row, on, 'city'); });
    var cities = near.map(function (r) { return r.getAttribute('data-city'); }).filter(function (c, i, a) { return a.indexOf(c) === i; });
    var cityOn = on.some(function (v) { return v.indexOf('city:') === 0; });
    title.textContent = q ? 'No customer matches “' + q + '”' : 'No customer matches these filters';
    if (cityOn && near.length) {
      text.textContent = (q ? 'It has ' : 'They leave ') + near.length + (near.length === 1 ? ' match' : ' matches') + ' in other cities: ' + list(cities) + '.';
      everyCity.hidden = false;
    } else {
      text.textContent = 'Check the spelling, or clear the filters to search all ' + TOTAL + ' customers.';
      everyCity.hidden = true;
    }
    clearFilters.textContent = on.length ? 'Clear the filters' : 'Clear the search';
  }
  search.addEventListener('input', paint);
  bar.addEventListener('tray:change', function () { setTimeout(paint); });
  everyCity.addEventListener('click', function () {
    [].forEach.call(bar.querySelectorAll('.tray-chip[data-value^="city:"] .tray-chip__x'), function (x) { x.click(); });
    search.focus();
  });
  clearFilters.addEventListener('click', function () {
    if (chips().length) bar.querySelector('[data-filter="clear"]').click();
    else { search.value = ''; paint(); }
    search.focus();
  });
  paint();
})();
</script>
</body>
</html>
```
