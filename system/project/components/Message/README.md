# Message

A message is one row of a conversation: who spoke, what they said, and what happened to it.

## Markup
```html
<div class="tray-thread">
  <div class="tray-message">
    <span class="tray-avatar tray-avatar--sm" aria-hidden="true">OF</span>
    <div class="tray-message__content">
      <div class="tray-message__head"><b>Oksana</b> 14:02</div>
      <div class="tray-bubble">The courier has the box.</div>
    </div>
  </div>
  <div class="tray-message tray-message--end">
    <div class="tray-message__content">
      <div class="tray-bubble tray-bubble--own"><span class="tray-vh">You: </span>Thank you.</div>
      <div class="tray-message__foot">Delivered</div>
    </div>
  </div>
</div>
```
| Part | Use |
| --- | --- |
| `tray-message` | A row. Others start at the start edge; `tray-message--end` puts your own at the end edge. |
| Avatar | Optional. Leave it out for your own messages and in one-to-one chats. |
| `tray-message__head` | The name in bold and the time. Skip it on the second message in a row from the same person. |
| `tray-message__content` | Holds one Bubble or a `tray-bubble-group`, attachments, reactions. At most 34rem wide. |
| `tray-message__foot` | Delivery state or an edit note, in `caption`. |
| `tray-message__actions` | A row of ghost icon buttons under an answer: copy, rate, retry. |

`tray-message--top` aligns the avatar with the top of a long message. An assistant's answer uses a plain bubble (`tray-bubble--plain`) and the accent avatar: prose on the page, not a block of fill.

`tray-thread` spaces the rows. Put Markers between them for dates and events.

## Accessibility
Messages are plain text, read in order: the name and time in `tray-message__head`, the bubble, then the foot. Your own messages have no name on screen and are told apart only by their place and fill, so give them one a screen reader can read, such as `<span class="tray-vh">You:</span>` at the start of the bubble. An avatar of initials is read as letters: mark it `aria-hidden="true"` when the name is beside it, and give an icon avatar, like the assistant's, `role="img"` and an `aria-label`. Each icon button in `tray-message__actions` needs an `aria-label` that says what it does ("Copy the answer"). The delivery state is a word beside its icon, never the icon alone.

## Do and don't
- Do write times as the person's clock shows them, and dates as a Marker between days.
- Do keep the line length of long answers to the reading measure.
- Don't colour-code people. Yours is ink, everyone else is the resting fill.
- Don't put a message's actions in a menu when there are three or fewer.
