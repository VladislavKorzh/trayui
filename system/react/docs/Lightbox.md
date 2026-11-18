---
category: Display
keywords: [lightbox, gallery, photos, pictures, images, viewer, zoom, slideshow]
---
# Lightbox

A lightbox shows the pictures of a gallery one at a time, as large as the window allows, over the whole page.

## Use
```tsx
<Lightbox
  label="The farm in pictures"
  lead
  thumbWidth="15rem"
  pictures={[
    { src: '/media/beds.webp', thumb: '/media/beds-thumb.webp', alt: 'Rows of leafy green snail beds on a hillside, each fenced with black net', caption: 'Open-air snail beds on a hillside.', width: 640, height: 415 },
    { src: '/media/jar.webp', thumb: '/media/jar-thumb.webp', alt: 'A small jar of black caviar on crushed ice, crackers beside it', width: 640, height: 480 },
  ]}
/>
```

## Details
- The gallery is a grid of thumbnails, each a link to the full picture, so it works without script. `lead` makes the first one twice the size; `thumbWidth` is the least width of a thumbnail (11rem by default) and the row takes as many as fit.
- A press on a thumbnail opens the lightbox on that picture, over the whole window on the ink ground. Swipe, the trackpad, the arrow keys, Home and End move through the pictures; the buttons step one picture and turn off at the ends; the count follows; a status line says which picture you are on. The strip of pictures inside is a list named "Pictures" (`trackLabel`).
- Escape and Close shut it, and the focus goes back to the thumbnail. A press with Ctrl, Cmd or Shift opens the picture in a new tab.
- `alt` is the picture's text both as a thumbnail and in the lightbox. `caption` shows under the picture in the lightbox.
- Name the buttons in the page's language with `closeLabel`, `previousLabel` and `nextLabel`, and the word in "2 of 6" with `of`.

## Do and don't
- Do give each thumbnail its `width` and `height`, and a smaller file of its own.
- Do write a real `alt` for every picture.
- Don't put anything but pictures in a lightbox: a form or a film belongs in a dialog or on the page.
- Don't move through the pictures on a timer. Nothing in the system moves on its own.
