# Card

A card is a tray: a grey surface with 40px corners that groups what belongs together. Fill alone sets it apart.

## Grounds
| Class | Ground | Use |
| --- | --- | --- |
| `tray-card` | `surface` | Every resting card. |
| `tray-card tray-card--accent` | `accent` | The one emphasis card in a group. Keeps the light palette in the dark theme. |
| `tray-card tray-card--inverse` | `inverse` | One ink card may anchor a group. |
| `tray-card tray-card--leaf` | `leaf` | The single card about where a product comes from. |
| `tray-panel` | `page` | A white panel inside a card, 28px corners. |

A card tells its children what they sit on: inputs and quiet buttons inside a tray turn white, inside a white panel they turn grey again. You never set those fills by hand.

## Parts
`tray-card__head` holds a title (`title` or `subtitle`), an optional sentence and an optional action at the end. `tray-card__foot` holds buttons. `tray-card--flush` removes the padding for media that should reach the edges. `<a class="tray-card">` makes the whole card one link; it darkens slightly on hover.

## Layout
Put cards in `tray-bento` on the 16px `grid-gap` and give them unequal widths with `tray-span-4` to `tray-span-8`, usually two to one, so a row reads as a bento and not a grid of equals. Below 56rem every card takes the full width.

## Accessibility
A card is a container with no role: a screen reader hears its heading and its content, never its fill, so let the heading say what the card is about. `<a class="tray-card">` is one link whose name is all the text inside it, so keep that text short, put the heading first, and put no button or other link inside. The 3px focus ring goes round the whole card; on the yellow and the ink card it takes the theme's ink, so it shows on the page around them. The ground a card stands on is never the only sign of what it means.

## Do and don't
- Do keep cards flat: no border, no shadow.
- Do allow at most one yellow and one ink card in view (the One Yellow Rule).
- Do step radii down with nesting: 40 for the card, 28 for a panel, 20, 16 and 14 for the controls inside.
- Don't nest a card in a card; use `tray-panel`.
- Don't make every card the same size.
