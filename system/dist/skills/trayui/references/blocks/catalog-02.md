# Catalog with a filter column

Products as rows beside a column of filters: checkboxes, a price limit and an in-stock switch. On a phone or a tablet the column opens from a button.

A product listing with a filter column, for a range that needs more than a few menus. The column holds checkboxes for the type and the size, a price limit on a slider and an "In stock only" switch. Within a group any ticked box may match, across groups all must, and the price is a ceiling. Above the results sit the count, the sort and a switch between rows and a grid of cards, and when nothing matches, an empty state offers to clear the filters. For a range that three menus cover, the [catalog with filters on top](https://trayui.com/blocks/catalog-01.md) gives the products the full width.

The count is a polite live region, so each change is read: "9 products". The slider says "Up to $120" through `aria-valuetext` rather than a bare number. Below 56rem the column leaves the page, and the Filters button, whose badge counts the groups in use, opens the same column as a sheet from the end edge.

It is made of these components: [Navigation Menu](https://trayui.com/components/navigation-menu.md), [Tabs](https://trayui.com/components/tabs.md), [Top Bar](https://trayui.com/components/top-bar.md), [Kbd](https://trayui.com/components/kbd.md), [Button](https://trayui.com/components/button.md), [Badge](https://trayui.com/components/badge.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md), [App Shell](https://trayui.com/components/app-shell.md), [Native Select](https://trayui.com/components/native-select.md), [Toggle Group](https://trayui.com/components/toggle-group.md), [Item](https://trayui.com/components/item.md), [Aspect Ratio](https://trayui.com/components/aspect-ratio.md), [Empty](https://trayui.com/components/empty.md), [Sidebar](https://trayui.com/components/sidebar.md), [Checkbox](https://trayui.com/components/checkbox.md), [Label](https://trayui.com/components/label.md), [Slider](https://trayui.com/components/slider.md), [Switch](https://trayui.com/components/switch.md), [Footer](https://trayui.com/components/footer.md), [Card](https://trayui.com/components/card.md), [Feature Grid](https://trayui.com/components/feature-grid.md).

Behaviours it uses: `sidebar-sheet`, `slider`, `strip`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Catalog with a filter column</title>
<meta name="description" content="Products as rows beside a column of filters: checkboxes, a price limit and an in-stock switch. On a phone or a tablet the column opens from a button.">
<meta name="tray-category" content="Catalog">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<header class="tray-nav tray-container">
  <a class="tray-wordmark" href="/">Perly Farm</a>
  <nav class="tray-nav__strip" aria-label="Main">
    <ul class="tray-nav__links tray-tabs" data-tray="strip">
      <li><a class="tray-tab" href="/shop" aria-current="page">Shop</a></li>
      <li><a class="tray-tab" href="/gifts">Gifts</a></li>
      <li><a class="tray-tab" href="/farm">The farm</a></li>
      <li><a class="tray-tab" href="/delivery">Delivery</a></li>
    </ul>
  </nav>
  <div class="tray-nav__actions">
    <button class="tray-topbar__search tray-topbar__search--fold" type="button" aria-label="Search the shop"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg><span>Search the shop</span><kbd class="tray-kbd">/</kbd></button>
    <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/cart"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-shopping-bag"/></svg>Cart<span class="tray-badge tray-badge--count tray-badge--ink">2<span class="tray-vh"> items</span></span></a>
  </div>
</header>

<main class="tray-container tray-stack tray-stack--lg">
  <nav aria-label="Breadcrumb">
    <ol class="tray-crumbs">
      <li><a href="/">Home</a></li>
      <li><a href="/shop">Shop</a></li>
      <li><span aria-current="page">All products</span></li>
    </ol>
  </nav>
  <div class="tray-stack" style="max-inline-size: 46rem">
    <h1 class="headline">All products</h1>
    <p class="lead tray-soft">Caviar from batches 14 and 13, the sets we pack from it, and the spoon and bag to serve and carry it.</p>
  </div>

  <div class="tray-app tray-app--end" style="padding: var(--space-4) 0 var(--space-12); min-block-size: 0">
    <div class="tray-app__main">
      <div class="tray-row tray-row--between">
        <div class="tray-row tray-row--sm">
          <button class="tray-btn tray-btn--quiet tray-btn--sm tray-app__menu" type="button" data-tray="sidebar-sheet" aria-controls="filters"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-filter"/></svg>Filters<span class="tray-badge tray-badge--count tray-badge--ink" id="filters-on">1</span></button>
          <p class="nav tray-soft" id="count" aria-live="polite">9 products</p>
        </div>
        <div class="tray-row tray-row--sm">
          <label class="tray-vh" for="sort">Sort the products</label>
          <span class="tray-select tray-select--sm">
            <select id="sort" name="sort">
              <option value="rank" selected>Most ordered first</option>
              <option value="up">Price, low to high</option>
              <option value="down">Price, high to low</option>
            </select>
          </span>
          <div class="tray-seg tray-seg--sm tray-seg--icon" role="radiogroup" aria-label="Show the products as">
            <label class="tray-seg__item"><input type="radio" name="view" value="grid" aria-label="Grid"><span><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-layout-grid"/></svg></span></label>
            <label class="tray-seg__item"><input type="radio" name="view" value="list" aria-label="List" checked><span><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-list"/></svg></span></label>
          </div>
        </div>
      </div>

      <ul class="tray-items tray-items--ruled" id="results" style="--card-pad: var(--space-6)" role="list">
        <li class="tray-item" data-type="caviar" data-size="50" data-price="59" data-stock="yes" data-rank="1">
          <div class="tray-slot tray-ratio tray-ratio--photo"></div>
          <div class="tray-item__body" data-body>
            <div class="tray-stack tray-stack--sm" data-text>
              <h2 class="subtitle"><a href="/shop/caviar-50">Snail caviar, 50&nbsp;g</a></h2>
              <p class="tray-soft">Pearl-white and mild, with a taste of the forest after rain. About ten servings.</p>
              <div class="tray-row tray-row--between" data-meta>
                <p class="tray-row tray-row--sm"><span class="tray-badge">50&nbsp;g jar</span><span class="tray-badge">Batch 14</span></p>
                <div class="tray-row" data-end>
                  <p class="subtitle tray-num">$59</p>
                  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" aria-label="Add to cart: snail caviar, 50 g, batch 14">Add to cart</button>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li class="tray-item" data-type="gift" data-size="50" data-price="96" data-stock="yes" data-rank="2">
          <div class="tray-slot tray-ratio tray-ratio--photo"></div>
          <div class="tray-item__body" data-body>
            <div class="tray-stack tray-stack--sm" data-text>
              <h2 class="subtitle"><a href="/shop/gift-box">Gift box</a></h2>
              <p class="tray-soft">A 50&nbsp;g jar from batch 14, two mother-of-pearl spoons and a card for your own words.</p>
              <div class="tray-row tray-row--between" data-meta>
                <p class="tray-row tray-row--sm"><span class="tray-badge">50&nbsp;g jar</span><span class="tray-badge tray-badge--accent">New</span></p>
                <div class="tray-row" data-end>
                  <p class="subtitle tray-num">$96</p>
                  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" aria-label="Add to cart: gift box">Add to cart</button>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li class="tray-item" data-type="caviar" data-size="30" data-price="38" data-stock="yes" data-rank="3">
          <div class="tray-slot tray-ratio tray-ratio--photo"></div>
          <div class="tray-item__body" data-body>
            <div class="tray-stack tray-stack--sm" data-text>
              <h2 class="subtitle"><a href="/shop/caviar-30">Snail caviar, 30&nbsp;g</a></h2>
              <p class="tray-soft">A first taste for two. About six servings, on blini or straight from the spoon.</p>
              <div class="tray-row tray-row--between" data-meta>
                <p class="tray-row tray-row--sm"><span class="tray-badge">30&nbsp;g jar</span><span class="tray-badge">Batch 14</span></p>
                <div class="tray-row" data-end>
                  <p class="subtitle tray-num">$38</p>
                  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" aria-label="Add to cart: snail caviar, 30 g, batch 14">Add to cart</button>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li class="tray-item" data-type="caviar" data-size="100" data-price="112" data-stock="yes" data-rank="4">
          <div class="tray-slot tray-ratio tray-ratio--photo"></div>
          <div class="tray-item__body" data-body>
            <div class="tray-stack tray-stack--sm" data-text>
              <h2 class="subtitle"><a href="/shop/caviar-100">Snail caviar, 100&nbsp;g</a></h2>
              <p class="tray-soft">For a party or a restaurant kitchen. About twenty servings.</p>
              <div class="tray-row tray-row--between" data-meta>
                <p class="tray-row tray-row--sm"><span class="tray-badge">100&nbsp;g jar</span><span class="tray-badge">Batch 14</span></p>
                <div class="tray-row" data-end>
                  <p class="subtitle tray-num">$112</p>
                  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" aria-label="Add to cart: snail caviar, 100 g, batch 14">Add to cart</button>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li class="tray-item" data-type="tasting" data-size="30" data-price="105" data-stock="yes" data-rank="5">
          <div class="tray-slot tray-ratio tray-ratio--photo"></div>
          <div class="tray-item__body" data-body>
            <div class="tray-stack tray-stack--sm" data-text>
              <h2 class="subtitle"><a href="/shop/tasting-set">Tasting set</a></h2>
              <p class="tray-soft">Three 30&nbsp;g jars instead of one large, so every jar is opened fresh.</p>
              <div class="tray-row tray-row--between" data-meta>
                <p class="tray-row tray-row--sm"><span class="tray-badge">3 &times; 30&nbsp;g</span><span class="tray-badge">Batch 14</span></p>
                <div class="tray-row" data-end>
                  <p class="subtitle tray-num">$105</p>
                  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" aria-label="Add to cart: tasting set">Add to cart</button>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li class="tray-item" data-type="caviar" data-size="50" data-price="59" data-stock="yes" data-rank="6">
          <div class="tray-slot tray-ratio tray-ratio--photo"></div>
          <div class="tray-item__body" data-body>
            <div class="tray-stack tray-stack--sm" data-text>
              <h2 class="subtitle"><a href="/shop/caviar-50-batch-13">Snail caviar, 50&nbsp;g</a></h2>
              <p class="tray-soft">From the October collection, with slightly firmer pearls. Two jars left.</p>
              <div class="tray-row tray-row--between" data-meta>
                <p class="tray-row tray-row--sm"><span class="tray-badge">50&nbsp;g jar</span><span class="tray-badge">Batch 13</span></p>
                <div class="tray-row" data-end>
                  <p class="subtitle tray-num">$59</p>
                  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" aria-label="Add to cart: snail caviar, 50 g, batch 13">Add to cart</button>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li class="tray-item" data-type="caviar" data-size="30" data-price="38" data-stock="yes" data-rank="7">
          <div class="tray-slot tray-ratio tray-ratio--photo"></div>
          <div class="tray-item__body" data-body>
            <div class="tray-stack tray-stack--sm" data-text>
              <h2 class="subtitle"><a href="/shop/caviar-30-batch-13">Snail caviar, 30&nbsp;g</a></h2>
              <p class="tray-soft">From the October collection. Four jars left.</p>
              <div class="tray-row tray-row--between" data-meta>
                <p class="tray-row tray-row--sm"><span class="tray-badge">30&nbsp;g jar</span><span class="tray-badge">Batch 13</span></p>
                <div class="tray-row" data-end>
                  <p class="subtitle tray-num">$38</p>
                  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" aria-label="Add to cart: snail caviar, 30 g, batch 13">Add to cart</button>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li class="tray-item" data-type="tools" data-size="" data-price="14" data-stock="yes" data-rank="8">
          <div class="tray-slot tray-ratio tray-ratio--photo"></div>
          <div class="tray-item__body" data-body>
            <div class="tray-stack tray-stack--sm" data-text>
              <h2 class="subtitle"><a href="/shop/spoon">Mother&#8209;of&#8209;pearl spoon</a></h2>
              <p class="tray-soft">A metal spoon changes the taste of caviar. Shell does not.</p>
              <div class="tray-row tray-row--between" data-meta>
                <p class="tray-row tray-row--sm"><span class="tray-badge">12&nbsp;cm</span></p>
                <div class="tray-row" data-end>
                  <p class="subtitle tray-num">$14</p>
                  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" aria-label="Add to cart: mother-of-pearl spoon">Add to cart</button>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li class="tray-item" data-type="tools" data-size="" data-price="12" data-stock="yes" data-rank="9">
          <div class="tray-slot tray-ratio tray-ratio--photo"></div>
          <div class="tray-item__body" data-body>
            <div class="tray-stack tray-stack--sm" data-text>
              <h2 class="subtitle"><a href="/shop/travel-bag">Chilled travel bag</a></h2>
              <p class="tray-soft">Keeps four jars fridge-cold for a day, and folds flat in a coat pocket.</p>
              <div class="tray-row tray-row--between" data-meta>
                <p class="tray-row tray-row--sm"><span class="tray-badge">Holds 4 jars</span></p>
                <div class="tray-row" data-end>
                  <p class="subtitle tray-num">$12</p>
                  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" aria-label="Add to cart: chilled travel bag">Add to cart</button>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li class="tray-item" data-type="caviar" data-size="100" data-price="112" data-stock="no" data-rank="10" hidden>
          <div class="tray-slot tray-ratio tray-ratio--photo"></div>
          <div class="tray-item__body" data-body>
            <div class="tray-stack tray-stack--sm" data-text>
              <h2 class="subtitle"><a href="/shop/caviar-100-batch-13">Snail caviar, 100&nbsp;g</a></h2>
              <p class="tray-soft">Batch 13 sold out on 9 November. Batch 14 has the same jar.</p>
              <div class="tray-row tray-row--between" data-meta>
                <p class="tray-row tray-row--sm"><span class="tray-badge">100&nbsp;g jar</span><span class="tray-badge tray-badge--off">Sold out</span></p>
                <div class="tray-row" data-end>
                  <p class="subtitle tray-num tray-muted">$112</p>
                  <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/shop/caviar-100">See batch 14</a>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <div class="tray-empty" id="none" hidden>
        <span class="tray-empty__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-filter"/></svg></span>
        <div class="tray-empty__text">
          <p class="control">No product matches these filters</p>
          <p>Raise the price limit, or take a size off.</p>
        </div>
        <div class="tray-empty__actions"><button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-clear>Clear filters</button></div>
      </div>
    </div>

    <div class="tray-app__side">
      <aside class="tray-sidebar" id="filters" aria-labelledby="filters-title">
        <div class="tray-sidebar__head">
          <h2 class="control" id="filters-title">Filters</h2>
          <button class="tray-btn tray-btn--link" type="button" data-clear>Clear filters</button>
        </div>
        <fieldset class="tray-sidebar__group">
          <legend class="tray-sidebar__label">Type</legend>
          <div class="tray-sidebar__body">
            <label class="tray-check"><input type="checkbox" name="type" value="caviar"><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>Caviar jars</span></label>
            <label class="tray-check"><input type="checkbox" name="type" value="tasting"><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>Tasting sets</span></label>
            <label class="tray-check"><input type="checkbox" name="type" value="gift"><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>Gift boxes</span></label>
            <label class="tray-check"><input type="checkbox" name="type" value="tools"><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>Spoons and bags</span></label>
          </div>
        </fieldset>
        <fieldset class="tray-sidebar__group">
          <legend class="tray-sidebar__label">Size of the jar</legend>
          <div class="tray-sidebar__body">
            <label class="tray-check"><input type="checkbox" name="size" value="30"><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>30&nbsp;g</span></label>
            <label class="tray-check"><input type="checkbox" name="size" value="50"><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>50&nbsp;g</span></label>
            <label class="tray-check"><input type="checkbox" name="size" value="100"><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>100&nbsp;g</span></label>
          </div>
        </fieldset>
        <div class="tray-sidebar__group">
          <p class="tray-sidebar__label">Price</p>
          <div class="tray-sidebar__body tray-stack tray-stack--sm">
            <div class="tray-row tray-row--between">
              <label class="tray-label tray-label--inline" for="price">Up to</label>
              <span class="control tray-num" id="price-value" aria-hidden="true">$120</span>
            </div>
            <input class="tray-slider" id="price" name="price" type="range" min="10" max="120" step="5" value="120" aria-valuetext="Up to $120" data-tray="slider">
            <div class="tray-slider-field__scale" aria-hidden="true"><span>$10</span><span>$120</span></div>
          </div>
        </div>
        <label class="tray-switch tray-switch--row">
          <span class="tray-switch__text"><b>In stock only</b><small>Hide what is sold out</small></span>
          <input type="checkbox" role="switch" name="stock" checked>
          <span class="tray-switch__track"></span>
        </label>
      </aside>
    </div>
  </div>
</main>

<footer class="tray-footer tray-container">
  <div class="tray-footer__top">
    <div class="tray-footer__brand">
      <a class="tray-wordmark" href="/">Perly Farm</a>
      <p>Snail caviar from a small farm near Kyiv, collected by hand and sold by the numbered batch.</p>
    </div>
    <nav class="tray-footer__col" aria-label="Shop">
      <h3>Shop</h3>
      <a href="/shop/caviar">Caviar</a>
      <a href="/shop/gifts">Gift sets</a>
      <a href="/shop/tasting">Tasting sets</a>
      <a href="/shop/tools">Spoons and tools</a>
    </nav>
    <nav class="tray-footer__col" aria-label="Help">
      <h3>Help</h3>
      <a href="/delivery">Delivery and pickup</a>
      <a href="/serving">Storage and serving</a>
      <a href="/returns">Returns</a>
      <a href="/contact">Contact us</a>
    </nav>
    <nav class="tray-footer__col" aria-label="The farm">
      <h3>The farm</h3>
      <a href="/farm">How we keep the snails</a>
      <a href="/batches">Batches</a>
      <a href="/visit">Visit the farm shop</a>
    </nav>
  </div>
  <div class="tray-footer__bottom">
    <p>&copy; 2026 Perly Farm, Farm road 4, Kyiv region. Prices include VAT. The farm, its products and every figure on this page are demo data.</p>
    <ul class="tray-footer__legal" role="list">
      <li><a href="/privacy">Privacy</a></li>
      <li><a href="/terms">Terms of sale</a></li>
    </ul>
  </div>
</footer>
<script>
/* The filter column decides which products show: within a group any box may match, across groups all must; the price is a ceiling.
   The sort reorders them, and the view switch turns the rows into cards and back. The column is the same element in the phone's sheet. */
(function () {
  var side = document.getElementById('filters'), results = document.getElementById('results'), price = document.getElementById('price');
  var rows = [].slice.call(results.children), $ = function (id) { return document.getElementById(id); };
  var VIEWS = { list: ['tray-items tray-items--ruled', 'tray-item', 'tray-item__body', 'tray-row'],
                grid: ['tray-items tray-integrations', 'tray-card tray-feature', '', 'tray-row tray-row--between tray-feature__end'] };
  function picked(name) { return [].map.call(side.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i.value; }); }
  function paint() {
    var types = picked('type'), sizes = picked('size'), most = +price.value, stock = side.querySelector('input[name="stock"]').checked, shown = 0;
    rows.forEach(function (row) {
      var ok = (!types.length || types.indexOf(row.dataset.type) > -1) && (!sizes.length || sizes.indexOf(row.dataset.size) > -1)
        && +row.dataset.price <= most && (!stock || row.dataset.stock === 'yes');
      row.hidden = !ok; if (ok) shown += 1;
    });
    var on = (types.length ? 1 : 0) + (sizes.length ? 1 : 0) + (most < +price.max ? 1 : 0) + (stock ? 1 : 0);
    $('price-value').textContent = '$' + most;
    price.setAttribute('aria-valuetext', 'Up to $' + most);
    $('count').textContent = shown === 1 ? '1 product' : shown + ' products';
    $('filters-on').textContent = on || '';
    $('filters-on').hidden = !on;
    $('none').hidden = shown > 0;
  }
  function sort() {
    var by = $('sort').value, key = by === 'rank' ? 'rank' : 'price', dir = by === 'down' ? -1 : 1;
    rows.slice().sort(function (a, b) { return dir * (+a.dataset[key] - +b.dataset[key]) || +a.dataset.rank - +b.dataset.rank; })
      .forEach(function (row) { results.appendChild(row); });
  }
  function view(v) {
    var c = VIEWS[v];
    results.className = c[0];
    rows.forEach(function (row) {
      var body = row.querySelector('[data-body]'), end = row.querySelector('[data-end]');
      row.className = c[1]; body.className = c[2]; end.className = c[3];
      (v === 'grid' ? row : body.querySelector('[data-meta]')).appendChild(end);
    });
  }
  function clear() {
    [].forEach.call(side.querySelectorAll('input[type="checkbox"]'), function (box) { box.checked = false; });
    price.value = price.max;
    price.dispatchEvent(new Event('input', { bubbles: true }));
  }
  side.addEventListener('change', paint);
  side.addEventListener('input', paint);
  $('sort').addEventListener('change', sort);
  document.addEventListener('change', function (e) { if (e.target.name === 'view') view(e.target.value); });
  [].forEach.call(document.querySelectorAll('[data-clear]'), function (b) { b.addEventListener('click', clear); });
  paint();
})();
</script>
<script src="../components/bundle.js"></script>
</body>
</html>
```
