# Bubble

A bubble is the surface of a message: a soft block of fill around what was said.

## Variants
| Class | Use |
| --- | --- |
| `tray-bubble` | Someone else: the resting fill of the ground. |
| `tray-bubble tray-bubble--own` | Yours: solid ink. |
| `tray-bubble tray-bubble--plain` | No surface at all: an assistant's long answer, set as prose. |

Corners are 20px, and the corner beside the speaker shrinks to 4px, so a row reads as theirs or yours without a tail. Several messages in a row from one person go in a `tray-bubble-group`, 4px apart; only the last keeps the small corner.

## Inside and under a bubble
- Text, links (underlined, in the bubble's own colour), short lists.
- A long message can be clamped to three lines: wrap its text in `tray-bubble__text` and set `data-clamp` on the bubble; a button with `data-tray="more"` and `aria-controls` opens it.
- `tray-reactions` under the bubble holds `tray-reaction` buttons: an icon, its name in a `tray-vh` span, and a count; your own reaction is solid ink. `data-tray="reaction"` toggles one and adjusts its count.
- Attachments sit beside the bubble in the same content column, not inside it.

## Accessibility
A bubble is a plain block with no role: a screen reader reads its text and nothing about who said it. Its fill and its small corner tell yours from theirs only to the eye, so name the speaker in words in the Message around it. A clamped bubble keeps all its text for a screen reader, and only the eye sees three lines. Its `data-tray="more"` button carries `aria-controls`, and the behaviour sets its `aria-expanded` and swaps "Show more" for "Show less". A reaction is a toggle button with `aria-pressed`, named by its contents: the icon is `aria-hidden`, a `tray-vh` span says what it is and the count follows, so it reads "Thumbs up, 2". Do not give it an `aria-label`, which would hide the count. It is 32px to the eye and 44px to a finger. A link in your own bubble draws its focus ring in the colour of the text, so the ring shows on the ink.

## Do and don't
- Do let bubbles hug their text; never stretch them to the full width.
- Do break a long answer into paragraphs.
- Don't use yellow for a bubble. Yellow is for the one thing to do.
- Don't put buttons inside a bubble; put them under it.
