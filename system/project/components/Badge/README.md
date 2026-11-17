# Badge

A badge states one fact about the thing beside it in a word or two. It is not a control.

## Two sizes
- `tray-badge` (32px, semibold): a status. Yellow means on, in season, act now; `track` grey means off.
- `tray-chip` (40px, medium): a plain fact set in a row with others: "30 g", "Chilled", "Pickup".

## Variants
| Class | Meaning |
| --- | --- |
| `tray-badge` | Neutral: the resting fill of the ground it sits on. |
| `tray-badge--accent` | On, new, in season. One per group. |
| `tray-badge--ink` | A count or a selected state. |
| `tray-badge--off` | Off, closed, out of season. |
| `tray-badge--danger`, `tray-badge--success` | A problem or a finished step: coloured text with an icon, never colour alone. |
| `tray-badge--count` | A 24px number on a tab or a menu item. |

A chip may carry a remove button (`tray-chip__x`, with an `aria-label`) when it shows an applied filter.

## Do and don't
- Do write the state as a word: "Paid", "Out of season".
- Do pair danger and success with an icon; the colour is not the message.
- Don't use a badge as a button. If it can be pressed it is a Toggle or a Button.
- Don't invent more colours; data colours stay inside charts.
