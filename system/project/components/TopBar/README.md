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
      <span class="tray-pip" aria-hidden="true">2</span>
    </span>
    <button class="tray-avatar" type="button" aria-label="Account: Oksana Franko">OF</button>
  </div>
</header>
```
The bar has no fill of its own: it sits on the page. `tray-topbar--sticky` keeps it at the top and gives it the colour of its ground.

`tray-topbar__search` looks like a field and is a button: it opens the Command panel. Name its shortcut in a `tray-kbd`.

`tray-pip` is the yellow count on the corner of a button. Wrap the button in a `tray-anchor`, put the count in the button's `aria-label` too, mark the pip `aria-hidden="true"`, and leave it empty to hide it.

## Accessibility
- The breadcrumb is a `<nav>` named "Breadcrumb", and its last item carries `aria-current="page"`.
- The search is a `<button>` named by its words. The system does not bind the key shown in its `tray-kbd`: listen for it in your own script, and only then add `aria-keyshortcuts="/"`, which tells a screen reader that the key works. With `tray-topbar__search--fold` the words are hidden, so the button needs an `aria-label`.
- Every icon button needs an `aria-label` ("Help", "More actions"), and the avatar button names the account ("Account: Oksana Franko").
- A button with a pip says the count in its `aria-label` too ("Notifications, 2 unread"). Change that label whenever the count changes. The pip itself is `aria-hidden` (the script sets it on every `tray-pip` as well), so the number is not read a second time after the button.
- The back link hides its arrow and says where it goes in a `tray-vh` span.

## Do and don't
- Do keep the bar to one row: at most three icon buttons and the avatar at the end.
- Do show the page's place with a Breadcrumb, or its title when there is no parent.
- Don't put the page's primary action here. It belongs to the Page Header.
- Don't use the pip for anything but a count of things to read.

## On a small screen
Below 48rem a full bar does not fit a phone. Fold it part by part: `tray-crumbs--fold` on the breadcrumb keeps only the current page, `tray-topbar__search--fold` on the search keeps only its icon (give the button an `aria-label`), and `tray-topbar__wide` marks anything else the bar may drop.
