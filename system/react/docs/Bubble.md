---
category: Conversation
keywords: [bubble, chat bubble, message bubble, speech bubble, show more, clamp]
---
# Bubble

A bubble is the surface of a message: a soft block of fill around what was said.

## Use
```tsx
<Message>
  <Bubble>Is the autumn batch still open?</Bubble>        {/* two in a row are grouped */}
  <Bubble>I would like two jars before the season ends.</Bubble>
</Message>

<Message variant="own">
  <Bubble>Yes, 132 jars are left. You can <a href="/order">order here</a>.</Bubble>
</Message>

<Message>
  <Bubble clamp>A long message about the entrance, the bell and the neighbour…</Bubble>  {/* three lines and "Show more" */}
</Message>
```

## Variants
- `fill`: someone else, in the resting fill of the ground.
- `own`: you, in solid ink.
- `plain`: no surface at all, for an assistant's long answer set as prose. Put each paragraph in a `<p>`.

Inside a Message the variant follows the Message by itself, so leave it out there. Corners are 20px, and the corner beside the speaker shrinks to 4px, so a row reads as theirs or yours without a tail.

## Show more
`clamp` cuts a long message to three lines and puts a "Show more" link under the bubble, which opens it and then reads "Show less". A clamped bubble stands on its own and is not grouped with the bubbles beside it.

## Inside and under a bubble
- Text, links (underlined, in the bubble's own colour), short lists.
- Reactions go under the bubble: use the Message's `reactions`.
- Attachments sit beside the bubble in the same column, not inside it.

## Do and don't
- Do let bubbles hug their text; never stretch them to the full width.
- Do break a long answer into paragraphs.
- Don't use yellow for a bubble. Yellow is for the one thing to do.
- Don't put buttons inside a bubble; put them under it, as the Message's `actions`.
