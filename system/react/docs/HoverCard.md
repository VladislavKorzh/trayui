---
category: Overlays
keywords: [hover card, preview card, profile card, link preview, peek]
---
# Hover Card

A hover card previews what is behind a link when the pointer rests on it: a person, an order, a note.

## Use
```tsx
<p>
  Packed by{' '}
  <HoverCard trigger={<a href="/people/oksana">Oksana Franko</a>}>      {/* a real link */}
    <span className="tray-stack">                                         {/* spans: the card can sit in a sentence */}
      <span className="tray-row tray-row--sm">
        <Avatar initials="OF" size="lg" />
        <span><span className="control" style={{ display: 'block' }}>Oksana Franko</span><span className="caption tray-muted">Farm manager</span></span>
      </span>
      <span className="tray-pop__text">Signs off every batch before it is packed.</span>
    </span>
  </HoverCard>{' '}
  on 14 November.
</p>
```

## Behaviour
The system's `hovercard` behaviour runs it. It opens a quarter of a second after the pointer arrives or the link takes focus, and closes shortly after both have left; Escape closes it at once. `defaultOpen` shows it open at first, for a picture in a preview; it closes once the pointer passes.

## Look
The same `raised` card panel as a Popover, 22rem wide with 28px corners. `align="end"` lines it up with the link's end edge, `side="top"` opens it upward. The card is a `<span>`, so it can sit inside a paragraph: build its content from spans there (`tray-stack`, `tray-row`, `tray-pop__title`, `tray-pop__text`).

## Rules
- Everything in the card is also on the page behind the link. The card is a shortcut for people with a pointer; touch and screen-reader users follow the link.
- Keep it to a glance: who or what, one or two facts, no more than one action.
- The trigger is always a real link or button.

## Do and don't
- Do use it where the same kind of link repeats: names in a table, mentions in a thread.
- Don't put anything in a hover card that people must be able to reach; it does not open on touch.
- Don't use it to explain an icon; that is a Tooltip.
