---
category: Conversation
keywords: [message scroller, chat window, conversation, message list, composer, chat input, latest, scroll to bottom]
---
# Message Scroller

The message scroller is the window a conversation lives in: it keeps the newest message in view, and steps aside when the reader scrolls back.

## Use
```tsx
const [sent, setSent] = React.useState<string[]>([]);

<div className="tray-stack">                                   {/* the composer sits under the scroller, 16px apart */}
  <MessageScroller label="Conversation with the farm" height="22rem" onSend={(text) => setSent([...sent, text])}>
    <Marker variant="separator">Today</Marker>
    <Message author="Oksana" time="14:02" avatar="OF">The courier has the box.</Message>
    {sent.map((text, i) => <Message key={i} variant="own">{text}</Message>)}
  </MessageScroller>
</div>
```

## Behaviour
- It opens at the newest message. `start="top"` opens at the first instead.
- While the reader is at the end, new messages keep it at the end. Text that grows inside the last message, such as a streamed answer, is followed the same way.
- Once the reader scrolls up, nothing moves under them. New messages are counted on the "Latest" button, which appears at the bottom and scrolls to the end when pressed.
- The message list is a focusable log region named by `label`, so the keyboard can scroll it and screen readers announce new messages.

## Composer
`onSend` (or `composer`) draws the composer under the scroller: a field-shaped tray with a text field and the yellow send button. Enter sends, Shift+Enter starts a new line, and the field clears after sending. The component returns the scroller and the composer side by side, so put it in a column such as `tray-stack`. `sendDisabled` holds the button while an answer is being written.

## You provide
The messages and markers as children; they are stacked in a `tray-thread` for you. While an answer is being written, end the thread with `<Marker busy>Writing the answer</Marker>`.

## Do and don't
- Do keep the reader's place when older messages are loaded above.
- Do show a busy Marker at the end while an answer is being written.
- Don't force the view to the end while someone is reading back.
- Don't nest a second scrolling area inside a message.
