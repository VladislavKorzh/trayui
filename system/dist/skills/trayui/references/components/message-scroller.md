# Message Scroller

The message scroller is the window a conversation lives in: it keeps the newest message in view, and steps aside when the reader scrolls back. Also called a chat window that stays at the newest message.

## Markup
```html
<div class="tray-scroller" data-tray="scroller" style="--tray-scroller: 24rem">
  <div class="tray-scroller__viewport" aria-label="Conversation with the farm">
    <div class="tray-thread">…messages and markers…</div>
  </div>
  <button class="tray-btn tray-btn--quiet tray-btn--xs tray-scroller__jump" type="button">
    …arrow-down… Latest <span class="tray-badge tray-badge--count tray-badge--ink" data-count hidden></span>
  </button>
</div>
```
## Behaviour
- It opens at the newest message (`data-start="top"` opens at the first instead).
- While the reader is at the end, new messages keep it at the end. Streaming text added to the last message is followed the same way.
- Once the reader scrolls up, nothing moves under them. New messages are counted on the "Latest" button, which appears at the bottom and scrolls to the end when pressed.

Put the composer under the scroller, not inside it. `tray-composer` is a field-shaped tray holding a `<textarea>` and its send button.

## Accessibility
- The behaviour makes the viewport a `role="log"` region with `tabindex="0"`: `Tab` reaches it, the arrow keys, `Page Up` and `Page Down` scroll it, and screen readers read new messages as they arrive, without moving focus.
- Name the viewport with an `aria-label` ("Conversation with the farm"). Its focus ring is drawn inside its edge.
- The count in the "Latest" button is read as part of its name. Once the newest message is in view the button goes, and focus on it moves to the conversation it scrolled.
- Under `prefers-reduced-motion: reduce` "Latest" jumps to the newest message instead of scrolling there.

## Do and don't
- Do keep the reader's place when older messages are loaded above.
- Do show a Marker with a Spinner at the end while an answer is being written.
- Don't force the view to the end while someone is reading back.
- Don't nest a second scrolling area inside a message.
