# Marker

A marker is a line in a conversation that is not a message: a date, a status, something the system did.

## Variants
| Class | Use |
| --- | --- |
| `tray-marker` | An event, with an icon: "The courier picked up the order", "Explored 4 files". |
| `tray-marker` with `aria-busy="true"` | Something in progress: a Spinner as the icon and gently pulsing text ("Checking the address"). Give it `role="status"`. |
| `tray-marker tray-marker--separator` | A label between two hairlines: a date, "New messages", "Conversation shortened". |
| `tray-marker tray-marker--row` | A filled row for an event that deserves weight, with a time or a button at its end (`tray-marker__end`). |

## Markup
```html
<div class="tray-marker">
  <span class="tray-marker__icon">…icon…</span>
  <span class="tray-marker__text">The courier picked up order PL-20418</span>
</div>
```
Markers are `label` type in `ink-soft`: quieter than a message, never in a bubble. They sit in the `tray-thread` between messages.

## Do and don't
- Do write a marker as a plain past-tense sentence, without a full stop.
- Do replace a running marker with its result when the work ends, rather than adding a second line.
- Don't use a marker for anything a person wrote.
- The pulse stops under reduced motion; the Spinner still turns slowly.
