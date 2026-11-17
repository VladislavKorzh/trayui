---
category: Conversation
keywords: [message, chat, conversation, thread, reply, assistant, ai, reactions, chat row]
---
# Message

A message is one row of a conversation: who spoke, what they said, and what happened to it.

## Use
```tsx
<div className="tray-thread">                                      {/* spaces the rows */}
  <Message author="Oksana" time="14:02" avatar="OF">The courier has the box.</Message>
  <Message variant="own" footer={<><Icon name="check" size="sm" />Delivered</>}>Thank you.</Message>
  <Message variant="assistant" author="Assistant" time="14:03"
           actions={[{ icon: 'copy', label: 'Copy the answer' }, { icon: 'rotate-cw', label: 'Try again' }]}>
    <p>Yes. Chilled boxes keep for six hours.</p>                {/* prose, no fill */}
    <p>I have added a note for the courier.</p>
  </Message>
</div>
```

## Variants
- `other` (default): someone else, at the start edge, in the resting fill.
- `own`: you, at the end edge, in ink. Leave out the avatar and the name.
- `assistant`: plain bubbles set as prose, the yellow sparkle avatar, aligned to the top of the answer.

## Content
Text and plain elements (`<p>`, `<a>`, `<b>`) given as children are put in one Bubble that follows the variant. Several `<Bubble>` children in a row are grouped 4px apart, and only the last keeps the small corner beside the speaker. Attachments (in a `tray-attachments` row), a CodeBlock or a Trace sit in the same column, outside the bubble.

```tsx
<Message author="Dana Kovalenko" time="09:12" avatar="DK">
  <Bubble>Is the autumn batch still open?</Bubble>
  <Bubble>I would like two jars of 50 g.</Bubble>
</Message>
```

## Parts
- Head: `author` in bold and `time`. Skip both on the second message in a row from the same person.
- `avatar`: initials as a string, or your own `<Avatar size="sm" />`. Leave it out for your own messages and in one-to-one chats.
- `reactions`: icon and count chips under the bubbles. They toggle and count by themselves; `onReact` reports the new state.
- `footer`: the delivery state or an edit note, in caption type.
- `actions`: ghost icon buttons under an answer, such as copy, rate, retry.

Put Markers between messages for dates and events, and a long conversation in a MessageScroller.

## Do and don't
- Do write times as the person's clock shows them, and dates as a Marker between days.
- Do keep the line length of long answers to the reading measure.
- Don't colour-code people. Yours is ink, everyone else is the resting fill.
- Don't put a message's actions in a menu when there are three or fewer.
