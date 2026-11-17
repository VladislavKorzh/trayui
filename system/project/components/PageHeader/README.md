# Page Header

The page header names the page: its title in `title`, one line about it, the page's actions at the end edge, and tabs for its sections underneath.

## Markup
```html
<div class="tray-pagehead">
  <a class="tray-back" href="/customers">… Customers</a>
  <div class="tray-pagehead__row">
    <div class="tray-pagehead__text">
      <div class="tray-pagehead__title"><h1 class="title">Dana Kovalenko</h1><span class="tray-badge">Regular</span></div>
      <p>Orders every second week, mostly 50 g jars.</p>
    </div>
    <div class="tray-pagehead__actions">
      <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">Edit</button>
      <button class="tray-btn tray-btn--sm" type="button">New order</button>
    </div>
  </div>
  <p class="tray-pagehead__meta"><span>Customer since March 2025</span><span>14 orders</span></p>
  <nav class="tray-tabs" aria-label="Customer">…</nav>
</div>
```
Every part but the title is optional. Above the row goes a `tray-back` link or a Breadcrumb, never both. `tray-pagehead__meta` is one line of facts in `caption`. Tabs under the header switch the page's sections and are links (`aria-current="page"`).

## Do and don't
- Do write the title as the name of the thing: "Orders", "Dana Kovalenko". Not "Manage your orders".
- Do keep one yellow button, at the end of the actions. More than three actions go into a Dropdown Menu.
- Don't repeat the title in the breadcrumb's last item and in the top bar: one of them is enough.
- Don't centre the header.
