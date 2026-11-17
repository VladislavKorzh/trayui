---
category: App shell
keywords: [notification center, notifications, inbox, bell, activity, alerts panel, unread count]
---
# Notification Center

The notification centre is the panel behind the bell: what happened while you were away, newest first, unread ones marked and counted on the bell.

## Use
```tsx
<NotificationCenter
  items={[
    { id: 'n1', actor: 'Dana Kovalenko', text: 'placed order PL-20431.', time: '4 minutes ago', initials: 'DK', href: '/orders/PL-20431', unread: true },
    { id: 'n2', actor: 'The courier', text: 'could not reach the address for PL-20418.', time: '32 minutes ago', icon: 'truck', href: '/orders/PL-20418', unread: true },
    { id: 'n3', actor: 'Invoice CN-0042', text: 'was paid, $29.00.', time: 'Yesterday, 09:12', icon: 'credit-card', href: '/billing' },
  ]}
  onRead={(ids) => saveRead(ids)}                       // save the state on the server here
  footer={<Button variant="link" href="/settings/notifications">Notification settings</Button>}
/>
```

## Parts
- **Bell**: a quiet icon button with the unread count in the yellow pip on its corner, and in its name ("Notifications, 2 unread"). The pip hides at zero.
- **Head**: the title and "Mark all as read", which turns off once nothing is unread.
- **Switch** (`filter`, on by default): All or Unread only.
- **List**: one row per notification: a tile (`initials`, `icon` or `src`), the actor in bold and what they did, the time under it. An unread one is told apart three ways: full-ink text, an ink dot at the end, and the hidden word "Unread".
- **Foot** (`footer`): a link to the settings or the full history.

## Behaviour
Opening a notification marks it read; "Mark all as read" clears the rest. Both report the ids through `onRead`, and the count follows at once. The component keeps what was read until your items say so too. The panel opens at the bell's end edge; `open`, `defaultOpen` and `onOpenChange` hold or follow its state.

## Do and don't
- Do write each line as who did what to which thing, with the actor in bold.
- Do link every notification to the thing it is about.
- Don't keep more than a screenful here. Link to a full page for the history.
- Don't notify people about their own actions.
