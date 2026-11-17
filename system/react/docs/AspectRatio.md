---
category: Layout
keywords: [aspect ratio, ratio, media, image box, video, thumbnail, crop, 16:9, square]
---
# Aspect Ratio

Aspect ratio keeps a box in a fixed proportion while its width changes, so media never shifts the layout as it loads.

## Use
```tsx
<AspectRatio><img src="/farm/beds.jpg" alt="Snail beds under boards at dawn" /></AspectRatio> {/* 16 to 9 */}
<AspectRatio ratio="photo"><img src="/jars/50g.jpg" alt="A 50 g jar of white caviar" /></AspectRatio>
<AspectRatio ratio="square"><video src="/farm/collect.mp4" muted /></AspectRatio>
<AspectRatio ratio={21 / 9} placeholder="No photo yet" />                               {/* any ratio; words while empty */}
```

## Ratios
`wide` is 16 to 9 (the default), for video and banners. `photo` is 4 to 3, for product shots. `square` is 1 to 1, for thumbnails in a grid. `portrait` is 3 to 4. Any other ratio as a number: `ratio={21 / 9}`.

The one child fills the box and is cropped to fit, never stretched. The corners are 28px, a panel's, because media usually sits inside a card; set your own radius when it stands alone.

## You provide
The media, its alt text, and a ratio that suits the content.

## Do and don't
- Do keep one ratio per row of cards.
- Do set `object-position` on the image when the subject is off-centre.
- Don't stretch media; it is always cropped, never distorted.
