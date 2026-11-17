# Top Bar

The top bar is the row above the content: where you are at the start edge; search, notifications and the account at the end edge.

## Markup
```html
<header class="tray-topbar">
  <div class="tray-topbar__start">
    <nav aria-label="Breadcrumb"><ol class="tray-crumbs">…</ol></nav>
  </div>
  <div class="tray-topbar__end">
    <button class="tray-topbar__search" type="button">
      <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg>
      <span>Search orders</span><kbd class="tray-kbd">/</kbd>
    </button>
    <span class="tray-anchor">
      <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" aria-label="Notifications, 2 unread">…</button>
      <span class="tray-pip">2</span>
    </span>
    <button class="tray-avatar" type="button" aria-label="Account: Oksana Franko">OF</button>
  </div>
</header>
```
The bar has no fill of its own: it sits on the page. `tray-topbar--sticky` keeps it at the top and gives it the colour of its ground.

`tray-topbar__search` looks like a field and is a button: it opens the Command panel. Name its shortcut in a `tray-kbd`.

`tray-pip` is the yellow count on the corner of a button. Wrap the button in a `tray-anchor`, put the count in the button's `aria-label` too, and leave the pip empty to hide it.

## Do and don't
- Do keep the bar to one row: at most three icon buttons and the avatar at the end.
- Do show the page's place with a Breadcrumb, or its title when there is no parent.
- Don't put the page's primary action here. It belongs to the Page Header.
- Don't use the pip for anything but a count of things to read.

## On a small screen
Below 48rem a full bar does not fit a phone. Fold it part by part: `tray-crumbs--fold` on the breadcrumb keeps only the current page, `tray-topbar__search--fold` on the search keeps only its icon (give the button an `aria-label`), and `tray-topbar__wide` marks anything else the bar may drop.
