# Notification Center

The notification centre is the panel behind the bell: what happened while you were away, newest first, unread ones marked and counted on the bell.

## Markup
```html
<span class="tray-anchor" data-tray="popover">
  <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" aria-label="Notifications">…</button>
  <span class="tray-pip" data-notices-count></span>
  <div class="tray-pop tray-pop--end tray-notices" data-tray="notices">
    <div class="tray-notices__head">
      <h2>Notifications</h2>
      <button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-notices="read-all">Mark all as read</button>
    </div>
    <ul class="tray-notices__list">
      <li><a class="tray-notice" href="/orders/PL-20431" data-unread>
        <span class="tray-avatar tray-avatar--sm" aria-hidden="true">DK</span>
        <span class="tray-notice__body">
          <span><b>Dana Kovalenko</b> placed order PL-20431.</span>
          <span class="tray-notice__meta">4 minutes ago</span>
        </span>
        <span class="tray-notice__mark"><span class="tray-vh">Unread</span></span>
      </a></li>
    </ul>
    <p class="tray-list__empty" data-notices="empty" hidden>Nothing unread.</p>
  </div>
</span>
```
## Behaviour
`data-tray="notices"` on the panel: opening a notification removes its `data-unread`; the button with `data-notices="read-all"` clears the rest; every element with `data-notices-count` inside the anchor shows the number left and empties at zero. Radios named `notices-view` with the values `all` and `unread` filter the list. It fires `tray:change` with `{ unread }`: save the state on the server there.

An unread notification is told apart three ways: full-ink text, the ink mark at the end, and the hidden word "Unread".

## Do and don't
- Do write each line as who did what to which thing, with the actor in bold.
- Do link every notification to the thing it is about.
- Don't keep more than a screenful here. Link to a full page for the history.
- Don't notify people about their own actions.
