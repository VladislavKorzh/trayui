---
category: Feedback
keywords: [alert, callout, notice, message, banner, inline message, warning, error, success]
---
# Alert

An alert is a message that stays in the page until its cause is gone: a tray row with an icon tile, a title and a sentence.

## Use
```tsx
<Alert title="The farm shop is closed on Mondays">Pickup orders placed today are ready from Tuesday at ten.</Alert>

<Alert tone="danger" title="The card was declined"
       actions={<><Button variant="dark" size="xs">Try another card</Button><Button variant="ghost" size="xs">Pay on delivery</Button></>}>
  Nothing was charged. Try another card, or pay on delivery.
</Alert>

<Alert tone="success" title="Order PL-20418 is paid">The receipt is on its way to dana@example.com.</Alert>

<Alert tone="accent" icon="clock" title="132 jars of the autumn batch are left"
       end={<Button variant="dark" size="sm">Order a jar</Button>}>The next batch is packed in March.</Alert>
```

## Tones
`neutral` (the default) is information. `danger` says something failed and needs the person: the icon and title turn red. `success` confirms a finished step in place. `accent` is the yellow surface for the one thing to act on now, so one per screen; its button is `dark`.

Each tone has its own icon (info, circle-alert, circle-check); pass `icon` for a better one. Small buttons go under the text with `actions`; one button beside the text goes in `end`.

A danger alert takes `role="alert"`, which interrupts a screen reader; the others take `role="status"`. Pass `role` to change it. `titleId` gives the title an id, for a field the alert is about to point at with `aria-describedby`.

## Alert, Toast or Field error
An alert belongs to a page or a card and stays. A Toast confirms something that already happened and leaves by itself. An error about one field goes under that field.

## Do and don't
- Do say what happened and what to do next, in that order.
- Do keep the title to one line.
- Don't stack more than two alerts; merge them.
- Don't close an error alert on a timer.
