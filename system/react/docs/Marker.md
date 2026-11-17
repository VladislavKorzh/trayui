---
category: Conversation
keywords: [marker, date separator, divider, system message, event, status line, new messages, typing]
---
# Marker

A marker is a line in a conversation that is not a message: a date, a status, something the system did.

## Use
```tsx
<Marker variant="separator">Today</Marker>
<Marker icon="truck">The courier picked up order PL-20418</Marker>
<Marker busy>Checking the address</Marker>                      {/* a Spinner and gently pulsing text */}
<Marker variant="row" icon="circle-check" end="14:10">Order PL-20418 was paid</Marker>
```

## Variants
- `event` (default): a quiet line with an icon, for something that happened.
- `busy`: something in progress, with a Spinner in place of the icon. It is announced as a status. The pulse stops under reduced motion.
- `separator`: a label between two hairlines: a date, "New messages", "Conversation shortened".
- `row`: a filled row for an event that deserves weight, with a time or a small button at its `end`.

Markers are quieter than a message and never sit in a bubble. They go in the `tray-thread` between Messages.

## Do and don't
- Do write a marker as a plain past-tense sentence, without a full stop.
- Do replace a running marker with its result when the work ends, rather than adding a second line.
- Don't use a marker for anything a person wrote.
