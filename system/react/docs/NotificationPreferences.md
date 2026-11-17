---
category: Account
keywords: [notification preferences, notifications, email preferences, alerts settings, subscriptions, channels, checkbox matrix]
---
# Notification Preferences

Notification preferences is a grid of checkboxes: what can happen down the side, the ways to be told across the top.

## Use
```tsx
<NotificationPreferences
  channels={[
    { key: 'email', label: 'Email', spoken: 'by email' },
    { key: 'push', label: 'Push', spoken: 'by push' },
    { key: 'sms', label: 'Text', spoken: 'by text message' },
  ]}
  groups={[
    { label: 'Orders', events: [{ key: 'order-new', title: 'A new order arrives', description: 'Once per order.' }] },
    { label: 'Account', events: [
      { key: 'payment-failed', title: 'A payment fails', description: 'Always on by email: the plan depends on it.', locked: ['email'] },
      { key: 'news', title: 'News from Counter', description: 'New features, a few times a year.', unavailable: ['sms'] },
    ] },
  ]}
  defaultValue={{ 'order-new': ['push'] }}
  onChange={(value, change) => save(value)}               /* change: { event, channel, checked } */
/>
```

## Parts
The value says which channels are on for each event: `{ 'order-new': ['email', 'push'] }`. Every checkbox is named by its row and its column: "A new order arrives, by email". Group the rows with a `label` per group.

- `locked`: a notification the person cannot turn off (a failed payment, a security alert) is checked and disabled; the line under its name says why.
- `unavailable`: a channel this event cannot use is disabled and empty.
- A channel with `disabled` turns off its whole column: put "Add a phone number" (a link) in its `label`.

Three or four channels fit; with more, give each event its own row of Switches in a Settings Section.

## Do and don't
- Do save each change at once and confirm with a quiet Toast.
- Do word the rows as events: "A new order arrives".
- Don't offer a channel the person has not set up: show "Add a phone number" in that column's head instead.
- Don't pre-check marketing email.
