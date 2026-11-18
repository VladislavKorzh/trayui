# Cart in a sheet

Gifts on a page whose cart opens in a sheet at the side: lines with a quantity, the way to free delivery, the subtotal and Check out.

A cart in a sheet, the slide-out cart of a shop that keeps people on the page they are browsing. Here it sits over a page of gifts with four product cards, and every Add to cart button opens the sheet and adds the product, or one more of it. The sheet lists the lines with a stepper and a remove button, then the meter to free delivery and the subtotal, and its Check out link repeats the amount. It has no promo code field and leaves the delivery to the checkout. Choose it over the [cart page](https://trayui.com/blocks/shop-02.md) when shoppers add a thing or two and go on looking.

The sheet is the browser's modal dialog, named by its heading: focus moves into it, the page behind turns inert, and Escape closes it. Removing a line sends focus to the first line left, or to the close button. The subtotal is a polite live region. On a phone the sheet takes the whole width.

It is made of these components: [Navigation Menu](https://trayui.com/components/navigation-menu.md), [Tabs](https://trayui.com/components/tabs.md), [Top Bar](https://trayui.com/components/top-bar.md), [Kbd](https://trayui.com/components/kbd.md), [Button](https://trayui.com/components/button.md), [Badge](https://trayui.com/components/badge.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md), [Alert](https://trayui.com/components/alert.md), [Card](https://trayui.com/components/card.md), [Feature Grid](https://trayui.com/components/feature-grid.md), [Aspect Ratio](https://trayui.com/components/aspect-ratio.md), [Footer](https://trayui.com/components/footer.md), [Sheet](https://trayui.com/components/sheet.md), [Dialog](https://trayui.com/components/dialog.md), [Item](https://trayui.com/components/item.md), [Button Group](https://trayui.com/components/button-group.md), [Tooltip](https://trayui.com/components/tooltip.md), [Empty](https://trayui.com/components/empty.md), [Progress](https://trayui.com/components/progress.md), [Checkout Summary](https://trayui.com/components/checkout-summary.md).

Behaviours it uses: `dialog`, `open`, `stepper`, `strip`, `tooltip`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cart in a sheet</title>
<meta name="description" content="Gifts on a page whose cart opens in a sheet at the side: lines with a quantity, the way to free delivery, the subtotal and Check out.">
<meta name="tray-category" content="Shop">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<header class="tray-nav tray-container">
  <a class="tray-wordmark" href="/">Perly Farm</a>
  <nav class="tray-nav__strip" aria-label="Main">
    <ul class="tray-nav__links tray-tabs" data-tray="strip">
      <li><a class="tray-tab" href="/shop">Shop</a></li>
      <li><a class="tray-tab" href="/gifts" aria-current="page">Gifts</a></li>
      <li><a class="tray-tab" href="/farm">The farm</a></li>
      <li><a class="tray-tab" href="/delivery">Delivery</a></li>
    </ul>
  </nav>
  <div class="tray-nav__actions">
    <button class="tray-topbar__search tray-topbar__search--fold" type="button" aria-label="Search the shop"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg><span>Search the shop</span><kbd class="tray-kbd">/</kbd></button>
    <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" id="cart-button" data-tray="open" data-target="#cart" data-open-first aria-haspopup="dialog"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-shopping-bag"/></svg>Cart<span class="tray-badge tray-badge--count tray-badge--ink" id="cart-count">3<span class="tray-vh"> items</span></span></button>
  </div>
</header>

<main class="tray-container tray-stack tray-stack--lg" style="padding-block-end: var(--space-12)">
  <nav aria-label="Breadcrumb">
    <ol class="tray-crumbs">
      <li><a href="/">Home</a></li>
      <li><a href="/shop">Shop</a></li>
      <li><span aria-current="page">Gifts</span></li>
    </ol>
  </nav>
  <div class="tray-stack" style="max-inline-size: 46rem">
    <h1 class="headline">Gifts and things to serve it with</h1>
    <p class="lead tray-soft">A box to give, a set to taste, and the spoon and bag that go with every jar. We write your note on the card by hand.</p>
  </div>
  <div class="tray-alert" role="note">
    <span class="tray-alert__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-calendar"/></svg></span>
    <div class="tray-alert__body">
      <p class="tray-alert__title">Order by 22 December for delivery before the New Year</p>
      <p class="tray-alert__text">The courier works until 30 December in Kyiv. The farm shop on Farm road 4 is open until 31 December, 14:00.</p>
    </div>
  </div>
  <div class="tray-integrations" style="--card-pad: var(--space-6)">
    <article class="tray-card tray-feature">
      <div class="tray-slot tray-ratio tray-ratio--photo"></div>
      <div class="tray-stack tray-stack--sm">
        <h2 class="subtitle"><a href="/shop/gift-box">Gift box</a></h2>
        <p class="tray-row tray-row--sm"><span class="tray-soft">A 50&nbsp;g jar, two spoons and a card</span><span class="tray-badge tray-badge--accent">New</span></p>
      </div>
      <div class="tray-feature__end tray-row tray-row--between">
        <p class="subtitle tray-num">$96</p>
        <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-tray="open" data-target="#cart" data-add="line-gift" aria-haspopup="dialog" aria-label="Add to cart: gift box">Add to cart</button>
      </div>
    </article>
    <article class="tray-card tray-feature">
      <div class="tray-slot tray-ratio tray-ratio--photo"></div>
      <div class="tray-stack tray-stack--sm">
        <h2 class="subtitle"><a href="/shop/tasting-set">Tasting set</a></h2>
        <p class="tray-soft">Three 30&nbsp;g jars, each opened fresh</p>
      </div>
      <div class="tray-feature__end tray-row tray-row--between">
        <p class="subtitle tray-num">$105</p>
        <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-tray="open" data-target="#cart" data-add="line-tasting" aria-haspopup="dialog" aria-label="Add to cart: tasting set">Add to cart</button>
      </div>
    </article>
    <article class="tray-card tray-feature">
      <div class="tray-slot tray-ratio tray-ratio--photo"></div>
      <div class="tray-stack tray-stack--sm">
        <h2 class="subtitle"><a href="/shop/spoon">Mother&#8209;of&#8209;pearl spoon</a></h2>
        <p class="tray-soft">12&nbsp;cm, carved by hand</p>
      </div>
      <div class="tray-feature__end tray-row tray-row--between">
        <p class="subtitle tray-num">$14</p>
        <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-tray="open" data-target="#cart" data-add="line-spoon" aria-haspopup="dialog" aria-label="Add to cart: mother-of-pearl spoon">Add to cart</button>
      </div>
    </article>
    <article class="tray-card tray-feature">
      <div class="tray-slot tray-ratio tray-ratio--photo"></div>
      <div class="tray-stack tray-stack--sm">
        <h2 class="subtitle"><a href="/shop/travel-bag">Chilled travel bag</a></h2>
        <p class="tray-soft">Keeps four jars cold for a day</p>
      </div>
      <div class="tray-feature__end tray-row tray-row--between">
        <p class="subtitle tray-num">$12</p>
        <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-tray="open" data-target="#cart" data-add="line-bag" aria-haspopup="dialog" aria-label="Add to cart: chilled travel bag">Add to cart</button>
      </div>
    </article>
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

<dialog class="tray-sheet" id="cart" data-tray="dialog" aria-labelledby="cart-title">
  <div class="tray-dialog__head">
    <div>
      <h2 class="title" id="cart-title">Your cart</h2>
      <p class="tray-dialog__text" id="cart-text">Three things, in one chilled box.</p>
    </div>
    <button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-close aria-label="Close the cart"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-x"/></svg></button>
  </div>
  <div class="tray-dialog__body">
    <ul class="tray-items tray-items--ruled" id="lines" aria-label="In the cart" role="list">
      <li class="tray-item" data-price="9600" id="line-gift">
        <div class="tray-slot tray-slot--line tray-ratio tray-ratio--photo"></div>
        <div class="tray-item__body">
          <div class="tray-stack tray-stack--sm">
            <div class="tray-row tray-row--between">
              <a class="tray-item__title" href="/shop/gift-box">Gift box</a>
              <p class="control tray-num" data-sum>$96.00</p>
            </div>
            <p class="caption tray-muted">A 50&nbsp;g jar from batch 14, two spoons and a card</p>
            <div class="tray-row tray-row--between">
              <span class="tray-btn-group tray-btn-group--sm" role="group" aria-label="Number of gift boxes" data-tray="stepper" data-min="1" data-max="6">
                <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="-1" aria-label="One gift box fewer"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-minus"/></svg></button>
                <output class="tray-btn-group__value">1</output>
                <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="1" aria-label="One gift box more"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg></button>
              </span>
              <span class="tray-anchor" data-tray="tooltip" data-tip="Remove"><button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-remove aria-label="Remove the gift box"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-trash-2"/></svg></button></span>
            </div>
          </div>
        </div>
      </li>
      <li class="tray-item" data-price="1400" id="line-spoon">
        <div class="tray-slot tray-slot--line tray-ratio tray-ratio--photo"></div>
        <div class="tray-item__body">
          <div class="tray-stack tray-stack--sm">
            <div class="tray-row tray-row--between">
              <a class="tray-item__title" href="/shop/spoon">Mother&#8209;of&#8209;pearl spoon</a>
              <p class="control tray-num" data-sum>$28.00</p>
            </div>
            <p class="caption tray-muted">12&nbsp;cm, $14.00 each</p>
            <div class="tray-row tray-row--between">
              <span class="tray-btn-group tray-btn-group--sm" role="group" aria-label="Number of spoons" data-tray="stepper" data-min="1" data-max="12">
                <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="-1" aria-label="One spoon fewer"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-minus"/></svg></button>
                <output class="tray-btn-group__value">2</output>
                <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="1" aria-label="One spoon more"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg></button>
              </span>
              <span class="tray-anchor" data-tray="tooltip" data-tip="Remove"><button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-remove aria-label="Remove the spoons"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-trash-2"/></svg></button></span>
            </div>
          </div>
        </div>
      </li>
      <li class="tray-item" data-price="10500" id="line-tasting" hidden>
        <div class="tray-slot tray-slot--line tray-ratio tray-ratio--photo"></div>
        <div class="tray-item__body">
          <div class="tray-stack tray-stack--sm">
            <div class="tray-row tray-row--between">
              <a class="tray-item__title" href="/shop/tasting-set">Tasting set</a>
              <p class="control tray-num" data-sum>$105.00</p>
            </div>
            <p class="caption tray-muted">Three 30&nbsp;g jars from batch 14</p>
            <div class="tray-row tray-row--between">
              <span class="tray-btn-group tray-btn-group--sm" role="group" aria-label="Number of tasting sets" data-tray="stepper" data-min="1" data-max="6">
                <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="-1" aria-label="One tasting set fewer"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-minus"/></svg></button>
                <output class="tray-btn-group__value">1</output>
                <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="1" aria-label="One tasting set more"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg></button>
              </span>
              <span class="tray-anchor" data-tray="tooltip" data-tip="Remove"><button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-remove aria-label="Remove the tasting set"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-trash-2"/></svg></button></span>
            </div>
          </div>
        </div>
      </li>
      <li class="tray-item" data-price="1200" id="line-bag" hidden>
        <div class="tray-slot tray-slot--line tray-ratio tray-ratio--photo"></div>
        <div class="tray-item__body">
          <div class="tray-stack tray-stack--sm">
            <div class="tray-row tray-row--between">
              <a class="tray-item__title" href="/shop/travel-bag">Chilled travel bag</a>
              <p class="control tray-num" data-sum>$12.00</p>
            </div>
            <p class="caption tray-muted">Holds four jars, $12.00 each</p>
            <div class="tray-row tray-row--between">
              <span class="tray-btn-group tray-btn-group--sm" role="group" aria-label="Number of travel bags" data-tray="stepper" data-min="1" data-max="12">
                <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="-1" aria-label="One bag fewer"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-minus"/></svg></button>
                <output class="tray-btn-group__value">1</output>
                <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="1" aria-label="One bag more"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg></button>
              </span>
              <span class="tray-anchor" data-tray="tooltip" data-tip="Remove"><button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-remove aria-label="Remove the travel bag"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-trash-2"/></svg></button></span>
            </div>
          </div>
        </div>
      </li>
    </ul>
    <div class="tray-empty" id="empty" hidden>
      <span class="tray-empty__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-shopping-bag"/></svg></span>
      <div class="tray-empty__text">
        <p class="control">The cart is empty</p>
        <p>Press Add to cart on anything on this page and it lands here.</p>
      </div>
    </div>
    <div class="tray-progress">
      <span class="tray-progress__name">Free courier from $150</span>
      <span class="tray-progress__value" id="free-value">$124 of $150</span>
      <span class="tray-progress__bar" id="free-bar" role="meter" aria-label="Towards free delivery" aria-valuemin="0" aria-valuemax="150" aria-valuenow="124" style="--tray-v: 83"></span>
      <span class="tray-progress__note" id="free-note"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-truck"/></svg>Add $26.00 more and the courier is free.</span>
    </div>
    <ul class="tray-summary__lines" role="list">
      <li class="tray-summary__line"><span class="control">Subtotal<small>Courier $9 or farm shop pickup, chosen at checkout</small></span><span class="control" id="subtotal" aria-live="polite">$124.00</span></li>
    </ul>
  </div>
  <div class="tray-dialog__foot">
    <a class="tray-btn tray-btn--block tray-btn--split" href="/checkout"><span>Check out</span><span class="tray-num" id="checkout-sum">$124.00</span></a>
  </div>
</dialog>
<script>
/* Keeps the sheet in step: Add to cart on a product opens the sheet and adds a line or one more of it; a quantity or a removed
   line changes the meter to free delivery, the subtotal and the count on the cart button. Amounts are in cents. */
(function () {
  var FREE_FROM = 15000;
  var NUMBERS = ['Nothing', 'One thing', 'Two things', 'Three things', 'Four things', 'Five things', 'Six things', 'Seven things', 'Eight things', 'Nine things', 'Ten things'];
  var $ = function (id) { return document.getElementById(id); };
  var money = function (c) { return '$' + (c / 100).toFixed(2); };
  var lines = [].slice.call($('lines').children);
  function work() {
    var count = 0, sum = 0;
    lines.forEach(function (line) {
      if (line.hidden) return;
      var q = +line.querySelector('output').textContent;
      count += q; sum += q * +line.dataset.price;
      line.querySelector('[data-sum]').textContent = money(q * +line.dataset.price);
    });
    var dollars = Math.round(sum / 100), bar = $('free-bar');
    $('cart-text').textContent = count ? (NUMBERS[count] || count + ' things') + ', in one chilled box.' : 'Nothing in it yet.';
    /* the count, and for a screen reader what it counts: the button is named "Cart 3 items" by its own words */
    $('cart-count').innerHTML = count ? count + '<span class="tray-vh"> ' + (count === 1 ? 'item' : 'items') + '</span>' : '';
    $('subtotal').textContent = $('checkout-sum').textContent = money(sum);
    $('empty').hidden = count > 0;
    $('lines').hidden = !count;
    bar.style.setProperty('--tray-v', Math.min(100, Math.round(sum / FREE_FROM * 100)));
    bar.setAttribute('aria-valuenow', Math.min(150, dollars));
    $('free-value').textContent = sum >= FREE_FROM ? 'Reached' : '$' + dollars + ' of $150';
    $('free-note').lastChild.textContent = sum >= FREE_FROM ? 'The courier is free for this order.' : 'Add ' + money(FREE_FROM - sum) + ' more and the courier is free.';
  }
  document.addEventListener('tray:change', function (e) { if ($('lines').contains(e.target)) work(); });
  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]'), remove = e.target.closest('[data-remove]');
    if (add) {
      var line = $(add.dataset.add);
      if (line.hidden) line.hidden = false; else line.querySelector('[data-step="1"]').click();
      work();
    } else if (remove) {
      remove.closest('li').hidden = true; work();
      var next = $('lines').querySelector('li:not([hidden]) a');
      (next || $('cart').querySelector('[data-close]')).focus();
    }
  });
})();
</script>
<script src="../components/bundle.js"></script>
</body>
</html>
```
