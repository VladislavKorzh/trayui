# Aspect Ratio

Aspect ratio keeps a box in a fixed proportion while its width changes, so media never shifts the layout as it loads.

## Markup
`<div class="tray-ratio">` with one child (an `<img>`, a `<video>`, a drawing) that fills it and is cropped to fit. The default is 16 to 9. Presets: `tray-ratio--square`, `tray-ratio--photo` (4 to 3), `tray-ratio--portrait` (3 to 4); any other ratio with `style="--tray-ratio: 21 / 9"`. Corners are 28px, a panel's, because media usually sits inside a card; override the radius when it stands alone.

## You provide
The media, its alt text, and a ratio that suits the content: 16 to 9 for video, 4 to 3 for product shots, square for avatars and thumbnails in a grid.

## Do and don't
- Do keep one ratio per row of cards.
- Do set `object-position` when the subject is off-centre.
- Don't stretch media; it is always cropped, never distorted.
