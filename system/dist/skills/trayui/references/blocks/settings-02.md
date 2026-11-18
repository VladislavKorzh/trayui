# Notifications by channel

Notification settings channel by channel: switches for email and the phone app, a phone number to add for text messages, and quiet hours for the night.

Notification settings laid out by channel: a card each for email and the phone app, one for text messages, and one for quiet hours at night. A switch in a channel's corner turns off the rows under it, a row that must stay on is locked, and the text messages card is an empty state that asks for a phone number first. There is no save button: every switch and select saves the moment it moves and says so in a toast. Pick it when people think in channels; for a grid of events against channels, use [notification preferences](https://trayui.com/components/notification-preferences.md).

The same event can sit under two channels, so each switch carries hidden words, ", by email" or ", in the phone app", and is announced with its channel. The toasts arrive in a polite live region. Below 56rem the four cards stack in one column.

It is made of these components: [App Shell](https://trayui.com/components/app-shell.md), [Sidebar](https://trayui.com/components/sidebar.md), [Dropdown Menu](https://trayui.com/components/dropdown-menu.md), [Workspace Switcher](https://trayui.com/components/workspace-switcher.md), [Avatar](https://trayui.com/components/avatar.md), [Badge](https://trayui.com/components/badge.md), [Top Bar](https://trayui.com/components/top-bar.md), [Button](https://trayui.com/components/button.md), [Breadcrumb](https://trayui.com/components/breadcrumb.md), [Page Header](https://trayui.com/components/page-header.md), [Tabs](https://trayui.com/components/tabs.md), [Card](https://trayui.com/components/card.md), [Switch](https://trayui.com/components/switch.md), [Empty](https://trayui.com/components/empty.md), [Field](https://trayui.com/components/field.md), [Label](https://trayui.com/components/label.md), [Native Select](https://trayui.com/components/native-select.md).

Behaviours it uses: `menu`, `sidebar-sheet`, `strip`.

Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Notifications by channel</title>
<meta name="description" content="Notification settings channel by channel: switches for email and the phone app, a phone number to add for text messages, and quiet hours for the night.">
<meta name="tray-category" content="Settings">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
</head>
<body>
<div class="tray-app">
  <div class="tray-app__side">
    <nav class="tray-sidebar" id="nav" aria-label="Main">
      <div class="tray-anchor tray-anchor--block" data-tray="menu">
        <button class="tray-switcher" type="button">
          <span class="tray-avatar tray-avatar--sm tray-avatar--ink" aria-hidden="true">PF</span>
          <span class="tray-person__text"><b>Perly Farm</b><small>Shop plan</small></span>
          <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chevrons-up-down"/></svg>
        </button>
        <div class="tray-pop">
          <div class="tray-list">
            <p class="tray-list__label">Workspaces</p>
            <button type="button" class="tray-option" role="menuitemradio" data-group="workspace" aria-checked="true"><span class="tray-avatar tray-avatar--xs tray-avatar--ink" aria-hidden="true">PF</span><span class="tray-option__text">Perly Farm</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
            <button type="button" class="tray-option" role="menuitemradio" data-group="workspace" aria-checked="false"><span class="tray-avatar tray-avatar--xs" aria-hidden="true">HC</span><span class="tray-option__text">Hill Cheese</span><svg class="tray-icon tray-option__check" aria-hidden="true"><use href="#tray-i-check"/></svg></button>
            <hr class="tray-list__rule">
            <button type="button" class="tray-option" role="menuitem"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg><span class="tray-option__text">New workspace</span></button>
          </div>
        </div>
      </div>
      <div class="tray-sidebar__scroll">
        <div class="tray-sidebar__group">
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-house"/></svg><span>Home</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-inbox"/></svg><span>Orders</span><span class="tray-badge tray-badge--count">12</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-message-square"/></svg><span>Inbox</span><span class="tray-badge tray-badge--count">3</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-users"/></svg><span>Customers</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-package"/></svg><span>Batches</span></a>
        </div>
        <div class="tray-sidebar__group">
          <p class="tray-sidebar__label">Workspace</p>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-user-plus"/></svg><span>Team</span></a>
          <a class="tray-sidebar__item" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plug"/></svg><span>Integrations</span></a>
          <a class="tray-sidebar__item" href="#" aria-current="page"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-settings"/></svg><span>Settings</span></a>
        </div>
      </div>
      <div class="tray-anchor tray-anchor--block" data-tray="menu">
        <button class="tray-switcher" type="button">
          <span class="tray-avatar tray-avatar--sm" aria-hidden="true">OF</span>
          <span class="tray-person__text"><b>Oksana Franko</b><small>Owner</small></span>
          <svg class="tray-icon" aria-hidden="true"><use href="#tray-i-chevrons-up-down"/></svg>
        </button>
        <div class="tray-pop tray-pop--top">
          <div class="tray-pop__head">
            <span class="tray-avatar" aria-hidden="true">OF</span>
            <span class="tray-person__text"><b>Oksana Franko</b><small>oksana@perly.example</small></span>
          </div>
          <div class="tray-list">
            <hr class="tray-list__rule">
            <a class="tray-option" role="menuitem" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-user"/></svg><span class="tray-option__text">Profile</span></a>
            <a class="tray-option" role="menuitem" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-life-buoy"/></svg><span class="tray-option__text">Help</span></a>
            <hr class="tray-list__rule">
            <button type="button" class="tray-option" role="menuitem"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-log-out"/></svg><span class="tray-option__text">Sign out</span></button>
          </div>
        </div>
      </div>
    </nav>
  </div>
  <div class="tray-app__main">
    <header class="tray-topbar">
      <div class="tray-topbar__start">
        <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon tray-app__menu" type="button" data-tray="sidebar-sheet" aria-controls="nav" aria-label="Open the navigation"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-menu"/></svg></button>
        <nav aria-label="Breadcrumb"><ol class="tray-crumbs tray-crumbs--fold"><li><a href="#">Perly Farm</a></li><li><a href="#">Settings</a></li><li><span aria-current="page">Notifications</span></li></ol></nav>
      </div>
    </header>
    <main class="tray-app__content">
      <div class="tray-pagehead">
        <div class="tray-pagehead__row">
          <div class="tray-pagehead__text">
            <h1 class="title">Notifications</h1>
            <p>What reaches you, and where. Each switch saves the moment you move it.</p>
          </div>
          <div class="tray-pagehead__actions">
            <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" id="test-send"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-send"/></svg>Send a test</button>
          </div>
        </div>
        <p class="tray-pagehead__meta"><span><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-bell"/></svg>The bell in Counter shows everything, whatever is set here</span><span><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-clock"/></svg>Times are Kyiv time</span></p>
        <nav class="tray-tabs" data-tray="strip" aria-label="Your settings">
          <a class="tray-tab" href="#">Profile</a>
          <a class="tray-tab" href="#" aria-current="page">Notifications</a>
          <a class="tray-tab" href="#">Security</a>
        </nav>
      </div>
      <div class="tray-bento" id="channels">
        <section class="tray-card tray-span-7" aria-labelledby="ch-email" data-channel>
          <div class="tray-card__head">
            <div>
              <h2 class="subtitle" id="ch-email">Email</h2>
              <p class="tray-soft">To oksana@perly.example</p>
            </div>
            <label class="tray-switch"><input type="checkbox" role="switch" aria-label="Email" data-master checked><span class="tray-switch__track"></span></label>
          </div>
          <div class="tray-stack tray-stack--sm">
            <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>A delivery fails<span class="tray-vh">, by email</span></b><small>So you can call the customer the same day.</small></span><input type="checkbox" role="switch" checked><span class="tray-switch__track"></span></label>
            <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>A batch is nearly sold out<span class="tray-vh">, by email</span></b><small>When fewer than 50 jars of a size are left.</small></span><input type="checkbox" role="switch" checked><span class="tray-switch__track"></span></label>
            <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>The weekly report<span class="tray-vh">, by email</span></b><small>Orders, revenue and returns, every Monday at 9:00.</small></span><input type="checkbox" role="switch" checked><span class="tray-switch__track"></span></label>
            <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>A payment fails<span class="tray-vh">, by email</span></b><small>Always on: the plan depends on it.</small></span><input type="checkbox" role="switch" checked disabled data-locked><span class="tray-switch__track"></span></label>
            <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>News from Counter<span class="tray-vh">, by email</span></b><small>New features, a few times a year.</small></span><input type="checkbox" role="switch"><span class="tray-switch__track"></span></label>
          </div>
        </section>
        <section class="tray-card tray-span-5" aria-labelledby="ch-push" data-channel>
          <div class="tray-card__head">
            <div>
              <h2 class="subtitle" id="ch-push">Phone app</h2>
              <p class="tray-soft">Counter on iPhone 15, used 2 hours ago</p>
            </div>
            <label class="tray-switch"><input type="checkbox" role="switch" aria-label="Phone app" data-master checked><span class="tray-switch__track"></span></label>
          </div>
          <div class="tray-stack tray-stack--sm">
            <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>A new order arrives<span class="tray-vh">, in the phone app</span></b><small>With the total.</small></span><input type="checkbox" role="switch" checked><span class="tray-switch__track"></span></label>
            <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>A customer writes<span class="tray-vh">, in the phone app</span></b><small>From the shop or an order.</small></span><input type="checkbox" role="switch" checked><span class="tray-switch__track"></span></label>
            <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>A delivery fails<span class="tray-vh">, in the phone app</span></b><small>With the courier's number.</small></span><input type="checkbox" role="switch" checked><span class="tray-switch__track"></span></label>
            <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>The packing list<span class="tray-vh">, in the phone app</span></b><small>Ready at 12:00, two hours before pick-up.</small></span><input type="checkbox" role="switch"><span class="tray-switch__track"></span></label>
          </div>
        </section>
        <section class="tray-card tray-span-5" aria-labelledby="ch-text">
          <div class="tray-card__head">
            <div>
              <h2 class="subtitle" id="ch-text">Text messages</h2>
              <p class="tray-soft">For the snail houses, where the internet does not reach.</p>
            </div>
          </div>
          <div class="tray-panel tray-empty">
            <span class="tray-empty__icon"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-phone"/></svg></span>
            <div class="tray-empty__text">
              <p class="control">No phone number yet</p>
              <p>Add one and we text you when a delivery fails. Nothing else, unless you ask.</p>
            </div>
            <div class="tray-empty__actions">
              <a class="tray-btn tray-btn--sm" href="#"><svg class="tray-icon" aria-hidden="true"><use href="#tray-i-plus"/></svg>Add a phone number</a>
            </div>
          </div>
        </section>
        <section class="tray-card tray-span-7" aria-labelledby="ch-quiet" data-channel>
          <div class="tray-card__head">
            <div>
              <h2 class="subtitle" id="ch-quiet">Quiet hours</h2>
              <p class="tray-soft">The phone app and texts wait until morning, then arrive as one summary. Email comes as usual.</p>
            </div>
            <label class="tray-switch"><input type="checkbox" role="switch" aria-label="Quiet hours" data-master checked><span class="tray-switch__track"></span></label>
          </div>
          <div class="tray-stack">
            <div class="tray-fields">
              <div class="tray-field">
                <label class="tray-label" for="quiet-from">Every night from</label>
                <span class="tray-select"><select id="quiet-from"><option>20:00</option><option selected>21:00</option><option>22:00</option><option>23:00</option></select></span>
              </div>
              <div class="tray-field">
                <label class="tray-label" for="quiet-until">Until</label>
                <span class="tray-select"><select id="quiet-until"><option>06:00</option><option selected>07:00</option><option>08:00</option></select></span>
              </div>
            </div>
            <div class="tray-stack tray-stack--sm">
              <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>Quiet all Sunday</b><small>The farm shop is closed on Sundays.</small></span><input type="checkbox" role="switch" checked><span class="tray-switch__track"></span></label>
              <label class="tray-switch tray-switch--row"><span class="tray-switch__text"><b>Let a failed delivery through</b><small>A courier at a locked gate still reaches you.</small></span><input type="checkbox" role="switch" checked><span class="tray-switch__track"></span></label>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</div>
<script src="../components/bundle.js"></script>
<script>
/* Every switch and select saves at once and says so in a toast. A channel's own switch rests the rows under it. */
(function () {
  var root = document.getElementById('channels');
  function rest(card) {
    var on = card.querySelector('[data-master]').checked;
    [].forEach.call(card.querySelectorAll('input, select'), function (el) {
      if (!el.hasAttribute('data-master') && !el.hasAttribute('data-locked')) el.disabled = !on;
    });
  }
  [].forEach.call(root.querySelectorAll('[data-channel]'), rest);
  root.addEventListener('change', function (e) {
    var el = e.target, card = el.closest('section');
    var channel = card.querySelector('h2').textContent;
    if (el.hasAttribute('data-master')) {
      rest(card);
      TrayUI.toast({ title: channel + (el.checked ? ' on' : ' off'), text: el.checked ? 'The switches below apply again.' : 'Nothing comes this way until you turn it back on.' });
      return;
    }
    var name = el.tagName === 'SELECT' ? el.labels[0].textContent : el.closest('label').querySelector('b').firstChild.textContent;
    var value = el.tagName === 'SELECT' ? el.value : el.checked ? 'on' : 'off';
    TrayUI.toast({ title: name, text: channel + ': ' + value + '. Saved.' });
  });
  document.getElementById('test-send').addEventListener('click', function () {
    TrayUI.toast({ tone: 'success', title: 'Test sent', text: 'To oksana@perly.example and the phone app.' });
  });
})();
</script>
</body>
</html>
```
