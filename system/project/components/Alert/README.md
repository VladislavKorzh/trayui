# Alert

An alert is a message that stays in the page until its cause is gone: a tray row with an icon tile, a title and a sentence.

## Variants
| Class | Use |
| --- | --- |
| `tray-alert` | Neutral information. |
| `tray-alert tray-alert--danger` | Something failed and needs the person: the icon and title turn `danger`. |
| `tray-alert tray-alert--success` | A finished step that is worth confirming in place. |
| `tray-alert tray-alert--accent` | The one thing to act on now. It is a yellow surface, so one per screen. |

## Markup
```html
<div class="tray-alert tray-alert--danger" role="alert">
  <span class="tray-alert__icon">…icon…</span>
  <div class="tray-alert__body">
    <p class="tray-alert__title">The card was declined</p>
    <p class="tray-alert__text">Try another card, or pay on delivery.</p>
    <div class="tray-alert__actions">…buttons…</div>
  </div>
</div>
```
Use `role="alert"` for an error that appears after an action and `role="status"` for the rest.

## Alert, Toast or Field error
An alert belongs to a page or a card and stays. A Toast confirms something that already happened and leaves by itself. An error about one field goes under that field.

## Accessibility
`role="alert"` makes a screen reader read the alert at once when it appears, and `role="status"` makes it wait until the reader is free. The icon is decoration, so keep its `<svg>` `aria-hidden`: the title says what happened, and the `danger` and `success` colours only repeat it. The alert never takes focus, and the buttons in `tray-alert__actions` wait in the normal tab order.

## Do and don't
- Do say what happened and what to do next, in that order.
- Do keep the title to one line.
- Don't stack more than two alerts; merge them.
- Don't close an error alert on a timer.
