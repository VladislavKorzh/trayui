# Hover Card

A hover card previews what is behind a link when the pointer rests on it: a person, an order, a note.

## Markup
```html
<span class="tray-anchor" data-tray="hovercard">
  <a href="/people/oksana">Oksana Franko</a>
  <div class="tray-pop tray-pop--card">…avatar, name, a line or two…</div>
</span>
```
It opens a quarter of a second after the pointer arrives or the link takes focus, and closes shortly after both have left; Escape closes it at once. The card is the same `raised` panel as a Popover.

## Rules
- Everything in the card is also on the page behind the link. The card is a shortcut for people with a pointer; touch and screen-reader users follow the link.
- Keep it to a glance: who or what, one or two facts, no more than one action.
- The trigger is always a real link or button.

## Do and don't
- Do use it where the same kind of link repeats: names in a table, mentions in a thread.
- Don't put anything in a hover card that people must be able to reach; it does not open on touch.
- Don't use it to explain an icon; that is a Tooltip.
