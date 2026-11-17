# Message Scroller

The message scroller is the window a conversation lives in: it keeps the newest message in view, and steps aside when the reader scrolls back.

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
- The viewport is a focusable log region, so the keyboard can scroll it and screen readers announce new messages.

Put the composer under the scroller, not inside it. `tray-composer` is a field-shaped tray holding a `<textarea>` and its send button.

## Do and don't
- Do keep the reader's place when older messages are loaded above.
- Do show a Marker with a Spinner at the end while an answer is being written.
- Don't force the view to the end while someone is reading back.
- Don't nest a second scrolling area inside a message.
