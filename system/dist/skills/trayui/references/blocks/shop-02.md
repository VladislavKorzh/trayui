# Cart page with product lines

A cart inside the shop's header and footer: lines with a picture, quantity and Remove, the way to free delivery, three things to add and the summary.

A shopping cart page that keeps the shop's header and footer around it. Each line has a square picture, a link back to the product, the price of one, a quantity stepper and a remove button with a tooltip. Under the lines, a meter counts towards free delivery, and three suggestions each add a line, or one more of it, then leave the list. The summary takes a promo code and ends in Check out. Pick it over the [cart as a checkout step](https://trayui.com/blocks/checkout-01.md) to keep the shop's navigation, and over the [cart in a sheet](https://trayui.com/blocks/shop-03.md) when the cart needs room.

Removing a line moves focus to the first line left, or to the empty state's link once nothing is left, and Check out turns off with an empty cart. The cart button in the header carries `aria-current="page"`, and its name follows the count: "Cart, 4 items". Below 64rem the summary moves under the lines.

It is made of these components: [Navigation Menu](https://trayui.com/components/navigation-menu.md), [Tabs](https://trayui.com/components/tabs.md), [Top Bar](https://trayui.com/components/top-bar.md), [Kbd](https://trayui.com/components/kbd.md), [Button](https://trayui.com/components/button.md), [Badge](https://trayui.com/components/badge.md), [Item](https://trayui.com/components/item.md), [Aspect Ratio](https://trayui.com/components/aspect-ratio.md), [Button Group](https://trayui.com/components/button-group.md), [Tooltip](https://trayui.com/components/tooltip.md), [Empty](https://trayui.com/components/empty.md), [Progress](https://trayui.com/components/progress.md), [Card](https://trayui.com/components/card.md), [Checkout Summary](https://trayui.com/components/checkout-summary.md), [Field](https://trayui.com/components/field.md), [Input Group](https://trayui.com/components/input-group.md), [Input](https://trayui.com/components/input.md), [Footer](https://trayui.com/components/footer.md).

Behaviours it uses: `stepper`, `strip`, `tooltip`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cart page with product lines</title>
<meta name="description" content="A cart inside the shop's header and footer: lines with a picture, quantity and Remove, the way to free delivery, three things to add and the summary.">
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
      <li><a class="tray-tab" href="/gifts">Gifts</a></li>
      <li><a class="tray-tab" href="/farm">The farm</a></li>
      <li><a class="tray-tab" href="/delivery">Delivery</a></li>
    </ul>
  </nav>
  <div class="tray-nav__actions">
    <button class="tray-topbar__search tray-topbar__search--fold" type="button" aria-label="Search the shop"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg><span>Search the shop</span><kbd class="tray-kbd">/</kbd></button>
    <a class="tray-btn tray-btn--quiet tray-btn--sm" href="/cart" aria-current="page" id="cart-link"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-shopping-bag"/></svg>Cart<span class="tray-badge tray-badge--count tray-badge--ink" id="cart-count">4<span class="tray-vh"> items</span></span></a>
  </div>
</header>

<main class="tray-container tray-stack tray-stack--lg">
  <div class="tray-stack tray-stack--sm">
    <a class="tray-back" href="/shop"><svg class="tray-icon tray-icon--flip" aria-hidden="true"><use href="#tray-i-arrow-left"/></svg>Keep shopping</a>
    <h1 class="headline">Your cart</h1>
    <p class="lead tray-soft" id="cart-lead">Four things, packed together in one chilled box.</p>
  </div>

  <div class="tray-with-aside" style="padding-block: var(--space-4) var(--space-12)">
    <div class="tray-stack tray-stack--lg" id="cart">
      <ul class="tray-items tray-items--ruled" id="lines" aria-label="In the cart" role="list">
        <li class="tray-item" data-price="5900">
          <div class="tray-slot tray-ratio tray-ratio--square"></div>
          <div class="tray-item__body">
            <div class="tray-stack tray-stack--sm">
              <div class="tray-row tray-row--between">
                <a class="tray-item__title" href="/shop/caviar-50">Snail caviar, 50&nbsp;g</a>
                <p class="control tray-num" data-sum>$118.00</p>
              </div>
              <p class="caption tray-muted" data-each>50&nbsp;g jar from batch 14, $59.00 each</p>
              <div class="tray-row tray-row--between">
                <span class="tray-btn-group tray-btn-group--sm" role="group" aria-label="Number of 50 g jars" data-tray="stepper" data-min="1" data-max="6">
                  <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="-1" aria-label="One 50 g jar fewer"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-minus"/></svg></button>
                  <output class="tray-btn-group__value">2</output>
                  <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="1" aria-label="One 50 g jar more"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg></button>
                </span>
                <span class="tray-anchor" data-tray="tooltip" data-tip="Remove"><button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-remove aria-label="Remove the 50 g jars"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-trash-2"/></svg></button></span>
              </div>
            </div>
          </div>
        </li>
        <li class="tray-item" data-price="1400" id="line-spoon">
          <div class="tray-slot tray-ratio tray-ratio--square"></div>
          <div class="tray-item__body">
            <div class="tray-stack tray-stack--sm">
              <div class="tray-row tray-row--between">
                <a class="tray-item__title" href="/shop/spoon">Mother&#8209;of&#8209;pearl spoon</a>
                <p class="control tray-num" data-sum>$14.00</p>
              </div>
              <p class="caption tray-muted" data-each>12&nbsp;cm, $14.00 each</p>
              <div class="tray-row tray-row--between">
                <span class="tray-btn-group tray-btn-group--sm" role="group" aria-label="Number of spoons" data-tray="stepper" data-min="1" data-max="12">
                  <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="-1" aria-label="One spoon fewer"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-minus"/></svg></button>
                  <output class="tray-btn-group__value">1</output>
                  <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="1" aria-label="One spoon more"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg></button>
                </span>
                <span class="tray-anchor" data-tray="tooltip" data-tip="Remove"><button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-remove aria-label="Remove the spoon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-trash-2"/></svg></button></span>
              </div>
            </div>
          </div>
        </li>
        <li class="tray-item" data-price="1200">
          <div class="tray-slot tray-ratio tray-ratio--square"></div>
          <div class="tray-item__body">
            <div class="tray-stack tray-stack--sm">
              <div class="tray-row tray-row--between">
                <a class="tray-item__title" href="/shop/travel-bag">Chilled travel bag</a>
                <p class="control tray-num" data-sum>$12.00</p>
              </div>
              <p class="caption tray-muted" data-each>Holds four jars, $12.00 each</p>
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
        <li class="tray-item" data-price="3800" id="line-jar30" hidden>
          <div class="tray-slot tray-ratio tray-ratio--square"></div>
          <div class="tray-item__body">
            <div class="tray-stack tray-stack--sm">
              <div class="tray-row tray-row--between">
                <a class="tray-item__title" href="/shop/caviar-30">Snail caviar, 30&nbsp;g</a>
                <p class="control tray-num" data-sum>$38.00</p>
              </div>
              <p class="caption tray-muted" data-each>30&nbsp;g jar from batch 14, $38.00 each</p>
              <div class="tray-row tray-row--between">
                <span class="tray-btn-group tray-btn-group--sm" role="group" aria-label="Number of 30 g jars" data-tray="stepper" data-min="1" data-max="6">
                  <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="-1" aria-label="One 30 g jar fewer"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-minus"/></svg></button>
                  <output class="tray-btn-group__value">1</output>
                  <button class="tray-btn-group__item tray-btn-group__item--icon" type="button" data-step="1" aria-label="One 30 g jar more"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg></button>
                </span>
                <span class="tray-anchor" data-tray="tooltip" data-tip="Remove"><button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-remove aria-label="Remove the 30 g jars"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-trash-2"/></svg></button></span>
              </div>
            </div>
          </div>
        </li>
        <li class="tray-item" data-price="9600" id="line-gift" hidden>
          <div class="tray-slot tray-ratio tray-ratio--square"></div>
          <div class="tray-item__body">
            <div class="tray-stack tray-stack--sm">
              <div class="tray-row tray-row--between">
                <a class="tray-item__title" href="/shop/gift-box">Gift box</a>
                <p class="control tray-num" data-sum>$96.00</p>
              </div>
              <p class="caption tray-muted" data-each>A 50&nbsp;g jar, two spoons and a card, $96.00 each</p>
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
      </ul>
      <div class="tray-empty" id="empty" hidden>
        <span class="tray-empty__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-shopping-bag"/></svg></span>
        <div class="tray-empty__text">
          <p class="control">The cart is empty</p>
          <p>Batch 14 has 132 jars left. They keep three months in the fridge.</p>
        </div>
        <div class="tray-empty__actions"><a class="tray-btn tray-btn--quiet tray-btn--sm" href="/shop">Back to the shop</a></div>
      </div>

      <div class="tray-progress">
        <span class="tray-progress__name">Free courier from $150</span>
        <span class="tray-progress__value" id="free-value">$144 of $150</span>
        <span class="tray-progress__bar" id="free-bar" role="meter" aria-label="Towards free delivery" aria-valuemin="0" aria-valuemax="150" aria-valuenow="144" style="--tray-v: 96"></span>
        <span class="tray-progress__note" id="free-note"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-truck"/></svg>Add $6.00 more and the courier is free.</span>
      </div>

      <section class="tray-stack" id="addons" aria-labelledby="addons-title">
        <h2 class="subtitle" id="addons-title">Often added to this order</h2>
        <ul class="tray-items" role="list">
          <li class="tray-item" data-add="line-spoon">
            <div class="tray-slot tray-slot--line tray-ratio tray-ratio--square"></div>
            <span class="tray-item__body"><span class="tray-item__title">A second spoon</span><span class="tray-item__text">One each at the table, and the courier is free</span></span>
            <span class="tray-item__end"><button class="tray-btn tray-btn--quiet tray-btn--xs" type="button" aria-label="Add for $14: a second mother-of-pearl spoon">Add for $14</button></span>
          </li>
          <li class="tray-item" data-add="line-jar30">
            <div class="tray-slot tray-slot--line tray-ratio tray-ratio--square"></div>
            <span class="tray-item__body"><span class="tray-item__title">Snail caviar, 30&nbsp;g</span><span class="tray-item__text">Open it the week after, and it is just as fresh</span></span>
            <span class="tray-item__end"><button class="tray-btn tray-btn--quiet tray-btn--xs" type="button" aria-label="Add for $38: a 30 g jar">Add for $38</button></span>
          </li>
          <li class="tray-item" data-add="line-gift">
            <div class="tray-slot tray-slot--line tray-ratio tray-ratio--square"></div>
            <span class="tray-item__body"><span class="tray-item__title">Gift box</span><span class="tray-item__text">For someone else: a 50&nbsp;g jar, two spoons and a card</span></span>
            <span class="tray-item__end"><button class="tray-btn tray-btn--quiet tray-btn--xs" type="button" aria-label="Add for $96: a gift box">Add for $96</button></span>
          </li>
        </ul>
      </section>
    </div>

    <aside class="tray-with-aside__aside" aria-label="Summary">
      <form class="tray-card tray-summary" action="/checkout" method="get" style="padding: var(--space-7)">
        <h2 class="subtitle">Summary</h2>
        <ul class="tray-summary__lines" role="list">
          <li class="tray-summary__line"><span>Subtotal<small id="items-name">Four things</small></span><span id="subtotal">$144.00</span></li>
          <li class="tray-summary__line" id="promo-line" hidden><span>Promo code FIRSTJAR<small>10% off the order</small></span><span id="promo-sum">&minus;$14.40</span></li>
          <li class="tray-summary__line"><span>Courier in Kyiv<small>Or collect at Farm road 4 for free</small></span><span id="courier-sum">$9.00</span></li>
        </ul>
        <div class="tray-field">
          <div class="tray-input-group tray-input-group--sm">
            <input class="tray-input" id="promo" name="promo" placeholder="Promo code" aria-label="Promo code" autocomplete="off" aria-describedby="promo-message">
            <button class="tray-input-group__btn" type="button" id="promo-apply">Apply</button>
          </div>
          <p class="tray-field__hint" id="promo-message">A first order takes the code FIRSTJAR.</p>
        </div>
        <p class="tray-summary__total" aria-live="polite" aria-atomic="true"><span>Total</span><span id="total">$153.00</span></p>
        <button class="tray-btn tray-btn--block" type="submit" id="checkout">Check out</button>
        <p class="tray-summary__note"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-clock"/></svg>Order by 12:00 for delivery today.</p>
      </form>
    </aside>
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
/* Keeps the cart in step: a quantity, a removed line, an added extra or a promo code changes the lines, the meter to free
   delivery, the summary and the count on the cart button. Amounts are in cents; the steppers report with tray:change. */
(function () {
  var FREE_FROM = 15000, COURIER = 900, CODE = 'FIRSTJAR', off = 0;
  var NUMBERS = ['Nothing', 'One thing', 'Two things', 'Three things', 'Four things', 'Five things', 'Six things', 'Seven things', 'Eight things', 'Nine things', 'Ten things'];
  var $ = function (id) { return document.getElementById(id); };
  var money = function (c) { return '$' + (c / 100).toFixed(2); };
  var lines = [].slice.call($('lines').children);
  function work() {
    var count = 0, sum = 0;
    lines.forEach(function (line) {
      if (line.hidden) return;
      var q = +line.querySelector('output').textContent, each = +line.dataset.price;
      count += q; sum += q * each;
      line.querySelector('[data-sum]').textContent = money(q * each);
    });
    var discount = Math.round(sum * off / 100), courier = sum >= FREE_FROM ? 0 : COURIER, name = NUMBERS[count] || count + ' things';
    $('items-name').textContent = name;
    $('cart-lead').textContent = count ? name + ', packed together in one chilled box.' : 'Nothing in it yet.';
    /* the count, and for a screen reader what it counts: the button is named "Cart 3 items" by its own words */
    $('cart-count').innerHTML = count ? count + '<span class="tray-vh"> ' + (count === 1 ? 'item' : 'items') + '</span>' : '';
    $('subtotal').textContent = money(sum);
    $('promo-line').hidden = !off;
    $('promo-sum').textContent = '−' + money(discount);
    $('courier-sum').textContent = courier ? money(courier) : 'Free';
    $('total').textContent = money(sum - discount + (count ? courier : 0));
    $('empty').hidden = count > 0;
    $('lines').hidden = !count;
    $('checkout').disabled = !count;
    var bar = $('free-bar'), dollars = Math.round(sum / 100);
    bar.style.setProperty('--tray-v', Math.min(100, Math.round(sum / FREE_FROM * 100)));
    bar.setAttribute('aria-valuenow', Math.min(150, dollars));
    $('free-value').textContent = sum >= FREE_FROM ? 'Reached' : '$' + dollars + ' of $150';
    $('free-note').lastChild.textContent = sum >= FREE_FROM ? 'The courier is free for this order.' : 'Add ' + money(FREE_FROM - sum) + ' more and the courier is free.';
  }
  document.addEventListener('tray:change', function (e) { if ($('lines').contains(e.target)) work(); });
  $('lines').addEventListener('click', function (e) {
    var b = e.target.closest('[data-remove]');
    if (!b) return;
    b.closest('li').hidden = true; work();
    var next = $('lines').querySelector('li:not([hidden]) a');
    (next || $('empty').querySelector('a')).focus();
  });
  $('addons').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var row = b.closest('[data-add]'), line = $(row.dataset.add);
    if (line.hidden) line.hidden = false; else line.querySelector('[data-step="1"]').click();
    row.hidden = true;
    $('addons').hidden = ![].some.call($('addons').querySelectorAll('[data-add]'), function (r) { return !r.hidden; });
    work();
  });
  $('promo-apply').addEventListener('click', function () {
    var code = $('promo').value.trim().toUpperCase(), ok = code === CODE, message = $('promo-message');
    off = ok ? 10 : 0;
    $('promo').setAttribute('aria-invalid', String(!ok));
    message.className = ok ? 'tray-field__hint' : 'tray-field__error';
    message.textContent = ok ? 'FIRSTJAR takes 10% off the order.' : code ? 'We do not know this code. Check the spelling.' : 'Enter the code, or leave the field empty.';
    work();
  });
})();
</script>
<script src="../components/bundle.js"></script>
</body>
</html>
```
