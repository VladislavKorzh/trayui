# Sidebar with a file tree

A sidebar for files: the changed files marked as modified, added or deleted, then a tree of folders that fold, with the open file in the breadcrumb.

Code editors, site builders and document stores need a file explorer sidebar, where the place of a file matters as much as its name. Under Changes, each file carries a one-letter badge, M, A or D, and the badge has `role="img"` with the full word as its name, so a screen reader says "Modified" rather than a letter. Below it the tree is nested lists of 36px rows; every folder is a `<details>`, so it opens with Enter or Space and needs no script. The open file carries `aria-current="page"`, drawn white and semibold rather than solid ink, and its path repeats in the breadcrumb.

Pick it over [items that fold](https://trayui.com/blocks/sidebar-04.md) when the hierarchy is deeper than two levels, or belongs to the content rather than to the product. The navigation is named "Files", and below 56rem the menu button, "Open the files", moves it into a sheet that takes that name.

It is made of these components: [App Shell](https://trayui.com/components/app-shell.md), [Sidebar](https://trayui.com/components/sidebar.md), [Badge](https://trayui.com/components/badge.md), [Avatar](https://trayui.com/components/avatar.md), [Top Bar](https://trayui.com/components/top-bar.md), [Button](https://trayui.com/components/button.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md).

Behaviours it uses: `sidebar-sheet`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sidebar with a file tree</title>
<meta name="description" content="A sidebar for files: the changed files marked as modified, added or deleted, then a tree of folders that fold, with the open file in the breadcrumb.">
<meta name="tray-category" content="Sidebar">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-app">
  <div class="tray-app__side">
    <nav class="tray-sidebar" id="nav" aria-label="Files">
      <div class="tray-sidebar__head">
        <a class="tray-wordmark" href="#">Counter</a>
      </div>
      <div class="tray-sidebar__group">
        <p class="tray-sidebar__label">Changes</p>
        <ul class="tray-tree">
          <li><a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-file"/></svg><span>jar-50-g.html</span><span class="tray-badge tray-badge--count" role="img" aria-label="Modified">M</span></a></li>
          <li><a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-file"/></svg><span>first-frost.html</span><span class="tray-badge tray-badge--count" role="img" aria-label="Added">A</span></a></li>
          <li><a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-file"/></svg><span>may-offer.html</span><span class="tray-badge tray-badge--count" role="img" aria-label="Deleted">D</span></a></li>
        </ul>
      </div>
      <div class="tray-sidebar__group">
        <p class="tray-sidebar__label">Files</p>
        <ul class="tray-tree">
          <li>
            <details open>
              <summary class="tray-sidebar__item"><svg class="tray-icon tray-icon--sm tray-sidebar__caret" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-folder"/></svg><span>pages</span></summary>
              <ul>
                <li>
                  <details open>
                    <summary class="tray-sidebar__item"><svg class="tray-icon tray-icon--sm tray-sidebar__caret" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-folder"/></svg><span>products</span></summary>
                    <ul>
                      <li><a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-file"/></svg><span>jar-30-g.html</span></a></li>
                      <li><a class="tray-sidebar__item" href="#" aria-current="page"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-file"/></svg><span>jar-50-g.html</span></a></li>
                      <li><a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-file"/></svg><span>jar-100-g.html</span></a></li>
                    </ul>
                  </details>
                </li>
                <li>
                  <details>
                    <summary class="tray-sidebar__item"><svg class="tray-icon tray-icon--sm tray-sidebar__caret" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-folder"/></svg><span>journal</span></summary>
                    <ul>
                      <li><a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-file"/></svg><span>first-frost.html</span></a></li>
                      <li><a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-file"/></svg><span>open-air.html</span></a></li>
                      <li><a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-file"/></svg><span>how-to-tell-it.html</span></a></li>
                    </ul>
                  </details>
                </li>
                <li><a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-file"/></svg><span>index.html</span></a></li>
              </ul>
            </details>
          </li>
          <li>
            <details open>
              <summary class="tray-sidebar__item"><svg class="tray-icon tray-icon--sm tray-sidebar__caret" aria-hidden="true"><use href="#tray-i-chevron-right"/></svg><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-folder"/></svg><span>styles</span></summary>
              <ul>
                <li><a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-file"/></svg><span>shop.css</span></a></li>
              </ul>
            </details>
          </li>
          <li><a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-file"/></svg><span>shop.json</span></a></li>
        </ul>
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
        <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon tray-app__menu" type="button" data-tray="sidebar-sheet" aria-controls="nav" aria-label="Open the files"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-menu"/></svg></button>
        <nav aria-label="Breadcrumb"><ol class="tray-crumbs"><li><a href="#">pages</a></li><li><a href="#">products</a></li><li><span aria-current="page">jar-50-g.html</span></li></ol></nav>
      </div>
    </header>
    <main class="tray-app__content">
      <h1 class="tray-vh">jar-50-g.html</h1>
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
