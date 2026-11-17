---
category: Metrics
keywords: [activity feed, activity, timeline, history, audit log, event log, changes, log]
---
# Activity Feed

An activity feed is the record of who did what, newest first: a mark, one sentence and the time for each event, joined by a hairline.

## Use
```tsx
<ActivityFeed items={[
  { day: 'Today', initials: 'OF',                                       // a person: their initials on an Avatar
    text: <><b>Oksana Franko</b> changed the delivery day of <a href="/orders/PL-20418">PL-20418</a> to Tuesday.</>,
    time: '10:42', dateTime: '2026-11-15T10:42',
    detail: '“The customer is away until Monday evening.”' },           // what changed, on a small fill
  { icon: 'credit-card', text: <><b>Invoice CN-0042</b> was paid.</>,   // the system: an icon on a tile
    time: '09:12', dateTime: '2026-11-15T09:12', detail: '$29.00, card ending 4242' },
  { day: 'Yesterday', icon: 'key', text: <>The API key <b>Storefront</b> was created.</>, time: '11:20' },
]} />
```

## Parts
- The mark: a 32px Avatar with initials for a person, a small tile with an icon for the system.
- The sentence: the actor and the object in bold or as links; the rest of the sentence is soft.
- The time under it: the hour for today, the date for older days. Give `dateTime` and it is written as a real `<time>`.
- The detail holds what changed: an amount, a quoted note, the old and new values.
- `day` on an event starts a new day above it: "Today", "Yesterday", "13 November".

## Do and don't
- Do write each event as one sentence in the past tense, actor first.
- Do show the hour for today and the date for older days.
- Don't colour events by type. An icon tells a payment from a message.
- Don't use it for a conversation: that is Message. Steps a machine took are a Trace.
