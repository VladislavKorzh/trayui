# Activity Feed

An activity feed is the record of who did what, newest first: a mark, one sentence and the time for each event, joined by a hairline.

## Markup
```html
<ol class="tray-feed">
  <li class="tray-feed__day">Today</li>
  <li>
    <span class="tray-avatar tray-avatar--xs" aria-hidden="true">OF</span>
    <div class="tray-feed__body">
      <p><b>Oksana Franko</b> changed the delivery day of <a href="/orders/PL-20418">PL-20418</a> to Tuesday.</p>
      <p class="tray-feed__meta"><time datetime="2026-11-15T10:42">10:42</time></p>
    </div>
  </li>
  <li>
    <span class="tray-feed__mark"><svg class="tray-icon tray-icon--sm" aria-hidden="true"><use href="#tray-i-credit-card"/></svg></span>
    <div class="tray-feed__body">
      <p><b>Invoice CN-0042</b> was paid.</p>
      <p class="tray-feed__meta">09:12</p>
      <p class="tray-feed__detail">$29.00, card ending 4242</p>
    </div>
  </li>
</ol>
```
The mark is a 32px Avatar for a person and a `tray-feed__mark` tile with an icon for the system. The actor and the object are in bold or linked; the rest of the sentence is soft. `tray-feed__detail` holds what changed: an amount, a quoted note, old and new values. `tray-feed__day` starts each day.

## Accessibility
The feed is an `<ol>`, one `<li>` per event, and each day label is an item of its own. The avatar is `aria-hidden`, and so is the icon in a `tray-feed__mark`, so the sentence must name the actor and the object by itself. Events are told apart by their icon and their words, never by colour. The feed has no live region, so events that arrive while the page is open are not announced unless the page adds one.

## Do and don't
- Do write each event as one sentence in the past tense, actor first.
- Do use a real `<time>` and show the hour for today, the date for older days.
- Don't colour events by type. An icon tells a payment from a message.
- Don't use it for a conversation: that is Message. Steps a machine took are a Trace.
